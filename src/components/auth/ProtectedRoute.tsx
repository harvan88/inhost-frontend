/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "components/auth/ProtectedRoute.tsx"
 *   type: "component"
 *   layer: "frontend"
 *   domain: "auth"
 *   purpose: "Higher-Order Component que protege rutas privadas validando autenticación JWT. Redirige a login si token inválido o expirado y ejecuta logout automático"
 *
 * DEPENDENCIES:
 *   internal: ["../../lib/auth/jwt","../../store/auth-store"]
 *   external: ["react","react-router-dom"]
 *   infrastructure: []
 *
 * CONTRACTS:
 *   exports: ["ProtectedRoute"]
 *   inputs: ["ProtectedRouteProps { children: ReactNode, redirectTo?: string }"]
 *   outputs: ["JSX.Element (children | Navigate redirect)"]
 *   errors: []
 *
 * INTEGRATION:
 *   data_flow: "[auth-store.token] → [isAuthenticated()] → [valid: render children | invalid: Navigate to /login]"
 *   events_emitted: []
 *   events_consumed: ["useEffect dependency on token changes"]
 *
 * IMPACT:
 *   used_by: ["App.tsx (wrapping /dashboard and protected routes)"]
 *   uses: ["../../lib/auth/jwt","../../store/auth-store","react","react-router-dom"]
 *   critical: true
 *
 * === DOC_END :: ProtectedRoute.tsx ===
 */

import { ReactNode, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth-store';
import { isAuthenticated } from '../../lib/auth/jwt';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { isAuthenticated: storeIsAuth, token, logout } = useAuthStore();

  useEffect(() => {
    // Double check token validity
    if (token && !isAuthenticated()) {
      // Token exists but is expired, log out
      logout();
      navigate(redirectTo);
    }
  }, [token, logout, navigate, redirectTo]);

  if (!storeIsAuth || !token) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
