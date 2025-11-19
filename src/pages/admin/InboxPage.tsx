export default function InboxPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
      <p className="mt-2 text-gray-600">
        Manage all your customer conversations in one place
      </p>

      <div className="mt-8 bg-white p-8 rounded-lg shadow text-center">
        <div className="text-6xl mb-4">💬</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No conversations yet
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          When customers reach out via WhatsApp, Instagram, or other channels,
          their conversations will appear here.
        </p>
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-blue-800">
            <strong>Coming soon:</strong> Backend API integration for fetching
            and managing conversations across multiple channels.
          </p>
        </div>
      </div>
    </div>
  );
}
