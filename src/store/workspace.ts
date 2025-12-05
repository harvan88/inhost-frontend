/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "store/workspace.ts"
 *   type: "store"
 *   layer: "frontend"
 *   domain: "ui"
 *   purpose: "Store de Zustand que gestiona el estado completo del workspace VS Code-inspired: 3 niveles (Activity Bar, Sidebar, Canvas con contenedores dinámicos y tabs). Persiste en localStorage el layout definido por usuario"
 *
 * DEPENDENCIES:
 *   internal: []
 *   external: ["zustand","zustand/middleware"]
 *   infrastructure: ["localStorage"]
 *
 * CONTRACTS:
 *   exports: ["DynamicContainer","WorkspaceTab","useActiveContainer","useActiveTab","useContainer","useTabCount","useWorkspaceStore"]
 *   inputs: []
 *   outputs: ["WorkspaceState", "DynamicContainer[]", "WorkspaceTab[]", "selectors"]
 *   errors: []
 *
 * INTEGRATION:
 *   data_flow: "[user interactions] → [workspace actions] → [localStorage persist] → [UI components re-render]"
 *   events_emitted: []
 *   events_consumed: []
 *
 * IMPACT:
 *   used_by: ["components/workspace/ActivityBar.tsx", "components/workspace/PrimarySidebar.tsx", "components/workspace/Canvas.tsx", "components/workspace/DynamicContainer.tsx"]
 *   uses: ["zustand","zustand/middleware"]
 *   critical: true
 *
 * === DOC_END :: workspace.ts ===
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { workspaceSyncService, type LayoutData } from '../services/workspace-sync';

/**
 * Workspace Tab - represents an open tool/view within a Dynamic Container
 */
export interface WorkspaceTab {
  id: string;
  type: 'conversation' | 'order' | 'customer_profile' | 'analytics' | 'theme_editor' | 'team' | 'account_settings' | 'integrations' | 'extension';
  label: string;
  entityId: string; // conversationId, orderId, customerId, extensionId, etc.
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
  // ━━━ NIVEL 1: BARRA DE ACTIVIDAD (ACTIVITY BAR) ━━━
  activeActivity: 'messages' | 'contacts' | 'tools' | 'plugins' | 'settings' | null;
  setActivity: (activity: 'messages' | 'contacts' | 'tools' | 'plugins' | 'settings') => void;

  // ━━━ NIVEL 2: BARRA LATERAL CONTEXTUAL (SIDEBAR) ━━━
  sidebarVisible: boolean;
  sidebarWidth: number;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;

  // ━━━ NIVEL 3: LIENZO (CANVAS) ━━━
  containers: DynamicContainer[];
  activeContainerId: string | null;

  // Canvas Actions (máximo 3 contenedores)
  createContainer: () => void;
  closeContainer: (containerId: string) => void;
  setActiveContainer: (containerId: string) => void;
  duplicateContainer: (containerId: string) => void;
  adjustContainerWidths: () => void; // CONTRATO: Redistribuir anchos proporcionalmente

  // Container Actions (operate on active container)
  openTab: (tab: WorkspaceTab, containerId?: string) => void;
  closeTab: (tabId: string, containerId?: string) => void;
  setActiveTab: (tabId: string, containerId?: string) => void;

  // ━━━ SYNC CROSS-DEVICE ━━━
  version: number;
  loadRemoteLayout: () => Promise<void>;
  saveCurrentLayout: () => Promise<void>;
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
      containers: [
        {
          id: 'container-1',
          tabs: [],
          activeTabId: null,
        },
      ],
      activeContainerId: 'container-1',
      version: 0,

      // ━━━ ACTIONS ━━━

      // Nivel 1: Barra de Actividad
      // Toggle Contextual: Click en dominio activo oculta/muestra sidebar
      setActivity: (activity) =>
        set((state) => {
          // Si se hace click en el mismo dominio activo, toggle sidebar
          if (state.activeActivity === activity) {
            return { sidebarVisible: !state.sidebarVisible };
          }
          // Si es un dominio diferente, activar y mostrar sidebar
          return {
            activeActivity: activity,
            sidebarVisible: true,
          };
        }),

      // Nivel 2: Barra Lateral Contextual
      toggleSidebar: () =>
        set((state) => ({
          sidebarVisible: !state.sidebarVisible,
        })),

      setSidebarWidth: (width) => set({ sidebarWidth: width }),

