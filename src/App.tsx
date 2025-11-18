import Workspace from '@components/workspace/Workspace';
import { ErrorBoundary, ToastContainer, useToastStore } from '@/components/feedback';
import './styles/App.css';

/**
 * App - Root component
 *
 * Workspace layout con:
 * - ErrorBoundary: Captura errores y muestra UI de recuperación
 * - ToastContainer: Sistema de notificaciones global
 * - Workspace: Layout principal (multi-tab, VS Code-style)
 */
function App() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <ErrorBoundary>
      <Workspace />
      <ToastContainer toasts={toasts} />
    </ErrorBoundary>
  );
}

export default App;
