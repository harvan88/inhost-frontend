import { useRef, useEffect } from 'react';
import { useMessages } from '@/store';
import { useTheme } from '@/theme';
import type { Message } from '@/types';
import { Badge } from '@/components/common';

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
}
