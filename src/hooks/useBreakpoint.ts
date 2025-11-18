/**
 * useBreakpoint Hook
 *
 * Detecta el breakpoint actual del viewport basado en los breakpoints del theme.
 * Actualiza automáticamente en resize.
 *
 * @example
 * ```tsx
 * const breakpoint = useBreakpoint();
 * const isMobile = useIsMobile();
 *
 * if (isMobile) {
 *   return <MobileWorkspace />;
 * }
 * ```
 */

import { useState, useEffect } from 'react';
import { useTheme } from '@/theme';

export type Breakpoint = 'mobile' | 'mobileLandscape' | 'tablet' | 'desktop' | 'wide' | 'ultrawide';

/**
 * Hook principal que detecta el breakpoint actual
 */
export function useBreakpoint(): Breakpoint {
  const { theme } = useTheme();
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;

      // Convertir breakpoints del theme a números
      const mobile = parseInt(theme.breakpoints.mobile);
      const mobileLandscape = parseInt(theme.breakpoints.mobileLandscape);
      const tablet = parseInt(theme.breakpoints.tablet);
      const desktop = parseInt(theme.breakpoints.desktop);
      const wide = parseInt(theme.breakpoints.wide);
      const ultrawide = parseInt(theme.breakpoints.ultrawide);

      // Determinar breakpoint actual (de menor a mayor)
      if (width >= ultrawide) {
        setBreakpoint('ultrawide');
      } else if (width >= wide) {
        setBreakpoint('wide');
      } else if (width >= desktop) {
        setBreakpoint('desktop');
      } else if (width >= tablet) {
        setBreakpoint('tablet');
      } else if (width >= mobileLandscape) {
        setBreakpoint('mobileLandscape');
      } else {
        setBreakpoint('mobile');
      }
    };

    // Ejecutar inmediatamente
    updateBreakpoint();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', updateBreakpoint);

    // Cleanup
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, [theme.breakpoints]);

  return breakpoint;
}

/**
 * Hook auxiliar para detectar si está en mobile (< 768px)
 */
export function useIsMobile(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'mobile' || breakpoint === 'mobileLandscape';
}

/**
 * Hook auxiliar para detectar si está en tablet (768px - 1024px)
 */
export function useIsTablet(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'tablet';
}

/**
 * Hook auxiliar para detectar si está en desktop (>= 1024px)
 */
export function useIsDesktop(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'desktop' || breakpoint === 'wide' || breakpoint === 'ultrawide';
}
