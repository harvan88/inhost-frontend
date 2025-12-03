# FluxCoreChat Frontend - Arquitectura

**Última actualización:** 2025-12-03  
**Estado:** ✅ ESTABLE

---

## Visión General

Frontend React para FluxCoreChat con persistencia local y sincronización en tiempo real.

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend Architecture                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────┐    ┌─────────────────┐                    │
│   │   UI (React)    │◄───│  Zustand Store  │                    │
│   └────────▲────────┘    └────────▲────────┘                    │
│            │                      │                              │
│            │                      │                              │
│   ┌────────┴────────┐    ┌────────┴────────┐                    │
│   │  WebSocket      │    │   IndexedDB     │                    │
│   │  Provider       │───►│   (database.ts) │                    │
│   └────────▲────────┘    └─────────────────┘                    │
│            │                                                     │
│            │ ws://localhost:3000/realtime                       │
│            ▼                                                     │
│   ┌─────────────────┐                                           │
│   │    Backend      │                                           │
│   └─────────────────┘                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Estructura de Directorios

```
src/
├── components/
│   ├── chat/           # Componentes de chat
│   ├── common/         # Avatar, Badge, etc.
│   ├── extensions/     # UI de extensiones
│   ├── feedback/       # Toast, MessageFeedback
│   ├── mobile/         # Responsive components
│   └── workspace/      # Layout principal
│
├── providers/
│   └── WebSocketProvider.tsx  # Conexión tiempo real
│
├── services/
│   ├── database.ts     # IndexedDB wrapper
│   ├── sync.ts         # Sincronización
│   ├── api.ts          # HTTP client
│   └── logger.ts       # Logging
│
├── store/
│   └── index.ts        # Zustand store
│
├── hooks/              # Custom hooks
├── lib/                # Utilidades
├── types/              # TypeScript types
└── App.tsx             # Entry point
```

---

## Flujo de Datos

### Source of Truth

```
IndexedDB → Zustand Store → UI Components
```

### Eventos WebSocket

| Evento | Acción |
|--------|--------|
| `message:new` | Guardar mensaje en IndexedDB + Zustand |
| `message:status` | Actualizar statusChain del mensaje |
| `enrichment:batch` | Guardar enrichments |
| `conversation:updated` | Actualizar conversación |
| `typing:indicator` | Mostrar indicador de escritura |

### Flujo de Mensaje Entrante

```
Backend WebSocket
    │
    ▼
WebSocketProvider.handleMessageReceived()
    │
    ├── 1. Extraer conversationId del mensaje (viene del backend)
    │
    ├── 2. db.addMessage(message)  → IndexedDB
    │
    ├── 3. Crear/actualizar conversation si no existe
    │
    ├── 4. Crear contact si no existe
    │
    └── 5. store.addMessage()  → Zustand → UI
```

---

## Servicios Clave

### database.ts (IndexedDB)

```typescript
// Stores disponibles
- messages       // MessageEnvelope
- conversations  // Conversation
- contacts       // Contact
- enrichments    // Enrichment
- sync_state     // Estado de sincronización

// Métodos principales
db.addMessage(message)
db.getMessagesByConversation(conversationId)
db.saveConversation(conversation)
db.saveEnrichments(enrichments)
db.getStats()
```

### sync.ts (Sincronización)

```typescript
// Flujo de inicialización
syncService.initialSync()
    │
    ├── syncFromBackend()      // Cargar desde API
    │
    └── loadFromIndexedDB()    // Hidratar Zustand
```

### WebSocketProvider.tsx

```typescript
// Eventos manejados
handleMessageReceived()      // message:new, message_received
handleExtensionResponse()    // extension_response
handleEnrichmentBatch()      // enrichment:batch
handleMessageStatus()        // message:status
handleTypingIndicator()      // typing:indicator
handleConversationRead()     // conversation:read
```

---

## Zustand Store

```typescript
interface StoreState {
  entities: {
    conversations: Map<string, Conversation>;
    messages: Map<string, MessageEnvelope[]>;
    contacts: Map<string, Contact>;
    enrichments: Map<string, Enrichment[]>;
  };
  
  ui: {
    activeConversationId: string | null;
    sidebarCollapsed: boolean;
    theme: 'light' | 'dark';
  };
  
  network: {
    connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
    pendingMessages: Set<string>;
    lastSync: Date | null;
  };
  
  actions: {
    addMessage(conversationId, message);
    addConversation(conversation);
    addContact(contact);
    addEnrichments(messageId, enrichments);
    setActiveConversation(id);
    // ...
  };
}
```

---

## Sincronización con Backend

### Principio Clave

```
El conversationId viene del BACKEND (UUID)
El frontend NO regenera IDs
```

### Antes (Incorrecto)
```typescript
// Frontend regeneraba ID diferente
const conversationId = `${channel}-${from}`;  // ❌
```

### Ahora (Correcto)
```typescript
// Frontend usa ID del backend
const conversationId = message.conversationId;  // ✅
```

---

## Comandos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

---

## Variables de Entorno

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/realtime
```

---

## Dependencias Principales

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| react | 18.x | UI Framework |
| zustand | 4.x | State management |
| idb | 8.x | IndexedDB wrapper |
| lucide-react | - | Iconos |
| tailwindcss | 3.x | Estilos |
