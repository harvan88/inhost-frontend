# Plan de Implementación - Mejoras UI/UX FluxCore

**Fecha**: 2025-11-18
**Responsable**: Equipo de Desarrollo Frontend
**Duración Estimada**: 6 semanas (3 sprints)
**Prioridad**: CRÍTICA

---

## Resumen Ejecutivo

Este documento proporciona un plan de acción **concreto y ejecutable** para implementar las mejoras identificadas en el análisis UI/UX. Se priorizan las correcciones críticas que bloquean la adopción móvil y mejoran significativamente la experiencia de usuario.

### Objetivos Principales

1. 🎯 **Mobile-First**: Hacer la app 100% funcional en dispositivos móviles
2. 🚀 **Performance**: Reducir Time to Interactive en 30%
3. ♿ **Accesibilidad**: Elevar de WCAG AA a AAA
4. 🎨 **UX**: Mejorar feedback visual y manejo de errores

---

## Sprint 1: Fundamentos Móviles y Feedback (Semana 1-2)

### 🔴 Día 1-2: Sistema de Breakpoints

**Objetivo**: Implementar detección de dispositivos y sistema responsive.

#### Paso 1.1: Agregar breakpoints al theme

```typescript
// src/theme/theme.json
{
  "breakpoints": {
    "mobile": "0px",
    "mobileLandscape": "480px",
    "tablet": "768px",
    "desktop": "1024px",
    "wide": "1440px",
    "ultrawide": "1920px"
  }
}
```

#### Paso 1.2: Hook de breakpoints

```typescript
// src/hooks/useBreakpoint.ts
import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) setBreakpoint('mobile');
      else if (width < 1024) setBreakpoint('tablet');
      else if (width < 1440) setBreakpoint('desktop');
      else setBreakpoint('wide');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

// Hook auxiliar para checks rápidos
export function useIsMobile(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'mobile';
}
```

#### Paso 1.3: Testear breakpoints

```typescript
// src/__tests__/useBreakpoint.test.ts
import { renderHook, act } from '@testing-library/react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

describe('useBreakpoint', () => {
  it('returns mobile for width < 768px', () => {
    global.innerWidth = 375;
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('mobile');
  });

  it('returns tablet for 768px <= width < 1024px', () => {
    global.innerWidth = 800;
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('tablet');
  });
});
```

---

### 🔴 Día 3-5: Layout Móvil

**Objetivo**: Crear componentes de layout mobile-first.

#### Paso 2.1: MobileHeader

```typescript
// src/components/mobile/MobileHeader.tsx
import { Menu, Search, MoreVertical } from 'lucide-react';
import { useTheme } from '@/theme';

interface MobileHeaderProps {
  title: string;
  onMenuClick: () => void;
  onSearchClick?: () => void;
  showSearch?: boolean;
}

export function MobileHeader({
  title,
  onMenuClick,
  onSearchClick,
  showSearch = true
}: MobileHeaderProps) {
  const { theme } = useTheme();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing[4],
        backgroundColor: theme.colors.neutral[0],
        borderBottom: `1px solid ${theme.colors.neutral[200]}`,
        height: '56px', // Fixed height para cálculos
      }}
    >
      {/* Menu button */}
      <button
        onClick={onMenuClick}
        style={{
          padding: theme.spacing[2],
          color: theme.colors.neutral[700],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Abrir menú"
      >
        <Menu size={24} />
      </button>

      {/* Title */}
      <h1
        style={{
          flex: 1,
          fontSize: theme.typography.sizes.lg,
          fontWeight: theme.typography.weights.semibold,
          color: theme.colors.neutral[900],
          textAlign: 'center',
          marginLeft: theme.spacing[2],
          marginRight: theme.spacing[2],
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </h1>

      {/* Actions */}
      <div style={{ display: 'flex', gap: theme.spacing[1] }}>
        {showSearch && (
          <button
            onClick={onSearchClick}
            style={{
              padding: theme.spacing[2],
              color: theme.colors.neutral[700],
            }}
            aria-label="Buscar"
          >
            <Search size={20} />
          </button>
        )}
        <button
          style={{
            padding: theme.spacing[2],
            color: theme.colors.neutral[700],
          }}
          aria-label="Más opciones"
        >
          <MoreVertical size={20} />
        </button>
      </div>
    </header>
  );
}
```

