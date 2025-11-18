import { useState } from 'react';
import { Send } from 'lucide-react';
import { useStore, useConversation } from '@/store';
import { useTheme } from '@/theme';
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
  const { theme } = useTheme();

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

  // Get character counter color
  const getCharCountColor = () => {
    if (isOverLimit) return theme.colors.semantic.danger;
    if (isNearLimit) return theme.colors.semantic.warning;
    return theme.colors.neutral[500];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', gap: theme.spacing[3] }}
      >
        <div style={{ flex: 1 }}>
          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            placeholder="Type your message..."
            disabled={isSending}
            className="w-full transition"
            style={{
              padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
              border: `1px solid ${error ? theme.colors.semantic.danger : theme.colors.neutral[300]}`,
              borderRadius: theme.radius.lg,
              transitionDuration: theme.transitions.base,
              backgroundColor: isSending ? theme.colors.neutral[100] : theme.colors.neutral[0],
              color: theme.colors.neutral[900],
              cursor: isSending ? 'not-allowed' : 'text',
            }}
            onFocus={(e) => {
              if (!isSending) {
                e.currentTarget.style.outline = 'none';
                e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary[500]}`;
                e.currentTarget.style.borderColor = 'transparent';
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = error
                ? theme.colors.semantic.danger
                : theme.colors.neutral[300];
            }}
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={!text.trim() || isSending || isOverLimit}
          className="flex items-center transition"
          style={{
            padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
            backgroundColor:
              !text.trim() || isSending || isOverLimit
                ? theme.colors.neutral[300]
                : theme.colors.primary[500],
            color: theme.colors.neutral[0],
            borderRadius: theme.radius.lg,
            fontWeight: theme.typography.weights.semibold,
            cursor: !text.trim() || isSending || isOverLimit ? 'not-allowed' : 'pointer',
            border: 'none',
            gap: theme.spacing[2],
            transitionDuration: theme.transitions.base,
          }}
          onMouseEnter={(e) => {
            if (!(!text.trim() || isSending || isOverLimit)) {
              e.currentTarget.style.backgroundColor = theme.colors.primary[600];
            }
          }}
          onMouseLeave={(e) => {
            if (!(!text.trim() || isSending || isOverLimit)) {
              e.currentTarget.style.backgroundColor = theme.colors.primary[500];
            }
          }}
        >
          {isSending ? (
            <>
              <div
                className="w-4 h-4 rounded-full animate-spin"
                style={{
                  border: `2px solid ${theme.colors.neutral[0]}`,
                  borderTopColor: 'transparent',
                }}
              />
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
      <div
        className="flex items-center justify-between px-1"
        style={{
          fontSize: theme.typography.sizes.sm,
        }}
      >
        <div>
          {error && (
            <span
              style={{
                color: theme.colors.semantic.danger,
              }}
            >
              {error}
            </span>
          )}
        </div>
        <div
          style={{
            color: getCharCountColor(),
            fontWeight: isOverLimit ? theme.typography.weights.semibold : theme.typography.weights.normal,
          }}
        >
          {charCount} / {MAX_MESSAGE_LENGTH}
        </div>
      </div>
    </div>
  );
}
