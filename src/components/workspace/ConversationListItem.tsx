import { Pin, MessageSquare } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspace';
import { useStore } from '@/store';
import { useTheme } from '@/theme';
import { Text, ListCard } from '@/components/ui';
import type { Conversation } from '@/types';
import { Avatar, Badge, StatusIndicator } from '@/components/common';
import { createTab, isTabActive } from '@/utils/tabHelpers';

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
    openTab(
      createTab({
        type: 'conversation',
        entityId: conversation.id,
        label: contact?.name || conversation.entityId,
        closable: true,
      })
    );
  };

  // Check if this conversation is open in the active container
  const activeContainer = containers.find((c) => c.id === activeContainerId);
  const isActiveTab = isTabActive(activeContainer?.activeTabId ?? null, 'conversation', conversation.id);

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

  // Map contact status to StatusIndicator format
  const mapStatus = (status?: string): 'online' | 'offline' | 'away' => {
    if (status === 'online') return 'online';
    if (status === 'away') return 'away';
    return 'offline';
  };

  return (
    <ListCard isActive={isActiveTab} onClick={handleClick}>
      <div className="flex items-start w-full" style={{ gap: theme.spacing[3] }}>
        {/* Avatar with status */}
        <div className="flex-shrink-0">
          <Avatar
            src={contact?.avatar}
            alt={contact?.name || conversation.entityId}
            size="md"
            fallbackText={contact?.name || conversation.entityId}
            statusIndicator={contact?.status ? mapStatus(contact.status) : null}
          />
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
            <Text
              className="truncate flex-1"
              style={{
                fontWeight: theme.typography.weights.medium,
              }}
            >
              {contact?.name || conversation.entityId}
            </Text>
            {conversation.isPinned && (
              <Pin
                size={theme.iconSizes.sm}
                className="flex-shrink-0"
                style={{
                  color: theme.colors.primary[500],
                }}
              />
            )}
            <Text
              variant="metadata"
              color="muted"
              className="flex-shrink-0"
            >
              {conversation.lastMessage?.timestamp &&
                formatTime(conversation.lastMessage.timestamp)}
            </Text>
          </div>

          {/* Last Message */}
          {conversation.lastMessage && (
            <Text
              variant="metadata"
              color="muted"
              className="truncate mb-1"
            >
              {conversation.lastMessage.text}
            </Text>
          )}

          {/* Footer */}
          <div
            className="flex items-center"
            style={{
              gap: theme.spacing[2],
            }}
          >
            <Badge
              variant="compact"
              color="channel"
              channel={conversation.channel}
            >
              {conversation.channel.toUpperCase()}
            </Badge>
            {conversation.unreadCount > 0 && (
              <Badge variant="compact" color="primary">
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </ListCard>
  );
}
