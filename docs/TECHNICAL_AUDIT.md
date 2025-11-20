# INHOST Frontend - Auditoría Técnica Exhaustiva

> **Análisis profundo de arquitectura, código, seguridad, performance y mejores prácticas**
>
> **Fecha**: 2025-01-20
> **Versión del Código Auditado**: 1.0.0
> **Auditor**: Ingeniero Senior Full-Stack

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Problemas de Arquitectura](#problemas-de-arquitectura)
3. [Violaciones de Principios SOLID](#violaciones-de-principios-solid)
4. [Problemas de Tipado](#problemas-de-tipado)
5. [Malas Prácticas de Diseño](#malas-prácticas-de-diseño)
6. [Problemas de Escalabilidad](#problemas-de-escalabilidad)
7. [Problemas de Performance](#problemas-de-performance)
8. [Riesgos de Seguridad](#riesgos-de-seguridad)
9. [Problemas de Concurrencia](#problemas-de-concurrencia)
10. [Gestión de Async/Await](#gestión-de-asyncawait)
11. [Dependencias y Árbol](#dependencias-y-árbol)
12. [Código Muerto y Variables Sin Usar](#código-muerto-y-variables-sin-usar)
13. [Inconsistencias entre Módulos](#inconsistencias-entre-módulos)
14. [Tests Faltantes Críticos](#tests-faltantes-críticos)
15. [Matriz de Severidad](#matriz-de-severidad)

---

## Resumen Ejecutivo

### Métricas Generales

| Métrica | Valor | Estado |
|---------|-------|--------|
| **Líneas de Código (TypeScript)** | ~10,000+ | ⚠️ Creciendo rápido |
| **Archivos TS/TSX** | 81 | ✅ Manejable |
| **Cobertura de Tests** | 0% | ❌ CRÍTICO |
| **Dependencias** | 13 directas | ✅ Bajo |
| **Dev Dependencies** | 9 | ✅ Bajo |
| **Deuda Técnica Estimada** | Alta | ⚠️ |

### Evaluación por Categoría

| Categoría | Score | Notas |
|-----------|-------|-------|
| **Arquitectura** | 7/10 | Bien estructurada, algunos acoplamientos |
| **SOLID** | 6/10 | Violaciones moderadas (SRP, DIP) |
| **Tipado** | 8/10 | Buen uso de TypeScript, algunos `any` |
| **Seguridad** | 6/10 | JWT sin refresh, XSS prevención básica |
| **Performance** | 7/10 | Sin virtualización, algunos re-renders |
| **Testing** | 0/10 | ❌ CRÍTICO: Sin tests |
| **Documentación** | 5/10 | Código bien comentado, docs faltantes |

### Hallazgos Críticos (Acción Inmediata Requerida)

1. ❌ **Sin tests unitarios ni integración** - CRÍTICO
2. ⚠️ **JWT sin sistema de refresh tokens** - ALTO
3. ⚠️ **Listas no virtualizadas (1000+ items potenciales)** - ALTO
4. ⚠️ **Error handling inconsistente** - MEDIO
5. ⚠️ **Logging a IndexedDB sin rotación** - MEDIO

---

## Problemas de Arquitectura

### 1. Acoplamiento entre WebSocketProvider y Multiple Stores

**Ubicación**: `src/providers/WebSocketProvider.tsx:83-87`

**Problema**:
```typescript
const setConnectionStatus = useStore((s) => s.actions.setConnectionStatus);
const addMessage = useStore((s) => s.actions.addMessage);
const updateSimulationState = useStore((s) => s.actions.updateSimulationState);
const addToast = useToastStore((s) => s.addToast);
```

WebSocketProvider está fuertemente acoplado a múltiples stores. Viola el principio de Dependency Inversion.

**Impacto**:
- Difícil de testear (mock de múltiples stores)
- Cambios en stores rompen WebSocketProvider
- No se puede reutilizar en otros contextos

**Recomendación**:
```typescript
// Crear un hook intermediario que encapsule todas las acciones
interface WebSocketActions {
  onConnectionChange: (status: 'connected' | 'disconnected') => void;
  onMessageReceived: (message: MessageEnvelope) => void;
  onSimulationUpdate: (state: Partial<SimulationState>) => void;
  onError: (error: string) => void;
}

function useWebSocketActions(): WebSocketActions {
  // Internamente usa los stores, pero WebSocketProvider no los conoce
  return {
    onConnectionChange: (status) => useStore.getState().actions.setConnectionStatus(status),
    // ...
  };
}

// WebSocketProvider recibe actions por props
<WebSocketProvider actions={useWebSocketActions()}>
```

**Severidad**: MEDIA
**Esfuerzo**: Medio (2-3 horas)

---

### 2. Duplicación de Lógica de Normalización de conversationId

**Ubicación**:
- `src/providers/WebSocketProvider.tsx:106-110` (`getConversationId`)
- `src/services/sync.ts` (lógica implícita)

**Problema**:
```typescript
// WebSocketProvider.tsx
const getConversationId = useCallback((channel: string, from: string): string => {
  return `${channel}-${from}`;
}, []);

// sync.ts - No tiene función equivalente, usa conversation.id directamente
```

Esta lógica crítica debería estar centralizada en un solo lugar.

**Impacto**:
- Riesgo de inconsistencias si cambia el formato
- Duplicación de lógica de negocio
- Difícil de testear

**Recomendación**:
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

// Usar en todos los lugares
import { generateConversationId } from '@/utils/conversationId';
const conversationId = generateConversationId(message.channel, message.metadata.from);
```

**Severidad**: ALTA
**Esfuerzo**: Bajo (1 hora)

---

### 3. Sync Service con Responsabilidades Múltiples

**Ubicación**: `src/services/sync.ts`

**Problema**:
SyncService maneja:
1. Carga desde IndexedDB
2. Sincronización con backend
3. Derivación de datos (contacts desde conversations)
4. Limpieza de datos
5. Estadísticas

Viola el Single Responsibility Principle.

**Impacto**:
- Difícil de testear
- Cambios en una responsabilidad afectan otras
- Clase demasiado grande (314 líneas)

**Recomendación**:
```typescript
// Separar en servicios especializados

// src/services/sync/load-service.ts
export class LoadService {
  async loadFromIndexedDB(): Promise<void> { /* ... */ }
}

// src/services/sync/backend-sync-service.ts
export class BackendSyncService {
  async syncFromBackend(): Promise<void> { /* ... */ }
}

// src/services/sync/derivation-service.ts
export class DerivationService {
  async deriveContactsFromConversations(): Promise<void> { /* ... */ }
  async deriveConversationsFromMessages(): Promise<void> { /* ... */ }
}

// src/services/sync/index.ts - Facade
export class SyncOrchestrator {
  constructor(
    private load: LoadService,
    private backendSync: BackendSyncService,
    private derivation: DerivationService
  ) {}

  async initialSync(): Promise<void> {
    await this.backendSync.syncFromBackend();
    await this.load.loadFromIndexedDB();
    // ...
  }
}
```

**Severidad**: MEDIA
**Esfuerzo**: Alto (1 día)

---

### 4. Workspace Store: Lógica de Negocio Compleja en Store

**Ubicación**: `src/store/workspace.ts:233-300` (`openTab` action)

**Problema**:
```typescript
openTab: (tab, containerId) =>
  set((state) => {
    // 60+ líneas de lógica compleja dentro del action
    // - Toggle behavior
    // - Búsqueda de contenedor vacío
    // - Activación de tab existente
    // - Creación de nueva tab
  });
```

Esta lógica debería estar en un servicio separado, no en el store.

**Impacto**:
- Difícil de testear
- Store demasiado complejo
- Lógica de negocio mezclada con state management

**Recomendación**:
```typescript
// src/services/workspace/tab-manager.ts
export class TabManager {
  openTab(
    state: WorkspaceState,
    tab: WorkspaceTab,
    containerId?: string
  ): Partial<WorkspaceState> {
    // Toda la lógica compleja aquí, bien testeada
    if (this.isTabActive(state, tab)) {
      return this.closeTab(state, tab);
    }
    const targetContainer = this.findTargetContainer(state, containerId);
    // ...
    return { containers: updatedContainers };
  }

  private isTabActive(state: WorkspaceState, tab: WorkspaceTab): boolean { /* ... */ }
  private findTargetContainer(state: WorkspaceState, containerId?: string): string { /* ... */ }
}

// En el store
import { tabManager } from '@/services/workspace/tab-manager';

openTab: (tab, containerId) =>
  set((state) => tabManager.openTab(state, tab, containerId));
```

**Severidad**: MEDIA
**Esfuerzo**: Medio (3-4 horas)

---

### 5. Falta de Capa de Abstracción para IndexedDB

**Ubicación**: `src/services/database.ts`

**Problema**:
El resto de la aplicación está directamente acoplado a IndexedDB via el servicio `db`. Si en el futuro se quiere cambiar a otra base de datos (por ejemplo, para soporte de React Native con SQLite), hay que cambiar múltiples archivos.

**Impacto**:
- Difícil de migrar a otra tecnología de persistencia
- Testing complicado (requiere IndexedDB mock)
- No hay abstracción sobre el storage

**Recomendación**:
```typescript
// src/services/persistence/storage-adapter.ts
export interface StorageAdapter {
  addMessage(message: MessageEnvelope): Promise<void>;
  getMessages(conversationId: string): Promise<MessageEnvelope[]>;
  // ... resto de métodos
}

// src/services/persistence/indexeddb-adapter.ts
export class IndexedDBAdapter implements StorageAdapter {
  private db: DatabaseService;
  // Implementación usando IndexedDB
}

// src/services/persistence/memory-adapter.ts (para tests)
export class MemoryAdapter implements StorageAdapter {
  private messages: Map<string, MessageEnvelope[]> = new Map();
  // Implementación en memoria
}

// Usar dependency injection
const storageAdapter: StorageAdapter = new IndexedDBAdapter();
```

**Severidad**: BAJA (futuro-proofing)
**Esfuerzo**: Alto (1-2 días)

---

## Violaciones de Principios SOLID

### 1. Single Responsibility Principle (SRP)

#### Violación 1.1: WebSocketProvider

**Ubicación**: `src/providers/WebSocketProvider.tsx` (754 líneas)

**Problema**:
WebSocketProvider tiene múltiples responsabilidades:
1. Gestión de conexión WebSocket
2. Routing de eventos
3. Persistencia en IndexedDB
4. Actualización de Zustand Store
5. Normalización de conversationId
6. Creación de conversations y contacts
7. Sistema de notificaciones (toasts)

**Recomendación**:
Separar en:
- `WebSocketConnection`: Gestión de conexión y reconexión
- `WebSocketEventRouter`: Routing de eventos
- `MessageHandler`: Lógica específica de mensajes
- `ConversationManager`: Lógica de conversaciones
- `NotificationService`: Sistema de notificaciones

**Severidad**: ALTA
**Esfuerzo**: Alto (1-2 días)

---

#### Violación 1.2: AdminAPIClient

**Ubicación**: `src/lib/api/admin-client.ts` (581 líneas)

**Problema**:
Una sola clase maneja todos los endpoints del backend:
- Auth (login, signup, logout)
- Tenant (get, update)
- Sync (syncInitial)
- Conversations (CRUD + mark as read)
- Messages (CRUD + status)
- End Users (CRUD)
- Team (CRUD + invites)
- Account (get, update)
- Integrations (CRUD)
- Mentions (CRUD + mark as read)
- Message Feedback (CRUD + analytics)

**Recomendación**:
```typescript
// Separar en clientes especializados
export class AuthAPIClient {
  async login(data: LoginRequest): Promise<AuthResponse> { /* ... */ }
  async signup(data: SignupRequest): Promise<AuthResponse> { /* ... */ }
}

export class ConversationAPIClient {
  async getConversations(): Promise<Conversation[]> { /* ... */ }
  async getConversation(id: string): Promise<Conversation> { /* ... */ }
  // ...
}

// Facade para acceso fácil
export class AdminAPI {
  auth = new AuthAPIClient();
  conversations = new ConversationAPIClient();
  messages = new MessageAPIClient();
  // ...
}

// Uso
import { adminAPI } from '@/lib/api';
await adminAPI.auth.login({ email, password });
await adminAPI.conversations.getConversations();
```

**Severidad**: MEDIA
**Esfuerzo**: Medio (4-6 horas)

---

### 2. Open/Closed Principle (OCP)

#### Violación 2.1: WebSocket Event Handling

**Ubicación**: `src/providers/WebSocketProvider.tsx:515-578`

**Problema**:
```typescript
switch (data.type) {
  case 'connection':
    handleConnection(data as ConnectionEvent);
    break;
  case 'message_received':
    handleMessageReceived(data as MessageReceivedEvent);
    break;
  // ... 12 más cases
  default:
    console.warn('Unknown WebSocket event:', data);
}
```

Cada nuevo tipo de evento requiere modificar este switch. Viola OCP (abierto para extensión, cerrado para modificación).

**Recomendación**:
```typescript
// src/services/websocket/event-handlers.ts
type EventHandler = (event: WebSocketEvent) => Promise<void>;

const eventHandlers = new Map<string, EventHandler>([
  ['connection', handleConnection],
  ['message_received', handleMessageReceived],
  ['message_processing', handleMessageProcessing],
  // ...
]);

// src/services/websocket/event-dispatcher.ts
export class EventDispatcher {
  private handlers = new Map<string, EventHandler>();

  registerHandler(type: string, handler: EventHandler): void {
    this.handlers.set(type, handler);
  }

  async dispatch(event: WebSocketEvent): Promise<void> {
    const handler = this.handlers.get(event.type);
    if (handler) {
      await handler(event);
    } else {
      console.warn('Unknown WebSocket event:', event.type);
    }
  }
}

// Uso
const dispatcher = new EventDispatcher();
dispatcher.registerHandler('connection', handleConnection);
dispatcher.registerHandler('message_received', handleMessageReceived);
// ...

// En WebSocketProvider
const handleWebSocketMessage = useCallback((event: MessageEvent) => {
  const data: WebSocketEvent = JSON.parse(event.data);
  dispatcher.dispatch(data);
}, []);
```

**Severidad**: MEDIA
**Esfuerzo**: Medio (2-3 horas)

---

### 3. Liskov Substitution Principle (LSP)

**Estado**: ✅ No se detectaron violaciones graves.

El proyecto no hace uso extenso de herencia, lo cual es positivo. Los interfaces están bien diseñados.

---

### 4. Interface Segregation Principle (ISP)

#### Violación 4.1: AppState Interface Demasiado Grande

**Ubicación**: `src/types/index.ts:419-487`

**Problema**:
```typescript
export interface AppState {
  entities: { /* ... */ };
  simulation: { /* ... */ };
  ui: { /* ... */ };
  network: { /* ... */ };
  actions: {
    // 25+ métodos diferentes
    setActiveConversation: (id: string | null) => void;
    addConversation: (conversation: Conversation) => void;
    updateConversation: (id: string, updates: Partial<Conversation>) => void;
    addMessage: (conversationId: string, message: MessageEnvelope) => void;
    setMessages: (conversationId: string, messages: MessageEnvelope[]) => void;
    // ... 20 más
  };
}
```

Los componentes que solo necesitan `addMessage` tienen que conocer toda la interfaz de `actions`.

**Recomendación**:
```typescript
// Interfaces segregadas
export interface ConversationActions {
  setActiveConversation: (id: string | null) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
}

export interface MessageActions {
  addMessage: (conversationId: string, message: MessageEnvelope) => void;
  setMessages: (conversationId: string, messages: MessageEnvelope[]) => void;
}

export interface NetworkActions {
  setConnectionStatus: (status: 'connected' | 'disconnected') => void;
  addPendingMessage: (messageId: string) => void;
  removePendingMessage: (messageId: string) => void;
  updateLastSync: (timestamp: Date) => void;
}

// Hooks específicos
export const useConversationActions = (): ConversationActions => {
  return {
    setActiveConversation: useStore((s) => s.actions.setActiveConversation),
    addConversation: useStore((s) => s.actions.addConversation),
    updateConversation: useStore((s) => s.actions.updateConversation),
  };
};

export const useMessageActions = (): MessageActions => {
  return {
    addMessage: useStore((s) => s.actions.addMessage),
    setMessages: useStore((s) => s.actions.setMessages),
  };
};
```

**Severidad**: BAJA
**Esfuerzo**: Bajo (1-2 horas)

---

### 5. Dependency Inversion Principle (DIP)

#### Violación 5.1: Services Hardcoded en Components

**Ubicación**: Múltiples archivos (ej: `src/pages/auth/LoginPage.tsx:3,5`)

**Problema**:
```typescript
import { adminAPI } from '../../lib/api/admin-client';
import { syncService } from '../../services/sync';

async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  const response = await adminAPI.login({ email, password });
  await syncService.syncFromBackend();
  // ...
}
```

Los componentes dependen directamente de implementaciones concretas (adminAPI, syncService), no de abstracciones.

**Impacto**:
- Imposible de testear sin mocks complejos
- No se puede cambiar la implementación sin modificar componentes

**Recomendación**:
```typescript
// src/services/auth/auth-service.interface.ts
export interface IAuthService {
  login(credentials: LoginRequest): Promise<AuthResponse>;
  logout(): Promise<void>;
  syncUserData(): Promise<void>;
}

// src/services/auth/auth-service.impl.ts
export class AuthService implements IAuthService {
  constructor(
    private apiClient: IAPIClient,
    private syncService: ISyncService
  ) {}

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.apiClient.login(credentials);
    await this.syncService.syncFromBackend();
    return response;
  }
}

// src/hooks/use-auth-service.ts
export function useAuthService(): IAuthService {
  // Retorna la implementación real o mock según el contexto
  return useMemo(() => new AuthService(adminAPI, syncService), []);
}

// LoginPage.tsx
const authService = useAuthService();
await authService.login({ email, password });
```

**Severidad**: ALTA (para testabilidad)
**Esfuerzo**: Alto (2-3 días para toda la app)

---

## Problemas de Tipado

### 1. Uso de `any` en AdminAPIClient

**Ubicación**:
- `src/lib/api/admin-client.ts:270` (`params as any`)
- `src/lib/api/admin-client.ts:318` (`params as any`)
- `src/lib/api/admin-client.ts:349` (`params as any`)
- `src/lib/api/admin-client.ts:469` (`params as any`)
- `src/lib/api/admin-client.ts:564` (`params as any`)
- `src/lib/api/admin-client.ts:575` (`params as any`)

**Problema**:
```typescript
async getConversations(params?: {
  limit?: number;
  offset?: number;
  status?: 'active' | 'closed' | 'archived';
  channel?: string;
}): Promise<{ success: boolean; data: { conversations: Conversation[]; total: number } }> {
  const query = new URLSearchParams(params as any).toString();
  // ^^^ params as any pierde type safety
}
```

**Impacto**:
- Pérdida de type safety
- Errores en runtime que TypeScript no detecta
- Falta de autocompletado en el IDE

**Recomendación**:
```typescript
function paramsToSearchParams(params: Record<string, unknown> | undefined): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  return searchParams.toString();
}

// Uso
const query = paramsToSearchParams(params);
```

**Severidad**: MEDIA
**Esfuerzo**: Bajo (30 minutos)

---

### 2. Type Assertions Peligrosos en WebSocketProvider

**Ubicación**: `src/providers/WebSocketProvider.tsx`

**Problema**:
```typescript
case 'connection':
  handleConnection(data as ConnectionEvent);
  break;
case 'message_received':
  handleMessageReceived(data as MessageReceivedEvent);
  break;
```

Si el backend envía un evento con tipo incorrecto, el type assertion falla silenciosamente en runtime.

**Impacto**:
- Errores en runtime difíciles de debuggear
- Crash de la aplicación si el payload no coincide

**Recomendación**:
```typescript
// src/utils/type-guards.ts
export function isConnectionEvent(data: WebSocketEvent): data is ConnectionEvent {
  return data.type === 'connection' &&
         'status' in data &&
         'timestamp' in data &&
         'clientId' in data;
}

export function isMessageReceivedEvent(data: WebSocketEvent): data is MessageReceivedEvent {
  return data.type === 'message_received' &&
         'data' in data &&
         'timestamp' in data;
}

// Uso
case 'connection':
  if (isConnectionEvent(data)) {
    handleConnection(data);
  } else {
    console.error('Invalid connection event:', data);
  }
  break;
```

**Severidad**: ALTA
**Esfuerzo**: Medio (2-3 horas)

---

### 3. Tipos Opcionales Inconsistentes

**Ubicación**: `src/types/index.ts`

**Problema**:
```typescript
export interface Contact {
  id: string;
  name: string;
  avatar?: string;         // opcional
  status: 'online' | 'offline' | 'away';
  channel: ChannelType;
  metadata?: {             // opcional
    phoneNumber?: string;  // opcional dentro de opcional
    email?: string;
    lastSeen?: string;
  };
}
```

El uso de opcionales anidados (`metadata?.phoneNumber`) hace el código verbose y propenso a errores.

**Recomendación**:
```typescript
export interface ContactMetadata {
  phoneNumber: string | null;
  email: string | null;
  lastSeen: string | null;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string | null;
  status: 'online' | 'offline' | 'away';
  channel: ChannelType;
  metadata: ContactMetadata;  // Siempre presente, pero con valores null
}

// Uso más limpio
const phone = contact.metadata.phoneNumber ?? 'Unknown';
// vs
const phone = contact.metadata?.phoneNumber ?? 'Unknown';
```

**Severidad**: BAJA
**Esfuerzo**: Medio (2-3 horas)

---

### 4. Falta de Validación en Tiempo de Ejecución

**Ubicación**: `src/services/api.ts`, `src/lib/api/admin-client.ts`

**Problema**:
```typescript
const json: ApiResponse<HealthStatus> = await response.json();
// No hay validación de que json realmente coincide con ApiResponse<HealthStatus>
```

TypeScript solo valida en compile-time. En runtime, si el backend devuelve un formato diferente, la app crashea.

**Recomendación**:
Usar bibliotecas de validación en runtime:

```typescript
// Opción 1: Zod
import { z } from 'zod';

const HealthStatusSchema = z.object({
  status: z.enum(['healthy', 'unhealthy']),
  database: z.enum(['postgresql', 'disconnected']),
  timestamp: z.string(),
  version: z.string(),
  redis: z.object({
    status: z.enum(['connected', 'disconnected']),
    host: z.string(),
    port: z.number(),
  }).optional(),
});

const json = await response.json();
const validated = HealthStatusSchema.parse(json);
// Si falla la validación, lanza error

// Opción 2: io-ts (más complejo pero type-safe)
```

**Severidad**: MEDIA
**Esfuerzo**: Alto (1 día para toda la app)

---

## Malas Prácticas de Diseño

### 1. God Object: `useStore`

**Ubicación**: `src/store/index.ts`

**Problema**:
El store principal contiene TODO el estado de la aplicación:
- entities (conversations, messages, contacts)
- simulation (clients, extensions, stats)
- ui (activeConversationId, theme, workspace, typingUsers)
- network (connectionStatus, pendingMessages, lastSync, retryQueue)
- 25+ actions

**Impacto**:
- Difícil de mantener
- Re-renders innecesarios (aunque Zustand optimiza con selectores)
- Testing complicado

**Recomendación**:
Separar en múltiples stores:

```typescript
// src/store/entities-store.ts
export const useEntitiesStore = create<EntitiesState>(() => ({
  conversations: new Map(),
  messages: new Map(),
  contacts: new Map(),
}));

// src/store/ui-store.ts
export const useUIStore = create<UIState>(() => ({
  activeConversationId: null,
  sidebarCollapsed: false,
  theme: 'light',
}));

// src/store/network-store.ts
export const useNetworkStore = create<NetworkState>(() => ({
  connectionStatus: 'disconnected',
  pendingMessages: new Set(),
}));
```

**Severidad**: MEDIA
**Esfuerzo**: Alto (1-2 días)

---

### 2. Funciones con Más de 3 Niveles de Anidación

**Ubicación**: `src/providers/WebSocketProvider.tsx:131-229` (`handleMessageReceived`)

**Problema**:
```typescript
const handleMessageReceived = useCallback(async (event: MessageReceivedEvent) => {
  const message = event.data;
  const normalizedConversationId = getConversationId(message.channel, message.metadata.from);
  const normalizedMessage = { ...message, conversationId: normalizedConversationId };

  await db.addMessage(normalizedMessage);

  const { entities, actions } = useStore.getState();
  let conversation = entities.conversations.get(normalizedConversationId);

  if (!conversation) {
    conversation = {
      id: normalizedConversationId,
      entityId: normalizedMessage.metadata.from,
      // ... 10 líneas más
    };
    await db.saveConversation(conversation);
    actions.addConversation(conversation);
  }

  let contact = entities.contacts.get(normalizedMessage.metadata.from);

  if (!contact) {
    contact = {
      id: normalizedMessage.metadata.from,
      name: normalizedMessage.metadata.from,
      // ... 8 líneas más
    };
    await db.saveContact(contact);
    actions.addContact(contact);
  }

  addMessage(normalizedConversationId, normalizedMessage);

  const { ui } = useStore.getState();
  if (ui.activeConversationId !== normalizedConversationId && normalizedMessage.type === 'incoming') {
    addToast({
      type: 'info',
      message: `Nuevo mensaje de ${contact.name}`,
      description: normalizedMessage.content.text || '[Media]',
      duration: 4000,
    });
  }
}, [addMessage, addToast, getConversationId]);
```

Función de 99 líneas con múltiples responsabilidades.

**Recomendación**:
```typescript
const handleMessageReceived = useCallback(async (event: MessageReceivedEvent) => {
  const normalizedMessage = normalizeMessage(event.data);
  await persistMessage(normalizedMessage);
  await ensureConversationExists(normalizedMessage);
  await ensureContactExists(normalizedMessage);
  updateStoreWithMessage(normalizedMessage);
  showNotificationIfNeeded(normalizedMessage);
}, []);

// Cada función es pequeña, testeableindependiente, y con un propósito claro
async function persistMessage(message: MessageEnvelope): Promise<void> {
  await db.addMessage(message);
}

async function ensureConversationExists(message: MessageEnvelope): Promise<void> {
  const { entities, actions } = useStore.getState();
  const conversation = entities.conversations.get(message.conversationId);

  if (!conversation) {
    const newConversation = createConversationFromMessage(message);
    await db.saveConversation(newConversation);
    actions.addConversation(newConversation);
  }
}

// ...
```

**Severidad**: MEDIA
**Esfuerzo**: Medio (3-4 horas)

---

### 3. Magic Numbers Sin Constantes

**Ubicación**: Múltiples archivos

**Problema**:
```typescript
// src/hooks/useWebSocket.ts:16-17
reconnectAttempts = 5,
reconnectInterval = 3000

// src/providers/WebSocketProvider.tsx:91-92
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000;

// src/services/database.ts:68
private readonly DB_VERSION = 1;

// src/services/database.ts:210
async deleteOldMessages(olderThanDays = 30): Promise<number> {
```

Números mágicos repetidos y sin explicación.

**Recomendación**:
```typescript
// src/config/constants.ts
export const WEBSOCKET_CONFIG = {
  MAX_RECONNECT_ATTEMPTS: 5,
  RECONNECT_INTERVAL_MS: 3000,
  RECONNECT_BACKOFF_MULTIPLIER: 2,
} as const;

export const DATABASE_CONFIG = {
  VERSION: 1,
  NAME: 'inhost-chat-db',
  MESSAGE_RETENTION_DAYS: 30,
} as const;

// Uso
import { WEBSOCKET_CONFIG } from '@/config/constants';

const MAX_RECONNECT_ATTEMPTS = WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS;
```

**Severidad**: BAJA
**Esfuerzo**: Bajo (1 hora)

---

### 4. Console.log Sin Sistema de Logging Estructurado (En Producción)

**Ubicación**: Múltiples archivos (90+ ocurrencias de `console.log`)

**Problema**:
```typescript
console.log('✅ WebSocket connected:', event);
console.log('📨 Message received:', event.data);
console.error('❌ WebSocket error:', error);
```

En producción, estos logs:
- No son capturables para análisis
- No tienen niveles de severidad consistentes
- No pueden ser deshabilitados
- No tienen contexto estructurado

**Nota**: El proyecto **SÍ** tiene un logger service (`src/services/logger.ts`) pero **NO** se usa consistentemente. Muchos archivos todavía usan `console.log`.

**Recomendación**:
Usar logger service en TODOS los archivos:

```typescript
// Reemplazar
console.log('📨 Message received:', event.data);

// Por
logger.info('websocket', 'Message received', {
  messageId: event.data.id,
  conversationId: event.data.conversationId,
  type: event.data.type,
  channel: event.data.channel,
});
```

Configurar niveles por ambiente:

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

**Severidad**: MEDIA (para producción)
**Esfuerzo**: Medio (1 día para refactor completo)

---

### 5. Hardcoded Strings (i18n faltante)

**Ubicación**: Todos los componentes

**Problema**:
```typescript
// LoginPage.tsx
<h2>INHOST Admin</h2>
<p>Sign in to your account</p>
<button>Sign in</button>

// WebSocketProvider.tsx
addToast({
  message: `Nuevo mensaje de ${contact.name}`,
  description: normalizedMessage.content.text || '[Media]',
});
```

Strings hardcodeados en español e inglés mezclados.

**Impacto**:
- No es internacionalizable
- Difícil de cambiar textos
- Inconsistente (español + inglés)

**Recomendación**:
```typescript
// Opción 1: react-i18next
import { useTranslation } from 'react-i18next';

function LoginPage() {
  const { t } = useTranslation();

  return (
    <>
      <h2>{t('auth.login.title')}</h2>
      <p>{t('auth.login.subtitle')}</p>
      <button>{t('auth.login.submit')}</button>
    </>
  );
}

// Opción 2: next-intl (si se migra a Next.js)
// Opción 3: Sistema propio simple
const translations = {
  es: {
    'auth.login.title': 'INHOST Admin',
    'auth.login.subtitle': 'Inicia sesión en tu cuenta',
  },
  en: {
    'auth.login.title': 'INHOST Admin',
    'auth.login.subtitle': 'Sign in to your account',
  },
};
```

**Severidad**: BAJA (para MVP)
**Esfuerzo**: Alto (2-3 días para toda la app)

---

## Problemas de Escalabilidad

### 1. Listas Sin Virtualización

**Ubicación**:
- `src/components/chat/MessageList.tsx`
- `src/components/workspace/PrimarySidebar.tsx` (lista de conversaciones)

**Problema**:
```typescript
// MessageList.tsx
export default function MessageList({ messages }: MessageListProps) {
  return (
    <div>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}
```

Si hay 1000+ mensajes, se renderizan TODOS en el DOM.

**Impacto**:
- Lag severo al scrollear
- Alto uso de memoria
- Experiencia de usuario degradada

**Recomendación**:
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

export default function MessageList({ messages }: MessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // altura estimada por mensaje
    overscan: 5, // renderizar 5 items extra arriba/abajo
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

**Severidad**: ALTA
**Esfuerzo**: Medio (3-4 horas por lista)

---

### 2. Carga Eager de Todas las Conversaciones

**Ubicación**: `src/services/sync.ts:32-46` (`loadFromIndexedDB`)

**Problema**:
```typescript
const conversations = await db.getAllConversations();
// ...
for (const conversation of conversations) {
  const messages = await db.getMessagesByConversation(conversation.id, 100);
  messagesMap.set(conversation.id, messages);
}
```

Si hay 100 conversaciones, se cargan 100 * 100 = 10,000 mensajes al boot.

**Impacto**:
- Tiempo de carga inicial muy largo
- Alto uso de memoria
- Puede bloquear el UI

**Recomendación**:
```typescript
// Carga lazy: Solo cargar mensajes cuando el usuario abre una conversación

// 1. Initial load: Solo conversaciones (sin mensajes)
async loadConversationsOnly(): Promise<void> {
  const conversations = await db.getAllConversations();
  useStore.setState({
    entities: {
      ...useStore.getState().entities,
      conversations: new Map(conversations.map(c => [c.id, c])),
    },
  });
}

// 2. Lazy load: Cargar mensajes bajo demanda
async loadMessagesForConversation(conversationId: string): Promise<void> {
  const cached = useStore.getState().entities.messages.get(conversationId);
  if (cached && cached.length > 0) {
    return; // Ya están en cache
  }

  const messages = await db.getMessagesByConversation(conversationId, 100);
  useStore.getState().actions.setMessages(conversationId, messages);
}
```

**Severidad**: ALTA
**Esfuerzo**: Medio (4-6 horas)

---

### 3. No Hay Paginación en Endpoints

**Ubicación**:
- `src/lib/api/admin-client.ts:257-273` (`syncInitial`)
- `src/lib/api/admin-client.ts:314-320` (`getMessages`)

**Problema**:
```typescript
async syncInitial(): Promise<{ success: boolean; data: SyncInitialData }> {
  return this.request('/sync/initial');
  // ¿Qué pasa si hay 10,000 conversaciones?
}
```

El endpoint `/sync/initial` devuelve TODAS las conversaciones sin paginación.

**Impacto**:
- Timeout en redes lentas
- Alto uso de ancho de banda
- Crash si hay demasiados datos

**Recomendación**:
```typescript
// Backend debe soportar paginación
async syncInitial(params?: {
  conversationsLimit?: number;
  conversationsOffset?: number;
  includeMessages?: boolean;
}): Promise<{ success: boolean; data: SyncInitialData }> {
  const query = paramsToSearchParams(params);
  return this.request(`/sync/initial${query ? '?' + query : ''}`);
}

// Frontend: Cargar en chunks
async syncFromBackendIncremental(): Promise<void> {
  let offset = 0;
  const limit = 50;
  let hasMore = true;

  while (hasMore) {
    const response = await adminAPI.syncInitial({
      conversationsLimit: limit,
      conversationsOffset: offset,
      includeMessages: false, // Mensajes lazy
    });

    // Guardar chunk en IndexedDB
    for (const conversation of response.data.conversations) {
      await db.saveConversation(conversation);
    }

    hasMore = response.data.conversations.length === limit;
    offset += limit;
  }
}
```

**Severidad**: ALTA
**Esfuerzo**: Alto (requiere cambios en backend + frontend)

---

### 4. Maps en Zustand No Escalan Bien

**Ubicación**: `src/store/index.ts:34-36`

**Problema**:
```typescript
entities: {
  conversations: new Map<string, Conversation>(),
  messages: new Map<string, MessageEnvelope[]>(),
  contacts: new Map<string, Contact>(),
}
```

Zustand no detecta cambios dentro de Maps/Sets (son mutables). Hay que crear nuevas instancias para triggear re-renders.

```typescript
// ❌ NO FUNCIONA: Muta el Map existente
state.entities.conversations.set(id, conversation);

// ✅ FUNCIONA: Crea nuevo Map
const newMap = new Map(state.entities.conversations);
newMap.set(id, conversation);
```

**Impacto**:
- Código verbose
- Fácil de cometer errores
- Performance (copiar Maps grandes)

**Recomendación**:
Usar objetos planos o bibliotecas inmutables:

```typescript
// Opción 1: Objetos planos
entities: {
  conversations: {} as Record<string, Conversation>,
  messages: {} as Record<string, MessageEnvelope[]>,
  contacts: {} as Record<string, Contact>,
}

// Actualizar
set((state) => ({
  entities: {
    ...state.entities,
    conversations: {
      ...state.entities.conversations,
      [id]: conversation,
    },
  },
}));

// Opción 2: Immer (Zustand ya lo soporta)
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

**Severidad**: MEDIA
**Esfuerzo**: Medio (1 día)

---

## Problemas de Performance

### 1. Re-renders Innecesarios por Selectores Incorrectos

**Ubicación**: Múltiples componentes

**Problema**:
```typescript
// ❌ BAD: Re-renderiza cuando CUALQUIER parte del store cambia
function MyComponent() {
  const store = useStore();
  const conversation = store.entities.conversations.get(id);
  // ...
}
```

**Recomendación**:
```typescript
// ✅ GOOD: Solo re-renderiza cuando la conversación específica cambia
function MyComponent() {
  const conversation = useStore((state) => state.entities.conversations.get(id));
  // ...
}
```

**Herramienta para detectar**: React DevTools Profiler

**Severidad**: MEDIA
**Esfuerzo**: Bajo (15 minutos por componente)

---

### 2. Operaciones Costosas en Render

**Ubicación**: `src/services/database.ts:165-179` (llamado desde components)

**Problema**:
```typescript
// Component
function MessageList() {
  const messages = useMessages(conversationId);

  // COSTOSO: Se ejecuta en cada render
  const sortedMessages = messages.sort((a, b) =>
    new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime()
  );

  return (/* ... */);
}
```

**Recomendación**:
```typescript
function MessageList() {
  const messages = useMessages(conversationId);

  // MEMOIZADO: Solo re-calcula si messages cambia
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) =>
      new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime()
    );
  }, [messages]);

  return (/* ... */);
}
```

**Severidad**: MEDIA
**Esfuerzo**: Bajo (10 minutos por componente)

---

### 3. Imágenes Sin Lazy Loading

**Ubicación**: `src/components/common/Avatar.tsx` (probablemente)

**Problema**:
Si hay 100 avatares en la lista de conversaciones, se cargan TODOS inmediatamente.

**Recomendación**:
```typescript
<img
  src={avatarUrl}
  alt={name}
  loading="lazy"  // ← Native lazy loading
/>

// O usar Intersection Observer para más control
```

**Severidad**: BAJA
**Esfuerzo**: Bajo (5 minutos)

---

### 4. Bundle Size Sin Code Splitting

**Ubicación**: `vite.config.ts` (sin configuración de code splitting)

**Problema**:
Todo el código se empaqueta en un solo bundle. Los usuarios descargan código que nunca usan (ej: ThemeEditor si solo usan chat).

**Recomendación**:
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

**Herramienta para analizar**: `vite-plugin-visualizer`

**Severidad**: MEDIA
**Esfuerzo**: Medio (2-3 horas)

---

### 5. No Hay Debouncing en Búsquedas

**Ubicación**: `src/components/workspace/PrimarySidebar.tsx` (si hay búsqueda)

**Problema**:
```typescript
// Cada keystroke triggerea una búsqueda
<input
  onChange={(e) => filterConversations(e.target.value)}
/>
```

**Recomendación**:
```typescript
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

function PrimarySidebar() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  const filteredConversations = useFilteredConversations(debouncedSearchTerm);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
}

// src/hooks/useDebouncedValue.ts
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

**Severidad**: MEDIA
**Esfuerzo**: Bajo (30 minutos)

---

## Riesgos de Seguridad

### 1. JWT Sin Refresh Tokens

**Ubicación**: `src/lib/api/admin-client.ts:32-40`, `src/store/auth-store.ts`

**Problema**:
```typescript
// AuthResponse solo devuelve accessToken
export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: {
      accessToken: string;   // ← Solo access token
      refreshToken: string;  // ← Backend lo devuelve pero NO SE USA
      expiresIn: number;
    };
  };
}
```

El frontend NO implementa refresh de tokens. Cuando el `accessToken` expira, el usuario es desloggeado abruptamente.

**Impacto**:
- Mala experiencia de usuario
- Usuario pierde trabajo en progreso
- Múltiples logins por día

**Recomendación**:
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

  private async refreshAccessToken(): Promise<{ accessToken: string; expiresIn: number; user: User }> {
    const refreshToken = localStorage.getItem('inhost_admin_refresh_token');
    const response = await fetch('/admin/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    return response.json();
  }

  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
  }
}
```

**Severidad**: ALTA
**Esfuerzo**: Medio (3-4 horas)

---

### 2. Token JWT en localStorage (Riesgo XSS)

**Ubicación**: `src/store/auth-store.ts:26-27`, `src/lib/auth/jwt.ts:49-56`

**Problema**:
```typescript
localStorage.setItem('inhost_admin_token', token);
```

Si hay una vulnerabilidad XSS, un atacante puede robar el token.

**Alternativa Más Segura**: httpOnly cookies (requiere cambios en backend)

**Mitigación (si no se puede cambiar)**:
- Implementar Content Security Policy (CSP)
- Sanitizar todos los inputs del usuario
- Usar DOMPurify para contenido HTML

**Recomendación**:
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' ws://localhost:3000 http://localhost:3000",
      ].join('; '),
    },
  },
});
```

**Severidad**: ALTA
**Esfuerzo**: Bajo (configuración CSP) a Alto (migrar a httpOnly cookies)

---

### 3. No Hay Validación de Inputs del Usuario

**Ubicación**: `src/components/chat/MessageInput.tsx`, `src/pages/auth/LoginPage.tsx`

**Problema**:
```typescript
// LoginPage.tsx
const email = formData.get('email') as string;
const password = formData.get('password') as string;
// No hay validación antes de enviar al backend
```

**Impacto**:
- XSS si el backend no sanitiza
- Inyección SQL (si backend es vulnerable)
- Mala UX (errores de validación desde el servidor)

**Recomendación**:
```typescript
// Usar react-hook-form + zod para validación
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // data ya está validado
    await adminAPI.login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Sign in</button>
    </form>
  );
}
```

**Severidad**: ALTA
**Esfuerzo**: Medio (1-2 horas por formulario)

---

### 4. CORS Misconfiguration (Potencial)

**Ubicación**: `vite.config.ts:25-36`

**Problema**:
```typescript
proxy: {
  '/api': {
    target: apiBaseUrl,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}
```

El proxy de Vite es solo para desarrollo. En producción, hay que configurar CORS correctamente en el backend.

**Recomendación**:
Asegurar que el backend tenga:

```typescript
// Backend (ejemplo con Express)
app.use(cors({
  origin: ['https://app.inhost.com', 'https://admin.inhost.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

**Severidad**: MEDIA (para producción)
**Esfuerzo**: Bajo (configuración de backend)

---

### 5. No Hay Rate Limiting en el Frontend

**Ubicación**: `src/lib/api/admin-client.ts`, `src/services/api.ts`

**Problema**:
Si un usuario hace spam de requests (ej: refresh button), puede sobrecargar el backend o triggear rate limiting del backend sin feedback claro.

**Recomendación**:
```typescript
// src/utils/rate-limiter.ts
export class RateLimiter {
  private requestCounts = new Map<string, number>();
  private resetTimers = new Map<string, NodeJS.Timeout>();

  canMakeRequest(key: string, maxRequests: number, windowMs: number): boolean {
    const count = this.requestCounts.get(key) || 0;

    if (count >= maxRequests) {
      return false;
    }

    this.requestCounts.set(key, count + 1);

    if (!this.resetTimers.has(key)) {
      this.resetTimers.set(key, setTimeout(() => {
        this.requestCounts.delete(key);
        this.resetTimers.delete(key);
      }, windowMs));
    }

    return true;
  }
}

// Uso
const rateLimiter = new RateLimiter();

async function fetchConversations() {
  if (!rateLimiter.canMakeRequest('fetchConversations', 10, 60000)) {
    throw new Error('Too many requests. Please wait a moment.');
  }

  return adminAPI.getConversations();
}
```

**Severidad**: BAJA
**Esfuerzo**: Bajo (1 hora)

---

## Problemas de Concurrencia

### 1. Race Conditions en WebSocket + HTTP

**Ubicación**: `src/providers/WebSocketProvider.tsx`, `src/pages/auth/LoginPage.tsx`

**Problema**:
```typescript
// LoginPage: Sync HTTP
await syncService.syncFromBackend();
await syncService.loadFromIndexedDB();

// WebSocketProvider: Async messages
const handleMessageReceived = async (event) => {
  await db.addMessage(normalizedMessage);
  // ...
};
```

**Escenario de Race Condition**:
1. Usuario hace login
2. `syncFromBackend()` fetch conversations from API
3. Mientras tanto, WebSocket recibe un mensaje nuevo
4. `handleMessageReceived()` intenta crear una conversación que aún no existe en el store
5. Estado inconsistente

**Impacto**:
- Mensajes perdidos
- Conversaciones duplicadas
- Estado inconsistente entre IndexedDB y Zustand

**Recomendación**:
```typescript
// src/services/sync/sync-lock.ts
export class SyncLock {
  private syncing = false;
  private queue: Array<() => Promise<void>> = [];

  async acquireLock(): Promise<void> {
    while (this.syncing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.syncing = true;
  }

  releaseLock(): void {
    this.syncing = false;
  }

  async withLock<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquireLock();
    try {
      return await fn();
    } finally {
      this.releaseLock();
    }
  }
}

const syncLock = new SyncLock();

// Uso
await syncLock.withLock(async () => {
  await syncService.syncFromBackend();
  await syncService.loadFromIndexedDB();
});

// En WebSocketProvider
await syncLock.withLock(async () => {
  await db.addMessage(message);
  await db.saveConversation(conversation);
  useStore.getState().actions.addMessage(conversationId, message);
});
```

**Severidad**: ALTA
**Esfuerzo**: Medio (4-6 horas)

---

### 2. Múltiples Escrituras Simultáneas a IndexedDB

**Ubicación**: `src/services/database.ts`

**Problema**:
```typescript
// Si varios mensajes llegan al mismo tiempo
Promise.all([
  db.addMessage(message1),
  db.addMessage(message2),
  db.addMessage(message3),
]);
```

IndexedDB es transaccional, pero múltiples transacciones concurrentes pueden causar deadlocks o errores.

**Recomendación**:
Usar `addMessages` (batch) cuando sea posible:

```typescript
// ✅ GOOD: Una transacción
await db.addMessages([message1, message2, message3]);

// O usar cola de escritura
class WriteQueue {
  private queue: MessageEnvelope[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  enqueue(message: MessageEnvelope): void {
    this.queue.push(message);

    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), 100);
    }
  }

  private async flush(): Promise<void> {
    const messages = [...this.queue];
    this.queue = [];
    this.flushTimer = null;

    await db.addMessages(messages);
  }
}
```

**Severidad**: MEDIA
**Esfuerzo**: Medio (2-3 horas)

---

### 3. Estado Compartido Sin Sincronización en Multi-Tab

**Ubicación**: Todo el proyecto

**Problema**:
Si el usuario abre la app en 2 tabs:
- Tab 1: Recibe mensaje por WebSocket, guarda en IndexedDB
- Tab 2: NO se entera (su store de Zustand está desactualizado)

**Recomendación**:
Usar BroadcastChannel API:

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
        case 'conversation:updated':
          useStore.getState().actions.updateConversation(payload.id, payload.updates);
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

  broadcastConversationUpdated(id: string, updates: Partial<Conversation>): void {
    this.channel.postMessage({
      type: 'conversation:updated',
      payload: { id, updates },
    });
  }
}

// Usar después de cada escritura a IndexedDB
await db.addMessage(message);
multiTabSync.broadcastMessageAdded(conversationId, message);
```

**Severidad**: BAJA (nice-to-have)
**Esfuerzo**: Medio (4-6 horas)

---

## Gestión de Async/Await

### 1. Missing Error Handling en Async Functions

**Ubicación**: Múltiples archivos

**Problema**:
```typescript
// WebSocketProvider.tsx:156
await db.addMessage(normalizedMessage);
// Si falla, el error se propaga sin manejo

// sync.ts:96
const response = await adminAPI.syncInitial();
// Si falla, error sin contexto
```

**Recomendación**:
```typescript
try {
  await db.addMessage(normalizedMessage);
} catch (error) {
  logger.error('websocket', 'Failed to persist message', {
    messageId: normalizedMessage.id,
    error: error instanceof Error ? error.message : String(error),
  });

  // Intentar retry o mostrar error al usuario
  addToast({
    type: 'error',
    message: 'Failed to save message',
    description: 'The message will be retried.',
  });

  // Agregar a retry queue
  useStore.getState().network.retryQueue.push(normalizedMessage);
}
```

**Severidad**: ALTA
**Esfuerzo**: Medio (1 día para toda la app)

---

### 2. No Hay Timeout en Fetch Requests

**Ubicación**: `src/lib/api/admin-client.ts:186-194`

**Problema**:
```typescript
const res = await fetch(this.baseURL + endpoint, {
  ...options,
  headers: { /* ... */ }
});
// Si el servidor no responde, el fetch se queda colgado indefinidamente
```

**Recomendación**:
```typescript
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

**Severidad**: MEDIA
**Esfuerzo**: Bajo (1 hora)

---

### 3. Promise.all Sin Error Handling

**Ubicación**: `src/services/database.ts:146-149`

**Problema**:
```typescript
await Promise.all([
  ...messages.map(msg => tx.store.put(msg)),
  tx.done
]);
// Si un mensaje falla, TODOS fallan
```

**Recomendación**:
```typescript
// Opción 1: Promise.allSettled (continuar aunque algunos fallen)
const results = await Promise.allSettled([
  ...messages.map(msg => tx.store.put(msg)),
  tx.done
]);

const failures = results.filter(r => r.status === 'rejected');
if (failures.length > 0) {
  logger.warn('db', 'Some messages failed to save', {
    failureCount: failures.length,
    totalCount: messages.length,
  });
}

// Opción 2: Retry individual failures
for (const message of messages) {
  try {
    await tx.store.put(message);
  } catch (error) {
    logger.error('db', 'Failed to save message', {
      messageId: message.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
```

**Severidad**: MEDIA
**Esfuerzo**: Bajo (30 minutos)

---

### 4. Async useEffect Sin Cleanup

**Ubicación**: `src/providers/WebSocketProvider.tsx:696-735`

**Problema**:
```typescript
useEffect(() => {
  const initialize = async () => {
    await db.init();
    await syncService.loadFromIndexedDB();
    connect();
  };

  initialize();

  return () => {
    disconnect();
  };
}, [connect, disconnect]);
```

Si el componente se desmonta mientras `initialize()` está corriendo, puede causar memory leaks o errores.

**Recomendación**:
```typescript
useEffect(() => {
  let cancelled = false;

  const initialize = async () => {
    await db.init();
    if (cancelled) return;

    await syncService.loadFromIndexedDB();
    if (cancelled) return;

    connect();
  };

  initialize();

  return () => {
    cancelled = true;
    disconnect();
  };
}, [connect, disconnect]);
```

**Severidad**: MEDIA
**Esfuerzo**: Bajo (15 minutos por useEffect)

---

## Dependencias y Árbol

### Análisis del package.json

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.90.10",     // ⚠️ Instalado pero NO USADO
    "@tanstack/react-virtual": "^3.13.12",   // ⚠️ Instalado pero NO USADO
    "axios": "^1.13.2",                       // ⚠️ Instalado pero NO USADO (se usa fetch)
    "idb": "^8.0.3",                          // ✅ USADO
    "lucide-react": "^0.554.0",               // ✅ USADO
    "react": "^18.2.0",                       // ✅ USADO
    "react-dom": "^18.2.0",                   // ✅ USADO
    "react-router-dom": "^7.9.6",             // ✅ USADO
    "zustand": "^5.0.8"                       // ✅ USADO
  }
}
```

### 1. Dependencias No Utilizadas

**Problema**:
- `@tanstack/react-query`: Instalado pero no se usa (se usa Zustand para todo)
- `@tanstack/react-virtual`: Instalado pero no se usa (NO hay virtualización implementada)
- `axios`: Instalado pero no se usa (se usa `fetch` nativo)

**Impacto**:
- Bundle size innecesariamente grande
- Confusión para nuevos desarrolladores
- Posibles vulnerabilidades de seguridad

**Recomendación**:
```bash
# Eliminar dependencias no usadas
npm uninstall @tanstack/react-query axios

# MANTENER @tanstack/react-virtual para implementar virtualización (ALTA PRIORIDAD)
```

**Severidad**: MEDIA
**Esfuerzo**: Bajo (5 minutos)

---

### 2. Versiones de React Desactualizadas

**Problema**:
```json
"react": "^18.2.0"  // Actual: 18.3.1
```

React 18.3.x tiene mejoras de performance y bug fixes.

**Recomendación**:
```bash
npm install react@latest react-dom@latest
npm install --save-dev @types/react@latest @types/react-dom@latest
```

**Severidad**: BAJA
**Esfuerzo**: Bajo (10 minutos + testing)

---

### 3. Falta de Herramientas de Calidad

**Problema**:
No hay:
- ESLint
- Prettier
- Husky (pre-commit hooks)
- lint-staged

**Recomendación**:
```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
npm install --save-dev husky lint-staged

# .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ]
}

# .prettierrc
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}

# package.json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json}\"",
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

**Severidad**: MEDIA
**Esfuerzo**: Medio (2-3 horas)

---

### 4. No Hay Monitoreo de Bundle Size

**Recomendación**:
```bash
npm install --save-dev vite-plugin-visualizer

# vite.config.ts
import { visualizer } from 'vite-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

**Severidad**: BAJA
**Esfuerzo**: Bajo (15 minutos)

---

## Código Muerto y Variables Sin Usar

### 1. Dashboard.tsx Sin Uso

**Ubicación**: `src/pages/Dashboard.tsx`

**Problema**:
Archivo `Dashboard.tsx` existe pero NO está usado en las rutas de `App.tsx`.

**Recomendación**:
Eliminar si no se usa, o documentar si es para futuro uso.

```bash
# Si no se usa
rm src/pages/Dashboard.tsx

# Si es para futuro
# Agregar comentario en el archivo
/**
 * @deprecated This file is not currently in use
 * @todo Implement Dashboard feature in FASE 3
 */
```

**Severidad**: BAJA
**Esfuerzo**: Bajo (5 minutos)

---

### 2. api.ts vs admin-client.ts

**Ubicación**:
- `src/services/api.ts` (endpoints de simulación)
- `src/lib/api/admin-client.ts` (endpoints administrativos)

**Problema**:
Dos clientes API diferentes con responsabilidades superpuestas.

**Clarificación**:
- `api.ts`: Endpoints de **simulación** (/simulate/*)
- `admin-client.ts`: Endpoints **administrativos** (/admin/*)

**Estado**: ✅ No es código duplicado, son dominios diferentes.

---

### 3. handleApiError Sin Uso

**Ubicación**: `src/services/api.ts:234-240`

**Problema**:
```typescript
private handleApiError(error: unknown, context: string): never {
  if (error instanceof Error) {
    throw new Error(`${context}: ${error.message}`);
  }
  throw new Error(`${context}: Unknown error`);
}
```

Método definido pero **NUNCA** se usa en la clase.

**Recomendación**:
Eliminar o usar en los catch blocks:

```typescript
async getHealth(): Promise<HealthStatus> {
  try {
    const response = await fetch(`${this.baseUrl}/health`);
    // ...
  } catch (error) {
    this.handleApiError(error, 'Health check');
  }
}
```

**Severidad**: BAJA
**Esfuerzo**: Bajo (10 minutos)

---

### 4. Imports Sin Uso en Types

**Ubicación**: `src/types/index.ts:3-6`

**Problema**:
```typescript
/**
 * Frontend Types for INHOST
 * CONTRATO ESTRICTO - Basado en MessageEnvelope del backend
 * https://github.com/harvan88/inhost.git
 * Referencia: packages/shared/src/types/message-envelope.ts
 */
```

Comentario hace referencia a `packages/shared/src/types/message-envelope.ts` pero NO está en el proyecto (probablemente es del backend).

**Recomendación**:
Actualizar comentario:

```typescript
/**
 * Frontend Types for INHOST
 * CONTRATO ESTRICTO - Basado en MessageEnvelope del backend
 * Backend Repo: https://github.com/harvan88/inhost.git
 * Referencia: Backend packages/shared/src/types/message-envelope.ts
 *
 * IMPORTANTE: Mantener sincronizado con el backend.
 * Si el backend cambia MessageEnvelope, actualizar aquí también.
 */
```

**Severidad**: BAJA
**Esfuerzo**: Bajo (2 minutos)

---

## Inconsistencias entre Módulos

### 1. Conversación entityId vs endUserId

**Ubicación**:
- `src/types/index.ts:365-384` (Conversation usa `endUserId`)
- `src/services/database.ts:365` (usa `entityId`)
- `src/components/workspace/WorkspaceTab` (usa `entityId`)

**Problema**:
```typescript
// types/index.ts
export interface Conversation {
  id: string;
  endUserId: string;  // ← Backend usa endUserId
  // ...
}

// database.ts:365
const conversation: Conversation = {
  id: conversationId,
  entityId: lastMsg.metadata.from,  // ← ERROR: Propiedad no existe
  // ...
};

// workspace.ts:11
export interface WorkspaceTab {
  id: string;
  type: 'conversation' | 'order' | 'customer_profile' | ...;
  label: string;
  entityId: string;  // ← Usa entityId (genérico)
  // ...
}
```

**Impacto**:
- Error de TypeScript
- Inconsistencia conceptual
- Confusión para desarrolladores

**Recomendación**:
Usar `endUserId` consistentemente:

```typescript
// database.ts
const conversation: Conversation = {
  id: conversationId,
  endUserId: lastMsg.metadata.from,  // ✅ Correcto
  // ...
};

// workspace.ts - Mantener entityId (es genérico para diferentes tipos)
export interface WorkspaceTab {
  id: string;
  type: 'conversation' | 'order' | 'customer_profile';
  label: string;
  entityId: string;  // Para conversations: endUserId, para orders: orderId, etc.
  // ...
}
```

**Severidad**: ALTA (error de compilación potencial)
**Esfuerzo**: Bajo (30 minutos)

---

### 2. Inconsistencia en Manejo de Errores de API

**Ubicación**: `src/services/api.ts` vs `src/lib/api/admin-client.ts`

**Problema**:

```typescript
// api.ts
if (!json.success || !json.data) {
  throw new Error(json.error?.message || 'Failed to send message');
}

// admin-client.ts
if (!res.ok) {
  let errorMessage = `API Error: ${res.statusText}`;
  try {
    const error = await res.json();
    errorMessage = error.error || error.message || errorMessage;
  } catch {
    // If parsing fails, use default error message
  }
  throw new Error(errorMessage);
}
```

Diferentes estrategias de error handling.

**Recomendación**:
Crear clase de error personalizada:

```typescript
// src/utils/api-error.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }

  static async fromResponse(response: Response): Promise<APIError> {
    let body: any;
    try {
      body = await response.json();
    } catch {
      body = {};
    }

    return new APIError(
      body.error?.message || body.message || response.statusText,
      response.status,
      body.error?.code,
      body.error?.details
    );
  }
}

// Uso consistente en ambos clientes
if (!response.ok) {
  throw await APIError.fromResponse(response);
}
```

**Severidad**: MEDIA
**Esfuerzo**: Medio (2-3 horas)

---

### 3. Diferentes Formatos de Logging

**Ubicación**: Múltiples archivos

**Problema**:
```typescript
// Algunos archivos usan emojis
console.log('✅ WebSocket connected');

// Otros no
console.log('Database initialized');

// Algunos usan logger service
logger.info('websocket', 'Message received', { /* ... */ });

// La mayoría usa console.log
```

**Recomendación**:
Estandarizar en logger service:

```typescript
// Reemplazar TODO console.log/error/warn por logger.*
logger.info('websocket', 'WebSocket connected', { timestamp });
logger.info('db', 'Database initialized', {});
logger.info('websocket', 'Message received', { messageId, conversationId });
```

**Severidad**: MEDIA
**Esfuerzo**: Medio (1 día)

---

## Tests Faltantes Críticos

### Estado Actual: 0% Cobertura

**Problema**: NO hay tests unitarios ni integración en todo el proyecto.

---

### Tests Críticos Requeridos

#### 1. Services Layer

**Prioridad**: CRÍTICA

##### `src/services/database.ts`

```typescript
describe('DatabaseService', () => {
  describe('addMessage', () => {
    it('should add a new message to IndexedDB', async () => {
      const message: MessageEnvelope = createMockMessage();
      await db.addMessage(message);

      const retrieved = await db.getMessage(message.id);
      expect(retrieved).toEqual(message);
    });

    it('should update message if it already exists', async () => {
      const message: MessageEnvelope = createMockMessage();
      await db.addMessage(message);

      const updated = { ...message, content: { text: 'Updated' } };
      await db.addMessage(updated);

      const retrieved = await db.getMessage(message.id);
      expect(retrieved.content.text).toBe('Updated');
    });
  });

  describe('getMessagesByConversation', () => {
    it('should return messages sorted by timestamp (newest first)', async () => {
      // ...
    });

    it('should limit results to specified count', async () => {
      // ...
    });
  });

  // ... más tests
});
```

##### `src/services/sync.ts`

```typescript
describe('SyncService', () => {
  describe('loadFromIndexedDB', () => {
    it('should hydrate Zustand store with IndexedDB data', async () => {
      // ...
    });
  });

  describe('syncFromBackend', () => {
    it('should fetch data from backend and save to IndexedDB', async () => {
      // ...
    });

    it('should handle backend errors gracefully', async () => {
      // ...
    });
  });
});
```

---

#### 2. Store Layer

**Prioridad**: ALTA

##### `src/store/index.ts`

```typescript
describe('Main Store', () => {
  describe('addMessage', () => {
    it('should add message to correct conversation', () => {
      const { actions, entities } = useStore.getState();
      const message = createMockMessage();

      actions.addMessage(message.conversationId, message);

      const messages = entities.messages.get(message.conversationId);
      expect(messages).toContainEqual(message);
    });

    it('should not add duplicate messages', () => {
      // ...
    });

    it('should update conversation lastMessage', () => {
      // ...
    });
  });

  // ... más tests
});
```

##### `src/store/workspace.ts`

```typescript
describe('Workspace Store', () => {
  describe('openTab', () => {
    it('should open tab in active container if no containerId specified', () => {
      // ...
    });

    it('should close tab if it is already active (toggle behavior)', () => {
      // ...
    });

    it('should open tab in empty container if available', () => {
      // ...
    });
  });

  describe('createContainer', () => {
    it('should not create more than 3 containers', () => {
      // ...
    });

    it('should redistribute widths equally', () => {
      // ...
    });
  });
});
```

---

#### 3. API Clients

**Prioridad**: ALTA

##### `src/lib/api/admin-client.ts`

```typescript
describe('AdminAPIClient', () => {
  describe('login', () => {
    it('should return user and tokens on successful login', async () => {
      // Mock fetch
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            user: { id: '1', email: 'test@example.com', name: 'Test' },
            tokens: { accessToken: 'token123', refreshToken: 'refresh123', expiresIn: 3600 },
          },
        }),
      });

      const response = await adminAPI.login({ email: 'test@example.com', password: 'pass' });

      expect(response.success).toBe(true);
      expect(response.data.user.email).toBe('test@example.com');
      expect(response.data.tokens.accessToken).toBe('token123');
    });

    it('should throw error on failed login', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Invalid credentials' }),
      });

      await expect(adminAPI.login({ email: 'test@example.com', password: 'wrong' }))
        .rejects.toThrow('Invalid credentials');
    });
  });

  // ... más tests
});
```

---

#### 4. Hooks

**Prioridad**: MEDIA

##### `src/hooks/useWebSocket.ts`

```typescript
describe('useWebSocket', () => {
  it('should connect to WebSocket on mount', () => {
    // ...
  });

  it('should reconnect with exponential backoff on disconnect', async () => {
    // ...
  });

  it('should call onMessage callback when message received', () => {
    // ...
  });

  it('should clean up connection on unmount', () => {
    // ...
  });
});
```

---

#### 5. Components

**Prioridad**: MEDIA

##### `src/pages/auth/LoginPage.tsx`

```typescript
describe('LoginPage', () => {
  it('should render login form', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('should call login API on form submit', async () => {
    const mockLogin = jest.spyOn(adminAPI, 'login');
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
    });
  });

  it('should show error message on login failure', async () => {
    jest.spyOn(adminAPI, 'login').mockRejectedValueOnce(new Error('Invalid credentials'));
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
```

---

#### 6. Integration Tests

**Prioridad**: ALTA

##### Flujo Completo: Login → Sync → Workspace

```typescript
describe('Login Flow Integration', () => {
  it('should complete full login flow successfully', async () => {
    // 1. Mock API responses
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            user: mockUser,
            tokens: mockTokens,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            conversations: [mockConversation],
            contacts: [mockContact],
            team: [],
            integrations: [],
          },
        }),
      });

    // 2. Render LoginPage
    render(<LoginPage />);

    // 3. Fill form and submit
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    // 4. Wait for sync to complete
    await waitFor(() => {
      expect(useStore.getState().entities.conversations.size).toBe(1);
    });

    // 5. Verify navigation to workspace
    await waitFor(() => {
      expect(window.location.pathname).toBe('/workspace');
    });
  });
});
```

---

### Test Infrastructure Setup

**Recomendación**:

```bash
# Instalar dependencias de testing
npm install --save-dev vitest @vitest/ui
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev fake-indexeddb  # Mock IndexedDB

