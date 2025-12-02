/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "C:\Users\harva\Documents\Trabajos\meetgar\FluxCoreChat\inhost-frontend\src\components\workspace\DynamicContainer.tsx"
 *   type: "component"
 *   layer: "frontend"
 *   domain: "ui"
 *   purpose: "Component for dynamic container"
 *
 * DEPENDENCIES:
 *   internal: ["@/components/feedback","@/hooks/useOverflowDetection","@/store/workspace","@/theme"]
 *   external: ["lucide-react","react"]
 *   infrastructure: []
 *
 * CONTRACTS:
 *   exports: ["function"]
 *   inputs: "DynamicContainerProps, DynamicContainerProps"
 *   outputs: "JSX.Element"
 *   errors: "None"
 *
 * INTEGRATION:
 *   data_flow: "Input → Processing → Output"
 *   events_emitted: []
 *   events_consumed: []
 *
 * IMPACT:
 *   used_by: "To be determined via dependency analysis"
 *   uses: ["@/components/feedback","@/hooks/useOverflowDetection","@/store/workspace","@/theme","lucide-react","react"]
 *   critical: false
 *
 * === DOC_END :: DynamicContainer.tsx ===
 */

import { X, MessageSquare, MoreVertical, Copy } from 'lucide-react';
import { useWorkspaceStore, useContainer } from '@/store/workspace';
import { useTheme } from '@/theme';
import { lazy, Suspense, useState } from 'react';
import { ChatAreaSkeleton } from '@/components/feedback';
import { useOverflowDetection } from '@/hooks/useOverflowDetection';

// CODE SPLITTING: Lazy load de componentes pesados
const ChatArea = lazy(() => import('@components/chat/ChatArea'));
const ThemeEditorArea = lazy(() => import('@components/tools/ThemeEditorArea'));
const DatabaseDevToolsArea = lazy(() => import('@components/tools/DatabaseDevToolsArea'));
const TeamArea = lazy(() => import('@components/settings/TeamArea'));
const AccountSettingsArea = lazy(() => import('@components/settings/AccountSettingsArea'));
const IntegrationsArea = lazy(() => import('@components/settings/IntegrationsArea'));

interface DynamicContainerProps {
  containerId: string;
}

