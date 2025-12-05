/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "components/workspace/PrimarySidebar.tsx"
 *   type: "component"
 *   layer: "frontend"
 *   domain: "ui"
 *   purpose: "Barra lateral contextual (Nivel 2) del workspace VS Code-inspired. Muestra listas navegables según dominio activo (messages, contacts, tools, etc). ⚠️ ISSUE: Lista sin virtualización mencionada en TECHNICAL_AUDIT.md 6.1"
 *
 * DEPENDENCIES:
 *   internal: ["./ConversationListItem","@/components/ui","@/store","@/store/workspace","@/theme","@/utils/tabHelpers"]
 *   external: ["lucide-react"]
 *   infrastructure: []
 *
 * CONTRACTS:
 *   exports: ["PrimarySidebar"]
 *   inputs: []
 *   outputs: ["JSX.Element (null si sidebar oculta)"]
 *   errors: []
 *
 * INTEGRATION:
 *   data_flow: "[workspace-store.activeActivity] → [render ConversationListView | ContactsView | etc] → [user selects item] → [createTab()] → [canvas renders content]"
 *   events_emitted: []
 *   events_consumed: ["workspace-store changes (activeActivity, sidebarVisible)"]
 *
 * IMPACT:
 *   used_by: ["components/workspace/Workspace.tsx"]
 *   uses: ["./ConversationListItem","@/components/ui","@/store","@/store/workspace","@/theme","@/utils/tabHelpers","lucide-react"]
 *   critical: true
 *
 * === DOC_END :: PrimarySidebar.tsx ===
 */

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
      {activeActivity === 'settings' && <SettingsView />}
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
  ];

  const handleOpenTool = (toolId: string, toolName: string) => {
    // Map toolId to tab type
    let toolType: 'theme_editor' | 'analytics' = 'analytics';
    if (toolId === 'theme-editor') {
      toolType = 'theme_editor';
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
          let toolType: 'theme_editor' | 'analytics' = 'analytics';
          if (tool.id === 'theme-editor') {
            toolType = 'theme_editor';
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
  const { openTab, activeContainerId } = useWorkspaceStore();

  // Extensiones instaladas (aparecen primero)
  const extensions = [
    {
      id: 'fluxcore-chat',
      name: 'FluxCore Chat',
      description: 'Asistente de IA para respuestas automáticas',
      icon: '🤖',
      category: 'IA',
    },
  ];

  // Plugins del sistema
  const plugins = [
    {
      id: 'test-chat',
      name: 'Chat de prueba',
      description: 'Probar mensajería con adapter de WhatsApp',
      icon: '🧪',
      category: 'Testing',
    },
    {
      id: 'extensions',
      name: 'Extension Manager',
      description: 'Gestionar extensiones del sistema',
      icon: '🧩',
      category: 'Sistema',
    },
  ];

  const handleOpenItem = (itemId: string, itemName: string, icon: string) => {
    if (itemId === 'fluxcore-chat') {
      openTab(
        createTab({
          type: 'extension',
          entityId: 'fluxcore-chat',
          label: itemName,
          icon,
          closable: true,
        }),
        activeContainerId || undefined
      );
    } else if (itemId === 'test-chat') {
      openTab(
        createTab({
          type: 'extension',
          entityId: 'test-chat',
          label: itemName,
          icon,
          closable: true,
        }),
        activeContainerId || undefined
      );
    } else if (itemId === 'extensions') {
      openTab(
        createTab({
          type: 'extension',
          entityId: 'extension-manager',
          label: itemName,
          icon,
          closable: true,
        }),
        activeContainerId || undefined
      );
    }
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
          Plugins
        </Heading>
        <Text variant="metadata" color="muted">
          Extensiones y herramientas
        </Text>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto">
        {/* Extensions Section */}
        {extensions.length > 0 && (
          <>
            <div
              className="px-4 py-2"
              style={{ backgroundColor: theme.colors.neutral[100] }}
            >
              <Text variant="metadata" color="muted">
                Extensiones
              </Text>
            </div>
            {extensions.map((ext) => (
              <div
                key={ext.id}
                onClick={() => handleOpenItem(ext.id, ext.name, ext.icon)}
                className="px-4 py-3 cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  borderBottom: `1px solid ${theme.colors.neutral[200]}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{ext.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Text>{ext.name}</Text>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: theme.colors.primary[100],
                          color: theme.colors.primary[700],
                        }}
                      >
                        {ext.category}
                      </span>
                    </div>
                    <Text variant="metadata" color="muted">
                      {ext.description}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Plugins Section */}
        <div
          className="px-4 py-2"
          style={{ backgroundColor: theme.colors.neutral[100] }}
        >
          <Text variant="metadata" color="muted">
            Herramientas
          </Text>
        </div>
        {plugins.map((plugin) => (
          <div
            key={plugin.id}
            onClick={() => handleOpenItem(plugin.id, plugin.name, plugin.icon)}
            className="px-4 py-3 cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              borderBottom: `1px solid ${theme.colors.neutral[200]}`,
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{plugin.icon}</span>
              <div className="flex-1 min-w-0">
                <Text>{plugin.name}</Text>
                <Text variant="metadata" color="muted">
                  {plugin.description}
                </Text>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView() {
  const { theme } = useTheme();
  const { openTab, activeContainerId, containers } = useWorkspaceStore();

  const settingsOptions = [
    {
      id: 'team',
      name: 'Team',
      description: 'Gestionar miembros del equipo e invitaciones',
      icon: '👥',
      category: 'Colaboración',
    },
    {
      id: 'account-settings',
      name: 'Account Settings',
      description: 'Configuración de cuenta y preferencias',
      icon: '⚙️',
      category: 'Cuenta',
    },
    {
      id: 'integrations',
      name: 'Integrations',
      description: 'Conectar WhatsApp, Instagram y otros canales',
      icon: '🔌',
      category: 'Integraciones',
    },
  ];

  const handleOpenSetting = (settingId: string, settingName: string) => {
    // Map settingId to tab type
    let settingType: 'team' | 'account_settings' | 'integrations' = 'account_settings';
    if (settingId === 'team') {
      settingType = 'team';
    } else if (settingId === 'integrations') {
      settingType = 'integrations';
    }

    openTab(
      createTab({
        type: settingType,
        entityId: settingId,
        label: settingName,
        icon: settingsOptions.find((s) => s.id === settingId)?.icon,
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
          Configuración
        </Heading>
        <Text variant="metadata" color="muted">
          Gestión de cuenta y equipo
        </Text>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto">
        {settingsOptions.map((setting) => {
          // Verificar si la opción está activa
          const activeContainer = containers.find((c) => c.id === activeContainerId);
          let settingType: 'team' | 'account_settings' | 'integrations' = 'account_settings';
          if (setting.id === 'team') {
            settingType = 'team';
          } else if (setting.id === 'integrations') {
            settingType = 'integrations';
          }
          const isActive = isTabActive(activeContainer?.activeTabId ?? null, settingType as any, setting.id);

          return (
            <ListCard
              key={setting.id}
              isActive={isActive}
              onClick={() => handleOpenSetting(setting.id, setting.name)}
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
                  {setting.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: theme.spacing[1] }}>
                    <Text variant="label">
                      {setting.name}
                    </Text>
                  </div>
                  <div style={{ marginBottom: theme.spacing[2] }}>
                    <Text variant="metadata" color="muted">
                      {setting.description}
                    </Text>
                  </div>
                  <Tag size="small">{setting.category}</Tag>
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
          {settingsOptions.length} opciones disponibles
        </Text>
      </div>
    </div>
  );
}
