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

export interface ComponentSizes {
  avatar: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  statusIndicator: string;
  spinner: {
    sm: string;
    md: string;
    lg: string;
  };
  toolbar: string;
  controlBar: string;
  messageInputContainer: string;
  sidebar: {
    activityBar: string;
    primary: string;
  };
}

export interface ComponentSpacing {
  badge: {
    compact: string;
    default: string;
    loose: string;
  };
  button: {
    sm: string;
    md: string;
    lg: string;
  };
  input: {
    sm: string;
    md: string;
  };
  card: {
    sm: string;
    md: string;
    lg: string;
  };
}

export interface ComponentLayouts {
  userCard: {
    avatarSize: string;
    gap: string;
    statusPosition: string;
  };
  listItem: {
    height: string;
    padding: string;
  };
}

/**
 * Estilos unificados de componentes (FluxCore Style Standards)
 *
 * Define estilos completos y reutilizables para cada tipo de componente.
 * Cada estilo combina tamaño, peso, espaciado y line-height en una única definición.
 * Estos estilos son independientes del tema de color - solo definen estructura y jerarquía.
 */
export interface ComponentStyles {
  // Tipografía y títulos
  heading: {
    h1: {
      fontSize: string;      // 24px
      fontWeight: string;    // bold
      margin: string;        // 16px
      lineHeight: string;
    };
    h2: {
      fontSize: string;      // 20px
      fontWeight: string;    // semibold
      margin: string;        // 12px
      lineHeight: string;
    };
    h3: {
      fontSize: string;
      fontWeight: string;
      margin: string;
      lineHeight: string;
    };
  };

  // Texto
  text: {
    normal: {
      fontSize: string;      // 14px
      fontWeight: string;    // regular
      lineHeight: string;    // 1.5
    };
    metadata: {
      fontSize: string;      // 12px
      fontWeight: string;    // regular
      lineHeight: string;    // 1.4
    };
    label: {
      fontSize: string;
      fontWeight: string;
      lineHeight: string;
    };
  };

  // Botones
  button: {
    primary: {
      fontSize: string;      // 14px
      fontWeight: string;    // medium
      padding: string;       // 12px 24px
    };
    secondary: {
      fontSize: string;      // 14px
      fontWeight: string;    // medium
      padding: string;       // 10px 20px
    };
    small: {
      fontSize: string;
      fontWeight: string;
      padding: string;
    };
  };

  // Inputs y formularios
  input: {
    default: {
      fontSize: string;      // 14px
      fontWeight: string;    // regular
      padding: string;       // 12px 16px
      height: string;
    };
    small: {
      fontSize: string;
      fontWeight: string;
      padding: string;
      height: string;
    };
  };

  // Tags y badges
  tag: {
    default: {
      fontSize: string;      // 12px
      fontWeight: string;    // medium
      padding: string;       // 4px 8px
    };
    small: {
      fontSize: string;
      fontWeight: string;
      padding: string;
    };
  };

  // Componentes de layout
  layout: {
    activityBar: {
      iconSize: string;       // 24-28px
      spacing: string;        // 16px vertical
    };
    sidebar: {
      width: string;          // 280-320px
      itemSpacing: string;
    };
    container: {
      headerHeight: string;
      footerHeight: string;
      contentPadding: string;
    };
  };
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
  componentSizes: ComponentSizes;
  componentSpacing: ComponentSpacing;
  componentLayouts: ComponentLayouts;
  componentStyles: ComponentStyles;
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
