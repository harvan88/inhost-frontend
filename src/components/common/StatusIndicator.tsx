/**
 * StatusIndicator.tsx - Componente de Indicador de Estado
 *
 * Dot visual que indica el estado online/offline/away.
 * Soporta posicionamiento corner (absoluto) e inline.
 *
 * ## Ejemplo de uso:
 * ```tsx
 * <StatusIndicator status="online" position="corner" />
 * <StatusIndicator status="away" position="inline" size="16px" />
 * <StatusIndicator status="offline" />
 * ```
 */

import React, { CSSProperties } from 'react';
import { useTheme } from '@/theme';

export interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'away';
  position?: 'corner' | 'inline';
  size?: string;
  className?: string;
}

export function StatusIndicator({
  status,
  position = 'corner',
  size,
  className,
}: StatusIndicatorProps) {
  const { theme } = useTheme();

  // Determine size
  const indicatorSize = size || theme.componentSizes.statusIndicator;

  // Determine color based on status
  let backgroundColor: string;

  switch (status) {
    case 'online':
      backgroundColor = theme.colors.semantic.success;
      break;
    case 'away':
      backgroundColor = theme.colors.semantic.warning;
      break;
    case 'offline':
      backgroundColor = theme.colors.neutral[400];
      break;
    default:
      const exhaustive: never = status;
      throw new Error(`Unhandled status: ${exhaustive}`);
  }

  const baseStyles: CSSProperties = {
    display: position === 'inline' ? 'inline-block' : 'block',
    width: indicatorSize,
    height: indicatorSize,
    borderRadius: theme.radius.full,
    backgroundColor,
    boxShadow: `inset 0 0 0 2px ${theme.colors.neutral[0]}`,
  };

  const cornerStyles: CSSProperties = {
    ...baseStyles,
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
  };

  const styles = position === 'corner' ? cornerStyles : baseStyles;

  return <div style={styles} className={className} />;
}
