import { useState, useRef, useCallback, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useStore, useConversation } from '@/store';
import { useTheme } from '@/theme';
import type { MessageEnvelope } from '@/types';
import { useOverflowDetection } from '@/hooks/useOverflowDetection';
import { apiClient } from '@/services/api';
import { useWebSocketContext } from '@/providers/WebSocketProvider';
import { logger } from '@/services/logger';

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
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { theme } = useTheme();

  const conversation = useConversation(conversationId);
  const addMessage = useStore((state) => state.actions.addMessage);
  const { sendTyping } = useWebSocketContext();

  // DIAGNÓSTICO: Detectar overflow en MessageInput
  const inputRef = useOverflowDetection<HTMLDivElement>(`MessageInput-${conversationId}`, {
    checkInterval: 3000,
    logOverflow: true,
    onOverflow: (data) => {
      console.error(
        `🔍 DIAGNÓSTICO - MessageInput tiene overflow`,
        {
          conversationId,
          overflowHorizontal: data.hasHorizontalOverflow ? `${data.overflowX}px` : 'No',
          overflowVertical: data.hasVerticalOverflow ? `${data.overflowY}px` : 'No',
          dimensiones: `${data.clientWidth}x${data.clientHeight}`,
          scroll: `${data.scrollWidth}x${data.scrollHeight}`,
        }
      );
    },
  });

  // ━━━ CLEANUP: Stop typing indicator on unmount ━━━
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        sendTyping(conversationId, false);
      }
    };
  }, [isTyping, conversationId, sendTyping]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Clear error when user starts typing
    if (error) setError(null);

    // Enforce max length
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setText(value);
    }

    // ━━━ TYPING INDICATOR ━━━
    // Start typing indicator if not already started
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      sendTyping(conversationId, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 3 seconds of inactivity
    if (value.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTyping(conversationId, false);
      }, 3000);
    } else {
      // Immediately stop typing if input is empty
      setIsTyping(false);
      sendTyping(conversationId, false);
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

    // Stop typing indicator when sending
    if (isTyping) {
      setIsTyping(false);
      sendTyping(conversationId, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }

    setIsSending(true);
    setError(null);

    // ━━━ OPTIMISTIC UPDATE ━━━
    // Create temporary message with "sending" status
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const tempMessage: MessageEnvelope = {
      id: tempId,
      conversationId: conversation.id,
      type: 'outgoing',
      channel: conversation.channel,
      content: {
        text: trimmed,
        contentType: 'text/plain',
      },
      metadata: {
        from: 'system', // TODO: Get from auth context
        to: conversation.entityId,
        timestamp: new Date().toISOString(),
      },
      statusChain: [
        {
          status: 'sending',
          timestamp: new Date().toISOString(),
          messageId: tempId,
        },
      ],
      context: {
        plan: 'free',
        timestamp: new Date().toISOString(),
      },
    };

    // Add message to store immediately (optimistic)
    addMessage(conversationId, tempMessage);
    console.log('📤 Optimistic message added:', tempId);
    logger.info('ui', 'Optimistic message added to store', {
      messageId: tempId,
      conversationId,
      type: 'outgoing',
      channel: conversation.channel,
    });

    // Clear input immediately
    setText('');

    try {
      // Send message to backend simulation API
      // This will trigger WebSocket broadcasts automatically
      logger.debug('api', 'Sending message to backend', {
        conversationId,
        channel: conversation.channel,
        textLength: trimmed.length,
      });

      const response = await apiClient.sendClientMessage({
        clientId: conversation.channel as 'whatsapp' | 'telegram' | 'web' | 'sms',
        text: trimmed,
      });

      // The real message will be added to the store via WebSocket broadcast
      // (message_received event handled by WebSocketProvider)
      // We should remove the temp message when the real one arrives
      // For now, we'll let the backend message replace it via duplicate detection

      console.log('✅ Message sent to backend:', response);
      logger.info('api', 'Message sent to backend successfully', {
        conversationId,
        processedCount: response.processedCount,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('❌ Failed to send message:', err);
      logger.error('api', 'Failed to send message to backend', {
        conversationId,
        error: errorMessage,
        tempMessageId: tempId,
      });

      // Update temp message status to "failed"
      const { entities } = useStore.getState();
      const messages = entities.messages.get(conversationId) || [];
      const messageIndex = messages.findIndex((m) => m.id === tempId);

      if (messageIndex !== -1) {
        const updatedMessage = {
          ...messages[messageIndex],
          statusChain: [
            ...messages[messageIndex].statusChain,
            {
              status: 'failed' as const,
              timestamp: new Date().toISOString(),
              messageId: tempId,
              details: errorMessage,
            },
          ],
        };

        const updatedMessages = [...messages];
        updatedMessages[messageIndex] = updatedMessage;
        useStore.getState().actions.setMessages(conversationId, updatedMessages);
      }
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
    <div
      ref={inputRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing[2],
        overflow: 'hidden', // CONTRATO: Evitar desbordamiento
      }}
    >
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
                className="rounded-full animate-spin"
                style={{
                  width: theme.componentSizes.spinner.sm,
                  height: theme.componentSizes.spinner.sm,
                  border: `2px solid ${theme.colors.neutral[0]}`,
                  borderTopColor: 'transparent',
                }}
              />
              Sending...
            </>
          ) : (
            <>
              <Send size={theme.iconSizes.sm} />
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
