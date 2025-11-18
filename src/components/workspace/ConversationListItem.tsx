import { Pin, MessageSquare } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspace';
import { useStore } from '@/store';
import { useTheme } from '@/theme';
import type { Conversation } from '@/types';

interface ConversationListItemProps {
  conversation: Conversation;
}

/**
 * ConversationListItem - Item individual en la lista de conversaciones
 *
 * Al hacer click:
 * - Abre la conversación en una nueva tab (si no está abierta)
 * - Activa la tab si ya está abierta
 */
export default function ConversationListItem({ conversation }: ConversationListItemProps) {
  const { openTab, containers, activeContainerId } = useWorkspaceStore();
  const contact = useStore((state) => state.entities.contacts.get(conversation.entityId));
  const { theme } = useTheme();

  const handleClick = () => {
    openTab({
      id: `chat-${conversation.id}`,
      type: 'conversation',
      label: contact?.name || conversation.entityId,
      entityId: conversation.id,
      closable: true,
    });
  };

  // Check if this conversation is open in the active container
  const activeContainer = containers.find((c) => c.id === activeContainerId);
  const isActiveTab = activeContainer?.activeTabId === `chat-${conversation.id}`;

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  // Channel badge style
  const getChannelBadgeStyle = () => {
    switch (conversation.channel) {
      case 'whatsapp':
        return {
          backgroundColor: theme.colors.channels.whatsapp[100],
          color: theme.colors.channels.whatsapp[800],
        };
      case 'telegram':
        return {
          backgroundColor: theme.colors.channels.telegram[100],
          color: theme.colors.channels.telegram[800],
        };
      case 'web':
        return {
          backgroundColor: theme.colors.channels.web[100],
          color: theme.colors.channels.web[800],
        };
      case 'sms':
        return {
          backgroundColor: theme.colors.channels.sms[100],
          color: theme.colors.channels.sms[800],
        };
      default:
        return {
          backgroundColor: theme.colors.neutral[100],
          color: theme.colors.neutral[800],
        };
    }
  };

  const channelBadgeStyle = getChannelBadgeStyle();

  // Status indicator color
  const getStatusColor = () => {
    if (!contact?.status) return theme.colors.neutral[400];
    switch (contact.status) {
      case 'online':
        return theme.colors.semantic.success;
      case 'away':
        return theme.colors.semantic.warning;
      default:
        return theme.colors.neutral[400];
    }
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer transition-colors"
      style={{
        padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
        borderBottom: `1px solid ${theme.colors.neutral[200]}`,
        borderLeft: isActiveTab ? `4px solid ${theme.colors.primary[500]}` : 'none',
        backgroundColor: isActiveTab ? theme.colors.primary[50] : 'transparent',
        transitionDuration: theme.transitions.fast,
      }}
      onMouseEnter={(e) => {
        if (!isActiveTab) {
          e.currentTarget.style.backgroundColor = theme.colors.neutral[100];
        }
      }}
      onMouseLeave={(e) => {
        if (!isActiveTab) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <div className="flex items-start" style={{ gap: theme.spacing[3] }}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          {contact?.avatar ? (
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-10 h-10"
              style={{
                borderRadius: theme.radius.full,
              }}
            />
          ) : (
            <div
              className="w-10 h-10 flex items-center justify-center"
              style={{
                borderRadius: theme.radius.full,
                backgroundColor: theme.colors.neutral[300],
              }}
            >
              <MessageSquare
                size={20}
                style={{
                  color: theme.colors.neutral[600],
                }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div
            className="flex items-center mb-1"
            style={{
              gap: theme.spacing[2],
            }}
          >
            <h3
              className="truncate flex-1"
              style={{
                fontWeight: theme.typography.weights.medium,
                color: theme.colors.neutral[900],
              }}
            >
              {contact?.name || conversation.entityId}
            </h3>
            {conversation.isPinned && (
              <Pin
                size={14}
                className="flex-shrink-0"
                style={{
                  color: theme.colors.primary[500],
                }}
              />
            )}
            <span
              className="flex-shrink-0"
              style={{
                fontSize: theme.typography.sizes.xs,
                color: theme.colors.neutral[500],
              }}
            >
              {conversation.lastMessage?.timestamp &&
                formatTime(conversation.lastMessage.timestamp)}
            </span>
          </div>

          {/* Last Message */}
          {conversation.lastMessage && (
            <p
              className="truncate mb-1"
              style={{
                fontSize: theme.typography.sizes.sm,
                color: theme.colors.neutral[600],
              }}
            >
              {conversation.lastMessage.text}
            </p>
          )}

          {/* Footer */}
          <div
            className="flex items-center"
            style={{
              gap: theme.spacing[2],
            }}
          >
            <span
              className="uppercase"
              style={{
                ...channelBadgeStyle,
                fontSize: theme.typography.sizes.xs,
                padding: `${theme.spacing[0]} ${theme.spacing[2]}`,
                borderRadius: theme.radius.full,
                fontWeight: theme.typography.weights.medium,
              }}
            >
              {conversation.channel}
            </span>
            {conversation.unreadCount > 0 && (
              <span
                style={{
                  fontSize: theme.typography.sizes.xs,
                  padding: `${theme.spacing[0]} ${theme.spacing[2]}`,
                  borderRadius: theme.radius.full,
                  backgroundColor: theme.colors.primary[500],
                  color: theme.colors.neutral[0],
                  fontWeight: theme.typography.weights.medium,
                }}
              >
                {conversation.unreadCount}
              </span>
            )}
            {contact?.status && (
              <span
                className="w-2 h-2"
                style={{
                  borderRadius: theme.radius.full,
                  backgroundColor: getStatusColor(),
                }}
                title={contact.status}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
