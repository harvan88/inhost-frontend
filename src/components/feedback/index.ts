/**
 * Feedback Components
 *
 * Componentes para feedback visual al usuario:
 * - Toasts: Notificaciones temporales
 * - Skeletons: Loading placeholders
 * - ErrorBoundary: Manejo de errores
 *
 * @module components/feedback
 */

// Toast System
export { Toast } from './Toast';
export type { ToastProps, ToastType, ToastAction } from './Toast';

export { ToastContainer } from './ToastContainer';

// Skeleton System
export { Skeleton } from './Skeleton';
export { ChatAreaSkeleton } from './ChatAreaSkeleton';
export { ConversationListSkeleton } from './ConversationListSkeleton';

// Error Boundary
export { ErrorBoundary } from './ErrorBoundary';

// Hook
export { useToast, useToastStore } from '@/hooks/useToast';
