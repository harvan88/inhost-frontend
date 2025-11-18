import { MessageSquare, BarChart3, Users, Settings } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspace';

interface Activity {
  id: 'messages' | 'analytics' | 'contacts' | 'settings';
  icon: React.ReactNode;
  label: string;
}

const activities: Activity[] = [
  { id: 'messages', icon: <MessageSquare size={24} />, label: 'Mensajes' },
  { id: 'analytics', icon: <BarChart3 size={24} />, label: 'Analytics' },
  { id: 'contacts', icon: <Users size={24} />, label: 'Contactos' },
  { id: 'settings', icon: <Settings size={24} />, label: 'Configuración' },
];

/**
 * ActivityBar - Nivel 1: Selección de Dominio
 *
 * Rol en la arquitectura de tres niveles:
 * - Primer nivel de navegación (barra lateral izquierda)
 * - Selecciona QUÉ TIPO de entidad se va a trabajar
 * - NO muestra contenido, solo controla qué lista mostrar
 * - Controla el contenido del Sidebar Contextual (Nivel 2)
 *
 * Dominios disponibles:
 * - Mensajes: Conversaciones y chats
 * - Analytics: Métricas y reportes
 * - Contactos: Directorio de personas
 * - Settings: Configuración de la app
 *
 * Metáfora: Como el "Activity Bar" de VS Code (Explorer, Search, Source Control)
 */
export default function ActivityBar() {
  const { activeActivity, setActivity } = useWorkspaceStore();

  return (
    <div className="w-16 bg-gray-900 flex flex-col items-center py-4 gap-2">
      {/* Logo */}
      <div className="mb-4 text-white font-bold text-xl">
        IH
      </div>

      {/* Activities */}
      {activities.map((activity) => (
        <button
          key={activity.id}
          onClick={() => setActivity(activity.id)}
          className={`
            w-12 h-12 rounded-lg flex items-center justify-center
            transition-all duration-200
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
  );
}
