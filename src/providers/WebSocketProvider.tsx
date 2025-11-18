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
  const addToast = useToastStore((s) => s.addToast);

  // Config
  const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5173/realtime';
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 3000; // 3 seconds

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER FUNCTIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Genera un conversationId consistente basado en channel + from
   * Esto asegura que todos los mensajes del mismo contacto se agrupen en la misma conversación
   *
   * @param channel - Canal de comunicación (whatsapp, telegram, etc)
   * @param from - ID del contacto/número de teléfono
   * @returns conversationId normalizado
   */
  const getConversationId = useCallback((channel: string, from: string): string => {
    // Normalizar: channel-from
    // Ejemplo: "whatsapp-+52 1234 5678" o "telegram-@username"
    return `${channel}-${from}`;
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EVENT HANDLERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

    // Normalizar conversationId basado en channel + from
    const normalizedConversationId = getConversationId(message.channel, message.metadata.from);

    // Actualizar mensaje con conversationId normalizado
    const normalizedMessage = {
      ...message,
      conversationId: normalizedConversationId,
    };

    logger.info('websocket', 'Message received', {
      event: 'message_received',
      messageId: normalizedMessage.id,
      conversationId: normalizedConversationId,
      originalConversationId: message.conversationId,
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
    let conversation = entities.conversations.get(normalizedConversationId);

    if (!conversation) {
      console.log(`📂 Creating new conversation: ${normalizedConversationId}`);

      // Create new conversation
      conversation = {
        id: normalizedConversationId,
        entityId: normalizedMessage.metadata.from,
        channel: normalizedMessage.channel,
        lastMessage: {
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
      actions.addConversation(conversation);
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
    addMessage(normalizedConversationId, normalizedMessage);

    // 5. Show notification if conversation is not active
    const { ui } = useStore.getState();
    if (ui.activeConversationId !== normalizedConversationId && normalizedMessage.type === 'incoming') {
      // Show toast notification for new incoming messages
      addToast({
        type: 'info',
        message: `Nuevo mensaje de ${contact.name}`,
        description: normalizedMessage.content.text || '[Media]',
        duration: 4000,
      });
      console.log(`🔔 New message from ${contact.name}`);
    }
  }, [addMessage, addToast, getConversationId]);

  const handleMessageProcessing = useCallback((event: MessageProcessingEvent) => {
    console.log('⚙️ Message processing:', event);
    // TODO: Show processing indicator in UI
  }, []);

  const handleExtensionResponse = useCallback(async (event: ExtensionResponseEvent) => {
    console.log('🔧 Extension response:', event.data);
    const message = event.data;

    // Normalizar conversationId basado en channel + to (para respuestas, "to" es el destinatario original)
    // Las extensiones responden al número que envió el mensaje original
    const normalizedConversationId = getConversationId(message.channel, message.metadata.to);

    // Actualizar mensaje con conversationId normalizado
    const normalizedMessage = {
      ...message,
      conversationId: normalizedConversationId,
    };

    // 1. Persist message in IndexedDB
    await db.addMessage(normalizedMessage);

    // 2. Ensure conversation exists (same logic as handleMessageReceived)
    const { entities, actions } = useStore.getState();
    let conversation = entities.conversations.get(normalizedConversationId);

    if (!conversation) {
      console.log(`📂 Creating new conversation for extension response: ${normalizedConversationId}`);

      // Para respuestas de extensiones, el entityId es el destinatario (to) porque es la conversación con ese contacto
      conversation = {
        id: normalizedConversationId,
        entityId: normalizedMessage.metadata.to,
        channel: normalizedMessage.channel,
        lastMessage: {
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
      actions.addConversation(conversation);
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
    addMessage(normalizedConversationId, normalizedMessage);

    // 5. Show toast notification for extension responses
    const extensionName = normalizedMessage.metadata.extensionId || 'Extension';
    const { ui } = useStore.getState();
    if (ui.activeConversationId !== normalizedConversationId) {
      addToast({
        type: 'success',
        message: `Respuesta de ${extensionName}`,
        description: normalizedMessage.content.text || '[Media]',
        duration: 3000,
      });
    }
  }, [addMessage, addToast, getConversationId]);

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

  const handleError = useCallback((event: ErrorEvent) => {
    console.error('❌ WebSocket error:', event);
    setError(event.message);

    // Handle rate limiting
    if (event.code === 'RATE_LIMIT_EXCEEDED') {
      console.warn(`Rate limit exceeded. Retry after ${event.retryAfter}s`);
      addToast({
        type: 'warning',
        message: 'Rate limit excedido',
        description: `Por favor espera ${event.retryAfter}s antes de reintentar`,
        duration: 5000,
      });
    } else {
      // Show generic error toast
      addToast({
        type: 'error',
        message: 'Error de conexión',
        description: event.message,
        duration: 5000,
      });
    }
  }, [addToast]);

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
      type: 'typing:indicator',
      data: {
        conversationId,
        userId: 'system', // TODO: Get from auth context
        isTyping,
        timestamp: new Date().toISOString(),
      },
    };

    console.log('⌨️ Sending typing indicator:', event);
    logger.debug('websocket', 'Sending typing indicator', {
      event: 'typing:indicator',
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

        // 2. Load data from IndexedDB and API
        await syncService.initialSync();
        console.log('✅ Initial sync complete');
        logger.info('sync', 'Initial sync completed', {});

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
