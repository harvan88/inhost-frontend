import type { WorkspaceTab } from '@/store/workspace';

/**
 * Tab Helpers - Fuente de Verdad Única para Tab IDs
 *
 * Este módulo centraliza la lógica de generación de IDs de tabs
 * para garantizar consistencia en toda la aplicación.
 *
 * **Principio fundamental:**
 * - Un tab ID debe ser PREDECIBLE y basado solo en type + entityId
 * - NO usar timestamps, random, o valores dinámicos
 * - Esto permite detectar tabs duplicadas correctamente
 */

/**
 * Genera un ID de tab predecible basado en type y entityId
 *
 * @param type - Tipo de tab
 * @param entityId - ID de la entidad (conversationId, toolId, etc.)
 * @returns Tab ID único y predecible
 *
 * @example
 * generateTabId('conversation', 'conv-123') // => 'chat-conv-123'
 * generateTabId('theme_editor', 'theme-editor') // => 'tool-theme-editor'
 * generateTabId('analytics', 'analytics') // => 'tool-analytics'
 */
export function generateTabId(
  type: WorkspaceTab['type'],
  entityId: string
): string {
  const prefixes: Record<WorkspaceTab['type'], string> = {
    conversation: 'chat',
    order: 'order',
    customer_profile: 'customer',
    analytics: 'tool',
    theme_editor: 'tool',
  };

  const prefix = prefixes[type] || 'tab';
  return `${prefix}-${entityId}`;
}

/**
 * Crea un objeto WorkspaceTab completo con ID predecible
 *
 * @param params - Parámetros de la tab
 * @returns WorkspaceTab con ID generado automáticamente
 *
 * @example
 * createTab({
 *   type: 'conversation',
 *   entityId: 'conv-123',
 *   label: 'Juan Pérez',
 *   closable: true
 * })
 */
export function createTab(params: {
  type: WorkspaceTab['type'];
  entityId: string;
  label: string;
  icon?: string;
  closable?: boolean;
}): WorkspaceTab {
  return {
    id: generateTabId(params.type, params.entityId),
    type: params.type,
    entityId: params.entityId,
    label: params.label,
    icon: params.icon,
    closable: params.closable ?? true,
  };
}

/**
 * Verifica si una tab está activa en un contenedor
 *
 * @param activeTabId - ID de la tab activa del contenedor
 * @param type - Tipo de tab a verificar
 * @param entityId - ID de la entidad
 * @returns true si la tab está activa
 *
 * @example
 * isTabActive(activeContainer.activeTabId, 'conversation', 'conv-123')
 */
export function isTabActive(
  activeTabId: string | null,
  type: WorkspaceTab['type'],
  entityId: string
): boolean {
  if (!activeTabId) return false;
  return activeTabId === generateTabId(type, entityId);
}
