/**
 * ErrorBoundary Component
 *
 * Captura errores de React y muestra una UI de recuperación en lugar de crashear.
 * Compatible con Class Components (requerido por React.ErrorBoundary API).
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 *
 * // Con fallback custom
 * <ErrorBoundary fallback={<CustomError />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */

import { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';

interface Props {
  children: ReactNode;
  /** Fallback UI custom (opcional) */
  fallback?: ReactNode;
  /** Callback cuando ocurre un error */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);

    this.setState({ errorInfo });

    // Callback opcional
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Enviar a servicio de logging (Sentry, LogRocket, etc.)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Usar fallback custom si se proporciona
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de error por defecto
      return (
        <ErrorFallbackUI
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * ErrorFallbackUI - Default Error UI
 */
interface ErrorFallbackUIProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onReset: () => void;
}

function ErrorFallbackUI({ error, errorInfo, onReset }: ErrorFallbackUIProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: '#f9fafb',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Icono de error */}
      <AlertCircle
        size={64}
        style={{ color: '#ef4444', marginBottom: '1rem' }}
      />

      {/* Título */}
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '0.5rem',
          textAlign: 'center',
        }}
      >
        Algo salió mal
      </h1>

      {/* Mensaje */}
      <p
        style={{
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: '2rem',
          maxWidth: '500px',
          lineHeight: '1.6',
        }}
      >
        La aplicación encontró un error inesperado. Puedes intentar recargar la
        página o reintentar la operación.
      </p>

      {/* Acciones */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <Button variant="primary" onClick={onReset}>
          Reintentar
        </Button>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Recargar página
        </Button>
      </div>

      {/* Detalles técnicos (colapsable) */}
      {error && (
        <details
          style={{
            marginTop: '2rem',
            maxWidth: '600px',
            width: '100%',
          }}
        >
          <summary
            style={{
              cursor: 'pointer',
              color: '#6b7280',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            Detalles técnicos
          </summary>
          <pre
            style={{
              padding: '1rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              overflow: 'auto',
              color: '#1f2937',
              lineHeight: '1.5',
              border: '1px solid #e5e7eb',
            }}
          >
            <strong>Error:</strong> {error.toString()}
            {'\n\n'}
            <strong>Stack:</strong>
            {'\n'}
            {error.stack}
            {errorInfo && errorInfo.componentStack && (
              <>
                {'\n\n'}
                <strong>Component Stack:</strong>
                {'\n'}
                {errorInfo.componentStack}
              </>
            )}
          </pre>
        </details>
      )}

      {/* Footer */}
      <p
        style={{
          marginTop: '2rem',
          fontSize: '0.875rem',
          color: '#9ca3af',
        }}
      >
        Si el problema persiste, contacta con soporte técnico.
      </p>
    </div>
  );
}
