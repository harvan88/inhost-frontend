/**
 * Sistema de Tema y Design Tokens - FluxCore
 *
 * ## Sección 8: Sistema de Tema y Design Tokens en FluxCore
 *
 * El sistema visual de FluxCore se fundamenta en una arquitectura de
 * **Design Tokens centralizados**, cuyo propósito es garantizar consistencia
 * estética, escalabilidad transversal y compatibilidad entre plataformas.
 *
 * ## Arquitectura
 *
 * ```
 * theme.json (SSOT)
 *     ↓
 * ThemeProvider (validación + cache + exposición)
 *     ↓
 * useTheme() hook (consumo por componentes)
 *     ↓
 * Componentes (ActivityBar, Sidebar, Canvas, DynamicContainer, ChatArea)
 * ```
 *
 * ## Principios Fundamentales (Sección 8.2)
 *
 * 1. **Single Source of Truth**: theme.json único
 * 2. **Portabilidad**: JSON independiente de framework
 * 3. **Consistencia determinista**: Apariencia 100% derivada del tema
 * 4. **Escalabilidad**: Generación automática, validaciones, tooling
 *
 * ## Validación Automática (Sección 8.6)
 *
 * - Contraste mínimo 4.5:1 para texto normal (WCAG 2.1 AA)
 * - Contraste 3:1 para UI non-text
 * - Alertas automáticas ante combinaciones inválidas
 * - Ajustes dinámicos en modo oscuro/claro
 *
 * ## Uso
 *
 * ```tsx
 * import { useTheme } from '@/theme';
 *
 * const MyComponent = () => {
 *   const { theme } = useTheme();
 *
 *   return (
 *     <div style={{
 *       background: theme.colors.primary[500],
 *       color: theme.colors.neutral[0],
 *       borderRadius: theme.radius.md,
 *       padding: theme.spacing[4]
 *     }}>
 *       Content uses theme tokens exclusively
 *     </div>
 *   );
 * };
 * ```
 */

export { ThemeProvider, useTheme } from './ThemeProvider';
export type { Theme, ThemeColors, Typography, ContrastValidation } from './types';
export {
  validateContrast,
  getContrastRatio,
  meetsMinimumContrast,
  validateThemeAccessibility,
  validateThemeStructure,
} from './utils';
