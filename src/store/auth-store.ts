/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "src/store/auth-store.ts"
 *   type: "store"
 *   layer: "frontend"
 *   domain: "auth"
 *   purpose: "Store de Zustand para gestión de estado de autenticación con persistencia en localStorage y sincronización de token"
 *
 * DEPENDENCIES:
 *   internal: ["../lib/api/admin-client"]
 *   external: ["zustand", "zustand/middleware"]
 *   infrastructure: ["localStorage"]
 *
 * CONTRACTS:
 *   exports: ["useAuthStore", "AuthState"]
 *   inputs: ["User", "string:token"]
 *   outputs: ["AuthState"]
 *   errors: []
 *
 * INTEGRATION:
 *   data_flow: "[Login] → [setAuth] → [localStorage + Zustand] → [ProtectedRoute] → [API requests]"
 *   events_emitted: []
 *   events_consumed: []
 *
 * IMPACT:
 *   used_by: ["components/auth/ProtectedRoute", "pages/auth/LoginPage", "lib/api/admin-client", "components/workspace"]
 *   uses: ["lib/api/admin-client"]
 *   critical: true
 *
 * === DOC_END :: auth-store.ts ===
 */

// Auth Store - Zustand state management for authentication

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../lib/api/admin-client';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token: string, user: User) => {
        localStorage.setItem('inhost_admin_token', token);
        localStorage.setItem('inhost_admin_user', JSON.stringify(user));
        set({
          token,
          user,
          isAuthenticated: true
        });
      },

      logout: async () => {
        // IMPORTANTE: Guardar layout antes de logout
        const { useWorkspaceStore } = await import('./workspace');
        await useWorkspaceStore.getState().saveCurrentLayout();

        // Limpiar autenticación
        localStorage.removeItem('inhost_admin_token');
        localStorage.removeItem('inhost_admin_user');
        set({
          token: null,
          user: null,
          isAuthenticated: false
        });

        console.info('[Auth] Logged out, workspace layout saved');
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          localStorage.setItem('inhost_admin_user', JSON.stringify(updatedUser));
          set({ user: updatedUser });
        }
      }
    }),
    {
      name: 'inhost-auth-storage',
      // Only persist user data, not token (for security)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      // Rehydrate token from localStorage on load
      onRehydrateStorage: () => (state) => {
        if (state) {
          const token = localStorage.getItem('inhost_admin_token');
          if (token && state.isAuthenticated) {
            state.token = token;
          } else {
            // Clear auth if token is missing
            state.isAuthenticated = false;
            state.user = null;
          }
        }
      }
    }
  )
);
