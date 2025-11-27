/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "src/services/database.ts"
 *   type: "service"
 *   layer: "frontend"
 *   domain: "database"
 *   purpose: "Wrapper de IndexedDB que implementa persistencia local para mensajes, contactos y conversaciones. Source of truth del frontend en arquitectura de 3 capas: IndexedDB → Zustand → UI"
 *
 * DEPENDENCIES:
 *   internal: ["@/types"]
 *   external: ["idb"]
 *   infrastructure: ["IndexedDB"]
 *
 * CONTRACTS:
 *   exports: ["DatabaseService", "db"]
 *   inputs: ["MessageEnvelope", "Contact", "Conversation", "string:id", "string:entity", "Date", "number"]
 *   outputs: ["Promise<void>", "Promise<MessageEnvelope | undefined>", "Promise<MessageEnvelope[]>", "Promise<Contact[]>", "Promise<Conversation[]>", "Promise<number>"]
 *   errors: ["ConstraintError"]
 *
 * INTEGRATION:
 *   data_flow: "[WebSocketProvider/sync/store] → [DatabaseService methods] → [IndexedDB transactions] → [Browser storage]"
 *   events_emitted: []
 *   events_consumed: []
 *
 * IMPACT:
 *   used_by: ["providers/WebSocketProvider", "store/index.ts", "services/sync.ts"]
 *   uses: ["idb", "@/types"]
 *   critical: true
 *
 * === DOC_END :: database.ts ===
 */

