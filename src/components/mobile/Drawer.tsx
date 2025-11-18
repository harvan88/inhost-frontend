/**
 * Drawer Component - Mobile Navigation
 *
 * Drawer lateral que contiene el Activity Bar vertical con iconos + labels.
 * Se abre desde el menú hamburguesa y permite seleccionar la actividad.
 *
 * @example
 * ```tsx
 * <Drawer
 *   isOpen={drawerOpen}
 *   onClose={() => setDrawerOpen(false)}
 *   activeActivity="messages"
 *   onActivitySelect={(activity) => {
 *     setActivity(activity);
 *     setDrawerOpen(false);
 *   }}
 * />
 * ```
 */

import { useEffect, useRef } from 'react';
import { MessageSquare, Users, Wrench, Puzzle, X } from 'lucide-react';
import { useTheme } from '@/theme';
import { IconButton } from '@/components/ui';

export type ActivityId = 'messages' | 'contacts' | 'tools' | 'plugins';

interface Activity {
  id: ActivityId;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string;
}

interface DrawerProps {
  /** Si el drawer está abierto */
  isOpen: boolean;
  /** Callback al cerrar el drawer */
  onClose: () => void;
  /** Actividad actualmente activa */
  activeActivity: ActivityId;
  /** Callback al seleccionar una actividad */
  onActivitySelect: (activity: ActivityId) => void;
}

const ACTIVITIES: Activity[] = [
  { id: 'messages', icon: MessageSquare, label: 'Mensajes' },
  { id: 'contacts', icon: Users, label: 'Contactos' },
  { id: 'tools', icon: Wrench, label: 'Herramientas' },
  { id: 'plugins', icon: Puzzle, label: 'Plugins' },
];

export function Drawer({
  isOpen,
  onClose,
  activeActivity,
  onActivitySelect,
}: DrawerProps) {
  const { theme } = useTheme();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus trap y keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Focus en el drawer al abrir
    drawerRef.current?.focus();

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll cuando drawer está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: theme.zIndex.drawer,
          animation: 'fadeIn 200ms ease-out',
        }}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        tabIndex={-1}
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: '85%',
          maxWidth: '280px',
          backgroundColor: theme.colors.neutral[900],
          boxShadow: theme.elevation.xl,
          zIndex: Number(theme.zIndex.drawer) + 1,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInLeft 250ms ease-out',
        }}
      >
        {/* Header del drawer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: theme.spacing[4],
            borderBottom: `1px solid ${theme.colors.neutral[800]}`,
          }}
        >
          <h2
            style={{
              fontSize: theme.typography.sizes.lg,
              fontWeight: theme.typography.weights.semibold,
              color: theme.colors.neutral[0],
              margin: 0,
            }}
          >
            FluxCore
          </h2>
          <IconButton
            icon={<X size={theme.iconSizes.lg} />}
            variant="ghost"
            onClick={onClose}
            aria-label="Cerrar menú"
            style={{
              color: theme.colors.neutral[400],
            }}
          />
        </div>

        {/* Activity Bar Vertical */}
        <nav
          style={{
            flex: 1,
            padding: theme.spacing[2],
            overflowY: 'auto',
          }}
          aria-label="Actividades principales"
        >
          {ACTIVITIES.map((activity) => {
            const Icon = activity.icon;
            const isActive = activeActivity === activity.id;

            return (
              <button
                key={activity.id}
                onClick={() => {
                  onActivitySelect(activity.id);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[3],
                  width: '100%',
                  padding: theme.spacing[3],
                  backgroundColor: isActive
                    ? theme.colors.primary[600]
                    : 'transparent',
                  color: isActive
                    ? theme.colors.neutral[0]
                    : theme.colors.neutral[400],
                  border: 'none',
                  borderRadius: theme.radius.lg,
                  cursor: 'pointer',
                  transition: `all ${theme.transitions.fast} ease`,
                  marginBottom: theme.spacing[1],
                  fontSize: theme.typography.sizes.base,
                  fontWeight: isActive
                    ? theme.typography.weights.semibold
                    : theme.typography.weights.normal,
                  fontFamily: theme.typography.fontFamily.base,
                  outline: 'none',
                  textAlign: 'left',
                  minHeight: theme.accessibility.touchTarget.minimum,
                }}
                aria-current={isActive ? 'page' : undefined}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = theme.colors.neutral[800];
                    e.currentTarget.style.color = theme.colors.neutral[0];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.colors.neutral[400];
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = `${theme.accessibility.focusRing.width} ${theme.accessibility.focusRing.style} ${theme.accessibility.focusRing.color.light}`;
                  e.currentTarget.style.outlineOffset = theme.accessibility.focusRing.offset;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                <Icon size={theme.iconSizes.xl} />
                <span>{activity.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer (versión o info adicional) */}
        <div
          style={{
            padding: theme.spacing[4],
            borderTop: `1px solid ${theme.colors.neutral[800]}`,
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.neutral[500],
            textAlign: 'center',
          }}
        >
          v1.0.0
        </div>
      </div>
    </>
  );
}

// Agregar animaciones CSS si no existen
if (typeof document !== 'undefined') {
  const styleId = 'drawer-animations';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideInLeft {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);
  }
}
