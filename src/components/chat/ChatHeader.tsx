import { useConversation, useContact } from '@/store';
import { Phone, Video, MoreVertical } from 'lucide-react';
import { useTheme } from '@/theme';

interface ChatHeaderProps {
  conversationId: string;
}

/**
 * ChatHeader - Shows contact information and actions for a conversation
 *
 * Architecture: Receives conversationId, reads from store by ID
 *
 * Responsibilities:
 * - Display contact name, avatar, status
 * - Show channel badge
 * - Provide action buttons (call, video, menu)
 *
 * Does NOT:
 * - Manage conversation state (that's the store)
 * - Know about messages (that's MessageList)
 * - Handle message input (that's MessageInput)
 */
export default function ChatHeader({ conversationId }: ChatHeaderProps) {
  const conversation = useConversation(conversationId);
  const contact = useContact(conversation?.entityId ?? null);
  const { theme } = useTheme();

  if (!conversation || !contact) {
    return (
      <div
        className="px-6 py-4"
        style={{
          borderBottom: `1px solid ${theme.colors.neutral[200]}`,
          backgroundColor: theme.colors.neutral[50],
        }}
      >
        <div style={{ color: theme.colors.neutral[500] }}>Conversation not found</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return theme.colors.semantic.success;
      case 'away':
        return theme.colors.semantic.warning;
      default:
        return theme.colors.neutral[400];
    }
  };

  const getChannelBadgeStyle = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return {
          backgroundColor: theme.colors.channels.whatsapp[700],
          color: theme.colors.neutral[0],
        };
      case 'telegram':
        return {
          backgroundColor: theme.colors.channels.telegram[700],
          color: theme.colors.neutral[0],
        };
      case 'web':
        return {
          backgroundColor: theme.colors.channels.web[700],
          color: theme.colors.neutral[0],
        };
      case 'sms':
        return {
          backgroundColor: theme.colors.channels.sms[700],
          color: theme.colors.neutral[0],
        };
      default:
        return {
          backgroundColor: theme.colors.neutral[700],
          color: theme.colors.neutral[0],
        };
    }
  };

  const channelBadgeStyle = getChannelBadgeStyle(conversation.channel);

  return (
    <div
      className="px-6 py-4"
      style={{
        borderBottom: `1px solid ${theme.colors.neutral[200]}`,
        backgroundColor: theme.colors.neutral[0],
      }}
    >
      <div className="flex items-center justify-between">
        {/* Left: Contact info */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            {contact.avatar ? (
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-12 h-12 object-cover"
                style={{
                  borderRadius: theme.radius.full,
                }}
              />
            ) : (
              <div
                className="w-12 h-12 flex items-center justify-center"
                style={{
                  borderRadius: theme.radius.full,
                  backgroundColor: theme.colors.neutral[300],
                  color: theme.colors.neutral[600],
                  fontWeight: theme.typography.weights.semibold,
                  fontSize: theme.typography.sizes.lg,
                }}
              >
                {contact.name.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Status indicator */}
            <div
              className="absolute bottom-0 right-0 w-3 h-3"
              style={{
                borderRadius: theme.radius.full,
                border: `2px solid ${theme.colors.neutral[0]}`,
                backgroundColor: getStatusColor(contact.status),
              }}
            />
          </div>

          {/* Name and metadata */}
          <div>
            <div className="flex items-center gap-2">
              <h2
                style={{
                  fontSize: theme.typography.sizes.lg,
                  fontWeight: theme.typography.weights.semibold,
                  color: theme.colors.neutral[900],
                }}
              >
                {contact.name}
              </h2>
              <span
                className="px-2 py-0.5"
                style={{
                  ...channelBadgeStyle,
                  fontSize: theme.typography.sizes.xs,
                  fontWeight: theme.typography.weights.semibold,
                  borderRadius: theme.radius.sm,
                }}
              >
                {conversation.channel.toUpperCase()}
              </span>
            </div>
            <p
              style={{
                fontSize: theme.typography.sizes.sm,
                color: theme.colors.neutral[500],
              }}
            >
              {contact.status === 'online' ? (
                'Online'
              ) : contact.metadata?.lastSeen ? (
                `Last seen: ${new Date(contact.metadata.lastSeen).toLocaleString()}`
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 transition"
            style={{
              borderRadius: theme.radius.lg,
              transitionDuration: theme.transitions.base,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.neutral[100];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Voice call"
            aria-label="Voice call"
          >
            <Phone
              className="w-5 h-5"
              style={{
                color: theme.colors.neutral[600],
              }}
            />
          </button>
          <button
            className="p-2 transition"
            style={{
              borderRadius: theme.radius.lg,
              transitionDuration: theme.transitions.base,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.neutral[100];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Video call"
            aria-label="Video call"
          >
            <Video
              className="w-5 h-5"
              style={{
                color: theme.colors.neutral[600],
              }}
            />
          </button>
          <button
            className="p-2 transition"
            style={{
              borderRadius: theme.radius.lg,
              transitionDuration: theme.transitions.base,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.neutral[100];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="More options"
            aria-label="More options"
          >
            <MoreVertical
              className="w-5 h-5"
              style={{
                color: theme.colors.neutral[600],
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
