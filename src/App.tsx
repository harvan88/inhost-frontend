import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary, ToastContainer, useToastStore } from '@/components/feedback';
import { WebSocketProvider } from '@/providers/WebSocketProvider';

// Admin Dashboard
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/admin/DashboardLayout';
import DashboardPage from './pages/admin/DashboardPage';
import InboxPage from './pages/admin/InboxPage';
import EndUsersPage from './pages/admin/EndUsersPage';
import TeamPage from './pages/admin/TeamPage';
import SettingsPage from './pages/admin/SettingsPage';

// Original Workspace (legacy)
import Workspace from '@components/workspace/Workspace';

import './styles/App.css';

/**
 * App - Root component with routing
 *
 * Architecture:
 * - BrowserRouter: Client-side routing
 * - ErrorBoundary: Captures errors and shows recovery UI
 * - ToastContainer: Global notification system
 *
 * Routes:
 * - /login, /signup: Authentication pages
 * - /admin/*: Protected admin dashboard routes
 * - /workspace: Original FluxCore workspace (legacy)
 */
function App() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inbox"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <InboxPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/end-users"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EndUsersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/team"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TeamPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Legacy workspace route */}
          <Route
            path="/workspace"
            element={
              <WebSocketProvider>
                <Workspace />
              </WebSocketProvider>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        <ToastContainer toasts={toasts} />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
