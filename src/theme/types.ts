/**
 * Design Tokens Type System (Sección 8)
 *
 * Sistema de tipos para tokens de diseño centralizados.
 * Define la estructura formal del archivo theme.json según
 * recomendaciones del W3C Design Tokens Community Group.
 */

export interface ColorScale {
  50?: string;
  100?: string;
  200?: string;
  300?: string;
  400?: string;
  500?: string;
  600?: string;
  700?: string;
  800?: string;
  900?: string;
  950?: string;
  0?: string; // Para neutral-0 (white)
}

export interface SemanticColors {
  success: string;
  successLight: string;
  successDark: string;
  warning: string;
  warningLight: string;
  warningDark: string;
  danger: string;
  dangerLight: string;
  dangerDark: string;
  info: string;
  infoLight: string;
  infoDark: string;
}

export interface ChannelColors {
  whatsapp: ColorScale;
  telegram: ColorScale;
  web: ColorScale;
  sms: ColorScale;
}

export interface ThemeColors {
  primary: ColorScale;
  neutral: ColorScale;
  semantic: SemanticColors;
  channels: ChannelColors;
}

export interface Typography {
  fontFamily: {
    base: string;
    mono: string;
  };
  sizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  weights: {
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeights: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

export interface IconSizes {
  xs: number;
  sm: number;
  base: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export interface Spacing {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
}

export interface Radius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

export interface Elevation {
  none: string;
  xs: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
}

export interface Transitions {
  fast: string;
  base: string;
  slow: string;
  slower: string;
}

export interface ZIndex {
  base: string;
  dropdown: string;
  modal: string;
  popover: string;
  tooltip: string;
  notification: string;
}

/**
 * Tema completo de FluxCore
 *
 * Single Source of Truth (SSOT) para todos los valores visuales.
 * Ningún componente puede definir propiedades visuales fuera de esta estructura.
 */
export interface Theme {
  name: string;
  type: 'light' | 'dark';
  colors: ThemeColors;
  typography: Typography;
  iconSizes: IconSizes;
  spacing: Spacing;
  radius: Radius;
  elevation: Elevation;
  transitions: Transitions;
  zIndex: ZIndex;
}

/**
 * Resultado de validación de contraste WCAG 2.1
 */
export interface ContrastValidation {
  ratio: number;
  passAA: boolean; // 4.5:1 para texto normal
  passAAA: boolean; // 7:1 para texto normal
  passAALarge: boolean; // 3:1 para texto grande
  passAAALarge: boolean; // 4.5:1 para texto grande
}
