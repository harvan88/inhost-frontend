/**
 * Frontend-specific types for INHOST
 * These types match the API contracts from the backend
 */

export type MessageType = 'incoming' | 'outgoing' | 'system' | 'status';
export type ChannelType = 'whatsapp' | 'telegram' | 'web' | 'sms';

export interface Message {
  id: string;
  type: MessageType;
  channel: ChannelType;
  content: {
    text: string;
  };
  metadata: {
    from: string;
    to: string;
    timestamp: string;
  };
  status?: {
    state: string;
    timestamp: string;
  };
}

export interface MessagePayload {
  type: 'incoming' | 'outgoing' | 'system';
  channel: ChannelType;
  content: {
    text: string;
  };
  metadata: {
    from: string;
    to: string;
    timestamp: string;
  };
}

export interface HealthStatus {
  status: 'ok' | 'error' | 'unknown';
  timestamp?: string;
  version?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface WebSocketMessage {
  type: string;
  data?: unknown;
}

export interface ErrorNotification {
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: number;
}

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
 * Conversation types
 */
export interface Conversation {
  id: string;
  entityId: string; // Reference to Contact
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
 * App State types (for Zustand store)
 */
export interface AppState {
  // ━━━ DOMAIN 1: Entities (persisted, cacheable) ━━━
  entities: {
    conversations: Map<string, Conversation>;
    messages: Map<string, Message[]>; // indexed by conversationId
    contacts: Map<string, Contact>;
  };

  // ━━━ DOMAIN 2: UI (ephemeral, frontend-only) ━━━
  ui: {
    activeConversationId: string | null;
    sidebarCollapsed: boolean;
    theme: 'light' | 'dark';
    // Future: tabs/workspace support
    openTabs?: string[];
    activePanes?: { left: string; right?: string };
  };

  // ━━━ DOMAIN 3: Network (transient, sync state) ━━━
  network: {
    connectionStatus: 'connected' | 'disconnected';
    pendingMessages: Set<string>; // Message IDs being sent
    lastSync: Map<string, number>; // timestamp by conversationId
    retryQueue: Message[]; // Failed messages to retry
  };

  // ━━━ ACTIONS ━━━
  actions: {
    // Conversations
    setActiveConversation: (id: string | null) => void;
    addConversation: (conversation: Conversation) => void;
    updateConversation: (id: string, updates: Partial<Conversation>) => void;

    // Messages
    addMessage: (conversationId: string, message: Message) => void;
    setMessages: (conversationId: string, messages: Message[]) => void;

    // Contacts
    addContact: (contact: Contact) => void;
    updateContact: (id: string, updates: Partial<Contact>) => void;

    // UI
    toggleSidebar: () => void;
    setTheme: (theme: 'light' | 'dark') => void;

    // Network
    setConnectionStatus: (status: 'connected' | 'disconnected') => void;
    addPendingMessage: (messageId: string) => void;
    removePendingMessage: (messageId: string) => void;
  };
}
