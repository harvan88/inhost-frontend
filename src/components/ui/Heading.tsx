/**
 * Heading Component - Atomic Design System
 *
 * Componente de títulos semánticos (h1-h6) con estilos del theme.
 * Garantiza consistencia y accesibilidad en toda la aplicación.
 *
 * @example
 * ```tsx
 * <Heading level={1}>Título Principal</Heading>
 * <Heading level={2} color="primary">Subtítulo</Heading>
 * <Heading level={3} className="mb-4">Sección</Heading>
 * ```
 */

import { createElement } from 'react';
import { useTheme } from '@/theme';
import type { ReactNode, HTMLAttributes, CSSProperties } from 'react';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingColor = 'default' | 'primary' | 'secondary' | 'muted';

export interface HeadingProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'style'> {
  /** Nivel semántico del heading (h1-h6) */
  level: HeadingLevel;
  /** Color del texto */
  color?: HeadingColor;
  /** Contenido del heading */
  children: ReactNode;
  /** Clases CSS adicionales (solo para layout) */
  className?: string;
  /** Eliminar margin por defecto */
  noMargin?: boolean;
}

export function Heading({
  level,
  color = 'default',
  children,
  className = '',
  noMargin = false,
  ...props
}: HeadingProps) {
  const { theme } = useTheme();

  // FUENTE DE VERDAD ÚNICA: Tokens centrales de tipografía
  // NO usar componentStyles.heading - valores hardcodeados que no reaccionan
  const levelStyles = {
    1: {
      fontSize: theme.typography.sizes['2xl'],
      fontWeight: theme.typography.weights.bold,
      lineHeight: theme.typography.lineHeights.tight,
      margin: theme.spacing[4],
    },
    2: {
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.weights.semibold,
      lineHeight: theme.typography.lineHeights.tight,
      margin: theme.spacing[3],
    },
    3: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.semibold,
      lineHeight: theme.typography.lineHeights.tight,
      margin: theme.spacing[3],
    },
    4: {
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.semibold,
      lineHeight: theme.typography.lineHeights.normal,
      margin: theme.spacing[2],
    },
    5: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.semibold,
      lineHeight: theme.typography.lineHeights.normal,
      margin: theme.spacing[2],
    },
    6: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.semibold,
      lineHeight: theme.typography.lineHeights.normal,
      margin: theme.spacing[1],
    },
  };

  const styles = levelStyles[level];

  // Colores por variante
  const colorMap = {
    default: theme.colors.neutral[900],
    primary: theme.colors.primary[600],
    secondary: theme.colors.neutral[700],
    muted: theme.colors.neutral[500],
  };

  // Estilos base del theme
  const baseStyles: CSSProperties = {
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    lineHeight: styles.lineHeight,
    margin: noMargin ? '0' : styles.margin,
    fontFamily: theme.typography.fontFamily.base,
    color: colorMap[color],
  };

  // Componente dinámico según el nivel
  const tagName = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return createElement(
    tagName,
    { className, style: baseStyles, ...props },
    children
  );
}
