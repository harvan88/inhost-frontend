/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "C:\Users\harva\Documents\Trabajos\meetgar\FluxCoreChat\inhost-frontend\src\components\workspace\index.ts"
 *   type: "utility"
 *   layer: "frontend"
 *   domain: "ui"
 *   purpose: "Barrel export for workspace module"
 *
 * DEPENDENCIES:
 *   internal: []
 *   external: []
 *   infrastructure: []
 *
 * CONTRACTS:
 *   exports: ["default"]
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
 * Workspace components barrel export
 */
export { default as Workspace } from './Workspace';
export { default as ActivityBar } from './ActivityBar';
export { default as PrimarySidebar } from './PrimarySidebar';
export { default as EditorGroups } from './EditorGroups';
export { default as ToolPanels } from './ToolPanels';
export { default as ConversationListItem } from './ConversationListItem';
