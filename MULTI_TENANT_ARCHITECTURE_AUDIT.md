# Auditoría Exhaustiva: Arquitectura Multi-Tenant - INHOST Frontend

**Fecha de Auditoría**: 2025-11-19  
**Rama**: claude/tenant-architecture-audit-01WLsc9cHNUQG36G88rRvb4J  
**Alcance**: Frontend React + Zustand + IndexedDB  
**Estado Actual**: ❌ Sin soporte multi-tenant  

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estructura Actual - Base de Datos](#estructura-actual---base-de-datos)
3. [Backend - Gestión de Tenant](#backend---gestión-de-tenant)
4. [Frontend - Gestión de Tenant](#frontend---gestión-de-tenant)
5. [Seguridad](#seguridad)
6. [Configuración y Variables de Entorno](#configuración-y-variables-de-entorno)
7. [Hallazgos Críticos](#hallazgos-críticos)
8. [Recomendaciones](#recomendaciones)

---

## Resumen Ejecutivo

### Estado Actual: ❌ **NO HAY SOPORTE MULTI-TENANT**

**Este es un frontend monousuario/monotenant sin mecanismo de aislamiento de datos por tenant.**

**Líneas de código**: 5,379 TS/TSX (69 archivos)  
**Arquitectura**: Frontend delgado (cliente React) + Backend remoto  
**Persistencia**: IndexedDB local + API REST + WebSocket  

### Hallazgos Principales

| Área | Estado | Severidad | Nota |
|------|--------|-----------|------|
| **Aislamiento de datos por tenant** | ❌ No existe | CRÍTICO | No hay campos tenantId en modelos |
| **Contexto de tenant en frontend** | ❌ No existe | CRÍTICO | No hay tenant context/provider |
| **Validación de tenant en API calls** | ❌ No existe | CRÍTICO | Sin headers de autorización |
| **Protección de rutas por tenant** | ❌ No existe | CRÍTICO | Cualquier usuario ve todos los datos |
| **Autenticación** | ❌ No implementada | CRÍTICO | Sistema sin autenticación |
| **Autorización** | ❌ No implementada | CRÍTICO | Sin validación de permisos |
| **Variables de entorno multi-tenant** | ❌ No existe | ALTO | Sin config de tenant |

---

## Estructura Actual - Base de Datos

### 📁 Modelos de Datos (Tipos TypeScript)

**Archivo**: `/home/user/inhost-frontend/src/types/index.ts` (448 líneas)

#### 1. MessageEnvelope (Contrato Estricto)

```typescript
export interface MessageEnvelope {
  id: string;                    // UUID (globalmente único)
  conversationId: string;        // UUID de conversación
  type: MessageType;             // 'incoming' | 'outgoing' | 'system'
  channel: ChannelType;          // 'whatsapp' | 'telegram' | 'web'
  
  content: {
    text?: string;
    contentType: string;
    media?: { url, type, caption };
    location?: { latitude, longitude };
    buttons?: Array<{ id, text, type }>;
  };
  
  metadata: {
    from: string;               // ID del remitente
    to: string;                 // ID del destinatario
    timestamp: string;          // ISO 8601
    messageId?: string;
    conversationId?: string;
    ownerId?: string;          // ⚠️ Campo incompleto
    platformMessageId?: string;
    extensionId?: string;
    originalMessageId?: string;
    [key: string]: unknown;    // Metadata extensible
  };
  
  statusChain: Array<{
    status: MessageStatus;
    timestamp: string;
    messageId: string;
    details?: string;
  }>;
  
  context: {
    plan: PlanType;            // 'free' | 'premium'
    timestamp: string;
    source?: string;
    extension?: { id, name, latency };
    [key: string]: unknown;
  };
}

// ❌ PROBLEMA: NO HAY CAMPO "tenantId" NI "organizationId"
// - Cualquier cliente puede ver mensajes de cualquier organización
// - No hay aislamiento de datos
```

#### 2. Conversation

```typescript
export interface Conversation {
  id: string;                  // conversationId (UUID)
  entityId: string;            // Reference to Contact (metadata.from)
  channel: ChannelType;
  lastMessage?: {
    text: string;
    timestamp: string;
    type: MessageType;
  };
  unreadCount: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  
  // ❌ FALTA: tenantId, organizationId, workspaceId
}
```

#### 3. Contact

```typescript
export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  channel: ChannelType;
  metadata?: {
    phoneNumber?: string;
    email?: string;
    lastSeen?: string;
  };
  
  // ❌ FALTA: tenantId, organizationId, workspaceId
}
```

#### 4. AppState (Zustand Store)

```typescript
export interface AppState {
  // DOMINIO 1: Entidades (persisten en IndexedDB)
  entities: {
    conversations: Map<string, Conversation>;
    messages: Map<string, MessageEnvelope[]>;
    contacts: Map<string, Contact>;
  };
  
  // DOMINIO 2: Simulación (efímero, desde API)
  simulation: {
    clients: Map<string, SimulationClient>;
    extensions: Map<string, SimulationExtension>;
    stats: { activeExtensions, connectedClients, ... };
  };
  
  // DOMINIO 3: UI (efímero, solo frontend)
  ui: {
    activeConversationId: string | null;
    sidebarCollapsed: boolean;
    theme: 'light' | 'dark';
    workspace?: WorkspaceState;
    typingUsers: Map<string, string[]>;
  };
  
  // DOMINIO 4: Network (transitorio, sync state)
  network: {
    connectionStatus: 'connected' | 'disconnected';
    pendingMessages: Set<string>;
    lastSync: Date | null;
    retryQueue: MessageEnvelope[];
  };
}

// ❌ PROBLEMA: Sin campo "currentTenantId" ni "tenantContext"
// Todos los datos de todas las organizaciones se cargan en el mismo store
```

### 💾 IndexedDB Schema

**Archivo**: `/home/user/inhost-frontend/src/services/database.ts` (456 líneas)

```typescript
interface InhostDB extends DBSchema {
  // ObjectStore 1: messages
  messages: {
    key: string;                    // id (UUID)
    value: MessageEnvelope;
    indexes: {
      'conversationId': string;     // Por conversación
      'timestamp': string;          // Por tiempo
      'type': string;
      'channel': string;
      'conversationId-timestamp': [string, string];
    };
  };
  
  // ObjectStore 2: contacts
  contacts: {
    key: string;                    // id
    value: Contact;
  };
  
  // ObjectStore 3: conversations
  conversations: {
    key: string;                    // conversationId (UUID)
    value: Conversation;
    indexes: {
      'updatedAt': string;
      'channel': string;
    };
  };
  
  // ObjectStore 4: sync_state
  sync_state: {
    key: string;                    // 'messages' | 'contacts'
    value: {
      entity: string;
      lastSync: Date;
      lastMessageId?: string;
    };
  };
}

// ❌ CRÍTICO: NO HAY ÍNDICE POR "tenantId"
// Consecuencias:
// 1. Query a conversaciones de un tenant es O(n) - escanea toda la BD
// 2. Imposible aislar datos por tenant de manera eficiente
// 3. Borrar datos de un tenant requiere scan completo
```

### 🔄 Sincronización de Datos

**Archivo**: `/home/user/inhost-frontend/src/services/sync.ts` (227 líneas)

```typescript
class SyncService {
  // 1. CARGA DESDE IndexedDB
  async loadFromIndexedDB(): Promise<void> {
    // Carga TODOS los datos sin filtrar por tenant
    const conversations = await db.getAllConversations();      // ⚠️ Todas
    const contacts = await db.getAllContacts();                // ⚠️ Todas
    
    for (const conversation of conversations) {
      const messages = await db.getMessagesByConversation(
        conversation.id, 
        100
      );                                                        // ⚠️ Todas
    }
    
    // 2. CARGA EN ZUSTAND STORE
    useStore.setState({
      entities: {
        conversations: conversationsMap,     // ⚠️ Datos sin filtrar
        messages: finalMessagesMap,          // ⚠️ Datos sin filtrar
        contacts: contactsMap,               // ⚠️ Datos sin filtrar
      },
    });
  }
  
  // 3. CARGA DESDE API
  async loadSimulationStatus(): Promise<void> {
    const status = await apiClient.getSimulationStatus();
    // Sin tenant filtering en el backend
  }
}

// ❌ PROBLEMA: Sin contexto de tenant
// - Todo usuario carga todos los datos de todas las organizaciones
// - Sin validación del lado del cliente
```

---

## Backend - Gestión de Tenant

### 🌍 Conexión con Backend

**Archivo**: `/home/user/inhost-frontend/vite.config.ts`

```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:3000';
  const wsUrl = env.VITE_WS_URL || 'ws://localhost:3000';

  return {
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/realtime': {
          target: wsUrl,
          ws: true,
        },
      },
    },
  };
});

// ✅ BUENO: Proxy configurado
// ❌ MALO: No hay envío de headers de autenticación/tenant
```

### 📤 API Client

**Archivo**: `/home/user/inhost-frontend/src/services/api.ts` (246 líneas)

```typescript
class ApiClient {
  // Endpoint: GET /simulate/status
  async getSimulationStatus(): Promise<SimulationStatus> {
    const response = await fetch(`${this.baseUrl}/simulate/status`);
    // ❌ PROBLEMA: Sin headers de autenticación
    // ❌ PROBLEMA: Sin tenant ID en headers/query params
    // ❌ PROBLEMA: Sin validación de respuesta
  }
  
  // Endpoint: POST /simulate/client-message
  async sendClientMessage(request: ClientMessageRequest): Promise<ClientMessageResponse> {
    const response = await fetch(`${this.baseUrl}/simulate/client-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // ❌ FALTA: 'Authorization: Bearer <token>'
        // ❌ FALTA: 'X-Tenant-ID: <tenant-id>'
      },
      body: JSON.stringify(request),
    });
    // ❌ Sin validación de permisos del tenant
  }
}

// ❌ CRÍTICO: Sin autenticación ni contexto de tenant
```

### 🔌 WebSocket Provider

**Archivo**: `/home/user/inhost-frontend/src/providers/WebSocketProvider.tsx` (670 líneas)

```typescript
export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/realtime';
  
  const connect = useCallback(() => {
    const ws = new WebSocket(WS_URL);
    // ❌ PROBLEMA: Sin autenticación en handshake
    // ❌ PROBLEMA: Sin tenant context en eventos
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Mensajes sin validación de tenant
      handleMessageReceived(data);
    };
  }, []);
  
  // Normalización de conversationId (sin tenant):
  const getConversationId = useCallback(
    (channel: string, from: string): string => {
      return `${channel}-${from}`;  // ❌ Colisión si hay 2 tenants
    }, 
    []
  );
}

