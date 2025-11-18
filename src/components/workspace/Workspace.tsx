import ActivityBar from './ActivityBar';
import PrimarySidebar from './PrimarySidebar';
import Canvas from './Canvas';
import { useWebSocket } from '@hooks/useWebSocket';
import { useStore } from '@/store';
import type { Message, WebSocketMessage } from '@/types';
import { useCallback } from 'react';
import { useTheme } from '@/theme';

/**
 * Workspace - Arquitectura de Tres Niveles (Versión Formal)
 *
 * Modelo arquitectónico adaptado de VS Code:
 *
 * ┌──────────────┬──────────────────┬────────────────────────────┐
 * │ Activity Bar │ Sidebar          │ Lienzo (Canvas)            │
 * │ (Nivel 1)    │ Contextual       │ (Nivel 3)                  │
 * │              │ (Nivel 2)        │                            │
 * └──────────────┴──────────────────┴────────────────────────────┘
 *
 * Arquitectura Completa:
 *
 * Nivel 1: Activity Bar
 *          ↓
 * Nivel 2: Sidebar Contextual
 *          ↓
 * Nivel 3: Lienzo (Canvas)
 *          ├─ Contenedor Dinámico 1 → Herramienta A (con tabs)
 *          ├─ Contenedor Dinámico 2 → Herramienta B (con tabs)
 *          └─ Contenedor Dinámico N → Herramienta N (con tabs)
 *
 * Nivel 1 - Activity Bar:
 *   Selecciona el dominio (Mensajes, Contactos, Herramientas)
 *   NO muestra contenido, solo controla qué lista mostrar
 *
 * Nivel 2 - Sidebar Contextual:
 *   Muestra lista de entidades del dominio seleccionado
 *   Contenido 100% dependiente del Activity Bar
 *
 * Nivel 3 - Lienzo (Canvas):
 *   Superficie estructural que alberga múltiples Contenedores Dinámicos
 *   Permite división del espacio (horizontal/vertical)
 *   Cada Contenedor Dinámico aloja una herramienta con tabs
 *   Soporta configuraciones complejas (split views, múltiples instancias)
 *
 * Responsabilidades:
 * - Orquestar layout de 3 niveles desacoplados
 * - Manejar WebSocket connection
 * - Coordinar navegación entre niveles
 */
export default function Workspace() {
  const addMessage = useStore((state) => state.actions.addMessage);
  const setConnectionStatus = useStore((state) => state.actions.setConnectionStatus);
  const { theme } = useTheme();

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
    <div
      className="h-screen flex"
      style={{
        backgroundColor: theme.colors.neutral[50],
      }}
    >
      {/* Nivel 1: Activity Bar - Selección de dominio */}
      <ActivityBar />

      {/* Nivel 2: Sidebar Contextual - Lista de entidades */}
      <PrimarySidebar />

      {/* Nivel 3: Lienzo (Canvas) - Superficie con múltiples Contenedores Dinámicos */}
      <Canvas />
    </div>
  );
}
