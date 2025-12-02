/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "C:\Users\harva\Documents\Trabajos\meetgar\FluxCoreChat\inhost-frontend\src\components\feedback\index.ts"
 *   type: "utility"
 *   layer: "frontend"
 *   domain: "ui"
 *   purpose: "Barrel export for feedback module"
 *
 * DEPENDENCIES:
 *   internal: []
 *   external: []
 *   infrastructure: []
 *
 * CONTRACTS:
 *   exports: ["ChatAreaSkeleton","ConversationListSkeleton","ErrorBoundary","Skeleton","Toast","ToastContainer","useToast","useToastStore"]
 *   inputs: "None"
 *   outputs: "void"
 *   errors: "None"
 *
 * INTEGRATION:
 *   data_flow: "Request → Middleware → Handler → Response"
 *   events_emitted: []
 *   events_consumed: []
 *
 * IMPACT:
 *   used_by: "To be determined via dependency analysis"
 *   uses: []
 *   critical: false
 *
 * === DOC_END :: index.ts ===
 */

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
