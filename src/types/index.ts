/**
 * Frontend Types for INHOST
 * CONTRATO ESTRICTO - Basado en MessageEnvelope del backend
 * https://github.com/harvan88/inhost.git
 * Referencia: packages/shared/src/types/message-envelope.ts
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIPOS BASE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type MessageType = 'incoming' | 'outgoing' | 'system' | 'status';
export type ChannelType = 'whatsapp' | 'telegram' | 'web' | 'sms';
export type MediaType = 'image' | 'video' | 'audio' | 'document';
export type ButtonType = 'reply' | 'url';
export type MessageStatus =
  | 'received'
  | 'processing'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';
export type PlanType = 'free' | 'premium';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MESSAGE ENVELOPE (Contrato Estricto)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface MessageEnvelope {
  id: string;                    // UUID
  conversationId: string;        // UUID de conversación (obligatorio)
  type: MessageType;
  channel: ChannelType;

  content: {
    text?: string;               // Opcional (puede ser solo media)
    contentType: string;         // Obligatorio (ej: "text/plain", "image/jpeg")
    media?: {
      url: string;
      type: MediaType;
      caption?: string;
    };
    location?: {
      latitude: number;
      longitude: number;
      name?: string;
    };
    buttons?: Array<{
      id: string;
      text: string;
      type: ButtonType;
    }>;
  };

  metadata: {
    from: string;
    to: string;
    timestamp: string;           // ISO 8601
    messageId?: string;
    conversationId?: string;
    ownerId?: string;
    platformMessageId?: string;
    extensionId?: string;        // Si viene de extensión
    originalMessageId?: string;  // Si es respuesta
    [key: string]: unknown;      // Metadata adicional extensible
  };

  statusChain: Array<{
    status: MessageStatus;
    timestamp: string;
    messageId: string;
    details?: string;
  }>;

  context: {
    plan: PlanType;
    timestamp: string;
    source?: string;
    extension?: {
      id: string;
      name: string;
      latency: number;
      [key: string]: unknown;
    };
    [key: string]: unknown;      // Context extensible
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// API RESPONSES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
  };
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  database: 'postgresql' | 'disconnected';
  timestamp: string;
  version: string;
  redis?: {
    status: 'connected' | 'disconnected';
    host: string;
    port: number;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SIMULATION API (Endpoints de Simulación)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ClientId = 'whatsapp' | 'telegram' | 'web' | 'sms';
export type ExtensionId = 'echo' | 'ai' | 'crm';

export interface SimulationClient {
  id: string;                    // whatsapp-sim, telegram-sim, etc.
  name: string;
  icon: string;
  channel: ChannelType;
  connected: boolean;
  metadata: {
    phone?: string;
    username?: string;
    businessId?: string;
    chatId?: string;
    sessionId?: string;
    carrier?: string;
    [key: string]: unknown;
  };
}

export interface SimulationExtension {
  id: ExtensionId;
  name: string;
  icon: string;
  active: boolean;
  latency: number;               // 0-5000 ms
  subscriptions: string[];       // ['incoming']
}

export interface SimulationStatus {
  clients: SimulationClient[];
  extensions: SimulationExtension[];
  stats: {
    activeExtensions: number;
    connectedClients: number;
    totalClients: number;
    totalExtensions: number;
  };
}

export interface ClientMessageRequest {
  clientId: ClientId;
  text: string;
}

export interface ClientMessageResponse {
  clientMessage: MessageEnvelope;
  extensionResponses: MessageEnvelope[];
  processedCount: number;
}

export interface ClientToggleRequest {
  clientId: ClientId;
}

export interface ClientToggleResponse {
  clientId: string;
  connected: boolean;
}

export interface ExtensionToggleRequest {
  extensionId: ExtensionId;
}

export interface ExtensionToggleResponse {
  extensionId: string;
  active: boolean;
}

export interface ExtensionLatencyRequest {
  extensionId: ExtensionId;
  latency: number;               // 0-5000 ms
}

export interface ExtensionLatencyResponse {
  extensionId: string;
  latency: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WEBSOCKET EVENTS (Broadcasts Automáticos)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type WebSocketEventType =
  | 'connection'
  | 'echo'
  | 'message_received'
  | 'message_processing'
  | 'extension_response'
  | 'client_toggle'
  | 'extension_toggle'
  | 'message:new'
  | 'message:status'
  | 'typing:indicator'
  | 'error';

export interface WebSocketEvent {
  type: WebSocketEventType;
  [key: string]: unknown;
}

export interface ConnectionEvent extends WebSocketEvent {
  type: 'connection';
  status: 'connected';
  timestamp: string;
  clientId: string;
}

export interface MessageReceivedEvent extends WebSocketEvent {
  type: 'message_received';
  data: MessageEnvelope;
  timestamp: string;
}

export interface MessageProcessingEvent extends WebSocketEvent {
  type: 'message_processing';
  extensionCount: number;
  timestamp: string;
}

export interface ExtensionResponseEvent extends WebSocketEvent {
  type: 'extension_response';
  data: MessageEnvelope;
  timestamp: string;
}

export interface ClientToggleEvent extends WebSocketEvent {
  type: 'client_toggle';
  clientId: string;
  connected: boolean;
  timestamp: string;
}

export interface ExtensionToggleEvent extends WebSocketEvent {
  type: 'extension_toggle';
  extensionId: string;
  active: boolean;
  timestamp: string;
}

export interface MessageNewEvent extends WebSocketEvent {
  type: 'message:new';
  data: MessageEnvelope;
  timestamp: string;
}

export interface MessageStatusEvent extends WebSocketEvent {
  type: 'message:status';
  data: {
    messageId: string;
    status: MessageStatus;
    timestamp: string;
    details?: string;
  };
  timestamp: string;
}

export interface TypingIndicatorEvent extends WebSocketEvent {
  type: 'typing:indicator';
  data: {
    userId: string;
    conversationId: string;
    isTyping: boolean;
    timestamp: string;
  };
  timestamp: string;
}

export interface ErrorEvent extends WebSocketEvent {
  type: 'error';
  code: string;
  message: string;
  retryAfter?: number;
  limit?: number;
  resetAt?: string;
  timestamp: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FRONTEND-SPECIFIC TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Contact/Entity types
 */
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
}

