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
import { useStore } from '@/store';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface WebSocketContextValue {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTEXT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const WebSocketContext = createContext<WebSocketContextValue>({
  connected: false,
  reconnecting: false,
  error: null,
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

  // Config
  const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5173/realtime';
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 3000; // 3 seconds

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EVENT HANDLERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const handleConnection = useCallback((event: ConnectionEvent) => {
    console.log('✅ WebSocket connected:', event);
    setConnected(true);
    setReconnecting(false);
    setError(null);
    reconnectAttemptsRef.current = 0;
    setConnectionStatus('connected');
  }, [setConnectionStatus]);

  const handleMessageReceived = useCallback(async (event: MessageReceivedEvent) => {
    console.log('📨 Message received:', event.data);

    // 1. Persist in IndexedDB
    await db.addMessage(event.data);

    // 2. Update Zustand store
    addMessage(event.data.conversationId, event.data);

    // 3. Show notification if conversation is not active
    // TODO: Check if conversation is active before showing notification
  }, [addMessage]);

  const handleMessageProcessing = useCallback((event: MessageProcessingEvent) => {
    console.log('⚙️ Message processing:', event);
    // TODO: Show processing indicator in UI
  }, []);

  const handleExtensionResponse = useCallback(async (event: ExtensionResponseEvent) => {
    console.log('🔧 Extension response:', event.data);

    // 1. Persist in IndexedDB
    await db.addMessage(event.data);

    // 2. Update Zustand store
    addMessage(event.data.conversationId, event.data);
  }, [addMessage]);

  const handleClientToggle = useCallback((event: ClientToggleEvent) => {
    console.log('🔌 Client toggle:', event);

    // Update simulation state in Zustand
    // TODO: Fetch latest simulation status from API
  }, []);

  const handleExtensionToggle = useCallback((event: ExtensionToggleEvent) => {
    console.log('🔧 Extension toggle:', event);

    // Update simulation state in Zustand
    // TODO: Fetch latest simulation status from API
  }, []);

  const handleMessageNew = useCallback(async (event: MessageNewEvent) => {
    console.log('📨 Message:new:', event.data);

    // Same as message_received
    await db.addMessage(event.data);
    addMessage(event.data.conversationId, event.data);
  }, [addMessage]);

  const handleMessageStatus = useCallback((event: MessageStatusEvent) => {
    console.log('📊 Message:status:', event.data);

    // TODO: Update message status in store
  }, []);

  const handleTypingIndicator = useCallback((event: TypingIndicatorEvent) => {
    console.log('⌨️ Typing indicator:', event.data);

    // TODO: Update typing state in store
  }, []);

  const handleError = useCallback((event: ErrorEvent) => {
    console.error('❌ WebSocket error:', event);
    setError(event.message);

    // Handle rate limiting
    if (event.code === 'RATE_LIMIT_EXCEEDED') {
      console.warn(`Rate limit exceeded. Retry after ${event.retryAfter}s`);
      // TODO: Show user notification
    }
  }, []);

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
    // Initialize database
    db.init().catch(console.error);

    // Connect WebSocket
    connect();

    // Cleanup
    return () => {
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
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
