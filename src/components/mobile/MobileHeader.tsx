/**
 * MobileHeader Component - Mobile Navigation Header
 *
 * Header móvil con dos variantes:
 * 1. Lista: Menú hamburguesa + título + acciones
 * 2. Detalle: Botón atrás + título + acciones
 *
 * @example
 * ```tsx
 * // Variante lista
 * <MobileHeader
 *   variant="list"
 *   title="Conversaciones"
 *   onMenuClick={() => setDrawerOpen(true)}
 *   onActionClick={() => console.log('action')}
 * />
 *
 * // Variante detalle
 * <MobileHeader
 *   variant="detail"
 *   title="Juan Pérez"
 *   onBackClick={() => navigate('back')}
 *   onActionClick={() => console.log('action')}
 * />
 * ```
 */

import { Menu, ArrowLeft, MoreVertical } from 'lucide-react';
import { useTheme } from '@/theme';
import { IconButton, Heading } from '@/components/ui';

export type MobileHeaderVariant = 'list' | 'detail';

interface MobileHeaderProps {
  /** Variante del header (lista o detalle) */
  variant: MobileHeaderVariant;
  /** Título a mostrar */
  title: string;
  /** Callback al tocar menú hamburguesa (solo en variante 'list') */
  onMenuClick?: () => void;
  /** Callback al tocar botón atrás (solo en variante 'detail') */
  onBackClick?: () => void;
  /** Callback al tocar botón de acciones (⋮) */
  onActionClick?: () => void;
}

export function MobileHeader({
  variant,
  title,
  onMenuClick,
  onBackClick,
  onActionClick,
}: MobileHeaderProps) {
  const { theme } = useTheme();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
        backgroundColor: theme.colors.neutral[0],
        borderBottom: `1px solid ${theme.colors.neutral[200]}`,
        height: '56px', // Altura fija para layouts
        // Safe area para iPhone con notch
        paddingTop: `max(${theme.spacing[3]}, env(safe-area-inset-top))`,
      }}
    >
      {/* Botón izquierdo (menú o atrás) */}
      {variant === 'list' ? (
        <IconButton
          icon={<Menu size={theme.iconSizes.xl} />}
          variant="ghost"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        />
      ) : (
        <IconButton
          icon={<ArrowLeft size={theme.iconSizes.xl} />}
          variant="ghost"
          onClick={onBackClick}
          aria-label="Volver"
        />
      )}

      {/* Título */}
      <Heading
        level={1}
        noMargin
        style={{
          flex: 1,
          fontSize: theme.typography.sizes.lg,
          fontWeight: theme.typography.weights.semibold,
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginLeft: theme.spacing[2],
          marginRight: theme.spacing[2],
        }}
      >
        {title}
      </Heading>

      {/* Botón de acciones */}
      <IconButton
        icon={<MoreVertical size={theme.iconSizes.lg} />}
        variant="ghost"
        onClick={onActionClick}
        aria-label="Más opciones"
      />
    </header>
  );
}
