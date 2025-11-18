import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatAreaProps {
  conversationId: string;
}

/**
 * ChatArea - Vista de Conversación (vive en Contenedor Dinámico)
 *
 * Rol en la arquitectura de tres niveles:
 * - Es una VISTA que se alberga en el Contenedor Dinámico (Nivel 3)
 * - Se abre cuando el usuario selecciona una conversación en el Sidebar (Nivel 2)
 * - Puede haber múltiples ChatAreas abiertas simultáneamente en tabs
 *
 * Arquitectura ID-based:
 * - Recibe solo un conversationId
 * - Orquesta 3 componentes: ChatHeader, MessageList, MessageInput
 * - Permite múltiples instancias sin cambios de código
 *
 * Responsabilidades:
 * - Orquestar ChatHeader, MessageList, MessageInput
 * - Pasar conversationId a componentes hijos
 * - Proveer contexto de conversación
 *
 * NO hace:
 * - Fetch de datos (lo hace el store)
 * - Manejar routing o navegación
 * - Saber cuántas ChatAreas existen
 */
export default function ChatArea({ conversationId }: ChatAreaProps) {
  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-500 mb-2">No conversation selected</p>
          <p className="text-sm text-gray-400">Select a conversation from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header: Shows who we're talking to */}
      <ChatHeader conversationId={conversationId} />

      {/* Messages: Shows conversation history */}
      <div className="flex-1 overflow-hidden">
        <MessageList conversationId={conversationId} />
      </div>

      {/* Input: Where user types messages */}
      <div className="border-t border-gray-200 p-4">
        <MessageInput conversationId={conversationId} />
      </div>
    </div>
  );
}
