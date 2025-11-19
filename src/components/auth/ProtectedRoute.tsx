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
