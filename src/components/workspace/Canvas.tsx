import { Columns2, Rows2 } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspace';
import DynamicContainer from './DynamicContainer';

/**
 * Canvas - Lienzo (Nivel 3)
 *
 * Arquitectura Formal (del documento):
 *
 * El Lienzo es la unidad espacial primaria del tercer nivel de la interfaz.
 * Es una superficie de composición que:
 * - NO representa contenido por sí misma (función exclusivamente estructural)
 * - Opera como grilla flexible que alberga N Contenedores Dinámicos
 * - Permite división horizontal o vertical del espacio
 * - Soporta redimensionamiento manual de subdivisiones
 * - Persiste el layout definido por el usuario
 *
 * Modelo conceptual:
 * Lienzo (Canvas)
 *   ├─ Contenedor Dinámico 1 → Herramienta A (con tabs)
 *   ├─ Contenedor Dinámico 2 → Herramienta B (con tabs)
 *   └─ Contenedor Dinámico N → Herramienta N (con tabs)
 *
 * Responsabilidades:
 * - Renderizar todos los Contenedores Dinámicos activos
 * - Gestionar layout (single, horizontal-split, vertical-split)
 * - Proporcionar controles para dividir el lienzo
 * - Coordinar la distribución espacial de contenedores
 *
 * NO hace:
 * - Gestionar contenido de las herramientas (eso es del DynamicContainer)
 * - Manejar tabs (eso es del DynamicContainer)
 * - Contener lógica de negocio
 *
 * Comparable a:
 * - Editor grid de VS Code
 * - Split workspace de JetBrains
 * - Paneles dinámicos de Figma/Adobe XD
 */
export default function Canvas() {
  const { containers, layout, splitCanvas } = useWorkspaceStore();

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Canvas Toolbar - Controles para dividir el lienzo */}
      <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4">
        <div className="text-sm text-gray-600 font-medium">
          Canvas ({containers.length} {containers.length === 1 ? 'contenedor' : 'contenedores'})
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => splitCanvas('horizontal')}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition flex items-center gap-1.5"
            title="Dividir horizontalmente"
          >
            <Columns2 size={14} />
            Split Horizontal
          </button>
          <button
            onClick={() => splitCanvas('vertical')}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition flex items-center gap-1.5"
            title="Dividir verticalmente"
          >
            <Rows2 size={14} />
            Split Vertical
          </button>
        </div>
      </div>

      {/* Canvas Area - Contenedores Dinámicos */}
      <div className="flex-1 overflow-hidden">
        {containers.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <p className="text-xl text-gray-500 mb-2">Lienzo vacío</p>
              <p className="text-sm text-gray-400">
                No hay contenedores activos
              </p>
            </div>
          </div>
        ) : (
          <div
            className={`h-full flex ${
              layout === 'vertical-split' ? 'flex-col' : 'flex-row'
            }`}
          >
            {containers.map((container) => (
              <DynamicContainer key={container.id} containerId={container.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
