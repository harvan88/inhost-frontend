/**
 * Text Component - Atomic Design System
 *
 * Componente de texto con variantes predefinidas del theme.
 * Garantiza tipografía consistente en toda la aplicación.
 *
 * @example
 * ```tsx
 * <Text variant="normal">Texto regular del cuerpo</Text>
 * <Text variant="metadata" color="muted">Información secundaria</Text>
 * <Text variant="label">Etiqueta de formulario</Text>
 * ```
 */

import { useTheme } from '@/theme';
import type { ReactNode, HTMLAttributes, CSSProperties } from 'react';

export type TextVariant = 'normal' | 'metadata' | 'label';
export type TextColor = 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'danger';
export type TextElement = 'p' | 'span' | 'div' | 'label';

export interface TextProps extends Omit<HTMLAttributes<HTMLElement>, 'style'> {
  /** Variante de texto (normal, metadata, label) */
  variant?: TextVariant;
  /** Color del texto */
  color?: TextColor;
  /** Elemento HTML a renderizar */
  as?: TextElement;
  /** Truncar texto con ellipsis */
  truncate?: boolean;
  /** Contenido del texto */
  children: ReactNode;
  /** Clases CSS adicionales (solo para layout) */
  className?: string;
}

export function Text({
  variant = 'normal',
  color = 'default',
  as = 'p',
  truncate = false,
  children,
  className = '',
  ...props
}: TextProps) {
  const { theme } = useTheme();

  // FUENTE DE VERDAD ÚNICA: Tokens centrales de tipografía
  // NO usar componentStyles.text - valores hardcodeados que no reaccionan
  const variantStyles = {
    normal: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.normal,
      lineHeight: theme.typography.lineHeights.normal,
    },
    metadata: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.normal,
      lineHeight: theme.typography.lineHeights.normal,
    },
    label: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium,
      lineHeight: theme.typography.lineHeights.normal,
    },
  };

  // Colores por variante
  const colorMap = {
    default: theme.colors.neutral[900],
    primary: theme.colors.primary[600],
    secondary: theme.colors.neutral[700],
    muted: theme.colors.neutral[500],
    success: theme.colors.semantic.success,
    warning: theme.colors.semantic.warning,
    danger: theme.colors.semantic.danger,
  };

  // Estilos base del theme
  const baseStyles: CSSProperties = {
    fontSize: variantStyles[variant].fontSize,
    fontWeight: variantStyles[variant].fontWeight,
    lineHeight: variantStyles[variant].lineHeight,
    fontFamily: theme.typography.fontFamily.base,
    color: colorMap[color],
    margin: 0,
    padding: 0,
  };

  // Estilos para truncar texto
  if (truncate) {
    Object.assign(baseStyles, {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    });
  }

  // Componente dinámico según el parámetro 'as'
  const Tag = as;

  return (
    <Tag className={className} style={baseStyles} {...props}>
      {children}
    </Tag>
  );
}
