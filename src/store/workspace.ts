import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Workspace Tab - represents an open tool/view within a Dynamic Container
 */
export interface WorkspaceTab {
  id: string;
  type: 'conversation' | 'order' | 'customer_profile' | 'analytics';
  label: string;
  entityId: string; // conversationId, orderId, customerId, etc.
  icon?: string;
  closable: boolean;
}

/**
 * Dynamic Container - represents a single container within the Canvas
 * Each container can hold multiple tabs (like VS Code editor groups)
 */
export interface DynamicContainer {
  id: string;
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  width?: string; // percentage for split views (e.g., "50%", "33%")
}

/**
 * Workspace State - manages the three-level workspace layout
 *
 * Arquitectura de Tres Niveles (Versión Formal):
 *
 * Nivel 1: Activity Bar → Selección de dominio
 * Nivel 2: Sidebar Contextual → Lista de entidades
 * Nivel 3: Lienzo (Canvas) → Alberga múltiples Contenedores Dinámicos
 *          ├─ Contenedor Dinámico 1 → Herramienta A (con tabs)
 *          ├─ Contenedor Dinámico 2 → Herramienta B (con tabs)
 *          └─ Contenedor Dinámico N → Herramienta N (con tabs)
 *
 * El Lienzo es una superficie estructural que permite:
 * - División del espacio (horizontal/vertical)
 * - Múltiples instancias de Contenedores Dinámicos
 * - Redimensionamiento manual de cada subdivisión
 * - Persistencia del layout definido por el usuario
 */
interface WorkspaceState {
  // ━━━ NIVEL 1: ACTIVITY BAR ━━━
  activeActivity: 'messages' | 'analytics' | 'contacts' | 'settings';
  setActivity: (activity: 'messages' | 'analytics' | 'contacts' | 'settings') => void;

  // ━━━ NIVEL 2: SIDEBAR CONTEXTUAL ━━━
  sidebarVisible: boolean;
  sidebarWidth: number;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;

  // ━━━ NIVEL 3: LIENZO (CANVAS) ━━━
  layout: 'single' | 'horizontal-split' | 'vertical-split';
  containers: DynamicContainer[];
  activeContainerId: string | null;

  // Canvas Actions
  splitCanvas: (direction: 'horizontal' | 'vertical') => void;
  closeContainer: (containerId: string) => void;
  setActiveContainer: (containerId: string) => void;

  // Container Actions (operate on active container)
  openTab: (tab: WorkspaceTab, containerId?: string) => void;
  closeTab: (tabId: string, containerId?: string) => void;
  setActiveTab: (tabId: string, containerId?: string) => void;
}

