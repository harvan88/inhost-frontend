import { X, MessageSquare, MoreVertical, Copy, Maximize2, Plus } from 'lucide-react';
import { useWorkspaceStore, useContainer } from '@/store/workspace';
import { useTheme } from '@/theme';
import ChatArea from '@components/chat/ChatArea';
import { useState } from 'react';

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
    expandContainer,
    splitCanvas,
  } = useWorkspaceStore();
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handleExpandContainer = () => {
    expandContainer(containerId);
    setMenuOpen(false);
  };

  const handleAddAdjacentSpace = () => {
    splitCanvas('horizontal');
  };

  return (
    <div
      className="flex-1 flex flex-col"
      onClick={() => setActiveContainer(containerId)}
      style={{
        width: container.width,
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
                className="px-4 flex items-center gap-2 cursor-pointer min-w-[150px] max-w-[200px] transition-colors"
                style={{
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
                <MessageSquare size={14} className="flex-shrink-0" />
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
                    <X size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Container Controls */}
        <div
          className="flex items-center gap-1 px-2"
          style={{
            borderLeft: `1px solid ${theme.colors.neutral[200]}`,
          }}
        >
          {/* + Button - Abrir espacio adyacente */}
          <button
            onClick={handleAddAdjacentSpace}
            className="p-1.5 transition"
            style={{
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
            title="Abrir espacio adyacente"
          >
            <Plus size={16} />
          </button>

          {/* Container Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 transition"
              style={{
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
              <MoreVertical size={16} />
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
                    className="w-full px-4 py-2 text-left flex items-center gap-2 transition"
                    style={{
                      fontSize: theme.typography.sizes.sm,
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
                    <Copy size={14} />
                    Duplicar contenedor
                  </button>
                  <button
                    onClick={handleExpandContainer}
                    className="w-full px-4 py-2 text-left flex items-center gap-2 transition"
                    style={{
                      fontSize: theme.typography.sizes.sm,
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
                    <Maximize2 size={14} />
                    Expandir al 100%
                  </button>
                  <button
                    onClick={handleCloseContainer}
                    className="w-full px-4 py-2 text-left flex items-center gap-2 transition"
                    style={{
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
                    <X size={14} />
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
              <ChatArea conversationId={activeTab.entityId} />
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
