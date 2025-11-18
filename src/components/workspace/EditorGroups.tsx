import { X, MessageSquare } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspace';
import ChatArea from '@components/chat/ChatArea';

/**
 * EditorGroups - Contenedor Dinámico (Nivel 3)
 *
 * Rol en la arquitectura de tres niveles:
 * - Es el núcleo funcional del sistema
 * - Área flexible que se abre/cierra según necesidad
 * - Puede contener múltiples vistas en formato tabs (workspace multi-tab)
 * - NO tiene lógica propia, solo alberga vistas
 *
 * Vistas que puede contener:
 * - ChatArea: Vista de conversación
 * - ContactArea: Perfil de contacto (Coming Soon)
 * - ToolArea: Herramientas/Plugins (Coming Soon)
 * - Analytics: Dashboard de métricas (Coming Soon)
 * - Order: Detalles de pedidos (Coming Soon)
 *
 * Metáfora: Como las tabs de VS Code - múltiples documentos abiertos simultáneamente
 */
export default function EditorGroups() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useWorkspaceStore();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Tab Bar */}
      {tabs.length > 0 && (
        <div className="h-10 bg-gray-100 border-b border-gray-200 flex overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`
                px-4 flex items-center gap-2 border-r border-gray-200 cursor-pointer
                min-w-[150px] max-w-[200px]
                transition-colors duration-150
                ${
                  activeTabId === tab.id
                    ? 'bg-white border-b-2 border-b-blue-500 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }
              `}
              onClick={() => setActiveTab(tab.id)}
            >
              <MessageSquare size={14} className="flex-shrink-0" />
              <span className="text-sm truncate flex-1">{tab.label}</span>
              {tab.closable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
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

      {/* Tab Content */}
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
                No hay conversación abierta
              </p>
              <p className="text-sm text-gray-400">
                Selecciona una conversación del sidebar para comenzar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