/**
 * Conversation types (derivadas de mensajes)
 */
export interface Conversation {
  id: string;                    // conversationId (UUID)
  entityId: string;              // Reference to Contact (metadata.from)
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
}

/**
 * Workspace State (según estrategia de workspace)
 */
export interface WorkspaceTab {
  id: string;
  type: 'conversation' | 'order' | 'customer_profile' | 'tool';
  label: string;
  entityId: string;
  icon?: string;
  closable: boolean;
}

export interface WorkspaceState {
  // Activity Bar
  activeActivity: 'messages' | 'contacts' | 'tools' | 'analytics';

  // Primary Sidebar
  sidebarVisible: boolean;
  sidebarWidth: number;

  // Editor Groups (Tabs)
  tabs: WorkspaceTab[];
  activeTabId: string | null;

  // Tool Panels
  panelVisible: boolean;
  panelWidth: number;
  collapsedTools: Set<string>;
}

/**
 * App State types (Zustand Store)
 */
export interface AppState {
  // ━━━ DOMAIN 1: Entities (persisted in IndexedDB) ━━━
  entities: {
    conversations: Map<string, Conversation>;
    messages: Map<string, MessageEnvelope[]>; // indexed by conversationId
    contacts: Map<string, Contact>;
  };

  // ━━━ DOMAIN 2: Simulation State (ephemeral, from API) ━━━
  simulation: {
    clients: Map<string, SimulationClient>;
    extensions: Map<string, SimulationExtension>;
    stats: {
      activeExtensions: number;
      connectedClients: number;
      totalClients: number;
      totalExtensions: number;
    };
  };

  // ━━━ DOMAIN 3: UI (ephemeral, frontend-only) ━━━
  ui: {
    activeConversationId: string | null;
    sidebarCollapsed: boolean;
    theme: 'light' | 'dark';
    workspace?: WorkspaceState;  // Workspace architecture
  };

  // ━━━ DOMAIN 4: Network (transient, sync state) ━━━
  network: {
    connectionStatus: 'connected' | 'disconnected';
    pendingMessages: Set<string>; // Message IDs being sent
    lastSync: Date | null;        // Last sync timestamp
    retryQueue: MessageEnvelope[]; // Failed messages to retry
  };

  // ━━━ ACTIONS ━━━
  actions: {
    // Conversations
    setActiveConversation: (id: string | null) => void;
    addConversation: (conversation: Conversation) => void;
    updateConversation: (id: string, updates: Partial<Conversation>) => void;

    // Messages
    addMessage: (conversationId: string, message: MessageEnvelope) => void;
    setMessages: (conversationId: string, messages: MessageEnvelope[]) => void;

    // Contacts
    addContact: (contact: Contact) => void;
    updateContact: (id: string, updates: Partial<Contact>) => void;

    // Simulation
    updateSimulationState: (state: Partial<AppState['simulation']>) => void;
    toggleClient: (clientId: string) => void;
    toggleExtension: (extensionId: string) => void;

    // UI
    toggleSidebar: () => void;
    setTheme: (theme: 'light' | 'dark') => void;

    // Network
    setConnectionStatus: (status: 'connected' | 'disconnected') => void;
    addPendingMessage: (messageId: string) => void;
    removePendingMessage: (messageId: string) => void;
    updateLastSync: (timestamp: Date) => void;
  };
}

/**
 * Error Notification
 */
export interface ErrorNotification {
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: number;
}
