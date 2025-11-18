import { useTheme } from '@/theme';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatAreaProps {
  conversationId: string;
}

/**
 * ChatArea - Vista de Conversación (vive en Contenedor Dinámico)
 *
 * Rol en la arquitectura de tres niveles:
 * - Es una VISTA que se alberga en el Contenedor Dinámico (Nivel 3)
 * - Se abre cuando el usuario selecciona una conversación en el Sidebar (Nivel 2)
 * - Puede haber múltiples ChatAreas abiertas simultáneamente en tabs
 *
 * Arquitectura ID-based:
 * - Recibe solo un conversationId
 * - Orquesta 3 componentes: ChatHeader, MessageList, MessageInput
 * - Permite múltiples instancias sin cambios de código
 *
 * Responsabilidades:
 * - Orquestar ChatHeader, MessageList, MessageInput
 * - Pasar conversationId a componentes hijos
 * - Proveer contexto de conversación
 *
 * NO hace:
 * - Fetch de datos (lo hace el store)
 * - Manejar routing o navegación
 * - Saber cuántas ChatAreas existen
 */
export default function ChatArea({ conversationId }: ChatAreaProps) {
  const { theme } = useTheme();

  if (!conversationId) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{
          backgroundColor: theme.colors.neutral[50],
        }}
      >
        <div className="text-center">
          <p
            className="mb-2"
            style={{
              fontSize: theme.typography.sizes.xl,
              color: theme.colors.neutral[500],
            }}
          >
            No conversation selected
          </p>
          <p
            style={{
              fontSize: theme.typography.sizes.sm,
              color: theme.colors.neutral[400],
            }}
          >
            Select a conversation from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full"
      style={{
        backgroundColor: theme.colors.neutral[0],
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header: Shows who we're talking to */}
      <ChatHeader conversationId={conversationId} />

      {/* Messages: Shows conversation history - with padding for fixed input */}
      <div
        className="flex-1 overflow-hidden"
        style={{
          // TODO: Create theme.spacing.messageInputOffset token for message list padding
          // Used to prevent messages from being hidden under the fixed input at bottom
          // Current value: 120px provides space for MessageInput + padding + border
          paddingBottom: '120px',
        }}
      >
        <MessageList conversationId={conversationId} />
      </div>

      {/* Input: Where user types messages - FIXED at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: `1px solid ${theme.colors.neutral[200]}`,
          padding: theme.spacing[4],
          backgroundColor: theme.colors.neutral[0],
        }}
      >
        <MessageInput conversationId={conversationId} />
      </div>
    </div>
  );
}
