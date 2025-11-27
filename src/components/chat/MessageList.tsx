/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "src/components/chat/MessageList.tsx"
 *   type: "component"
 *   layer: "frontend"
 *   domain: "ui"
 *   purpose: "Componente virtualizado que muestra mensajes de una conversación con auto-scroll inteligente, detección de overflow y ordenamiento por timestamp. Optimizado para 1000+ mensajes."
 *
 * DEPENDENCIES:
 *   internal: ["@/store", "@/theme", "@/types", "@/components/common", "@/hooks/useOverflowDetection", "@/hooks/useCombinedRefs", "@/components/feedback/MessageFeedback"]
 *   external: ["react", "@tanstack/react-virtual", "lucide-react"]
 *   infrastructure: []
 *
 * CONTRACTS:
 *   exports: ["MessageList"]
 *   inputs: ["MessageListProps"]
 *   outputs: ["JSX.Element"]
 *   errors: []
 *
 * INTEGRATION:
 *   data_flow: "[Zustand store] → [useMessages selector] → [useMemo sorting] → [Virtualizer] → [MessageBubble render]"
 *   events_emitted: []
 *   events_consumed: []
 *
 * IMPACT:
 *   used_by: ["components/workspace/Canvas", "pages/Chat"]
 *   uses: ["store/index.ts", "hooks/useOverflowDetection", "components/feedback/MessageFeedback"]
 *   critical: true
 *
 * === DOC_END :: MessageList.tsx ===
 */

import { useRef, useEffect, memo, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMessages, useStore } from '@/store';
import { useTheme } from '@/theme';
import type { MessageEnvelope } from '@/types';
import { Badge } from '@/components/common';
import { useOverflowDetection } from '@/hooks/useOverflowDetection';
import { useCombinedRefs } from '@/hooks/useCombinedRefs';
import { Clock, Check, CheckCheck, AlertCircle } from 'lucide-react';
import MessageFeedback from '@/components/feedback/MessageFeedback';

// Constant empty array to avoid creating new arrays on every render
const EMPTY_ARRAY: string[] = [];

interface MessageListProps {
  conversationId: string;
}

/**
 * MessageList - Displays messages for a conversation (VIRTUALIZED)
 *
 * Architecture: Receives conversationId, reads messages from store
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - Virtualización con @tanstack/react-virtual (renderiza solo mensajes visibles)
 * - MessageBubble memoizado (evita re-renders innecesarios)
 * - Auto-scroll inteligente (solo si usuario está en el fondo)
 * - Soporta 1000+ mensajes sin lag
 *
 * Responsibilities:
 * - Display messages for ONE conversation
 * - Auto-scroll to bottom on new messages (smart)
 * - Each message occupies its own vertical space (no overlap)
 *
 * Does NOT:
 * - Send messages (that's MessageInput)
 * - Know about the contact (that's ChatHeader)
 * - Fetch messages (that's the store)
 */
