import { useConversation, useContact } from '@/store';
import { Phone, Video, MoreVertical } from 'lucide-react';
import { useTheme } from '@/theme';
import { Avatar, Badge } from '@/components/common';

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

  // Map conversation status to StatusIndicator format
  const mapStatus = (status: string): 'online' | 'offline' | 'away' => {
    if (status === 'online') return 'online';
    if (status === 'away') return 'away';
    return 'offline';
  };

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
        <div
          className="flex items-center"
          style={{
            gap: theme.spacing[4],
          }}
        >
          {/* Avatar with status */}
          <Avatar
            src={contact.avatar}
            alt={contact.name}
            size="lg"
            fallbackText={contact.name}
            statusIndicator={mapStatus(contact.status)}
          />

          {/* Name and metadata */}
          <div>
            <div
              className="flex items-center"
              style={{
                gap: theme.spacing[2],
              }}
            >
              <h2
                style={{
                  fontSize: theme.typography.sizes.lg,
                  fontWeight: theme.typography.weights.semibold,
                  color: theme.colors.neutral[900],
                }}
              >
                {contact.name}
              </h2>
              <Badge
                variant="compact"
                color="channel"
                channel={conversation.channel}
              >
                {conversation.channel.toUpperCase()}
              </Badge>
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
            className="transition"
            style={{
              padding: theme.spacing[2],
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
            className="transition"
            style={{
              padding: theme.spacing[2],
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
            className="transition"
            style={{
              padding: theme.spacing[2],
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
