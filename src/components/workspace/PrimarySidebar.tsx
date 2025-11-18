import { Search } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspace';
import { useStore } from '@/store';
import { useTheme } from '@/theme';
import { Heading, Text, Input, ListCard, Tag } from '@/components/ui';
import { createTab, isTabActive } from '@/utils/tabHelpers';
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
        <Heading level={2}>
          Conversaciones
        </Heading>

        {/* Search */}
        <Input
          type="text"
          placeholder="Buscar conversaciones..."
          leftIcon={<Search size={theme.iconSizes?.md || 18} />}
        />
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversationArray.length === 0 ? (
          <div
            className="text-center"
            style={{
              padding: theme.spacing[8],
            }}
          >
            <Text color="muted">No hay conversaciones</Text>
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
        <Text variant="metadata" color="muted">
          Total: {conversationArray.length} conversaciones
        </Text>
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
      <Heading level={2}>
        Contactos
      </Heading>
      <Text variant="metadata" color="muted">
        Directorio de contactos - Coming Soon
      </Text>
    </div>
  );
}

function ToolsView() {
  const { theme } = useTheme();
  const { openTab, activeContainerId, containers } = useWorkspaceStore();

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
    {
      id: 'database-dev-tools',
      name: 'Database Dev Tools',
      description: 'Gestión de datos de desarrollo (IndexedDB)',
      icon: '🗄️',
      category: 'Desarrollo',
    },
  ];

  const handleOpenTool = (toolId: string, toolName: string) => {
    // Map toolId to tab type
    let toolType: 'theme_editor' | 'analytics' | 'database_dev_tools' = 'analytics';
    if (toolId === 'theme-editor') {
      toolType = 'theme_editor';
    } else if (toolId === 'database-dev-tools') {
      toolType = 'database_dev_tools';
    }

    openTab(
      createTab({
        type: toolType,
        entityId: toolId,
        label: toolName,
        icon: tools.find((t) => t.id === toolId)?.icon,
        closable: true,
      }),
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
        <Heading level={2} noMargin>
          Herramientas
        </Heading>
        <Text variant="metadata" color="muted">
          Sistema de herramientas y plugins
        </Text>
      </div>

      {/* Tools List */}
      <div className="flex-1 overflow-y-auto">
        {tools.map((tool) => {
          // Verificar si la herramienta está activa (usando fuente de verdad)
          const activeContainer = containers.find((c) => c.id === activeContainerId);
          let toolType: 'theme_editor' | 'analytics' | 'database_dev_tools' = 'analytics';
          if (tool.id === 'theme-editor') {
            toolType = 'theme_editor';
          } else if (tool.id === 'database-dev-tools') {
            toolType = 'database_dev_tools';
          }
          const isActive = isTabActive(activeContainer?.activeTabId ?? null, toolType as any, tool.id);

          return (
            <ListCard
              key={tool.id}
              isActive={isActive}
              onClick={() => handleOpenTool(tool.id, tool.name)}
            >
            <div
              className="w-full"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: theme.spacing[3],
              }}
            >
              <div
                style={{
                  fontSize: theme.typography.sizes['2xl'],
                  lineHeight: '1',
                }}
              >
                {tool.icon}
              </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: theme.spacing[1] }}>
                <Text variant="label">
                  {tool.name}
                </Text>
              </div>
              <div style={{ marginBottom: theme.spacing[2] }}>
                <Text variant="metadata" color="muted">
                  {tool.description}
                </Text>
              </div>
              <Tag size="small">{tool.category}</Tag>
            </div>
            </div>
          </ListCard>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: theme.spacing[3],
          borderTop: `1px solid ${theme.colors.neutral[200]}`,
          backgroundColor: theme.colors.neutral[0],
        }}
      >
        <Text variant="metadata" color="muted">
          {tools.length} herramientas disponibles
        </Text>
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
      <Heading level={2}>
        Plugins
      </Heading>
      <Text variant="metadata" color="muted">
        Extensiones y plugins instalados - Coming Soon
      </Text>
    </div>
  );
}
