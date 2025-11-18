import { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMessages } from '@/store';
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
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No messages yet</p>
          <p className="text-sm">Send your first message below!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-full overflow-y-auto px-6 py-4 bg-gray-50"
      style={{ overflowAnchor: 'none' }}
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
              <MessageBubble message={message} />
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
function MessageBubble({ message }: { message: Message }) {
  const isIncoming = message.type === 'incoming';
  const isSystem = message.type === 'system';

  const getBubbleStyle = () => {
    if (isSystem) {
      return 'bg-gray-100 border-gray-300 text-gray-700 mx-auto text-center max-w-md';
    }
    if (isIncoming) {
      return 'bg-white border-gray-200 text-gray-900';
    }
    return 'bg-blue-500 border-blue-500 text-white ml-auto';
  };

  const getChannelBadgeColor = () => {
    switch (message.channel) {
      case 'whatsapp':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'telegram':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'web':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'sms':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`mb-4 ${isIncoming ? 'mr-auto' : isSystem ? 'mx-auto' : 'ml-auto'} max-w-2xl`}>
      <div className={`p-4 rounded-lg border shadow-sm ${getBubbleStyle()}`}>
        {/* Header: Channel and Type badges */}
        {!isSystem && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded border ${getChannelBadgeColor()}`}
              >
                {message.channel.toUpperCase()}
              </span>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded border ${
                  isIncoming
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white/20 text-white border-white/30'
                }`}
              >
                {message.type.toUpperCase()}
              </span>
            </div>
            <span className={`text-xs ${isIncoming ? 'text-gray-500' : 'text-white/80'}`}>
              {new Date(message.metadata.timestamp).toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}

        {/* Message content */}
        <p className={`${isSystem ? 'text-sm font-medium' : 'text-base'} whitespace-pre-wrap`}>
          {message.content.text}
        </p>

        {/* Footer: From/To info */}
        {!isSystem && (
          <div className={`text-xs mt-2 ${isIncoming ? 'text-gray-600' : 'text-white/70'}`}>
            <span className="font-semibold">From:</span> {message.metadata.from}
            {' • '}
            <span className="font-semibold">To:</span> {message.metadata.to}
          </div>
        )}

        {/* System messages timestamp */}
        {isSystem && (
          <div className="text-xs text-gray-500 mt-1">
            {new Date(message.metadata.timestamp).toLocaleString('es-AR')}
          </div>
        )}
      </div>
    </div>
  );
}
