import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Workspace Tab - represents an open conversation or tool in the editor area
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
 * Workspace State - manages the multi-tab workspace layout
 */
interface WorkspaceState {
  // ━━━ ACTIVITY BAR ━━━
  activeActivity: 'messages' | 'analytics' | 'contacts' | 'settings';
  setActivity: (activity: 'messages' | 'analytics' | 'contacts' | 'settings') => void;

  // ━━━ PRIMARY SIDEBAR ━━━
  sidebarVisible: boolean;
  sidebarWidth: number;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;

  // ━━━ EDITOR GROUPS (TABS) ━━━
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  openTab: (tab: WorkspaceTab) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;

  // ━━━ TOOL PANELS ━━━
  panelVisible: boolean;
  panelWidth: number;
  collapsedTools: Set<string>;
  togglePanel: () => void;
  setPanelWidth: (width: number) => void;
  toggleTool: (toolId: string) => void;
}

/**
 * Workspace Store - Zustand store for workspace UI state
 */
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      // ━━━ INITIAL STATE ━━━
      activeActivity: 'messages',
      sidebarVisible: true,
      sidebarWidth: 320,
      tabs: [],
      activeTabId: null,
      panelVisible: true,
      panelWidth: 350,
      collapsedTools: new Set(),

      // ━━━ ACTIONS ━━━

      // Activity Bar
      setActivity: (activity) => set({ activeActivity: activity }),

      // Sidebar
      toggleSidebar: () =>
        set((state) => ({
          sidebarVisible: !state.sidebarVisible,
        })),

      setSidebarWidth: (width) => set({ sidebarWidth: width }),

      // Editor Groups (Tabs)
      openTab: (tab) =>
        set((state) => {
          // Si la tab ya existe, solo activarla
          const existing = state.tabs.find((t) => t.id === tab.id);
          if (existing) {
            return { activeTabId: tab.id };
          }

          // Añadir nueva tab
          return {
            tabs: [...state.tabs, tab],
            activeTabId: tab.id,
          };
        }),

      closeTab: (tabId) =>
        set((state) => {
          const newTabs = state.tabs.filter((t) => t.id !== tabId);

          // Si cerramos la tab activa, activar la última tab disponible
          let newActiveTab = state.activeTabId;
          if (state.activeTabId === tabId) {
            newActiveTab = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
          }

          return {
            tabs: newTabs,
            activeTabId: newActiveTab,
          };
        }),

      setActiveTab: (tabId) => set({ activeTabId: tabId }),

      // Tool Panels
      togglePanel: () =>
        set((state) => ({
          panelVisible: !state.panelVisible,
        })),

      setPanelWidth: (width) => set({ panelWidth: width }),

      toggleTool: (toolId) =>
        set((state) => {
          const newCollapsed = new Set(state.collapsedTools);
          if (newCollapsed.has(toolId)) {
            newCollapsed.delete(toolId);
          } else {
            newCollapsed.add(toolId);
          }
          return { collapsedTools: newCollapsed };
        }),
    }),
    {
      name: 'inhost-workspace',
      // Solo persistir layout preferences, NO las tabs (se recargan del server)
      partialize: (state) => ({
        sidebarVisible: state.sidebarVisible,
        sidebarWidth: state.sidebarWidth,
        panelVisible: state.panelVisible,
        panelWidth: state.panelWidth,
        activeActivity: state.activeActivity,
      }),
    }
  )
);

/**
 * Selector hooks
 */
export const useActiveTab = () => {
  const { tabs, activeTabId } = useWorkspaceStore();
  return tabs.find((t) => t.id === activeTabId);
};

export const useTabCount = () => useWorkspaceStore((state) => state.tabs.length);
