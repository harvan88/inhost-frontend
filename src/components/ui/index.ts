/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "C:\Users\harva\Documents\Trabajos\meetgar\FluxCoreChat\inhost-frontend\src\components\ui\index.ts"
 *   type: "type"
 *   layer: "frontend"
 *   domain: "ui"
 *   purpose: "Barrel export for ui module"
 *
 * DEPENDENCIES:
 *   internal: []
 *   external: []
 *   infrastructure: []
 *
 * CONTRACTS:
 *   exports: ["Button","Card","Heading","IconButton","Input","ListCard","Tag","Text"]
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
 * UI Components - Atomic Design System
 *
 * Componentes atómicos reutilizables del design system FluxCore.
 * Todos los componentes usan 100% tokens del theme.
 *
 * @module components/ui
 */

// Button
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

// Heading
export { Heading } from './Heading';
export type { HeadingProps, HeadingLevel, HeadingColor } from './Heading';

// Text
export { Text } from './Text';
export type { TextProps, TextVariant, TextColor, TextElement } from './Text';

// Input
export { Input } from './Input';
export type { InputProps, InputVariant } from './Input';

// Card
export { Card } from './Card';
export type { CardProps, CardSize, CardElevation } from './Card';

// IconButton
export { IconButton } from './IconButton';
export type { IconButtonProps, IconButtonVariant, IconButtonSize } from './IconButton';

// ListCard
export { ListCard } from './ListCard';
export type { ListCardProps } from './ListCard';

// Tag
export { Tag } from './Tag';
export type { TagProps, TagSize, TagColor } from './Tag';
