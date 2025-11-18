/**
 * Input Component - Atomic Design System
 *
 * Campo de entrada de texto con variantes, estados y validación.
 * 100% basado en design tokens del theme.
 *
 * @example
 * ```tsx
 * <Input
 *   variant="default"
 *   placeholder="Escribir mensaje..."
 *   value={text}
 *   onChange={(e) => setText(e.target.value)}
 * />
 *
 * <Input
 *   variant="search"
 *   placeholder="Buscar..."
 *   leftIcon={<Search size={18} />}
 * />
 *
 * <Input
 *   error="El campo es requerido"
 *   value={value}
 * />
 * ```
 */

import { useTheme } from '@/theme';
import type { InputHTMLAttributes, ReactNode, CSSProperties } from 'react';

export type InputVariant = 'default' | 'small' | 'search';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'style' | 'size'> {
  /** Variante del input */
  variant?: InputVariant;
  /** Mensaje de error (muestra el input en estado error) */
  error?: string;
  /** Texto de ayuda debajo del input */
  helperText?: string;
  /** Icono a la izquierda */
  leftIcon?: ReactNode;
  /** Icono a la derecha */
  rightIcon?: ReactNode;
  /** Clases CSS adicionales (solo para layout) */
  className?: string;
  /** Label para el input */
  label?: string;
}

export function Input({
  variant = 'default',
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  label,
  disabled,
  ...props
}: InputProps) {
  const { theme } = useTheme();

  // Estilos del theme según variante
  const variantMap = {
    default: 'default',
    small: 'small',
    search: 'default', // search usa el mismo estilo que default
  } as const;

  const inputStyles = theme.componentStyles.input[variantMap[variant]];

  // Estados de color
  const borderColor = error
    ? theme.colors.semantic.danger
    : theme.colors.neutral[300];

  const borderColorFocus = error
    ? theme.colors.semantic.danger
    : theme.colors.primary[500];

  // Estilos del contenedor
  const containerStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[1],
    width: '100%',
  };

  // Estilos del wrapper (input + iconos)
  const wrapperStyles: CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  };

  // Estilos base del input
  const baseInputStyles: CSSProperties = {
    fontSize: inputStyles.fontSize,
    fontWeight: inputStyles.fontWeight,
    height: inputStyles.height,
    fontFamily: theme.typography.fontFamily.base,
    color: disabled ? theme.colors.neutral[400] : theme.colors.neutral[900],
    backgroundColor: disabled ? theme.colors.neutral[50] : theme.colors.neutral[0],
    border: `1px solid ${borderColor}`,
    borderRadius: theme.radius.md,
    padding: inputStyles.padding,
    width: '100%',
    outline: 'none',
    transition: `all ${theme.transitions.fast} ease`,
    cursor: disabled ? 'not-allowed' : 'text',

    // Ajustar padding si hay iconos
    ...(leftIcon && {
      paddingLeft: `calc(${inputStyles.padding.split(' ')[1]} + ${theme.spacing[8]})`,
    }),
    ...(rightIcon && {
      paddingRight: `calc(${inputStyles.padding.split(' ')[1]} + ${theme.spacing[8]})`,
    }),
  };

  // Estilos de los iconos
  const iconStyles: CSSProperties = {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    color: error ? theme.colors.semantic.danger : theme.colors.neutral[500],
    pointerEvents: 'none',
  };

  const leftIconStyles: CSSProperties = {
    ...iconStyles,
    left: theme.spacing[3],
  };

  const rightIconStyles: CSSProperties = {
    ...iconStyles,
    right: theme.spacing[3],
  };

  // Handlers de eventos para estados
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = borderColorFocus;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? theme.colors.semantic.dangerLight : theme.colors.primary[100]}`;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = borderColor;
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div style={containerStyles} className={className}>
      {/* Label */}
      {label && (
        <label
          style={{
            fontSize: theme.componentStyles.text.label.fontSize,
            fontWeight: theme.componentStyles.text.label.fontWeight,
            color: disabled ? theme.colors.neutral[400] : theme.colors.neutral[700],
          }}
        >
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div style={wrapperStyles}>
        {/* Left icon */}
        {leftIcon && <span style={leftIconStyles}>{leftIcon}</span>}

        {/* Input */}
        <input
          style={baseInputStyles}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={!!error}
          aria-describedby={error ? 'input-error' : helperText ? 'input-helper' : undefined}
          {...props}
        />

        {/* Right icon */}
        {rightIcon && <span style={rightIconStyles}>{rightIcon}</span>}
      </div>

      {/* Error message */}
      {error && (
        <span
          id="input-error"
          role="alert"
          style={{
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.semantic.danger,
          }}
        >
          {error}
        </span>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <span
          id="input-helper"
          style={{
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.neutral[500],
          }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
}
