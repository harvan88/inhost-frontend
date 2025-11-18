import { useTheme } from '@/theme';
import type { ReactNode } from 'react';

/**
 * Tag - Componente atómico para etiquetas/badges de categoría
 *
 * Este componente es la ÚNICA forma de renderizar tags en la aplicación.
 * NO usar divs con estilos inline.
 *
 * **Contrato estricto:**
 * - 100% theme tokens
 * - Sin estilos hardcodeados
 * - Props tipadas y validadas
 *
 * @example
 * <Tag size="small">Diseño</Tag>
 * <Tag size="default" color="primary">Importante</Tag>
 */

export type TagSize = 'small' | 'default';
export type TagColor = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

export interface TagProps {
  /** Contenido del tag */
  children: ReactNode;
  /** Tamaño del tag */
  size?: TagSize;
  /** Color del tag */
  color?: TagColor;
  /** Clase CSS adicional */
  className?: string;
}

const colorMap: Record<TagColor, { bg: string; text: string }> = {
  neutral: { bg: 'neutral.100', text: 'neutral.700' },
  primary: { bg: 'primary.100', text: 'primary.700' },
  success: { bg: 'semantic.successLight', text: 'semantic.success' },
  warning: { bg: 'semantic.warningLight', text: 'semantic.warning' },
  danger: { bg: 'semantic.dangerLight', text: 'semantic.danger' },
};

export function Tag({
  children,
  size = 'default',
  color = 'neutral',
  className,
}: TagProps) {
  const { theme } = useTheme();

  // Validación de contrato en desarrollo
  if (!children) {
    console.error('[Tag] CONTRATO ROTO: Tag debe tener contenido (children)');
  }

  const sizeStyles = size === 'small'
    ? theme.componentStyles.tag.small
    : theme.componentStyles.tag.default;

  // Resolver colores del mapa
  const getColorValue = (path: string) => {
    const [category, shade] = path.split('.');
    if (category === 'neutral') {
      return (theme.colors.neutral as any)[shade];
    }
    if (category === 'primary') {
      return (theme.colors.primary as any)[shade];
    }
    if (category === 'semantic') {
      return (theme.colors.semantic as any)[shade.replace('Light', 'Light')];
    }
    return theme.colors.neutral[700];
  };

  const colors = colorMap[color];

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        padding: sizeStyles.padding,
        fontSize: sizeStyles.fontSize,
        fontWeight: sizeStyles.fontWeight,
        backgroundColor: getColorValue(colors.bg),
        color: getColorValue(colors.text),
        borderRadius: theme.radius.sm,
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}
