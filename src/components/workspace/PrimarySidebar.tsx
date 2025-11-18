import { Search } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspace';
import { useStore } from '@/store';
import ConversationListItem from './ConversationListItem';

/**
 * PrimarySidebar - Barra Lateral Contextual (Nivel 2)
 *
 * ## Definición (según documento formal - Sección 4)
 *
 * La Barra Lateral Contextual constituye la segunda columna de la interfaz y actúa
 * como un panel dependiente del dominio seleccionado en la Barra de Actividad.
 * Su función principal es presentar listas, árboles o colecciones de elementos
 * navegables que permiten al usuario elegir qué instancia será representada dentro
 * del Lienzo Dinámico.
 *
 * ## Comportamiento Arquitectónico (Sección 4.2)
 *
 * 1. **NO es persistente**
 *    - Su visibilidad depende del dominio seleccionado
 *    - Puede aparecer/desaparecer según interacción del usuario
 *
 * 2. **Aparece solo al seleccionar un dominio**
 *    - Click en ícono → Despliega sidebar con elementos relevantes
 *    - Sin dominio activo → Sidebar oculta
 *
 * 3. **Toggle Contextual**
 *    - Click en dominio activo → Oculta/muestra sidebar
 *    - Maximiza espacio para el Lienzo cuando es necesario
 *    - El dominio permanece activo aunque la sidebar esté oculta
 *
 * ## Ejemplos por Dominio (Sección 4.3)
 *
 * | Dominio         | Contenido en Sidebar           |
 * |-----------------|--------------------------------|
 * | Mensajes        | Lista de conversaciones        |
 * | Contactos       | Lista de contactos             |
 * | Herramientas    | Catálogo de herramientas       |
 * | Plugins         | Plugins instalados             |
 *
 * ## Responsabilidades (Sección 4.4)
 *
 * 1. **Mostrar colecciones navegables** asociadas al dominio activo
 * 2. **Permitir seleccionar un elemento** para renderizar en el Lienzo Dinámico
 * 3. **Ofrecer capacidades complementarias**:
 *    - Filtros contextuales
 *    - Metadatos (conteos, estados, indicadores)
 *    - Acciones rápidas (crear, añadir, instalar)
 *
 * ## Flujo Operativo (Sección 4.5)
 *
 * Flujo A: Apertura del dominio
 *   1. Usuario hace click en ícono "Mensajes"
 *   2. Sidebar se despliega con lista de conversaciones
 *   3. Lienzo permanece vacío hasta selección
 *
 * Flujo B: Selección de elemento
 *   1. Usuario selecciona conversación "Juan Pérez"
 *   2. Sistema crea/reutiliza Contenedor Dinámico
 *   3. Lienzo renderiza ChatArea(Juan Pérez)
 *
 * Flujo C: Minimización contextual
 *   1. Usuario vuelve a hacer click en ícono activo
 *   2. Sidebar se oculta
 *   3. Lienzo recupera espacio completo
 *   4. Dominio permanece activo, contenido intacto
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
      {activeActivity === 'contacts' && <ContactsView />}
      {activeActivity === 'tools' && <ToolsView />}
      {activeActivity === 'plugins' && <PluginsView />}
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
function ContactsView() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Contactos</h2>
      <p className="text-sm text-gray-500">Directorio de contactos - Coming Soon</p>
    </div>
  );
}

function ToolsView() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Herramientas</h2>
      <p className="text-sm text-gray-500">Lista de herramientas del sistema - Coming Soon</p>
    </div>
  );
}

function PluginsView() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Plugins</h2>
      <p className="text-sm text-gray-500">Extensiones y plugins instalados - Coming Soon</p>
    </div>
  );
}
