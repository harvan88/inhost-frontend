import { useState } from 'react';
import { Send } from 'lucide-react';
import { useStore, useConversation } from '@/store';
import type { Message } from '@/types';

interface MessageInputProps {
  conversationId: string;
}

const MAX_MESSAGE_LENGTH = 4096;
const MIN_MESSAGE_LENGTH = 1;

/**
 * MessageInput - Text input for sending messages
 *
 * Architecture: Receives conversationId, writes to store
 *
 * Responsibilities:
 * - Capture user input
 * - Validate message locally (length, format)
 * - Send message to store
 * - Show loading state and character counter
 *
 * Does NOT:
 * - Display messages (that's MessageList)
 * - Know about the contact (that's ChatHeader)
 * - Handle API calls directly (that's the store/services)
 */
export default function MessageInput({ conversationId }: MessageInputProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversation = useConversation(conversationId);
  const addMessage = useStore((state) => state.actions.addMessage);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Clear error when user starts typing
    if (error) setError(null);

    // Enforce max length
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setText(value);
    }
  };

  const validateMessage = (content: string): boolean => {
    const trimmed = content.trim();

    if (trimmed.length < MIN_MESSAGE_LENGTH) {
      setError('Message cannot be empty');
      return false;
    }

    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setError(`Message is too long (max ${MAX_MESSAGE_LENGTH} characters)`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSending || !conversation) return;

    const trimmed = text.trim();
    if (!validateMessage(trimmed)) return;

    setIsSending(true);
    setError(null);

    try {
      // Create new message
      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'outgoing',
        channel: conversation.channel,
        content: { text: trimmed },
        metadata: {
          from: 'system',
          to: conversation.entityId,
          timestamp: new Date().toISOString(),
        },
      };

      // Add to store (will trigger re-render in MessageList)
      addMessage(conversationId, newMessage);

      // Clear input on success
      setText('');

      // TODO: Send to API/WebSocket
      // await apiClient.sendMessage(newMessage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const charCount = text.length;
  const isOverLimit = charCount > MAX_MESSAGE_LENGTH;
  const isNearLimit = charCount > MAX_MESSAGE_LENGTH * 0.9;

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            placeholder="Type your message..."
            disabled={isSending}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={!text.trim() || isSending || isOverLimit}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send
            </>
          )}
        </button>
      </form>

      {/* Character counter and error message */}
      <div className="flex items-center justify-between text-sm px-1">
        <div>{error && <span className="text-red-600">{error}</span>}</div>
        <div
          className={`${
            isOverLimit
              ? 'text-red-600 font-semibold'
              : isNearLimit
              ? 'text-yellow-600'
              : 'text-gray-500'
          }`}
        >
          {charCount} / {MAX_MESSAGE_LENGTH}
        </div>
      </div>
    </div>
  );
}
