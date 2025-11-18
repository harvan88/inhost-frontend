/**
 * Toast Component - Notification System
 *
 * Sistema de notificaciones tipo toast con 4 variantes.
 * Auto-cierre configurable, acciones opcionales, animaciones suaves.
 *
 * @example
 * ```tsx
 * <Toast
 *   id="toast-1"
 *   type="success"
 *   title="¡Éxito!"
 *   message="El mensaje se envió correctamente"
 *   onClose={() => removeToast('toast-1')}
 * />
 *
 * <Toast
 *   type="error"
 *   title="Error"
 *   message="No se pudo conectar al servidor"
 *   action={{ label: 'Reintentar', onClick: retry }}
 *   duration={null} // No auto-cierra
 * />
 * ```
 */

import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useTheme } from '@/theme';
import { IconButton } from '@/components/ui';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  /** ID único del toast */
  id: string;
  /** Tipo de toast */
  type: ToastType;
  /** Título del toast */
  title: string;
  /** Mensaje del toast */
  message: string;
  /** Acción opcional */
  action?: ToastAction;
  /** Duración en ms antes de auto-cerrar (null = no auto-cierra) */
  duration?: number | null;
  /** Callback al cerrar */
  onClose: () => void;
}

export function Toast({
  id,
  type,
  title,
  message,
  action,
  duration = 5000,
  onClose,
}: ToastProps) {
  const { theme } = useTheme();

  // Auto-close después de duration
  useEffect(() => {
    if (duration !== null) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // Iconos por tipo
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  // Colores por tipo
  const colors = {
    success: theme.colors.semantic.success,
    error: theme.colors.semantic.danger,
    warning: theme.colors.semantic.warning,
    info: theme.colors.primary[500],
  };

  // Backgrounds por tipo
  const backgrounds = {
    success: theme.colors.semantic.successLight,
    error: theme.colors.semantic.dangerLight,
    warning: theme.colors.semantic.warningLight,
    info: theme.colors.primary[50],
  };

  const Icon = icons[type];
  const color = colors[type];
  const background = backgrounds[type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        display: 'flex',
        gap: theme.spacing[3],
        padding: theme.spacing[4],
        backgroundColor: theme.colors.neutral[0],
        border: `1px solid ${color}`,
        borderRadius: theme.radius.lg,
        boxShadow: theme.elevation.lg,
        minWidth: '320px',
        maxWidth: '420px',
        animation: 'slideInRight 250ms ease-out',
      }}
    >
      {/* Icono */}
      <div
        style={{
          flexShrink: 0,
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: background,
          borderRadius: theme.radius.full,
        }}
      >
        <Icon size={theme.iconSizes.lg} style={{ color }} />
      </div>

      {/* Contenido */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4
          style={{
            fontSize: theme.typography.sizes.base,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing[1],
            margin: 0,
          }}
        >
          {title}
        </h4>
        <p
          style={{
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.neutral[600],
            lineHeight: theme.typography.lineHeights.relaxed,
            margin: 0,
            wordWrap: 'break-word',
          }}
        >
          {message}
        </p>

        {/* Acción opcional */}
        {action && (
          <button
            onClick={() => {
              action.onClick();
              onClose();
            }}
            style={{
              marginTop: theme.spacing[2],
              padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
              backgroundColor: color,
              color: theme.colors.neutral[0],
              border: 'none',
              borderRadius: theme.radius.md,
              fontSize: theme.typography.sizes.sm,
              fontWeight: theme.typography.weights.semibold,
              cursor: 'pointer',
              transition: `all ${theme.transitions.fast} ease`,
              fontFamily: theme.typography.fontFamily.base,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Botón cerrar */}
      <IconButton
        icon={<X size={theme.iconSizes.sm} />}
        variant="ghost"
        size="sm"
        onClick={onClose}
        aria-label="Cerrar notificación"
        style={{
          flexShrink: 0,
          alignSelf: 'flex-start',
        }}
      />
    </div>
  );
}

// Agregar animación slideInRight si no existe
if (typeof document !== 'undefined') {
  const styleId = 'toast-animations';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
