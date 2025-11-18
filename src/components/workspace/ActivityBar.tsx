import { MessageSquare, Users, Wrench, Puzzle } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspace';
import { useTheme } from '@/theme';
import { IconButton, Text } from '@/components/ui';

interface Activity {
  id: 'messages' | 'contacts' | 'tools' | 'plugins';
  icon: React.ReactNode;
  label: string;
}

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
 * ## Aplicación del Tema (Sección 8.5.1)
 *
 * - Iconografía unificada a partir del color `primary-500`
 * - Hover operado por tokens semánticos (`neutral-100`)
 * - Accesibilidad garantizada mediante contraste automatizado
 * - Ningún color definido localmente, todo proviene del tema
 *
 * Metáfora: Como el "Activity Bar" de VS Code (Explorer, Search, Source Control)
 */
export default function ActivityBar() {
  const { activeActivity, setActivity } = useWorkspaceStore();
  const { theme } = useTheme();

  // Create activities array with theme-based icon sizes
  const activities: Activity[] = [
    { id: 'messages', icon: <MessageSquare size={theme.iconSizes.xl} />, label: 'Mensajes' },
    { id: 'contacts', icon: <Users size={theme.iconSizes.xl} />, label: 'Contactos' },
    { id: 'tools', icon: <Wrench size={theme.iconSizes.xl} />, label: 'Herramientas' },
    { id: 'plugins', icon: <Puzzle size={theme.iconSizes.xl} />, label: 'Plugins' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        paddingTop: theme.spacing[4],
        paddingBottom: theme.spacing[4],
        gap: theme.spacing[2],
        width: theme.componentSizes.sidebar.activityBar,
        backgroundColor: theme.colors.neutral[900],
      }}
    >
      {/* Logo */}
      <Text
        as="div"
        variant="normal"
        style={{
          marginBottom: theme.spacing[4],
          fontWeight: theme.typography.weights.bold,
          fontSize: theme.typography.sizes.xl,
          textAlign: 'center',
          color: theme.colors.neutral[0],
        }}
      >
        FC
      </Text>

      {/* Activities */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing[2],
        }}
      >
        {activities.map((activity) => {
          const isActive = activeActivity === activity.id;

          return (
            <button
              key={activity.id}
              onClick={() => setActivity(activity.id)}
              title={activity.label}
              aria-label={activity.label}
              aria-current={isActive ? 'page' : undefined}
              style={{
                width: theme.accessibility.touchTarget.recommended,
                height: theme.accessibility.touchTarget.recommended,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: `0 auto`,
                backgroundColor: isActive ? theme.colors.primary[500] : 'transparent',
                color: isActive ? theme.colors.neutral[0] : theme.colors.neutral[400],
                border: 'none',
                borderRadius: theme.radius.lg,
                cursor: 'pointer',
                transition: `all ${theme.transitions.base} ease`,
                boxShadow: isActive ? theme.elevation.base : 'none',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = theme.colors.neutral[800];
                  e.currentTarget.style.color = theme.colors.neutral[0];
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.colors.neutral[400];
                }
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = `${theme.accessibility.focusRing.width} ${theme.accessibility.focusRing.style} ${theme.accessibility.focusRing.color.light}`;
                e.currentTarget.style.outlineOffset = theme.accessibility.focusRing.offset;
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none';
              }}
            >
              {activity.icon}
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Version Footer */}
      <Text
        as="div"
        variant="metadata"
        color="muted"
        style={{
          textAlign: 'center',
          fontSize: theme.typography.sizes.xs,
        }}
      >
        v1.0
      </Text>
    </div>
  );
}
