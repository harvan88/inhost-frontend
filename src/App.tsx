/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "src/App.tsx"
 *   type: "component"
 *   layer: "frontend"
 *   domain: "ui"
 *   purpose: "Punto de entrada de la aplicación frontend que configura routing, error boundaries, y providers globales"
 *
 * DEPENDENCIES:
 *   internal: ["@/components/feedback", "@/providers/WebSocketProvider", "./pages/auth/LoginPage", "./pages/auth/SignupPage", "./components/auth/ProtectedRoute", "@components/workspace/Workspace", "./styles/App.css"]
 *   external: ["react-router-dom", "react"]
 *   infrastructure: ["browser-router"]
 *
 * CONTRACTS:
 *   exports: ["App"]
 *   inputs: []
 *   outputs: ["JSX.Element"]
 *   errors: []
 *
 * INTEGRATION:
 *   data_flow: "[Router] → [ErrorBoundary] → [Routes] → [ProtectedRoute] → [WebSocketProvider] → [Workspace]"
 *   events_emitted: []
 *   events_consumed: []
 *
 * IMPACT:
 *   used_by: ["src/main.tsx"]
 *   uses: ["components/feedback", "providers/WebSocketProvider", "pages/auth", "components/workspace"]
 *   critical: true
 *
 * === DOC_END :: App.tsx ===
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary, ToastContainer, useToastStore } from '@/components/feedback';
import { WebSocketProvider } from '@/providers/WebSocketProvider';

// Authentication
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Main Workspace (Chat) - CORE APPLICATION
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
 * - /workspace: Main chat/workspace interface (CORE APPLICATION)
 *   - Includes Settings domain for team, account, and integrations management
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
