export default function EndUsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
      <p className="mt-2 text-gray-600">
        View and manage all your end users (customers)
      </p>

      <div className="mt-8 bg-white p-8 rounded-lg shadow text-center">
        <div className="text-6xl mb-4">👥</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No customers yet
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Your customer database will appear here. You'll be able to search,
          filter, and view detailed profiles for each customer.
        </p>
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-blue-800">
            <strong>Coming soon:</strong> Backend API integration for fetching
            and managing end user profiles, contact information, and interaction
            history.
          </p>
        </div>
      </div>
    </div>
  );
}
