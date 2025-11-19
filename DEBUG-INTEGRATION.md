# Guía de Debugging - Integración Frontend-Backend

## Configuración Actual

- **Frontend**: Vite dev server en `http://localhost:5173`
- **Backend**: API Gateway en `http://localhost:3000`
- **Proxy**: Vite proxy configurado para `/admin/*` → `http://localhost:3000/admin/*`

## Pasos para Debuggear

### 1. Verificar que el Backend esté corriendo

```powershell
# El backend debe estar corriendo en puerto 3000
bun --cwd apps/api-gateway dev
```

Verifica que veas el mensaje: `🦊 Inhost API Gateway is running`

### 2. Correr el Frontend

```powershell
# En el directorio inhost-frontend
bun dev
```

El frontend debe iniciar en `http://localhost:5173`

### 3. Abrir la Consola del Navegador

- Abre Chrome/Edge DevTools (F12)
- Ve a la pestaña "Console"
- Limpia la consola (click en 🚫)

### 4. Intentar Signup/Login

#### Para Signup:
1. Ve a `http://localhost:5173/signup`
2. Llena el formulario
3. Click en "Create account"
4. **Observa la consola** - Verás:
   ```
   API Request: {
     url: "/admin/auth/signup",
     method: "POST",
     body: { email: "...", password: "...", ... }
   }
   ```

#### Para Login:
1. Ve a `http://localhost:5173/login`
2. Llena email y password
3. Click en "Sign in"
4. **Observa la consola** - Verás:
   ```
   API Request: {
     url: "/admin/auth/login",
     method: "POST",
     body: { email: "...", password: "..." }
   }
   ```

### 5. Revisar Errores

Si hay un error, la consola mostrará:
```
API Error Response: { ... detalles del error ... }
```
o
```
API Error Text: "mensaje de error del backend"
```

## Formato de Datos Esperado

### Signup Request (Frontend → Backend)
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "tenantName": "Acme Inc",
  "plan": "starter"
}
```

### Login Request (Frontend → Backend)
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response Esperada (Backend → Frontend)
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "owner",
      "tenant": {
        "id": "456",
        "name": "Acme Inc",
        "slug": "acme-inc",
        "plan": "starter"
      }
    }
  }
}
```

## Problemas Comunes

### Error: "Expected string"
**Causa**: El backend está esperando un campo como string pero recibe otro tipo.

**Solución**: Revisa en la consola del backend qué campo está causando el problema y ajusta el formato.

### Error: "Not Found" o 404
**Causa**: El endpoint no existe en el backend.

**Solución**: Verifica que el backend tenga implementados los endpoints:
- `POST /admin/auth/signup`
- `POST /admin/auth/login`

### Error: "CORS"
**Causa**: El backend no tiene CORS configurado correctamente.

**Solución**: El backend debe permitir requests desde `http://localhost:5173`

### Error: "Network Error"
**Causa**: El backend no está corriendo o el proxy no está funcionando.

**Solución**:
1. Verifica que el backend esté en puerto 3000
2. Reinicia el frontend dev server

## Verificar Endpoints del Backend

Puedes probar los endpoints directamente con curl:

```powershell
# Test signup
curl -X POST http://localhost:3000/admin/auth/signup `
  -H "Content-Type: application/json" `
  -d '{"email":"test@test.com","password":"test123","name":"Test User","tenantName":"Test Inc","plan":"starter"}'

# Test login
curl -X POST http://localhost:3000/admin/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@test.com","password":"test123"}'
```

## Contacto

Si el problema persiste, comparte:
1. Los logs de la consola del navegador (screenshot)
2. Los logs del backend
3. El error específico que aparece
