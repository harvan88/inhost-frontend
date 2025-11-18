import { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMessages } from '@/store';
import { useTheme } from '@/theme';
import type { Message } from '@/types';

interface MessageListProps {
  conversationId: string;
}

/**
 * MessageList - Displays messages for a conversation with virtual scrolling
 *
 * Architecture: Receives conversationId, reads messages from store
 *
 * Responsibilities:
 * - Display messages for ONE conversation
 * - Virtual scrolling for performance
 * - Auto-scroll to bottom on new messages
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

  // Virtual scrolling for performance with large message lists
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated message height
    overscan: 5, // Render 5 items above/below viewport
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (parentRef.current && messages.length > 0) {
      const scrollElement = parentRef.current;
      const isNearBottom =
        scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight < 200;

      // Only auto-scroll if user is near the bottom (not reading old messages)
      if (isNearBottom) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{
          backgroundColor: theme.colors.neutral[50],
        }}
      >
        <div
          className="text-center py-12"
          style={{
            color: theme.colors.neutral[600],
          }}
        >
          <p
            className="mb-2"
            style={{
              fontSize: theme.typography.sizes.lg,
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
        overflowAnchor: 'none',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const message = messages[virtualItem.index];
          return (
            <div
              key={message.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
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
 * MessageBubble - Individual message component
 */
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
        maxWidth: '28rem',
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

  const getChannelBadgeStyle = () => {
    switch (message.channel) {
      case 'whatsapp':
        return {
          backgroundColor: theme.colors.channels.whatsapp[100],
          color: theme.colors.channels.whatsapp[800],
          borderColor: theme.colors.channels.whatsapp[200],
        };
      case 'telegram':
        return {
          backgroundColor: theme.colors.channels.telegram[100],
          color: theme.colors.channels.telegram[800],
          borderColor: theme.colors.channels.telegram[200],
        };
      case 'web':
        return {
          backgroundColor: theme.colors.channels.web[100],
          color: theme.colors.channels.web[800],
          borderColor: theme.colors.channels.web[200],
        };
      case 'sms':
        return {
          backgroundColor: theme.colors.channels.sms[100],
          color: theme.colors.channels.sms[800],
          borderColor: theme.colors.channels.sms[200],
        };
      default:
        return {
          backgroundColor: theme.colors.neutral[100],
          color: theme.colors.neutral[800],
          borderColor: theme.colors.neutral[200],
        };
    }
  };

  const getTypeBadgeStyle = () => {
    if (isIncoming) {
      return {
        backgroundColor: theme.colors.primary[50],
        color: theme.colors.primary[700],
        borderColor: theme.colors.primary[200],
      };
    }
    // Outgoing: usar neutral-100 con primary-900 para mejor contraste
    return {
      backgroundColor: theme.colors.neutral[100],
      color: theme.colors.primary[900],
      borderColor: theme.colors.neutral[300],
    };
  };

  const bubbleStyle = getBubbleStyle();
  const channelBadgeStyle = getChannelBadgeStyle();
  const typeBadgeStyle = getTypeBadgeStyle();

  return (
    <div
      className="mb-4 max-w-2xl"
      style={{
        marginLeft: isIncoming ? undefined : isSystem ? 'auto' : 'auto',
        marginRight: isIncoming ? 'auto' : isSystem ? 'auto' : undefined,
      }}
    >
      <div
        className="p-4 border"
        style={{
          ...bubbleStyle,
          borderRadius: theme.radius.lg,
          borderWidth: '1px',
          borderStyle: 'solid',
          boxShadow: theme.elevation.sm,
        }}
      >
        {/* Header: Channel and Type badges */}
        {!isSystem && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-1 border"
                style={{
                  ...channelBadgeStyle,
                  fontSize: theme.typography.sizes.xs,
                  fontWeight: theme.typography.weights.semibold,
                  borderRadius: theme.radius.sm,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
              >
                {message.channel.toUpperCase()}
              </span>
              <span
                className="px-2 py-1 border"
                style={{
                  ...typeBadgeStyle,
                  fontSize: theme.typography.sizes.xs,
                  fontWeight: theme.typography.weights.semibold,
                  borderRadius: theme.radius.sm,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
              >
                {message.type.toUpperCase()}
              </span>
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
            className="mt-2"
            style={{
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
            className="mt-1"
            style={{
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
}
