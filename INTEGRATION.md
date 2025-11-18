# Guía de Integración - INHOST Frontend ↔ Backend

**Fecha**: 2025-11-18
**Versión**: 1.0
**Estado**: ✅ Backend funcional | ⚠️ Frontend 50% completo

---

## 📊 Resumen Ejecutivo

### Estado Actual

| Componente | Estado | Completitud |
|-----------|--------|-------------|
| **Contrato de Tipos** | ✅ Completo | 100% |
| **API Client** | ✅ Completo | 100% |
| **WebSocket Inbound** | ✅ Completo | 100% |
| **WebSocket Outbound** | ⚠️ Parcial | 40% |
| **Persistencia (IndexedDB)** | ✅ Completo | 100% |
| **UI Bidireccional** | ❌ Incompleto | 20% |
| **Optimistic Updates** | ❌ No implementado | 0% |

**GLOBAL**: ~50% preparado para integración completa

### ¿Qué funciona hoy?

✅ **Recepción de mensajes** (Backend → Frontend)
✅ **Persistencia local** (IndexedDB)
✅ **Envío de mensajes** (Frontend → Backend)
✅ **Auto-creación de conversaciones/contactos**
✅ **Reconexión automática WebSocket**

### ¿Qué falta implementar?

❌ **Typing indicators** (UI + envío)
❌ **Optimistic updates** (UX instantánea)
❌ **Status visualization** (✓ ✓✓ estados)
❌ **Read receipts** (confirmaciones de lectura)

---

## 🏗️ Arquitectura de Integración

```
Frontend (React + TypeScript + Zustand + IndexedDB)
    ↕ WebSocket (ws://localhost:5173/realtime)
    ↕ REST API (http://localhost:3000/api)
Backend (Express.js + PostgreSQL + Redis)
```

---

## 📦 Contrato de Datos: MessageEnvelope

Formato universal para todos los mensajes en el sistema.

**Archivo**: `src/types/index.ts`

### Campos Principales

- **id**: UUID único del mensaje
- **conversationId**: UUID de la conversación
- **type**: 'incoming' | 'outgoing' | 'system' | 'status'
- **channel**: 'whatsapp' | 'telegram' | 'web' | 'sms'
- **content**: Texto, media, ubicación, botones
- **metadata**: from, to, timestamp, IDs de plataforma
- **statusChain**: Array de estados del mensaje
- **context**: Plan, source, extensión info

---

## 🌐 Endpoints REST API

**Base URL**: `/api` (proxied to `http://localhost:3000`)

### 1. POST /simulate/client-message
Simula mensaje entrante de cliente externo.

### 2. POST /simulate/client-toggle
Conecta/desconecta cliente simulado.

### 3. POST /simulate/extension-toggle
Activa/desactiva extensión.

### 4. PATCH /simulate/extension-latency
Ajusta latencia de extensión.

### 5. GET /simulate/status
Obtiene estado completo del sistema.

### 6. GET /health
Verifica estado de servicios.

---

## 🔌 WebSocket Real-time

### Eventos Inbound (Backend → Frontend)

- **connection**: Confirmación de conexión
- **message_received**: Nuevo mensaje de cliente
- **extension_response**: Respuesta de extensión
- **message:status**: Actualización de estado (delivered, read)
- **typing:indicator**: Usuario escribiendo
- **client_toggle**: Cliente conectado/desconectado
- **extension_toggle**: Extensión activada/desactivada
- **error**: Error del servidor

### Eventos Outbound (Frontend → Backend)

- **typing:indicator**: Notificar que usuario está escribiendo

---

## 📊 Estado de Implementación

### ✅ Implementado (90%)

- Tipos TypeScript completos
- API Client funcional
- WebSocket Provider con handlers
- handleMessageReceived
- handleMessageStatus
- handleTypingIndicator
- sendTyping method
- IndexedDB persistence
- Auto-create conversaciones/contactos
- Zustand store + sync service

### ❌ Falta Implementar (10%)

1. **Typing detection en MessageInput** (1h)
2. **Optimistic updates en MessageInput** (2h)
3. **Status visualization en MessageList** (1h)
4. **Typing indicator UI en MessageList** (1h)
5. **Read receipts** (2h)

**Total estimado**: 7 horas para integración bidireccional completa

---

## 🚀 Próximos Pasos

### Fase 1: Typing Indicators (2h)
Detectar onChange + timeout 3s + mostrar UI

### Fase 2: Optimistic Updates (2h)
Agregar mensaje local → enviar → reemplazar con real

### Fase 3: Status Visualization (1h)
Iconos ✓ ✓✓ según statusChain

### Fase 4: Read Receipts (2h)
Enviar confirmación cuando usuario abre conversación

---

## 📝 Archivos Clave

- `src/types/index.ts` - Contrato de tipos
- `src/services/api.ts` - Cliente REST
- `src/providers/WebSocketProvider.tsx` - WebSocket
- `src/services/database.ts` - IndexedDB
- `src/store/index.ts` - Zustand store
- `FLUJO_BIDIRECCIONAL.md` - Análisis detallado

---

**Preparado por**: Claude Code
**Última actualización**: 2025-11-18