# vite.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});

# src/test/setup.ts
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// Mock WebSocket
global.WebSocket = jest.fn(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

# package.json scripts
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Severidad**: CRÍTICA
**Esfuerzo**: Alto (2-3 semanas para cobertura >80%)

---

## Matriz de Severidad

| Categoría | Problema | Severidad | Esfuerzo | Prioridad |
|-----------|----------|-----------|----------|-----------|
| **Tests** | Sin tests | ❌ CRÍTICA | Alto | 🔥 P0 |
| **Seguridad** | JWT sin refresh tokens | ⚠️ ALTA | Medio | 🔥 P0 |
| **Performance** | Listas sin virtualización | ⚠️ ALTA | Medio | 🔥 P0 |
| **Escalabilidad** | Carga eager de conversaciones | ⚠️ ALTA | Medio | 🔥 P0 |
| **Tipado** | Type assertions peligrosos | ⚠️ ALTA | Medio | 🔥 P0 |
| **Concurrencia** | Race conditions WebSocket/HTTP | ⚠️ ALTA | Medio | 🔥 P0 |
| **Async/Await** | Missing error handling | ⚠️ ALTA | Medio | 🔴 P1 |
| **Arquitectura** | Duplicación de normalización conversationId | ⚠️ ALTA | Bajo | 🔴 P1 |
| **Inconsistencias** | entityId vs endUserId | ⚠️ ALTA | Bajo | 🔴 P1 |
| **Seguridad** | Token JWT en localStorage | ⚠️ ALTA | Alto | 🔴 P1 |
| **SOLID** | WebSocketProvider SRP violation | ⚠️ ALTA | Alto | 🟡 P2 |
| **Performance** | Bundle size sin code splitting | 🔵 MEDIA | Medio | 🟡 P2 |
| **Performance** | Re-renders innecesarios | 🔵 MEDIA | Bajo | 🟡 P2 |
| **Malas Prácticas** | console.log en producción | 🔵 MEDIA | Medio | 🟡 P2 |
| **Dependencias** | Dependencias no utilizadas | 🔵 MEDIA | Bajo | 🟡 P2 |
| **Seguridad** | No hay validación de inputs | ⚠️ ALTA | Medio | 🟡 P2 |
| **Async/Await** | No hay timeout en fetch | 🔵 MEDIA | Bajo | 🟡 P2 |
| **Escalabilidad** | Maps en Zustand no escalan | 🔵 MEDIA | Medio | 🟢 P3 |
| **Malas Prácticas** | Hardcoded strings (i18n) | 🟢 BAJA | Alto | 🟢 P3 |
| **Código Muerto** | Dashboard.tsx sin uso | 🟢 BAJA | Bajo | 🟢 P3 |
| **Concurrencia** | Multi-tab sync | 🟢 BAJA | Medio | 🟢 P3 |

---

## Plan de Acción Recomendado

### Sprint 1: Crítico (1-2 semanas)

1. ✅ Implementar tests para servicios core (database, sync, api)
2. ✅ Implementar JWT refresh tokens
3. ✅ Implementar virtualización de listas (MessageList, ConversationList)
4. ✅ Centralizar normalización de conversationId
5. ✅ Implementar type guards para WebSocket events

### Sprint 2: Alto (1-2 semanas)

1. ✅ Lazy loading de mensajes
2. ✅ Implementar error handling exhaustivo en async functions
3. ✅ Implementar sincronización con lock para evitar race conditions
4. ✅ Estandarizar uso de logger service
5. ✅ Agregar timeouts a fetch requests

### Sprint 3: Medio (2-3 semanas)

1. ✅ Code splitting y bundle optimization
2. ✅ Refactor WebSocketProvider (separar responsabilidades)
3. ✅ Refactor AdminAPIClient (separar en clientes especializados)
4. ✅ Eliminar dependencias no utilizadas
5. ✅ Agregar ESLint + Prettier + Husky

### Sprint 4: Bajo (Futuro)

1. Internacionalización (i18n)
2. Multi-tab sync con BroadcastChannel
3. Migrar Maps a objetos planos o Immer
4. Implementar capa de abstracción sobre IndexedDB
5. Limpiar código muerto

---

## Conclusión

El proyecto tiene una **arquitectura sólida** pero sufre de:
- **Falta total de tests** (CRÍTICO)
- **Problemas de seguridad** (JWT, validación)
- **Problemas de performance** (listas no virtualizadas, bundle size)
- **Deuda técnica acumulada** (console.log, dependencias no usadas)

**Recomendación General**: Priorizar tests y seguridad antes de agregar nuevas features. El proyecto está en buen camino pero necesita refuerzo en calidad y robustez.

---

**Fin de la Auditoría Técnica**

**Siguiente Paso**: Revisar con el equipo y crear tickets en el sistema de tracking de issues.