// ❌ CRÍTICO: Sin validación de tenant en eventos WebSocket
// Ejemplo de problema:
// Usuario A (Tenant A) puede recibir mensajes de Tenant B
```

---

## Frontend - Gestión de Tenant

### 🎨 Componentes del Workspace

**Archivo**: `/home/user/inhost-frontend/src/components/workspace/Workspace.tsx` (120+ líneas)

```typescript
export default function Workspace() {
  // ❌ FALTA: TenantProvider o TenantContext
  // ❌ FALTA: Verificación de tenant activo
  
  return (
    <div style={{ /* layout */ }}>
      <ActivityBar />
      <PrimarySidebar />
      <Canvas />
      {/* Todo renderiza sin validar tenant */}
    </div>
  );
}

// ❌ PROBLEMA: Sin aislamiento de vista por tenant
```

### 🏪 Zustand Store

**Archivo**: `/home/user/inhost-frontend/src/store/index.ts` (362 líneas)

```typescript
export const useStore = create<AppState>()(
  devtools(
    (set, get) => ({
      entities: {
        conversations: new Map(),
        messages: new Map(),
        contacts: new Map(),
        // ❌ FALTA: tenantId como propiedad del store
        // ❌ FALTA: Método para cambiar tenant activo
      },
      
      actions: {
        addMessage: (conversationId, message) => {
          // Sin validar tenant del mensaje
          set((state) => ({
            entities: {
              messages: new Map(state.entities.messages).set(
                conversationId,
                [...existing, message],
              ),
            },
          }));
        },
      },
    }),
    { name: 'inhost-store' }
  )
);

