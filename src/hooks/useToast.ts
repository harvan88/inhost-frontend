/**
 * useToast Hook - Toast Management
 *
 * Hook para mostrar notificaciones toast en cualquier parte de la app.
 * Maneja el estado global de toasts con Zustand.
 *
 * @example
 * ```tsx
 * const { toast } = useToast();
 *
 * // Success
 * toast.success('¡Éxito!', 'El mensaje se envió correctamente');
 *
 * // Error con acción
 * toast.error('Error de conexión', 'No se pudo conectar al servidor', {
 *   label: 'Reintentar',
 *   onClick: () => reconnect()
 * });
 *
 * // Warning sin auto-close
 * toast.warning('Advertencia', 'Conexión inestable', undefined, null);
 * ```
 */

import { create } from 'zustand';
import type { ToastProps, ToastType, ToastAction } from '@/components/feedback/Toast';

interface ToastStore {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id,
          onClose: () => {
            set((s) => ({
              toasts: s.toasts.filter((t) => t.id !== id),
            }));
          },
        },
      ],
    }));

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },
}));

/**
 * Hook principal para usar toasts
 */
export function useToast() {
  const addToast = useToastStore((state) => state.addToast);
  const removeToast = useToastStore((state) => state.removeToast);
  const clearAll = useToastStore((state) => state.clearAll);

  return {
    toast: {
      /**
       * Muestra un toast de éxito
       */
      success: (
        title: string,
        message: string,
        action?: ToastAction,
        duration?: number | null
      ) => {
        return addToast({ type: 'success', title, message, action, duration });
      },

      /**
       * Muestra un toast de error
       */
      error: (
        title: string,
        message: string,
        action?: ToastAction,
        duration?: number | null
      ) => {
        return addToast({ type: 'error', title, message, action, duration });
      },

      /**
       * Muestra un toast de advertencia
       */
      warning: (
        title: string,
        message: string,
        action?: ToastAction,
        duration?: number | null
      ) => {
        return addToast({ type: 'warning', title, message, action, duration });
      },

      /**
       * Muestra un toast de información
       */
      info: (
        title: string,
        message: string,
        action?: ToastAction,
        duration?: number | null
      ) => {
        return addToast({ type: 'info', title, message, action, duration });
      },
    },

    /**
     * Cierra un toast específico
     */
    remove: removeToast,

    /**
     * Cierra todos los toasts
     */
    clearAll,
  };
}
