# 🔴 CRITICAL: Backend Middleware Fix Required

**Fecha:** 2025-11-19
**Prioridad:** CRÍTICA - Bloqueador
**Estado:** 🔴 BLOQUEANDO PRODUCCIÓN

---

## 🎯 RESUMEN EJECUTIVO

El endpoint `GET /admin/sync/initial` **existe** pero **falla** porque el middleware JWT no se está ejecutando correctamente, causando que `user` sea `undefined`.

**Impacto:**
- ✅ Login funciona correctamente
- ❌ Sincronización de datos falla
- ❌ UI muestra pantalla vacía después del login
- ❌ Usuario no puede ver conversaciones ni contactos

---

## 🔍 EVIDENCIA CONFIRMADA

### Error en Backend (Terminal):

```
TypeError: undefined is not an object (evaluating 'user.tenantId')
at sync.ts:27:43

// Código problemático:
const conversationsList = await db.query.conversations.findMany({
  where: eq(conversations.tenantId, user.tenantId),
                                    ^^^^ undefined!
});
```

### Error en Frontend (Consola Web):

```
❌ Backend returned success: false {
  "success": false,
  "error": {
    "code": "SYNC_FAILED",
    "message": "Failed to fetch initial data",
    "timestamp": "2025-11-19T22:54:12.198Z"
  }
}
```

### Petición Frontend (CORRECTA):

```http
GET /admin/sync/initial HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

✅ **Frontend está enviando el token correctamente**
❌ **Backend NO está validando el token**

---

## 🔧 ROOT CAUSE

Según backend team comunicó:

### Problema 1: Middleware usa `.derive()` incorrectamente

**Archivo:** `apps/api-gateway/src/middleware/jwt-auth.ts:53` (aproximado)

```typescript
// ❌ INCORRECTO - .derive() NO funciona con .use()
export const jwtAuth = () => new Elysia()
  .derive(async ({ headers }) => {
    const token = headers.authorization?.split(' ')[1];
    const user = await verifyJWT(token);
    return { user };
  });
```

**Por qué falla:**
Según `CLAUDE.md` sección "Elysia Middleware Lifecycle Hooks (CRITICAL)":
> ❌ DON'T USE: .derive() or .onBeforeHandle()
> - These hooks DO NOT execute when middleware is applied via .use()
>
> ✅ USE: .onRequest()

### Problema 2: Middleware comentado en rutas

**Archivo:** `apps/api-gateway/src/routes/admin/index.ts:33` (aproximado)

```typescript
const adminRoutes = new Elysia()
  // .use(jwtAuth())  // ← COMENTADO! Por eso no se ejecuta
  .group('/admin', app => {
    // ...
  });
```

---

## ✅ SOLUCIÓN COMPLETA

### 1. Reescribir middleware JWT usando `.onRequest()`

**Archivo a modificar:** `apps/api-gateway/src/middleware/jwt-auth.ts`

```typescript
// ✅ CORRECTO - Usar .onRequest()
import { Elysia } from 'elysia';
import { verifyJWT } from '../utils/jwt';

export const jwtAuth = () => new Elysia()
  .onRequest(async ({ headers, set, store }) => {
    // 1. Extraer token del header
    const authHeader = headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      set.status = 401;
      throw new Error('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    // 2. Verificar token
    try {
      const payload = await verifyJWT(token);

      if (!payload || !payload.userId || !payload.tenantId) {
        set.status = 401;
        throw new Error('Invalid token payload');
      }

      // 3. Guardar user en store (disponible en todos los handlers)
      (store as any).user = {
        id: payload.userId,
        email: payload.email,
        tenantId: payload.tenantId,
        role: payload.role
      };

    } catch (error) {
      set.status = 401;
      throw new Error('Token verification failed');
    }
  })
  .macro(({ onBeforeHandle }) => ({
    // Hacer user disponible en context de cada handler
    user(enabled: boolean) {
      if (!enabled) return;

      onBeforeHandle(({ store }) => {
        const user = (store as any).user;
        if (!user) {
          throw new Error('User not authenticated');
        }
        return { user };
      });
    }
  }));
```

### 2. Descomentar middleware en rutas admin

**Archivo a modificar:** `apps/api-gateway/src/routes/admin/index.ts`

```typescript
// ✅ CORRECTO - Descomentar y usar el middleware
const adminRoutes = new Elysia()
  .use(jwtAuth())  // ← DESCOMENTAR ESTA LÍNEA
  .group('/admin', app => {
    app.use(syncRoutes);
    app.use(conversationsRoutes);
    // ... otras rutas
  });
```

### 3. Actualizar handlers para recibir user

**Archivo a modificar:** `apps/api-gateway/src/routes/admin/sync.ts`

```typescript
// El handler debe recibir user del middleware
export const syncRoutes = new Elysia()
  .get('/sync/initial', async ({ store, set }) => {
    try {
      // User debe estar disponible desde el middleware
      const user = (store as any).user;

      // Agregar validación defensiva
      if (!user || !user.tenantId) {
        console.error('❌ User not found in store. Middleware not working!');
        set.status = 401;
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        };
      }

      console.log('✅ User from middleware:', {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId
      });

      // Ahora user.tenantId está definido
      const conversationsList = await db.query.conversations.findMany({
        where: eq(conversations.tenantId, user.tenantId),
        limit: 50,
        orderBy: desc(conversations.updatedAt)
      });

      // ... resto del código
    } catch (error) {
      console.error('Initial sync error:', error);
      set.status = 500;
      return {
        success: false,
        error: {
          code: 'SYNC_FAILED',
          message: 'Failed to fetch initial data',
          timestamp: new Date().toISOString()
        }
      };
    }
  });
