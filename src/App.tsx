import Workspace from '@components/workspace/Workspace';
import { ErrorBoundary, ToastContainer, useToastStore } from '@/components/feedback';
import { WebSocketProvider } from '@/providers/WebSocketProvider';
import './styles/App.css';

/**
 * App - Root component
 *
 * Arquitectura:
 * - WebSocketProvider: Maneja conexión WebSocket y sincronización con backend
 * - ErrorBoundary: Captura errores y muestra UI de recuperación
 * - ToastContainer: Sistema de notificaciones global
 * - Workspace: Layout principal (multi-tab, VS Code-style)
 *
 * Flujo de inicialización:
 * 1. WebSocketProvider monta
 * 2. Inicializa IndexedDB
 * 3. Ejecuta sincronización inicial (loadFromIndexedDB + loadSimulationStatus)
 * 4. Conecta WebSocket
 * 5. Workspace renderiza con datos hydratados
 */
function App() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <ErrorBoundary>
      <WebSocketProvider>
        <Workspace />
        <ToastContainer toasts={toasts} />
      </WebSocketProvider>
    </ErrorBoundary>
  );
}

export default App;
