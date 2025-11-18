import { useEffect, useRef } from 'react';

/**
 * useResizeObserver - Hook para observar cambios de tamaño en elementos
 *
 * CONTRATO ARQUITECTÓNICO:
 * "Si lienzo se achica se achican proporcionalmente"
 *
 * Este hook permite detectar cambios en el tamaño del Canvas y
 * redistribuir contenedores de manera inteligente.
 *
 * @param callback - Función a ejecutar cuando el elemento cambia de tamaño
 * @returns ref - Referencia al elemento a observar
 *
 * @example
 * ```tsx
 * const canvasRef = useResizeObserver((entry) => {
 *   console.log('Canvas width:', entry.contentRect.width);
 *   adjustContainerLayout(entry.contentRect.width);
 * });
 *
 * return <div ref={canvasRef}>Canvas content</div>
 * ```
 */
export function useResizeObserver<T extends HTMLElement>(
  callback: (entry: ResizeObserverEntry) => void
) {
  const ref = useRef<T>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      // Only call callback if we have entries
      if (entries.length > 0) {
        callbackRef.current(entries[0]);
      }
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return ref;
}
