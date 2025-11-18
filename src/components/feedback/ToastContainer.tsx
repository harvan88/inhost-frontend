/**
 * ToastContainer Component
 *
 * Contenedor que maneja la posición y renderizado de múltiples toasts.
 * Se coloca en la esquina inferior derecha (o superior en mobile).
 *
 * @example
 * ```tsx
 * // En App.tsx
 * const toasts = useToastStore((state) => state.toasts);
 *
 * <ToastContainer toasts={toasts} />
 * ```
 */

import { Toast, type ToastProps } from './Toast';
import { useTheme } from '@/theme';
import { useIsMobile } from '@/hooks/useBreakpoint';

interface ToastContainerProps {
  /** Array de toasts activos */
  toasts: ToastProps[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        // En mobile: arriba, en desktop: abajo
        ...(isMobile
          ? {
              top: theme.spacing[4],
              // Safe area para notch
              paddingTop: 'env(safe-area-inset-top)',
            }
          : {
              bottom: theme.spacing[4],
              paddingBottom: 'env(safe-area-inset-bottom)',
            }),
        right: theme.spacing[4],
        left: isMobile ? theme.spacing[4] : 'auto',
        zIndex: theme.zIndex.toast,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing[3],
        pointerEvents: 'none',
        maxWidth: isMobile ? undefined : '420px',
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <Toast {...toast} />
        </div>
      ))}
    </div>
  );
}
