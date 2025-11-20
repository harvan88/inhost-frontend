# INHOST Frontend - Documentación de Arquitectura

> **Frontend del sistema de chat multi-canal INHOST**
> Arquitectura modular basada en React + TypeScript + Zustand + IndexedDB

---

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura de Tres Niveles](#arquitectura-de-tres-niveles)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Capas de la Aplicación](#capas-de-la-aplicación)
5. [Flujos de Datos](#flujos-de-datos)
6. [Persistencia y Sincronización](#persistencia-y-sincronización)
7. [Comunicación en Tiempo Real](#comunicación-en-tiempo-real)
8. [Patrones de Diseño](#patrones-de-diseño)
9. [Gestión de Estado](#gestión-de-estado)
10. [Módulos y Responsabilidades](#módulos-y-responsabilidades)
11. [Diagrama de Componentes](#diagrama-de-componentes)
12. [Flujos Críticos](#flujos-críticos)

---

## Visión General

### Propósito del Sistema

INHOST Frontend es una aplicación web de chat multi-canal que permite a los agentes gestionar conversaciones desde múltiples plataformas (WhatsApp, Telegram, Web, SMS) en una interfaz unificada tipo workspace.

### Características Principales

- **Multi-tenant**: Soporta múltiples organizaciones aisladas
- **Tiempo Real**: WebSocket para mensajes instantáneos
- **Offline-First**: IndexedDB como source of truth local
- **Workspace Dinámico**: Arquitectura tipo VS Code con tabs y splits
- **Autenticación JWT**: Sistema de autenticación basado en tokens
- **Responsive**: Soporte móvil y desktop

### Principios Arquitectónicos

1. **Separation of Concerns**: Capas claramente definidas (UI, State, Services, Persistence)
2. **Single Source of Truth**: IndexedDB → Zustand → UI (flujo unidireccional)
3. **Offline-First**: La aplicación funciona sin conexión y sincroniza cuando está online
4. **Contract-Driven**: Tipos estrictos basados en contratos del backend
5. **Composable Components**: Componentes reutilizables y desacoplados

---

## Arquitectura de Tres Niveles

El workspace principal sigue una arquitectura inspirada en VS Code con tres niveles jerárquicos:

```
┌──────────────┬──────────────────┬────────────────────────────┐
│ Activity Bar │ Sidebar          │ Canvas (Lienzo)            │
│ (Nivel 1)    │ Contextual       │ (Nivel 3)                  │
│              │ (Nivel 2)        │                            │
│              │                  │ ┌────────────────────────┐ │
│  Messages    │  Conversations   │ │ Dynamic Container 1    │ │
│  Contacts    │  List            │ │ ┌──────┬──────┬─────┐ │ │
│  Tools       │                  │ │ │ Tab1 │ Tab2 │ ... │ │ │
│  Plugins     │  [Conv 1]        │ │ └──────┴──────┴─────┘ │ │
│  Settings    │  [Conv 2]        │ │                        │ │
│              │  [Conv 3]        │ │  Chat Area / Tool View │ │
│              │  ...             │ └────────────────────────┘ │
└──────────────┴──────────────────┴────────────────────────────┘
```

### Nivel 1: Activity Bar

**Ubicación**: Barra vertical izquierda fija (64px)
**Responsabilidad**: Selección de dominio principal
**Comportamiento**: Posición absoluta, nunca se desplaza (muralla inamovible)

**Dominios Disponibles**:
- 📨 **Messages**: Gestión de conversaciones
- 👥 **Contacts**: Gestión de contactos
- 🛠️ **Tools**: Herramientas del sistema (Theme Editor, DB Tools)
- 🔌 **Plugins**: Extensiones y simuladores
- ⚙️ **Settings**: Configuración (Team, Account, Integrations)

**Interacción**:
- Click en dominio activo → Toggle Sidebar
- Click en dominio diferente → Cambiar dominio + Mostrar Sidebar

### Nivel 2: Sidebar Contextual

**Ubicación**: Panel lateral izquierdo (ancho variable, default 320px)
**Responsabilidad**: Mostrar lista de entidades del dominio activo
**Contenido Dinámico**:

- **Messages Domain** → Lista de conversaciones (ConversationListItem)
- **Contacts Domain** → Lista de contactos
- **Tools Domain** → Lista de herramientas disponibles
- **Settings Domain** → Lista de configuraciones

**Características**:
- Redimensionable manualmente
- Colapsable
- Contenido 100% dependiente del Activity Bar
- Búsqueda y filtrado contextual

### Nivel 3: Canvas (Lienzo)

**Ubicación**: Área principal derecha (espacio restante)
**Responsabilidad**: Superficie estructural para múltiples Dynamic Containers

**Capacidades**:
- Múltiples contenedores dinámicos (máximo 3)
- Split views (horizontal)
- Cada contenedor puede tener múltiples tabs
- Redistribución automática de anchos

**Dynamic Container**:
```typescript
interface DynamicContainer {
  id: string;
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  width?: string; // "33.33%", "50%", "100%"
}
```

**Tipos de Tabs**:
- `conversation`: Chat area
- `order`: Gestión de pedidos
- `customer_profile`: Perfil de cliente
- `analytics`: Análisis y métricas
- `theme_editor`: Editor de temas
- `database_dev_tools`: Herramientas de desarrollo
- `team`: Gestión de equipo
- `account_settings`: Configuración de cuenta
- `integrations`: Gestión de integraciones

---

## Stack Tecnológico

### Core Framework

```json
{
  "react": "^18.2.0",
  "typescript": "^5.3.3",
  "vite": "^5.0.8"
}
```

### State Management

```json
{
  "zustand": "^5.0.8",           // Estado global con middleware
  "zustand/middleware": {
    "devtools": "✓",              // Redux DevTools integration
    "persist": "✓"                // LocalStorage persistence
  }
}
```

### Data & Networking

```json
{
  "@tanstack/react-query": "^5.90.10",  // Server state management
  "axios": "^1.13.2",                    // HTTP client
  "idb": "^8.0.3",                       // IndexedDB wrapper
  "WebSocket": "native"                  // Tiempo real
}
```

### UI & Styling

```json
{
  "tailwindcss": "^3.3.6",       // Utility-first CSS
  "lucide-react": "^0.554.0",    // Icon library
  "@tanstack/react-virtual": "^3.13.12"  // Virtualización de listas
}
```

### Routing

```json
{
  "react-router-dom": "^7.9.6"
}
```

---

## Capas de la Aplicación

### Diagrama de Capas

```
┌─────────────────────────────────────────────────────────┐
│                     PRESENTATION                         │
│  Components (UI) - Pages - Layouts                      │
│  - Stateless donde sea posible                          │
│  - Props drilling mínimo (hooks + context)              │
└─────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────┐
│                   STATE MANAGEMENT                       │
│  Zustand Stores (Global State)                          │
│  - entities: conversations, messages, contacts          │
│  - simulation: clients, extensions, stats               │
│  - ui: activeConversationId, theme, workspace           │
│  - network: connectionStatus, pendingMessages           │
└─────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────┐
│                      SERVICES                            │
│  Business Logic & Orchestration                         │
│  - api.ts: HTTP API client                              │
│  - admin-client.ts: Admin API (auth, sync, CRUD)        │
│  - sync.ts: Sincronización IndexedDB ↔ Backend          │
│  - logger.ts: Sistema de logging estructurado           │
└─────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────┐
│                    PERSISTENCE                           │
│  IndexedDB (Source of Truth Local)                      │
│  - messages: MessageEnvelope[]                          │
│  - conversations: Conversation[]                        │
│  - contacts: Contact[]                                  │
│  - sync_state: SyncMetadata                             │
└─────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────┐
│                    BACKEND API                           │
│  REST API + WebSocket                                   │
│  - HTTP: /admin/* (CRUD operations)                     │
│  - WS: /realtime (broadcasts en tiempo real)            │
└─────────────────────────────────────────────────────────┘
```

### Responsabilidades por Capa

#### 1. Presentation Layer

**Ubicación**: `src/components/`, `src/pages/`

**Responsabilidades**:
- Renderizar UI basada en props y estado
- Manejar eventos del usuario
- Delegar lógica a hooks y servicios
- Ser lo más stateless posible

**Anti-patrones a evitar**:
- Lógica de negocio en componentes
- Llamadas directas a servicios sin hooks
- Estado local excesivo que debería ser global

#### 2. State Management Layer

**Ubicación**: `src/store/`

**Responsabilidades**:
- Mantener estado global de la aplicación
- Exponer acciones para mutaciones
- Proporcionar selectores optimizados
- Persistir preferencias del usuario

**Stores Principales**:

```typescript
// Main Store (src/store/index.ts)
interface AppState {
  entities: {
    conversations: Map<string, Conversation>;
    messages: Map<string, MessageEnvelope[]>;
    contacts: Map<string, Contact>;
  };
  simulation: {
    clients: Map<string, SimulationClient>;
    extensions: Map<string, SimulationExtension>;
    stats: SimulationStats;
  };
  ui: {
    activeConversationId: string | null;
    sidebarCollapsed: boolean;
    theme: 'light' | 'dark';
    workspace?: WorkspaceState;
    typingUsers: Map<string, string[]>;
  };
  network: {
    connectionStatus: 'connected' | 'disconnected';
    pendingMessages: Set<string>;
    lastSync: Date | null;
    retryQueue: MessageEnvelope[];
  };
  actions: { /* ... */ };
}

// Workspace Store (src/store/workspace.ts)
interface WorkspaceState {
  activeActivity: 'messages' | 'contacts' | 'tools' | 'plugins' | 'settings';
  sidebarVisible: boolean;
  sidebarWidth: number;
  containers: DynamicContainer[];
  activeContainerId: string | null;
  // Actions...
}

// Auth Store (src/store/auth-store.ts)
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  // Actions...
}
```

#### 3. Services Layer

**Ubicación**: `src/services/`, `src/lib/api/`

**API Client** (`src/services/api.ts`):
- Cliente para endpoints de simulación
- Métodos: `sendClientMessage()`, `toggleClient()`, `toggleExtension()`, `getSimulationStatus()`

**Admin API Client** (`src/lib/api/admin-client.ts`):
- Cliente para API administrativa
- Autenticación: `login()`, `signup()`, `logout()`
- Sincronización: `syncInitial()`
- CRUD: conversations, messages, end-users, team, integrations
- Menciones y feedback

**Sync Service** (`src/services/sync.ts`):
- Orquesta sincronización entre IndexedDB ↔ Backend ↔ Zustand
- `loadFromIndexedDB()`: Cargar datos locales al store
- `syncFromBackend()`: Sincronizar desde API
- `initialSync()`: Flujo completo de inicialización

**Database Service** (`src/services/database.ts`):
- Wrapper de IndexedDB con `idb`
- CRUD para messages, conversations, contacts
- Derivación de datos (conversations desde messages)
- Garbage collection

**Logger Service** (`src/services/logger.ts`):
- Logging estructurado en IndexedDB
- Niveles: debug, info, warn, error, critical
- Búsqueda y filtrado

#### 4. Persistence Layer

**Ubicación**: IndexedDB (`inhost-chat-db`)

**Object Stores**:

```typescript
// messages
{
  key: string;  // message.id (UUID)
  value: MessageEnvelope;
  indexes: [
    'conversationId',
    'timestamp',
    'type',
    'channel',
    'conversationId-timestamp'
  ]
}

// conversations
{
  key: string;  // conversation.id (UUID)
  value: Conversation;
  indexes: [
    'updatedAt',
    'channel'
  ]
}

// contacts
{
  key: string;  // contact.id
  value: Contact;
}

// sync_state
{
  key: string;  // 'messages' | 'contacts' | 'conversations'
  value: {
    entity: string;
    lastSync: Date;
    lastMessageId?: string;
  }
}
```

---

## Flujos de Datos

### 1. Boot Flow (Inicialización de la App)

```
1. App.tsx monta
     ↓
2. WebSocketProvider monta
     ↓
3. Initialize logger
     ↓
4. Initialize IndexedDB (db.init())
     ↓
5. Load data from IndexedDB → Zustand Store
     ↓
6. Connect WebSocket
     ↓
7. User lands on /login or /workspace
```

### 2. Login Flow

```
LoginPage
  ↓
1. User submits credentials
  ↓
2. adminAPI.login({ email, password })
  ↓
3. Backend returns { tokens: { accessToken }, user }
  ↓
4. Store token in localStorage + Zustand (useAuthStore.setAuth())
  ↓
5. syncService.syncFromBackend()
   - Fetch conversations, contacts, team, integrations
   - Store in IndexedDB
  ↓
6. syncService.loadFromIndexedDB()
   - Hydrate Zustand Store with fresh data
  ↓
7. navigate('/workspace')
```

### 3. Message Reception Flow (WebSocket)

```
WebSocket receives 'message_received' event
  ↓
1. Parse MessageEnvelope
  ↓
2. Normalize conversationId (channel + from)
  ↓
3. Persist to IndexedDB (db.addMessage())
  ↓
4. Ensure conversation exists
   - If not → Create conversation + Save to IndexedDB
  ↓
5. Ensure contact exists
   - If not → Create contact + Save to IndexedDB
  ↓
6. Update Zustand Store (addMessage())
  ↓
7. Show toast notification (if conversation not active)
```

### 4. Message Sending Flow

```
MessageInput
  ↓
1. User types + submits
  ↓
2. adminAPI.sendMessage(conversationId, { text, contentType })
  ↓
3. Backend processes message
  ↓
4. WebSocket broadcasts 'message:new' event
  ↓
5. handleMessageNew() → Same as Message Reception Flow
```

### 5. Workspace Tab Opening Flow

```
User clicks conversation in sidebar
  ↓
1. PrimarySidebar → openTab()
  ↓
2. useWorkspaceStore → openTab(tab, containerId?)
  ↓
3. Logic:
   a. If tab is already active → Close tab (toggle behavior)
   b. If containerId not specified:
      - Find empty container
      - If no empty → Use active container
   c. If tab already exists in container → Activate it
   d. Else → Add tab to container + Activate it
  ↓
4. Canvas → Re-renders with updated tabs
  ↓
5. DynamicContainer → Renders active tab content
```

---

## Persistencia y Sincronización

### Estrategia: Offline-First

**Principio**: IndexedDB es el source of truth local. La app funciona sin conexión y sincroniza cuando está online.

### Flujo de Sincronización

```
┌─────────────────┐
│   Backend API   │
└────────┬────────┘
         │ HTTP / WebSocket
         ↓
┌─────────────────┐
│   Sync Service  │ ← Orquestador
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   IndexedDB     │ ← Source of Truth Local
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Zustand Store  │ ← Estado en Memoria
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   React UI      │
└─────────────────┘
```

### Políticas de Sincronización

1. **Initial Sync** (on login):
   - Fetch all conversations, contacts, team, integrations
   - Store in IndexedDB
   - Hydrate Zustand Store

2. **Real-Time Sync** (via WebSocket):
   - New messages → Save to IndexedDB → Update Store
   - Status updates → Update IndexedDB → Update Store
   - Conversation updates → Update IndexedDB → Update Store

3. **Conflict Resolution**:
   - Backend always wins (no CRDTs yet)
   - Pending messages retry with exponential backoff

4. **Garbage Collection**:
   - Delete messages older than 30 days (configurable)
   - Triggered manually or on boot

---

## Comunicación en Tiempo Real

### WebSocket Events

**URL**: `ws://localhost:3000/realtime` (proxied by Vite)

**Eventos Recibidos** (del Backend):

| Event Type | Descripción | Handler |
|------------|-------------|---------|
| `connection` | Conexión establecida | `handleConnection()` |
| `message_received` | Nuevo mensaje de cliente | `handleMessageReceived()` |
| `message_processing` | Extensiones procesando | `handleMessageProcessing()` |
| `extension_response` | Respuesta de extensión | `handleExtensionResponse()` |
| `client_toggle` | Cliente conectado/desconectado | `handleClientToggle()` |
| `extension_toggle` | Extensión activada/desactivada | `handleExtensionToggle()` |
| `message:new` | Notificación de nuevo mensaje (FASE 1) | `handleMessageNew()` |
| `message:status` | Estado de mensaje actualizado | `handleMessageStatus()` |
| `typing:indicator` | Usuario escribiendo | `handleTypingIndicator()` |
| `conversation:read` | Conversación marcada como leída | `handleConversationRead()` |
| `conversation:updated` | Conversación actualizada | `handleConversationUpdated()` |
| `error` | Error del servidor (rate limiting, etc.) | `handleError()` |

**Eventos Enviados** (al Backend):

| Event Type | Payload | Propósito |
|------------|---------|-----------|
| `typing:indicator` | `{ conversationId, userId, isTyping, timestamp }` | Notificar que usuario está escribiendo |

### Reconexión Automática

**Política**: Exponential backoff con máximo 5 intentos

```typescript
// Delay = RECONNECT_INTERVAL * 2^(attempt - 1)
// Attempt 1: 3000ms
// Attempt 2: 6000ms
// Attempt 3: 12000ms
// Attempt 4: 24000ms
// Attempt 5: 48000ms
```

**Comportamiento**:
- Conexión perdida → Auto-reconectar
- Máximo 5 intentos → Show error "Connection lost. Please refresh."
- Éxito → Reset counter

---

## Patrones de Diseño

### 1. Singleton Pattern

**Uso**: Services (api, db, sync, logger)

```typescript
// src/services/database.ts
class DatabaseService {
  private db: IDBPDatabase<InhostDB> | null = null;
  // ...
}
export const db = new DatabaseService();
```

**Beneficios**:
- Única instancia compartida
- Estado centralizado
- Fácil testing (mock del singleton)

### 2. Provider Pattern

**Uso**: WebSocketProvider, ThemeProvider, ErrorBoundary

```typescript
// src/providers/WebSocketProvider.tsx
export function WebSocketProvider({ children }) {
  const [connected, setConnected] = useState(false);
  // ... WebSocket logic

  return (
    <WebSocketContext.Provider value={{ connected, sendTyping }}>
      {children}
    </WebSocketContext.Provider>
  );
}
```

**Beneficios**:
- Dependencias inyectadas vía Context
- Acceso mediante hooks: `useWebSocketContext()`

### 3. Custom Hooks Pattern

**Uso**: Encapsular lógica reutilizable

```typescript
// src/hooks/useWebSocket.ts
export function useWebSocket(options: UseWebSocketOptions) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => { /* ... */ }, []);
  const sendMessage = (data: any) => { /* ... */ };

  return { connected, sendMessage };
}
```

**Ejemplos en el proyecto**:
- `useWebSocket()`: Gestión de WebSocket
- `useToast()`: Sistema de notificaciones
- `useResizeObserver()`: Detección de cambios de tamaño
- `useBreakpoint()`: Responsive breakpoints
- `useCombinedRefs()`: Combinar múltiples refs

### 4. Observer Pattern

**Uso**: Zustand (observa cambios de estado)

```typescript
// Components subscribe to store changes
const conversations = useStore((state) => state.entities.conversations);

// Store notifies all subscribers when state changes
useStore.setState({ /* new state */ });
```

### 5. Adapter Pattern

**Uso**: Conversión de tipos backend → frontend

```typescript
// Convertir EndUser (backend) a Contact (frontend)
const contactData: Contact = {
  id: contact.id,
  name: contact.name,
  status: 'offline',
  channel: 'whatsapp',
  metadata: {
    email: contact.email,
    phoneNumber: contact.phone,
  },
};
```

---

## Gestión de Estado

### Zustand Stores

#### Main Store (`src/store/index.ts`)

**Dominios**:

1. **entities**: Datos persistidos en IndexedDB
   - `conversations: Map<string, Conversation>`
   - `messages: Map<string, MessageEnvelope[]>`
   - `contacts: Map<string, Contact>`

2. **simulation**: Estado efímero de la API
   - `clients: Map<string, SimulationClient>`
   - `extensions: Map<string, SimulationExtension>`
   - `stats: SimulationStats`

3. **ui**: Estado efímero de UI
   - `activeConversationId: string | null`
   - `sidebarCollapsed: boolean`
   - `theme: 'light' | 'dark'`
   - `workspace?: WorkspaceState`
   - `typingUsers: Map<string, string[]>`

4. **network**: Estado transitorio de red
   - `connectionStatus: 'connected' | 'disconnected'`
   - `pendingMessages: Set<string>`
   - `lastSync: Date | null`
   - `retryQueue: MessageEnvelope[]`

**Actions**:

```typescript
// Conversations
setActiveConversation(id: string | null)
addConversation(conversation: Conversation)
updateConversation(id: string, updates: Partial<Conversation>)

// Messages
addMessage(conversationId: string, message: MessageEnvelope)
setMessages(conversationId: string, messages: MessageEnvelope[])

// Contacts
addContact(contact: Contact)
updateContact(id: string, updates: Partial<Contact>)

// Simulation
updateSimulationState(state: Partial<SimulationState>)
toggleClient(clientId: string)
toggleExtension(extensionId: string)

// UI
toggleSidebar()
setTheme(theme: 'light' | 'dark')
setTyping(conversationId: string, userId: string, isTyping: boolean)

// Network
setConnectionStatus(status: 'connected' | 'disconnected')
addPendingMessage(messageId: string)
removePendingMessage(messageId: string)
updateLastSync(timestamp: Date)
```

#### Workspace Store (`src/store/workspace.ts`)

**Responsabilidad**: Gestionar layout del workspace (Activity Bar, Sidebar, Canvas)

**State**:

```typescript
{
  // Nivel 1: Activity Bar
  activeActivity: 'messages' | 'contacts' | 'tools' | 'plugins' | 'settings';

  // Nivel 2: Sidebar
  sidebarVisible: boolean;
  sidebarWidth: number;

  // Nivel 3: Canvas
  containers: DynamicContainer[];
  activeContainerId: string | null;
}
```

**Actions**:

```typescript
// Activity Bar
setActivity(activity: ActivityType)

// Sidebar
toggleSidebar()
setSidebarWidth(width: number)

// Canvas - Container Management
createContainer()
closeContainer(containerId: string)
setActiveContainer(containerId: string)
duplicateContainer(containerId: string)
adjustContainerWidths()

// Canvas - Tab Management
openTab(tab: WorkspaceTab, containerId?: string)
closeTab(tabId: string, containerId?: string)
setActiveTab(tabId: string, containerId?: string)
```

**Persistencia**:

```typescript
// Solo persistir preferencias básicas (no tabs)
partialize: (state) => ({
  activeActivity: state.activeActivity,
  sidebarVisible: state.sidebarVisible,
  sidebarWidth: state.sidebarWidth,
})
```

#### Auth Store (`src/store/auth-store.ts`)

**Responsabilidad**: Gestionar autenticación y usuario actual

**State**:

```typescript
{
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}
```

**Actions**:

```typescript
setAuth(token: string, user: User)
logout()
updateUser(userData: Partial<User>)
```

**Persistencia**:

```typescript
// Solo persistir user data (no token por seguridad)
partialize: (state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated
})

// Rehydrate token from localStorage on load
onRehydrateStorage: () => (state) => {
  const token = localStorage.getItem('inhost_admin_token');
  if (token && state.isAuthenticated) {
    state.token = token;
  }
}
```

---

## Módulos y Responsabilidades

### Directorio `src/components/`

#### `src/components/auth/`
- **ProtectedRoute.tsx**: HOC para rutas autenticadas

#### `src/components/chat/`
- **ChatArea.tsx**: Contenedor principal del chat
- **ChatHeader.tsx**: Header con info de conversación
- **MessageInput.tsx**: Input para escribir mensajes
- **MessageList.tsx**: Lista virtualizada de mensajes

#### `src/components/common/`
- **Avatar.tsx**: Avatar con fallback
- **Badge.tsx**: Badge numérico
- **StatusIndicator.tsx**: Indicador de estado (online/offline)
- **parseSpacing.tsx**: Utilidad para parsing de spacing

#### `src/components/feedback/`
- **ErrorBoundary.tsx**: Captura errores de React
- **Toast.tsx**: Componente de notificación
- **ToastContainer.tsx**: Contenedor de toasts
- **Skeleton.tsx**: Loading skeletons
- **ChatAreaSkeleton.tsx**: Skeleton para chat
- **ConversationListSkeleton.tsx**: Skeleton para lista
- **MessageFeedback.tsx**: Sistema de feedback de mensajes

#### `src/components/layout/`
- **Header.tsx**: Header global
- **StatusCard.tsx**: Card de estado del sistema

#### `src/components/mentions/`
- **MentionsBadge.tsx**: Badge de menciones no leídas

#### `src/components/mobile/`
- **Drawer.tsx**: Drawer para móvil
- **MobileHeader.tsx**: Header móvil
- **MobileWorkspace.tsx**: Layout móvil del workspace

#### `src/components/settings/`
- **AccountSettingsArea.tsx**: Configuración de cuenta
- **IntegrationsArea.tsx**: Gestión de integraciones
- **TeamArea.tsx**: Gestión de equipo

#### `src/components/tools/`
- **DatabaseDevToolsArea.tsx**: Herramientas de desarrollo
- **ThemeEditorArea.tsx**: Editor de temas visuales
- **theme-editor/**: Editores específicos (colors, typography, spacing, etc.)

#### `src/components/ui/`
- **Button.tsx**: Botón reutilizable
- **Card.tsx**: Card contenedor
- **Heading.tsx**: Tipografía de headings
- **IconButton.tsx**: Botón con icono
- **Input.tsx**: Input de texto
- **ListCard.tsx**: Card para listas
- **Tag.tsx**: Tag/chip
- **Text.tsx**: Tipografía de texto

#### `src/components/workspace/`
- **ActivityBar.tsx**: Barra de actividades (Nivel 1)
- **PrimarySidebar.tsx**: Sidebar contextual (Nivel 2)
- **Canvas.tsx**: Lienzo con contenedores (Nivel 3)
- **DynamicContainer.tsx**: Contenedor con tabs
- **ConversationListItem.tsx**: Item de conversación
- **ToolPanels.tsx**: Paneles de herramientas
- **Workspace.tsx**: Orquestador principal

### Directorio `src/hooks/`

- **useBreakpoint.ts**: Hook para responsive breakpoints
- **useCombinedRefs.ts**: Combinar múltiples refs
- **useOverflowDetection.ts**: Detectar overflow en contenedores
- **useResizeObserver.ts**: Observer de cambios de tamaño
- **useToast.ts**: Hook para sistema de notificaciones
- **useWebSocket.ts**: Hook para WebSocket (bajo nivel)

### Directorio `src/services/`

- **api.ts**: Cliente API para simulación
- **database.ts**: Servicio IndexedDB
- **logger.ts**: Sistema de logging
- **sync.ts**: Sincronización IndexedDB ↔ Backend

### Directorio `src/lib/`

- **lib/api/admin-client.ts**: Cliente API administrativa
- **lib/auth/jwt.ts**: Utilidades JWT

### Directorio `src/pages/`

- **pages/Dashboard.tsx**: Dashboard principal (deprecated)
- **pages/auth/LoginPage.tsx**: Página de login
- **pages/auth/SignupPage.tsx**: Página de registro

### Directorio `src/providers/`

- **WebSocketProvider.tsx**: Provider de WebSocket con contexto

### Directorio `src/store/`

- **index.ts**: Main Zustand store
- **workspace.ts**: Workspace store
- **auth-store.ts**: Auth store

### Directorio `src/theme/`

- **ThemeProvider.tsx**: Provider de tema
- **index.ts**: Exports del tema
- **types.ts**: Tipos del sistema de temas
- **utils.ts**: Utilidades de tema

### Directorio `src/types/`

- **index.ts**: Tipos TypeScript globales (MessageEnvelope, Conversation, etc.)

### Directorio `src/utils/`

- **seedDatabase.ts**: Seed de datos para desarrollo
- **tabHelpers.ts**: Helpers para gestión de tabs

---

## Diagrama de Componentes

```
App.tsx
├─ ErrorBoundary
├─ BrowserRouter
│  ├─ Routes
│  │  ├─ /login → LoginPage
│  │  ├─ /signup → SignupPage
│  │  └─ /workspace → ProtectedRoute
│  │     └─ WebSocketProvider
│  │        └─ Workspace
│  │           ├─ ActivityBar
│  │           ├─ PrimarySidebar
│  │           │  ├─ ConversationListItem[]
│  │           │  ├─ ContactList (future)
│  │           │  └─ ToolsList (future)
│  │           └─ Canvas
│  │              └─ DynamicContainer[]
│  │                 ├─ Tabs Header
│  │                 └─ Active Tab Content
│  │                    ├─ ChatArea
│  │                    │  ├─ ChatHeader
│  │                    │  ├─ MessageList
│  │                    │  └─ MessageInput
│  │                    ├─ ThemeEditorArea
│  │                    ├─ DatabaseDevToolsArea
│  │                    ├─ TeamArea
│  │                    ├─ AccountSettingsArea
│  │                    └─ IntegrationsArea
│  └─ ToastContainer
└─ ThemeProvider
```

---

## Flujos Críticos

### 1. Flujo Completo: Usuario Envía Mensaje

```
1. Usuario escribe en MessageInput
     ↓
2. MessageInput.onSubmit()
     ↓
3. adminAPI.sendMessage(conversationId, { text, contentType })
     ↓
4. Backend recibe mensaje
     ↓
5. Backend procesa mensaje
     ↓
6. Backend emite WebSocket event: 'message:new'
     ↓
7. WebSocketProvider.handleMessageNew()
     ↓
8. Normalizar conversationId
     ↓
9. db.addMessage(message) → IndexedDB
     ↓
10. useStore.getState().actions.addMessage(conversationId, message)
     ↓
11. Zustand notifica subscribers
     ↓
12. MessageList re-renderiza con nuevo mensaje
```

### 2. Flujo Completo: Usuario Abre Conversación

```
1. Usuario hace click en ConversationListItem
     ↓
2. ConversationListItem.onClick()
     ↓
3. openTab({ type: 'conversation', entityId: conversationId, ... })
     ↓
4. useWorkspaceStore.openTab(tab)
     ↓
5. Lógica de apertura:
    a. ¿Tab ya está activa? → Cerrarla (toggle)
    b. ¿ContainerId especificado? → Usar ese
    c. ¿Contenedor vacío disponible? → Usar ese
    d. Sino → Usar contenedor activo
     ↓
6. Agregar tab al contenedor + Activar
     ↓
7. Canvas re-renderiza
     ↓
8. DynamicContainer renderiza ChatArea
     ↓
9. ChatArea.useEffect():
    - Fetch messages si no están en store
    - adminAPI.getMessages(conversationId)
    - db.addMessages(messages)
    - useStore.actions.setMessages(conversationId, messages)
     ↓
10. MessageList renderiza mensajes
```

### 3. Flujo Completo: Sincronización Initial (Login)

```
1. Usuario hace login en LoginPage
     ↓
2. adminAPI.login({ email, password })
     ↓
3. Backend devuelve { tokens: { accessToken }, user }
     ↓
4. useAuthStore.setAuth(accessToken, user)
     ↓
5. localStorage.setItem('inhost_admin_token', accessToken)
     ↓
6. syncService.syncFromBackend()
     ↓
7. adminAPI.syncInitial()
     ↓
8. Backend devuelve { conversations, contacts, team, integrations }
     ↓
9. Para cada conversation:
    - db.saveConversation(conversation)
     ↓
10. Para cada contact:
     - Convertir EndUser → Contact
     - db.saveContact(contact)
     ↓
11. Para cada conversación activa:
     - adminAPI.getMessages(conversationId, { limit: 50 })
     - db.addMessage(message) para cada mensaje
     ↓
12. syncService.loadFromIndexedDB()
     ↓
13. db.getAllConversations()
14. db.getAllContacts()
15. db.getMessagesByConversation() para cada conversación
     ↓
16. useStore.setState({ entities: { conversations, messages, contacts } })
     ↓
17. navigate('/workspace')
     ↓
18. Workspace renderiza con datos sincronizados
```

### 4. Flujo de Error Handling

```
WebSocket connection lost
     ↓
1. ws.onclose triggered
     ↓
2. setConnected(false)
3. setConnectionStatus('disconnected')
     ↓
4. Intentar reconexión con exponential backoff
     ↓
5. Si max intentos alcanzado:
    - setError('Connection lost. Please refresh.')
    - Show toast notification
     ↓
6. Si reconexión exitosa:
    - setConnected(true)
    - setConnectionStatus('connected')
    - reconnectAttemptsRef.current = 0
```

---

## Consideraciones de Performance

### 1. Virtualización de Listas

**Problema**: Renderizar 1000+ mensajes o conversaciones causa lag.

**Solución**: `@tanstack/react-virtual`

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: messages.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80, // altura estimada por item
  overscan: 5, // items extra a renderizar
});
```

**Aplicado en**:
- MessageList: Lista de mensajes
- ConversationList: Lista de conversaciones

### 2. Memoización

**Uso**: `React.memo()`, `useMemo()`, `useCallback()`

```typescript
// Memorizar componentes pesados
export default React.memo(ConversationListItem);

// Memorizar cálculos costosos
const sortedMessages = useMemo(() => {
  return messages.sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}, [messages]);

// Memorizar callbacks
const handleClick = useCallback(() => {
  openTab({ type: 'conversation', entityId: id });
}, [id, openTab]);
```

### 3. Zustand Selectors

**Problema**: Re-renders innecesarios cuando cambia estado no relacionado.

**Solución**: Selectores específicos

```typescript
// ❌ BAD: Re-renderiza cuando cualquier parte del store cambia
const state = useStore();

// ✅ GOOD: Solo re-renderiza cuando conversations cambia
const conversations = useStore((state) => state.entities.conversations);
```

### 4. Lazy Loading de Componentes

```typescript
const ThemeEditorArea = lazy(() => import('./components/tools/ThemeEditorArea'));
const DatabaseDevToolsArea = lazy(() => import('./components/tools/DatabaseDevToolsArea'));

<Suspense fallback={<Skeleton />}>
  <ThemeEditorArea />
</Suspense>
```

### 5. IndexedDB Batch Operations

```typescript
// ❌ BAD: Múltiples transacciones
for (const message of messages) {
  await db.addMessage(message);
}

// ✅ GOOD: Una transacción
await db.addMessages(messages);
```

---

## Seguridad

### 1. Autenticación JWT

**Flow**:
1. Login → Backend devuelve `accessToken` + `refreshToken`
2. Store `accessToken` en localStorage
3. Enviar en header `Authorization: Bearer <token>`

**Validación**:
```typescript
// lib/auth/jwt.ts
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload?.exp) return true;
  return payload.exp < Math.floor(Date.now() / 1000);
}
```

**Protected Routes**:
```typescript
<Route path="/workspace" element={
  <ProtectedRoute>
    <Workspace />
  </ProtectedRoute>
} />
```

### 2. XSS Prevention

**Medidas**:
- React escapa strings por defecto
- No usar `dangerouslySetInnerHTML` sin sanitización
- Validar inputs del usuario

### 3. CSRF Protection

**Medidas**:
- Tokens JWT stateless (no cookies)
- CORS configurado en backend
- Vite proxy solo en desarrollo

### 4. Secrets Management

**Reglas**:
- Nunca commitear `.env`
- Variables de entorno: `VITE_API_BASE_URL`, `VITE_WS_URL`
- Token JWT en localStorage (no en código)

---

## Testing (Pendiente)

### Estrategia Recomendada

1. **Unit Tests**: Vitest + Testing Library
   - Services (api, db, sync)
   - Hooks (useWebSocket, useToast)
   - Utilities

2. **Integration Tests**: Testing Library
   - Componentes con store
   - Flujos completos (login, enviar mensaje)

3. **E2E Tests**: Playwright
   - Flujo de usuario completo
   - Multi-browser

---

## Roadmap de Arquitectura

### FASE 1: Core Functionality ✅
- [x] WebSocket + IndexedDB
- [x] Authentication
- [x] Basic chat functionality
- [x] Workspace layout

### FASE 2: Optimization (Current)
- [ ] Virtualización de listas
- [ ] Code splitting
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)

### FASE 3: Advanced Features
- [ ] Multi-tab sync (BroadcastChannel)
- [ ] Service Worker (offline support)
- [ ] Push notifications
- [ ] CRDTs para conflict resolution

### FASE 4: Testing & Documentation
- [ ] Unit tests (80% coverage)
- [ ] Integration tests
- [ ] E2E tests
- [ ] Storybook para componentes

---

## Referencias

- [React Docs](https://react.dev/)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Última Actualización**: 2025-01-20
**Versión**: 1.0.0
**Autor**: Equipo INHOST