      // Nivel 3: Lienzo (Canvas) - Container Management
      // Crear nuevo contenedor (máximo 3)
      createContainer: () =>
        set((state) => {
          // Solo permitir máximo 3 contenedores
          if (state.containers.length >= 3) {
            return state;
          }

          const newContainer: DynamicContainer = {
            id: `container-${Date.now()}`,
            tabs: [],
            activeTabId: null,
          };

          const newContainers = [...state.containers, newContainer];

          // CONTRATO: Redistribuir anchos proporcionalmente
          const equalWidth = `${100 / newContainers.length}%`;
          const adjustedContainers = newContainers.map((c) => ({
            ...c,
            width: equalWidth,
          }));

          return {
            containers: adjustedContainers,
            activeContainerId: newContainer.id,
          };
        }),

      closeContainer: (containerId) =>
        set((state) => {
          const newContainers = state.containers.filter((c) => c.id !== containerId);

          // If no containers left, create a default one
          if (newContainers.length === 0) {
            return {
              containers: [{ id: 'container-1', tabs: [], activeTabId: null, width: '100%' }],
              activeContainerId: 'container-1',
            };
          }

          // If we closed the active container, activate another one
          let newActiveContainer = state.activeContainerId;
          if (state.activeContainerId === containerId) {
            newActiveContainer = newContainers[newContainers.length - 1].id;
          }

          // CONTRATO: Redistribuir anchos proporcionalmente
          const equalWidth = `${100 / newContainers.length}%`;
          const adjustedContainers = newContainers.map((c) => ({
            ...c,
            width: equalWidth,
          }));

          return {
            containers: adjustedContainers,
            activeContainerId: newActiveContainer,
          };
        }),

      setActiveContainer: (containerId) =>
        set({ activeContainerId: containerId }),

      // Duplicar contenedor (Sección 6.2) - máximo 3 contenedores
      duplicateContainer: (containerId) =>
        set((state) => {
          // Solo permitir máximo 3 contenedores
          if (state.containers.length >= 3) {
            return state;
          }

          const sourceContainer = state.containers.find((c) => c.id === containerId);
          if (!sourceContainer) return state;

          // Create duplicate with same tabs
          const newContainer: DynamicContainer = {
            id: `container-${Date.now()}`,
            tabs: [...sourceContainer.tabs], // Copy tabs
            activeTabId: sourceContainer.activeTabId,
          };

          const newContainers = [...state.containers, newContainer];

          // CONTRATO: Redistribuir anchos proporcionalmente
          const equalWidth = `${100 / newContainers.length}%`;
          const adjustedContainers = newContainers.map((c) => ({
            ...c,
            width: equalWidth,
          }));

          return {
            containers: adjustedContainers,
            activeContainerId: newContainer.id,
          };
        }),

      // CONTRATO: "Si lienzo se achica se achican proporcionalmente"
      // Redistribuir anchos de contenedores de manera equitativa
      adjustContainerWidths: () =>
        set((state) => {
          if (state.containers.length === 0) return state;

          // Calcular ancho equitativo
          const equalWidth = `${100 / state.containers.length}%`;

          // Actualizar todos los contenedores con ancho equitativo
          const adjustedContainers = state.containers.map((container) => ({
            ...container,
            width: equalWidth,
          }));

          return { containers: adjustedContainers };
        }),

