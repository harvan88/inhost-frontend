/**
 * Button Component - Atomic Design System
 *
 * Botón reutilizable con múltiples variantes, tamaños y estados.
 * 100% basado en design tokens del theme.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Guardar
 * </Button>
 *
 * <Button variant="danger" disabled>
 *   Eliminar
 * </Button>
 *
 * <Button variant="ghost" loading>
 *   Cargando...
 * </Button>
 * ```
 */

import { useTheme } from '@/theme';
import type { CSSProperties, ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  /** Variante visual del botón */
  variant?: ButtonVariant;
  /** Tamaño del botón */
  size?: ButtonSize;
  /** Muestra spinner y deshabilita el botón */
  loading?: boolean;
  /** Icono a la izquierda del texto */
  leftIcon?: ReactNode;
  /** Icono a la derecha del texto */
  rightIcon?: ReactNode;
  /** Contenido del botón */
  children: ReactNode;
  /** Clases CSS adicionales (solo para layout, no estilos visuales) */
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const { theme } = useTheme();

  // Mapeo de tamaño a componentStyles del theme
  const sizeMap = {
    small: 'small',
    medium: 'secondary',
    large: 'primary',
  } as const;

  const buttonStyles = theme.componentStyles.button[sizeMap[size]];

  // Colores por variante
  const variantColors = {
    primary: {
      background: theme.colors.primary[600],
      backgroundHover: theme.colors.primary[700],
      backgroundActive: theme.colors.primary[800],
      text: theme.colors.neutral[0],
      border: 'none',
    },
    secondary: {
      background: theme.colors.neutral[100],
      backgroundHover: theme.colors.neutral[200],
      backgroundActive: theme.colors.neutral[300],
      text: theme.colors.neutral[900],
      border: `1px solid ${theme.colors.neutral[300]}`,
    },
    tertiary: {
      background: theme.colors.neutral[0],
      backgroundHover: theme.colors.neutral[50],
      backgroundActive: theme.colors.neutral[100],
      text: theme.colors.neutral[700],
      border: `1px solid ${theme.colors.neutral[300]}`,
    },
    ghost: {
      background: 'transparent',
      backgroundHover: theme.colors.neutral[100],
      backgroundActive: theme.colors.neutral[200],
      text: theme.colors.neutral[700],
      border: 'none',
    },
    danger: {
      background: theme.colors.semantic.danger,
      backgroundHover: theme.colors.semantic.dangerDark,
      backgroundActive: theme.colors.semantic.dangerDark,
      text: theme.colors.neutral[0],
      border: 'none',
    },
  };

  const colors = variantColors[variant];
  const isDisabled = disabled || loading;

  // Estilos base
  const baseStyles: CSSProperties = {
    // Del theme
    fontSize: buttonStyles.fontSize,
    fontWeight: buttonStyles.fontWeight,
    padding: buttonStyles.padding,
    height: buttonStyles.height,
    borderRadius: buttonStyles.borderRadius,
    fontFamily: theme.typography.fontFamily.base,

    // Colores
    backgroundColor: colors.background,
    color: colors.text,
    border: colors.border,

    // Layout
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    cursor: isDisabled ? 'not-allowed' : 'pointer',

    // Transiciones
    transition: `all ${theme.transitions.fast} ease`,

    // Estados
    opacity: isDisabled ? 0.5 : 1,

    // Accesibilidad - Touch target mínimo
    minWidth: theme.accessibility.touchTarget.minimum,
    minHeight: theme.accessibility.touchTarget.minimum,

    // Reset de estilos
    outline: 'none',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  };

  // Manejadores de interacción
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      e.currentTarget.style.backgroundColor = colors.backgroundHover;
      e.currentTarget.style.transform = 'translateY(-1px)';
      e.currentTarget.style.boxShadow = theme.elevation.sm;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      e.currentTarget.style.backgroundColor = colors.background;
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      e.currentTarget.style.backgroundColor = colors.backgroundActive;
      e.currentTarget.style.transform = 'translateY(0)';
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      e.currentTarget.style.backgroundColor = colors.backgroundHover;
      e.currentTarget.style.transform = 'translateY(-1px)';
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
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
      disabled={isDisabled}
      className={className}
      style={baseStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <Spinner size={size === 'small' ? 'sm' : 'md'} color={colors.text} />
      )}
      {!loading && leftIcon && <span style={{ display: 'flex' }}>{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span style={{ display: 'flex' }}>{rightIcon}</span>}
    </button>
  );
}

/**
 * Spinner Component (interno)
 * Indicador de carga para el botón
 */
interface SpinnerProps {
  size: 'sm' | 'md';
  color: string;
}

function Spinner({ size, color }: SpinnerProps) {
  const { theme } = useTheme();
  const spinnerSize = theme.componentSizes.spinner[size];

  return (
    <div
      style={{
        width: spinnerSize,
        height: spinnerSize,
        border: `2px solid transparent`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
      }}
      aria-hidden="true"
    />
  );
}

// Agregar animación de spin a los estilos globales si no existe
if (typeof document !== 'undefined') {
  const styleId = 'button-spinner-animation';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `;
    document.head.appendChild(style);
  }
}