// ❌ CRÍTICO: Sin tenant context en acciones
// Cualquier componente puede agregar datos de cualquier tenant
```

### 🔑 Workspace Store (Layout)

**Archivo**: `/home/user/inhost-frontend/src/store/workspace.ts` (381 líneas)

```typescript
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      activeActivity: 'messages',
      sidebarVisible: true,
      sidebarWidth: 320,
      containers: [{ id: 'container-1', tabs: [], activeTabId: null }],
      activeContainerId: 'container-1',
      
      // ❌ FALTA: currentTenantId
      // ❌ FALTA: availableTenants
      // ❌ FALTA: switchTenant() action
    }),
    {
      name: 'inhost-workspace',
      // Persiste en localStorage sin encriptación
      partialize: (state) => ({
        activeActivity: state.activeActivity,
        sidebarVisible: state.sidebarVisible,
        sidebarWidth: state.sidebarWidth,
      }),
    }
  )
);

// ❌ PROBLEMA: Estado de workspace sin contexto multi-tenant
```

### 📱 Componentes de UI

**Archivos Revisados**:
- `/home/user/inhost-frontend/src/components/chat/ChatArea.tsx`
- `/home/user/inhost-frontend/src/components/chat/MessageList.tsx`
- `/home/user/inhost-frontend/src/components/chat/MessageInput.tsx`
- `/home/user/inhost-frontend/src/components/workspace/PrimarySidebar.tsx`
- `/home/user/inhost-frontend/src/components/workspace/ConversationListItem.tsx`

```typescript
// ❌ PATRÓN GENERAL: Ningún componente valida tenant
// Ejemplo: ChatArea.tsx
export default function ChatArea({ conversationId }: { conversationId: string }) {
  const conversation = useConversation(conversationId);
  const messages = useMessages(conversationId);
  
  // ❌ Sin validar que conversation pertenece al tenant actual
  // ❌ Sin validar permisos del usuario en esta conversación
}

// ❌ FALTA: useCurrentTenant() hook
// ❌ FALTA: useTenantPermissions(conversationId) hook
// ❌ FALTA: <TenantGuard /> wrapper
```

---

## Seguridad

### 🔐 Autenticación

**Estado**: ❌ **NO IMPLEMENTADA**

```typescript
// ❌ NO HAY:
// - Login form
// - Token storage
// - Session management
// - Auth provider/context
// - Protected routes
// - Logout mechanism

