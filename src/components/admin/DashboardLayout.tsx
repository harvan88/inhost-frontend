import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth-store';
import { adminAPI } from '../../lib/api/admin-client';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: logoutStore } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  async function handleLogout() {
    await adminAPI.logout();
    logoutStore();
    navigate('/login');
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinks = [
    { path: '/admin', label: 'Dashboard', icon: '📊', exact: true },
    { path: '/admin/inbox', label: 'Inbox', icon: '💬' },
    { path: '/admin/end-users', label: 'Customers', icon: '👥' },
    { path: '/admin/team', label: 'Team', icon: '🤝' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">INHOST</h1>
              <p className="text-sm text-gray-600 truncate">{user?.tenant.name}</p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 hover:bg-gray-100 rounded text-gray-600"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="mt-8">
          {navLinks.map((link) => {
            const active = link.exact
              ? location.pathname === link.path
              : isActive(link.path);

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-4 py-3 hover:bg-gray-100 transition-colors ${
                  active ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
                title={sidebarCollapsed ? link.label : undefined}
              >
                <span className="text-xl">{link.icon}</span>
                {!sidebarCollapsed && (
                  <span
                    className={`ml-3 ${
                      active ? 'text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {link.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t bg-white">
          {!sidebarCollapsed && (
            <>
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {user?.role} • {user?.tenant.plan}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-sm text-red-600 hover:text-red-700 hover:underline text-left"
              >
                Logout
              </button>
            </>
          )}
          {sidebarCollapsed && (
            <button
              onClick={handleLogout}
              className="w-full p-2 hover:bg-gray-100 rounded text-red-600"
              title="Logout"
            >
              🚪
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
