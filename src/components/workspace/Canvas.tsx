/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "components/workspace/Canvas.tsx"
 *   type: "component"
 *   layer: "frontend"
 *   domain: "ui"
 *   purpose: "Lienzo dinámico (Nivel 3 del workspace) que maneja múltiples DynamicContainers con sistema de particiones ajustables. Máximo 3 contenedores simultáneos con redistribución proporcional de anchos. Incluye controles para crear/cerrar contenedores y toggle de tema"
 *
 * DEPENDENCIES:
 *   internal: ["./DynamicContainer","@/components/ui","@/hooks/useCombinedRefs","@/hooks/useOverflowDetection","@/hooks/useResizeObserver","@/store/workspace","@/theme"]
 *   external: ["lucide-react"]
 *   infrastructure: []
 *
 * CONTRACTS:
 *   exports: ["Canvas"]
 *   inputs: []
 *   outputs: ["JSX.Element (flex container con DynamicContainers)"]
 *   errors: []
 *
 * INTEGRATION:
 *   data_flow: "[workspace-store.containers] → [render DynamicContainer foreach] → [user interactions (create/close)] → [workspace actions] → [re-render with new layout]"
 *   events_emitted: []
 *   events_consumed: ["workspace-store changes (containers, activeContainerId)", "window resize events"]
 *
 * IMPACT:
 *   used_by: ["components/workspace/Workspace.tsx"]
 *   uses: ["./DynamicContainer","@/components/ui","@/hooks/useCombinedRefs","@/hooks/useOverflowDetection","@/hooks/useResizeObserver","@/store/workspace","@/theme","lucide-react"]
 *   critical: true
 *
 * === DOC_END :: Canvas.tsx ===
 */

import { Plus, Moon, Sun } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspace';
import { useTheme } from '@/theme';
import { Text } from '@/components/ui';
import DynamicContainer from './DynamicContainer';
import { useResizeObserver } from '@/hooks/useResizeObserver';
import { useOverflowDetection } from '@/hooks/useOverflowDetection';
import { useCombinedRefs } from '@/hooks/useCombinedRefs';

/**
 * Canvas - Lienzo Dinámico (Nivel 3)
 *
 * ## Definición (según documento formal - Sección 5.1)
 *
 * El Lienzo Dinámico constituye el área principal de trabajo del sistema y define
 * el espacio dentro del cual pueden existir y operar uno o varios Contenedores Dinámicos.
 * Su función es actuar como un marco estructural adaptable que:
 *
 * - Demarca los límites en los que los contenedores pueden existir
 *   (ningún módulo puede exceder o superponer su espacio)
 * - Se ajusta dinámicamente en función de la visibilidad de la Barra Lateral Contextual
 * - Ofrece una grilla flexible capaz de organizar múltiples vistas en paralelo
 *
 * **Ajuste automático:**
 * Cuando la Barra Lateral Contextual se encuentra retraída, el Lienzo Dinámico se expande
 * de forma automática para ocupar el espacio liberado, maximizando el área disponible
 * para los contenedores.
 *
 * ## Comportamiento Espacial Interno (Sección 5.2)
 *
 * El Lienzo implementa un sistema de distribución de espacio basado en particiones ajustables:
 *
 * **Un solo contenedor:**
 * - Ocupa el 100% del ancho disponible del Lienzo
 * - Estado base del sistema
 *
 * **Dos contenedores:**
 * - Espacio dividido en 50% / 50% de forma predeterminada
 * - Usuario puede mover el divisor horizontal para redefinir distribución
 *
 * **Múltiples contenedores:**
 * - Admite creación de varios contenedores simultáneos
 * - Cada contenedor existe dentro de una sección independiente de la grilla
 * - Usuario puede reorganizarlos mediante arrastre o cierre individual
 *
 * **Redimensionamiento manual:**
 * - Particiones entre contenedores son ajustables
 * - Mantiene proporcionalidad relativa tras cambios de tamaño del viewport
 *
 * **Persistencia del estado espacial:**
 * - Sistema recuerda distribución de contenedores (opcional)
 * - Preserva configuraciones del usuario durante la sesión
 *
 * ## Rol Conceptual (Sección 5.3)
 *
 * El Lienzo opera como un entorno de trabajo modular, ofreciendo libertad para
 * organizar vistas, herramientas y conversaciones según necesidades operativas.
 *
 * Casos de uso típicos:
 *
 * - **Conversaciones paralelas:**
 *   Dos ChatArea abiertos simultáneamente, lado a lado
 *
 * - **Conversación + Perfil:**
 *   ChatArea + ContactArea para el mismo usuario
 *
 * - **Conversación + Herramienta de IA:**
 *   ChatArea + ToolArea (análisis, transcripción, resumen)
 *
 * - **Herramientas múltiples:**
 *   Transcriptor + Analizador semántico + Buscador interno
 *
 * - **Interfaces de plugins integradas:**
 *   Plugin CRM + Dashboard automatizaciones + Visor de logs/métricas
 *
 * En esencia, el Lienzo Dinámico define la capacidad multivista de FluxCore
 * y habilita una experiencia de trabajo fluida, personalizable y comparable
 * a entornos avanzados de desarrollo y productividad.
 *
 * ## Arquitectura Técnica
 *
 * Modelo conceptual:
 * ```
 * Lienzo Dinámico (Canvas)
 *   ├─ Contenedor Dinámico 1 → Herramienta A (con tabs)
 *   ├─ Contenedor Dinámico 2 → Herramienta B (con tabs)
 *   └─ Contenedor Dinámico N → Herramienta N (con tabs)
 * ```
 *
 * Responsabilidades:
 * - Renderizar todos los Contenedores Dinámicos activos
 * - Gestionar layout (single, horizontal-split, vertical-split)
 * - Proporcionar controles para dividir el lienzo
 * - Coordinar distribución espacial de contenedores
 * - Ajustarse automáticamente al mostrar/ocultar Barra Lateral
 *
 * NO hace:
 * - Gestionar contenido de las herramientas (responsabilidad del DynamicContainer)
 * - Manejar tabs (responsabilidad del DynamicContainer)
 * - Contener lógica de negocio
 *
 * Comparable a:
 * - Editor grid de VS Code
 * - Split workspace de JetBrains
 * - Paneles dinámicos de Figma/Adobe XD
 */
