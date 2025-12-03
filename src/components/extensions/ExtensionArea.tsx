/**
 * ExtensionArea - Área de renderizado para extensiones
 * 
 * Renderiza el contenido de una extensión según su ID.
 * Soporta FluxCore Chat y Extension Manager.
 */

import { useTheme } from '@/theme';
import { Heading, Text } from '@/components/ui';
import { Bot, Settings, Zap, MessageSquare, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';

interface ExtensionAreaProps {
  extensionId: string;
}

/**
 * FluxCore Chat Extension View
 */
function FluxCoreChatView() {
  const { theme } = useTheme();
  const [isEnabled, setIsEnabled] = useState(true);
  const [autoReply, setAutoReply] = useState(true);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: theme.colors.neutral[0] }}>
      {/* Header */}
      <div
        className="flex items-center gap-4 px-6 py-4"
        style={{ borderBottom: `1px solid ${theme.colors.neutral[200]}` }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: theme.colors.primary[100] }}
        >
          <Bot size={24} style={{ color: theme.colors.primary[600] }} />
        </div>
        <div className="flex-1">
          <Heading level={3} noMargin>FluxCore Chat</Heading>
          <Text variant="metadata" color="muted">Asistente de IA para respuestas automáticas</Text>
        </div>
        <button
          onClick={() => setIsEnabled(!isEnabled)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: isEnabled ? theme.colors.semantic.success : theme.colors.neutral[200],
            color: isEnabled ? theme.colors.neutral[0] : theme.colors.neutral[600],
          }}
        >
          {isEnabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          {isEnabled ? 'Activo' : 'Inactivo'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: theme.colors.neutral[50] }}
          >
            <Text variant="metadata" color="muted">Mensajes procesados</Text>
            <Heading level={2} noMargin>1,234</Heading>
          </div>
          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: theme.colors.neutral[50] }}
          >
            <Text variant="metadata" color="muted">Respuestas generadas</Text>
            <Heading level={2} noMargin>987</Heading>
          </div>
          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: theme.colors.neutral[50] }}
          >
            <Text variant="metadata" color="muted">Tiempo promedio</Text>
            <Heading level={2} noMargin>1.2s</Heading>
          </div>
        </div>

        {/* Configuration */}
        <div
          className="rounded-xl p-6 mb-6"
          style={{ border: `1px solid ${theme.colors.neutral[200]}` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Settings size={20} style={{ color: theme.colors.neutral[600] }} />
            <Heading level={4} noMargin>Configuración</Heading>
          </div>

          <div className="space-y-4">
            {/* Auto Reply Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Text>Respuesta automática</Text>
                <Text variant="metadata" color="muted">
                  Responder automáticamente a mensajes entrantes
                </Text>
              </div>
              <button
                onClick={() => setAutoReply(!autoReply)}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: autoReply ? theme.colors.primary[100] : theme.colors.neutral[100],
                }}
              >
                {autoReply ? (
                  <ToggleRight size={24} style={{ color: theme.colors.primary[600] }} />
                ) : (
                  <ToggleLeft size={24} style={{ color: theme.colors.neutral[400] }} />
                )}
              </button>
            </div>

            {/* Model Selection */}
            <div>
              <Text className="mb-2">Modelo de IA</Text>
              <select
                className="w-full p-3 rounded-lg"
                style={{
                  backgroundColor: theme.colors.neutral[50],
                  border: `1px solid ${theme.colors.neutral[200]}`,
                  color: theme.colors.neutral[900],
                }}
                defaultValue="gpt-4"
              >
                <option value="gpt-4">GPT-4 (Recomendado)</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3">Claude 3</option>
              </select>
            </div>

            {/* System Prompt */}
            <div>
              <Text className="mb-2">Prompt del sistema</Text>
              <textarea
                className="w-full p-3 rounded-lg resize-none"
                rows={4}
                style={{
                  backgroundColor: theme.colors.neutral[50],
                  border: `1px solid ${theme.colors.neutral[200]}`,
                  color: theme.colors.neutral[900],
                }}
                defaultValue="Eres un asistente de FluxCoreChat. Responde de forma profesional y concisa."
              />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="rounded-xl p-6"
          style={{ border: `1px solid ${theme.colors.neutral[200]}` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap size={20} style={{ color: theme.colors.neutral[600] }} />
            <Heading level={4} noMargin>Actividad reciente</Heading>
          </div>

          <div className="space-y-3">
            {[
              { time: 'Hace 2 min', message: 'Respuesta generada para Juan Pérez' },
              { time: 'Hace 5 min', message: 'Mensaje procesado de María García' },
              { time: 'Hace 10 min', message: 'Respuesta generada para Carlos López' },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ backgroundColor: theme.colors.neutral[50] }}
              >
                <MessageSquare size={16} style={{ color: theme.colors.primary[500] }} />
                <div className="flex-1">
                  <Text>{activity.message}</Text>
                </div>
                <Text variant="metadata" color="muted">{activity.time}</Text>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Extension Manager View
 */
function ExtensionManagerView() {
  const { theme } = useTheme();

  const installedExtensions = [
    {
      id: 'fluxcore-chat',
      name: 'FluxCore Chat',
      description: 'Asistente de IA para respuestas automáticas',
      icon: '🤖',
      version: '1.0.0',
      enabled: true,
    },
  ];

  const availableExtensions = [
    {
      id: 'sentiment-analysis',
      name: 'Sentiment Analysis',
      description: 'Analiza el sentimiento de los mensajes',
      icon: '😊',
      version: '1.0.0',
    },
    {
      id: 'keyword-extractor',
      name: 'Keyword Extractor',
      description: 'Extrae palabras clave de conversaciones',
      icon: '🔑',
      version: '1.0.0',
    },
    {
      id: 'crm-sync',
      name: 'CRM Sync',
      description: 'Sincroniza contactos con tu CRM',
      icon: '📊',
      version: '1.0.0',
    },
  ];

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: theme.colors.neutral[0] }}>
      {/* Header */}
      <div
        className="px-6 py-4"
        style={{ borderBottom: `1px solid ${theme.colors.neutral[200]}` }}
      >
        <Heading level={3} noMargin>Extension Manager</Heading>
        <Text variant="metadata" color="muted">Gestiona las extensiones del sistema</Text>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Installed Extensions */}
        <div className="mb-8">
          <Heading level={4}>Extensiones instaladas</Heading>
          <div className="space-y-3">
            {installedExtensions.map((ext) => (
              <div
                key={ext.id}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{ border: `1px solid ${theme.colors.neutral[200]}` }}
              >
                <span className="text-3xl">{ext.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Text>{ext.name}</Text>
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: theme.colors.neutral[100],
                        color: theme.colors.neutral[600],
                      }}
                    >
                      v{ext.version}
                    </span>
                  </div>
                  <Text variant="metadata" color="muted">{ext.description}</Text>
                </div>
                <button
                  className="px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: ext.enabled ? theme.colors.semantic.success : theme.colors.neutral[200],
                    color: ext.enabled ? theme.colors.neutral[0] : theme.colors.neutral[600],
                  }}
                >
                  {ext.enabled ? 'Activo' : 'Inactivo'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Available Extensions */}
        <div>
          <Heading level={4}>Extensiones disponibles</Heading>
          <div className="grid grid-cols-2 gap-4">
            {availableExtensions.map((ext) => (
              <div
                key={ext.id}
                className="p-4 rounded-xl"
                style={{ border: `1px solid ${theme.colors.neutral[200]}` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{ext.icon}</span>
                  <div>
                    <Text>{ext.name}</Text>
                    <Text variant="metadata" color="muted">v{ext.version}</Text>
                  </div>
                </div>
                <Text variant="metadata" color="muted" className="mb-3">
                  {ext.description}
                </Text>
                <button
                  className="w-full py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: theme.colors.primary[500],
                    color: theme.colors.neutral[0],
                  }}
                >
                  Instalar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main ExtensionArea Component
 */
export default function ExtensionArea({ extensionId }: ExtensionAreaProps) {
  const { theme } = useTheme();

  // Render based on extensionId
  if (extensionId === 'fluxcore-chat') {
    return <FluxCoreChatView />;
  }

  if (extensionId === 'extension-manager') {
    return <ExtensionManagerView />;
  }

  // Unknown extension
  return (
    <div
      className="h-full flex items-center justify-center"
      style={{ backgroundColor: theme.colors.neutral[50] }}
    >
      <div className="text-center">
        <Text color="muted">Extensión no encontrada: {extensionId}</Text>
      </div>
    </div>
  );
}