/**
 * DynamicContainer - Contenedor Dinámico Individual (Sección 6)
 *
 * ## Definición (Sección 6.1)
 *
 * El Contenedor Dinámico es la unidad mínima de trabajo del sistema y constituye
 * el entorno dentro del cual se renderizan las herramientas visuales del usuario.
 * Cada Contenedor Dinámico:
 *
 * - Contiene exactamente UNA herramienta renderizable activa a la vez
 *   (ChatArea, ContactArea, ToolArea, PluginRenderArea, etc.)
 * - Soporta múltiples tabs de herramientas (como navegador web o VS Code)
 * - Representa una ventana de trabajo autónoma con controles propios
 * - NO posee lógica de negocio propia, únicamente gestiona distribución espacial
 * - Se ajusta al ancho total cuando es el único contenedor activo
 * - Comparte espacio proporcionalmente cuando coexiste con otros contenedores
 *
 * ## Capacidades Estructurales (Sección 6.2)
 *
 * **Cierre:**
 * - El contenedor puede eliminarse sin afectar a otros contenedores existentes
 * - Si es el único contenedor, se crea uno nuevo vacío automáticamente
 * - Todas las tabs dentro del contenedor se cierran al eliminar el contenedor
 *
 * **Duplicación:**
 * - El contenedor puede replicarse, creando una copia exacta con las mismas tabs
 * - Útil para vista comparativa o trabajo paralelo
 * - La duplicación crea un nuevo contenedor adyacente con split horizontal
 *
 * **Expansión total:**
 * - El contenedor puede ocupar el 100% del Lienzo, ocultando temporalmente otros
 * - Similar a "maximizar ventana" en sistemas operativos
 * - Los demás contenedores permanecen en memoria, solo se ocultan visualmente
 * - Usuario puede colapsar para volver al modo multi-contenedor
 *
 * **Persistencia modular:**
 * - El contenedor conserva sus tabs mientras permanezca abierto
 * - NO persiste sus tabs en localStorage (se recargan del servidor)
 * - Solo persiste preferencias de layout (ancho, posición)
 *
 * ## Interfaz de Usuario (Sección 6.2)
 *
 * **Barra de pestañas (Tab Bar):**
 * - Ubicada en la parte superior del contenedor
 * - Permite navegar entre múltiples vistas lógicas (tabs)
 * - Cada tab puede cerrarse individualmente si es closable
 *
 * **Menú de opciones (top-right):**
 * - Duplicar contenedor: Crea copia exacta con mismas tabs
 * - Expandir al 100%: Ocupa todo el Lienzo ocultando otros contenedores
 * - Cerrar contenedor: Elimina el contenedor y todas sus tabs
 *
 * **Botón "+" (top-right):**
 * - Abre un nuevo espacio adyacente dentro del Lienzo
 * - Crea un nuevo contenedor vacío en split horizontal
 * - Facilita creación rápida de vistas paralelas
 *
 * ## Tipologías de Herramientas (Sección 6.4)
 *
 * **ChatArea:**
 * - Renderiza conversaciones de mensajería
 * - entityId: conversationId
 * - Permite enviar/recibir mensajes en tiempo real
 *
 * **ContactArea:**
 * - Muestra perfil detallado de contactos
 * - entityId: contactId
 * - Incluye historial, notas, tags, campos personalizados
 *
 * **ToolArea:**
 * - Renderiza herramientas del sistema (transcriptor, analizador, buscador)
 * - entityId: toolId
 * - Cada herramienta tiene su propia UI y lógica
 *
 * **PluginRenderArea:**
 * - Renderiza extensiones de terceros
 * - entityId: pluginId
 * - Permite integración de funcionalidades externas
 *
 * ## Comportamiento Espacial (relacionado con Sección 5.2)
 *
 * **Contenedor único:**
 * - Ocupa 100% del ancho disponible en el Lienzo
 * - Estado base del sistema
 *
 * **Múltiples contenedores:**
 * - Distribución proporcional (ej: 50%/50% para 2 contenedores)
 * - Ancho definido por propiedad `width` (ej: "50%", "33%")
 * - Usuario puede ajustar mediante divisores (futuro)
 *
 * ## Casos de Uso Típicos (Sección 5.3)
 *
 * - **Conversaciones paralelas:**
 *   Contenedor 1: ChatArea(Juan) | Contenedor 2: ChatArea(María)
 *
 * - **Conversación + Perfil:**
 *   Contenedor 1: ChatArea(Juan) | Contenedor 2: ContactArea(Juan)
 *
 * - **Conversación + Herramienta:**
 *   Contenedor 1: ChatArea | Contenedor 2: ToolArea(Transcriptor)
 *
 * - **Herramientas múltiples:**
 *   Contenedor 1: ToolArea(Analizador) | Contenedor 2: ToolArea(Buscador)
 *
 * ## Responsabilidades
 *
 * - Mostrar barra de tabs con todas las tabs abiertas
 * - Renderizar la herramienta de la tab activa
 * - Gestionar activación y cierre de tabs dentro de este contenedor
 * - Proveer menú de opciones (cerrar, duplicar, expandir)
 * - Proveer botón "+" para crear espacio adyacente
 * - Mostrar estado vacío cuando no hay tabs
 * - Proveer feedback visual de contenedor activo (ring azul)
 *
 * ## NO hace
 *
 * - Gestionar el layout del Lienzo (responsabilidad de Canvas)
 * - Conocer otros contenedores (están desacoplados)
 * - Manejar lógica de negocio de las herramientas
 * - Persistir datos (responsabilidad del store/backend)
 */
