/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "src/components/simulator/SimulatorArea.tsx"
 *   type: "component"
 *   layer: "frontend"
 *   domain: "ui"
 *   purpose: "Simulador de chat para testing de extensiones: permite enviar mensajes como cliente simulado (WhatsApp/Telegram/SMS) y visualizar enrichments procesados por Extension Host en tiempo real"
 *
 * DEPENDENCIES:
 *   internal: ["@/theme", "@/components/ui", "@/services/api"]
 *   external: ["react", "lucide-react"]
 *   infrastructure: []
 *
 * CONTRACTS:
 *   exports: ["SimulatorArea"]
 *   inputs: []
 *   outputs: ["JSX.Element"]
 *   errors: []
 *
 * INTEGRATION:
 *   data_flow: "[User input] → [apiClient.sendClientMessage] → [Backend Extension Host] → [Enrichments displayed] → [UI]"
 *   events_emitted: []
 *   events_consumed: []
 *
 * IMPACT:
 *   used_by: ["components/workspace/ToolPanels"]
 *   uses: ["services/api", "components/ui", "theme"]
 *   critical: false
 *
 * === DOC_END :: SimulatorArea.tsx ===
 */

/**
 * SimulatorArea - Chat de simulación para pruebas
 *
 * Permite enviar mensajes como si fueras un usuario de WhatsApp/Telegram
 * para probar el flujo completo de enrichments y respuestas de IA.
 */

import { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, Smartphone, MessageSquare } from 'lucide-react';
import { useTheme } from '@/theme';
import { Heading, Text } from '@/components/ui';
import { apiClient } from '@/services/api';

interface SimulatedMessage {
  id: string;
  text: string;
  timestamp: Date;
  direction: 'outgoing' | 'incoming';
  status: 'sending' | 'sent' | 'error';
  enrichments?: Array<{
    type: string;
    payload: any;
  }>;
}

interface SimulatorConfig {
  clientId: string;
  clientName: string;
  channel: 'whatsapp' | 'telegram' | 'sms';
  phoneNumber: string;
}

const DEFAULT_CONFIG: SimulatorConfig = {
  clientId: 'sim-user-001',
  clientName: 'Usuario de Prueba',
  channel: 'whatsapp',
  phoneNumber: '+1234567890',
};

