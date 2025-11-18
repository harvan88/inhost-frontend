import { Search } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspace';
import { useStore } from '@/store';
import { useTheme } from '@/theme';
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
  const { theme } = useTheme();

  if (!sidebarVisible) return null;

  return (
    <div
      className="overflow-auto flex flex-col flex-shrink-0"
      style={{
        width: `${sidebarWidth}px`,
        backgroundColor: theme.colors.neutral[50],
        borderRight: `1px solid ${theme.colors.neutral[200]}`,
      }}
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
  const { theme } = useTheme();
  const conversationArray = Array.from(conversations.values()).sort((a, b) => {
    // Pinned first, then by updatedAt
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        style={{
          padding: theme.spacing[4],
          borderBottom: `1px solid ${theme.colors.neutral[200]}`,
        }}
      >
        <h2
          style={{
            fontSize: theme.typography.sizes.lg,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing[3],
          }}
        >
          Conversaciones
        </h2>

        {/* Search */}
        <div className="relative">
          <Search
            size={theme.iconSizes?.md || 18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{
              color: theme.colors.neutral[400],
            }}
          />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            className="w-full pl-10 pr-4 py-2 focus:outline-none"
            style={{
              border: `1px solid ${theme.colors.neutral[300]}`,
              borderRadius: theme.radius.lg,
              fontSize: theme.typography.sizes.sm,
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = 'none';
              e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary[500]}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversationArray.length === 0 ? (
          <div
            className="text-center"
            style={{
              padding: theme.spacing[8],
              color: theme.colors.neutral[500],
            }}
          >
            <p>No hay conversaciones</p>
          </div>
        ) : (
          conversationArray.map((conversation) => (
            <ConversationListItem key={conversation.id} conversation={conversation} />
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div
        style={{
          padding: theme.spacing[3],
          borderTop: `1px solid ${theme.colors.neutral[200]}`,
          backgroundColor: theme.colors.neutral[0],
        }}
      >
        <p
          style={{
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.neutral[500],
          }}
        >
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
  const { theme } = useTheme();
  return (
    <div
      style={{
        padding: theme.spacing[4],
      }}
    >
      <h2
        style={{
          fontSize: theme.typography.sizes.lg,
          fontWeight: theme.typography.weights.semibold,
          color: theme.colors.neutral[900],
          marginBottom: theme.spacing[3],
        }}
      >
        Contactos
      </h2>
      <p
        style={{
          fontSize: theme.typography.sizes.sm,
          color: theme.colors.neutral[500],
        }}
      >
        Directorio de contactos - Coming Soon
      </p>
    </div>
  );
}

function ToolsView() {
  const { theme } = useTheme();
  const { openTab, activeContainerId } = useWorkspaceStore();

  const tools = [
    {
      id: 'theme-editor',
      name: 'Theme Editor',
      description: 'Editor visual de temas en tiempo real',
      icon: '🎨',
      category: 'Diseño',
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'Análisis y métricas del sistema',
      icon: '📊',
      category: 'Datos',
    },
    {
      id: 'transcriptor',
      name: 'Transcriptor',
      description: 'Transcripción de audio a texto',
      icon: '🎙️',
      category: 'IA',
    },
  ];

  const handleOpenTool = (toolId: string, toolName: string) => {
    openTab(
      {
        id: `${toolId}-${Date.now()}`,
        type: toolId === 'theme-editor' ? 'theme_editor' : 'analytics',
        label: toolName,
        entityId: toolId,
        icon: tools.find((t) => t.id === toolId)?.icon,
        closable: true,
      },
      activeContainerId || undefined
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        style={{
          padding: theme.spacing[4],
          borderBottom: `1px solid ${theme.colors.neutral[200]}`,
        }}
      >
        <h2
          style={{
            fontSize: theme.typography.sizes.lg,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing[1],
          }}
        >
          Herramientas
        </h2>
        <p
          style={{
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.neutral[600],
          }}
        >
          Sistema de herramientas y plugins
        </p>
      </div>

      {/* Tools List */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          padding: theme.spacing[2],
        }}
      >
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleOpenTool(tool.id, tool.name)}
            className="w-full text-left transition"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: theme.spacing[3],
              padding: theme.spacing[3],
              marginBottom: theme.spacing[2],
              backgroundColor: theme.colors.neutral[0],
              border: `1px solid ${theme.colors.neutral[200]}`,
              borderRadius: theme.radius.lg,
              cursor: 'pointer',
              transitionDuration: theme.transitions.base,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary[50];
              e.currentTarget.style.borderColor = theme.colors.primary[300];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.neutral[0];
              e.currentTarget.style.borderColor = theme.colors.neutral[200];
            }}
          >
            <div
              style={{
                fontSize: theme.typography.sizes['2xl'],
              }}
            >
              {tool.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontWeight: theme.typography.weights.semibold,
                  color: theme.colors.neutral[900],
                  marginBottom: theme.spacing[1],
                }}
              >
                {tool.name}
              </div>
              <div
                style={{
                  fontSize: theme.typography.sizes.sm,
                  color: theme.colors.neutral[600],
                  marginBottom: theme.spacing[1],
                }}
              >
                {tool.description}
              </div>
              <div
                style={{
                  display: 'inline-block',
                  padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                  backgroundColor: theme.colors.neutral[100],
                  borderRadius: theme.radius.sm,
                  fontSize: theme.typography.sizes.xs,
                  color: theme.colors.neutral[700],
                  fontWeight: theme.typography.weights.medium,
                }}
              >
                {tool.category}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: theme.spacing[3],
          borderTop: `1px solid ${theme.colors.neutral[200]}`,
          backgroundColor: theme.colors.neutral[0],
        }}
      >
        <p
          style={{
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.neutral[500],
          }}
        >
          {tools.length} herramientas disponibles
        </p>
      </div>
    </div>
  );
}

function PluginsView() {
  const { theme } = useTheme();
  return (
    <div
      style={{
        padding: theme.spacing[4],
      }}
    >
      <h2
        style={{
          fontSize: theme.typography.sizes.lg,
          fontWeight: theme.typography.weights.semibold,
          color: theme.colors.neutral[900],
          marginBottom: theme.spacing[3],
        }}
      >
        Plugins
      </h2>
      <p
        style={{
          fontSize: theme.typography.sizes.sm,
          color: theme.colors.neutral[500],
        }}
      >
        Extensiones y plugins instalados - Coming Soon
      </p>
    </div>
  );
}
