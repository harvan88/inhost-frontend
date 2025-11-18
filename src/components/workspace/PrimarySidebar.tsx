import { Search } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspace';
import { useStore } from '@/store';
import ConversationListItem from './ConversationListItem';

/**
 * PrimarySidebar - Nivel 2: Sidebar Contextual
 *
 * Rol en la arquitectura de tres niveles:
 * - Segundo nivel de navegación
 * - Muestra LISTA DE ENTIDADES del dominio seleccionado
 * - Su contenido depende 100% del Activity Bar (Nivel 1)
 * - Permite seleccionar QUÉ ELEMENTO específico abrir
 *
 * Contenido según dominio:
 * - messages → Lista de conversaciones
 * - analytics → Dashboard de métricas (Coming Soon)
 * - contacts → Directorio de contactos (Coming Soon)
 * - settings → Configuración de la app (Coming Soon)
 *
 * Cuando el usuario selecciona un elemento aquí,
 * se abre su vista correspondiente en el Contenedor Dinámico (Nivel 3)
 *
 * Metáfora: Como el "Explorer" de VS Code cuando seleccionas el ícono de archivos
 */
export default function PrimarySidebar() {
  const { activeActivity, sidebarVisible, sidebarWidth } = useWorkspaceStore();

  if (!sidebarVisible) return null;

  return (
    <div
      className="bg-gray-50 border-r border-gray-200 overflow-auto flex flex-col"
      style={{ width: `${sidebarWidth}px` }}
    >
      {activeActivity === 'messages' && <ConversationListView />}
      {activeActivity === 'analytics' && <AnalyticsView />}
      {activeActivity === 'contacts' && <ContactsView />}
      {activeActivity === 'settings' && <SettingsView />}
    </div>
  );
}

/**
 * ConversationListView - Lista de todas las conversaciones
 */
function ConversationListView() {
  const conversations = useStore((state) => state.entities.conversations);
  const conversationArray = Array.from(conversations.values()).sort((a, b) => {
    // Pinned first, then by updatedAt
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Conversaciones</h2>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversationArray.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No hay conversaciones</p>
          </div>
        ) : (
          conversationArray.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
            />
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <p className="text-xs text-gray-500">
          Total: {conversationArray.length} conversaciones
        </p>
      </div>
    </div>
  );
}

/**
 * Placeholder views for other activities
 */
function AnalyticsView() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Analytics</h2>
      <p className="text-sm text-gray-500">Dashboard de métricas - Coming Soon</p>
    </div>
  );
}

function ContactsView() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Contactos</h2>
      <p className="text-sm text-gray-500">Directorio de contactos - Coming Soon</p>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Configuración</h2>
      <p className="text-sm text-gray-500">Ajustes de la aplicación - Coming Soon</p>
    </div>
  );
}
