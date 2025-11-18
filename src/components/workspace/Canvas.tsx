import { Columns2, Rows2 } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspace';
import DynamicContainer from './DynamicContainer';

/**
 * Canvas - Lienzo Dinámico (Nivel 3)
 *
 * ## Definición (según documento formal - Sección 5.1)
 *
 * El Lienzo Dinámico constituye el área principal de trabajo del sistema y define
 * el espacio dentro del cual pueden existir y operar uno o varios Contenedores Dinámicos.
 * Su función es actuar como un marco estructural adaptable que:
 *
 * - Demarca los límites en los que los contenedores pueden existir
 *   (ningún módulo puede exceder o superponer su espacio)
 * - Se ajusta dinámicamente en función de la visibilidad de la Barra Lateral Contextual
 * - Ofrece una grilla flexible capaz de organizar múltiples vistas en paralelo
 *
 * **Ajuste automático:**
 * Cuando la Barra Lateral Contextual se encuentra retraída, el Lienzo Dinámico se expande
 * de forma automática para ocupar el espacio liberado, maximizando el área disponible
 * para los contenedores.
 *
 * ## Comportamiento Espacial Interno (Sección 5.2)
 *
 * El Lienzo implementa un sistema de distribución de espacio basado en particiones ajustables:
 *
 * **Un solo contenedor:**
 * - Ocupa el 100% del ancho disponible del Lienzo
 * - Estado base del sistema
 *
 * **Dos contenedores:**
 * - Espacio dividido en 50% / 50% de forma predeterminada
 * - Usuario puede mover el divisor horizontal para redefinir distribución
 *
 * **Múltiples contenedores:**
 * - Admite creación de varios contenedores simultáneos
 * - Cada contenedor existe dentro de una sección independiente de la grilla
 * - Usuario puede reorganizarlos mediante arrastre o cierre individual
 *
 * **Redimensionamiento manual:**
 * - Particiones entre contenedores son ajustables
 * - Mantiene proporcionalidad relativa tras cambios de tamaño del viewport
 *
 * **Persistencia del estado espacial:**
 * - Sistema recuerda distribución de contenedores (opcional)
 * - Preserva configuraciones del usuario durante la sesión
 *
 * ## Rol Conceptual (Sección 5.3)
 *
 * El Lienzo opera como un entorno de trabajo modular, ofreciendo libertad para
 * organizar vistas, herramientas y conversaciones según necesidades operativas.
 *
 * Casos de uso típicos:
 *
 * - **Conversaciones paralelas:**
 *   Dos ChatArea abiertos simultáneamente, lado a lado
 *
 * - **Conversación + Perfil:**
 *   ChatArea + ContactArea para el mismo usuario
 *
 * - **Conversación + Herramienta de IA:**
 *   ChatArea + ToolArea (análisis, transcripción, resumen)
 *
 * - **Herramientas múltiples:**
 *   Transcriptor + Analizador semántico + Buscador interno
 *
 * - **Interfaces de plugins integradas:**
 *   Plugin CRM + Dashboard automatizaciones + Visor de logs/métricas
 *
 * En esencia, el Lienzo Dinámico define la capacidad multivista de FluxCore
 * y habilita una experiencia de trabajo fluida, personalizable y comparable
 * a entornos avanzados de desarrollo y productividad.
 *
 * ## Arquitectura Técnica
 *
 * Modelo conceptual:
 * ```
 * Lienzo Dinámico (Canvas)
 *   ├─ Contenedor Dinámico 1 → Herramienta A (con tabs)
 *   ├─ Contenedor Dinámico 2 → Herramienta B (con tabs)
 *   └─ Contenedor Dinámico N → Herramienta N (con tabs)
 * ```
 *
 * Responsabilidades:
 * - Renderizar todos los Contenedores Dinámicos activos
 * - Gestionar layout (single, horizontal-split, vertical-split)
 * - Proporcionar controles para dividir el lienzo
 * - Coordinar distribución espacial de contenedores
 * - Ajustarse automáticamente al mostrar/ocultar Barra Lateral
 *
 * NO hace:
 * - Gestionar contenido de las herramientas (responsabilidad del DynamicContainer)
 * - Manejar tabs (responsabilidad del DynamicContainer)
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
          Lienzo Dinámico ({containers.length}{' '}
          {containers.length === 1 ? 'contenedor' : 'contenedores'})
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => splitCanvas('horizontal')}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition flex items-center gap-1.5"
            title="Dividir horizontalmente (50% / 50%)"
            disabled={containers.length === 0}
          >
            <Columns2 size={14} />
            Split Horizontal
          </button>
          <button
            onClick={() => splitCanvas('vertical')}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition flex items-center gap-1.5"
            title="Dividir verticalmente (50% / 50%)"
            disabled={containers.length === 0}
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
              <p className="text-xl text-gray-500 mb-2">Lienzo Dinámico vacío</p>
              <p className="text-sm text-gray-400">
                Selecciona un elemento del sidebar para comenzar
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
