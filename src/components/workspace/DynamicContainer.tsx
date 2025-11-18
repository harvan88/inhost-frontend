import { X, MessageSquare } from 'lucide-react';
import { useWorkspaceStore, useContainer } from '@/store/workspace';
import ChatArea from '@components/chat/ChatArea';

interface DynamicContainerProps {
  containerId: string;
}

/**
 * DynamicContainer - Contenedor Dinámico Individual
 *
 * ## Definición
 *
 * Un Contenedor Dinámico es un marco (frame) autónomo que existe dentro del Lienzo Dinámico.
 * Cada contenedor:
 *
 * - Contiene exactamente UNA herramienta renderizable activa a la vez
 *   (ChatArea, ContactArea, ToolArea, PluginRenderArea, etc.)
 * - Soporta múltiples tabs de herramientas (como navegador web o VS Code)
 * - NO posee lógica de negocio propia, únicamente gestiona distribución espacial
 * - Se ajusta al ancho total cuando es el único contenedor activo
 * - Comparte espacio proporcionalmente cuando coexiste con otros contenedores
 * - Es redimensionable manualmente mediante "drag-based resizing"
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
 * - Usuario puede ajustar mediante divisores
 *
 * ## Propiedades Estructurales
 *
 * - **Unidades replicables:** Pueden instanciarse varias veces dentro del Lienzo
 * - **Independencia jerárquica:** Cada contenedor es autónomo
 * - **Multi-tab support:** Múltiples herramientas abiertas en tabs
 * - **Visual feedback:** Ring azul cuando está activo
 *
 * ## Casos de Uso (Sección 5.3)
 *
 * Ejemplos de escenarios multivista:
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
 * - Mostrar barra de tabs si hay múltiples tabs abiertas
 * - Renderizar la herramienta de la tab activa
 * - Gestionar activación y cierre de tabs dentro de este contenedor
 * - Mostrar estado vacío cuando no hay tabs
 * - Proveer feedback visual de contenedor activo
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
  const { setActiveTab, closeTab, activeContainerId, setActiveContainer } = useWorkspaceStore();

  if (!container) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Container not found</p>
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

  return (
    <div
      className={`flex-1 flex flex-col bg-white ${
        isActive ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'
      }`}
      onClick={() => setActiveContainer(containerId)}
      style={{ width: container.width }}
    >
      {/* Tab Bar */}
      {container.tabs.length > 0 && (
        <div className="h-10 bg-gray-100 border-b border-gray-200 flex overflow-x-auto">
          {container.tabs.map((tab) => (
            <div
              key={tab.id}
              className={`
                px-4 flex items-center gap-2 border-r border-gray-200 cursor-pointer
                min-w-[150px] max-w-[200px]
                transition-colors duration-150
                ${
                  container.activeTabId === tab.id
                    ? 'bg-white border-b-2 border-b-blue-500 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }
              `}
              onClick={() => handleTabClick(tab.id)}
            >
              <MessageSquare size={14} className="flex-shrink-0" />
              <span className="text-sm truncate flex-1">{tab.label}</span>
              {tab.closable && (
                <button
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className="ml-1 hover:bg-gray-200 rounded p-0.5 flex-shrink-0"
                  title="Cerrar"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab Content - Herramienta Activa */}
      <div className="flex-1 overflow-hidden">
        {activeTab ? (
          <>
            {activeTab.type === 'conversation' && (
              <ChatArea conversationId={activeTab.entityId} />
            )}
            {activeTab.type === 'analytics' && (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Analytics View - Coming Soon</p>
              </div>
            )}
            {activeTab.type === 'customer_profile' && (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Customer Profile - Coming Soon</p>
              </div>
            )}
            {activeTab.type === 'order' && (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Order Details - Coming Soon</p>
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-xl text-gray-500 mb-2">
                No hay tabs abiertas en este contenedor
              </p>
              <p className="text-sm text-gray-400">
                Selecciona un elemento del sidebar para abrir aquí
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
