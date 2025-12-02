/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "C:\Users\harva\Documents\Trabajos\meetgar\FluxCoreChat\inhost-frontend\src\components\mobile\index.ts"
 *   type: "type"
 *   layer: "frontend"
 *   domain: "ui"
 *   purpose: "Barrel export for mobile module"
 *
 * DEPENDENCIES:
 *   internal: []
 *   external: []
 *   infrastructure: []
 *
 * CONTRACTS:
 *   exports: ["Drawer","MobileHeader","MobileWorkspace"]
 *   inputs: "None"
 *   outputs: "void"
 *   errors: "None"
 *
 * INTEGRATION:
 *   data_flow: "Input → Processing → Output"
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
 * Mobile Components
 *
 * Componentes optimizados para dispositivos móviles.
 * Stack navigation, drawer lateral, touch targets de 44px+.
 *
 * @module components/mobile
 */

export { Drawer } from './Drawer';
export type { ActivityId } from './Drawer';

export { MobileHeader } from './MobileHeader';
export type { MobileHeaderVariant } from './MobileHeader';

export { MobileWorkspace } from './MobileWorkspace';
