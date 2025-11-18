import { useRef, useEffect } from 'react';
import { useMessages } from '@/store';
import { useTheme } from '@/theme';
import type { Message } from '@/types';

interface MessageListProps {
  conversationId: string;
}

/**
 * MessageList - Displays messages for a conversation
 *
 * Architecture: Receives conversationId, reads messages from store
 *
 * Responsibilities:
 * - Display messages for ONE conversation
 * - Auto-scroll to bottom on new messages
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
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
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
      }}
    >
      {/* Render messages in normal flow - cada mensaje ocupa su propio espacio */}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} theme={theme} />
      ))}
      {/* Invisible div at bottom for auto-scroll */}
      <div ref={bottomRef} />
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
      style={{
        marginBottom: theme.spacing[4], // Espacio entre mensajes
        width: '100%',
        display: 'flex',
        justifyContent: isIncoming ? 'flex-start' : isSystem ? 'center' : 'flex-end',
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
          maxWidth: '640px', // max-w-2xl
          width: isSystem ? 'auto' : '100%',
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