// El sistema asume un usuario anónimo
// TODO: Ver qué hace el backend para validar usuarios
```

### 🛡️ Autorización

**Estado**: ❌ **NO IMPLEMENTADA**

```typescript
// ❌ NO HAY:
// - Role-based access control (RBAC)
// - Permission checking
// - Tenant membership validation
// - Resource ownership verification

// Ejemplo de vulnerabilidad:
// Usuario A puede acceder a datos de Usuario B
// si conoce el conversationId (IDOR - Insecure Direct Object References)

// Requisitos para multi-tenant:
// 1. ✅ Verificar que user pertenece al tenant
// 2. ✅ Verificar que conversation pertenece al tenant
// 3. ✅ Verificar que user tiene permiso para ver conversation
// 4. ✅ Enmascarar datos de otros tenants
```

### 🔒 Aislamiento de Datos

**Estado**: ❌ **NO EXISTE**

```typescript
// Problema: Sin aislamiento
// Si el backend devuelve todas las conversaciones,
// el frontend las renderiza todas.

// Requisito 1: Row-Level Security (RLS) en BD
// SELECT * FROM conversations 
// WHERE tenant_id = current_user.tenant_id

// Requisito 2: Validación en API responses
// Backend debe filtrar por tenant:
[
  {
    "id": "conv-123",
    "tenantId": "tenant-a",  // ✅ Incluir en respuesta
    "entityId": "contact-456",
    // ...
  }
]

// Requisito 3: Validación en frontend
// Antes de agregar a store:
const tenantId = message.tenantId;  // ✅ Obtener
const currentTenant = useCurrentTenant();
if (tenantId !== currentTenant.id) {
  throw new Error('Tenant mismatch');  // ✅ Rechazar
}
```

### 🔑 Gestión de Tokens

**Estado**: ❌ **NO IMPLEMENTADA**

```typescript
// Requisitos:
// 1. ❌ Almacenar token de autenticación
// 2. ❌ Enviar token en headers Authorization
// 3. ❌ Refrescar token antes de expirar
// 4. ❌ Limpiar token al logout
// 5. ❌ Validar token en cliente (decodificar JWT)

// Ejemplo de implementación requerida:
class AuthService {
  setToken(token: string) {
    // ✅ Guardar en memoria (no localStorage para XSS)
    // ✅ Extraer tenant_id del JWT
    // ✅ Validar firma del JWT
  }
  
  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'X-Tenant-ID': `${this.tenantId}`,
    };
  }
  
  logout() {
    // ✅ Limpiar token
    // ✅ Limpiar datos de IndexedDB
    // ✅ Redirigir a login
  }
}
```

### 🚨 Validación de Permisos Cross-Tenant

**Estado**: ❌ **CRÍTICO**

```typescript
// Escenario de ataque: Token smuggling
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 1. Usuario A accede a http://localhost:5173/?conv=conv-tenant-b
// 2. Frontend carga conversationId="conv-tenant-b"
// 3. Hace request: GET /api/conversations/conv-tenant-b
// 4. Backend devuelve datos SIN validar tenant
// 5. Frontend renderiza datos de Tenant B

// Solución 1: Validar en backend
// - Solo devolver conversaciones del tenant del usuario
// - Verificar ownership antes de cada operación
// - Usar Row-Level Security en PostgreSQL

// Solución 2: Validar en frontend
// - Extraer tenantId del JWT
// - Verificar tenantId en cada objeto antes de renderizar
// - Rechazar datos que no pertenecen al tenant actual
```

---

## Configuración y Variables de Entorno

### 📝 Archivo .env.example

**Ruta**: `/home/user/inhost-frontend/.env.example`

```env
# ✅ ACTUAL
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/realtime
VITE_MAX_MESSAGE_LENGTH=4096
VITE_WS_RECONNECT_ATTEMPTS=5
VITE_WS_RECONNECT_INTERVAL=3000
VITE_ENABLE_WEBSOCKET=true
VITE_ENABLE_NOTIFICATIONS=false
VITE_LOG_LEVEL=debug

# ❌ FALTA PARA MULTI-TENANT:
# - VITE_AUTH_URL (URL de servicio de autenticación)
# - VITE_CURRENT_TENANT_ID (tenant actual en dev)
# - VITE_ENABLE_TENANT_SWITCHING (permitir cambiar tenant)
# - VITE_SECURE_STORAGE (usar sessionStorage vs localStorage)
# - VITE_LOGOUT_URL (redirigir después de logout)
```

### 🔑 Variables de Entorno Requeridas para Multi-Tenant

```typescript
// Interface para env vars
interface TenantConfig {
  // Autenticación
  authUrl: string;                    // ❌ FALTA
  loginPath: string;                  // ❌ FALTA (/login)
  logoutPath: string;                 // ❌ FALTA (/logout)
  
  // Tenant
  currentTenantId: string;             // ❌ FALTA (en dev)
  tenantApiUrl: string;                // ❌ FALTA (obtener tenants disponibles)
  
