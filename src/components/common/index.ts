/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "C:\Users\harva\Documents\Trabajos\meetgar\FluxCoreChat\inhost-frontend\src\components\common\index.ts"
 *   type: "utility"
 *   layer: "frontend"
 *   domain: "ui"
 *   purpose: "Barrel export for common module"
 *
 * DEPENDENCIES:
 *   internal: ["@/components/common"]
 *   external: []
 *   infrastructure: []
 *
 * CONTRACTS:
 *   exports: ["Avatar","Badge","StatusIndicator","parseSpacing"]
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
 *   uses: ["@/components/common"]
 *   critical: false
 *
 * === DOC_END :: index.ts ===
 */

/**
 * Common Components - Componentes Genéricos Reutilizables
 *
 * Exporta todos los componentes comunes que usan theme tokens.
 *
 * ## Uso:
 * ```tsx
 * import { Badge, StatusIndicator, Avatar } from '@/components/common';
 * ```
 */

export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

export { StatusIndicator } from './StatusIndicator';
export type { StatusIndicatorProps } from './StatusIndicator';

export { Avatar } from './Avatar';
export type { AvatarProps } from './Avatar';

export { parseSpacing } from './parseSpacing';
export type { ParsedSpacing } from './parseSpacing';