      // Container Actions - operate on specific or active container
      openTab: (tab, containerId) =>
        set((state) => {
          console.log('[Workspace] openTab called', {
            tab,
            containerId,
            currentContainers: state.containers.length,
            activeContainerId: state.activeContainerId,
          });

          // LÓGICA MEJORADA según requerimientos:
          // 1. Si la tab está activa y se hace clic, cerrarla (retract)
          // 2. Si no especifica containerId:
          //    a. Buscar contenedor vacío (sin tabs) → abrir ahí
          //    b. Si no hay vacío → abrir en contenedor activo
          // 3. Si la tab ya existe en otro contenedor, activarla ahí

          // Verificar si la tab ya está activa en algún contenedor
          const activeContainer = state.containers.find(
            (c) => c.activeTabId === tab.id && c.tabs.some((t) => t.id === tab.id)
          );

          // Si está activa y se hace clic de nuevo, cerrarla (toggle behavior)
          if (activeContainer) {
            return {
              containers: state.containers.map((container) => {
                if (container.id !== activeContainer.id) return container;

                const newTabs = container.tabs.filter((t) => t.id !== tab.id);
                const newActiveTab = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;

                return {
                  ...container,
                  tabs: newTabs,
                  activeTabId: newActiveTab,
                };
              }),
            };
          }

          // Determinar contenedor target
          let targetContainerId = containerId;

          if (!targetContainerId) {
            // Buscar contenedor vacío
            const emptyContainer = state.containers.find((c) => c.tabs.length === 0);

            if (emptyContainer) {
              targetContainerId = emptyContainer.id;
            } else {
              // No hay vacío, usar activo
              targetContainerId = state.activeContainerId;
            }
          }

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

      // ━━━ SYNC CROSS-DEVICE ACTIONS ━━━

      /**
       * Cargar layout desde backend (solo al login)
       */
      loadRemoteLayout: async () => {
        const remoteLayout = await workspaceSyncService.loadRemoteLayout();

        if (remoteLayout) {
          const currentState = get();
          const localVersion = currentState.version || 0;

          // Si remote es más nuevo que local, aplicar
          if (remoteLayout.version > localVersion) {
            // Validar que containers sea un array válido
            const validContainers = Array.isArray(remoteLayout.containers) && remoteLayout.containers.length > 0
              ? remoteLayout.containers
              : currentState.containers;

            // Validar que activeContainerId sea válido
            const validActiveContainerId = remoteLayout.activeContainerId &&
              validContainers.some((c: any) => c.id === remoteLayout.activeContainerId)
              ? remoteLayout.activeContainerId
              : validContainers[0]?.id || 'container-1';

            set({
              activeActivity: remoteLayout.activeActivity as any,
              sidebarVisible: remoteLayout.sidebarVisible,
              sidebarWidth: remoteLayout.sidebarWidth,
              containers: validContainers,
              activeContainerId: validActiveContainerId,
              version: remoteLayout.version,
            });

            console.info('[Workspace] Remote layout applied', {
              version: remoteLayout.version,
              containers: validContainers.length,
              activeContainerId: validActiveContainerId,
            });
          } else {
            console.info('[Workspace] Local layout is up-to-date', {
              localVersion,
              remoteVersion: remoteLayout.version,
            });
          }
        }
      },

      /**
       * Guardar layout actual en backend (llamado al cerrar)
       */
      saveCurrentLayout: async () => {
        const state = get();
        const layoutData: LayoutData = {
          version: Date.now(),
          activeActivity: state.activeActivity || 'messages',
          sidebarVisible: state.sidebarVisible,
          sidebarWidth: state.sidebarWidth,
          containers: state.containers,
          activeContainerId: state.activeContainerId,
        };

        await workspaceSyncService.saveRemoteLayoutOnClose(layoutData);
      },
    }),
    {
      name: 'inhost-workspace',
      version: 2, // ← Incrementado para forzar migración de estados corruptos
      // Persistir layout completo + version
      partialize: (state) => ({
        activeActivity: state.activeActivity,
        sidebarVisible: state.sidebarVisible,
        sidebarWidth: state.sidebarWidth,
        containers: state.containers,
        activeContainerId: state.activeContainerId,
        version: state.version,
      }),
      // Callback post-hidratación: GARANTIZA contenedores válidos siempre
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        
        const defaultContainer = { id: 'container-1', tabs: [], activeTabId: null, width: '100%' };
        
        // Si no hay contenedores, crear uno por defecto
        if (!state.containers || state.containers.length === 0) {
          console.warn('[Workspace] No containers found after rehydration, creating default');
          state.containers = [defaultContainer];
          state.activeContainerId = 'container-1';
        }
        
        // Si activeContainerId no es válido, usar el primero
        if (!state.activeContainerId || !state.containers.some(c => c.id === state.activeContainerId)) {
          console.warn('[Workspace] Invalid activeContainerId, using first container');
          state.activeContainerId = state.containers[0]?.id || 'container-1';
        }
        
        console.info('[Workspace] Rehydrated', {
          containers: state.containers.length,
          activeContainerId: state.activeContainerId,
        });
      },
      // Migración para versiones antiguas
      // IMPORTANTE: Garantizar SIEMPRE al menos 1 contenedor válido
      migrate: (persistedState: any, version: number) => {
        console.log('[Workspace] Migration running', { fromVersion: version, toVersion: 2 });
        
        const defaultContainer = { id: 'container-1', tabs: [], activeTabId: null, width: '100%' };
        
        // Validar containers - debe ser array con al menos 1 elemento
        const validContainers = Array.isArray(persistedState.containers) && persistedState.containers.length > 0
          ? persistedState.containers
          : [defaultContainer];

        // Validar activeContainerId - debe existir en containers
        const validActiveContainerId = persistedState.activeContainerId && 
          validContainers.some((c: any) => c.id === persistedState.activeContainerId)
          ? persistedState.activeContainerId
          : validContainers[0].id;

        // Para CUALQUIER versión anterior, asegurar containers válidos
        return {
          ...persistedState,
          containers: validContainers,
          activeContainerId: validActiveContainerId,
        };
      },
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