/**
 * Workspace Store - Zustand store for workspace UI state
 */
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      // ━━━ INITIAL STATE ━━━
      activeActivity: 'messages',
      sidebarVisible: true,
      sidebarWidth: 320,
      layout: 'single',
      containers: [
        {
          id: 'container-1',
          tabs: [],
          activeTabId: null,
        },
      ],
      activeContainerId: 'container-1',

      // ━━━ ACTIONS ━━━

      // Nivel 1: Activity Bar
      setActivity: (activity) => set({ activeActivity: activity }),

      // Nivel 2: Sidebar Contextual
      toggleSidebar: () =>
        set((state) => ({
          sidebarVisible: !state.sidebarVisible,
        })),

      setSidebarWidth: (width) => set({ sidebarWidth: width }),

      // Nivel 3: Lienzo (Canvas) - Container Management
      splitCanvas: (direction) =>
        set((state) => {
          const newContainer: DynamicContainer = {
            id: `container-${Date.now()}`,
            tabs: [],
            activeTabId: null,
            width: '50%',
          };

          // Update existing containers to 50% width
          const updatedContainers = state.containers.map((c) => ({
            ...c,
            width: '50%',
          }));

          return {
            layout: direction === 'horizontal' ? 'horizontal-split' : 'vertical-split',
            containers: [...updatedContainers, newContainer],
            activeContainerId: newContainer.id,
          };
        }),

      closeContainer: (containerId) =>
        set((state) => {
          const newContainers = state.containers.filter((c) => c.id !== containerId);

          // If no containers left, create a default one
          if (newContainers.length === 0) {
            return {
              layout: 'single',
              containers: [{ id: 'container-1', tabs: [], activeTabId: null }],
              activeContainerId: 'container-1',
            };
          }

          // Reset to single layout if only one container remains
          const newLayout = newContainers.length === 1 ? 'single' : state.layout;

          // If we closed the active container, activate another one
          let newActiveContainer = state.activeContainerId;
          if (state.activeContainerId === containerId) {
            newActiveContainer = newContainers[newContainers.length - 1].id;
          }

          return {
            layout: newLayout,
            containers: newContainers,
            activeContainerId: newActiveContainer,
          };
        }),

      setActiveContainer: (containerId) =>
        set({ activeContainerId: containerId }),

      // Container Actions - operate on specific or active container
      openTab: (tab, containerId) =>
        set((state) => {
          const targetContainerId = containerId || state.activeContainerId;
          if (!targetContainerId) return state;

          const updatedContainers = state.containers.map((container) => {
            if (container.id !== targetContainerId) return container;

            // Si la tab ya existe en este contenedor, solo activarla
            const existing = container.tabs.find((t) => t.id === tab.id);
            if (existing) {
              return { ...container, activeTabId: tab.id };
            }

            // Añadir nueva tab al contenedor
            return {
              ...container,
              tabs: [...container.tabs, tab],
              activeTabId: tab.id,
            };
          });

          return { containers: updatedContainers };
        }),

      closeTab: (tabId, containerId) =>
        set((state) => {
          const targetContainerId = containerId || state.activeContainerId;
          if (!targetContainerId) return state;

          const updatedContainers = state.containers.map((container) => {
            if (container.id !== targetContainerId) return container;

            const newTabs = container.tabs.filter((t) => t.id !== tabId);

            // Si cerramos la tab activa, activar la última tab disponible
            let newActiveTab = container.activeTabId;
            if (container.activeTabId === tabId) {
              newActiveTab = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
            }

            return {
              ...container,
              tabs: newTabs,
              activeTabId: newActiveTab,
            };
          });

          return { containers: updatedContainers };
        }),

      setActiveTab: (tabId, containerId) =>
        set((state) => {
          const targetContainerId = containerId || state.activeContainerId;
          if (!targetContainerId) return state;

          const updatedContainers = state.containers.map((container) => {
            if (container.id !== targetContainerId) return container;
            return { ...container, activeTabId: tabId };
          });

          return { containers: updatedContainers };
        }),
    }),
    {
      name: 'inhost-workspace',
      // Solo persistir layout preferences, NO las tabs (se recargan del server)
      partialize: (state) => ({
        sidebarVisible: state.sidebarVisible,
        sidebarWidth: state.sidebarWidth,
        activeActivity: state.activeActivity,
        layout: state.layout,
      }),
    }
  )
);

/**
 * Selector hooks
 */

// Get the active container
export const useActiveContainer = () => {
  const { containers, activeContainerId } = useWorkspaceStore();
  return containers.find((c) => c.id === activeContainerId);
};

// Get the active tab from the active container
export const useActiveTab = () => {
  const activeContainer = useActiveContainer();
  if (!activeContainer) return undefined;
  return activeContainer.tabs.find((t) => t.id === activeContainer.activeTabId);
};

// Get a specific container by ID
export const useContainer = (containerId: string) => {
  const { containers } = useWorkspaceStore();
  return containers.find((c) => c.id === containerId);
};

// Get total tab count across all containers
export const useTabCount = () => {
  const { containers } = useWorkspaceStore();
  return containers.reduce((total, container) => total + container.tabs.length, 0);
};
