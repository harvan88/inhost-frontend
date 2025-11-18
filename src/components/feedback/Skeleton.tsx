/**
 * Skeleton Component - Loading Placeholder
 *
 * Componente base para mostrar placeholders durante la carga.
 * Animación pulse para indicar que está cargando.
 *
 * @example
 * ```tsx
 * <Skeleton width="200px" height="20px" />
 * <Skeleton width="48px" height="48px" circle />
 * <Skeleton width="100%" height="80px" />
 * ```
 */

import { useTheme } from '@/theme';
import type { CSSProperties } from 'react';

interface SkeletonProps {
  /** Ancho del skeleton */
  width?: string | number;
  /** Alto del skeleton */
  height?: string | number;
  /** Renderizar como círculo */
  circle?: boolean;
  /** Estilos adicionales */
  style?: CSSProperties;
  /** Clases CSS adicionales */
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = '20px',
  circle = false,
  style = {},
  className = '',
}: SkeletonProps) {
  const { theme } = useTheme();

  return (
    <div
      className={className}
      style={{
        width,
        height,
        backgroundColor: theme.colors.neutral[200],
        borderRadius: circle ? '50%' : theme.radius.md,
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        ...style,
      }}
      aria-busy="true"
      aria-label="Cargando..."
    />
  );
}

// Agregar animación pulse si no existe
if (typeof document !== 'undefined') {
  const styleId = 'skeleton-animations';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
