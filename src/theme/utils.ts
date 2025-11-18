/**
 * Theme Utilities (Sección 8.6)
 *
 * Utilidades para validación de contraste y accesibilidad
 * según criterios WCAG 2.1 AA/AAA.
 */

import type { ContrastValidation } from './types';

/**
 * Convierte un color hexadecimal a valores RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calcula la luminancia relativa de un color
 * según fórmula WCAG 2.1
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calcula el ratio de contraste entre dos colores
 * según WCAG 2.1
 *
 * @param color1 - Color en formato hexadecimal
 * @param color2 - Color en formato hexadecimal
 * @returns Ratio de contraste (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    console.warn(`Invalid color format: ${color1} or ${color2}`);
    return 1;
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Valida el contraste entre dos colores según WCAG 2.1
 *
 * Niveles WCAG:
 * - AA Normal text: 4.5:1
 * - AA Large text: 3:1
 * - AAA Normal text: 7:1
 * - AAA Large text: 4.5:1
 *
 * @param foreground - Color de texto (hex)
 * @param background - Color de fondo (hex)
 * @returns Resultado de validación con ratios y pass/fail
 */
export function validateContrast(
  foreground: string,
  background: string
): ContrastValidation {
  const ratio = getContrastRatio(foreground, background);

  return {
    ratio: Math.round(ratio * 100) / 100,
    passAA: ratio >= 4.5,
    passAAA: ratio >= 7,
    passAALarge: ratio >= 3,
    passAAALarge: ratio >= 4.5,
  };
}

/**
 * Valida si una combinación de colores cumple con
 * el nivel mínimo de accesibilidad AA
 *
 * @param foreground - Color de texto
 * @param background - Color de fondo
 * @param isLargeText - Si es texto grande (18pt+ o 14pt+ bold)
 * @returns true si cumple AA, false si no
 */
export function meetsMinimumContrast(
  foreground: string,
  background: string,
  isLargeText = false
): boolean {
  const validation = validateContrast(foreground, background);
  return isLargeText ? validation.passAALarge : validation.passAA;
}

/**
 * Genera un reporte de accesibilidad para un tema completo
 * Útil para validar temas generados por IA o usuarios
 *
 * @param theme - Objeto de tema completo
 * @returns Array de advertencias de contraste
 */
export function validateThemeAccessibility(theme: any): string[] {
  const warnings: string[] = [];

  // Validar primary sobre neutral-0 (texto primario sobre blanco)
  const primaryOnWhite = validateContrast(
    theme.colors.primary[500],
    theme.colors.neutral[0]
  );
  if (!primaryOnWhite.passAA) {
    warnings.push(
      `Primary-500 sobre Neutral-0 no cumple AA (ratio: ${primaryOnWhite.ratio})`
    );
  }

  // Validar neutral-900 sobre neutral-0 (texto oscuro sobre blanco)
  const darkOnWhite = validateContrast(
    theme.colors.neutral[900],
    theme.colors.neutral[0]
  );
  if (!darkOnWhite.passAA) {
    warnings.push(
      `Neutral-900 sobre Neutral-0 no cumple AA (ratio: ${darkOnWhite.ratio})`
    );
  }

  // Validar colores semánticos sobre fondos claros
  const semanticColors = [
    { name: 'Success', color: theme.colors.semantic.success },
    { name: 'Warning', color: theme.colors.semantic.warning },
    { name: 'Danger', color: theme.colors.semantic.danger },
    { name: 'Info', color: theme.colors.semantic.info },
  ];

  semanticColors.forEach(({ name, color }) => {
    const validation = validateContrast(color, theme.colors.neutral[0]);
    if (!validation.passAA) {
      warnings.push(`${name} sobre Neutral-0 no cumple AA (ratio: ${validation.ratio})`);
    }
  });

  return warnings;
}

/**
 * Valida la estructura del tema según esquema esperado
 *
 * @param theme - Objeto de tema a validar
 * @returns true si la estructura es válida
 */
export function validateThemeStructure(theme: any): boolean {
  const requiredKeys = [
    'name',
    'type',
    'colors',
    'typography',
    'spacing',
    'radius',
    'elevation',
  ];

  const missingKeys = requiredKeys.filter((key) => !(key in theme));

  if (missingKeys.length > 0) {
    console.error(`Tema inválido. Faltan claves: ${missingKeys.join(', ')}`);
    return false;
  }

  // Validar colores primarios
  if (!theme.colors.primary || !theme.colors.primary[500]) {
    console.error('Tema inválido. Falta primary-500');
    return false;
  }

  // Validar colores neutrales
  if (!theme.colors.neutral || !theme.colors.neutral[0]) {
    console.error('Tema inválido. Falta neutral-0');
    return false;
  }

  return true;
}
