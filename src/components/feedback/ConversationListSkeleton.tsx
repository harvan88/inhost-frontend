/**
 * ConversationListSkeleton - Loading State for Conversation List
 *
 * Skeleton placeholder que se muestra mientras carga la lista de conversaciones.
 * Simula varios items de conversación.
 *
 * @example
 * ```tsx
 * {isLoading ? <ConversationListSkeleton /> : conversationsList}
 * ```
 */

import { Skeleton } from './Skeleton';
import { useTheme } from '@/theme';

interface ConversationListSkeletonProps {
  /** Número de items skeleton a mostrar */
  count?: number;
}

export function ConversationListSkeleton({ count = 5 }: ConversationListSkeletonProps) {
  const { theme } = useTheme();

  return (
    <div>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            gap: theme.spacing[3],
            padding: theme.spacing[4],
            borderBottom: `1px solid ${theme.colors.neutral[200]}`,
          }}
        >
          {/* Avatar */}
          <Skeleton width="40px" height="40px" circle />

          {/* Contenido */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Nombre y timestamp */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: theme.spacing[2],
              }}
            >
              <Skeleton width="60%" height="16px" />
              <Skeleton width="50px" height="12px" />
            </div>

            {/* Último mensaje */}
            <Skeleton width="90%" height="14px" />

            {/* Canal badge (opcional, aleatorio) */}
            {index % 3 === 0 && (
              <div style={{ marginTop: theme.spacing[2] }}>
                <Skeleton width="80px" height="20px" />
              </div>
            )}
          </div>

          {/* Unread badge (opcional, aleatorio) */}
          {index % 2 === 0 && (
            <div style={{ alignSelf: 'center' }}>
              <Skeleton width="24px" height="24px" circle />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