#### Paso 2.2: Drawer (Sidebar Móvil)

```typescript
// src/components/mobile/Drawer.tsx
import { X } from 'lucide-react';
import { useTheme } from '@/theme';
import { useEffect, useRef } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
}

export function Drawer({ isOpen, onClose, children, side = 'left' }: DrawerProps) {
  const { theme } = useTheme();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll cuando drawer está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: theme.zIndex.drawer,
          animation: 'fadeIn 200ms ease-out',
        }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          [side]: 0,
          width: '85%',
          maxWidth: '320px',
          backgroundColor: theme.colors.neutral[0],
          boxShadow: theme.elevation.xl,
          zIndex: Number(theme.zIndex.drawer) + 1,
          display: 'flex',
          flexDirection: 'column',
          animation: `slideIn${side === 'left' ? 'Left' : 'Right'} 250ms ease-out`,
        }}
      >
        {/* Close button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: theme.spacing[4],
            borderBottom: `1px solid ${theme.colors.neutral[200]}`,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: theme.spacing[2],
              color: theme.colors.neutral[700],
            }}
            aria-label="Cerrar menú"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
```

#### Paso 2.3: BottomNav

```typescript
// src/components/mobile/BottomNav.tsx
import { MessageSquare, Users, Wrench, Puzzle } from 'lucide-react';
import { useTheme } from '@/theme';
import { useWorkspaceStore } from '@/store/workspace';

export function BottomNav() {
  const { theme } = useTheme();
  const { activeActivity, setActivity } = useWorkspaceStore();

  const navItems = [
    { id: 'messages' as const, icon: MessageSquare, label: 'Mensajes' },
    { id: 'contacts' as const, icon: Users, label: 'Contactos' },
    { id: 'tools' as const, icon: Wrench, label: 'Herramientas' },
    { id: 'plugins' as const, icon: Puzzle, label: 'Plugins' },
  ];

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: theme.colors.neutral[0],
        borderTop: `1px solid ${theme.colors.neutral[200]}`,
        paddingTop: theme.spacing[2],
        paddingBottom: theme.spacing[2],
        // Safe area para iPhone con notch
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeActivity === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActivity(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: theme.spacing[1],
              padding: theme.spacing[2],
              minWidth: '64px',
              color: isActive ? theme.colors.primary[500] : theme.colors.neutral[600],
              transition: `color ${theme.transitions.fast}`,
            }}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span
              style={{
                fontSize: theme.typography.sizes.xs,
                fontWeight: isActive
                  ? theme.typography.weights.semibold
                  : theme.typography.weights.normal,
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
```

#### Paso 2.4: MobileWorkspace

```typescript
// src/components/mobile/MobileWorkspace.tsx
import { useState } from 'react';
import { MobileHeader } from './MobileHeader';
import { Drawer } from './Drawer';
import { BottomNav } from './BottomNav';
import PrimarySidebar from '@components/workspace/PrimarySidebar';
import Canvas from '@components/workspace/Canvas';
import { useWorkspaceStore } from '@/store/workspace';
import { useTheme } from '@/theme';

export function MobileWorkspace() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { activeActivity } = useWorkspaceStore();
  const { theme } = useTheme();

  const getTitleForActivity = () => {
    switch (activeActivity) {
      case 'messages': return 'Mensajes';
      case 'contacts': return 'Contactos';
      case 'tools': return 'Herramientas';
      case 'plugins': return 'Plugins';
      default: return 'FluxCore';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: theme.colors.neutral[50],
      }}
    >
      {/* Header fijo */}
      <MobileHeader
        title={getTitleForActivity()}
        onMenuClick={() => setDrawerOpen(true)}
      />

      {/* Canvas (área de trabajo principal) */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <Canvas />
      </div>

      {/* Bottom navigation fija */}
      <BottomNav />

      {/* Drawer (sidebar como overlay) */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <PrimarySidebar />
      </Drawer>
    </div>
  );
}
```

#### Paso 2.5: Integrar en Workspace Principal

