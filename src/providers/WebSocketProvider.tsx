/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "src/providers/WebSocketProvider.tsx"
 *   type: "component"
 *   layer: "frontend"
 *   domain: "sync"
 *   purpose: "Provider React para gestión de conexión WebSocket, maneja eventos en tiempo real y sincronización bidireccional con backend"
 *
 * DEPENDENCIES:
 *   internal: ["@/types", "@/services/database", "@/services/sync", "@/store", "@/components/feedback", "@/services/logger"]
 *   external: ["react"]
 *   infrastructure: ["websocket"]
 *
 * CONTRACTS:
 *   exports: ["WebSocketProvider", "useWebSocketContext", "WebSocketContextValue"]
 *   inputs: ["WebSocketProviderProps"]
 *   outputs: ["WebSocketContextValue", "JSX.Element"]
 *   errors: ["ConnectionError", "ReconnectionError"]
 *
 * INTEGRATION:
 *   data_flow: "[Backend WS /realtime] → [WebSocket events] → [event handlers] → [Zustand store + IndexedDB] → [UI components]"
 *   events_emitted: ["typing"]
 *   events_consumed: ["connection", "message_received", "message_processing", "extension_response", "client_toggle", "extension_toggle", "message:new", "message:status", "typing:indicator", "conversation:read", "conversation:updated", "error"]
 *
 * IMPACT:
 *   used_by: ["App.tsx", "components/workspace"]
 *   uses: ["services/database", "services/sync", "store", "services/logger"]
 *   critical: true
 *
 * === DOC_END :: WebSocketProvider.tsx ===
 */

