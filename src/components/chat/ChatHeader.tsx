import { useConversation, useContact } from '@/store';
import { Phone, Video, MoreVertical } from 'lucide-react';

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

  if (!conversation || !contact) {
    return (
      <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
        <div className="text-gray-500">Conversation not found</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return 'bg-green-600 text-white';
      case 'telegram':
        return 'bg-blue-500 text-white';
      case 'web':
        return 'bg-purple-600 text-white';
      case 'sms':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="border-b border-gray-200 px-6 py-4 bg-white">
      <div className="flex items-center justify-between">
        {/* Left: Contact info */}
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="relative">
            {contact.avatar ? (
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-lg">
                {contact.name.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Status indicator */}
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                contact.status
              )}`}
            />
          </div>

          {/* Name and metadata */}
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900">{contact.name}</h2>
              <span
                className={`px-2 py-0.5 text-xs font-semibold rounded ${getChannelColor(
                  conversation.channel
                )}`}
              >
                {conversation.channel.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-500">
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
        <div className="flex items-center space-x-2">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Voice call"
            aria-label="Voice call"
          >
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Video call"
            aria-label="Video call"
          >
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="More options"
            aria-label="More options"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