export default function Canvas() {
  const { containers, createContainer, adjustContainerWidths } = useWorkspaceStore();
  const { theme, toggleTheme, isDark } = useTheme();

  // CONTRATO: "Si lienzo se achica se achican proporcionalmente"
  // Observar cambios de tamaño del Canvas para redistribuir contenedores
  const resizeRef = useResizeObserver<HTMLDivElement>(() => {
    const containerCount = containers.length;

    // CONTRATO: Redistribuir anchos proporcionalmente cuando hay cambios de tamaño
    // Los contenedores SIEMPRE se adaptan al 100% del lienzo, sin anchos mínimos
    if (containerCount > 1) {
      adjustContainerWidths();
    }
  });

  // CONTRATO: "Ningún contenido del lienzo lo desborda"
  // Detectar y reportar overflow en el Canvas
  const overflowRef = useOverflowDetection<HTMLDivElement>('Canvas', {
    checkInterval: 3000, // Chequear cada 3 segundos
    logOverflow: true,
    onOverflow: (data) => {
      console.error(
        '🚨 VIOLACIÓN DE CONTRATO - Canvas tiene overflow',
        {
          overflowHorizontal: data.hasHorizontalOverflow ? `${data.overflowX}px` : 'No',
          overflowVertical: data.hasVerticalOverflow ? `${data.overflowY}px` : 'No',
          dimensiones: `${data.clientWidth}x${data.clientHeight}`,
          scroll: `${data.scrollWidth}x${data.scrollHeight}`,
        }
      );
    },
  });

  // Combinar refs (resize + overflow detection)
  const canvasRef = useCombinedRefs(resizeRef, overflowRef);

  // Máximo 3 contenedores
  const canAddContainer = containers.length < 3;

  return (
    <div
      ref={canvasRef}
      className="flex-1 flex flex-col"
      style={{
        backgroundColor: theme.colors.neutral[0],
        overflow: 'hidden', // CONTRATO: Evitar desbordamiento del Canvas
      }}
    >
      {/* Canvas Toolbar - Controles para dividir el lienzo */}
      <div
        className="flex items-center justify-between px-4"
        style={{
          height: theme.componentSizes.toolbar,
          backgroundColor: theme.colors.neutral[100],
          borderBottom: `1px solid ${theme.colors.neutral[200]}`,
        }}
      >
        <Text
          className="font-medium"
          variant="metadata"
          color="muted"
        >
          Lienzo Dinámico ({containers.length}{' '}
          {containers.length === 1 ? 'contenedor' : 'contenedores'})
        </Text>
        <div className="flex gap-2">
          <button
            onClick={createContainer}
            className="flex items-center gap-1.5 transition"
            style={{
              padding: theme.componentSpacing.button.sm,
              fontSize: theme.typography.sizes.xs,
              backgroundColor: canAddContainer ? theme.colors.primary[500] : theme.colors.neutral[300],
              border: 'none',
              borderRadius: theme.radius.md,
              color: theme.colors.neutral[0],
              transitionDuration: theme.transitions.base,
              cursor: canAddContainer ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={(e) => {
              if (canAddContainer) {
                e.currentTarget.style.backgroundColor = theme.colors.primary[600];
              }
            }}
            onMouseLeave={(e) => {
              if (canAddContainer) {
                e.currentTarget.style.backgroundColor = theme.colors.primary[500];
              }
            }}
            title={canAddContainer ? 'Nuevo contenedor (máx. 3)' : 'Máximo 3 contenedores alcanzado'}
            disabled={!canAddContainer}
          >
            <Plus size={theme.iconSizes.sm} />
            Nuevo Contenedor
          </button>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 transition"
            style={{
              padding: theme.componentSpacing.button.sm,
              fontSize: theme.typography.sizes.xs,
              backgroundColor: theme.colors.neutral[0],
              border: `1px solid ${theme.colors.neutral[300]}`,
              borderRadius: theme.radius.md,
              color: theme.colors.neutral[700],
              transitionDuration: theme.transitions.base,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.neutral[50];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.neutral[0];
            }}
            title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            {isDark ? <Sun size={theme.iconSizes.sm} /> : <Moon size={theme.iconSizes.sm} />}
            {isDark ? 'Tema Claro' : 'Tema Oscuro'}
          </button>
        </div>
      </div>

      {/* Canvas Area - Contenedores Dinámicos */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Containers */}
        <div className="flex-1 overflow-hidden">
          {containers.length === 0 ? (
            <div
              className="h-full flex items-center justify-center"
              style={{
                backgroundColor: theme.colors.neutral[50],
              }}
            >
              <div className="text-center">
                <Text
                  className="mb-2"
                  style={{
                    fontSize: theme.typography.sizes.xl,
                    color: theme.colors.neutral[500],
                  }}
                >
                  Lienzo Dinámico vacío
                </Text>
                <Text
                  variant="metadata"
                  style={{
                    color: theme.colors.neutral[400],
                  }}
                >
                  Selecciona un elemento del sidebar para comenzar
                </Text>
              </div>
            </div>
          ) : (
            // Mostrar todos los contenedores
            <div className="h-full flex">
              {containers.map((container) => (
                <DynamicContainer key={container.id} containerId={container.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