/**
 * WebSocket Provider
 * CONTRATO ESTRICTO - Broadcasts del Backend
 *
 * Eventos recibidos:
 * - connection: Conexión establecida
 * - message_received: Nuevo mensaje del cliente
 * - message_processing: Extensiones procesando
 * - extension_response: Respuesta de extensión
 * - client_toggle: Cliente conectado/desconectado
 * - extension_toggle: Extensión activada/desactivada
 * - message:new: Notificación de nuevo mensaje
 * - message:status: Estado de mensaje actualizado
 * - typing:indicator: Indicador de escritura
 * - error: Error del servidor
 */

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type {
  WebSocketEvent,
  ConnectionEvent,
  MessageReceivedEvent,
  MessageProcessingEvent,
  ExtensionResponseEvent,
  ClientToggleEvent,
  ExtensionToggleEvent,
  MessageNewEvent,
  MessageStatusEvent,
  TypingIndicatorEvent,
  ConversationReadEvent,
  ConversationUpdatedEvent,
  EnrichmentBatchEvent,
  ErrorEvent,
} from '@/types';
import { db } from '@/services/database';
import { syncService } from '@/services/sync';
import { useStore } from '@/store';
import { useToastStore } from '@/components/feedback';
import { logger } from '@/services/logger';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface WebSocketContextValue {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
  sendTyping: (conversationId: string, isTyping: boolean) => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTEXT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const WebSocketContext = createContext<WebSocketContextValue>({
  connected: false,
  reconnecting: false,
  error: null,
  sendTyping: () => {
    console.warn('sendTyping called before WebSocket is initialized');
  },
});

export const useWebSocketContext = () => useContext(WebSocketContext);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROVIDER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Zustand store actions
  const setConnectionStatus = useStore((s) => s.actions.setConnectionStatus);
  const addMessage = useStore((s) => s.actions.addMessage);
  const updateSimulationState = useStore((s) => s.actions.updateSimulationState);
  const addEnrichments = useStore((s) => s.actions.addEnrichments);
  const addToast = useToastStore((s) => s.addToast);

  // Config
  const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/realtime';
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 3000; // 3 seconds

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EVENT HANDLERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // NOTA: El conversationId viene del backend (UUID generado por adapter)
  // No se regenera en el frontend para mantener sincronización

  const handleConnection = useCallback((event: ConnectionEvent) => {
    console.log('✅ WebSocket connected:', event);
    logger.info('websocket', 'WebSocket connected', {
      event: 'connection',
      clientId: event.clientId,
      timestamp: event.timestamp,
    });

    setConnected(true);
    setReconnecting(false);
    setError(null);
    reconnectAttemptsRef.current = 0;
    setConnectionStatus('connected');
  }, [setConnectionStatus]);

  const handleMessageReceived = useCallback(async (event: MessageReceivedEvent) => {
    console.log('📨 Message received:', event.data);
    const message = event.data;

    // USAR el conversationId del backend (no re-generar)
    // El backend genera UUIDs consistentes por usuario/canal
    const conversationId = message.conversationId || message.metadata?.conversationId;
    
    if (!conversationId) {
      console.error('❌ Message missing conversationId:', message.id);
      return;
    }

    // Mensaje ya tiene conversationId correcto del backend
    const normalizedMessage = {
      ...message,
      conversationId,
    };

    logger.info('websocket', 'Message received', {
      event: 'message_received',
      messageId: normalizedMessage.id,
      conversationId,
      type: normalizedMessage.type,
      channel: normalizedMessage.channel,
      from: normalizedMessage.metadata.from,
      to: normalizedMessage.metadata.to,
    });

    // 1. Persist message in IndexedDB
    await db.addMessage(normalizedMessage);
    logger.debug('db', 'Message persisted to IndexedDB', { messageId: normalizedMessage.id });

    // 2. Ensure conversation exists
    const { entities, actions } = useStore.getState();
    let conversation = entities.conversations.get(conversationId);

    if (!conversation) {
      console.log(`📂 Creating new conversation: ${conversationId}`);

      // Create new conversation
      conversation = {
        id: conversationId,
        endUserId: normalizedMessage.metadata.from,
        channel: normalizedMessage.channel,
        status: 'active',
        lastMessage: {
          id: normalizedMessage.id,
          text: normalizedMessage.content.text || '[Media]',
          timestamp: normalizedMessage.metadata.timestamp,
          type: normalizedMessage.type,
        },
        unreadCount: 1,
        isPinned: false,
        createdAt: normalizedMessage.metadata.timestamp,
        updatedAt: normalizedMessage.metadata.timestamp,
      };

      // Save to IndexedDB
      await db.saveConversation(conversation);

      // Add to store
      if (conversation) {
        actions.addConversation(conversation);
      }
    }

    // 3. Ensure contact exists
    let contact = entities.contacts.get(normalizedMessage.metadata.from);

    if (!contact) {
      console.log(`👤 Creating new contact: ${normalizedMessage.metadata.from}`);

      // Create new contact (basic info, can be enriched later)
      contact = {
        id: normalizedMessage.metadata.from,
        name: normalizedMessage.metadata.from, // Use ID as default name
        status: 'online', // Assume online when they send a message
        channel: normalizedMessage.channel,
        metadata: {
          phoneNumber: normalizedMessage.metadata.from.startsWith('+') ? normalizedMessage.metadata.from : undefined,
          lastSeen: normalizedMessage.metadata.timestamp,
        },
      };

      // Save to IndexedDB
      await db.saveContact(contact);

      // Add to store
      actions.addContact(contact);
    }

    // 4. Update Zustand store with message
    addMessage(conversationId, normalizedMessage);

    // 5. Show notification if conversation is not active
    const { ui } = useStore.getState();
    if (ui.activeConversationId !== conversationId && normalizedMessage.type === 'incoming') {
      // Show toast notification for new incoming messages
      addToast({
        type: 'info',
        title: `Nuevo mensaje de ${contact.name}`,
        message: normalizedMessage.content.text || '[Media]',
        duration: 4000,
      });
      console.log(`🔔 New message from ${contact.name}`);
    }
  }, [addMessage, addToast]);

  const handleMessageProcessing = useCallback((event: MessageProcessingEvent) => {
    console.log('⚙️ Message processing:', event);
    // TODO: Show processing indicator in UI
  }, []);

  const handleExtensionResponse = useCallback(async (event: ExtensionResponseEvent) => {
    console.log('🔧 Extension response:', event.data);
    const message = event.data;

    // USAR el conversationId del backend (no re-generar)
    const conversationId = message.conversationId || message.metadata?.conversationId;
    
    if (!conversationId) {
      console.error('❌ Extension response missing conversationId:', message.id);
      return;
    }

    // Mensaje ya tiene conversationId correcto del backend
    const normalizedMessage = {
      ...message,
      conversationId,
    };

    // 1. Persist message in IndexedDB
    await db.addMessage(normalizedMessage);

    // 2. Ensure conversation exists (same logic as handleMessageReceived)
    const { entities, actions } = useStore.getState();
    let conversation = entities.conversations.get(conversationId);

    if (!conversation) {
      console.log(`📂 Creating new conversation for extension response: ${conversationId}`);

      // Para respuestas de extensiones, el endUserId es el destinatario (to)
      conversation = {
        id: conversationId,
        endUserId: normalizedMessage.metadata.to,
        channel: normalizedMessage.channel,
        status: 'active',
        lastMessage: {
          id: normalizedMessage.id,
          text: normalizedMessage.content.text || '[Media]',
          timestamp: normalizedMessage.metadata.timestamp,
          type: normalizedMessage.type,
        },
        unreadCount: 0, // Extension responses don't increment unread
        isPinned: false,
        createdAt: normalizedMessage.metadata.timestamp,
        updatedAt: normalizedMessage.metadata.timestamp,
      };

      await db.saveConversation(conversation);
      if (conversation) {
        actions.addConversation(conversation);
      }
    }

    // 3. Ensure contact exists for the destination (usually already exists)
    let contact = entities.contacts.get(normalizedMessage.metadata.to);

    if (!contact) {
      console.log(`👤 Creating new contact: ${normalizedMessage.metadata.to}`);

      contact = {
        id: normalizedMessage.metadata.to,
        name: normalizedMessage.metadata.to,
        status: 'online',
        channel: normalizedMessage.channel,
        metadata: {
          lastSeen: normalizedMessage.metadata.timestamp,
        },
      };

      await db.saveContact(contact);
      actions.addContact(contact);
    }

    // 4. Update Zustand store with message
    addMessage(conversationId, normalizedMessage);

    // 5. Show toast notification for extension responses
    const extensionName = normalizedMessage.metadata.extensionId || 'Extension';
    const { ui } = useStore.getState();
    if (ui.activeConversationId !== conversationId) {
      addToast({
        type: 'success',
        title: `Respuesta de ${extensionName}`,
        message: normalizedMessage.content.text || '[Media]',
        duration: 3000,
      });
    }
  }, [addMessage, addToast]);

  const handleClientToggle = useCallback(async (event: ClientToggleEvent) => {
    console.log('🔌 Client toggle:', event);

    // Fetch latest simulation status from API
    try {
      await syncService.loadSimulationStatus();
    } catch (error) {
      console.error('Failed to refresh simulation status:', error);
    }
  }, []);

  const handleExtensionToggle = useCallback(async (event: ExtensionToggleEvent) => {
    console.log('🔧 Extension toggle:', event);

    // Fetch latest simulation status from API
    try {
      await syncService.loadSimulationStatus();
    } catch (error) {
      console.error('Failed to refresh simulation status:', error);
    }
  }, []);

  const handleMessageNew = useCallback(async (event: MessageNewEvent) => {
    console.log('📨 Message:new:', event.data);

    // Same logic as handleMessageReceived
    // (delegate to avoid code duplication)
    await handleMessageReceived({
      type: 'message_received',
      data: event.data,
      timestamp: event.timestamp
    } as MessageReceivedEvent);
  }, [handleMessageReceived]);

  const handleMessageStatus = useCallback(async (event: MessageStatusEvent) => {
    console.log('📊 Message:status:', event.data);
    logger.info('websocket', 'Message status update received', {
      event: 'message:status',
      messageId: event.data.messageId,
      status: event.data.status,
      details: event.data.details,
    });

    const { messageId, status, timestamp, details } = event.data;

    // 1. Find message in store
    const { entities } = useStore.getState();

    // Search through all conversations to find the message
    for (const [convId, messages] of entities.messages.entries()) {
      const messageIndex = messages.findIndex((m) => m.id === messageId);

      if (messageIndex !== -1) {
        const message = messages[messageIndex];

        // 2. Update statusChain
        const updatedMessage = {
          ...message,
          statusChain: [
            ...message.statusChain,
            {
              status,
              timestamp,
              messageId,
              details,
            },
          ],
        };

        // 3. Update in IndexedDB
        await db.addMessage(updatedMessage);

        // 4. Update in store
        const updatedMessages = [...messages];
        updatedMessages[messageIndex] = updatedMessage;
        useStore.getState().actions.setMessages(convId, updatedMessages);

        console.log(`✅ Updated message ${messageId} status to ${status}`);
        break;
      }
    }
  }, []);

  const handleTypingIndicator = useCallback((event: TypingIndicatorEvent) => {
    console.log('⌨️ Typing indicator:', event.data);
    logger.debug('websocket', 'Typing indicator received', {
      event: 'typing:indicator',
      userId: event.data.userId,
      conversationId: event.data.conversationId,
      isTyping: event.data.isTyping,
    });

    const { userId, conversationId, isTyping } = event.data;

    // Update typing state in store
    const { actions } = useStore.getState();
    actions.setTyping(conversationId, userId, isTyping);
  }, []);

  const handleConversationRead = useCallback(async (event: ConversationReadEvent) => {
    console.log('📖 Conversation read:', event.data);
    logger.info('websocket', 'Conversation marked as read', {
      event: 'conversation:read',
      conversationId: event.data.conversationId,
      userId: event.data.userId,
      unreadCount: event.data.unreadCount,
    });

    const { conversationId, unreadCount, lastReadAt } = event.data;

    // 1. Update conversation in IndexedDB
    const { entities } = useStore.getState();
    const conversation = entities.conversations.get(conversationId);

    if (conversation) {
      const updatedConversation = {
        ...conversation,
        unreadCount,
        updatedAt: new Date().toISOString(),
      };

      await db.saveConversation(updatedConversation);

      // 2. Update in store
      useStore.getState().actions.updateConversation(conversationId, {
        unreadCount,
        updatedAt: new Date().toISOString(),
      });

      console.log(`✅ Updated conversation ${conversationId} unreadCount to ${unreadCount}`);
    }
  }, []);

  const handleConversationUpdated = useCallback(async (event: ConversationUpdatedEvent) => {
    console.log('🔄 Conversation updated:', event.data);
    logger.info('websocket', 'Conversation updated', {
      event: 'conversation:updated',
      conversationId: event.data.conversationId,
      updates: event.data.updates,
    });

    const { conversationId, updates } = event.data;

    // 1. Get conversation from store
    const { entities } = useStore.getState();
    const conversation = entities.conversations.get(conversationId);

    if (conversation) {
      // 2. Apply updates
      const updatedConversation = {
        ...conversation,
        ...(updates.lastMessage && { lastMessage: updates.lastMessage }),
        ...(updates.unreadCount !== undefined && { unreadCount: updates.unreadCount }),
        ...(updates.status && { status: updates.status }),
        ...(updates.assignedTo && { assignedTo: updates.assignedTo }),
        ...(updates.isPinned !== undefined && { isPinned: updates.isPinned }),
        updatedAt: updates.updatedAt || new Date().toISOString(),
      };

      // 3. Save to IndexedDB
      await db.saveConversation(updatedConversation);

      // 4. Update in store
      useStore.getState().actions.updateConversation(conversationId, updatedConversation);

      console.log(`✅ Updated conversation ${conversationId}`, updates);
    } else {
      console.warn(`⚠️ Conversation ${conversationId} not found, ignoring update`);
    }
  }, []);

  const handleError = useCallback((event: ErrorEvent) => {
    console.error('❌ WebSocket error:', event);
    setError(event.message);

    // Handle rate limiting
    if (event.code === 'RATE_LIMIT_EXCEEDED') {
      console.warn(`Rate limit exceeded. Retry after ${event.retryAfter}s`);
      addToast({
        type: 'warning',
        title: 'Rate limit excedido',
        message: `Por favor espera ${event.retryAfter}s antes de reintentar`,
        duration: 5000,
      });
    } else {
      // Show generic error toast
      addToast({
        type: 'error',
        title: 'Error de conexión',
        message: event.message,
        duration: 5000,
      });
    }
  }, [addToast]);

  /**
   * Handler: Batch de enrichments recibidos del Extension Host
   */
  const handleEnrichmentBatch = useCallback(async (event: EnrichmentBatchEvent) => {
    const { messageId, enrichments, processingTimeMs } = event.data;

    console.log(`🧩 Enrichments received for message ${messageId}:`, {
      count: enrichments.length,
      types: enrichments.map(e => e.type),
      processingTimeMs,
    });

    if (enrichments.length === 0) {
      return;
    }

    // 1. Guardar en Zustand store
    addEnrichments(messageId, enrichments);

    // 2. Persistir en IndexedDB
    try {
      await db.saveEnrichments(enrichments);
    } catch (error) {
      console.error('❌ Error saving enrichments to IndexedDB:', error);
    }

    // 3. Log para debugging
    logger.debug('websocket', 'Enrichments batch received', {
      messageId,
      count: enrichments.length,
      extensionIds: enrichments.map(e => e.extensionId),
      processingTimeMs,
    });
  }, [addEnrichments]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MESSAGE ROUTING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    try {
      const data: WebSocketEvent = JSON.parse(event.data);

      switch (data.type) {
        case 'connection':
          handleConnection(data as ConnectionEvent);
          break;
        case 'message_received':
          handleMessageReceived(data as MessageReceivedEvent);
          break;
        case 'message_processing':
          handleMessageProcessing(data as MessageProcessingEvent);
          break;
        case 'extension_response':
          handleExtensionResponse(data as ExtensionResponseEvent);
          break;
        case 'client_toggle':
          handleClientToggle(data as ClientToggleEvent);
          break;
        case 'extension_toggle':
          handleExtensionToggle(data as ExtensionToggleEvent);
          break;
        case 'message:new':
          handleMessageNew(data as MessageNewEvent);
          break;
        case 'message:status':
          handleMessageStatus(data as MessageStatusEvent);
          break;
        case 'typing:indicator':
          handleTypingIndicator(data as TypingIndicatorEvent);
          break;
        case 'conversation:read':
          handleConversationRead(data as ConversationReadEvent);
          break;
        case 'conversation:updated':
          handleConversationUpdated(data as ConversationUpdatedEvent);
          break;
        case 'enrichment:batch':
          handleEnrichmentBatch(data as EnrichmentBatchEvent);
          break;
        case 'enrichment:created':
          // Individual enrichment - treat as batch of 1
          handleEnrichmentBatch({
            ...data,
            type: 'enrichment:batch',
            data: {
              messageId: (data as any).data.messageId,
              enrichments: [(data as any).data.enrichment],
              processingTimeMs: 0,
            },
          } as EnrichmentBatchEvent);
          break;
        case 'error':
          handleError(data as ErrorEvent);
          break;
        case 'echo':
          console.log('🔊 Echo:', data);
          break;
        default:
          console.warn('Unknown WebSocket event:', data);
      }
    } catch (err) {
      console.error('Failed to parse WebSocket message:', err);
    }
  }, [
    handleConnection,
    handleMessageReceived,
    handleMessageProcessing,
    handleExtensionResponse,
    handleClientToggle,
    handleExtensionToggle,
    handleMessageNew,
    handleMessageStatus,
    handleTypingIndicator,
    handleConversationRead,
    handleConversationUpdated,
    handleEnrichmentBatch,
    handleError,
  ]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OUTGOING MESSAGES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ Cannot send typing indicator: WebSocket not connected');
      logger.warn('websocket', 'Cannot send typing indicator: WebSocket not connected', {
        conversationId,
        isTyping,
      });
      return;
    }

    const event = {
      type: 'typing',
      conversationId,
      isTyping,
      timestamp: new Date().toISOString(),
    };

    console.log('⌨️ Sending typing indicator:', event);
    logger.debug('websocket', 'Sending typing indicator', {
      event: 'typing',
      conversationId,
      isTyping,
    });

    wsRef.current.send(JSON.stringify(event));
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONNECTION MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('⚠️ WebSocket already connected');
      return;
    }

    console.log(`🔌 Connecting to ${WS_URL}...`);

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('✅ WebSocket connection opened');
        setConnected(true);
        setReconnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
        setConnectionStatus('connected');
      };

      ws.onmessage = handleWebSocketMessage;

      ws.onerror = (event) => {
        console.error('❌ WebSocket error:', event);
        setError('WebSocket connection error');
        setConnectionStatus('disconnected');
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket connection closed');
        setConnected(false);
        setConnectionStatus('disconnected');

        // Attempt reconnection
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          setReconnecting(true);
          reconnectAttemptsRef.current += 1;

          const delay = RECONNECT_INTERVAL * Math.pow(2, reconnectAttemptsRef.current - 1);
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error('❌ Max reconnection attempts reached');
          setError('Connection lost. Please refresh the page.');
          setReconnecting(false);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to establish WebSocket connection');
    }
  }, [WS_URL, handleWebSocketMessage, setConnectionStatus]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnected(false);
    setReconnecting(false);
    setConnectionStatus('disconnected');
  }, [setConnectionStatus]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LIFECYCLE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  useEffect(() => {
    // Initialize database and sync
    const initialize = async () => {
      try {
        // 0. Initialize logger
        await logger.init();
        console.log('✅ Logger initialized');
        logger.info('system', 'Application initializing', {});

        // 1. Initialize IndexedDB
        await db.init();
        console.log('✅ IndexedDB initialized');
        logger.info('db', 'IndexedDB initialized', {});

        // 2. Load data from IndexedDB ONLY (no backend sync yet)
        // Backend sync will happen after login via syncService.syncFromBackend()
        await syncService.loadFromIndexedDB();
        console.log('✅ Local data loaded from IndexedDB');
        logger.info('sync', 'Local data loaded from IndexedDB', {});

        // 3. Connect WebSocket
        connect();
        logger.info('websocket', 'WebSocket connection initiated', {});
      } catch (error) {
        console.error('❌ Initialization failed:', error);
        logger.critical('system', 'Application initialization failed', {
          error: error instanceof Error ? error.message : String(error),
        });
        setError('Failed to initialize application');
      }
    };

    initialize();

    // Cleanup
    return () => {
      logger.info('system', 'Application shutting down', {});
      disconnect();
    };
  }, [connect, disconnect]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const value: WebSocketContextValue = {
    connected,
    reconnecting,
    error,
    sendTyping,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
