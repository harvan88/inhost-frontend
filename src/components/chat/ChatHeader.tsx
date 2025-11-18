import { useConversation, useContact } from '@/store';
import { Phone, Video, MoreVertical } from 'lucide-react';
import { useTheme } from '@/theme';
import { Avatar, Badge } from '@/components/common';
import { IconButton, Heading, Text } from '@/components/ui';

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
        style={{
          padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
          borderBottom: `1px solid ${theme.colors.neutral[200]}`,
          backgroundColor: theme.colors.neutral[50],
        }}
      >
        <Text color="muted">Conversation not found</Text>
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
      style={{
        padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
        borderBottom: `1px solid ${theme.colors.neutral[200]}`,
        backgroundColor: theme.colors.neutral[0],
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Contact info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[2],
              }}
            >
              <Heading level={2} noMargin>
                {contact.name}
              </Heading>
              <Badge
                variant="compact"
                color="channel"
                channel={conversation.channel}
              >
                {conversation.channel.toUpperCase()}
              </Badge>
            </div>
            <Text variant="metadata" color="muted">
              {contact.status === 'online' ? (
                'Online'
              ) : contact.metadata?.lastSeen ? (
                `Last seen: ${new Date(contact.metadata.lastSeen).toLocaleString()}`
              ) : (
                'Offline'
              )}
            </Text>
          </div>
        </div>

        {/* Right: Action buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
          }}
        >
          <IconButton
            icon={<Phone size={theme.iconSizes.lg} />}
            variant="ghost"
            aria-label="Voice call"
            onClick={() => console.log('Voice call')}
          />
          <IconButton
            icon={<Video size={theme.iconSizes.lg} />}
            variant="ghost"
            aria-label="Video call"
            onClick={() => console.log('Video call')}
          />
          <IconButton
            icon={<MoreVertical size={theme.iconSizes.lg} />}
            variant="ghost"
            aria-label="More options"
            onClick={() => console.log('More options')}
          />
        </div>
      </div>
    </div>
  );
}