export default function DynamicContainer({ containerId }: DynamicContainerProps) {
  const container = useContainer(containerId);
  const {
    setActiveTab,
    closeTab,
    activeContainerId,
    setActiveContainer,
    closeContainer,
    duplicateContainer,
  } = useWorkspaceStore();
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  // CONTRATO: "Ningún contenido del lienzo lo desborda"
  // Detectar overflow en el contenedor dinámico
  const containerRef = useOverflowDetection<HTMLDivElement>(`DynamicContainer-${containerId}`, {
    checkInterval: 3000,
    logOverflow: true,
    onOverflow: (data) => {
      console.error(
        `🚨 VIOLACIÓN - DynamicContainer [${containerId}] tiene overflow`,
        {
          overflowHorizontal: data.hasHorizontalOverflow ? `${data.overflowX}px` : 'No',
          overflowVertical: data.hasVerticalOverflow ? `${data.overflowY}px` : 'No',
          dimensiones: `${data.clientWidth}x${data.clientHeight}`,
        }
      );
    },
  });

  if (!container) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{
          backgroundColor: theme.colors.neutral[50],
        }}
      >
        <p
          style={{
            color: theme.colors.neutral[500],
          }}
        >
          Container not found
        </p>
      </div>
    );
  }

  const activeTab = container.tabs.find((t) => t.id === container.activeTabId);
  const isActive = activeContainerId === containerId;

  const handleTabClick = (tabId: string) => {
    setActiveContainer(containerId);
    setActiveTab(tabId, containerId);
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeTab(tabId, containerId);
  };

  const handleCloseContainer = () => {
    closeContainer(containerId);
    setMenuOpen(false);
  };

  const handleDuplicateContainer = () => {
    duplicateContainer(containerId);
    setMenuOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col"
      onClick={() => setActiveContainer(containerId)}
      style={{
        width: container.width,
        // CONTRATO: SIN anchos mínimos - adaptarse 100% al lienzo
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        backgroundColor: theme.colors.neutral[0],
        border: `${isActive ? '2px' : '1px'} solid ${
          isActive ? theme.colors.primary[500] : theme.colors.neutral[200]
        }`,
      }}
    >
      {/* Tab Bar */}
      <div
        className="h-10 flex"
        style={{
          backgroundColor: theme.colors.neutral[100],
          borderBottom: `1px solid ${theme.colors.neutral[200]}`,
        }}
      >
        {/* Tabs */}
        <div className="flex-1 flex overflow-x-auto">
          {container.tabs.map((tab) => {
            const isActiveTab = container.activeTabId === tab.id;
            return (
              <div
                key={tab.id}
                className="flex items-center cursor-pointer transition-colors flex-1"
                style={{
                  paddingLeft: theme.spacing[4],
                  paddingRight: theme.spacing[4],
                  gap: theme.spacing[2],
                  display: 'flex',
                  borderRight: `1px solid ${theme.colors.neutral[200]}`,
                  transitionDuration: theme.transitions.fast,
                  backgroundColor: isActiveTab ? theme.colors.neutral[0] : 'transparent',
                  borderBottom: isActiveTab
                    ? `2px solid ${theme.colors.primary[500]}`
                    : 'none',
                  color: isActiveTab ? theme.colors.neutral[900] : theme.colors.neutral[600],
                }}
                onMouseEnter={(e) => {
                  if (!isActiveTab) {
                    e.currentTarget.style.backgroundColor = theme.colors.neutral[50];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActiveTab) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                onClick={() => handleTabClick(tab.id)}
              >
                <MessageSquare size={theme.iconSizes.sm} className="flex-shrink-0" />
                <span
                  className="truncate flex-1"
                  style={{
                    fontSize: theme.typography.sizes.sm,
                  }}
                >
                  {tab.label}
                </span>
                {tab.closable && (
                  <button
                    className="ml-1 p-0.5 flex-shrink-0 transition"
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    style={{
                      borderRadius: theme.radius.sm,
                      transitionDuration: theme.transitions.base,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.neutral[200];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Cerrar"
                  >
                    <X size={theme.iconSizes.sm} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Container Controls */}
        <div
          className="flex items-center"
          style={{
            gap: theme.spacing[1],
            paddingLeft: theme.spacing[2],
            paddingRight: theme.spacing[2],
            borderLeft: `1px solid ${theme.colors.neutral[200]}`,
          }}
        >
          {/* Container Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="transition"
              style={{
                padding: theme.spacing[1.5],
                borderRadius: theme.radius.sm,
                transitionDuration: theme.transitions.base,
                color: theme.colors.neutral[700],
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.neutral[200];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Opciones del contenedor"
            >
              <MoreVertical size={theme.iconSizes.base} />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <>
                {/* Backdrop to close menu */}
                <div
                  className="fixed inset-0"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    zIndex: theme.zIndex.dropdown,
                  }}
                />

                {/* Menu */}
                <div
                  className="absolute right-0 mt-1 w-48"
                  style={{
                    backgroundColor: theme.colors.neutral[0],
                    border: `1px solid ${theme.colors.neutral[200]}`,
                    borderRadius: theme.radius.lg,
                    boxShadow: theme.elevation.lg,
                    zIndex: Number(theme.zIndex.dropdown) + 10,
                  }}
                >
                  <button
                    onClick={handleDuplicateContainer}
                    className="w-full text-left flex items-center transition"
                    style={{
                      paddingLeft: theme.spacing[4],
                      paddingRight: theme.spacing[4],
                      paddingTop: theme.spacing[2],
                      paddingBottom: theme.spacing[2],
                      gap: theme.spacing[2],
                      fontSize: theme.typography.sizes.sm,
                      color: theme.colors.neutral[900],
                      borderBottom: `1px solid ${theme.colors.neutral[100]}`,
                      transitionDuration: theme.transitions.base,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.neutral[50];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Copy size={theme.iconSizes.sm} />
                    Duplicar contenedor
                  </button>
                  <button
                    onClick={handleCloseContainer}
                    className="w-full text-left flex items-center transition"
                    style={{
                      paddingLeft: theme.spacing[4],
                      paddingRight: theme.spacing[4],
                      paddingTop: theme.spacing[2],
                      paddingBottom: theme.spacing[2],
                      gap: theme.spacing[2],
                      fontSize: theme.typography.sizes.sm,
                      color: theme.colors.semantic.danger,
                      transitionDuration: theme.transitions.base,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.semantic.dangerLight;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <X size={theme.iconSizes.sm} />
                    Cerrar contenedor
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content - Herramienta Activa */}
      <div className="flex-1 overflow-hidden">
        {activeTab ? (
          <>
            {activeTab.type === 'conversation' && (
              <Suspense fallback={<ChatAreaSkeleton />}>
                <ChatArea conversationId={activeTab.entityId} />
              </Suspense>
            )}
            {activeTab.type === 'theme_editor' && (
              <Suspense fallback={<ChatAreaSkeleton />}>
                <ThemeEditorArea themeId={activeTab.entityId} />
              </Suspense>
            )}
            {activeTab.type === 'database_dev_tools' && (
              <Suspense fallback={<ChatAreaSkeleton />}>
                <DatabaseDevToolsArea toolId={activeTab.entityId} />
              </Suspense>
            )}
            {activeTab.type === 'analytics' && (
              <div
                className="h-full flex items-center justify-center"
                style={{
                  color: theme.colors.neutral[500],
                }}
              >
                <p>Analytics View - Coming Soon</p>
              </div>
            )}
            {activeTab.type === 'customer_profile' && (
              <div
                className="h-full flex items-center justify-center"
                style={{
                  color: theme.colors.neutral[500],
                }}
              >
                <p>Customer Profile - Coming Soon</p>
              </div>
            )}
            {activeTab.type === 'team' && (
              <Suspense fallback={<ChatAreaSkeleton />}>
                <TeamArea settingId={activeTab.entityId} />
              </Suspense>
            )}
            {activeTab.type === 'account_settings' && (
              <Suspense fallback={<ChatAreaSkeleton />}>
                <AccountSettingsArea settingId={activeTab.entityId} />
              </Suspense>
            )}
            {activeTab.type === 'integrations' && (
              <Suspense fallback={<ChatAreaSkeleton />}>
                <IntegrationsArea settingId={activeTab.entityId} />
              </Suspense>
            )}
            {activeTab.type === 'order' && (
              <div
                className="h-full flex items-center justify-center"
                style={{
                  color: theme.colors.neutral[500],
                }}
              >
                <p>Order Details - Coming Soon</p>
              </div>
            )}
          </>
        ) : (
          <div
            className="h-full flex items-center justify-center"
            style={{
              backgroundColor: theme.colors.neutral[50],
            }}
          >
            <div className="text-center">
              <MessageSquare
                size={64}
                className="mx-auto mb-4"
                style={{
                  color: theme.colors.neutral[300],
                }}
              />
              <p
                className="mb-2"
                style={{
                  fontSize: theme.typography.sizes.xl,
                  color: theme.colors.neutral[500],
                }}
              >
                No hay tabs abiertas en este contenedor
              </p>
              <p
                style={{
                  fontSize: theme.typography.sizes.sm,
                  color: theme.colors.neutral[400],
                }}
              >
                Selecciona un elemento del sidebar para abrir aquí
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
