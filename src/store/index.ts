import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AppState, Conversation, Contact, Message } from '@/types';

/**
 * Mock data for development
 */
const mockContact1: Contact = {
  id: 'contact-1',
  name: 'Juan Pérez',
  avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=0ea5e9&color=fff',
  status: 'online',
  channel: 'whatsapp',
  metadata: {
    phoneNumber: '+54 9 11 1234-5678',
  },
};

const mockContact2: Contact = {
  id: 'contact-2',
  name: 'María González',
  avatar: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=10b981&color=fff',
  status: 'offline',
  channel: 'telegram',
  metadata: {
    phoneNumber: '+54 9 11 8765-4321',
  },
};

const mockContact3: Contact = {
  id: 'contact-3',
  name: 'Sistema Web',
  avatar: 'https://ui-avatars.com/api/?name=Web&background=6366f1&color=fff',
  status: 'online',
  channel: 'web',
};

const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    entityId: 'contact-1',
    channel: 'whatsapp',
    lastMessage: {
      text: 'Hola! ¿Cómo estás?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
      type: 'incoming',
    },
    unreadCount: 2,
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'conv-2',
    entityId: 'contact-2',
    channel: 'telegram',
    lastMessage: {
      text: 'Perfecto, nos vemos mañana',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      type: 'outgoing',
    },
    unreadCount: 0,
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'conv-3',
    entityId: 'contact-3',
    channel: 'web',
    lastMessage: {
      text: 'Bienvenido al sistema INHOST',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      type: 'system',
    },
    unreadCount: 0,
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1-1',
      type: 'incoming',
      channel: 'whatsapp',
      content: { text: 'Hola! ¿Cómo estás?' },
      metadata: {
        from: '+54 9 11 1234-5678',
        to: 'system',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
    },
    {
      id: 'msg-1-2',
      type: 'outgoing',
      channel: 'whatsapp',
      content: { text: 'Todo bien! ¿Y vos?' },
      metadata: {
        from: 'system',
        to: '+54 9 11 1234-5678',
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      },
    },
    {
      id: 'msg-1-3',
      type: 'incoming',
      channel: 'whatsapp',
      content: { text: 'Muy bien, gracias por preguntar' },
      metadata: {
        from: '+54 9 11 1234-5678',
        to: 'system',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
    },
  ],
  'conv-2': [
    {
      id: 'msg-2-1',
      type: 'outgoing',
      channel: 'telegram',
      content: { text: '¿Nos vemos mañana a las 10?' },
      metadata: {
        from: 'system',
        to: '@mariagonzalez',
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      },
    },
    {
      id: 'msg-2-2',
      type: 'incoming',
      channel: 'telegram',
      content: { text: 'Perfecto, nos vemos mañana' },
      metadata: {
        from: '@mariagonzalez',
        to: 'system',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
    },
  ],
  'conv-3': [
    {
      id: 'msg-3-1',
      type: 'system',
      channel: 'web',
      content: { text: 'Bienvenido al sistema INHOST' },
      metadata: {
        from: 'system',
        to: 'web-user',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
    },
  ],
};

/**
 * Zustand store for the application
 */
export const useStore = create<AppState>()(
  devtools(
    (set) => ({
      // ━━━ INITIAL STATE ━━━
      entities: {
        conversations: new Map(mockConversations.map((c) => [c.id, c])),
        messages: new Map(Object.entries(mockMessages)),
        contacts: new Map([
          [mockContact1.id, mockContact1],
          [mockContact2.id, mockContact2],
          [mockContact3.id, mockContact3],
        ]),
      },

      ui: {
        activeConversationId: 'conv-1', // Start with first conversation active
        sidebarCollapsed: false,
        theme: 'light',
      },

      network: {
        connectionStatus: 'connected',
        pendingMessages: new Set(),
        lastSync: new Map(),
        retryQueue: [],
      },

      // ━━━ ACTIONS ━━━
      actions: {
        // Conversations
        setActiveConversation: (id) =>
          set((state) => ({
            ui: { ...state.ui, activeConversationId: id },
          })),

        addConversation: (conversation) =>
          set((state) => ({
            entities: {
              ...state.entities,
              conversations: new Map(state.entities.conversations).set(
                conversation.id,
                conversation
              ),
            },
          })),

        updateConversation: (id, updates) =>
          set((state) => {
            const conversation = state.entities.conversations.get(id);
            if (!conversation) return state;

            return {
              entities: {
                ...state.entities,
                conversations: new Map(state.entities.conversations).set(id, {
                  ...conversation,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }),
              },
            };
          }),

        // Messages
        addMessage: (conversationId, message) =>
          set((state) => {
            const existingMessages = state.entities.messages.get(conversationId) || [];
            const newMessages = new Map(state.entities.messages).set(conversationId, [
              ...existingMessages,
              message,
            ]);

            // Update conversation's last message
            const conversation = state.entities.conversations.get(conversationId);
            const updatedConversations = conversation
              ? new Map(state.entities.conversations).set(conversationId, {
                  ...conversation,
                  lastMessage: {
                    text: message.content.text,
                    timestamp: message.metadata.timestamp,
                    type: message.type,
                  },
                  updatedAt: new Date().toISOString(),
                })
              : state.entities.conversations;

            return {
              entities: {
                ...state.entities,
                messages: newMessages,
                conversations: updatedConversations,
              },
            };
          }),

        setMessages: (conversationId, messages) =>
          set((state) => ({
            entities: {
              ...state.entities,
              messages: new Map(state.entities.messages).set(conversationId, messages),
            },
          })),

        // Contacts
        addContact: (contact) =>
          set((state) => ({
            entities: {
              ...state.entities,
              contacts: new Map(state.entities.contacts).set(contact.id, contact),
            },
          })),

        updateContact: (id, updates) =>
          set((state) => {
            const contact = state.entities.contacts.get(id);
            if (!contact) return state;

            return {
              entities: {
                ...state.entities,
                contacts: new Map(state.entities.contacts).set(id, {
                  ...contact,
                  ...updates,
                }),
              },
            };
          }),

        // UI
        toggleSidebar: () =>
          set((state) => ({
            ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed },
          })),

        setTheme: (theme) =>
          set((state) => ({
            ui: { ...state.ui, theme },
          })),

        // Network
        setConnectionStatus: (status) =>
          set((state) => ({
            network: { ...state.network, connectionStatus: status },
          })),

        addPendingMessage: (messageId) =>
          set((state) => ({
            network: {
              ...state.network,
              pendingMessages: new Set(state.network.pendingMessages).add(messageId),
            },
          })),

        removePendingMessage: (messageId) =>
          set((state) => {
            const pending = new Set(state.network.pendingMessages);
            pending.delete(messageId);
            return {
              network: {
                ...state.network,
                pendingMessages: pending,
              },
            };
          }),
      },
    }),
    { name: 'inhost-store' }
  )
);

/**
 * Selector hooks for common use cases
 */
export const useActiveConversationId = () =>
  useStore((state) => state.ui.activeConversationId);

export const useConversation = (id: string | null) =>
  useStore((state) => (id ? state.entities.conversations.get(id) : undefined));

export const useMessages = (conversationId: string | null) =>
  useStore((state) => (conversationId ? state.entities.messages.get(conversationId) ?? [] : []));

export const useContact = (id: string | null) =>
  useStore((state) => (id ? state.entities.contacts.get(id) : undefined));

export const useConnectionStatus = () =>
  useStore((state) => state.network.connectionStatus);
