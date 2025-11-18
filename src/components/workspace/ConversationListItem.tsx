import { Pin, MessageSquare } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspace';
import { useStore } from '@/store';
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
  const { openTab, activeTabId } = useWorkspaceStore();
  const contact = useStore((state) => state.entities.contacts.get(conversation.entityId));

  const handleClick = () => {
    openTab({
      id: `chat-${conversation.id}`,
      type: 'conversation',
      label: contact?.name || conversation.entityId,
      entityId: conversation.id,
      closable: true,
    });
  };

  const isActiveTab = activeTabId === `chat-${conversation.id}`;

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

  // Channel badge color
  const channelColor = {
    whatsapp: 'bg-green-100 text-green-700',
    telegram: 'bg-blue-100 text-blue-700',
    web: 'bg-purple-100 text-purple-700',
    sms: 'bg-orange-100 text-orange-700',
  }[conversation.channel];

  return (
    <div
      onClick={handleClick}
      className={`
        px-4 py-3 border-b border-gray-200 cursor-pointer
        transition-colors duration-150
        ${isActiveTab ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-100'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {contact?.avatar ? (
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <MessageSquare size={20} className="text-gray-600" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 truncate flex-1">
              {contact?.name || conversation.entityId}
            </h3>
            {conversation.isPinned && (
              <Pin size={14} className="text-blue-500 flex-shrink-0" />
            )}
            <span className="text-xs text-gray-500 flex-shrink-0">
              {conversation.lastMessage?.timestamp &&
                formatTime(conversation.lastMessage.timestamp)}
            </span>
          </div>

          {/* Last Message */}
          {conversation.lastMessage && (
            <p className="text-sm text-gray-600 truncate mb-1">
              {conversation.lastMessage.text}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full uppercase font-medium ${channelColor}`}
            >
              {conversation.channel}
            </span>
            {conversation.unreadCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white font-medium">
                {conversation.unreadCount}
              </span>
            )}
            {contact?.status && (
              <span
                className={`w-2 h-2 rounded-full ${
                  contact.status === 'online'
                    ? 'bg-green-500'
                    : contact.status === 'away'
                    ? 'bg-yellow-500'
                    : 'bg-gray-400'
                }`}
                title={contact.status}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
