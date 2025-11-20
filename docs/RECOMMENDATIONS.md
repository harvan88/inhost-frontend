# INHOST Frontend - Recomendaciones de Mejora

> **Plan de acción concreto y priorizado para mejorar la calidad del código**
>
> Este documento complementa la auditoría técnica exhaustiva con recomendaciones accionables organizadas por prioridad y categoría.

---

## Tabla de Contenidos

1. [Prioridad P0: Crítico (Acción Inmediata)](#prioridad-p0-crítico)
2. [Prioridad P1: Alto (1-2 Semanas)](#prioridad-p1-alto)
3. [Prioridad P2: Medio (1 Mes)](#prioridad-p2-medio)
4. [Prioridad P3: Bajo (Backlog)](#prioridad-p3-bajo)
5. [Roadmap Sugerido](#roadmap-sugerido)
6. [Métricas de Éxito](#métricas-de-éxito)

---

## Prioridad P0: Crítico

> Problemas que pueden causar fallos en producción o impedir escalabilidad

### 1. Implementar Tests Unitarios e Integración

**Estado Actual**: 0% cobertura de tests
**Impacto**: CRÍTICO - Sin tests, cualquier cambio puede romper la app

**Acción**:
```bash
# 1. Setup de testing
npm install --save-dev vitest @vitest/ui
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event fake-indexeddb
```

**Implementar en este orden**:

1. **Services** (Semana 1):
   - `database.ts`: CRUD de IndexedDB
   - `sync.ts`: Sincronización
   - `api.ts` y `admin-client.ts`: Clients HTTP

2. **Stores** (Semana 2):
   - `store/index.ts`: Actions principales
   - `store/workspace.ts`: Lógica de tabs
   - `store/auth-store.ts`: Autenticación

3. **Integration Tests** (Semana 2):
   - Login flow completo
   - Message sending/receiving flow
   - Workspace tab management

**Objetivo**: >70% cobertura en 2 semanas

**Referencias**:
- `docs/TECHNICAL_AUDIT.md#tests-faltantes-críticos`

---

### 2. Implementar JWT Refresh Tokens

**Estado Actual**: Solo se usa accessToken, sin refresh
**Impacto**: CRÍTICO - Usuarios desloggeados abruptamente

**Acción**:

```typescript
// src/services/auth/token-refresh-service.ts
export class TokenRefreshService {
  private refreshTimer: NodeJS.Timeout | null = null;

  startAutoRefresh(expiresIn: number): void {
    // Refresh 5 minutos antes de que expire
    const refreshIn = (expiresIn - 300) * 1000;

    this.refreshTimer = setTimeout(async () => {
      try {
        const newTokens = await this.refreshAccessToken();
        useAuthStore.getState().setAuth(newTokens.accessToken, newTokens.user);
        this.startAutoRefresh(newTokens.expiresIn);
      } catch (error) {
        // Si falla refresh, logout
        useAuthStore.getState().logout();
      }
    }, refreshIn);
  }

  private async refreshAccessToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem('inhost_admin_refresh_token');
    const response = await fetch('/admin/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    return response.json();
  }
}
```

**Integración en LoginPage**:

```typescript
// pages/auth/LoginPage.tsx
const response = await adminAPI.login({ email, password });

setAuth(response.data.tokens.accessToken, response.data.user);

// Iniciar auto-refresh
const tokenRefreshService = new TokenRefreshService();
tokenRefreshService.startAutoRefresh(response.data.tokens.expiresIn);
```

**Esfuerzo**: 3-4 horas
**Prioridad**: 🔥 P0

---

### 3. Implementar Virtualización de Listas

**Estado Actual**: Renderiza todos los items (potencial 1000+)
**Impacto**: CRÍTICO - Lag severo en la UI

**Acción**:

```typescript
// components/chat/MessageList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export default function MessageList({ messages }: MessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // altura estimada por mensaje
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const message = messages[virtualItem.index];
          return (
            <div
              key={message.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <MessageItem message={message} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Aplicar a**:
- `components/chat/MessageList.tsx`
- `components/workspace/PrimarySidebar.tsx` (lista de conversaciones)

**Esfuerzo**: 3-4 horas por lista
**Prioridad**: 🔥 P0

---

### 4. Centralizar Normalización de conversationId

**Estado Actual**: Duplicación de lógica
**Impacto**: ALTO - Riesgo de inconsistencias

**Acción**:

```typescript
// src/utils/conversationId.ts
export function generateConversationId(channel: string, from: string): string {
  // Validaciones
  if (!channel || !from) {
    throw new Error('channel and from are required');
  }

  // Normalización
  const normalizedChannel = channel.toLowerCase().trim();
  const normalizedFrom = from.trim();

  return `${normalizedChannel}-${normalizedFrom}`;
}

export function parseConversationId(conversationId: string): { channel: string; from: string } {
  const [channel, ...fromParts] = conversationId.split('-');
  return {
    channel,
    from: fromParts.join('-'),
  };
}
```

**Reemplazar en**:
- `src/providers/WebSocketProvider.tsx:106-110`
- `src/services/sync.ts` (lógica implícita)

**Esfuerzo**: 1 hora
**Prioridad**: 🔥 P0

---

### 5. Implementar Type Guards para WebSocket Events

**Estado Actual**: Type assertions peligrosos (`data as ConnectionEvent`)
**Impacto**: ALTO - Crash en runtime si payload incorrecto

**Acción**:

```typescript
// src/utils/type-guards.ts
import type {
  WebSocketEvent,
  ConnectionEvent,
  MessageReceivedEvent,
  // ... otros events
} from '@/types';

export function isConnectionEvent(data: WebSocketEvent): data is ConnectionEvent {
  return (
    data.type === 'connection' &&
    'status' in data &&
    'timestamp' in data &&
    'clientId' in data
  );
}

export function isMessageReceivedEvent(data: WebSocketEvent): data is MessageReceivedEvent {
  return (
    data.type === 'message_received' &&
    'data' in data &&
    typeof data.data === 'object' &&
    'id' in data.data &&
    'conversationId' in data.data &&
    'timestamp' in data
  );
}

// ... más type guards
```

**Uso en WebSocketProvider**:

```typescript
switch (data.type) {
  case 'connection':
    if (isConnectionEvent(data)) {
      handleConnection(data);
    } else {
      logger.error('websocket', 'Invalid connection event', { data });
    }
    break;
  // ...
}
```

**Esfuerzo**: 2-3 horas
**Prioridad**: 🔥 P0

---

## Prioridad P1: Alto

> Problemas que afectan calidad del código y deben resolverse pronto

### 6. Lazy Loading de Mensajes

**Estado Actual**: Carga todos los mensajes de todas las conversaciones al boot
**Impacto**: ALTO - Tiempo de carga inicial muy largo

**Acción**:

```typescript
// src/services/sync.ts

// Cambiar de:
async loadFromIndexedDB(): Promise<void> {
  for (const conversation of conversations) {
    const messages = await db.getMessagesByConversation(conversation.id, 100);
    messagesMap.set(conversation.id, messages);
  }
}

// A:
async loadConversationsOnly(): Promise<void> {
  const conversations = await db.getAllConversations();
  useStore.setState({
    entities: {
      ...useStore.getState().entities,
      conversations: new Map(conversations.map(c => [c.id, c])),
    },
  });
}

// Mensajes bajo demanda
async loadMessagesForConversation(conversationId: string): Promise<void> {
  const cached = useStore.getState().entities.messages.get(conversationId);
  if (cached && cached.length > 0) {
    return; // Ya están en cache
  }

  const messages = await db.getMessagesByConversation(conversationId, 100);
  useStore.getState().actions.setMessages(conversationId, messages);
}
```

**Integración en ChatArea**:

```typescript
// components/chat/ChatArea.tsx
useEffect(() => {
  if (conversationId) {
    syncService.loadMessagesForConversation(conversationId);
  }
}, [conversationId]);
```

**Esfuerzo**: 4-6 horas
**Prioridad**: 🔴 P1

---

### 7. Implementar Error Handling Exhaustivo

**Estado Actual**: Muchos `await` sin try-catch
**Impacto**: ALTO - Errores sin contexto, crashes inesperados

**Acción**:

**Pattern a seguir**:

```typescript
try {
  await db.addMessage(message);
} catch (error) {
  logger.error('websocket', 'Failed to persist message', {
    messageId: message.id,
    conversationId: message.conversationId,
    error: error instanceof Error ? error.message : String(error),
  });

  // Mostrar error al usuario
  addToast({
    type: 'error',
    message: 'Failed to save message',
    description: 'The message will be retried.',
  });

  // Agregar a retry queue
  useStore.getState().network.retryQueue.push(message);
}
```

**Aplicar a**:
- `src/providers/WebSocketProvider.tsx`: Todos los handlers
- `src/services/sync.ts`: Todas las operaciones async
- `src/lib/api/admin-client.ts`: Todos los requests

**Esfuerzo**: 1 día
**Prioridad**: 🔴 P1

---

### 8. Implementar Sync Lock para Evitar Race Conditions

**Estado Actual**: WebSocket y HTTP pueden colisionar
**Impacto**: ALTO - Estado inconsistente, mensajes perdidos

**Acción**:

```typescript
// src/services/sync/sync-lock.ts
export class SyncLock {
  private syncing = false;

  async withLock<T>(fn: () => Promise<T>): Promise<T> {
    while (this.syncing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.syncing = true;
    try {
      return await fn();
    } finally {
      this.syncing = false;
    }
  }
}

const syncLock = new SyncLock();

// Uso en LoginPage
await syncLock.withLock(async () => {
  await syncService.syncFromBackend();
  await syncService.loadFromIndexedDB();
});

// Uso en WebSocketProvider
await syncLock.withLock(async () => {
  await db.addMessage(message);
  useStore.getState().actions.addMessage(conversationId, message);
});
```

**Esfuerzo**: 4-6 horas
**Prioridad**: 🔴 P1

---

### 9. Estandarizar Uso de Logger Service

**Estado Actual**: Mezcla de `console.log` y `logger.*`
**Impacto**: MEDIO - Logs no capturables en producción

**Acción**:

**Reemplazar TODOS** los `console.log`, `console.error`, `console.warn` por:

```typescript
import { logger } from '@/services/logger';

// Reemplazar
console.log('✅ WebSocket connected', event);

// Por
logger.info('websocket', 'WebSocket connected', {
  clientId: event.clientId,
  timestamp: event.timestamp,
});
```

**Configurar niveles por ambiente**:

```typescript
// src/config/logger.config.ts
export const LOGGER_CONFIG = {
  development: {
    level: 'debug',
    enableConsole: true,
    enableIndexedDB: true,
  },
  production: {
    level: 'warn',
    enableConsole: false,
    enableIndexedDB: true,
    remoteLogging: {
      enabled: true,
      endpoint: 'https://logs.inhost.com/api/logs',
    },
  },
};
```

**Esfuerzo**: 1 día (buscar y reemplazar + testing)
**Prioridad**: 🔴 P1

---

### 10. Agregar Timeouts a Fetch Requests

**Estado Actual**: Requests sin timeout (pueden colgar indefinidamente)
**Impacto**: MEDIO - Mala UX en redes lentas

**Acción**:

```typescript
// src/lib/api/admin-client.ts
async requestWithTimeout<T>(
  endpoint: string,
  options?: RequestInit,
  timeoutMs = 30000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(this.baseURL + endpoint, {
      ...options,
      signal: controller.signal,
      headers: { /* ... */ }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}
```

**Reemplazar** `request()` por `requestWithTimeout()` en todos los métodos.

**Esfuerzo**: 1 hora
**Prioridad**: 🔴 P1

---

## Prioridad P2: Medio

> Mejoras de calidad de código y Developer Experience

### 11. Code Splitting y Bundle Optimization

**Acción**:

```typescript
// Lazy loading de rutas
const ThemeEditorArea = lazy(() => import('./components/tools/ThemeEditorArea'));
const DatabaseDevToolsArea = lazy(() => import('./components/tools/DatabaseDevToolsArea'));

// Code splitting manual en Vite
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'zustand-vendor': ['zustand'],
          'ui-components': [
            './src/components/ui/Button',
            './src/components/ui/Input',
            // ...
          ],
        },
      },
    },
  },
});
```

**Esfuerzo**: 2-3 horas
**Prioridad**: 🟡 P2

---

### 12. Refactor WebSocketProvider (Separar Responsabilidades)

**Acción**:

```typescript
// Crear servicios especializados
// src/services/websocket/message-handler.ts
export class MessageHandler {
  async handleMessageReceived(event: MessageReceivedEvent): Promise<void> {
    // Lógica extraída del WebSocketProvider
  }
}

// src/services/websocket/conversation-manager.ts
export class ConversationManager {
  async ensureConversationExists(message: MessageEnvelope): Promise<void> {
    // Lógica extraída
  }
}

// WebSocketProvider solo orquesta
const messageHandler = new MessageHandler();
const conversationManager = new ConversationManager();

const handleMessageReceived = useCallback(async (event) => {
  await messageHandler.handleMessageReceived(event);
}, []);
```

**Esfuerzo**: 1-2 días
**Prioridad**: 🟡 P2

---

### 13. Refactor AdminAPIClient (Separar en Clientes Especializados)

**Acción**:

```typescript
// src/lib/api/auth-api-client.ts
export class AuthAPIClient {
  async login(data: LoginRequest): Promise<AuthResponse> { /* ... */ }
  async signup(data: SignupRequest): Promise<AuthResponse> { /* ... */ }
}

// src/lib/api/conversation-api-client.ts
export class ConversationAPIClient {
  async getConversations(): Promise<Conversation[]> { /* ... */ }
  async getConversation(id: string): Promise<Conversation> { /* ... */ }
}

// Facade
export class AdminAPI {
  auth = new AuthAPIClient();
  conversations = new ConversationAPIClient();
  messages = new MessageAPIClient();
  // ...
}

// Uso
import { adminAPI } from '@/lib/api';
await adminAPI.auth.login({ email, password });
```

**Esfuerzo**: 4-6 horas
**Prioridad**: 🟡 P2

---

### 14. Eliminar Dependencias No Utilizadas

**Acción**:

```bash
# Eliminar dependencias no usadas
npm uninstall @tanstack/react-query axios

# MANTENER @tanstack/react-virtual para implementar virtualización
```

**Esfuerzo**: 5 minutos
**Prioridad**: 🟡 P2

---

### 15. Agregar ESLint + Prettier + Husky

**Acción**:

```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
npm install --save-dev husky lint-staged
```

**Configurar**:

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "error"
  }
}

// .prettierrc
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Esfuerzo**: 2-3 horas
**Prioridad**: 🟡 P2

---

## Prioridad P3: Bajo

> Mejoras nice-to-have para el futuro

### 16. Internacionalización (i18n)

**Acción**:

```bash
npm install react-i18next i18next
```

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        'auth.login.title': 'INHOST Admin',
        'auth.login.subtitle': 'Sign in to your account',
      },
    },
    es: {
      translation: {
        'auth.login.title': 'INHOST Admin',
        'auth.login.subtitle': 'Inicia sesión en tu cuenta',
      },
    },
  },
  lng: 'en',
  fallbackLng: 'en',
});
```

**Esfuerzo**: 2-3 días para toda la app
**Prioridad**: 🟢 P3

---

### 17. Multi-tab Sync con BroadcastChannel

**Acción**:

```typescript
// src/services/multi-tab-sync.ts
export class MultiTabSync {
  private channel: BroadcastChannel;

  constructor() {
    this.channel = new BroadcastChannel('inhost-sync');

    this.channel.onmessage = (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'message:new':
          useStore.getState().actions.addMessage(payload.conversationId, payload.message);
          break;
        // ...
      }
    };
  }

  broadcastMessageAdded(conversationId: string, message: MessageEnvelope): void {
    this.channel.postMessage({
      type: 'message:new',
      payload: { conversationId, message },
    });
  }
}
```

**Esfuerzo**: 4-6 horas
**Prioridad**: 🟢 P3

---

### 18. Migrar Maps a Objetos Planos o Immer

**Acción**:

```typescript
// Opción 1: Objetos planos
entities: {
  conversations: {} as Record<string, Conversation>,
  messages: {} as Record<string, MessageEnvelope[]>,
  contacts: {} as Record<string, Contact>,
}

// Opción 2: Immer
import { immer } from 'zustand/middleware/immer';

export const useStore = create<AppState>()(
  immer((set) => ({
    entities: { conversations: {}, messages: {}, contacts: {} },
    actions: {
      addConversation: (conversation) =>
        set((state) => {
          // Immer permite mutaciones
          state.entities.conversations[conversation.id] = conversation;
        }),
    },
  }))
);
```

**Esfuerzo**: 1 día
**Prioridad**: 🟢 P3

---

### 19. Implementar Capa de Abstracción sobre IndexedDB

**Acción**:

```typescript
// src/services/persistence/storage-adapter.ts
export interface StorageAdapter {
  addMessage(message: MessageEnvelope): Promise<void>;
  getMessages(conversationId: string): Promise<MessageEnvelope[]>;
  // ...
}

// src/services/persistence/indexeddb-adapter.ts
export class IndexedDBAdapter implements StorageAdapter {
  // Implementación actual
}

// src/services/persistence/memory-adapter.ts (para tests)
export class MemoryAdapter implements StorageAdapter {
  // Implementación en memoria
}
```

**Esfuerzo**: 1-2 días
**Prioridad**: 🟢 P3

---

### 20. Limpiar Código Muerto

**Acción**:

```bash
# Eliminar archivos no usados
rm src/pages/Dashboard.tsx

# Eliminar método no usado
# src/services/api.ts:234-240 - handleApiError
```

**Esfuerzo**: 1 hora
**Prioridad**: 🟢 P3

---

## Roadmap Sugerido

### Sprint 1 (Semana 1-2): Crítico

**Objetivos**:
- ✅ Implementar tests para services (database, sync, api)
- ✅ Implementar JWT refresh tokens
- ✅ Implementar virtualización de listas
- ✅ Centralizar normalización de conversationId
- ✅ Implementar type guards

**Métricas de Éxito**:
- Cobertura de tests: >50%
- Tiempo de carga inicial: <3s
- Lag en scroll: <100ms

---

### Sprint 2 (Semana 3-4): Alto

**Objetivos**:
- ✅ Lazy loading de mensajes
- ✅ Error handling exhaustivo
- ✅ Implementar sync lock
- ✅ Estandarizar logger service
- ✅ Agregar timeouts a fetch

**Métricas de Éxito**:
- Cobertura de tests: >70%
- Tiempo de carga inicial: <2s
- 0 crashes por errores no manejados

---

### Sprint 3 (Semana 5-6): Medio

**Objetivos**:
- ✅ Code splitting y bundle optimization
- ✅ Refactor WebSocketProvider
- ✅ Refactor AdminAPIClient
- ✅ Eliminar dependencias no usadas
- ✅ ESLint + Prettier + Husky

**Métricas de Éxito**:
- Bundle size: <500KB (gzipped)
- Lighthouse Performance Score: >90
- 0 errores de ESLint

---

### Sprint 4 (Backlog): Bajo

**Objetivos**:
- ✅ Internacionalización (i18n)
- ✅ Multi-tab sync
- ✅ Migrar Maps a objetos planos
- ✅ Capa de abstracción sobre IndexedDB
- ✅ Limpiar código muerto

---

## Métricas de Éxito

### Performance

| Métrica | Estado Actual | Objetivo | Prioridad |
|---------|---------------|----------|-----------|
| **Tiempo de carga inicial** | ~5s | <2s | P0 |
| **Bundle size** | ~800KB | <500KB | P2 |
| **Lighthouse Performance** | 70 | >90 | P2 |
| **First Contentful Paint** | 2s | <1s | P2 |
| **Lag en scroll** | 500ms+ | <100ms | P0 |

### Calidad

| Métrica | Estado Actual | Objetivo | Prioridad |
|---------|---------------|----------|-----------|
| **Cobertura de tests** | 0% | >80% | P0 |
| **TypeScript strict** | ✅ | ✅ | - |
| **ESLint errors** | ? | 0 | P2 |
| **Dependencias no usadas** | 3 | 0 | P2 |
| **Código duplicado** | ~5% | <2% | P1 |

### Seguridad

| Métrica | Estado Actual | Objetivo | Prioridad |
|---------|---------------|----------|-----------|
| **JWT refresh tokens** | ❌ | ✅ | P0 |
| **Input validation** | Parcial | Completa | P1 |
| **Type guards** | ❌ | ✅ | P0 |
| **Error handling** | 40% | 100% | P1 |
| **Rate limiting (frontend)** | ❌ | ✅ | P2 |

### Developer Experience

| Métrica | Estado Actual | Objetivo | Prioridad |
|---------|---------------|----------|-----------|
| **Documentación** | 60% | 100% | ✅ |
| **Linter** | ❌ | ✅ | P2 |
| **Formatter** | ❌ | ✅ | P2 |
| **Pre-commit hooks** | ❌ | ✅ | P2 |
| **Dev tools** | ✅ | ✅ | - |

---

## Checklist de Implementación

### Crítico (P0)

- [ ] Tests unitarios para services (database, sync, api)
- [ ] Tests para stores (main store, workspace store, auth store)
- [ ] Tests de integración (login flow, message flow)
- [ ] Implementar JWT refresh tokens con auto-refresh
- [ ] Virtualización de MessageList
- [ ] Virtualización de ConversationList
- [ ] Centralizar normalización de conversationId
- [ ] Type guards para WebSocket events

### Alto (P1)

- [ ] Lazy loading de mensajes (solo cargar cuando se abre conversación)
- [ ] Error handling exhaustivo en WebSocketProvider
- [ ] Error handling exhaustivo en sync.ts
- [ ] Error handling exhaustivo en admin-client.ts
- [ ] Implementar sync lock para evitar race conditions
- [ ] Reemplazar todos los console.* por logger.*
- [ ] Configurar logger levels por ambiente
- [ ] Agregar timeouts a todos los fetch requests

### Medio (P2)

- [ ] Code splitting (lazy loading de rutas)
- [ ] Manual chunks en Vite config
- [ ] Refactor WebSocketProvider (extraer MessageHandler, ConversationManager)
- [ ] Refactor AdminAPIClient (separar en clientes especializados)
- [ ] Eliminar @tanstack/react-query
- [ ] Eliminar axios
- [ ] Configurar ESLint
- [ ] Configurar Prettier
- [ ] Configurar Husky + lint-staged
- [ ] Agregar pre-commit hooks

### Bajo (P3)

- [ ] i18n setup (react-i18next)
- [ ] Traducir todos los strings hardcodeados
- [ ] Implementar multi-tab sync con BroadcastChannel
- [ ] Migrar Maps a objetos planos o Immer
- [ ] Implementar StorageAdapter interface
- [ ] IndexedDBAdapter implementation
- [ ] MemoryAdapter implementation (para tests)
- [ ] Eliminar Dashboard.tsx
- [ ] Eliminar handleApiError no usado

---

## Herramientas Recomendadas

### Monitoring & Debugging

```bash
# Bundle analyzer
npm install --save-dev vite-plugin-visualizer

# Performance monitoring
npm install --save-dev @sentry/react @sentry/tracing
```

### Testing

```bash
# Testing libraries
npm install --save-dev vitest @vitest/ui
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event

# Mocks
npm install --save-dev fake-indexeddb
```

### Code Quality

```bash
# Linting & Formatting
npm install --save-dev eslint prettier
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev eslint-config-prettier eslint-plugin-prettier

# Git hooks
npm install --save-dev husky lint-staged
```

---

## Conclusión

Este documento proporciona un plan de acción concreto y priorizado para mejorar la calidad del código del frontend de INHOST.

**Próximos Pasos**:

1. Revisar con el equipo y validar prioridades
2. Crear tickets en el sistema de tracking
3. Asignar responsables y timelines
4. Comenzar con Sprint 1 (P0: Crítico)
5. Medir progreso con las métricas definidas

**Importante**: Este plan es iterativo. Después de cada sprint, revisar métricas y ajustar prioridades según sea necesario.

---

**Última Actualización**: 2025-01-20
**Versión**: 1.0.0
**Autor**: Equipo INHOST
