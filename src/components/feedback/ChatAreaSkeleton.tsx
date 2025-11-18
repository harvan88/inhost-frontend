/**
 * ChatAreaSkeleton - Loading State for Chat Area
 *
 * Skeleton placeholder que se muestra mientras carga una conversación.
 * Incluye header, mensajes y input area.
 *
 * @example
 * ```tsx
 * {isLoading ? <ChatAreaSkeleton /> : <ChatArea conversationId={id} />}
 * ```
 */

import { Skeleton } from './Skeleton';
import { useTheme } from '@/theme';

export function ChatAreaSkeleton() {
  const { theme } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.colors.neutral[50],
      }}
    >
      {/* Header skeleton */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing[3],
          padding: theme.spacing[4],
          borderBottom: `1px solid ${theme.colors.neutral[200]}`,
          backgroundColor: theme.colors.neutral[0],
        }}
      >
        <Skeleton width="40px" height="40px" circle />
        <div style={{ flex: 1 }}>
          <Skeleton
            width="60%"
            height="18px"
            style={{ marginBottom: theme.spacing[2] }}
          />
          <Skeleton width="40%" height="14px" />
        </div>
        <Skeleton width="32px" height="32px" />
      </div>

      {/* Messages skeleton */}
      <div
        style={{
          flex: 1,
          padding: theme.spacing[6],
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing[4],
          overflow: 'hidden',
        }}
      >
        {/* Mensaje entrante */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Skeleton
            width="70%"
            height="80px"
            style={{ maxWidth: '400px' }}
          />
        </div>

        {/* Mensaje saliente */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Skeleton
            width="60%"
            height="60px"
            style={{ maxWidth: '350px' }}
          />
        </div>

        {/* Mensaje entrante */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Skeleton
            width="75%"
            height="100px"
            style={{ maxWidth: '420px' }}
          />
        </div>

        {/* Mensaje saliente */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Skeleton
            width="50%"
            height="50px"
            style={{ maxWidth: '300px' }}
          />
        </div>
      </div>

      {/* Input skeleton */}
      <div
        style={{
          padding: theme.spacing[4],
          borderTop: `1px solid ${theme.colors.neutral[200]}`,
          backgroundColor: theme.colors.neutral[0],
        }}
      >
        <Skeleton height="48px" />
      </div>
    </div>
  );
}
