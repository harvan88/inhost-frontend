import { useAuthStore } from '../../store/auth-store';

export default function DashboardPage() {
  const user = useAuthStore(state => state.user);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome back, {user?.name}! 👋
      </h1>
      <p className="mt-2 text-gray-600">
        Here's what's happening with your {user?.tenant.name} account today.
      </p>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-600 text-sm font-medium">
                Active Conversations
              </h3>
              <p className="text-3xl font-bold mt-2 text-gray-900">0</p>
            </div>
            <div className="text-4xl">💬</div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            No active conversations yet
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-600 text-sm font-medium">
                Total Customers
              </h3>
              <p className="text-3xl font-bold mt-2 text-gray-900">0</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Start by adding customers
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-600 text-sm font-medium">
                Team Members
              </h3>
              <p className="text-3xl font-bold mt-2 text-gray-900">1</p>
            </div>
            <div className="text-4xl">🤝</div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            You ({user?.role})
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Coming soon
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Conversations, End Users, and Analytics will be available once
                backend endpoints are implemented.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Info */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Account Information
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Company Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{user?.tenant.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Plan</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">
              {user?.tenant.plan}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tenant ID</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">
              {user?.tenant.id}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Slug</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">
              {user?.tenant.slug}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
