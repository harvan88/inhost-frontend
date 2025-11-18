/**
 * Badge.tsx - Componente de Badge Genérico
 *
 * Componente reutilizable que usa theme tokens exclusivamente.
 * Soporta múltiples variantes, colores y canales.
 *
 * ## Ejemplo de uso:
 * ```tsx
 * <Badge variant="default" color="primary">Primary Badge</Badge>
 * <Badge variant="compact" color="success">Success</Badge>
 * <Badge color="channel" channel="whatsapp">WhatsApp</Badge>
 * ```
 */

import React, { CSSProperties } from 'react';
import { useTheme } from '@/theme';
import { parseSpacing } from './parseSpacing';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'compact' | 'loose';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'channel';
  channel?: 'whatsapp' | 'telegram' | 'web' | 'sms';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  color = 'primary',
  channel = 'whatsapp',
  className,
}: BadgeProps) {
  const { theme } = useTheme();

  // Parse padding from theme tokens
  const spacingValue = theme.componentSpacing.badge[variant];
  const paddingStyles = parseSpacing(spacingValue);

  // Determine background and text colors
  let backgroundColor: string;
  let textColor: string;

  switch (color) {
    case 'primary':
      backgroundColor = theme.colors.primary[100];
      textColor = theme.colors.primary[700];
      break;
    case 'success':
      backgroundColor = theme.colors.semantic.successLight;
      textColor = theme.colors.semantic.success;
      break;
    case 'warning':
      backgroundColor = theme.colors.semantic.warningLight;
      textColor = theme.colors.semantic.warning;
      break;
    case 'danger':
      backgroundColor = theme.colors.semantic.dangerLight;
      textColor = theme.colors.semantic.danger;
      break;
    case 'channel':
      if (!theme.colors.channels[channel]) {
        throw new Error(`Invalid channel: ${channel}`);
      }
      backgroundColor = theme.colors.channels[channel][100];
      textColor = theme.colors.channels[channel][700];
      break;
    case 'neutral':
      backgroundColor = theme.colors.neutral[100];
      textColor = theme.colors.neutral[700];
      break;
    default:
      const exhaustive: never = color;
      throw new Error(`Unhandled color: ${exhaustive}`);
  }

  const styles: CSSProperties = {
    display: 'inline-block',
    backgroundColor,
    color: textColor,
    borderRadius: theme.radius.sm,
    fontFamily: theme.typography.fontFamily.base,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    lineHeight: theme.typography.lineHeights.normal,
    whiteSpace: 'nowrap',
    ...paddingStyles,
  };

  return (
    <span style={styles} className={className}>
      {children}
    </span>
  );
}
