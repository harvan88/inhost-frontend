/**
 * Zustand Store para INHOST
 * CONTRATO ESTRICTO - Basado en MessageEnvelope del backend
 *
 * Arquitectura:
 * 1. Entities (persisted in IndexedDB) - conversations, messages, contacts
 * 2. Simulation (ephemeral from API) - clients, extensions, stats
 * 3. UI (ephemeral frontend-only) - activeConversation, theme, workspace
 * 4. Network (transient sync state) - connectionStatus, pendingMessages
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  AppState,
  Conversation,
  Contact,
  MessageEnvelope,
  SimulationClient,
  SimulationExtension,
} from '@/types';

/**
 * Zustand store for the application
 */
export const useStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // DOMAIN 1: ENTITIES (persisted in IndexedDB)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      entities: {
        conversations: new Map<string, Conversation>(),
        messages: new Map<string, MessageEnvelope[]>(),
        contacts: new Map<string, Contact>(),
      },

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // DOMAIN 2: SIMULATION STATE (ephemeral from API)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      simulation: {
        clients: new Map<string, SimulationClient>(),
        extensions: new Map<string, SimulationExtension>(),
        stats: {
          activeExtensions: 0,
          connectedClients: 0,
          totalClients: 0,
          totalExtensions: 0,
        },
      },

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // DOMAIN 3: UI (ephemeral, frontend-only)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      ui: {
        activeConversationId: null,
        sidebarCollapsed: false,
        theme: 'light',
        workspace: undefined, // Workspace architecture (future)
      },

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // DOMAIN 4: NETWORK (transient, sync state)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      network: {
        connectionStatus: 'disconnected',
        pendingMessages: new Set<string>(),
        lastSync: null,
        retryQueue: [],
      },

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ACTIONS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      actions: {
        // ━━━ CONVERSATIONS ━━━
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

        // ━━━ MESSAGES ━━━
        addMessage: (conversationId, message) =>
          set((state) => {
            const existingMessages = state.entities.messages.get(conversationId) || [];

            // Evitar duplicados
            const messageExists = existingMessages.some((m) => m.id === message.id);
            if (messageExists) {
              console.warn(`Message ${message.id} already exists, skipping`);
              return state;
            }

            const newMessages = new Map(state.entities.messages).set(conversationId, [
              ...existingMessages,
              message,
            ]);

            // Actualizar lastMessage de la conversación
            const conversation = state.entities.conversations.get(conversationId);
            const updatedConversations = conversation
              ? new Map(state.entities.conversations).set(conversationId, {
                  ...conversation,
                  lastMessage: {
                    text: message.content.text || '[Media]',
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

        // ━━━ CONTACTS ━━━
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

        // ━━━ SIMULATION ━━━
        updateSimulationState: (updates) =>
          set((state) => ({
            simulation: {
              ...state.simulation,
              ...updates,
            },
          })),

        toggleClient: (clientId) =>
          set((state) => {
            const client = state.simulation.clients.get(clientId);
            if (!client) return state;

            const updatedClient = { ...client, connected: !client.connected };
            const updatedClients = new Map(state.simulation.clients).set(
              clientId,
              updatedClient
            );

            // Recalcular stats
            const connectedClients = Array.from(updatedClients.values()).filter(
              (c) => c.connected
            ).length;

            return {
              simulation: {
                ...state.simulation,
                clients: updatedClients,
                stats: {
                  ...state.simulation.stats,
                  connectedClients,
                },
              },
            };
          }),

        toggleExtension: (extensionId) =>
          set((state) => {
            const extension = state.simulation.extensions.get(extensionId);
            if (!extension) return state;

            const updatedExtension = { ...extension, active: !extension.active };
            const updatedExtensions = new Map(state.simulation.extensions).set(
              extensionId,
              updatedExtension
            );

            // Recalcular stats
            const activeExtensions = Array.from(updatedExtensions.values()).filter(
              (e) => e.active
            ).length;

            return {
              simulation: {
                ...state.simulation,
                extensions: updatedExtensions,
                stats: {
                  ...state.simulation.stats,
                  activeExtensions,
                },
              },
            };
          }),

        // ━━━ UI ━━━
        toggleSidebar: () =>
          set((state) => ({
            ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed },
          })),

        setTheme: (theme) =>
          set((state) => ({
            ui: { ...state.ui, theme },
          })),

        // ━━━ NETWORK ━━━
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

        updateLastSync: (timestamp) =>
          set((state) => ({
            network: {
              ...state.network,
              lastSync: timestamp,
            },
          })),
      },
    }),
    { name: 'inhost-store' }
  )
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SELECTOR HOOKS (for common use cases)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const useActiveConversationId = () =>
  useStore((state) => state.ui.activeConversationId);

export const useConversation = (id: string | null) =>
  useStore((state) => (id ? state.entities.conversations.get(id) : undefined));

export const useMessages = (conversationId: string | null) =>
  useStore((state) =>
    conversationId ? state.entities.messages.get(conversationId) ?? [] : []
  );

export const useContact = (id: string | null) =>
  useStore((state) => (id ? state.entities.contacts.get(id) : undefined));

export const useConnectionStatus = () =>
  useStore((state) => state.network.connectionStatus);

export const useAllConversations = () =>
  useStore((state) => Array.from(state.entities.conversations.values()));

export const useAllContacts = () =>
  useStore((state) => Array.from(state.entities.contacts.values()));

export const useSimulationClients = () =>
  useStore((state) => Array.from(state.simulation.clients.values()));

export const useSimulationExtensions = () =>
  useStore((state) => Array.from(state.simulation.extensions.values()));

export const useSimulationStats = () => useStore((state) => state.simulation.stats);