```typescript
// src/components/workspace/Workspace.tsx (modificado)
import { useIsMobile } from '@/hooks/useBreakpoint';
import { MobileWorkspace } from '@components/mobile/MobileWorkspace';
import ActivityBar from './ActivityBar';
import PrimarySidebar from './PrimarySidebar';
import Canvas from './Canvas';
import { useWebSocket } from '@hooks/useWebSocket';
import { useStore } from '@/store';
import type { Message, WebSocketMessage } from '@/types';
import { useCallback } from 'react';
import { useTheme } from '@/theme';

export default function Workspace() {
  const isMobile = useIsMobile();
  const addMessage = useStore((state) => state.actions.addMessage);
  const setConnectionStatus = useStore((state) => state.actions.setConnectionStatus);
  const { theme } = useTheme();

  // WebSocket message handler (común para mobile y desktop)
  const handleWebSocketMessage = useCallback(
    (msg: WebSocketMessage) => {
      console.log('WebSocket message:', msg);

      if (msg.type === 'new_message' && msg.data) {
        const newMessage = msg.data as Message;
        const conversationId = 'conv-1';
        addMessage(conversationId, newMessage);
      }
    },
    [addMessage]
  );

  const { connected } = useWebSocket({
    onMessage: handleWebSocketMessage,
  });

  useCallback(() => {
    setConnectionStatus(connected ? 'connected' : 'disconnected');
  }, [connected, setConnectionStatus])();

  // ROUTING: Mobile vs Desktop
  if (isMobile) {
    return <MobileWorkspace />;
  }

  // Desktop layout (existente)
  return (
    <div
      className="h-screen flex"
      style={{
        backgroundColor: theme.colors.neutral[50],
      }}
    >
      <div className="flex-shrink-0">
        <ActivityBar />
      </div>
      <PrimarySidebar />
      <Canvas />
    </div>
  );
}
```

#### Paso 2.6: Agregar animaciones CSS

```css
/* src/styles/animations.css */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Safe area para dispositivos con notch */
@supports (padding: max(0px)) {
  .safe-area-bottom {
    padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  }
}
```

```typescript
// src/styles/index.css (agregar import)
@import './animations.css';
```

---

### 🟡 Día 6-7: Sistema de Feedback Visual

**Objetivo**: Implementar toasts, skeletons y confirmaciones.

#### Paso 3.1: Toast System

```typescript
// src/components/common/Toast.tsx
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useTheme } from '@/theme';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number; // ms, null = no auto-close
  onClose: () => void;
}

export function Toast({
  id,
  type,
  title,
  message,
  action,
  duration = 5000,
  onClose,
}: ToastProps) {
  const { theme } = useTheme();

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: theme.colors.semantic.success,
    error: theme.colors.semantic.danger,
    warning: theme.colors.semantic.warning,
    info: theme.colors.primary[500],
  };

  const backgrounds = {
    success: theme.colors.semantic.successLight,
    error: theme.colors.semantic.dangerLight,
    warning: theme.colors.semantic.warningLight,
    info: theme.colors.primary[50],
  };

  const Icon = icons[type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        gap: theme.spacing[3],
        padding: theme.spacing[4],
        backgroundColor: theme.colors.neutral[0],
        border: `1px solid ${colors[type]}`,
        borderRadius: theme.radius.lg,
        boxShadow: theme.elevation.lg,
        minWidth: '320px',
        maxWidth: '420px',
        animation: 'slideInRight 250ms ease-out',
      }}
    >
      {/* Icon */}
      <div
        style={{
          flexShrink: 0,
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: backgrounds[type],
          borderRadius: theme.radius.full,
        }}
      >
        <Icon size={20} style={{ color: colors[type] }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <h4
          style={{
            fontSize: theme.typography.sizes.base,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing[1],
          }}
        >
          {title}
        </h4>
        <p
          style={{
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.neutral[600],
            lineHeight: theme.typography.lineHeights.relaxed,
          }}
        >
          {message}
        </p>

        {/* Action */}
        {action && (
          <button
            onClick={action.onClick}
            style={{
              marginTop: theme.spacing[2],
              padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
              backgroundColor: colors[type],
              color: theme.colors.neutral[0],
              borderRadius: theme.radius.md,
              fontSize: theme.typography.sizes.sm,
              fontWeight: theme.typography.weights.semibold,
            }}
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          flexShrink: 0,
          padding: theme.spacing[1],
          color: theme.colors.neutral[500],
        }}
        aria-label="Cerrar notificación"
      >
        <X size={18} />
      </button>
    </div>
  );
}
```

