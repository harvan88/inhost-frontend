import { MessageSquare, Users, Wrench, Puzzle } from 'lucide-react';
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
 * ## Definición (según documento formal - Sección 3)
 *
 * La Barra de Actividad es un menú vertical fijo que constituye el punto de entrada
 * principal a los distintos dominios funcionales del sistema. Cada ícono representa
 * una categoría de primer nivel, y al seleccionarse redefine por completo el contexto
 * de navegación, mostrando u ocultando la Barra Lateral Contextual correspondiente.
 *
 * ## Comportamiento Arquitectónico (Sección 4.2)
 *
 * 1. **La Barra de Actividad NO se expande**
 *    - Ancho fijo de 64px
 *    - Solo muestra íconos
 *    - Descripción del dominio aparece en *hover tooltip*
 *
 * 2. **Toggle Contextual**
 *    - Click en dominio → Muestra Barra Lateral Contextual
 *    - Click en dominio activo → Oculta Barra Lateral Contextual
 *    - Esto maximiza espacio para el Lienzo Dinámico
 *
 * 3. **Control de la Barra Lateral Contextual**
 *    - La selección determina el contenido del Nivel 2
 *    - Cada dominio presenta sus propias listas/estructuras
 *    - Sidebar aparece/desaparece según interacción del usuario
 *
 * ## Características Arquitectónicas
 *
 * 1. **Ubicación fija y vertical**
 *    - Se sitúa permanentemente en el extremo izquierdo
 *    - Permanece visible en todo momento
 *    - Ancho fijo: 64px
 *
 * 2. **Alta frecuencia de uso**
 *    - Diseño optimizado para operaciones constantes
 *    - Transiciones rápidas entre dominios
 *
 * 3. **Label hover interaction**
 *    - Descripción completa solo en hover (tooltip)
 *    - Reduce consumo visual permanente
 *    - Preserva espacio del Lienzo
 *
 * 4. **Determinación de módulos del Lienzo Dinámico**
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
  const { activeActivity, setActivity } = useWorkspaceStore();

  return (
    <div className="w-16 bg-gray-900 flex flex-col py-4 gap-2">
      {/* Logo */}
      <div className="mb-4 text-white font-bold text-xl text-center">
        FC
      </div>

      {/* Activities */}
      <div className="flex flex-col gap-2">
        {activities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => setActivity(activity.id)}
            className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              transition-all duration-200 mx-auto
              ${
                activeActivity === activity.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }
            `}
            title={activity.label}
            aria-label={activity.label}
          >
            {activity.icon}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Version Footer */}
      <div className="text-center">
        <div className="text-xs text-gray-600">v1.0</div>
      </div>
    </div>
  );
}
