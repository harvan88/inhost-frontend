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
        localStorage.setItem('inhost_access_token', token);
        localStorage.setItem('inhost_admin_user', JSON.stringify(user));
        set({
          token,
          user,
          isAuthenticated: true
        });
      },

      logout: () => {
        localStorage.removeItem('inhost_access_token');
        localStorage.removeItem('inhost_admin_user');
        set({
          token: null,
          user: null,
          isAuthenticated: false
        });
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
          const token = localStorage.getItem('inhost_access_token');
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
