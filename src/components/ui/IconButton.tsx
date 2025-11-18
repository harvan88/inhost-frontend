/**
 * IconButton Component - Atomic Design System
 *
 * Botón circular/cuadrado solo con icono.
 * Optimizado para touch targets (44x44px mínimo) según WCAG.
 * Crítico para interfaces móviles.
 *
 * @example
 * ```tsx
 * <IconButton
 *   icon={<Menu size={24} />}
 *   aria-label="Abrir menú"
 *   onClick={handleMenuClick}
 * />
 *
 * <IconButton
 *   icon={<Search size={20} />}
 *   variant="ghost"
 *   size="sm"
 *   aria-label="Buscar"
 * />
 * ```
 */

import { useTheme } from '@/theme';
import type { ButtonHTMLAttributes, ReactNode, CSSProperties } from 'react';

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  /** Icono a mostrar */
  icon: ReactNode;
  /** Variante visual del botón */
  variant?: IconButtonVariant;
  /** Tamaño del botón */
  size?: IconButtonSize;
  /** Forma del botón */
  shape?: 'circle' | 'square';
  /** aria-label es REQUERIDO para accesibilidad */
  'aria-label': string;
  /** Clases CSS adicionales (solo para layout) */
  className?: string;
}

export function IconButton({
  icon,
  variant = 'secondary',
  size = 'md',
  shape = 'square',
  disabled,
  className = '',
  ...props
}: IconButtonProps) {
  const { theme } = useTheme();

  // Tamaños del botón (respetando touch targets de 44px mínimo)
  const sizeMap = {
    sm: '36px', // Solo para desktop, en mobile será 44px
    md: '44px', // Touch target estándar
    lg: '48px', // Touch target recomendado
  };

  const buttonSize = sizeMap[size];

  // Colores por variante
  const variantColors = {
    primary: {
      background: theme.colors.primary[600],
      backgroundHover: theme.colors.primary[700],
      backgroundActive: theme.colors.primary[800],
      icon: theme.colors.neutral[0],
    },
    secondary: {
      background: theme.colors.neutral[100],
      backgroundHover: theme.colors.neutral[200],
      backgroundActive: theme.colors.neutral[300],
      icon: theme.colors.neutral[700],
    },
    ghost: {
      background: 'transparent',
      backgroundHover: theme.colors.neutral[100],
      backgroundActive: theme.colors.neutral[200],
      icon: theme.colors.neutral[700],
    },
    danger: {
      background: theme.colors.semantic.dangerLight,
      backgroundHover: theme.colors.semantic.danger,
      backgroundActive: theme.colors.semantic.dangerDark,
      icon: theme.colors.semantic.danger,
    },
  };

  const colors = variantColors[variant];

  // Estilos base
  const baseStyles: CSSProperties = {
    width: buttonSize,
    height: buttonSize,
    minWidth: theme.accessibility.touchTarget.minimum,
    minHeight: theme.accessibility.touchTarget.minimum,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.componentStyles.button.icon.padding,
    backgroundColor: colors.background,
    color: colors.icon,
    border: 'none',
    borderRadius: shape === 'circle' ? theme.radius.full : theme.radius.md,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: `all ${theme.transitions.fast} ease`,
    outline: 'none',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  };

  // Handlers de interacción
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = colors.backgroundHover;
      if (variant === 'danger') {
        e.currentTarget.style.color = theme.colors.neutral[0];
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = colors.background;
      e.currentTarget.style.color = colors.icon;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = colors.backgroundActive;
      e.currentTarget.style.transform = 'scale(0.95)';
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = colors.backgroundHover;
      e.currentTarget.style.transform = 'scale(1)';
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.outline = `${theme.accessibility.focusRing.width} ${theme.accessibility.focusRing.style} ${theme.accessibility.focusRing.color.light}`;
      e.currentTarget.style.outlineOffset = theme.accessibility.focusRing.offset;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.outline = 'none';
  };

  return (
    <button
      type="button"
      disabled={disabled}
      className={className}
      style={baseStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-disabled={disabled}
      {...props}
    >
      {icon}
    </button>
  );
}