  // Seguridad
  secureStorage: 'localStorage' | 'sessionStorage'; // ❌ FALTA
  requireHttpsForAuth: boolean;        // ❌ FALTA
  tokenExpiry: number;                 // ❌ FALTA (ms)
  
  // Multi-tenant features
  enableTenantSwitching: boolean;      // ❌ FALTA
  enableMultipleTenants: boolean;      // ❌ FALTA
}

// Ejemplo .env para multi-tenant:
VITE_AUTH_URL=http://localhost:3000/auth
VITE_LOGIN_PATH=/login
VITE_LOGOUT_PATH=/logout
VITE_TENANT_API_URL=http://localhost:3000/api/tenants
VITE_SECURE_STORAGE=sessionStorage
VITE_REQUIRE_HTTPS_FOR_AUTH=false
VITE_TOKEN_EXPIRY=3600000
VITE_ENABLE_TENANT_SWITCHING=true
VITE_ENABLE_MULTIPLE_TENANTS=true
```

---

## Hallazgos Críticos

### 🚨 Vulnerabilidades de Seguridad

#### 1. **Insecure Direct Object References (IDOR)**
- **Severidad**: 🔴 CRÍTICO
- **Línea**: Toda la aplicación
- **Descripción**: Acceso a recursos sin validación de propietario
- **Ejemplo**:
  ```typescript
  // Cualquiera puede hacer
  GET /api/conversations/conv-123
  // Sin verificar si pertenece a su tenant
  ```
- **Impacto**: Exposición de datos privados entre tenants

#### 2. **Sin Autenticación**
- **Severidad**: 🔴 CRÍTICO
- **Línea**: Archivos `/services/api.ts`, `/providers/WebSocketProvider.tsx`
- **Descripción**: Ningún mecanismo de login/logout
- **Impacto**: Cualquiera puede acceder a cualquier dato

#### 3. **Sin Validación de Tenant en Frontend**
- **Severidad**: 🔴 CRÍTICO
- **Línea**: Zustand store `/store/index.ts`
- **Descripción**: Datos de diferentes tenants se mezclan
- **Impacto**: Cross-tenant data leakage

#### 4. **Almacenamiento Inseguro en IndexedDB**
- **Severidad**: 🟠 ALTO
- **Línea**: `/services/database.ts`
- **Descripción**: Datos sin encriptación en IndexedDB
- **Impacto**: Exposición si dispositivo es comprometido

#### 5. **WebSocket Sin Autenticación**
- **Severidad**: 🔴 CRÍTICO
- **Línea**: `/providers/WebSocketProvider.tsx:545`
- **Descripción**: Conexión WebSocket sin headers de auth
- **Impacto**: Terceros pueden conectarse y recibir eventos

#### 6. **localStorage Sin Protección**
- **Severidad**: 🟠 ALTO
- **Línea**: `/store/workspace.ts:342` (persist middleware)
- **Descripción**: Estado persistido sin encriptación
- **Impacto**: Tokens/datos sensibles en localStorage = XSS risk

### 📋 Arquitectura Sin Multi-Tenant

#### 1. **Modelos de Datos Incompletos**
- **Archivo**: `/src/types/index.ts`
- **Problema**: 
  - MessageEnvelope sin `tenantId`
  - Conversation sin `tenantId`
  - Contact sin `tenantId`
- **Impacto**: Imposible filtrar por tenant

#### 2. **IndexedDB Sin Índices de Tenant**
- **Archivo**: `/src/services/database.ts`
- **Problema**: No hay índice `tenantId` en objectStores
- **Impacto**: Queries por tenant = O(n) scan completo

#### 3. **Store Sin Contexto de Tenant**
- **Archivo**: `/src/store/index.ts`
- **Problema**: Map global de conversations/messages/contacts
- **Impacto**: Todos los datos de todos los tenants en RAM

#### 4. **Sincronización Sin Filtro**
- **Archivo**: `/src/services/sync.ts`
- **Problema**: `loadFromIndexedDB()` carga TODO sin filtrar
- **Impacto**: Performance degradado, exposición de datos

#### 5. **API Client Sin Headers**
- **Archivo**: `/src/services/api.ts`
- **Problema**: Requests sin `Authorization` ni `X-Tenant-ID`
- **Impacto**: Backend no puede validar tenant

---

## Recomendaciones

### 🎯 Fase 1: Fundación Arquitectónica (Semana 1-2)

#### 1.1 Agregar Contexto de Tenant

**Archivo a crear**: `/src/contexts/TenantContext.tsx`

```typescript
interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'premium' | 'enterprise';
}

interface TenantContextValue {
  currentTenant: Tenant | null;
  availableTenants: Tenant[];
  switchTenant: (tenantId: string) => Promise<void>;
  isLoading: boolean;
}

export const TenantContext = createContext<TenantContextValue>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  
  return (
    <TenantContext.Provider value={{ ... }}>
      {children}
    </TenantContext.Provider>
  );
}

