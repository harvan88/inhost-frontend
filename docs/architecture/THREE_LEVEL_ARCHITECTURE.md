# Arquitectura de Tres Niveles - FluxCore

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Visión General](#2-visión-general)
3. [Nivel 1: Activity Bar (Barra de Actividad)](#3-nivel-1-activity-bar)
4. [Nivel 2: Primary Sidebar (Barra Lateral Contextual)](#4-nivel-2-primary-sidebar)
5. [Nivel 3: Canvas (Lienzo Dinámico)](#5-nivel-3-canvas)
6. [Nivel 4: Dynamic Container (Contenedor Dinámico)](#6-nivel-4-dynamic-container)
7. [Nivel 5: Tool Areas (Áreas de Herramientas)](#7-nivel-5-tool-areas)
8. [Sistema de Design Tokens](#8-sistema-de-design-tokens)
9. [Flujos de Usuario](#9-flujos-de-usuario)
10. [Escalabilidad y Extensibilidad](#10-escalabilidad-y-extensibilidad)

---

## 1. Introducción

### 1.1 ¿Qué es FluxCore?

FluxCore es una plataforma de mensajería omnicanal que implementa una **arquitectura de workspace modular** inspirada en entornos de desarrollo profesionales como VS Code, JetBrains IDEs y Figma.

### 1.2 Motivación Arquitectónica

**Problema a resolver:**
- Necesidad de manejar **múltiples conversaciones simultáneamente**
- Soporte para **diferentes tipos de herramientas** (chat, contactos, analítica, plugins)
- **Escalabilidad** sin modificar código existente
- **Flexibilidad** para personalización por usuario

**Solución:**
Una arquitectura de **tres niveles jerárquicos** donde cada nivel tiene responsabilidades claras y desacopladas.

### 1.3 Principios de Diseño

1. **Separation of Concerns** - Cada nivel tiene una responsabilidad única
2. **ID-Based Architecture** - Los componentes reciben IDs, no datos
3. **Progressive Enhancement** - Funcionalidades se agregan sin romper existentes
4. **Design Tokens Everywhere** - UI completamente controlada por tema

---

## 2. Visión General

### 2.1 Los Cinco Niveles

```
┌──────────────────────────────────────────────────────────────────────┐
│ NIVEL 0: App Container (Root)                                        │
│ ┌──────┬─────────────────────────────────────────────────────────┐  │
│ │      │ NIVEL 2: Primary Sidebar (Contextual)                   │  │
│ │      │ ┌──────────────────────────────────────────────────────┐│  │
│ │      │ │ NIVEL 3: Canvas (Dynamic Workspace)                  ││  │
│ │      │ │ ┌────────────────────────────────────────────────┐   ││  │
│ │NIVEL1│ │ │ NIVEL 4: Dynamic Container (Tab Container)     │   ││  │
│ │      │ │ │ ┌──────────────────────────────────────────┐   │   ││  │
│ │Act.  │ │ │ │ NIVEL 5: Tool Area (ChatArea, etc.)      │   │   ││  │
│ │Bar   │ │ │ │                                          │   │   ││  │
│ │      │ │ │ └──────────────────────────────────────────┘   │   ││  │
│ │      │ │ └────────────────────────────────────────────────┘   ││  │
│ │      │ └──────────────────────────────────────────────────────┘│  │
│ └──────┴─────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 Flujo de Responsabilidades

| Nivel | Componente | Responsabilidad | Ejemplo |
|-------|-----------|----------------|---------|
| 0 | App | Layout root, theme provider | `<ThemeProvider><Workspace /></>` |
| 1 | Activity Bar | Seleccionar dominio | Click "Mensajes" → muestra sidebar |
| 2 | Primary Sidebar | Listar elementos del dominio | Lista de conversaciones |
| 3 | Canvas | Contener múltiples vistas | Split horizontal de 2 containers |
| 4 | Dynamic Container | Gestionar tabs de herramientas | Tab 1: Chat Juan, Tab 2: Chat María |
| 5 | Tool Area | Renderizar herramienta específica | ChatArea con conversationId="123" |

---

## 3. Nivel 1: Activity Bar

### 3.1 Definición

La **Activity Bar** (Barra de Actividad) es una columna vertical persistente ubicada en el extremo izquierdo de la interfaz que contiene los **dominios operativos** principales de FluxCore.

### 3.2 Características

- **Persistente**: Siempre visible, nunca se oculta
- **Estática**: Número fijo de actividades (típicamente 4-6)
- **Global**: No depende del contexto del usuario
- **Icon-only**: Representación minimalista (icono + tooltip)

### 3.3 Actividades Disponibles

| Icono | Nombre | Descripción | Sidebar Asociada |
|-------|--------|-------------|------------------|
| 💬 | Mensajes | Conversaciones omnicanal | Lista de conversaciones |
| 👥 | Contactos | Directorio de contactos | Lista de contactos |
| 🔧 | Herramientas | Utilidades del sistema | Catálogo de herramientas |
| 🧩 | Plugins | Extensiones instaladas | Lista de plugins activos |

### 3.4 Comportamiento

```typescript
// Flujo de interacción
Usuario → Click "Mensajes"
  ↓
ActivityBar.handleClick('messages')
  ↓
workspaceStore.setActiveActivity('messages')
  ↓
PrimarySidebar renderiza ConversationListView
  ↓
Usuario ve lista de conversaciones
```

### 3.5 Implementación

**Archivo:** `src/components/workspace/ActivityBar.tsx`

```tsx
interface Activity {
  id: 'messages' | 'contacts' | 'tools' | 'plugins';
  icon: React.ReactNode;
  label: string;
}

const activities: Activity[] = [
  { id: 'messages', icon: <MessageSquare />, label: 'Mensajes' },
  { id: 'contacts', icon: <Users />, label: 'Contactos' },
  { id: 'tools', icon: <Wrench />, label: 'Herramientas' },
  { id: 'plugins', icon: <Puzzle />, label: 'Plugins' },
];
```

### 3.6 Estados Visuales

- **Inactivo**: `neutral-500` (gris)
- **Hover**: `neutral-700` + `background: neutral-100`
- **Activo**: `primary-500` (azul) + `background: primary-50`
- **Borde izquierdo activo**: `4px solid primary-500`

### 3.7 Responsabilidades

✅ **SÍ hace:**
- Mostrar lista de dominios disponibles
- Permitir seleccionar un dominio
- Indicar visualmente cuál está activo
- Toggle sidebar (mostrar/ocultar)

❌ **NO hace:**
- Contener lógica de negocio
- Saber qué hay en cada dominio
- Gestionar contenido de las herramientas

---

## 4. Nivel 2: Primary Sidebar

### 4.1 Definición

La **Primary Sidebar** (Barra Lateral Contextual) es un panel dependiente del dominio seleccionado en la Activity Bar, que presenta **colecciones navegables** de elementos.

### 4.2 Características

- **Contextual**: Su contenido depende de la actividad seleccionada
- **Colapsable**: Puede ocultarse para maximizar espacio
- **Resizable**: Ancho ajustable (futuro)
- **Filtrable**: Búsqueda y ordenamiento local

### 4.3 Vistas por Dominio

#### 4.3.1 Mensajes → ConversationListView

**Contenido:**
- Lista de todas las conversaciones del usuario
- Ordenadas por: pinned first → updatedAt desc
- Filtros: búsqueda por nombre/texto

**Componentes:**
- `ConversationListItem` - Item individual
  - Avatar del contacto
  - Nombre y último mensaje
  - Badge de canal (WhatsApp, Telegram, etc.)
  - Unread count
  - Timestamp relativo
  - Pin indicator

**Interacción:**
```typescript
Usuario → Click conversación "Juan Pérez"
  ↓
workspaceStore.openTab({
  id: 'chat-conv-123',
  type: 'conversation',
  label: 'Juan Pérez',
  entityId: 'conv-123'
})
  ↓
Canvas renderiza DynamicContainer con tab activa
  ↓
DynamicContainer renderiza ChatArea(conversationId="conv-123")
```

#### 4.3.2 Contactos → ContactsView

**Contenido:**
- Directorio de todos los contactos
- Filtrable por nombre, empresa, tags
- Agrupable por categorías

**Estado:** 🚧 En desarrollo

#### 4.3.3 Herramientas → ToolsView

**Contenido:**
- Catálogo de herramientas del sistema
- Transcriptor, Analizador semántico, Buscador interno
- Favoritos y recientes

**Estado:** 🚧 En desarrollo

#### 4.3.4 Plugins → PluginsView

**Contenido:**
- Lista de plugins instalados
- Estado (activo/inactivo)
- Configuración rápida

**Estado:** 🚧 En desarrollo

### 4.4 Implementación

**Archivo:** `src/components/workspace/PrimarySidebar.tsx`

```tsx
export default function PrimarySidebar() {
  const { activeActivity, sidebarVisible, sidebarWidth } = useWorkspaceStore();
  const { theme } = useTheme();

  if (!sidebarVisible) return null;

  return (
    <div style={{ width: `${sidebarWidth}px` }}>
      {activeActivity === 'messages' && <ConversationListView />}
      {activeActivity === 'contacts' && <ContactsView />}
      {activeActivity === 'tools' && <ToolsView />}
      {activeActivity === 'plugins' && <PluginsView />}
    </div>
  );
}
```

### 4.5 Comportamiento Espacial

- **Ancho por defecto**: `320px`
- **Ancho mínimo**: `240px`
- **Ancho máximo**: `480px`
- **Cuando oculta**: Canvas se expande automáticamente

### 4.6 Responsabilidades

✅ **SÍ hace:**
- Mostrar colecciones del dominio activo
- Permitir búsqueda y filtrado local
- Proveer metadatos (conteos, estados)
- Abrir elementos en el Canvas

❌ **NO hace:**
- Renderizar contenido de las herramientas
- Gestionar pestañas o splits
- Persistir estado de filtros (opcional)

---

## 5. Nivel 3: Canvas

### 5.1 Definición

El **Canvas** (Lienzo Dinámico) es el área principal de trabajo que define el espacio dentro del cual pueden existir y operar uno o varios **Dynamic Containers**.

### 5.2 Características

- **Adaptable**: Se ajusta según visibilidad de la sidebar
- **Multi-vista**: Soporta split horizontal y vertical
- **Grilla flexible**: Distribución proporcional de espacio
- **Sin límite funcional**: Máximo 2 contenedores (UX decision)

### 5.3 Modos de Layout

#### 5.3.1 Single (1 contenedor)

```
┌────────────────────────────────────┐
│                                    │
│                                    │
│       DynamicContainer 1           │
│            (100%)                  │
│                                    │
│                                    │
└────────────────────────────────────┘
```

**Uso:** Estado base del sistema

#### 5.3.2 Horizontal Split (2 contenedores)

```
┌──────────────────┬─────────────────┐
│                  │                 │
│                  │                 │
│  Container 1     │  Container 2    │
│    (50%)         │    (50%)        │
│                  │                 │
│                  │                 │
└──────────────────┴─────────────────┘
```

**Uso:** Comparar dos conversaciones, Chat + Perfil

#### 5.3.3 Vertical Split (2 contenedores)

```
┌────────────────────────────────────┐
│                                    │
│       DynamicContainer 1           │
│            (50%)                   │
├────────────────────────────────────┤
│                                    │
│       DynamicContainer 2           │
│            (50%)                   │
└────────────────────────────────────┘
```

**Uso:** Chat arriba + Herramienta abajo

### 5.4 Toolbar (Controles del Canvas)

Ubicado en la parte superior del Canvas:

**Elementos:**
- Título: "Lienzo Dinámico (N contenedores)"
- Botón "Split Horizontal" → Divide en 2 (50%/50%)
- Botón "Split Vertical" → Divide verticalmente

**Lógica de split:**
```typescript
splitCanvas(direction: 'horizontal' | 'vertical') {
  if (containers.length >= 2) {
    // Solo cambiar dirección del layout
    return { layout: `${direction}-split` };
  }

  // Crear segundo contenedor
  const newContainer = {
    id: `container-${Date.now()}`,
    tabs: [],
    width: '50%'
  };

  return {
    layout: `${direction}-split`,
    containers: [
      { ...container1, width: '50%' },
      newContainer
    ]
  };
}
```

### 5.5 Modo Expandido (100%)

Cuando un Dynamic Container se expande:

```
┌────────────────────────────────────┐
│ 🔵 Modo expandido (100%)    [Volver]│
├────────────────────────────────────┤
│                                    │
│                                    │
│       DynamicContainer             │
│          (Fullscreen)              │
│                                    │
│                                    │
└────────────────────────────────────┘
```

**Comportamiento:**
- Otros contenedores se ocultan (NO se eliminan)
- Banner azul indica modo expandido
- Botón "Volver" restaura layout anterior

### 5.6 Implementación

**Archivo:** `src/components/workspace/Canvas.tsx`

```tsx
export default function Canvas() {
  const { containers, layout, expandedContainerId } = useWorkspaceStore();
  const { theme } = useTheme();

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <CanvasToolbar />

      {/* Expanded Mode Banner */}
      {expandedContainerId && <ExpandedModeBanner />}

      {/* Containers */}
      <div
        className="flex-1 flex"
        style={{
          flexDirection: layout === 'vertical-split' ? 'column' : 'row'
        }}
      >
        {expandedContainerId ? (
          <DynamicContainer containerId={expandedContainerId} />
        ) : (
          containers.map(c => (
            <DynamicContainer key={c.id} containerId={c.id} />
          ))
        )}
      </div>
    </div>
  );
}
```

### 5.7 Responsabilidades

✅ **SÍ hace:**
- Renderizar todos los Dynamic Containers activos
- Gestionar layout (single, horizontal-split, vertical-split)
- Proveer controles para dividir el lienzo
- Manejar modo expandido

❌ **NO hace:**
- Gestionar tabs (responsabilidad del Dynamic Container)
- Renderizar contenido de herramientas
- Contener lógica de negocio

---

## 6. Nivel 4: Dynamic Container

### 6.1 Definición

El **Dynamic Container** (Contenedor Dinámico) es la unidad mínima de trabajo del sistema, capaz de contener múltiples **tabs** de herramientas y renderizar la activa.

### 6.2 Características

- **Multi-tab**: Múltiples herramientas en tabs (como navegador)
- **Autónomo**: Gestión independiente de tabs
- **Closable**: Puede cerrarse sin afectar otros
- **Duplicable**: Crea copia exacta con las mismas tabs
- **Expandable**: Modo fullscreen temporal

### 6.3 Anatomía

```
┌───────────────────────────────────────────────────────────┐
│ Tab Bar                                           [+] [⋮] │
│ ┌────────┬─────────┬─────────┐                           │
│ │ Juan   │ María ✕ │ Tool  ✕ │                           │
│ └────────┴─────────┴─────────┘                           │
├───────────────────────────────────────────────────────────┤
│                                                           │
│                    Tool Content Area                      │
│           (ChatArea / ContactArea / ToolArea)            │
│                                                           │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Componentes:**
1. **Tab Bar** - Barra superior con tabs
2. **Container Controls** - Botones + (split) y ⋮ (menú)
3. **Content Area** - Área que renderiza la tool activa

### 6.4 Tab Structure

```typescript
interface Tab {
  id: string;                  // 'chat-conv-123'
  type: 'conversation' | 'customer_profile' | 'order' | 'analytics';
  label: string;               // 'Juan Pérez'
  entityId: string;            // 'conv-123'
  closable: boolean;           // true (mayoría)
}

interface DynamicContainer {
  id: string;                  // 'container-1'
  tabs: Tab[];                 // Lista de tabs
  activeTabId: string | null;  // ID de tab activa
  width: string;               // '50%' | '100%'
}
```

### 6.5 Container Menu (⋮)

**Opciones:**
1. **Duplicar contenedor** → Crea copia exacta con mismas tabs
2. **Expandir al 100%** → Modo fullscreen
3. **Cerrar contenedor** → Elimina contenedor y todas sus tabs

**Colores:**
- Opciones 1-2: `neutral-900` (texto negro)
- Opción 3: `semantic.danger` (rojo)

### 6.6 Botón + (Split)

```typescript
handleAddAdjacentSpace() {
  splitCanvas('horizontal');  // Crea contenedor adyacente
}
```

**Comportamiento:**
- Si containers.length < 2: crea nuevo contenedor vacío
- Si containers.length >= 2: solo cambia layout direction

### 6.7 Estados del Container

#### 6.7.1 Vacío (sin tabs)

```
┌───────────────────────────────────────────┐
│  Tab Bar                         [+] [⋮]  │
├───────────────────────────────────────────┤
│                                           │
│         💬                                │
│    No hay tabs abiertas                   │
│ Selecciona elemento del sidebar           │
│                                           │
└───────────────────────────────────────────┘
```

#### 6.7.2 Con 1 tab

```
┌───────────────────────────────────────────┐
│ ┌──────────┐                     [+] [⋮]  │
│ │ Juan  ✕  │                               │
│ └──────────┘                               │
├───────────────────────────────────────────┤
│                                           │
│         ChatArea(conversationId='123')    │
│                                           │
└───────────────────────────────────────────┘
```

#### 6.7.3 Con múltiples tabs

```
┌───────────────────────────────────────────┐
│ ┌─────┬────────┬────────┐        [+] [⋮]  │
│ │Juan │ María ✕│ Pedro ✕│                 │
│ └─────┴────────┴────────┘                 │
├───────────────────────────────────────────┤
│                                           │
│         ChatArea activo                   │
│                                           │
└───────────────────────────────────────────┘
```

### 6.8 Implementación

**Archivo:** `src/components/workspace/DynamicContainer.tsx`

```tsx
export default function DynamicContainer({ containerId }: Props) {
  const container = useContainer(containerId);
  const { setActiveTab, closeTab, setActiveContainer } = useWorkspaceStore();
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const activeTab = container.tabs.find(t => t.id === container.activeTabId);
  const isActive = activeContainerId === containerId;

  return (
    <div
      onClick={() => setActiveContainer(containerId)}
      style={{
        width: container.width,
        border: `${isActive ? '2px' : '1px'} solid ${
          isActive ? theme.colors.primary[500] : theme.colors.neutral[200]
        }`
      }}
    >
      {/* Tab Bar */}
      <TabBar
        tabs={container.tabs}
        activeTabId={container.activeTabId}
        onTabClick={(id) => setActiveTab(id, containerId)}
        onCloseTab={(id, e) => {
          e.stopPropagation();
          closeTab(id, containerId);
        }}
      />

      {/* Content Area */}
      <ContentArea activeTab={activeTab} />
    </div>
  );
}
```

### 6.9 Responsabilidades

✅ **SÍ hace:**
- Mostrar barra de tabs con todas las tabs
- Renderizar herramienta de la tab activa
- Gestionar activación y cierre de tabs
- Proveer menú de opciones (duplicar, expandir, cerrar)
- Proveer botón + para split
- Indicar visualmente si está activo

❌ **NO hace:**
- Gestionar el layout del Canvas
- Conocer otros contenedores
- Manejar lógica de negocio de las herramientas
- Persistir datos (responsabilidad del store)

---

## 7. Nivel 5: Tool Areas

### 7.1 Definición

Las **Tool Areas** (Áreas de Herramientas) son los componentes finales que renderizan contenido específico dentro de un Dynamic Container.

### 7.2 Tipos de Tool Areas

#### 7.2.1 ChatArea

**Propósito:** Mostrar conversación de mensajería

**Props:**
```typescript
interface ChatAreaProps {
  conversationId: string;  // ÚNICA prop
}
```

**Arquitectura Interna:**
```
ChatArea(conversationId)
├── ChatHeader(conversationId)     // Avatar, nombre, estado
├── MessageList(conversationId)    // Lista de mensajes
└── MessageInput(conversationId)   // Input fijo en bottom
```

**Características:**
- MessageInput con `position: absolute` en bottom
- MessageList con `paddingBottom: '120px'` para compensar
- Auto-scroll en nuevos mensajes
- Validación de input (1-4096 caracteres)

**Archivo:** `src/components/chat/ChatArea.tsx`

#### 7.2.2 ContactArea

**Propósito:** Perfil detallado de un contacto

**Props:**
```typescript
interface ContactAreaProps {
  contactId: string;
}
```

**Contenido:**
- Avatar y datos básicos
- Historial de conversaciones
- Notas y tags
- Campos personalizados

**Estado:** 🚧 En desarrollo

#### 7.2.3 ToolArea

**Propósito:** Herramientas del sistema (transcriptor, analizador, etc.)

**Props:**
```typescript
interface ToolAreaProps {
  toolId: string;
}
```

**Ejemplos:**
- Transcriptor de audio → texto
- Analizador semántico de mensajes
- Buscador interno
- Dashboard de métricas

**Estado:** 🚧 En desarrollo

#### 7.2.4 PluginRenderArea

**Propósito:** Renderizar plugins de terceros

**Props:**
```typescript
interface PluginRenderAreaProps {
  pluginId: string;
}
```

**Características:**
- Sandbox seguro para plugins
- Acceso controlado a APIs de FluxCore
- Comunicación vía postMessage

**Estado:** 🚧 Futuro

### 7.3 Patrón ID-Based

**Regla fundamental:**
> Todas las Tool Areas reciben únicamente IDs como props, nunca datos completos.

**Por qué:**
```tsx
// ❌ INCORRECTO - Prop drilling, no escalable
<ChatArea
  conversation={conversationData}
  messages={messagesData}
  contact={contactData}
/>

// ✅ CORRECTO - ID-based, escalable
<ChatArea conversationId="conv-123" />
```

**Ventajas:**
1. **Múltiples instancias** - Puedes tener N ChatAreas con diferentes IDs
2. **Re-renders selectivos** - Solo re-renderiza el que cambió
3. **Desacoplamiento** - Tool Area no depende del padre
4. **Testabilidad** - Fácil mockear store por ID

### 7.4 Flujo de Datos

```
DynamicContainer renderiza Tool Area
  ↓
Tool Area lee su ID del prop
  ↓
Tool Area subscribe al store por ese ID
  ↓
Store notifica cambios SOLO a ese ID
  ↓
SOLO esa Tool Area re-renderiza
```

### 7.5 Ejemplo Completo: ChatArea

**Archivo:** `src/components/chat/ChatArea.tsx`

```tsx
export default function ChatArea({ conversationId }: ChatAreaProps) {
  const { theme } = useTheme();

  if (!conversationId) {
    return <EmptyState message="No conversation selected" />;
  }

  return (
    <div className="h-full" style={{ position: 'relative' }}>
      {/* Header */}
      <ChatHeader conversationId={conversationId} />

      {/* Messages con padding para input fixed */}
      <div className="flex-1 overflow-hidden" style={{ paddingBottom: '120px' }}>
        <MessageList conversationId={conversationId} />
      </div>

      {/* Input FIXED en bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: theme.spacing[4],
        borderTop: `1px solid ${theme.colors.neutral[200]}`,
        backgroundColor: theme.colors.neutral[0]
      }}>
        <MessageInput conversationId={conversationId} />
      </div>
    </div>
  );
}
```

### 7.6 Responsabilidades

✅ **SÍ hace:**
- Renderizar UI específica de la herramienta
- Leer datos del store por ID
- Emitir eventos de usuario
- Validar inputs localmente

❌ **NO hace:**
- Saber cuántas instancias existen
- Gestionar tabs o layout
- Persistir datos (eso es el store)
- Conocer otros Tool Areas

---

## 8. Sistema de Design Tokens

### 8.1 Principio SSOT (Single Source of Truth)

**Regla absoluta:**
> Ningún componente puede definir colores, tipografía o espaciado propio. Todo debe provenir de `theme.json`.

### 8.2 Estructura de Tokens

**Archivo:** `src/theme/theme.json`

```json
{
  "name": "Professional Light",
  "type": "light",
  "colors": {
    "primary": {
      "50": "#f0f9ff",
      "500": "#0ea5e9",
      "600": "#0284c7",
      "900": "#0c4a6e"
    },
    "neutral": {
      "0": "#ffffff",
      "50": "#fafafa",
      "100": "#f5f5f5",
      "500": "#737373",
      "900": "#171717"
    },
    "semantic": {
      "success": "#10b981",
      "warning": "#f59e0b",
      "danger": "#ef4444",
      "dangerLight": "#fee2e2"
    },
    "channels": {
      "whatsapp": { "100": "#d1f4e0", "800": "#0a7e42" },
      "telegram": { "100": "#cfe2ff", "800": "#004085" }
    }
  },
  "typography": {
    "fontFamily": { "base": "Inter, sans-serif" },
    "sizes": { "xs": "12px", "sm": "14px", "base": "16px", "xl": "20px" },
    "weights": { "normal": "400", "medium": "500", "bold": "700" }
  },
  "spacing": { "0": "0px", "1": "4px", "2": "8px", "4": "16px", "8": "32px" },
  "radius": { "sm": "4px", "md": "8px", "lg": "12px", "full": "9999px" },
  "elevation": {
    "sm": "0px 1px 2px rgba(0, 0, 0, 0.05)",
    "base": "0px 4px 6px rgba(0, 0, 0, 0.07)",
    "lg": "0px 10px 15px rgba(0, 0, 0, 0.1)"
  },
  "transitions": { "fast": "150ms", "base": "200ms", "slow": "300ms" },
  "zIndex": { "dropdown": "10", "modal": "20", "tooltip": "40" }
}
```

### 8.3 Uso en Componentes

```tsx
import { useTheme } from '@/theme';

function MyComponent() {
  const { theme } = useTheme();

  return (
    <div style={{
      backgroundColor: theme.colors.neutral[0],
      color: theme.colors.neutral[900],
      padding: theme.spacing[4],
      borderRadius: theme.radius.md,
      fontSize: theme.typography.sizes.base,
      fontFamily: theme.typography.fontFamily.base,
      boxShadow: theme.elevation.base,
      transition: `all ${theme.transitions.base}`
    }}>
      Contenido
    </div>
  );
}
```

### 8.4 WCAG 2.1 AA/AAA Compliance

**Contraste Mínimo:**
- Texto normal: **4.5:1**
- Texto grande: **3:1**
- UI non-text: **3:1**

**Validación automática:**
```typescript
import { validateContrast } from '@/theme';

const result = validateContrast(
  theme.colors.primary[500],
  theme.colors.neutral[0]
);

console.log(result.passAA);  // true/false
console.log(result.ratio);   // 3.24
```

### 8.5 Casos de Uso del Theme

#### 8.5.1 Texto Visible en Input

```tsx
// ❌ ANTES (texto invisible)
<input style={{ backgroundColor: '#fff' }} />

// ✅ DESPUÉS (texto visible)
<input style={{
  backgroundColor: theme.colors.neutral[0],
  color: theme.colors.neutral[900]
}} />
```

#### 8.5.2 Contraste de Botones

```tsx
// Botón primario
<button style={{
  backgroundColor: theme.colors.primary[500],
  color: theme.colors.neutral[0]  // Blanco sobre azul
}}>

// Botón danger
<button style={{
  backgroundColor: theme.colors.semantic.danger,
  color: theme.colors.neutral[0]
}}>
```

#### 8.5.3 Iconos Visibles

```tsx
// ❌ ANTES (icono invisible)
<Plus size={16} />

// ✅ DESPUÉS (icono visible)
<Plus size={16} style={{ color: theme.colors.neutral[700] }} />
```

Ver documentación completa: [src/theme/README.md](../../src/theme/README.md)

---

## 9. Flujos de Usuario

### 9.1 Flujo A: Abrir Primera Conversación

```
1. Usuario abre FluxCore
   → Activity Bar muestra "Mensajes" por defecto

2. Primary Sidebar muestra lista de conversaciones
   → ConversationListView con 10 conversaciones

3. Usuario hace click en "Juan Pérez"
   → workspaceStore.openTab({
       id: 'chat-conv-123',
       type: 'conversation',
       label: 'Juan Pérez',
       entityId: 'conv-123'
     })

4. Canvas renderiza DynamicContainer con 1 tab
   → Tab "Juan Pérez" activa

5. DynamicContainer renderiza ChatArea(conversationId='conv-123')
   → ChatHeader muestra avatar y nombre
   → MessageList muestra historial de mensajes
   → MessageInput permite escribir
```

### 9.2 Flujo B: Split View (2 Conversaciones)

```
1. Usuario ya tiene abierta conversación con "Juan Pérez"

2. Usuario hace click en "Split Horizontal" en Canvas toolbar
   → Canvas crea segundo DynamicContainer
   → Layout cambia a 'horizontal-split'
   → Ambos containers ocupan 50%

3. Usuario hace click en "María García" en la sidebar
   → workspaceStore.openTab en container activo (el 2do)

4. Usuario ve:
   ┌──────────────────┬─────────────────┐
   │ Juan Pérez       │ María García    │
   │ [Mensajes...]    │ [Mensajes...]   │
   └──────────────────┴─────────────────┘
```

### 9.3 Flujo C: Múltiples Tabs en un Container

```
1. Usuario tiene abierto "Juan Pérez" en tab 1

2. Usuario hace click en "María García" en la sidebar
   → workspaceStore.openTab en el MISMO container

3. DynamicContainer ahora tiene 2 tabs:
   ┌────────┬──────────┐
   │ Juan   │ María ✕  │
   └────────┴──────────┘

4. Usuario puede:
   - Cambiar entre tabs haciendo click
   - Cerrar tab con ✕
   - Abrir más tabs (N tabs)
```

### 9.4 Flujo D: Expandir Container

```
1. Usuario tiene 2 containers en split view

2. Usuario hace click en ⋮ → "Expandir al 100%"
   → workspaceStore.expandContainer(containerId)

3. Canvas oculta el otro container
   → Muestra banner azul "Modo expandido"
   → Container activo ocupa 100%

4. Usuario hace click "Volver a vista normal"
   → workspaceStore.collapseContainer()
   → Vuelve al split anterior
```

### 9.5 Flujo E: Cambiar de Dominio

```
1. Usuario está en dominio "Mensajes"
   → Sidebar muestra ConversationListView

2. Usuario hace click en "Contactos" en Activity Bar
   → workspaceStore.setActiveActivity('contacts')
   → Sidebar cambia a ContactsView

3. Canvas NO cambia
   → Contenedores y tabs permanecen intactos
   → Usuario puede volver a "Mensajes" sin perder estado
```

---

## 10. Escalabilidad y Extensibilidad

### 10.1 De 1 a N Conversaciones

**MVP (1 conversación):**
```tsx
<Layout>
  <ActivityBar />
  <PrimarySidebar />
  <Canvas>
    <DynamicContainer>
      <ChatArea conversationId={activeId} />
    </DynamicContainer>
  </Canvas>
</Layout>
```

**Fase 2 (Múltiples tabs):**
```tsx
<DynamicContainer>
  {tabs.map(tab => (
    <TabPanel key={tab.id} isActive={tab.id === activeTabId}>
      <ChatArea conversationId={tab.entityId} />
    </TabPanel>
  ))}
</DynamicContainer>
```

**Fase 3 (Split view):**
```tsx
<Canvas>
  <DynamicContainer>
    <ChatArea conversationId="conv-123" />
  </DynamicContainer>
  <DynamicContainer>
    <ChatArea conversationId="conv-456" />
  </DynamicContainer>
</Canvas>
```

**Clave:** ChatArea no cambia ni una línea.

### 10.2 Agregar Nuevo Dominio

1. Agregar actividad en `ActivityBar.tsx`:
```tsx
{ id: 'analytics', icon: <BarChart />, label: 'Analytics' }
```

2. Crear vista en `PrimarySidebar.tsx`:
```tsx
{activeActivity === 'analytics' && <AnalyticsView />}
```

3. Crear Tool Area:
```tsx
// components/analytics/AnalyticsArea.tsx
export default function AnalyticsArea({ analyticsId }: Props) {
  // Implementación
}
```

4. Registrar en `DynamicContainer.tsx`:
```tsx
{activeTab.type === 'analytics' && (
  <AnalyticsArea analyticsId={activeTab.entityId} />
)}
```

**Resultado:** Nuevo dominio funcional sin modificar código existente.

### 10.3 Sistema de Plugins

**Futuro:** Permitir plugins de terceros que se integren nativamente.

**Interfaz de Plugin:**
```typescript
interface Plugin {
  id: string;
  name: string;
  version: string;

  // Hooks de UI
  renderToolArea: (props: ToolAreaProps) => React.ReactNode;
  renderSidebarItem?: (props: SidebarItemProps) => React.ReactNode;

  // Hooks de datos
  onMessageReceived?: (message: Message) => void;
  onConversationOpened?: (conversationId: string) => void;

  // Permisos
  permissions: ('read:messages' | 'write:messages' | 'read:contacts')[];
}
```

**Ejemplo de Plugin CRM:**
```tsx
const CRMPlugin: Plugin = {
  id: 'crm-integration',
  name: 'CRM Integration',
  version: '1.0.0',

  renderToolArea: ({ entityId }) => (
    <CRMCustomerProfile customerId={entityId} />
  ),

  renderSidebarItem: ({ entity }) => (
    <CRMBadge customer={entity} />
  ),

  permissions: ['read:messages', 'read:contacts']
};
```

### 10.4 Multi-tenant Support

**Concepto:** Cada workspace puede tener su propio tema.

```typescript
interface Workspace {
  id: string;
  name: string;
  theme: Theme;  // theme.json específico
  plugins: Plugin[];
  settings: WorkspaceSettings;
}
```

**Implementación:**
```tsx
<ThemeProvider theme={workspace.theme}>
  <WorkspaceContainer workspaceId={workspace.id} />
</ThemeProvider>
```

### 10.5 Internacionalización (i18n)

**Futuro:** Soporte para múltiples idiomas.

```typescript
interface Translation {
  'es-AR': {
    'sidebar.conversations.title': 'Conversaciones',
    'sidebar.conversations.search': 'Buscar conversaciones...'
  },
  'en-US': {
    'sidebar.conversations.title': 'Conversations',
    'sidebar.conversations.search': 'Search conversations...'
  }
}
```

---

## Conclusión

La **arquitectura de tres niveles de FluxCore** proporciona:

1. **Escalabilidad** - De 1 a N vistas sin cambiar código
2. **Flexibilidad** - Usuarios organizan su workspace como necesitan
3. **Extensibilidad** - Nuevos dominios y plugins se integran fácilmente
4. **Consistencia** - Design Tokens garantizan UI uniforme
5. **Accesibilidad** - WCAG 2.1 AA compliance automático
6. **Performance** - Re-renders selectivos por ID

Esta arquitectura está diseñada para soportar el crecimiento de FluxCore desde un MVP hasta una plataforma enterprise con múltiples workspaces, plugins de terceros y personalización total.

---

**FluxCore** - Workspace modular profesional para mensajería omnicanal.
