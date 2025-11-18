import ActivityBar from './ActivityBar';
import PrimarySidebar from './PrimarySidebar';
import Canvas from './Canvas';
import { useWebSocket } from '@hooks/useWebSocket';
import { useStore } from '@/store';
import type { Message, WebSocketMessage } from '@/types';
import { useCallback } from 'react';
import { useTheme } from '@/theme';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { MobileWorkspace } from '@/components/mobile';

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
  const isMobile = useIsMobile();

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

  // RESPONSIVE SWITCHING: Mobile vs Desktop
  if (isMobile) {
    return <MobileWorkspace />;
  }

  // Desktop layout (existing)
  return (
    <div
      style={{
        position: 'fixed', // CONTRATO: Contenedor absoluto que toma dimensiones de viewport
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden', // CONTRATO: Evitar desbordamiento global
        backgroundColor: theme.colors.neutral[50],
      }}
    >
      {/* Nivel 1: Activity Bar - Posición absoluta (muralla inamovible) */}
      {/* CONTRATO: "Active bar tienen posición absoluta al lado izquierdo, nunca se desplaza o se mueve es una muralla" */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: theme.componentSizes.sidebar.activityBar, // 64px
          zIndex: theme.zIndex.sidebar,
          overflow: 'hidden',
        }}
      >
        <ActivityBar />
      </div>

      {/* Contenedor para Sidebar + Canvas - Position absolute para dimensiones exactas */}
      <div
        style={{
          position: 'absolute',
          left: theme.componentSizes.sidebar.activityBar, // 64px
          top: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          overflow: 'hidden', // CONTRATO: Evitar desbordamiento
        }}
      >
        {/* Nivel 2: Sidebar Contextual - Lista de entidades */}
        <PrimarySidebar />

        {/* Nivel 3: Lienzo (Canvas) - Superficie con múltiples Contenedores Dinámicos */}
        <Canvas />
      </div>
    </div>
  );
}