// Hook para componentes
export function useCurrentTenant() {
  return useContext(TenantContext).currentTenant;
}
```

**Integración en App.tsx**:

```typescript
function App() {
  return (
    <TenantProvider>
      <ErrorBoundary>
        <WebSocketProvider>
          <Workspace />
        </WebSocketProvider>
      </ErrorBoundary>
    </TenantProvider>
  );
}
```

#### 1.2 Agregar AuthContext

**Archivo a crear**: `/src/contexts/AuthContext.tsx`

```typescript
interface User {
  id: string;
  email: string;
  tenantId: string;
  role: 'admin' | 'user' | 'guest';
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextValue>(null);
```

#### 1.3 Actualizar Modelos de Datos

**Archivo**: `/src/types/index.ts`

```typescript
// ✅ Agregar campos de tenant a todos los modelos

export interface MessageEnvelope {
  id: string;
  conversationId: string;
  tenantId: string;              // ✅ NUEVO
  organizationId?: string;        // ✅ NUEVO
  userId: string;                 // ✅ NUEVO
  // ... resto campos
}

export interface Conversation {
  id: string;
  tenantId: string;              // ✅ NUEVO
  organizationId?: string;        // ✅ NUEVO
  userId: string;                 // ✅ NUEVO
  // ... resto campos
}

export interface Contact {
  id: string;
  tenantId: string;              // ✅ NUEVO
  organizationId?: string;        // ✅ NUEVO
  // ... resto campos
}
```

#### 1.4 Actualizar Índices en IndexedDB

**Archivo**: `/src/services/database.ts`

```typescript
interface InhostDB extends DBSchema {
  messages: {
    key: string;
    value: MessageEnvelope;
    indexes: {
      'conversationId': string;
      'tenantId': string;               // ✅ NUEVO
      'tenantId-conversationId': [string, string]; // ✅ NUEVO - Composite
      'timestamp': string;
      'channel': string;
    };
  };
  
  conversations: {
    key: string;
    value: Conversation;
    indexes: {
      'tenantId': string;               // ✅ NUEVO
      'updatedAt': string;
      'channel': string;
    };
  };
  
  contacts: {
    key: string;
    value: Contact;
    indexes: {
      'tenantId': string;               // ✅ NUEVO
    };
  };
}

// ✅ Nueva función para queries filtrads
async getMessagesByTenant(tenantId: string): Promise<MessageEnvelope[]> {
  const messages = await this.db.getAllFromIndex(
    'messages',
    'tenantId',
    tenantId
  );
  return messages;
}
```

### 🎯 Fase 2: Autenticación (Semana 2-3)

#### 2.1 Crear Auth Service

**Archivo a crear**: `/src/services/auth.ts`

```typescript
class AuthService {
  private token: string | null = null;
  private user: User | null = null;
  
  async login(email: string, password: string): Promise<User> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const { data } = await response.json();
    this.token = data.token;
    this.user = this.decodeToken(data.token);
    
    // Guardar en sessionStorage (no localStorage)
    sessionStorage.setItem('auth_token', data.token);
    
    return this.user;
  }
  
  logout(): void {
    this.token = null;
    this.user = null;
    sessionStorage.removeItem('auth_token');
  }
  
  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'X-Tenant-ID': `${this.user?.tenantId}`,
    };
  }
  
  private decodeToken(token: string): User {
    // Decodificar JWT y validar firma
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user;
  }
}
```

#### 2.2 Crear Login Component

**Archivo a crear**: `/src/pages/Login.tsx`

```typescript
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirigir a /app
      window.location.href = '/app';
    } catch (error) {
      // Mostrar error
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
```

#### 2.3 Crear Protected Route Component

**Archivo a crear**: `/src/components/ProtectedRoute.tsx`

```typescript
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return <>{children}</>;
}
```

### 🎯 Fase 3: Validación de Tenant (Semana 3)

#### 3.1 Actualizar API Client

**Archivo**: `/src/services/api.ts`

```typescript
class ApiClient {
  constructor(
    baseUrl: string,
    private authService: AuthService,
  ) {}
  
