/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "C:\Users\harva\Documents\Trabajos\meetgar\FluxCoreChat\inhost-frontend\src\utils\seedDatabase.ts"
 *   type: "type"
 *   layer: "frontend"
 *   domain: "core"
 *   purpose: "Handles seed database functionality"
 *
 * DEPENDENCIES:
 *   internal: ["@/services/database","@/store"]
 *   external: []
 *   infrastructure: []
 *
 * CONTRACTS:
 *   exports: []
 *   inputs: "None"
 *   outputs: "["
 *   errors: "None"
 *
 * INTEGRATION:
 *   data_flow: "IndexedDB → Zustand → Component"
 *   events_emitted: []
 *   events_consumed: []
 *
 * IMPACT:
 *   used_by: "To be determined via dependency analysis"
 *   uses: ["@/services/database","@/store"]
 *   critical: false
 *
 * === DOC_END :: seedDatabase.ts ===
 */

/**
 * Seed Database - Datos Mock para Testing
 * Popula IndexedDB con conversaciones, contactos y mensajes de ejemplo
 */

import { db } from '@/services/database';
import type { Contact, Conversation, MessageEnvelope } from '@/types';
import { useStore } from '@/store';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const mockContacts: Contact[] = [
  {
    id: '+5491112345678',
    name: 'Juan Pérez',
    avatar: 'https://i.pravatar.cc/150?img=12',
    status: 'online',
    channel: 'whatsapp',
    metadata: {
      phoneNumber: '+5491112345678',
      email: 'juan.perez@example.com',
      lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutos atrás
    },
  },
  {
    id: '+5491187654321',
    name: 'María González',
    avatar: 'https://i.pravatar.cc/150?img=25',
    status: 'offline',
    channel: 'whatsapp',
    metadata: {
      phoneNumber: '+5491187654321',
      email: 'maria.gonzalez@example.com',
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    },
  },
  {
    id: '@carlos_tech',
    name: 'Carlos Rodríguez',
    avatar: 'https://i.pravatar.cc/150?img=33',
    status: 'away',
    channel: 'telegram',
    metadata: {
      lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutos atrás
    },
  },
  {
    id: 'web-user-123',
    name: 'Ana López',
    avatar: 'https://i.pravatar.cc/150?img=47',
    status: 'online',
    channel: 'web',
    metadata: {
      email: 'ana.lopez@example.com',
      lastSeen: new Date().toISOString(),
    },
  },
];

const mockConversations: Conversation[] = [
  {
    id: 'conv-550e8400-e29b-41d4-a716-446655440001',
    endUserId: '+5491112345678',
    channel: 'whatsapp',
    status: 'active',
    lastMessage: {
      id: 'msg-003-ext-ai', // FASE 2: Ahora el último mensaje es la respuesta de AI
      text: '¡Sí! Tenemos 15 unidades del Producto X en stock. El precio es $4,500 con envío gratis. ¿Te gustaría proceder con la compra? 😊',
      timestamp: new Date(Date.now() - 4 * 60 * 1000 + 45000).toISOString(),
      type: 'outgoing',
    },
    unreadCount: 0, // Ya fue respondido por la extensión
    isPinned: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
    updatedAt: new Date(Date.now() - 4 * 60 * 1000 + 45000).toISOString(), // Actualizado con la respuesta de AI
  },
  {
    id: 'conv-550e8400-e29b-41d4-a716-446655440002',
    endUserId: '+5491187654321',
    channel: 'whatsapp',
    status: 'active',
    lastMessage: {
      id: 'msg-006',
      text: 'Perfecto, muchas gracias!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      type: 'incoming',
    },
    unreadCount: 0,
    isPinned: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 días atrás
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'conv-550e8400-e29b-41d4-a716-446655440003',
    endUserId: '@carlos_tech',
    channel: 'telegram',
    status: 'active',
    lastMessage: {
      id: 'msg-008-ext-ai', // FASE 2: Respuesta técnica de AI
      text: 'Para integrar nuestra API REST:\n\n1️⃣ Obtén tu API key desde el dashboard\n2️⃣ Usa el endpoint: POST https://api.inhost.com/v1/messages...',
      timestamp: new Date(Date.now() - 29 * 60 * 1000 + 30000).toISOString(),
      type: 'outgoing',
    },
    unreadCount: 0, // Ya fue respondido por AI
    isPinned: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
    updatedAt: new Date(Date.now() - 29 * 60 * 1000 + 30000).toISOString(),
  },
  {
    id: 'conv-550e8400-e29b-41d4-a716-446655440004',
    endUserId: 'web-user-123',
    channel: 'web',
    status: 'active',
    lastMessage: {
      id: 'msg-009-ext-echo', // FASE 2: Respuesta de Echo extension
      text: '🔄 Echo: Hola! Necesito ayuda con mi pedido',
      timestamp: new Date(Date.now() - 59 * 1000).toISOString(),
      type: 'outgoing',
    },
    unreadCount: 0, // Ya fue procesado por Echo
    isPinned: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutos atrás
    updatedAt: new Date(Date.now() - 59 * 1000).toISOString(),
  },
];

