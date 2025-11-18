import { useState, useEffect, useCallback } from 'react';
import Header from '@components/Header';
import MessageList from '@components/MessageList';
import MessageInput from '@components/MessageInput';
import StatusCard from '@components/StatusCard';
import { apiClient } from '@services/api';
import { useWebSocket } from '@hooks/useWebSocket';
import type { Message, HealthStatus, WebSocketMessage } from '@/types';

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // WebSocket message handler with useCallback to prevent infinite reconnects
  const handleWebSocketMessage = useCallback((msg: WebSocketMessage) => {
    console.log('WebSocket message:', msg);
    // Handle incoming WebSocket messages
    if (msg.type === 'new_message' && msg.data) {
      const newMessage = msg.data as Message;
      // Prevent duplicates by checking if message ID already exists
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === newMessage.id);
        return exists ? prev : [...prev, newMessage];
      });
    }
  }, []);

  // WebSocket connection
  const { connected } = useWebSocket({
    onMessage: handleWebSocketMessage,
  });

  // Load initial data
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Load health status
      const healthData = await apiClient.getHealth();
      setHealth(healthData);

      // Load recent messages
      const messagesData = await apiClient.getMessages();
      setMessages(messagesData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(errorMessage);
      // Set default values on error
      setMessages([]);
      setHealth({ status: 'error' });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      setError(null);
      const message = {
        type: 'outgoing' as const,
        channel: 'web' as const,
        content: { text: content },
        metadata: {
          from: 'web-user',
          to: 'system',
          timestamp: new Date().toISOString(),
        },
      };

      await apiClient.sendMessage(message);
      await loadDashboard(true); // Reload messages with refresh state
    } catch (err) {
      console.error('Failed to send message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      throw err; // Re-throw to let MessageInput handle it
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-red-600 text-xl">⚠️</span>
              <div>
                <p className="text-red-800 font-semibold">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 font-bold text-xl"
            >
              ×
            </button>
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatusCard
            title="API Status"
            value={health?.status || 'unknown'}
            color={health?.status === 'ok' ? 'green' : 'red'}
          />
          <StatusCard
            title="WebSocket"
            value={connected ? 'Connected' : 'Disconnected'}
            color={connected ? 'green' : 'yellow'}
          />
          <StatusCard
            title="Messages"
            value={(messages?.length ?? 0).toString()}
            color="blue"
          />
        </div>

        {/* Messages Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Messages</h2>
            {isRefreshing && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                <span>Refreshing...</span>
              </div>
            )}
          </div>

          <MessageList messages={messages} />

          <div className="mt-6">
            <MessageInput onSend={handleSendMessage} />
          </div>
        </div>
      </main>
    </div>
  );
}