  async sendClientMessage(
    request: ClientMessageRequest
  ): Promise<ClientMessageResponse> {
    const response = await fetch(
      `${this.baseUrl}/simulate/client-message`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.authService.getAuthHeaders(), // ✅ NUEVO
        },
        body: JSON.stringify(request),
      }
    );
    
    const json = await response.json();
    
    // ✅ Validar tenant en respuesta
    if (json.data?.tenantId !== this.authService.getCurrentTenant()) {
      throw new Error('Tenant mismatch');
    }
    
    return json.data;
  }
}
```

#### 3.2 Actualizar WebSocket Handler

**Archivo**: `/src/providers/WebSocketProvider.tsx`

```typescript
export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { currentTenant } = useCurrentTenant();
  const { token } = useAuth();
  
  const connect = useCallback(() => {
    // ✅ Incluir token y tenant en URL
    const wsUrl = new URL(WS_URL);
    wsUrl.searchParams.set('token', token);
    wsUrl.searchParams.set('tenant_id', currentTenant.id);
    
    const ws = new WebSocket(wsUrl.toString());
    
    // ✅ Validar tenant en cada evento
    const handleMessageReceived = async (event: MessageReceivedEvent) => {
      const message = event.data;
      
      if (message.tenantId !== currentTenant.id) {
        console.error('Tenant mismatch in WebSocket event');
        return; // ✅ Ignorar si tenant no coincide
      }
      
      // Procesar mensaje
      await db.addMessage(message);
    };
  }, [token, currentTenant]);
}
```

#### 3.3 Agregar Guard en Store

**Archivo**: `/src/store/index.ts`

```typescript
// ✅ Agregar a AppState
interface AppState {
  currentTenantId: string | null;  // ✅ NUEVO
  
  actions: {
    setCurrentTenant: (tenantId: string) => void;  // ✅ NUEVO
    addMessage: (conversationId: string, message: MessageEnvelope) => void;
  };
}

// ✅ En createContext/addMessage
addMessage: (conversationId, message) =>
  set((state) => {
    // Validar tenant
    if (!state.currentTenantId) {
      throw new Error('No tenant selected');
    }
    
    if (message.tenantId !== state.currentTenantId) {
      throw new Error('Message does not belong to current tenant');
    }
    
    return {
      entities: {
        // ... agregar mensaje
      },
    };
  }),
```

### 🎯 Fase 4: Encriptación Local (Semana 4)

#### 4.1 Encriptar Datos en IndexedDB

**Archivo a crear**: `/src/services/encryption.ts`

```typescript
import { AES, enc } from 'crypto-js';

class EncryptionService {
  private key: string;
  
  constructor(userPassword: string) {
    // Derivar clave de contraseña del usuario
    this.key = userPassword;
  }
  
  encrypt(data: any): string {
    return AES.encrypt(JSON.stringify(data), this.key).toString();
  }
  
  decrypt(encrypted: string): any {
    const decrypted = AES.decrypt(encrypted, this.key).toString(enc.Utf8);
    return JSON.parse(decrypted);
  }
}
```

#### 4.2 Encriptar Datos Sensibles

**Archivo**: `/src/services/database.ts`

```typescript
async addMessage(message: MessageEnvelope): Promise<void> {
  // Encriptar contenido sensible
  const encrypted = {
    ...message,
    content: {
      ...message.content,
      text: this.encryptionService.encrypt(message.content.text),
    },
  };
  
  await this.db.add('messages', encrypted);
}
```

### 📊 Tabla de Implementación

| Tarea | Prioridad | Esfuerzo | Dependencias |
|-------|-----------|----------|--------------|
| TenantContext | 🔴 P0 | 4h | - |
| AuthContext | 🔴 P0 | 6h | TenantContext |
| Actualizar modelos | 🔴 P0 | 2h | - |
| Actualizar IndexedDB | 🔴 P0 | 3h | Modelos |
| Auth Service | 🔴 P0 | 4h | AuthContext |
| Login Component | 🔴 P0 | 3h | Auth Service |
| Protected Routes | 🔴 P0 | 2h | Login Component |
| Actualizar API Client | 🟠 P1 | 3h | Auth Service |
| Actualizar WebSocket | 🟠 P1 | 4h | Auth Service |
| Add Guards a Store | 🟠 P1 | 3h | TenantContext |
| Encriptación | 🟡 P2 | 5h | Auth Service |
| **TOTAL** | | **39h** (~5 días de dev) |

---

## Archivos a Crear/Modificar

### ✅ Crear

```
src/
├── contexts/
│   ├── TenantContext.tsx          (NEW - 80 líneas)
│   ├── AuthContext.tsx            (NEW - 100 líneas)
│   └── index.ts                   (NEW - exports)
├── components/
│   ├── auth/
│   │   ├── Login.tsx              (NEW - 120 líneas)
│   │   ├── Logout.tsx             (NEW - 30 líneas)
│   │   └── ProtectedRoute.tsx      (NEW - 40 líneas)
│   └── tenant/
│       ├── TenantSwitcher.tsx      (NEW - 100 líneas)
│       └── TenantGuard.tsx         (NEW - 50 líneas)
├── pages/
│   ├── Login.tsx                  (NEW - 150 líneas)
│   ├── Auth.tsx                   (NEW - 50 líneas)
│   └── App.tsx                    (RENAME from App.tsx)
└── services/
    ├── auth.ts                    (NEW - 120 líneas)
    └── encryption.ts              (NEW - 100 líneas)
