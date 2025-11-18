/**
 * MobileWorkspace Component - Mobile Layout
 *
 * Workspace optimizado para mobile con:
 * - Stack navigation (lista ↔ detalle)
 * - Drawer lateral con Activity Bar
 * - Sin tabs (solo 1 vista a la vez)
 * - Sin contenedores dinámicos múltiples
 *
 * Flujo:
 * 1. Usuario ve lista (Conversaciones/Contactos/etc)
 * 2. Toca un item → navega a detalle (ChatArea)
 * 3. Toca ← → vuelve a la lista previa
 * 4. Toca ☰ → abre drawer con activities
 *
 * @example
 * ```tsx
 * <MobileWorkspace />
 * ```
 */

import { useState } from 'react';
import { useWorkspaceStore } from '@/store/workspace';
import { useTheme } from '@/theme';
import { Drawer, type ActivityId } from './Drawer';
import { MobileHeader } from './MobileHeader';
import PrimarySidebar from '@/components/workspace/PrimarySidebar';
import Canvas from '@/components/workspace/Canvas';

type ViewMode = 'list' | 'detail';

export function MobileWorkspace() {
  const { activeActivity, setActivity } = useWorkspaceStore();
  const { theme } = useTheme();

  // Estado local para stack navigation
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Determinar título según la actividad actual
  const getActivityTitle = (): string => {
    switch (activeActivity) {
      case 'messages':
        return 'Conversaciones';
      case 'contacts':
        return 'Contactos';
      case 'tools':
        return 'Herramientas';
      case 'plugins':
        return 'Plugins';
      default:
        return 'FluxCore';
    }
  };

  // Handler para seleccionar una actividad desde el drawer
  const handleActivitySelect = (activity: ActivityId) => {
    setActivity(activity);
    setViewMode('list'); // Volver a la lista al cambiar de actividad
  };

  // Handler para abrir un detalle (ej: abrir conversación)
  const handleOpenDetail = () => {
    setViewMode('detail');
  };

  // Handler para volver a la lista
  const handleBackToList = () => {
    setViewMode('list');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: theme.colors.neutral[50],
        // Safe area para dispositivos con notch
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Header móvil */}
      <MobileHeader
        variant={viewMode === 'list' ? 'list' : 'detail'}
        title={getActivityTitle()}
        onMenuClick={() => setDrawerOpen(true)}
        onBackClick={handleBackToList}
        onActionClick={() => console.log('Action clicked')}
      />

      {/* Contenido principal (lista o detalle) */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {viewMode === 'list' ? (
          // Vista de lista: Mostrar PrimarySidebar a full width
          <div
            style={{
              height: '100%',
              width: '100%',
              overflow: 'auto',
            }}
          >
            <PrimarySidebar
              // TODO: Pasar callback para detectar cuando se abre un item
              onItemClick={handleOpenDetail}
            />
          </div>
        ) : (
          // Vista de detalle: Mostrar Canvas
          <div
            style={{
              height: '100%',
              width: '100%',
            }}
          >
            <Canvas />
          </div>
        )}
      </div>

      {/* Drawer con Activity Bar */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeActivity={activeActivity || 'messages'}
        onActivitySelect={handleActivitySelect}
      />
    </div>
  );
}
