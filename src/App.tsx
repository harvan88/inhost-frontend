import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary, ToastContainer, useToastStore } from '@/components/feedback';
import { WebSocketProvider } from '@/providers/WebSocketProvider';

// Authentication
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Main Workspace (Chat) - CORE APPLICATION
import Workspace from '@components/workspace/Workspace';

// Admin Dashboard (Secondary features)
import DashboardLayout from './components/admin/DashboardLayout';
import DashboardPage from './pages/admin/DashboardPage';
import InboxPage from './pages/admin/InboxPage';
import EndUsersPage from './pages/admin/EndUsersPage';
import TeamPage from './pages/admin/TeamPage';
import SettingsPage from './pages/admin/SettingsPage';

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
 * - /workspace: Main chat/workspace interface (CORE APPLICATION)
 * - /admin/*: Protected admin dashboard routes (secondary features)
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

          {/* Main workspace (chat) - CORE APPLICATION */}
          <Route
            path="/workspace"
            element={
              <ProtectedRoute>
                <WebSocketProvider>
                  <Workspace />
                </WebSocketProvider>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/workspace" replace />} />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        <ToastContainer toasts={toasts} />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
