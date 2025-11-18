import { useRef, useEffect, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMessages } from '@/store';
import { useTheme } from '@/theme';
import type { Message } from '@/types';
import { Badge } from '@/components/common';

interface MessageListProps {
  conversationId: string;
}

/**
 * MessageList - Displays messages for a conversation (VIRTUALIZED)
 *
 * Architecture: Receives conversationId, reads messages from store
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - Virtualización con @tanstack/react-virtual (renderiza solo mensajes visibles)
 * - MessageBubble memoizado (evita re-renders innecesarios)
 * - Auto-scroll inteligente (solo si usuario está en el fondo)
 * - Soporta 1000+ mensajes sin lag
 *
 * Responsibilities:
 * - Display messages for ONE conversation
 * - Auto-scroll to bottom on new messages (smart)
 * - Each message occupies its own vertical space (no overlap)
 *
 * Does NOT:
 * - Send messages (that's MessageInput)
 * - Know about the contact (that's ChatHeader)
 * - Fetch messages (that's the store)
 */
export default function MessageList({ conversationId }: MessageListProps) {
  const messages = useMessages(conversationId);
  const { theme } = useTheme();
  const parentRef = useRef<HTMLDivElement>(null);

  // Virtualizer para renderizar solo mensajes visibles
  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimación de altura por mensaje (en px)
    overscan: 5, // Renderizar 5 items extra arriba/abajo para smoothness
  });

  // Auto-scroll inteligente: solo si usuario está cerca del fondo
  useEffect(() => {
    if (messages.length === 0 || !parentRef.current) return;

    const container = parentRef.current;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    // Solo auto-scroll si el usuario está en el fondo
    if (isNearBottom) {
      // Scroll al último mensaje
      rowVirtualizer.scrollToIndex(messages.length - 1, {
        align: 'end',
        behavior: 'smooth',
      });
    }
  }, [messages.length, rowVirtualizer]);

  if (messages.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{
          backgroundColor: theme.colors.neutral[50],
        }}
      >
        <div
          className="text-center"
          style={{
            color: theme.colors.neutral[600],
            paddingTop: theme.spacing[12],
            paddingBottom: theme.spacing[12],
          }}
        >
          <p
            style={{
              fontSize: theme.typography.sizes.lg,
              marginBottom: theme.spacing[2],
            }}
          >
            No messages yet
          </p>
          <p
            style={{
              fontSize: theme.typography.sizes.sm,
            }}
          >
            Send your first message below!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-full overflow-y-auto px-6 py-4"
      style={{
        backgroundColor: theme.colors.neutral[50],
      }}
    >
      {/* Virtual container con altura total */}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Renderizar solo mensajes virtualizados (visibles + overscan) */}
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const message = messages[virtualRow.index];
          return (
            <div
              key={message.id}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <MessageBubble message={message} theme={theme} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * MessageBubble - Individual message component (MEMOIZED)
 *
 * Memoizado para evitar re-renders cuando otros mensajes cambian.
 * Solo se re-renderiza si el mensaje específico cambia.
 */
const MessageBubble = memo(
  function MessageBubble({ message, theme }: { message: Message; theme: any }) {
  const isIncoming = message.type === 'incoming';
  const isSystem = message.type === 'system';

  const getBubbleStyle = () => {
    if (isSystem) {
      return {
        backgroundColor: theme.colors.neutral[100],
        borderColor: theme.colors.neutral[300],
        color: theme.colors.neutral[700],
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'center' as const,
        // TODO: Create theme.maxWidth.md token or use theme.spacing[112] for system message width
        maxWidth: `${theme.spacing[28]}`, // 28rem equivalent
      };
    }
    if (isIncoming) {
      return {
        backgroundColor: theme.colors.neutral[0],
        borderColor: theme.colors.neutral[200],
        color: theme.colors.neutral[900],
      };
    }
    // Outgoing: usar primary-600 en lugar de primary-500 para mejor contraste
    return {
      backgroundColor: theme.colors.primary[600],
      borderColor: theme.colors.primary[600],
      color: theme.colors.neutral[0],
      marginLeft: 'auto',
    };
  };

  const bubbleStyle = getBubbleStyle();

  return (
    <div
      style={{
        marginBottom: theme.spacing[4], // Espacio entre mensajes
        width: '100%',
        display: 'flex',
        justifyContent: isIncoming ? 'flex-start' : isSystem ? 'center' : 'flex-end',
      }}
    >
      <div
        className="border"
        style={{
          ...bubbleStyle,
          padding: theme.spacing[4],
          borderRadius: theme.radius.lg,
          borderWidth: '1px',
          borderStyle: 'solid',
          boxShadow: theme.elevation.sm,
          // TODO: Create theme.maxWidth.lg token for message bubbles (640px)
          maxWidth: `${theme.spacing[160]}`, // 640px equivalent
          width: isSystem ? 'auto' : '100%',
        }}
      >
        {/* Header: Channel and Type badges */}
        {!isSystem && (
          <div
            className="flex items-center justify-between"
            style={{
              marginBottom: theme.spacing[2],
            }}
          >
            <div
              className="flex items-center"
              style={{
                gap: theme.spacing[2],
              }}
            >
              <Badge
                variant="default"
                color="channel"
                channel={message.channel}
              >
                {message.channel.toUpperCase()}
              </Badge>
              <Badge
                variant="default"
                color={isIncoming ? 'primary' : 'neutral'}
              >
                {message.type.toUpperCase()}
              </Badge>
            </div>
            <span
              style={{
                fontSize: theme.typography.sizes.xs,
                color: isIncoming ? theme.colors.neutral[500] : theme.colors.neutral[100],
              }}
            >
              {new Date(message.metadata.timestamp).toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}

        {/* Message content */}
        <p
          className="whitespace-pre-wrap"
          style={{
            fontSize: isSystem ? theme.typography.sizes.sm : theme.typography.sizes.base,
            fontWeight: isSystem ? theme.typography.weights.medium : theme.typography.weights.normal,
          }}
        >
          {message.content.text}
        </p>

        {/* Footer: From/To info */}
        {!isSystem && (
          <div
            style={{
              marginTop: theme.spacing[2],
              fontSize: theme.typography.sizes.xs,
              color: isIncoming ? theme.colors.neutral[600] : theme.colors.neutral[100],
            }}
          >
            <span style={{ fontWeight: theme.typography.weights.semibold }}>From:</span>{' '}
            {message.metadata.from}
            {' • '}
            <span style={{ fontWeight: theme.typography.weights.semibold }}>To:</span>{' '}
            {message.metadata.to}
          </div>
        )}

        {/* System messages timestamp */}
        {isSystem && (
          <div
            style={{
              marginTop: theme.spacing[1],
              fontSize: theme.typography.sizes.xs,
              color: theme.colors.neutral[500],
            }}
          >
            {new Date(message.metadata.timestamp).toLocaleString('es-AR')}
          </div>
        )}
      </div>
    </div>
  );
  },
  // Comparación personalizada: solo re-renderizar si el message.id cambia
  (prevProps, nextProps) => {
    return prevProps.message.id === nextProps.message.id &&
           prevProps.theme === nextProps.theme;
  }
);
