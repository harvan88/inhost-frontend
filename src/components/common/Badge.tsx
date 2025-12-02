/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "C:\Users\harva\Documents\Trabajos\meetgar\FluxCoreChat\inhost-frontend\src\components\common\Badge.tsx"
 *   type: "component"
 *   layer: "frontend"
 *   domain: "ui"
 *   purpose: "Component for badge"
 *
 * DEPENDENCIES:
 *   internal: ["./parseSpacing","@/theme"]
 *   external: ["react"]
 *   infrastructure: []
 *
 * CONTRACTS:
 *   exports: ["Badge","BadgeProps"]
 *   inputs: "BadgeProps, BadgeProps"
 *   outputs: "JSX.Element"
 *   errors: "Error"
 *
 * INTEGRATION:
 *   data_flow: "Input → Processing → Output"
 *   events_emitted: []
 *   events_consumed: []
 *
 * IMPACT:
 *   used_by: "To be determined via dependency analysis"
 *   uses: ["./parseSpacing","@/theme","react"]
 *   critical: false
 *
 * === DOC_END :: Badge.tsx ===
 */

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
      backgroundColor = theme.colors.primary[100] || '#dbeafe';
      textColor = theme.colors.primary[700] || '#1d4ed8';
      break;
    case 'success':
      backgroundColor = theme.colors.semantic.successLight || '#d1fae5';
      textColor = theme.colors.semantic.success || '#10b981';
      break;
    case 'warning':
      backgroundColor = theme.colors.semantic.warningLight || '#fef3c7';
      textColor = theme.colors.semantic.warning || '#f59e0b';
      break;
    case 'danger':
      backgroundColor = theme.colors.semantic.dangerLight || '#fee2e2';
      textColor = theme.colors.semantic.danger || '#ef4444';
      break;
    case 'channel':
      if (!theme.colors.channels[channel]) {
        throw new Error(`Invalid channel: ${channel}`);
      }
      backgroundColor = theme.colors.channels[channel][100] || '#dbeafe';
      textColor = theme.colors.channels[channel][700] || '#1d4ed8';
      break;
    case 'neutral':
      backgroundColor = theme.colors.neutral[100] || '#f3f4f6';
      textColor = theme.colors.neutral[700] || '#374151';
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
