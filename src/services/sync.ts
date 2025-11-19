/**
 * Sync Service
 * Sincronización entre IndexedDB, Zustand Store y Backend
 *
 * Flujo:
 * 1. App Load → loadFromIndexedDB() → Hydrate Zustand Store
 * 2. App Load → loadSimulationStatus() → Update Simulation State
 * 3. WebSocket → Persist to IndexedDB → Update Zustand Store
 */

import { db } from './database';
import { apiClient } from './api';
import { adminAPI } from '@/lib/api/admin-client';
import { useStore } from '@/store';
import type { Conversation, Contact, MessageEnvelope } from '@/types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SYNC SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class SyncService {
  private syncing = false;

  /**
   * Cargar datos desde IndexedDB al store
   * Se ejecuta al iniciar la app
   */
  async loadFromIndexedDB(): Promise<void> {
    console.log('🔄 Loading data from IndexedDB...');

    try {
      // 1. Cargar conversaciones
      const conversations = await db.getAllConversations();
      console.log(`📂 Loaded ${conversations.length} conversations`);

      // 2. Cargar contactos
      const contacts = await db.getAllContacts();
      console.log(`👥 Loaded ${contacts.length} contacts`);

      // 3. Cargar mensajes por conversación
      const messagesMap = new Map();
      for (const conversation of conversations) {
        const messages = await db.getMessagesByConversation(conversation.id, 100);
        messagesMap.set(conversation.id, messages);
      }
      console.log(`💬 Loaded messages for ${messagesMap.size} conversations`);

      // 4. Actualizar Zustand store
      const { entities } = useStore.getState();

      // Conversations
      const conversationsMap = new Map(conversations.map((c) => [c.id, c]));

      // Contacts
      const contactsMap = new Map(contacts.map((c) => [c.id, c]));

      // Messages
      const finalMessagesMap = new Map(messagesMap);

      // Update store
      useStore.setState({
        entities: {
          conversations: conversationsMap,
          messages: finalMessagesMap,
          contacts: contactsMap,
        },
      });

      console.log('✅ Store hydrated from IndexedDB');

      // 5. Actualizar última sincronización
      useStore.getState().actions.updateLastSync(new Date());
    } catch (error) {
      console.error('❌ Failed to load from IndexedDB:', error);
      throw error;
    }
  }

  /**
   * Sincronizar datos desde el backend (FASE 1)
   * Llama a /admin/sync/initial y guarda en IndexedDB
   */
  async syncFromBackend(): Promise<void> {
    console.log('🔄 Syncing from backend...');

    try {
      // 1. Llamar al endpoint de sincronización inicial
      const response = await adminAPI.syncInitial();

      if (!response.success) {
        throw new Error('Sync failed: response.success is false');
      }

      const { conversations, contacts, team, integrations } = response.data;

      console.log(`📦 Received from backend:
        - ${conversations.length} conversations
        - ${contacts.length} contacts
        - ${team.length} team members
        - ${integrations.length} integrations`);

      // 2. Guardar conversaciones en IndexedDB
      for (const conversation of conversations) {
        await db.saveConversation(conversation);
      }

      // 3. Guardar contactos en IndexedDB
      for (const contact of contacts) {
        // Convertir EndUser a Contact format
        const contactData: Contact = {
          id: contact.id,
          name: contact.name,
          status: 'offline',
          channel: 'whatsapp', // Default, puede venir de metadata
          metadata: {
            email: contact.email,
            phoneNumber: contact.phone,
          },
        };
        await db.saveContact(contactData);
      }

      // 4. Cargar mensajes para cada conversación (primeras 50)
      console.log('📨 Loading messages for active conversations...');
      for (const conversation of conversations.filter((c) => c.status === 'active')) {
        try {
          const messagesResponse = await adminAPI.getMessages(conversation.id, { limit: 50 });
          if (messagesResponse.success) {
            // Guardar mensajes en IndexedDB
            for (const message of messagesResponse.data.messages) {
              await db.addMessage(message);
            }
          }
        } catch (error) {
          console.warn(`⚠️ Failed to load messages for conversation ${conversation.id}:`, error);
        }
      }

      console.log('✅ Backend sync complete');
    } catch (error) {
      console.error('❌ Failed to sync from backend:', error);
      throw error;
    }
  }

  /**
   * Cargar estado de simulación desde el API
   * Se ejecuta al iniciar la app y después de WebSocket events
   */
  async loadSimulationStatus(): Promise<void> {
    console.log('🔄 Loading simulation status from API...');

    try {
      const status = await apiClient.getSimulationStatus();

      // Convertir arrays a Maps
      const clientsMap = new Map(status.clients.map((c) => [c.id, c]));
      const extensionsMap = new Map(status.extensions.map((e) => [e.id, e]));

      // Actualizar Zustand store
      useStore.getState().actions.updateSimulationState({
        clients: clientsMap,
        extensions: extensionsMap,
        stats: status.stats,
      });

      console.log('✅ Simulation status loaded:', status.stats);
    } catch (error) {
      console.error('❌ Failed to load simulation status:', error);
      throw error;
    }
  }

  /**
   * Sincronización completa al iniciar la app
   *
   * Flujo:
   * 1. Intentar sincronizar desde backend (FASE 1)
   * 2. Si falla, cargar desde IndexedDB (fallback offline)
   * 3. Hidratar Zustand store
   */
  async initialSync(): Promise<void> {
    if (this.syncing) {
      console.warn('⚠️ Sync already in progress');
      return;
    }

    this.syncing = true;

    try {
      console.log('🚀 Starting initial sync...');

      // 1. Intentar sincronizar desde backend
      try {
        await this.syncFromBackend();
        console.log('✅ Backend sync successful');
      } catch (error) {
        console.warn('⚠️ Backend sync failed, falling back to local data:', error);
      }

      // 2. Cargar datos desde IndexedDB (ahora tiene datos del backend o datos anteriores)
      await this.loadFromIndexedDB();

      // 3. Si no hay conversaciones, derivar desde mensajes (legacy support)
      const { entities } = useStore.getState();
      if (entities.conversations.size === 0) {
        console.log('📊 No conversations found, deriving from messages...');
        const derived = await db.deriveConversationsFromMessages();
        console.log(`✅ Derived ${derived.length} conversations`);

        // Recargar desde IndexedDB
        await this.loadFromIndexedDB();
      }

      // 4. Si no hay contactos, derivar desde conversaciones
      if (entities.contacts.size === 0) {
        console.log('👥 No contacts found, deriving from conversations...');
        await this.deriveContactsFromConversations();
      }

      console.log('✅ Initial sync complete');
    } catch (error) {
      console.error('❌ Initial sync failed:', error);
      throw error;
    } finally {
      this.syncing = false;
    }
  }

  /**
   * Derivar contactos desde conversaciones
   * Útil para primera carga o migración
   */
  private async deriveContactsFromConversations(): Promise<void> {
    const { entities } = useStore.getState();
    const conversations = Array.from(entities.conversations.values());

    for (const conversation of conversations) {
      const contact: Contact = {
        id: conversation.endUserId,
        name: conversation.endUserId, // Default: usar el ID como nombre
        status: 'offline',
        channel: conversation.channel,
        metadata: {
          phoneNumber: conversation.endUserId.startsWith('+') ? conversation.endUserId : undefined,
        },
      };

      // Guardar en IndexedDB
      await db.saveContact(contact);

      // Agregar al store
      useStore.getState().actions.addContact(contact);
    }

    console.log(`✅ Derived ${conversations.length} contacts`);
  }

  /**
   * Obtener estadísticas de la base de datos
   */
  async getStats() {
    return db.getStats();
  }

  /**
   * Limpiar toda la base de datos
   * CUIDADO: Esta operación es irreversible
   */
  async clearAll(): Promise<void> {
    console.warn('⚠️ Clearing all data...');

    // 1. Limpiar IndexedDB
    await db.clear();

    // 2. Resetear Zustand store
    useStore.setState({
      entities: {
        conversations: new Map(),
        messages: new Map(),
        contacts: new Map(),
      },
      ui: {
        activeConversationId: null,
        sidebarCollapsed: false,
        theme: 'light',
        workspace: undefined,
      },
      network: {
        connectionStatus: 'disconnected',
        pendingMessages: new Set(),
        lastSync: null,
        retryQueue: [],
      },
    });

    console.log('✅ All data cleared');
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const syncService = new SyncService();