```typescript
// src/components/common/ToastContainer.tsx
import { Toast, ToastProps } from './Toast';
import { useTheme } from '@/theme';

interface ToastContainerProps {
  toasts: ToastProps[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  const { theme } = useTheme();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: theme.spacing[4],
        right: theme.spacing[4],
        zIndex: theme.zIndex.toast,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing[3],
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <Toast {...toast} />
        </div>
      ))}
    </div>
  );
}
```

```typescript
// src/hooks/useToast.ts
import { create } from 'zustand';
import type { ToastProps, ToastType } from '@components/common/Toast';

interface ToastStore {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id,
          onClose: () => set((s) => ({
            toasts: s.toasts.filter((t) => t.id !== id),
          })),
        },
      ],
    }));

    // Auto-remove después de 5s si no tiene duration personalizado
    if (toast.duration !== null) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, toast.duration || 5000);
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// Helper hook
export function useToast() {
  const addToast = useToastStore((state) => state.addToast);

  return {
    toast: {
      success: (title: string, message: string) =>
        addToast({ type: 'success', title, message }),
      error: (title: string, message: string) =>
        addToast({ type: 'error', title, message }),
      warning: (title: string, message: string) =>
        addToast({ type: 'warning', title, message }),
      info: (title: string, message: string) =>
        addToast({ type: 'info', title, message }),
    },
  };
}
```

#### Paso 3.2: Skeleton Loaders

```typescript
// src/components/common/Skeleton.tsx
import { useTheme } from '@/theme';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = '20px', circle, style }: SkeletonProps) {
  const { theme } = useTheme();

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: theme.colors.neutral[200],
        borderRadius: circle ? '50%' : theme.radius.md,
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        ...style,
      }}
    />
  );
}

// Skeleton para ChatArea
export function ChatAreaSkeleton() {
  const { theme } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: theme.spacing[4],
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', gap: theme.spacing[3], marginBottom: theme.spacing[6] }}>
        <Skeleton width="48px" height="48px" circle />
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height="20px" style={{ marginBottom: theme.spacing[2] }} />
          <Skeleton width="40%" height="16px" />
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end',
              marginBottom: theme.spacing[4],
            }}
          >
            <Skeleton
              width={`${60 + Math.random() * 20}%`}
              height="80px"
              style={{ maxWidth: '400px' }}
            />
          </div>
        ))}
      </div>

      {/* Input */}
      <Skeleton height="48px" />
    </div>
  );
}

// Skeleton para ConversationList
export function ConversationListSkeleton() {
  const { theme } = useTheme();

  return (
    <div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: theme.spacing[3],
            padding: theme.spacing[4],
            borderBottom: `1px solid ${theme.colors.neutral[200]}`,
          }}
        >
          <Skeleton width="40px" height="40px" circle />
          <div style={{ flex: 1 }}>
            <Skeleton width="70%" height="16px" style={{ marginBottom: theme.spacing[2] }} />
            <Skeleton width="90%" height="14px" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

### 🟠 Día 8: Error Boundary

```typescript
// src/components/common/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });

    // TODO: Enviar a servicio de logging (Sentry, etc.)
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
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// Error Fallback UI
function ErrorFallback({
  error,
  errorInfo,
  onReset,
}: {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onReset: () => void;
}) {
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
      }}
    >
      <AlertCircle size={64} style={{ color: '#ef4444', marginBottom: '1rem' }} />
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        Algo salió mal
      </h1>
      <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '2rem', maxWidth: '500px' }}>
        La aplicación encontró un error inesperado. Puedes intentar recargar la página.
      </p>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={onReset}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '0.5rem',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'white',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Recargar página
        </button>
      </div>

      {/* Detalles técnicos */}
      {error && (
        <details style={{ marginTop: '2rem', maxWidth: '600px', width: '100%' }}>
          <summary style={{ cursor: 'pointer', color: '#6b7280', marginBottom: '0.5rem' }}>
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
            }}
          >
            {error.toString()}
            {'\n\n'}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}
