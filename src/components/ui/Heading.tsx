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

  // Mapeo de nivel a componentStyles
  const styleKey = `h${level}` as keyof typeof theme.componentStyles.heading;
  const headingStyles = theme.componentStyles.heading[styleKey];

  // Colores por variante
  const colorMap = {
    default: theme.colors.neutral[900],
    primary: theme.colors.primary[600],
    secondary: theme.colors.neutral[700],
    muted: theme.colors.neutral[500],
  };

  // Estilos base del theme
  const baseStyles: CSSProperties = {
    fontSize: headingStyles.fontSize,
    fontWeight: headingStyles.fontWeight,
    lineHeight: headingStyles.lineHeight,
    margin: noMargin ? '0' : headingStyles.margin,
    fontFamily: theme.typography.fontFamily.base,
    color: colorMap[color],
  };

  // Componente dinámico según el nivel
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag className={className} style={baseStyles} {...props}>
      {children}
    </Tag>
  );
}
