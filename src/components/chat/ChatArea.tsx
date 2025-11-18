import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatAreaProps {
  conversationId: string;
}

/**
 * ChatArea - Container component for a single conversation
 *
 * Architecture: Receives only a conversationId and orchestrates the 3 child components.
 * This allows multiple ChatAreas to exist (tabs, split view) without code changes.
 *
 * Responsibilities:
 * - Orchestrate ChatHeader, MessageList, MessageInput
 * - Pass conversationId to children
 * - Provide conversation context
 *
 * Does NOT:
 * - Fetch data (that's the store's job)
 * - Know how many ChatAreas exist
 * - Handle routing or navigation
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
