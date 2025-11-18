import { useTheme } from '@/theme';
import type { ReactNode } from 'react';

/**
 * ListCard - Componente atómico para tarjetas de lista en sidebar
 *
 * Este componente unifica la apariencia de todas las tarjetas que aparecen
 * en listas de sidebar, garantizando consistencia visual entre:
 * - Conversaciones (ConversationListItem)
 * - Herramientas (ToolsView)
 * - Contactos (ContactsView)
 * - Plugins (PluginsView)
 *
 * **Principios de diseño:**
 * - 100% theme tokens
 * - Estados hover/active unificados
 * - Touch targets 44px+ mínimo
 * - Transiciones suaves
 * - Indicador visual de activo (borde izquierdo)
 *
 * **Ejemplo de uso:**
 *
 * ```tsx
 * <ListCard
 *   isActive={isActive}
 *   onClick={handleClick}
 * >
 *   <div>Contenido de la tarjeta</div>
 * </ListCard>
 * ```
 */

export interface ListCardProps {
  /** Contenido de la tarjeta */
  children: ReactNode;
  /** Si la tarjeta está activa (seleccionada) */
  isActive?: boolean;
  /** Handler de click */
  onClick?: () => void;
  /** Clase CSS adicional */
  className?: string;
  /** Si debe mostrar el indicador de activo (borde izquierdo) */
  showActiveIndicator?: boolean;
}

export function ListCard({
  children,
  isActive = false,
  onClick,
  className,
  showActiveIndicator = true,
}: ListCardProps) {
  const { theme } = useTheme();

  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        padding: theme.componentStyles.sidebarListItem.padding,
        borderBottom: `${theme.componentStyles.sidebarListItem.borderBottomWidth} solid ${theme.colors.neutral[200]}`,
        borderLeft: isActive && showActiveIndicator
          ? `${theme.componentStyles.sidebarListItem.activeIndicatorWidth} solid ${theme.colors.primary[500]}`
          : 'none',
        backgroundColor: isActive ? theme.colors.primary[50] : 'transparent',
        cursor: onClick ? 'pointer' : 'default',
        transition: `all ${theme.transitions.fast} ease`,
        minHeight: theme.accessibility.touchTarget.minimum,
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseEnter={(e) => {
        if (onClick && !isActive) {
          e.currentTarget.style.backgroundColor = theme.colors.neutral[100];
        }
      }}
      onMouseLeave={(e) => {
        if (onClick && !isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {children}
    </div>
  );
}