export default function SimulatorArea() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<SimulatedMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [config, setConfig] = useState<SimulatorConfig>(DEFAULT_CONFIG);
  const [showConfig, setShowConfig] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    const messageId = `sim-${Date.now()}`;
    const newMessage: SimulatedMessage = {
      id: messageId,
      text: inputText.trim(),
      timestamp: new Date(),
      direction: 'outgoing',
      status: 'sending',
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    setIsSending(true);

    try {
      // Enviar al backend como mensaje simulado
      // El clientId incluye el canal para que el backend cree la conversación correcta
      const fullClientId = `${config.channel}:${config.clientId}`;
      
      await apiClient.sendClientMessage({
        clientId: fullClientId,
        text: inputText.trim(),
      });

      // Actualizar estado del mensaje
      // Los enrichments llegarán vía WebSocket y se verán en el chat real
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, status: 'sent' as const }
            : m
        )
      );
    } catch (error) {
      console.error('Error sending simulated message:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, status: 'error' as const }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearMessages = () => {
    setMessages([]);
  };

  const handleNewConversation = () => {
    // Generar nuevo ID de cliente para simular nueva conversación
    const newClientId = `sim-user-${Date.now()}`;
    setConfig((prev) => ({ ...prev, clientId: newClientId }));
    setMessages([]);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: theme.colors.neutral[50] }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          borderBottom: `1px solid ${theme.colors.neutral[200]}`,
          backgroundColor: theme.colors.neutral[100],
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.colors.primary[100] }}
          >
            <Smartphone size={20} style={{ color: theme.colors.primary[600] }} />
          </div>
          <div>
            <Heading level={3} noMargin>
              Simulador de Chat
            </Heading>
            <Text variant="metadata" color="muted">
              {config.channel} • {config.clientId}
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNewConversation}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ backgroundColor: theme.colors.primary[100] }}
            title="Nueva conversación"
          >
            <MessageSquare size={18} style={{ color: theme.colors.primary[600] }} />
          </button>
          <button
            onClick={handleClearMessages}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ backgroundColor: theme.colors.neutral[200] }}
            title="Limpiar mensajes"
          >
            <RefreshCw size={18} style={{ color: theme.colors.neutral[600] }} />
          </button>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: showConfig ? theme.colors.primary[600] : theme.colors.neutral[200],
              color: showConfig ? 'white' : theme.colors.neutral[700],
            }}
          >
            Config
          </button>
        </div>
      </div>

      {/* Config Panel */}
      {showConfig && (
        <div
          className="p-4 grid grid-cols-2 gap-3"
          style={{
            backgroundColor: theme.colors.neutral[100],
            borderBottom: `1px solid ${theme.colors.neutral[200]}`,
          }}
        >
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: theme.colors.neutral[600] }}>
              Nombre del usuario
            </label>
            <input
              type="text"
              value={config.clientName}
              onChange={(e) => setConfig((prev) => ({ ...prev, clientName: e.target.value }))}
              className="w-full px-3 py-1.5 rounded border text-sm"
              style={{
                borderColor: theme.colors.neutral[300],
                backgroundColor: 'white',
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: theme.colors.neutral[600] }}>
              Teléfono
            </label>
            <input
              type="text"
              value={config.phoneNumber}
              onChange={(e) => setConfig((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              className="w-full px-3 py-1.5 rounded border text-sm"
              style={{
                borderColor: theme.colors.neutral[300],
                backgroundColor: 'white',
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: theme.colors.neutral[600] }}>
              Canal
            </label>
            <select
              value={config.channel}
              onChange={(e) => setConfig((prev) => ({ ...prev, channel: e.target.value as any }))}
              className="w-full px-3 py-1.5 rounded border text-sm"
              style={{
                borderColor: theme.colors.neutral[300],
                backgroundColor: 'white',
              }}
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="telegram">Telegram</option>
              <option value="sms">SMS</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: theme.colors.neutral[600] }}>
              Client ID
            </label>
            <input
              type="text"
              value={config.clientId}
              onChange={(e) => setConfig((prev) => ({ ...prev, clientId: e.target.value }))}
              className="w-full px-3 py-1.5 rounded border text-sm"
              style={{
                borderColor: theme.colors.neutral[300],
                backgroundColor: 'white',
              }}
            />
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: theme.colors.neutral[200] }}
            >
              <MessageSquare size={32} style={{ color: theme.colors.neutral[400] }} />
            </div>
            <Text color="muted">
              Escribe un mensaje para simular una conversación
            </Text>
            <Text variant="metadata" color="muted">
              Los mensajes pasarán por el sistema de enrichments
            </Text>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[75%] rounded-2xl px-4 py-2"
                style={{
                  backgroundColor:
                    msg.direction === 'outgoing'
                      ? theme.colors.primary[500]
                      : theme.colors.neutral[200],
                  color: msg.direction === 'outgoing' ? 'white' : theme.colors.neutral[900],
                }}
              >
                <p className="text-sm">{msg.text}</p>
                <div className="flex items-center justify-end gap-2 mt-1">
                  <span
                    className="text-xs opacity-70"
                    style={{
                      color: msg.direction === 'outgoing' ? 'white' : theme.colors.neutral[500],
                    }}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.status === 'sending' && (
                    <span className="text-xs opacity-50">⏳</span>
                  )}
                  {msg.status === 'sent' && (
                    <span className="text-xs opacity-70">✓</span>
                  )}
                  {msg.status === 'error' && (
                    <span className="text-xs text-red-400">✗</span>
                  )}
                </div>

                {/* Enrichments */}
                {msg.enrichments && msg.enrichments.length > 0 && (
                  <div
                    className="mt-2 pt-2 space-y-1"
                    style={{ borderTop: `1px solid ${theme.colors.primary[400]}` }}
                  >
                    {msg.enrichments.map((e, idx) => (
                      <div
                        key={idx}
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                        }}
                      >
                        <span className="font-medium">{e.type}:</span>{' '}
                        {JSON.stringify(e.payload).slice(0, 50)}...
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className="p-4"
        style={{
          borderTop: `1px solid ${theme.colors.neutral[200]}`,
          backgroundColor: theme.colors.neutral[100],
        }}
      >
        <div className="flex items-end gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje como usuario..."
            rows={1}
            className="flex-1 px-4 py-2.5 rounded-2xl border resize-none text-sm"
            style={{
              borderColor: theme.colors.neutral[300],
              backgroundColor: 'white',
              minHeight: '44px',
              maxHeight: '120px',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isSending}
            className="p-2.5 rounded-full transition-colors disabled:opacity-50"
            style={{
              backgroundColor: theme.colors.primary[500],
              color: 'white',
            }}
          >
            <Send size={20} />
          </button>
        </div>
        <Text variant="metadata" color="muted" className="mt-2 text-center">
          Los mensajes se envían como si fueran de {config.channel} • ID: {config.clientId}
        </Text>
      </div>
    </div>
  );
}
