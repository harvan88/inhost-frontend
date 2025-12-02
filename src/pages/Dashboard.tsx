/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "pages/Dashboard.tsx"
 *   type: "component"
 *   layer: "frontend"
 *   domain: "core"
 *   purpose: "Component for dashboard"
 *
 * DEPENDENCIES:
 *   internal: ["@/store","@/utils/seedDatabase"]
 *   external: ["@components/chat/ChatArea","@components/layout/Header","@components/layout/StatusCard","@hooks/useWebSocket","react"]
 *   infrastructure: []
 *
 * CONTRACTS:
 *   exports: ["function"]
 *   inputs: "None"
 *   outputs: "JSX.Element"
 *   errors: "None"
 *
 * INTEGRATION:
 *   data_flow: "WebSocket → Handler → Store → UI"
 *   events_emitted: []
 *   events_consumed: []
 *
 * IMPACT:
 *   used_by: "To be determined via dependency analysis"
 *   uses: ["@/store","@/utils/seedDatabase","@components/chat/ChatArea","@components/layout/Header","@components/layout/StatusCard","@hooks/useWebSocket","react"]
 *   critical: true
 *
 * === DOC_END :: Dashboard.tsx ===
 */

import { useCallback, useState } from 'react';
import Header from '@components/layout/Header';
import ChatArea from '@components/chat/ChatArea';
import StatusCard from '@components/layout/StatusCard';
import { useStore, useActiveConversationId, useConnectionStatus } from '@/store';
import { useWebSocket } from '@hooks/useWebSocket';
import type { Message, WebSocketMessage } from '@/types';
import { seedDatabase, clearDatabase, resetDatabase } from '@/utils/seedDatabase';

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
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

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

  // Database seed handlers
  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedMessage(null);
    try {
      const result = await seedDatabase();
      setSeedMessage(`✅ Database seeded: ${result.contacts} contacts, ${result.conversations} conversations, ${result.messages} messages`);
      console.log('✅ Database seeded successfully', result);
    } catch (error) {
      setSeedMessage(`❌ Failed to seed database: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('❌ Failed to seed database:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear all data?')) return;

    setIsSeeding(true);
    setSeedMessage(null);
    try {
      await clearDatabase();
      setSeedMessage('✅ Database cleared successfully');
      console.log('✅ Database cleared');
    } catch (error) {
      setSeedMessage(`❌ Failed to clear database: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('❌ Failed to clear database:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the database? This will clear all data and reseed with mock data.')) return;

    setIsSeeding(true);
    setSeedMessage(null);
    try {
      await resetDatabase();
      setSeedMessage('✅ Database reset successfully');
      console.log('✅ Database reset');
    } catch (error) {
      setSeedMessage(`❌ Failed to reset database: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('❌ Failed to reset database:', error);
    } finally {
      setIsSeeding(false);
    }
  };

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

        {/* Database Seed Controls */}
        <div className="mb-6 flex gap-4 items-center flex-wrap">
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {isSeeding ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </>
            ) : (
              <>
                🌱 Seed Database
              </>
            )}
          </button>
          <button
            onClick={handleClear}
            disabled={isSeeding}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            🗑️ Clear Database
          </button>
          <button
            onClick={handleReset}
            disabled={isSeeding}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            🔄 Reset Database
          </button>
          {seedMessage && (
            <p className="text-sm text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
              {seedMessage}
            </p>
          )}
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
