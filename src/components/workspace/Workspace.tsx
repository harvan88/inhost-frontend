import ActivityBar from './ActivityBar';
import PrimarySidebar from './PrimarySidebar';
import EditorGroups from './EditorGroups';
import ToolPanels from './ToolPanels';
import { useWebSocket } from '@hooks/useWebSocket';
import { useStore } from '@/store';
import type { Message, WebSocketMessage } from '@/types';
import { useCallback } from 'react';

/**
 * Workspace - Layout principal estilo VS Code
 *
 * Estructura:
 * ┌─────────┬──────────────┬───────────────────┬─────────────┐
 * │ Activity│ Primary      │ Editor Groups     │ Tool        │
 * │ Bar     │ Sidebar      │ (Tabs)            │ Panels      │
 * └─────────┴──────────────┴───────────────────┴─────────────┘
 *
 * Responsabilidades:
 * - Orquestar layout de 4 columnas
 * - Manejar WebSocket connection
 * - Pasar datos entre componentes
 */
export default function Workspace() {
  const addMessage = useStore((state) => state.actions.addMessage);
  const setConnectionStatus = useStore((state) => state.actions.setConnectionStatus);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback(
    (msg: WebSocketMessage) => {
      console.log('WebSocket message:', msg);

      if (msg.type === 'new_message' && msg.data) {
        const newMessage = msg.data as Message;
        // TODO: Implementar lógica para encontrar/crear conversación correcta
        // Por ahora, añadimos a la conversación activa
        const conversationId = 'conv-1';
        addMessage(conversationId, newMessage);
      }
    },
    [addMessage]
  );

  // WebSocket connection
  const { connected } = useWebSocket({
    onMessage: handleWebSocketMessage,
  });

  // Sync connection status to store
  useCallback(() => {
    setConnectionStatus(connected ? 'connected' : 'disconnected');
  }, [connected, setConnectionStatus])();

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Activity Bar - Fixed left */}
      <ActivityBar />

      {/* Primary Sidebar - Resizable */}
      <PrimarySidebar />

      {/* Editor Groups - Flexible center */}
      <EditorGroups />

      {/* Tool Panels - Resizable right */}
      <ToolPanels />
    </div>
  );
}
