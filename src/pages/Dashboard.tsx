import { useCallback } from 'react';
import Header from '@components/layout/Header';
import ChatArea from '@components/chat/ChatArea';
import StatusCard from '@components/layout/StatusCard';
import { useStore, useActiveConversationId, useConnectionStatus } from '@/store';
import { useWebSocket } from '@hooks/useWebSocket';
import type { Message, WebSocketMessage } from '@/types';

/**
 * Dashboard - Main application view
 *
 * Architecture: Orchestrates layout and connects WebSocket
 *
 * Responsibilities:
 * - Render main layout (Header, StatusCards, ChatArea)
 * - Handle WebSocket connection and messages
 * - Display connection status
 *
 * Does NOT:
 * - Manage conversation state (that's the store)
 * - Render messages directly (that's ChatArea > MessageList)
 * - Handle message input (that's ChatArea > MessageInput)
 */
export default function Dashboard() {
  const activeConversationId = useActiveConversationId();
  const connectionStatus = useConnectionStatus();
  const addMessage = useStore((state) => state.actions.addMessage);
  const setConnectionStatus = useStore((state) => state.actions.setConnectionStatus);
  const conversations = useStore((state) => state.entities.conversations);
  const messages = useStore((state) => state.entities.messages);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback(
    (msg: WebSocketMessage) => {
      console.log('WebSocket message:', msg);

      // Handle incoming messages
      if (msg.type === 'new_message' && msg.data) {
        const newMessage = msg.data as Message;

        // Find the conversation for this message
        // TODO: Implement proper conversation lookup/creation logic
        const conversationId = activeConversationId || 'conv-1';

        addMessage(conversationId, newMessage);
      }
    },
    [addMessage, activeConversationId]
  );

  // WebSocket connection
  const { connected } = useWebSocket({
    onMessage: handleWebSocketMessage,
  });

  // Sync WebSocket connection status to store
  useCallback(() => {
    setConnectionStatus(connected ? 'connected' : 'disconnected');
  }, [connected, setConnectionStatus])();

  // Calculate total message count across all conversations
  const totalMessageCount = Array.from(messages.values()).reduce(
    (acc, msgs) => acc + msgs.length,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatusCard
            title="Conversations"
            value={conversations.size.toString()}
            color="blue"
          />
          <StatusCard
            title="WebSocket"
            value={connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            color={connectionStatus === 'connected' ? 'green' : 'yellow'}
          />
          <StatusCard
            title="Total Messages"
            value={totalMessageCount.toString()}
            color="blue"
          />
        </div>

        {/* Chat Area */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
          {activeConversationId ? (
            <ChatArea conversationId={activeConversationId} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-xl text-gray-500 mb-2">No conversation selected</p>
                <p className="text-sm text-gray-400">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>

        {/* Debug info (can be removed in production) */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
          <p>
            <strong>Active Conversation:</strong> {activeConversationId || 'None'}
          </p>
          <p>
            <strong>Total Conversations:</strong> {conversations.size}
          </p>
          <p>
            <strong>Connection Status:</strong> {connectionStatus}
          </p>
        </div>
      </main>
    </div>
  );
}
