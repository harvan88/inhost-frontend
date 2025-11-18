/**
 * Card Component - Atomic Design System
 *
 * Contenedor de contenido con padding y elevación predefinidos.
 * Útil para agrupar información relacionada.
 *
 * @example
 * ```tsx
 * <Card size="md">
 *   <Heading level={3}>Título</Heading>
 *   <Text>Contenido de la tarjeta</Text>
 * </Card>
 *
 * <Card size="lg" elevation="lg" onClick={handleClick}>
 *   Tarjeta clickeable
 * </Card>
 * ```
 */

import { useTheme } from '@/theme';
import type { ReactNode, HTMLAttributes, CSSProperties } from 'react';

export type CardSize = 'sm' | 'md' | 'lg';
export type CardElevation = 'none' | 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  /** Tamaño del card (afecta padding) */
  size?: CardSize;
  /** Nivel de elevación (sombra) */
  elevation?: CardElevation;
  /** Contenido del card */
  children: ReactNode;
  /** Hacer el card clickeable (agrega cursor pointer y hover) */
  clickable?: boolean;
  /** Clases CSS adicionales (solo para layout) */
  className?: string;
}

export function Card({
  size = 'md',
  elevation,
  children,
  clickable = false,
  className = '',
  onClick,
  ...props
}: CardProps) {
  const { theme } = useTheme();

  // Estilos del theme según tamaño
  const cardStyles = theme.componentStyles.card[size];

  // Si no se especifica elevation, usar la del theme según tamaño
  const cardElevation = elevation || (cardStyles.elevation as CardElevation);

  // Estilos base
  const baseStyles: CSSProperties = {
    padding: cardStyles.padding,
    borderRadius: cardStyles.borderRadius,
    backgroundColor: theme.colors.neutral[0],
    border: `1px solid ${theme.colors.neutral[200]}`,
    boxShadow: theme.elevation[cardElevation],
    transition: `all ${theme.transitions.base} ease`,
    cursor: clickable || onClick ? 'pointer' : 'default',
  };

  // Handlers de interacción (solo si es clickable)
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (clickable || onClick) {
      e.currentTarget.style.boxShadow = theme.elevation.md;
      e.currentTarget.style.transform = 'translateY(-2px)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (clickable || onClick) {
      e.currentTarget.style.boxShadow = theme.elevation[cardElevation];
      e.currentTarget.style.transform = 'translateY(0)';
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (clickable || onClick) {
      e.currentTarget.style.transform = 'translateY(0)';
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (clickable || onClick) {
      e.currentTarget.style.transform = 'translateY(-2px)';
    }
  };

  return (
    <div
      className={className}
      style={baseStyles}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      role={clickable || onClick ? 'button' : undefined}
      tabIndex={clickable || onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