```

### 📝 Modificar

```
src/
├── App.tsx                        (MOD - agregar Providers)
├── types/index.ts                 (MOD - agregar tenantId a modelos)
├── services/
│   ├── api.ts                     (MOD - agregar auth headers)
│   ├── database.ts                (MOD - agregar índices tenantId)
│   └── sync.ts                    (MOD - filtrar por tenantId)
├── providers/
│   └── WebSocketProvider.tsx       (MOD - validar tenant)
├── store/
│   ├── index.ts                   (MOD - agregar currentTenantId)
│   └── workspace.ts               (MOD - agregar tenants)
├── .env.example                   (MOD - agregar vars auth/tenant)
└── main.tsx                       (MOD - actualizar router)
```

### 📚 Variables de Entorno para Multi-Tenant

```env
# Autenticación
VITE_AUTH_API_URL=http://localhost:3000/api/auth
VITE_TOKEN_EXPIRY=3600000

# Tenant
VITE_TENANT_API_URL=http://localhost:3000/api/tenants
VITE_ENABLE_TENANT_SWITCHING=true
VITE_ENABLE_MULTIPLE_TENANTS=true

# Seguridad
VITE_SECURE_STORAGE=sessionStorage
VITE_REQUIRE_HTTPS_FOR_AUTH=false
VITE_ENCRYPTION_ENABLED=true

# Development
VITE_DEV_TENANT_ID=tenant-dev-123
VITE_DEV_USER_ID=user-dev-456
```

---

## Checklist de Implementación

### Fase 1: Fundación

- [ ] Crear TenantContext
- [ ] Crear AuthContext
- [ ] Actualizar tipos MessageEnvelope, Conversation, Contact
- [ ] Actualizar IndexedDB schema con índices tenantId
- [ ] Crear interfaces para Tenant y User
- [ ] Actualizar .env.example

### Fase 2: Autenticación

- [ ] Crear AuthService
- [ ] Crear Login component
- [ ] Crear ProtectedRoute wrapper
- [ ] Crear AuthProvider
- [ ] Integrar AuthContext en App
- [ ] Crear logout functionality

### Fase 3: Validación de Tenant

- [ ] Actualizar ApiClient con auth headers
- [ ] Actualizar WebSocketProvider para validar tenant
- [ ] Agregar guards en store (setCurrentTenant)
- [ ] Actualizar sync.ts para filtrar por tenantId
- [ ] Crear TenantGuard component
- [ ] Crear TenantSwitcher component

### Fase 4: Encriptación

- [ ] Crear EncryptionService
- [ ] Integrar con database.ts
- [ ] Cifrar datos en localStorage/IndexedDB
- [ ] Validar en queries

### Fase 5: Testing

- [ ] Tests unitarios para AuthService
- [ ] Tests unitarios para TenantContext
- [ ] Tests E2E para login flow
- [ ] Tests E2E para tenant switching
- [ ] Tests de seguridad (IDOR, XSS)
- [ ] Tests de encriptación

---

## Riesgos y Consideraciones

### 🎯 Riesgos Técnicos

1. **Breaking Changes en API**
   - Agregar campos a modelos podría romper compatibilidad
   - **Mitigación**: Versionar API, mantener backward compatibility

2. **Performance de Queries**
   - Más índices = más overhead en writes
   - **Mitigación**: Usar índices compuestos (tenantId + conversationId)

3. **Complejidad del Store**
   - Zustand con TenantContext podría causar re-renders
   - **Mitigación**: Usar selectores granulares

### 🔒 Riesgos de Seguridad

1. **Token Leakage**
   - localStorage es vulnerable a XSS
   - **Mitigación**: Usar sessionStorage o in-memory storage

2. **Desincronización de Tenant**
   - Usuario podría estar en tenant A pero datos de B cargados
   - **Mitigación**: Validar tenantId en cada operación

3. **Backend Sin Validación**
   - Frontend no puede proteger si backend no filtra
   - **Mitigación**: Coordinar cambios en backend primero

### 📊 Riesgos de Performance

1. **Encriptación/Desencriptación**
   - Encriptar todo en IndexedDB ralentiza queries
   - **Mitigación**: Encriptar solo datos sensibles

2. **Índices en IndexedDB**
   - Muchos índices fragmentan storage
   - **Mitigación**: Usar índices compuestos cuidadosamente

---

## Conclusión

### Estado Actual

El frontend **NO está preparado para multi-tenancy**:
- Sin autenticación
- Sin validación de tenant
- Sin aislamiento de datos
- Arquitectura monousuario

### Camino Recomendado

1. **Corto plazo (1-2 semanas)**: Implementar foundation (contexts, auth)
2. **Medio plazo (2-3 semanas)**: Agregar validación de tenant
3. **Largo plazo (4+ semanas)**: Encriptación, optimizaciones

### Próximos Pasos

1. Revisar backend para entender cómo maneja multi-tenancy
2. Coordinar con backend sobre cambios en API
3. Crear stories de usuario para cada fase
4. Establecer criterios de aceptación
5. Comenzar con Phase 1 (TenantContext, AuthContext)

---

**Documento preparado por**: Claude Code  
**Fecha**: 2025-11-19  
**Versión**: 1.0  
**Estado**: En Revisión