```

---

## 🧪 CÓMO VERIFICAR LA SOLUCIÓN

### Test 1: Verificar que middleware se ejecuta

**En backend, agregar log en el middleware:**

```typescript
.onRequest(async ({ headers, set, store }) => {
  console.log('🔐 JWT Middleware executing...'); // ← Debe aparecer
  // ...
})
```

**Resultado esperado:**
```
🔐 JWT Middleware executing...
✅ User from middleware: { id: 'xxx', email: 'test@example.com', tenantId: 'yyy' }
```

### Test 2: Verificar que endpoint devuelve datos

**En frontend, después del fix, debería ver:**

```
✅ Backend sync after login successful
📦 Received from backend:
  - 5 conversations
  - 3 contacts
  - 2 team members
  - 1 integrations
```

### Test 3: Verificar UI

**Usuario debería ver:**
- ✅ Pantalla de workspace con conversaciones
- ✅ Lista de contactos en sidebar
- ✅ NO más pantalla vacía

---

## 📊 CHECKLIST DE IMPLEMENTACIÓN

### Backend Team:

- [ ] 1. Reescribir `jwt-auth.ts` usando `.onRequest()` en vez de `.derive()`
- [ ] 2. Descomentar `.use(jwtAuth())` en `admin/index.ts`
- [ ] 3. Actualizar handlers para usar `store.user` en vez de `context.user`
- [ ] 4. Agregar logs para verificar que middleware se ejecuta
- [ ] 5. Agregar validación defensiva en endpoints críticos
- [ ] 6. Probar localmente que `GET /admin/sync/initial` devuelve datos
- [ ] 7. Verificar que otros endpoints admin también funcionan
- [ ] 8. Hacer commit y push al branch

### Frontend Team:

- [x] 1. Mejorar manejo de error en `sync.ts` (COMPLETADO)
- [x] 2. Mostrar mensaje claro al usuario cuando falla sync (COMPLETADO)
- [x] 3. Agregar logs de diagnóstico (YA EXISTÍAN)
- [ ] 4. Probar después del fix de backend
- [ ] 5. Verificar que UI muestra datos correctamente

---

## 🎯 PRÓXIMOS PASOS

### Inmediato (Backend):

1. **Arreglar middleware JWT** (30-60 min)
   - Cambiar `.derive()` → `.onRequest()`
   - Descomentar en rutas

2. **Probar localmente** (15 min)
   - Login → Verificar token en logs
   - Sync → Verificar datos en response

3. **Commit y push** (5 min)
   - Mensaje: "fix: Corregir middleware JWT usando .onRequest() según CLAUDE.md"

### Después del Fix (Frontend):

1. **Pull cambios de backend**
2. **Probar integración completa**
3. **Verificar que UI muestra datos**

---

## 📝 INFORMACIÓN ADICIONAL

### Estructura esperada en response de `/admin/sync/initial`:

```typescript
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "endUserId": "uuid",
        "channel": "whatsapp",
        "status": "active",
        "lastMessage": {
          "id": "uuid",
          "text": "Último mensaje",
          "type": "incoming",
          "timestamp": "2025-11-19T10:00:00Z"
        },
        "unreadCount": 2,
        "isPinned": false,
        "assignedTo": {
          "id": "uuid",
          "name": "Agent Name"
        },
        "createdAt": "2025-11-18T00:00:00Z",
        "updatedAt": "2025-11-19T10:00:00Z"
      }
    ],
    "contacts": [...],
    "team": [...],
    "integrations": [...]
  }
}
```

### Interfaces TypeScript (Frontend ya las tiene):

Ref: `src/lib/api/admin-client.ts:90-95`

---

## 🆘 CONTACTO

**Frontend:** Listo y esperando fix de backend
**Backend:** Necesita implementar solución descrita arriba
**Bloqueador:** SÍ - No se puede avanzar sin este fix

---

**Última actualización:** 2025-11-19T23:10:00Z
**Autor:** Frontend Team
**Revisión requerida:** Backend Team