export default function MessageList({ conversationId }: MessageListProps) {
  const messagesRaw = useMessages(conversationId);
  const typingUsers = useStore((s) => s.ui.typingUsers.get(conversationId) ?? EMPTY_ARRAY);
  const { theme } = useTheme();
  const parentRef = useRef<HTMLDivElement>(null);

  // Ordenar mensajes por timestamp (más viejo arriba, más nuevo abajo)
  // useMemo para evitar re-ordenar en cada render y mantener referencia estable
  const messages = useMemo(() => {
    return [...messagesRaw].sort((a, b) => {
      const timeA = new Date(a.metadata?.timestamp || 0).getTime();
      const timeB = new Date(b.metadata?.timestamp || 0).getTime();
      return timeA - timeB; // Ascendente (como WhatsApp)
    });
  }, [messagesRaw]);

  // CONTRATO: "Ningún contenido del lienzo lo desborda"
  // Detectar overflow HORIZONTAL (vertical es esperado y permitido)
  const overflowRef = useOverflowDetection<HTMLDivElement>(`MessageList-${conversationId}`, {
    checkInterval: 3000,
    logOverflow: true,
    onOverflow: (data) => {
      // Solo alertar si hay overflow HORIZONTAL (vertical es normal)
      if (data.hasHorizontalOverflow) {
        console.error(
          `🚨 VIOLACIÓN - MessageList tiene overflow horizontal`,
          {
            conversationId,
            overflowHorizontal: `${data.overflowX}px`,
            dimensiones: `${data.clientWidth}x${data.clientHeight}`,
            scroll: `${data.scrollWidth}x${data.scrollHeight}`,
          }
        );
      }
    },
  });

  // Combinar refs (parent para virtualizer + overflow detection)
  const combinedRef = useCombinedRefs(parentRef, overflowRef);

  // Virtualizer para renderizar solo mensajes visibles
  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimación de altura por mensaje (en px)
    overscan: 5, // Renderizar 5 items extra arriba/abajo para smoothness
  });

  // Auto-scroll inteligente: solo si usuario está cerca del fondo
  useEffect(() => {
    if (messages.length === 0 || !parentRef.current) return;

    const container = parentRef.current;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    // Solo auto-scroll si el usuario está en el fondo
    if (isNearBottom) {
      // Scroll al último mensaje
      rowVirtualizer.scrollToIndex(messages.length - 1, {
        align: 'end',
        behavior: 'smooth',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{
          backgroundColor: theme.colors.neutral[50],
        }}
      >
        <div
          className="text-center"
          style={{
            color: theme.colors.neutral[600],
            paddingTop: theme.spacing[12],
            paddingBottom: theme.spacing[12],
          }}
        >
          <p
            style={{
              fontSize: theme.typography.sizes.lg,
              marginBottom: theme.spacing[2],
            }}
          >
            No messages yet
          </p>
          <p
            style={{
              fontSize: theme.typography.sizes.sm,
            }}
          >
            Send your first message below!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={combinedRef}
      className="h-full overflow-y-auto px-6 py-4"
      style={{
        backgroundColor: theme.colors.neutral[50],
      }}
    >
      {/* Virtual container con altura total */}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Renderizar solo mensajes virtualizados (visibles + overscan) */}
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const message = messages[virtualRow.index];
          return (
            <div
              key={message.id}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <MessageBubble message={message} theme={theme} />
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: `${rowVirtualizer.getTotalSize()}px`,
              left: 0,
              width: '100%',
              paddingTop: theme.spacing[2],
            }}
          >
            <TypingIndicator users={typingUsers} theme={theme} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * MessageBubble - Individual message component (MEMOIZED)
 *
 * Memoizado para evitar re-renders cuando otros mensajes cambian.
 * Solo se re-renderiza si el mensaje específico cambia.
 */
const MessageBubble = memo(
  function MessageBubble({ message, theme }: { message: MessageEnvelope; theme: any }) {
  const isIncoming = message.type === 'incoming';
  const isOutgoing = message.type === 'outgoing';
  const isSystem = message.type === 'system';

  // Get latest status from statusChain (with null safety)
  const latestStatus = message.statusChain && message.statusChain.length > 0
    ? message.statusChain[message.statusChain.length - 1]?.status
    : 'pending';

  // Get status icon for outgoing messages
  const getStatusIcon = () => {
    if (!isOutgoing) return null;

    const iconSize = 14;

    switch (latestStatus) {
      case 'sending':
        return <Clock size={iconSize} style={{ color: theme.colors.neutral[400] }} />;
      case 'sent':
        return <Check size={iconSize} style={{ color: theme.colors.neutral[400] }} />;
      case 'delivered':
        return <CheckCheck size={iconSize} style={{ color: theme.colors.neutral[400] }} />;
      case 'read':
        return <CheckCheck size={iconSize} style={{ color: theme.colors.primary[500] }} />;
      case 'failed':
        return <AlertCircle size={iconSize} style={{ color: theme.colors.semantic.danger }} />;
      default:
        return null;
    }
  };

  const getBubbleStyle = () => {
    if (isSystem) {
      return {
        backgroundColor: theme.colors.neutral[100],
        borderColor: theme.colors.neutral[300],
        color: theme.colors.neutral[700],
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'center' as const,
        // TODO: Create theme.maxWidth.md token or use theme.spacing[112] for system message width
        maxWidth: `${theme.spacing[28]}`, // 28rem equivalent
      };
    }
    if (isIncoming) {
      return {
        backgroundColor: theme.colors.neutral[0],
        borderColor: theme.colors.neutral[200],
        color: theme.colors.neutral[900],
      };
    }
    // Outgoing: usar primary-600 en lugar de primary-500 para mejor contraste
    return {
      backgroundColor: theme.colors.primary[600],
      borderColor: theme.colors.primary[600],
      color: theme.colors.neutral[0],
      marginLeft: 'auto',
    };
  };

  const bubbleStyle = getBubbleStyle();

  return (
    <div
      style={{
        marginBottom: theme.spacing[4], // Espacio entre mensajes
        width: '100%',
        display: 'flex',
        justifyContent: isIncoming ? 'flex-start' : isSystem ? 'center' : 'flex-end',
      }}
    >
      <div
        className="border"
        style={{
          ...bubbleStyle,
          padding: theme.spacing[4],
          borderRadius: theme.radius.lg,
          borderWidth: '1px',
          borderStyle: 'solid',
          boxShadow: theme.elevation.sm,
          // TODO: Create theme.maxWidth.lg token for message bubbles (640px)
          maxWidth: `${theme.spacing[160]}`, // 640px equivalent
          width: isSystem ? 'auto' : '100%',
        }}
      >
        {/* Header: Channel and Type badges */}
        {!isSystem && (
          <div
            className="flex items-center justify-between"
            style={{
              marginBottom: theme.spacing[2],
            }}
          >
            <div
              className="flex items-center"
              style={{
                gap: theme.spacing[2],
              }}
            >
              <Badge
                variant="default"
                color="channel"
                channel={message.channel}
              >
                {message.channel.toUpperCase()}
              </Badge>
              <Badge
                variant="default"
                color={isIncoming ? 'primary' : 'neutral'}
              >
                {message.type.toUpperCase()}
              </Badge>
            </div>
            <div
              className="flex items-center"
              style={{
                gap: theme.spacing[2],
              }}
            >
              <span
                style={{
                  fontSize: theme.typography.sizes.xs,
                  color: isIncoming ? theme.colors.neutral[500] : theme.colors.neutral[100],
                }}
              >
                {new Date(message.metadata.timestamp).toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {getStatusIcon()}
            </div>
          </div>
        )}

        {/* Message content */}
        <p
          className="whitespace-pre-wrap"
          style={{
            fontSize: isSystem ? theme.typography.sizes.sm : theme.typography.sizes.base,
            fontWeight: isSystem ? theme.typography.weights.medium : theme.typography.weights.normal,
          }}
        >
          {message.content.text || '[Media message]'}
        </p>

        {/* Media preview (if exists) */}
        {message.content.media && (
          <div
            style={{
              marginTop: theme.spacing[2],
              fontSize: theme.typography.sizes.xs,
              color: isIncoming ? theme.colors.neutral[500] : theme.colors.neutral[200],
            }}
          >
            📎 {message.content.media.type.toUpperCase()}
            {message.content.media.caption && `: ${message.content.media.caption}`}
          </div>
        )}

        {/* Footer: From/To info */}
        {!isSystem && (
          <div
            style={{
              marginTop: theme.spacing[2],
              fontSize: theme.typography.sizes.xs,
              color: isIncoming ? theme.colors.neutral[600] : theme.colors.neutral[100],
            }}
          >
            <span style={{ fontWeight: theme.typography.weights.semibold }}>From:</span>{' '}
            {message.metadata.from}
            {' • '}
            <span style={{ fontWeight: theme.typography.weights.semibold }}>To:</span>{' '}
            {message.metadata.to}
          </div>
        )}

        {/* Message Feedback - Solo para mensajes outgoing de extensiones */}
        {isOutgoing && message.metadata.extensionId && (
          <MessageFeedback
            messageId={message.id}
            extensionId={message.metadata.extensionId}
          />
        )}

        {/* System messages timestamp */}
        {isSystem && (
          <div
            style={{
              marginTop: theme.spacing[1],
              fontSize: theme.typography.sizes.xs,
              color: theme.colors.neutral[500],
            }}
          >
            {new Date(message.metadata.timestamp).toLocaleString('es-AR')}
          </div>
        )}
      </div>
    </div>
  );
  },
  // Comparación personalizada: re-renderizar si el message.id o statusChain cambia
  (prevProps, nextProps) => {
    const prevStatus = prevProps.message.statusChain && prevProps.message.statusChain.length > 0
      ? prevProps.message.statusChain[prevProps.message.statusChain.length - 1]?.status
      : undefined;
    const nextStatus = nextProps.message.statusChain && nextProps.message.statusChain.length > 0
      ? nextProps.message.statusChain[nextProps.message.statusChain.length - 1]?.status
      : undefined;

    return prevProps.message.id === nextProps.message.id &&
           prevProps.theme === nextProps.theme &&
           prevStatus === nextStatus;
  }
);

/**
 * TypingIndicator - Shows "User is typing..." indicator
 */
const TypingIndicator = memo(
  function TypingIndicator({ users, theme }: { users: string[]; theme: any }) {
    const userName = users[0]; // For now, show only first user typing
    const additionalUsers = users.length - 1;

    return (
      <div
        style={{
          marginBottom: theme.spacing[4],
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-start',
        }}
      >
        <div
          className="border"
          style={{
            backgroundColor: theme.colors.neutral[100],
            borderColor: theme.colors.neutral[300],
            color: theme.colors.neutral[700],
            padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
            borderRadius: theme.radius.lg,
            borderWidth: '1px',
            borderStyle: 'solid',
            boxShadow: theme.elevation.sm,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
            fontSize: theme.typography.sizes.sm,
            fontStyle: 'italic',
          }}
        >
          <span>{userName} está escribiendo</span>
          <span className="typing-dots">
            <span className="dot" style={{ animation: 'blink 1.4s infinite both' }}>.</span>
            <span className="dot" style={{ animation: 'blink 1.4s infinite both 0.2s' }}>.</span>
            <span className="dot" style={{ animation: 'blink 1.4s infinite both 0.4s' }}>.</span>
          </span>
          {additionalUsers > 0 && (
            <span style={{ color: theme.colors.neutral[500] }}>
              +{additionalUsers} more
            </span>
          )}
        </div>
      </div>
    );
  }
);