```

Integrar en App.tsx:

```typescript
// src/App.tsx
import { ErrorBoundary } from '@components/common/ErrorBoundary';
import { ToastContainer } from '@components/common/ToastContainer';
import { useToastStore } from '@/hooks/useToast';
import Workspace from '@components/workspace/Workspace';
import './styles/App.css';

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
```

---

## Sprint 2: Performance y Navegación (Semana 3-4)

### 🟡 Día 1-2: Virtualización en MessageList

```bash
# Instalar dependencia
npm install @tanstack/react-virtual
```

```typescript
// src/components/chat/MessageList.tsx (refactorizado)
import { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMessages } from '@/store';
import { useTheme } from '@/theme';
import type { Message } from '@/types';
import { Badge } from '@/components/common';

// Memoizar MessageBubble
const MessageBubble = React.memo(
  ({ message, theme }: { message: Message; theme: any }) => {
    // ... (código existente de MessageBubble)
  },
  (prevProps, nextProps) => {
    // Solo re-renderizar si el mensaje cambió
    return prevProps.message.id === nextProps.message.id;
  }
);

export default function MessageList({ conversationId }: { conversationId: string }) {
  const messages = useMessages(conversationId);
  const { theme } = useTheme();
  const parentRef = useRef<HTMLDivElement>(null);

  // Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimación de altura por mensaje
    overscan: 5, // Renderizar 5 items extra arriba/abajo
  });

  // Auto-scroll al final cuando llegan mensajes nuevos
  useEffect(() => {
    if (messages.length > 0) {
      rowVirtualizer.scrollToIndex(messages.length - 1, {
        align: 'end',
        behavior: 'smooth',
      });
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ backgroundColor: theme.colors.neutral[50] }}
      >
        <div className="text-center" style={{ color: theme.colors.neutral[600] }}>
          <p style={{ fontSize: theme.typography.sizes.lg, marginBottom: theme.spacing[2] }}>
            No hay mensajes
          </p>
          <p style={{ fontSize: theme.typography.sizes.sm }}>
            Envía tu primer mensaje
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-full overflow-y-auto px-6 py-4"
      style={{ backgroundColor: theme.colors.neutral[50] }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const message = messages[virtualRow.index];
          return (
            <div
              key={message.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <MessageBubble message={message} theme={theme} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

### 🟡 Día 3-4: Code Splitting

```typescript
// src/App.tsx (con lazy loading)
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from '@components/common/ErrorBoundary';
import { ChatAreaSkeleton } from '@components/common/Skeleton';
import './styles/App.css';

// Lazy load componentes pesados
const Workspace = lazy(() => import('@components/workspace/Workspace'));
const ThemeEditorArea = lazy(() => import('@components/tools/ThemeEditorArea'));

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Cargando...</div>}>
        <Workspace />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
```

---

## Checklist de Validación

### ✅ Sprint 1 Completado
- [ ] Breakpoint system funcionando en mobile/tablet/desktop
- [ ] MobileWorkspace renderiza correctamente en < 768px
- [ ] Drawer se abre/cierra con animación suave
- [ ] BottomNav funciona y cambia secciones
- [ ] Toast system muestra success/error/warning/info
- [ ] Skeletons aparecen durante carga
- [ ] ErrorBoundary captura errores sin crash

### ✅ Sprint 2 Completado
- [ ] MessageList con 500+ mensajes scrollea fluido (FPS > 50)
- [ ] Code splitting reduce bundle inicial en 30%+
- [ ] Lighthouse Performance score > 85

---

## Métricas de Éxito

| Métrica | Antes | Después | Objetivo |
|---------|-------|---------|----------|
| Mobile Usability | 0% | 100% | ✅ |
| Lighthouse Performance | 70 | 90+ | ✅ |
| Bundle Size | 180KB | <120KB | ✅ |
| TTI | 2.5s | <2.0s | ✅ |

---

**Este plan proporciona código copy-paste listo para implementar. Cada paso es independiente y puede testearse aisladamente.**

