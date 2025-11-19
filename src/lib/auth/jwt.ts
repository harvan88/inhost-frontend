// JWT Helper Utilities

export interface JWTPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Decode a JWT token without verification
 * Note: This is NOT secure validation, just for reading payload
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Get token from localStorage
 */
export function getStoredToken(): string | null {
  return localStorage.getItem('inhost_admin_token');
}

/**
 * Store token in localStorage
 */
export function storeToken(token: string): void {
  localStorage.setItem('inhost_admin_token', token);
}

/**
 * Remove token from localStorage
 */
export function removeToken(): void {
  localStorage.removeItem('inhost_admin_token');
  localStorage.removeItem('inhost_admin_user');
}

/**
 * Check if user is authenticated with valid token
 */
export function isAuthenticated(): boolean {
  const token = getStoredToken();
  if (!token) {
    return false;
  }

  return !isTokenExpired(token);
}