const mockMessages: MessageEnvelope[] = [
  // ━━━ Conversación 1: Juan Pérez (WhatsApp) ━━━
  {
    id: 'msg-001',
    conversationId: 'conv-550e8400-e29b-41d4-a716-446655440001',
    type: 'incoming',
    channel: 'whatsapp',
    content: {
      text: 'Hola! Buenos días',
      contentType: 'text/plain',
    },
    metadata: {
      from: '+5491112345678',
      to: 'system',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
      platformMessageId: 'wamid.ABC123',
    },
    statusChain: [
      {
        status: 'received',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        messageId: 'msg-001',
      },
    ],
    context: {
      plan: 'free',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      source: 'whatsapp-cloud-api',
    },
  },
  {
    id: 'msg-002',
    conversationId: 'conv-550e8400-e29b-41d4-a716-446655440001',
    type: 'outgoing',
    channel: 'whatsapp',
    content: {
      text: 'Hola Juan! ¿En qué puedo ayudarte?',
      contentType: 'text/plain',
    },
    metadata: {
      from: 'system',
      to: '+5491112345678',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString(),
    },
    statusChain: [
      {
        status: 'sending',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString(),
        messageId: 'msg-002',
      },
      {
        status: 'sent',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 31000).toISOString(),
        messageId: 'msg-002',
      },
      {
        status: 'delivered',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 32000).toISOString(),
        messageId: 'msg-002',
      },
      {
        status: 'read',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60000).toISOString(),
        messageId: 'msg-002',
      },
    ],
    context: {
      plan: 'free',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString(),
    },
  },
  {
    id: 'msg-003',
    conversationId: 'conv-550e8400-e29b-41d4-a716-446655440001',
    type: 'incoming',
    channel: 'whatsapp',
    content: {
      text: '¿Tienen stock del producto X?',
      contentType: 'text/plain',
    },
    metadata: {
      from: '+5491112345678',
      to: 'system',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutos atrás
      platformMessageId: 'wamid.DEF456',
    },
    statusChain: [
      {
        status: 'received',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        messageId: 'msg-003',
      },
    ],
    context: {
      plan: 'free',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      source: 'whatsapp-cloud-api',
    },
  },
  // ━━━ FASE 2: Respuesta de Extensión AI ━━━
  {
    id: 'msg-003-ext-ai',
    conversationId: 'conv-550e8400-e29b-41d4-a716-446655440001',
    type: 'outgoing',
    channel: 'whatsapp',
    content: {
      text: '¡Sí! Tenemos 15 unidades del Producto X en stock. El precio es $4,500 con envío gratis. ¿Te gustaría proceder con la compra? 😊',
      contentType: 'text/plain',
    },
    metadata: {
      from: 'system',
      to: '+5491112345678',
      timestamp: new Date(Date.now() - 4 * 60 * 1000 + 45000).toISOString(), // 45 segundos después
      extensionId: 'ai', // 🔥 Extension ID - activa MessageFeedback
      originalMessageId: 'msg-003',
    },
    statusChain: [
      {
        status: 'sending',
        timestamp: new Date(Date.now() - 4 * 60 * 1000 + 45000).toISOString(),
        messageId: 'msg-003-ext-ai',
      },
      {
        status: 'sent',
        timestamp: new Date(Date.now() - 4 * 60 * 1000 + 46000).toISOString(),
        messageId: 'msg-003-ext-ai',
      },
      {
        status: 'delivered',
        timestamp: new Date(Date.now() - 4 * 60 * 1000 + 47000).toISOString(),
        messageId: 'msg-003-ext-ai',
      },
    ],
    context: {
      plan: 'premium',
      timestamp: new Date(Date.now() - 4 * 60 * 1000 + 45000).toISOString(),
      extension: {
        id: 'ai',
        name: 'AI Assistant',
        latency: 1200,
      },
    },
  },

  // ━━━ Conversación 2: María González (WhatsApp) ━━━
  {
    id: 'msg-004',
    conversationId: 'conv-550e8400-e29b-41d4-a716-446655440002',
    type: 'incoming',
    channel: 'whatsapp',
    content: {
      text: 'Hola, quiero hacer una consulta',
      contentType: 'text/plain',
    },
    metadata: {
      from: '+5491187654321',
      to: 'system',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 horas atrás
      platformMessageId: 'wamid.GHI789',
    },
    statusChain: [
      {
        status: 'received',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        messageId: 'msg-004',
      },
    ],
    context: {
      plan: 'free',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      source: 'whatsapp-cloud-api',
    },
  },
  {
    id: 'msg-005',
    conversationId: 'conv-550e8400-e29b-41d4-a716-446655440002',
    type: 'outgoing',
    channel: 'whatsapp',
    content: {
      text: 'Claro, dime en qué te puedo ayudar',
      contentType: 'text/plain',
    },
    metadata: {
      from: 'system',
      to: '+5491187654321',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 20000).toISOString(),
    },
    statusChain: [
      {
        status: 'sent',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 20000).toISOString(),
        messageId: 'msg-005',
      },
      {
        status: 'delivered',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 21000).toISOString(),
        messageId: 'msg-005',
      },
    ],
    context: {
      plan: 'free',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 20000).toISOString(),
    },
  },
  // ━━━ FASE 2: Respuesta de Extensión CRM ━━━
  {
    id: 'msg-005-ext-crm',
    conversationId: 'conv-550e8400-e29b-41d4-a716-446655440002',
    type: 'outgoing',
    channel: 'whatsapp',
    content: {
      text: 'Hola María! Veo que eres cliente VIP desde hace 2 años. Tengo una promoción especial para ti: 25% de descuento en tu próxima compra. ¿Te interesa?',
      contentType: 'text/plain',
    },
    metadata: {
      from: 'system',
      to: '+5491187654321',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString(),
      extensionId: 'crm', // 🔥 Extension CRM
      originalMessageId: 'msg-004',
    },
    statusChain: [
      {
        status: 'sent',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString(),
        messageId: 'msg-005-ext-crm',
      },
      {
        status: 'delivered',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 31000).toISOString(),
        messageId: 'msg-005-ext-crm',
      },
      {
        status: 'read',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 45000).toISOString(),
        messageId: 'msg-005-ext-crm',
      },
    ],
    context: {
      plan: 'premium',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString(),
      extension: {
        id: 'crm',
        name: 'CRM Intelligence',
        latency: 850,
      },
    },
  },
  {
    id: 'msg-006',
    conversationId: 'conv-550e8400-e29b-41d4-a716-446655440002',
    type: 'incoming',
    channel: 'whatsapp',
    content: {
      text: 'Perfecto, muchas gracias!',
      contentType: 'text/plain',
    },
    metadata: {
      from: '+5491187654321',
      to: 'system',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      platformMessageId: 'wamid.JKL012',
    },
    statusChain: [
      {
        status: 'received',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        messageId: 'msg-006',
      },
    ],
    context: {
      plan: 'free',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      source: 'whatsapp-cloud-api',
    },
  },

  // ━━━ Conversación 3: Carlos Rodríguez (Telegram) ━━━
  {
    id: 'msg-007',
    conversationId: 'conv-550e8400-e29b-41d4-a716-446655440003',
    type: 'incoming',
    channel: 'telegram',
    content: {
      text: 'Hola! Tengo una consulta técnica',
      contentType: 'text/plain',
    },
    metadata: {
      from: '@carlos_tech',
      to: 'system',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hora atrás
    },
    statusChain: [
      {
        status: 'received',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        messageId: 'msg-007',
      },
    ],
    context: {
      plan: 'free',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      source: 'telegram-bot-api',
    },
  },
  {
    id: 'msg-008',
    conversationId: 'conv-550e8400-e29b-41d4-a716-446655440003',
    type: 'incoming',
    channel: 'telegram',
    content: {
      text: '¿Cómo integro la API en mi sistema?',
      contentType: 'text/plain',
    },
    metadata: {
      from: '@carlos_tech',
      to: 'system',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutos atrás
    },
    statusChain: [
      {
        status: 'received',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        messageId: 'msg-008',
      },
    ],
    context: {
      plan: 'free',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      source: 'telegram-bot-api',
    },
  },
  // ━━━ FASE 2: Respuesta de Extensión AI con documentación técnica ━━━
  {
    id: 'msg-008-ext-ai',
    conversationId: 'conv-550e8400-e29b-41d4-a716-446655440003',
    type: 'outgoing',
    channel: 'telegram',
    content: {
      text: 'Para integrar nuestra API REST:\n\n1️⃣ Obtén tu API key desde el dashboard\n2️⃣ Usa el endpoint: POST https://api.inhost.com/v1/messages\n3️⃣ Headers: Authorization: Bearer {tu_api_key}\n4️⃣ Body: { "channel": "whatsapp", "to": "+549...", "text": "..." }\n\nDocumentación completa: https://docs.inhost.com/api',
      contentType: 'text/plain',
    },
    metadata: {
      from: 'system',
      to: '@carlos_tech',
      timestamp: new Date(Date.now() - 29 * 60 * 1000 + 30000).toISOString(),
      extensionId: 'ai', // 🔥 Extension AI - respuesta técnica
      originalMessageId: 'msg-008',
    },
    statusChain: [
      {
        status: 'sent',
        timestamp: new Date(Date.now() - 29 * 60 * 1000 + 30000).toISOString(),
        messageId: 'msg-008-ext-ai',
      },
      {
        status: 'delivered',
        timestamp: new Date(Date.now() - 29 * 60 * 1000 + 31000).toISOString(),
        messageId: 'msg-008-ext-ai',
      },
    ],
    context: {
      plan: 'premium',
      timestamp: new Date(Date.now() - 29 * 60 * 1000 + 30000).toISOString(),
      extension: {
        id: 'ai',
        name: 'AI Technical Assistant',
        latency: 950,
      },
    },
  },

  // ━━━ Conversación 4: Ana López (Web) ━━━
  {
    id: 'msg-009',
    conversationId: 'conv-550e8400-e29b-41d4-a716-446655440004',
    type: 'incoming',
    channel: 'web',
    content: {
      text: 'Hola! Necesito ayuda con mi pedido',
      contentType: 'text/plain',
    },
    metadata: {
      from: 'web-user-123',
      to: 'system',
      timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 minuto atrás
    },
    statusChain: [
      {
        status: 'received',
        timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        messageId: 'msg-009',
      },
    ],
    context: {
      plan: 'free',
      timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      source: 'web-widget',
    },
  },
  // ━━━ FASE 2: Respuesta de Extensión Echo (Testing) ━━━
  {
    id: 'msg-009-ext-echo',
    conversationId: 'conv-550e8400-e29b-41d4-a716-446655440004',
    type: 'outgoing',
    channel: 'web',
    content: {
      text: '🔄 Echo: Hola! Necesito ayuda con mi pedido',
      contentType: 'text/plain',
    },
    metadata: {
      from: 'system',
      to: 'web-user-123',
      timestamp: new Date(Date.now() - 59 * 1000).toISOString(), // 1 segundo después
      extensionId: 'echo', // 🔥 Extension Echo - solo repite el mensaje
      originalMessageId: 'msg-009',
    },
    statusChain: [
      {
        status: 'sent',
        timestamp: new Date(Date.now() - 59 * 1000).toISOString(),
        messageId: 'msg-009-ext-echo',
      },
    ],
    context: {
      plan: 'free',
      timestamp: new Date(Date.now() - 59 * 1000).toISOString(),
      extension: {
        id: 'echo',
        name: 'Echo Extension',
        latency: 50,
      },
    },
  },

  // ━━━ Mensaje con estado "failed" para testing ━━━
  {
    id: 'msg-010',
    conversationId: 'conv-550e8400-e29b-41d4-a716-446655440001',
    type: 'outgoing',
    channel: 'whatsapp',
    content: {
      text: 'Este mensaje falló al enviarse',
      contentType: 'text/plain',
    },
    metadata: {
      from: 'system',
      to: '+5491112345678',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    statusChain: [
      {
        status: 'sending',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        messageId: 'msg-010',
      },
      {
        status: 'failed',
        timestamp: new Date(Date.now() - 10 * 60 * 1000 + 5000).toISOString(),
        messageId: 'msg-010',
        details: 'Network timeout',
      },
    ],
    context: {
      plan: 'free',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEED FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function seedDatabase() {
  console.log('🌱 Seeding database with mock data...');

  try {
    // 1. Seed Contacts
    console.log(`📇 Adding ${mockContacts.length} contacts...`);
    for (const contact of mockContacts) {
      await db.saveContact(contact);
    }

    // 2. Seed Conversations
    console.log(`💬 Adding ${mockConversations.length} conversations...`);
    for (const conversation of mockConversations) {
      await db.saveConversation(conversation);
    }

    // 3. Seed Messages
    console.log(`📨 Adding ${mockMessages.length} messages...`);
    for (const message of mockMessages) {
      await db.addMessage(message);
    }

    // 4. Update Zustand Store
    console.log('🔄 Updating Zustand store...');

    const contactsMap = new Map(mockContacts.map((c) => [c.id, c]));
    const conversationsMap = new Map(mockConversations.map((c) => [c.id, c]));

    // Group messages by conversationId
    const messagesMap = new Map<string, MessageEnvelope[]>();
    for (const message of mockMessages) {
      const existing = messagesMap.get(message.conversationId) || [];
      existing.push(message);
      messagesMap.set(message.conversationId, existing);
    }

    // Sort messages by timestamp
    for (const [convId, messages] of messagesMap.entries()) {
      messages.sort((a, b) =>
        new Date(a.metadata.timestamp).getTime() - new Date(b.metadata.timestamp).getTime()
      );
    }

    useStore.setState({
      entities: {
        contacts: contactsMap,
        conversations: conversationsMap,
        messages: messagesMap,
      },
    });

    console.log('✅ Database seeded successfully!');
    console.log(`   - ${mockContacts.length} contacts`);
    console.log(`   - ${mockConversations.length} conversations`);
    console.log(`   - ${mockMessages.length} messages`);

    return {
      contacts: mockContacts.length,
      conversations: mockConversations.length,
      messages: mockMessages.length,
    };
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    throw error;
  }
}

/**
 * Clear all data from database
 */
export async function clearDatabase() {
  console.log('🗑️ Clearing database...');

  await db.clear();

  useStore.setState({
    entities: {
      conversations: new Map(),
      messages: new Map(),
      contacts: new Map(),
    },
  });

  console.log('✅ Database cleared');
}

/**
 * Reset database (clear + seed)
 */
export async function resetDatabase() {
  console.log('🔄 Resetting database...');
  await clearDatabase();
  await seedDatabase();
  console.log('✅ Database reset complete');
}
