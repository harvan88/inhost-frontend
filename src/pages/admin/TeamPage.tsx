import { useAuthStore } from '../../store/auth-store';

export default function TeamPage() {
  const user = useAuthStore(state => state.user);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Team</h1>
      <p className="mt-2 text-gray-600">
        Manage your team members and their permissions
      </p>

      <div className="mt-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Team Members
            </h2>
          </div>
          <div className="p-6">
            {/* Current user */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                  {user?.role}
                </span>
                <span className="ml-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  You
                </span>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Coming soon:</strong> Invite team members, assign roles
                (admin, agent, viewer), and manage permissions. Backend API
                integration pending.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