/**
 * IndexedDB Database Service
 * Persistencia local para mensajes del sistema de simulación INHOST
 *
 * CONTRATO ESTRICTO: MessageEnvelope
 * Source of Truth: IndexedDB → Zustand → UI
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type {
  MessageEnvelope,
  Contact,
  Conversation,
} from '@/types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATABASE SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface InhostDB extends DBSchema {
  // Mensajes (MessageEnvelope completo del backend)
  messages: {
    key: string;                 // id (UUID)
    value: MessageEnvelope;
    indexes: {
      'conversationId': string;
      'timestamp': string;
      'type': string;
      'channel': string;
      'conversationId-timestamp': [string, string];
    };
  };

  // Contactos (cache enriquecido)
  contacts: {
    key: string;                 // id (derivado de metadata.from)
    value: Contact;
  };

  // Conversaciones (derivadas de mensajes)
  conversations: {
    key: string;                 // conversationId (UUID)
    value: Conversation;
    indexes: {
      'updatedAt': string;
      'channel': string;
    };
  };

  // Estado de sincronización
  sync_state: {
    key: string;                 // 'messages' | 'contacts' | 'conversations'
    value: {
      entity: string;
      lastSync: Date;
      lastMessageId?: string;
    };
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATABASE SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class DatabaseService {
  private db: IDBPDatabase<InhostDB> | null = null;
  private readonly DB_NAME = 'inhost-chat-db';
  private readonly DB_VERSION = 1;

  /**
   * Inicializar base de datos
   */
  async init(): Promise<void> {
    if (this.db) return; // Ya inicializada

    this.db = await openDB<InhostDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`🔄 Upgrading database from v${oldVersion} to v${newVersion}`);

        // ObjectStore: messages
        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
          messageStore.createIndex('conversationId', 'conversationId');
          messageStore.createIndex('timestamp', 'metadata.timestamp');
          messageStore.createIndex('type', 'type');
          messageStore.createIndex('channel', 'channel');
          messageStore.createIndex('conversationId-timestamp', ['conversationId', 'metadata.timestamp']);
          console.log('✅ Created ObjectStore: messages');
        }

        // ObjectStore: contacts
        if (!db.objectStoreNames.contains('contacts')) {
          db.createObjectStore('contacts', { keyPath: 'id' });
          console.log('✅ Created ObjectStore: contacts');
        }

        // ObjectStore: conversations
        if (!db.objectStoreNames.contains('conversations')) {
          const convStore = db.createObjectStore('conversations', { keyPath: 'id' });
          convStore.createIndex('updatedAt', 'updatedAt');
          convStore.createIndex('channel', 'channel');
          console.log('✅ Created ObjectStore: conversations');
        }

        // ObjectStore: sync_state
        if (!db.objectStoreNames.contains('sync_state')) {
          db.createObjectStore('sync_state', { keyPath: 'entity' });
          console.log('✅ Created ObjectStore: sync_state');
        }
      },
    });

    console.log('✅ Database initialized');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MESSAGES CRUD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Agregar un mensaje
   */
  async addMessage(message: MessageEnvelope): Promise<void> {
    await this.ensureInitialized();
    try {
      await this.db!.add('messages', message);
      console.log(`💾 Message saved: ${message.id}`);
    } catch (error) {
      // Si el mensaje ya existe, actualizar
      if ((error as Error).name === 'ConstraintError') {
        await this.db!.put('messages', message);
        console.log(`🔄 Message updated: ${message.id}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Agregar múltiples mensajes (batch)
   */
  async addMessages(messages: MessageEnvelope[]): Promise<void> {
    await this.ensureInitialized();
    const tx = this.db!.transaction('messages', 'readwrite');

    await Promise.all([
      ...messages.map(msg => tx.store.put(msg)), // put para evitar errores de duplicados
      tx.done
    ]);

    console.log(`💾 Batch saved: ${messages.length} messages`);
  }

  /**
   * Obtener un mensaje por ID
   */
  async getMessage(id: string): Promise<MessageEnvelope | undefined> {
    await this.ensureInitialized();
    return this.db!.get('messages', id);
  }

  /**
   * Obtener todos los mensajes de una conversación
   */
  async getMessagesByConversation(conversationId: string, limit = 100): Promise<MessageEnvelope[]> {
    await this.ensureInitialized();

    const messages = await this.db!.getAllFromIndex(
      'messages',
      'conversationId',
      conversationId
    );

    // Ordenar por timestamp (más recientes primero)
    const sorted = messages.sort((a, b) =>
      new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime()
    );

    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Obtener todos los mensajes (con límite opcional)
   */
  async getAllMessages(limit?: number): Promise<MessageEnvelope[]> {
    await this.ensureInitialized();

    const messages = await this.db!.getAllFromIndex('messages', 'timestamp');

    // Ordenar por timestamp (más recientes primero)
    const sorted = messages.sort((a, b) =>
      new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime()
    );

    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Eliminar un mensaje
   */
  async deleteMessage(id: string): Promise<void> {
    await this.ensureInitialized();
    await this.db!.delete('messages', id);
    console.log(`🗑️ Message deleted: ${id}`);
  }

  /**
   * Eliminar mensajes antiguos (garbage collection)
   */
  async deleteOldMessages(olderThanDays = 30): Promise<number> {
    await this.ensureInitialized();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    const cutoffISO = cutoffDate.toISOString();

    const allMessages = await this.db!.getAll('messages');
    const toDelete = allMessages.filter(msg => msg.metadata.timestamp < cutoffISO);

    const tx = this.db!.transaction('messages', 'readwrite');
    await Promise.all([
      ...toDelete.map(msg => tx.store.delete(msg.id)),
      tx.done
    ]);

    console.log(`🗑️ Deleted ${toDelete.length} old messages (older than ${olderThanDays} days)`);
    return toDelete.length;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONTACTS CRUD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Guardar/actualizar contacto
   */
  async saveContact(contact: Contact): Promise<void> {
    await this.ensureInitialized();
    await this.db!.put('contacts', contact);
    console.log(`💾 Contact saved: ${contact.id}`);
  }

  /**
   * Obtener contacto por ID
   */
  async getContact(id: string): Promise<Contact | undefined> {
    await this.ensureInitialized();
    return this.db!.get('contacts', id);
  }

  /**
   * Obtener todos los contactos
   */
  async getAllContacts(): Promise<Contact[]> {
    await this.ensureInitialized();
    return this.db!.getAll('contacts');
  }

  /**
   * Eliminar contacto
   */
  async deleteContact(id: string): Promise<void> {
    await this.ensureInitialized();
    await this.db!.delete('contacts', id);
    console.log(`🗑️ Contact deleted: ${id}`);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONVERSATIONS CRUD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Guardar/actualizar conversación
   */
  async saveConversation(conversation: Conversation): Promise<void> {
    await this.ensureInitialized();
    await this.db!.put('conversations', conversation);
  }

  /**
   * Obtener conversación por ID
   */
  async getConversation(id: string): Promise<Conversation | undefined> {
    await this.ensureInitialized();
    return this.db!.get('conversations', id);
  }

  /**
   * Obtener todas las conversaciones
   */
  async getAllConversations(): Promise<Conversation[]> {
    await this.ensureInitialized();

    const conversations = await this.db!.getAllFromIndex('conversations', 'updatedAt');

    // Ordenar por updatedAt (más recientes primero)
    return conversations.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Eliminar conversación
   */
  async deleteConversation(id: string): Promise<void> {
    await this.ensureInitialized();
    await this.db!.delete('conversations', id);
    console.log(`🗑️ Conversation deleted: ${id}`);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SYNC STATE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Obtener estado de sincronización
   */
  async getSyncState(entity = 'messages'): Promise<{ entity: string; lastSync: Date; lastMessageId?: string } | undefined> {
    await this.ensureInitialized();
    return this.db!.get('sync_state', entity);
  }

  /**
   * Actualizar estado de sincronización
   */
  async updateSyncState(entity: string, lastSync: Date, lastMessageId?: string): Promise<void> {
    await this.ensureInitialized();
    await this.db!.put('sync_state', { entity, lastSync, lastMessageId });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITIES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Derivar conversaciones desde mensajes
   * (Para migración o reconstrucción)
   */
  async deriveConversationsFromMessages(): Promise<Conversation[]> {
    await this.ensureInitialized();

    const allMessages = await this.getAllMessages();

    // Agrupar por conversationId
    const grouped = allMessages.reduce((acc, msg) => {
      const convId = msg.conversationId;
      if (!acc[convId]) acc[convId] = [];
      acc[convId].push(msg);
      return acc;
    }, {} as Record<string, MessageEnvelope[]>);

    // Crear conversaciones
    const conversations: Conversation[] = [];

    for (const [conversationId, messages] of Object.entries(grouped)) {
      const sorted = messages.sort((a, b) =>
        new Date(a.metadata.timestamp).getTime() - new Date(b.metadata.timestamp).getTime()
      );

      const lastMsg = sorted[sorted.length - 1];
      const firstMsg = sorted[0];

      const conversation: Conversation = {
        id: conversationId,
        endUserId: lastMsg.metadata.from, // Asumimos que 'from' es el contacto
        channel: lastMsg.channel,
        status: 'active',
        lastMessage: {
          id: lastMsg.id,
          text: lastMsg.content.text || '[Media]',
          timestamp: lastMsg.metadata.timestamp,
          type: lastMsg.type,
        },
        unreadCount: 0, // TODO: calcular basado en statusChain
        isPinned: false,
        createdAt: firstMsg.metadata.timestamp,
        updatedAt: lastMsg.metadata.timestamp,
      };

      conversations.push(conversation);

      // Guardar en BD
      await this.saveConversation(conversation);
    }

    console.log(`✅ Derived ${conversations.length} conversations from messages`);
    return conversations;
  }

  /**
   * Limpiar toda la base de datos
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();

    const tx = this.db!.transaction(
      ['messages', 'contacts', 'conversations', 'sync_state'],
      'readwrite'
    );

    await Promise.all([
      tx.objectStore('messages').clear(),
      tx.objectStore('contacts').clear(),
      tx.objectStore('conversations').clear(),
      tx.objectStore('sync_state').clear(),
      tx.done
    ]);

    console.log('🗑️ Database cleared');
  }

  /**
   * Obtener estadísticas de la base de datos
   */
  async getStats(): Promise<{
    messages: number;
    contacts: number;
    conversations: number;
    oldestMessage?: string;
    newestMessage?: string;
  }> {
    await this.ensureInitialized();

    const [messages, contacts, conversations] = await Promise.all([
      this.db!.count('messages'),
      this.db!.count('contacts'),
      this.db!.count('conversations'),
    ]);

    const allMessages = await this.getAllMessages();
    const sorted = allMessages.sort((a, b) =>
      new Date(a.metadata.timestamp).getTime() - new Date(b.metadata.timestamp).getTime()
    );

    return {
      messages,
      contacts,
      conversations,
      oldestMessage: sorted[0]?.metadata.timestamp,
      newestMessage: sorted[sorted.length - 1]?.metadata.timestamp,
    };
  }

  /**
   * Asegurar que la base de datos está inicializada
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  /**
   * Reparar mensajes con conversationId undefined (datos corruptos)
   * Se ejecuta automáticamente al sincronizar
   */
  async repairCorruptedMessages(): Promise<number> {
    const database = await this.initDB();
    const tx = database.transaction('messages', 'readwrite');
    const store = tx.objectStore('messages');

    const allMessages = await store.getAll();
    let deletedCount = 0;

    for (const message of allMessages) {
      if (!message.conversationId || message.conversationId === 'undefined') {
        await store.delete(message.id);
        deletedCount++;
      }
    }

    await tx.done;
    console.log(`🔧 Repaired ${deletedCount} corrupted messages`);
    return deletedCount;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const db = new DatabaseService();
