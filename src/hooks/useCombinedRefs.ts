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
