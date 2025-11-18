import ActivityBar from './ActivityBar';
import PrimarySidebar from './PrimarySidebar';
import EditorGroups from './EditorGroups';
import { useWebSocket } from '@hooks/useWebSocket';
import { useStore } from '@/store';
import type { Message, WebSocketMessage } from '@/types';
import { useCallback } from 'react';

/**
 * Workspace - Arquitectura de Tres Niveles
 *
 * Modelo arquitectónico adaptado de VS Code:
 *
 * ┌──────────────┬──────────────────┬────────────────────────────┐
 * │ Activity Bar │ Sidebar          │ Contenedor Dinámico        │
 * │ (Nivel 1)    │ Contextual       │ (Nivel 3)                  │
 * │              │ (Nivel 2)        │                            │
 * └──────────────┴──────────────────┴────────────────────────────┘
 *
 * Nivel 1 - Activity Bar:
 *   Selecciona el dominio (Mensajes, Contactos, Herramientas)
 *   NO muestra contenido, solo controla qué lista mostrar
 *
 * Nivel 2 - Sidebar Contextual:
 *   Muestra lista de entidades del dominio seleccionado
 *   Contenido 100% dependiente del Activity Bar
 *
 * Nivel 3 - Contenedor Dinámico:
 *   Área flexible que muestra la vista del elemento seleccionado
 *   Soporta múltiples vistas en pestañas (workspace multi-tab)
 *   Alberga: ChatArea, ContactArea, ToolArea, etc.
 *
 * Responsabilidades:
 * - Orquestar layout de 3 niveles desacoplados
 * - Manejar WebSocket connection
 * - Coordinar navegación entre niveles
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
      {/* Nivel 1: Activity Bar - Selección de dominio */}
      <ActivityBar />

      {/* Nivel 2: Sidebar Contextual - Lista de entidades */}
      <PrimarySidebar />

      {/* Nivel 3: Contenedor Dinámico - Vista de entidad seleccionada */}
      <EditorGroups />
    </div>
  );
}
