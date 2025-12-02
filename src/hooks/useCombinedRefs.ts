/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "C:\Users\harva\Documents\Trabajos\meetgar\FluxCoreChat\inhost-frontend\src\hooks\useCombinedRefs.ts"
 *   type: "utility"
 *   layer: "frontend"
 *   domain: "core"
 *   purpose: "Handles use combined refs functionality"
 *
 * DEPENDENCIES:
 *   internal: []
 *   external: ["react"]
 *   infrastructure: []
 *
 * CONTRACTS:
 *   exports: ["useCombinedRefs"]
 *   inputs: "None"
 *   outputs: "RefCallback<T>"
 *   errors: "None"
 *
 * INTEGRATION:
 *   data_flow: "Request → Middleware → Handler → Response"
 *   events_emitted: []
 *   events_consumed: []
 *
 * IMPACT:
 *   used_by: "To be determined via dependency analysis"
 *   uses: ["react"]
 *   critical: false
 *
 * === DOC_END :: useCombinedRefs.ts ===
 */

import { useCallback, RefCallback } from 'react';

/**
 * useCombinedRefs - Hook para combinar múltiples refs en uno solo
 *
 * Soluciona el problema de asignar a refs read-only devueltos por otros hooks.
 *
 * @param refs - Array de refs a combinar
 * @returns RefCallback que asigna a todos los refs
 *
 * @example
 * ```tsx
 * const ref1 = useRef<HTMLDivElement>(null);
 * const ref2 = useOverflowDetection('MyComponent');
 * const ref3 = useResizeObserver((entry) => console.log(entry));
 *
 * const combinedRef = useCombinedRefs(ref1, ref2, ref3);
 *
 * return <div ref={combinedRef}>Content</div>
 * ```
 */
export function useCombinedRefs<T>(...refs: Array<React.Ref<T> | undefined>): RefCallback<T> {
  return useCallback(
    (node: T | null) => {
      refs.forEach((ref) => {
        if (!ref) return;

        if (typeof ref === 'function') {
          // Callback ref
          ref(node);
        } else if ('current' in ref) {
          // MutableRefObject
          // @ts-ignore - necesitamos mutar el ref
          ref.current = node;
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );
}
