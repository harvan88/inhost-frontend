/**
 * ThemeProvider - Proveedor de Tema Global (Sección 8.4)
 *
 * ## Single Source of Truth (SSOT) - Sección 8.2.1
 *
 * Todos los componentes del sistema consumen sus valores visuales desde un
 * único archivo theme.json. Ninguna característica visual se define localmente
 * dentro de un módulo.
 *
 * ## Ciclo de Consumo del Tema (Sección 8.4.1)
 *
 * 1. **Carga del JSON** al iniciar FluxCore
 * 2. **Validación de tokens** (estructura, tipos, contraste WCAG)
 * 3. **Normalización y caching** en memoria
 * 4. **Exposición** a toda la aplicación mediante proveedor global
 *
 * ## Principios (Sección 8.2)
 *
 * - **Single Source of Truth**: Un solo archivo JSON
 * - **Portabilidad**: Independiente de frameworks
 * - **Consistencia determinista**: Apariencia 100% derivada del tema
 * - **Escalabilidad**: Generación automática por IA, tooling, validaciones
 *
 * ## Regla Fundamental
 *
 * > "Ningún componente puede definir colores, tipografía o radios propios.
 * > Todo debe provenir del tema."
 *
 * ## Uso
 *
 * ```tsx
 * import { useTheme } from '@/theme/ThemeProvider';
 *
 * const MyComponent = () => {
 *   const { theme } = useTheme();
 *
 *   return (
 *     <div style={{
 *       background: theme.colors.primary[500],
 *       borderRadius: theme.radius.md,
 *       padding: theme.spacing[4]
 *     }}>
 *       Content
 *     </div>
 *   );
 * };
 * ```
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { Theme } from './types';
import { validateThemeStructure, validateThemeAccessibility } from './utils';
import defaultTheme from './theme.json';
import darkTheme from './dark-theme.json';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Theme;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(
    (initialTheme || defaultTheme) as Theme
  );

  // Validación del tema al cargar (Sección 8.4.1)
  useEffect(() => {
    console.log('[ThemeProvider] Validando tema:', theme.name);

    // 1. Validar estructura
    const isValid = validateThemeStructure(theme);
    if (!isValid) {
      console.error('[ThemeProvider] Tema inválido. Usando tema por defecto.');
      setThemeState(defaultTheme as Theme);
      return;
    }

    // 2. Validar accesibilidad (contraste WCAG 2.1)
    const warnings = validateThemeAccessibility(theme);
    if (warnings.length > 0) {
      console.warn('[ThemeProvider] Advertencias de accesibilidad:');
      warnings.forEach((warning) => console.warn(`  - ${warning}`));
    }

    // 3. Aplicar CSS variables al DOM (opcional pero recomendado)
    applyThemeVariables(theme);

    console.log('[ThemeProvider] Tema cargado exitosamente:', theme.name);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    console.log('[ThemeProvider] Cambiando tema a:', newTheme.name);
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme.type === 'dark' ? defaultTheme : darkTheme;
    console.log('[ThemeProvider] Toggle tema:', theme.type, '→', newTheme.type);
    setThemeState(newTheme as Theme);
  };

  const isDark = theme.type === 'dark';

  // PERFORMANCE OPTIMIZATION: Memoizar context value
  // Evita re-renders innecesarios de todos los componentes que usan useTheme
  const contextValue = useMemo(
    () => ({ theme, setTheme, toggleTheme, isDark }),
    [theme, isDark] // Solo cambia cuando el tema cambia
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook para consumir el tema en cualquier componente
 *
 * @throws Error si se usa fuera del ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }

  return context;
}

/**
 * Aplica tokens del tema como CSS variables en el DOM
 * Esto permite usar var(--color-primary-500) en CSS si se desea
 *
 * Opcional pero útil para integración con CSS tradicional
 */
function applyThemeVariables(theme: Theme) {
  const root = document.documentElement;

  // Aplicar colores primarios
  Object.entries(theme.colors.primary).forEach(([key, value]) => {
    root.style.setProperty(`--color-primary-${key}`, value);
  });

  // Aplicar colores neutrales
  Object.entries(theme.colors.neutral).forEach(([key, value]) => {
    root.style.setProperty(`--color-neutral-${key}`, value);
  });

  // Aplicar colores semánticos
  Object.entries(theme.colors.semantic).forEach(([key, value]) => {
    root.style.setProperty(`--color-semantic-${key}`, value);
  });

  // Aplicar tipografía
  root.style.setProperty('--font-family-base', theme.typography.fontFamily.base);
  root.style.setProperty('--font-family-mono', theme.typography.fontFamily.mono);

  // Aplicar radios
  Object.entries(theme.radius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value);
  });

  // Aplicar spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });
}
