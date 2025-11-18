import { MessageSquare, Users, Wrench, Puzzle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspace';

interface Activity {
  id: 'messages' | 'contacts' | 'tools' | 'plugins';
  icon: React.ReactNode;
  label: string;
}

const activities: Activity[] = [
  { id: 'messages', icon: <MessageSquare size={24} />, label: 'Mensajes' },
  { id: 'contacts', icon: <Users size={24} />, label: 'Contactos' },
  { id: 'tools', icon: <Wrench size={24} />, label: 'Herramientas' },
  { id: 'plugins', icon: <Puzzle size={24} />, label: 'Plugins' },
];

/**
 * ActivityBar - Barra de Actividad (Nivel 1)
 *
 * ## Definición (según documento formal)
 *
 * La Barra de Actividad es un menú vertical fijo que constituye el punto de entrada
 * principal a los distintos dominios funcionales del sistema. Cada ícono representa
 * una categoría de primer nivel, y al seleccionarse redefine por completo el contexto
 * de navegación.
 *
 * ## Características Arquitectónicas
 *
 * 1. **Ubicación fija y vertical**
 *    - Se sitúa permanentemente en el extremo izquierdo de la interfaz
 *    - Permanece visible en todo momento
 *    - Garantiza acceso persistente a los dominios principales
 *
 * 2. **Alta frecuencia de uso**
 *    - Diseño optimizado para operaciones constantes
 *    - Permite transiciones rápidas entre dominios
 *
 * 3. **Modos de visualización**
 *    - **Modo contraído**: Solo íconos visibles (ancho mínimo 64px)
 *    - **Modo expandido**: Ícono + nombre textual (ancho ~200px)
 *    - Usuario puede alternar entre modos manualmente
 *
 * 4. **Control de la Barra Lateral Contextual**
 *    - La selección determina el contenido del Nivel 2
 *    - Cada dominio presenta sus propias listas/estructuras
 *
 * 5. **Determinación de módulos del Lienzo Dinámico**
 *    - Mensajes → habilita ChatArea
 *    - Contactos → habilita ContactArea
 *    - Herramientas → habilita ToolArea
 *    - Plugins → habilita PluginRenderArea
 *
 * ## Categorías Típicas
 *
 * - Mensajes: Conversaciones y chats
 * - Contactos: Directorio de personas
 * - Herramientas: Utilidades del sistema
 * - Plugins: Extensiones modulares
 *
 * Metáfora: Como el "Activity Bar" de VS Code (Explorer, Search, Source Control)
 */
export default function ActivityBar() {
  const { activeActivity, activityBarExpanded, setActivity, toggleActivityBar } =
    useWorkspaceStore();

  return (
    <div
      className={`
        bg-gray-900 flex flex-col py-4 gap-2
        transition-all duration-300 ease-in-out
        ${activityBarExpanded ? 'w-52' : 'w-16'}
      `}
    >
      {/* Logo + Toggle Button */}
      <div className="flex items-center justify-between px-3 mb-4">
        {activityBarExpanded ? (
          <>
            <div className="text-white font-bold text-lg">FluxCore</div>
            <button
              onClick={toggleActivityBar}
              className="text-gray-400 hover:text-white transition p-1 rounded hover:bg-gray-800"
              title="Contraer barra"
              aria-label="Contraer barra de actividad"
            >
              <ChevronLeft size={18} />
            </button>
          </>
        ) : (
          <button
            onClick={toggleActivityBar}
            className="text-gray-400 hover:text-white transition p-1 rounded hover:bg-gray-800 mx-auto"
            title="Expandir barra"
            aria-label="Expandir barra de actividad"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Activities */}
      <div className="flex flex-col gap-2">
        {activities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => setActivity(activity.id)}
            className={`
              flex items-center gap-3 transition-all duration-200
              ${activityBarExpanded ? 'px-3 py-2.5 mx-2 justify-start' : 'px-3 py-3 mx-auto justify-center'}
              rounded-lg
              ${
                activeActivity === activity.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }
            `}
            title={activity.label}
            aria-label={activity.label}
          >
            {/* Ícono */}
            <div className="flex-shrink-0">{activity.icon}</div>

            {/* Label (solo en modo expandido) */}
            {activityBarExpanded && (
              <span className="text-sm font-medium whitespace-nowrap">
                {activity.label}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer (opcional - usuario, settings) */}
      {activityBarExpanded && (
        <div className="px-3 py-2 border-t border-gray-800">
          <div className="text-xs text-gray-500">v1.0.0</div>
        </div>
      )}
    </div>
  );
}
