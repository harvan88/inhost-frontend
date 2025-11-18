import { useEffect, useRef } from 'react';

/**
 * useOverflowDetection - Hook para detectar y reportar desbordamientos
 *
 * CONTRATO ARQUITECTÓNICO:
 * "Ningún contenido del lienzo lo desborda, todos los contenidos de lienzo se adaptan a su anchura"
 *
 * Este hook monitorea elementos para detectar:
 * - scrollWidth > clientWidth (overflow horizontal)
 * - scrollHeight > clientHeight (overflow vertical)
 * - Elementos que exceden sus contenedores
 *
 * @param elementName - Nombre del elemento para logging (ej: "Canvas", "DynamicContainer")
 * @param options - Opciones de configuración
 * @returns ref - Referencia al elemento a observar
 *
 * @example
 * ```tsx
 * const canvasRef = useOverflowDetection('Canvas', {
 *   checkInterval: 2000,
 *   logOverflow: true,
 *   onOverflow: (data) => console.error('Overflow detected!', data)
 * });
 *
 * return <div ref={canvasRef}>Canvas content</div>
 * ```
 */

interface OverflowData {
  elementName: string;
  timestamp: string;
  clientWidth: number;
  scrollWidth: number;
  clientHeight: number;
  scrollHeight: number;
  hasHorizontalOverflow: boolean;
  hasVerticalOverflow: boolean;
  overflowX: number; // pixels de overflow horizontal
  overflowY: number; // pixels de overflow vertical
}

interface OverflowDetectionOptions {
  /**
   * Intervalo de chequeo en milisegundos
   * @default 3000
   */
  checkInterval?: number;

  /**
   * Si debe loggear en consola cuando detecta overflow
   * @default true
   */
  logOverflow?: boolean;

  /**
   * Callback cuando se detecta overflow
   */
  onOverflow?: (data: OverflowData) => void;

  /**
   * Si debe loggear métricas de tamaño incluso sin overflow (debug)
   * @default false
   */
  logMetrics?: boolean;
}

export function useOverflowDetection<T extends HTMLElement>(
  elementName: string,
  options: OverflowDetectionOptions = {}
) {
  const {
    checkInterval = 3000,
    logOverflow = true,
    onOverflow,
    logMetrics = false,
  } = options;

  const ref = useRef<T>(null);
  const lastOverflowState = useRef<{
    horizontal: boolean;
    vertical: boolean;
  }>({
    horizontal: false,
    vertical: false,
  });

  useEffect(() => {
    if (!ref.current) return;

    const checkOverflow = () => {
      if (!ref.current) return;

      const element = ref.current;
      const clientWidth = element.clientWidth;
      const scrollWidth = element.scrollWidth;
      const clientHeight = element.clientHeight;
      const scrollHeight = element.scrollHeight;

      const hasHorizontalOverflow = scrollWidth > clientWidth;
      const hasVerticalOverflow = scrollHeight > clientHeight;
      const overflowX = scrollWidth - clientWidth;
      const overflowY = scrollHeight - clientHeight;

      const overflowData: OverflowData = {
        elementName,
        timestamp: new Date().toISOString(),
        clientWidth,
        scrollWidth,
        clientHeight,
        scrollHeight,
        hasHorizontalOverflow,
        hasVerticalOverflow,
        overflowX,
        overflowY,
      };

      // Detectar cambios en estado de overflow
      const overflowChanged =
        hasHorizontalOverflow !== lastOverflowState.current.horizontal ||
        hasVerticalOverflow !== lastOverflowState.current.vertical;

      // Loggear solo si hay overflow o si cambió el estado
      if ((hasHorizontalOverflow || hasVerticalOverflow) && (overflowChanged || logMetrics)) {
        if (logOverflow) {
          console.warn(
            `🚨 OVERFLOW DETECTADO - ${elementName}`,
            {
              horizontal: hasHorizontalOverflow ? `${overflowX}px` : 'No',
              vertical: hasVerticalOverflow ? `${overflowY}px` : 'No',
              dimensions: {
                client: `${clientWidth}x${clientHeight}`,
                scroll: `${scrollWidth}x${scrollHeight}`,
              },
              timestamp: overflowData.timestamp,
            }
          );
        }

        // Callback si se provee
        if (onOverflow) {
          onOverflow(overflowData);
        }
      }

      // Loggear métricas si está habilitado (debug mode)
      if (logMetrics && !hasHorizontalOverflow && !hasVerticalOverflow) {
        console.log(
          `✅ ${elementName} - Sin overflow`,
          {
            dimensions: `${clientWidth}x${clientHeight}`,
            scroll: `${scrollWidth}x${scrollHeight}`,
          }
        );
      }

      // Actualizar estado previo
      lastOverflowState.current = {
        horizontal: hasHorizontalOverflow,
        vertical: hasVerticalOverflow,
      };
    };

    // Chequeo inicial
    checkOverflow();

    // Chequeo periódico
    const intervalId = setInterval(checkOverflow, checkInterval);

    // Chequeo cuando cambia el tamaño de la ventana
    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });

    resizeObserver.observe(ref.current);

    return () => {
      clearInterval(intervalId);
      resizeObserver.disconnect();
    };
  }, [elementName, checkInterval, logOverflow, logMetrics, onOverflow]);

  return ref;
}

/**
 * Utilitiy function para reportar overflow manualmente
 */
export function reportOverflow(elementName: string, element: HTMLElement) {
  const clientWidth = element.clientWidth;
  const scrollWidth = element.scrollWidth;
  const clientHeight = element.clientHeight;
  const scrollHeight = element.scrollHeight;

  const hasHorizontalOverflow = scrollWidth > clientWidth;
  const hasVerticalOverflow = scrollHeight > clientHeight;

  if (hasHorizontalOverflow || hasVerticalOverflow) {
    console.warn(
      `🚨 OVERFLOW MANUAL REPORT - ${elementName}`,
      {
        horizontal: hasHorizontalOverflow ? `${scrollWidth - clientWidth}px` : 'No',
        vertical: hasVerticalOverflow ? `${scrollHeight - clientHeight}px` : 'No',
        dimensions: {
          client: `${clientWidth}x${clientHeight}`,
          scroll: `${scrollWidth}x${scrollHeight}`,
        },
      }
    );
  } else {
    console.log(`✅ ${elementName} - Sin overflow`, {
      dimensions: `${clientWidth}x${clientHeight}`,
    });
  }
}
