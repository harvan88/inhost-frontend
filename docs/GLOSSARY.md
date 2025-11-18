# Glosario de Términos - FluxCore

Diccionario completo de términos técnicos, conceptos arquitectónicos y componentes de FluxCore.

---

## Índice por Categoría

- [Arquitectura](#arquitectura)
- [Componentes](#componentes)
- [Estado y Datos](#estado-y-datos)
- [UI y Diseño](#ui-y-diseño)
- [Patrones y Conceptos](#patrones-y-conceptos)
- [Términos Generales](#términos-generales)

---

## Arquitectura

### Activity Bar
**Sinónimos:** Barra de Actividad

**Definición:** Columna vertical persistente ubicada en el extremo izquierdo que contiene los dominios operativos principales (Mensajes, Contactos, Herramientas, Plugins).

**Características:**
- Siempre visible
- Número fijo de actividades (4-6)
- Representación icon-only
- No cambia según contexto

**Archivo:** `src/components/workspace/ActivityBar.tsx`

**Ver:** [Arquitectura - Nivel 1](./architecture/THREE_LEVEL_ARCHITECTURE.md#3-nivel-1-activity-bar)

---

### Canvas
**Sinónimos:** Lienzo Dinámico, Dynamic Canvas, Workspace Canvas

**Definición:** Área principal de trabajo que contiene uno o más Dynamic Containers, soporta split views y gestiona la distribución espacial.

**Responsabilidades:**
- Renderizar Dynamic Containers
- Gestionar layout (single, horizontal-split, vertical-split)
- Proveer controles para dividir el lienzo
- Manejar modo expandido

**Archivo:** `src/components/workspace/Canvas.tsx`

**Ver:** [Arquitectura - Nivel 3](./architecture/THREE_LEVEL_ARCHITECTURE.md#5-nivel-3-canvas)

---

### Dynamic Container
**Sinónimos:** Contenedor Dinámico

**Definición:** Unidad mínima de trabajo que gestiona múltiples tabs de herramientas y renderiza la activa.

**Características:**
- Multi-tab (como navegador)
- Autónomo
- Closable, duplicable, expandable
- Gestión independiente de tabs

**Archivo:** `src/components/workspace/DynamicContainer.tsx`

**Ver:** [Arquitectura - Nivel 4](./architecture/THREE_LEVEL_ARCHITECTURE.md#6-nivel-4-dynamic-container)

---

### ID-Based Architecture
**Definición:** Patrón arquitectónico donde los componentes reciben IDs en lugar de datos completos.

**Ejemplo:**
```tsx
// ✅ Correcto
<ChatArea conversationId="conv-123" />

// ❌ Incorrecto
<ChatArea conversation={conversationData} />
```

**Ventajas:**
- Múltiples instancias sin prop drilling
- Re-renders selectivos
- Desacoplamiento
- Testabilidad

**Ver:** [Principios de Diseño](../README.md#1-id-based-architecture)

---

### Primary Sidebar
**Sinónimos:** Barra Lateral Contextual, Contextual Sidebar

**Definición:** Panel dependiente del dominio seleccionado en la Activity Bar que presenta colecciones navegables de elementos.

**Características:**
- Contextual (depende de actividad)
- Colapsable
- Resizable (futuro)
- Filtrable

**Archivo:** `src/components/workspace/PrimarySidebar.tsx`

**Ver:** [Arquitectura - Nivel 2](./architecture/THREE_LEVEL_ARCHITECTURE.md#4-nivel-2-primary-sidebar)

---

### Three-Level Architecture
**Sinónimos:** Arquitectura de Tres Niveles

**Definición:** Patrón arquitectónico que divide la UI en tres niveles jerárquicos:
1. **Activity Bar** - Dominios
2. **Primary Sidebar** - Contexto del dominio
3. **Canvas** - Workspace con containers

**Inspiración:** VS Code, JetBrains IDEs, Figma

**Ver:** [Documentación completa](./architecture/THREE_LEVEL_ARCHITECTURE.md)

---

### Tool Area
**Sinónimos:** Área de Herramienta

**Definición:** Componente final que renderiza contenido específico dentro de un Dynamic Container.

**Tipos:**
- **ChatArea** - Conversaciones
- **ContactArea** - Perfiles de contactos
- **ToolArea** - Herramientas del sistema
- **PluginRenderArea** - Plugins de terceros

**Ver:** [Arquitectura - Nivel 5](./architecture/THREE_LEVEL_ARCHITECTURE.md#7-nivel-5-tool-areas)

---

## Componentes

### ChatArea
**Definición:** Tool Area que renderiza una conversación completa de mensajería.

**Props:**
```typescript
interface ChatAreaProps {
  conversationId: string;
}
```

**Arquitectura Interna:**
- **ChatHeader** - Avatar, nombre, estado
- **MessageList** - Lista de mensajes
- **MessageInput** - Input fijo en bottom

**Archivo:** `src/components/chat/ChatArea.tsx`

---

### ChatHeader
**Definición:** Componente que muestra información del contacto en la parte superior del ChatArea.

**Contenido:**
- Avatar del contacto
- Nombre
- Estado (online/away/offline)
- Canal activo
- Última conexión

**Archivo:** `src/components/chat/ChatHeader.tsx`

---

### ConversationListItem
**Definición:** Item individual en la lista de conversaciones de la Primary Sidebar.

**Elementos:**
- Avatar
- Nombre del contacto
- Último mensaje (truncado)
- Timestamp relativo
- Badge de canal
- Unread count
- Pin indicator

**Interacción:** Click → abre tab en Dynamic Container

**Archivo:** `src/components/workspace/ConversationListItem.tsx`

---

### MessageBubble
**Definición:** Burbuja individual que representa un mensaje en el MessageList.

**Tipos:**
- **Incoming** - Fondo `neutral-0`, borde `neutral-200`
- **Outgoing** - Fondo `primary-600`, texto blanco
- **System** - Centrado, fondo `neutral-100`

**Elementos:**
- Badges (channel, type)
- Timestamp
- Metadata (from/to)
- Contenido de texto

**Archivo:** `src/components/chat/MessageList.tsx` (función interna)

---

### MessageInput
**Definición:** Input de texto para enviar mensajes, fijo en la parte inferior del ChatArea.

**Características:**
- Validación local (1-4096 caracteres)
- Contador de caracteres con colores
- Loading state
- Error handling
- Auto-focus

**Posicionamiento:**
- `position: absolute`
- `bottom: 0`

**Archivo:** `src/components/chat/MessageInput.tsx`

---

### MessageList
**Definición:** Lista de mensajes de una conversación con scroll automático.

**Características:**
- Auto-scroll en nuevos mensajes
- Flujo normal (sin virtual scrolling)
- Separación vertical (marginBottom)
- Empty state

**Padding:** `paddingBottom: '120px'` (compensa MessageInput fixed)

**Archivo:** `src/components/chat/MessageList.tsx`

---

### TabBar
**Definición:** Barra superior del Dynamic Container que muestra todas las tabs abiertas.

**Elementos:**
- Tabs con label y botón cerrar (✕)
- Indicador visual de tab activa
- Container controls (+ y ⋮)

**Interacción:**
- Click en tab → activa
- Click en ✕ → cierra tab

**Archivo:** `src/components/workspace/DynamicContainer.tsx` (parte del componente)

---

## Estado y Datos

### AppState
**Definición:** Interfaz TypeScript que define la estructura completa del estado global de la aplicación.

**Dominios:**
1. **entities** - Datos persistentes (conversations, messages, contacts)
2. **ui** - Estado efímero de interfaz
3. **network** - Estado de conexión y sincronización

**Archivo:** `src/types/index.ts`

---

### Contact
**Definición:** Entidad que representa un contacto o usuario con quien se pueden tener conversaciones.

```typescript
interface Contact {
  id: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'away' | 'offline';
  email?: string;
  phone?: string;
  company?: string;
  tags?: string[];
  metadata: Record<string, any>;
}
```

**Almacenamiento:** `Map<id, Contact>` en store

---

### Conversation
**Definición:** Entidad que representa un hilo de conversación con un contacto a través de un canal.

```typescript
interface Conversation {
  id: string;
  entityId: string;  // ID del contacto
  channel: 'whatsapp' | 'telegram' | 'web' | 'sms';
  status: 'active' | 'resolved' | 'archived';
  isPinned: boolean;
  unreadCount: number;
  lastMessage?: {
    text: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

**Almacenamiento:** `Map<id, Conversation>` en store

---

### Message
**Definición:** Entidad que representa un mensaje individual dentro de una conversación.

```typescript
interface Message {
  id: string;
  type: 'incoming' | 'outgoing' | 'system';
  channel: 'whatsapp' | 'telegram' | 'web' | 'sms';
  content: { text: string };
  metadata: {
    from: string;
    to: string;
    timestamp: string;
    [key: string]: any;
  };
}
```

**Almacenamiento:** `Map<conversationId, Message[]>` en store

---

### Tab
**Definición:** Representa una herramienta abierta dentro de un Dynamic Container.

```typescript
interface Tab {
  id: string;
  type: 'conversation' | 'customer_profile' | 'order' | 'analytics';
  label: string;
  entityId: string;
  closable: boolean;
}
```

---

### WorkspaceState
**Definición:** Estado específico del workspace (containers, tabs, layout).

```typescript
interface WorkspaceState {
  containers: DynamicContainer[];
  activeContainerId: string | null;
  expandedContainerId: string | null;
  layout: 'single' | 'horizontal-split' | 'vertical-split';
  activeActivity: 'messages' | 'contacts' | 'tools' | 'plugins';
  sidebarVisible: boolean;
  sidebarWidth: number;
}
```

**Archivo:** `src/store/workspace.ts`

---

### Zustand
**Definición:** Librería minimalista de state management usada en FluxCore.

**Ventajas:**
- Boilerplate mínimo
- Subscriptions selectivas
- TypeScript-first
- No necesita Provider wrapper
- DevTools integrados

**Uso:**
```typescript
const useStore = create<AppState>((set) => ({
  entities: { conversations: new Map(), messages: new Map(), contacts: new Map() },
  actions: {
    addMessage: (conversationId, message) => set(state => ({
      messages: new Map(state.messages).set(
        conversationId,
        [...(state.messages.get(conversationId) ?? []), message]
      )
    }))
  }
}));
```

---

## UI y Diseño

### Design Tokens
**Definición:** Sistema de valores visuales centralizados (colores, tipografía, espaciado) definidos en JSON y consumidos por todos los componentes.

**SSOT:** `src/theme/theme.json`

**Categorías:**
- colors (primary, neutral, semantic, channels)
- typography (fontFamily, sizes, weights)
- spacing (0, 1, 2, 4, 8)
- radius (sm, md, lg, full)
- elevation (sm, base, lg)
- transitions (fast, base, slow)
- zIndex (dropdown, modal, tooltip)

**Ver:** [Sistema de Tema](../src/theme/README.md)

---

### SSOT (Single Source of Truth)
**Definición:** Principio de diseño donde existe una única fuente de verdad para cada dato o configuración.

**Aplicación en FluxCore:**
- **Theme:** `theme.json` es SSOT para estilos
- **Estado:** Store de Zustand es SSOT para datos
- **Types:** `types/index.ts` es SSOT para interfaces

**Regla:**
> Ningún componente puede definir colores, tipografía o espaciado propio.

---

### Theme
**Definición:** Conjunto completo de Design Tokens que define la apariencia visual de FluxCore.

**Estructura:**
```typescript
interface Theme {
  name: string;
  type: 'light' | 'dark';
  colors: { /* ... */ };
  typography: { /* ... */ };
  spacing: { /* ... */ };
  radius: { /* ... */ };
  elevation: { /* ... */ };
  transitions: { /* ... */ };
  zIndex: { /* ... */ };
}
```

**Consumo:**
```tsx
const { theme } = useTheme();
```

---

### ThemeProvider
**Definición:** Componente React que provee el tema a toda la aplicación mediante Context API.

**Uso:**
```tsx
<ThemeProvider>
  <App />
</ThemeProvider>
```

**Archivo:** `src/theme/ThemeProvider.tsx`

---

### WCAG 2.1 AA
**Definición:** Web Content Accessibility Guidelines, nivel AA - estándar de accesibilidad web.

**Requisitos principales:**
- Contraste de texto normal: **mínimo 4.5:1**
- Contraste de texto grande: **mínimo 3:1**
- Contraste de UI non-text: **mínimo 3:1**

**FluxCore:** Validación automática de contraste en theme

**Archivo de validación:** `src/theme/utils.ts`

---

## Patrones y Conceptos

### Expanded Mode
**Sinónimos:** Modo Expandido, Fullscreen Mode

**Definición:** Modo donde un Dynamic Container ocupa el 100% del Canvas, ocultando temporalmente otros containers.

**Características:**
- Banner azul indica modo activo
- Otros containers permanecen en memoria
- Botón "Volver" restaura layout anterior

**Uso:** Enfoque total en una herramienta

---

### Horizontal Split
**Definición:** Layout del Canvas donde dos Dynamic Containers están divididos horizontalmente (lado a lado).

```
┌──────────┬──────────┐
│ Cont. 1  │ Cont. 2  │
│  (50%)   │  (50%)   │
└──────────┴──────────┘
```

**Uso:** Comparar dos conversaciones, Chat + Perfil

---

### Layout
**Definición:** Configuración de distribución espacial de Dynamic Containers en el Canvas.

**Valores:**
- `'single'` - 1 container al 100%
- `'horizontal-split'` - 2 containers lado a lado
- `'vertical-split'` - 2 containers arriba/abajo

---

### Prop Drilling
**Definición:** Anti-patrón donde los datos se pasan a través de múltiples niveles de componentes anidados.

**Problema:**
```tsx
<Parent data={data}>
  <Child1 data={data}>
    <Child2 data={data}>
      <Child3 data={data} /> {/* Solo este lo necesita */}
    </Child2>
  </Child1>
</Parent>
```

**Solución en FluxCore:** ID-Based Architecture + Zustand

---

### Re-render Selectivo
**Definición:** Patrón de performance donde solo los componentes afectados por un cambio de estado se vuelven a renderizar.

**Implementación en FluxCore:**
```tsx
// Solo re-renderiza si cambian los mensajes de ESTA conversación
const messages = useStore(
  state => state.messages.get(conversationId) ?? [],
  shallow
);
```

---

### Separation of Concerns
**Definición:** Principio de diseño donde diferentes responsabilidades se separan en módulos independientes.

**Aplicación en FluxCore:**
- **Layout** → Estructura física (grid, responsive)
- **Containers** → Lógica de orquestación (fetch, subscribe)
- **Presentational** → UI pura (renderizado, eventos)

---

### Split View
**Definición:** Modo del Canvas donde dos Dynamic Containers están visibles simultáneamente.

**Tipos:**
- Horizontal Split (lado a lado)
- Vertical Split (arriba/abajo)

**Limitación:** Máximo 2 containers (UX decision)

---

### Vertical Split
**Definición:** Layout del Canvas donde dos Dynamic Containers están divididos verticalmente (arriba/abajo).

```
┌────────────┐
│ Cont. 1    │
│  (50%)     │
├────────────┤
│ Cont. 2    │
│  (50%)     │
└────────────┘
```

**Uso:** Chat arriba + Herramienta abajo

---

## Términos Generales

### Badge
**Definición:** Pequeño indicador visual que muestra información adicional (canal, tipo, contador).

**Ejemplos en FluxCore:**
- Channel badge (WHATSAPP, TELEGRAM, WEB, SMS)
- Type badge (INCOMING, OUTGOING)
- Unread count (número en círculo rojo)

**Colores:** Basados en `theme.colors.channels.*`

---

### Canvas Toolbar
**Definición:** Barra superior del Canvas que muestra información y controles.

**Elementos:**
- Título con contador de containers
- Botón "Split Horizontal"
- Botón "Split Vertical"

**Visibilidad:** Siempre visible

---

### Channel
**Definición:** Canal de comunicación por el cual llegan los mensajes.

**Valores:**
- `'whatsapp'` - WhatsApp
- `'telegram'` - Telegram
- `'web'` - Chat web
- `'sms'` - SMS/Mensajes de texto

**Representación visual:** Badge con color específico

---

### Container Menu
**Definición:** Menú desplegable (⋮) en la esquina superior derecha del Dynamic Container.

**Opciones:**
1. Duplicar contenedor
2. Expandir al 100%
3. Cerrar contenedor

**Comportamiento:** Dropdown con backdrop

---

### Dominio
**Sinónimos:** Domain, Activity

**Definición:** Área operativa principal de FluxCore (Mensajes, Contactos, Herramientas, Plugins).

**Selección:** Click en Activity Bar

**Efecto:** Cambia contenido de Primary Sidebar

---

### Entity
**Sinónimos:** Entidad

**Definición:** Objeto de datos persistente con identidad única (Conversation, Message, Contact).

**Características:**
- Tiene ID único
- Se almacena en store
- Puede tener relaciones con otras entidades
- Persiste en backend (futuro)

---

### FluxCore
**Definición:** Nombre del sistema/producto. Plataforma de mensajería omnicanal con arquitectura de workspace modular.

**Inspiración:** "Flux" (flujo de mensajes) + "Core" (núcleo/fundamento)

---

### ID
**Definición:** Identificador único de una entidad.

**Formato:** Usualmente `string`, ej: `"conv-123"`, `"msg-456"`

**Uso:** Clave en Maps del store, props de componentes

---

### Omnicanal
**Sinónimos:** Omnichannel

**Definición:** Capacidad de gestionar múltiples canales de comunicación (WhatsApp, Telegram, Web, SMS) desde una única plataforma.

---

### Pin
**Sinónimos:** Pinned, Fixed

**Definición:** Acción de "clavar" una conversación al tope de la lista para acceso rápido.

**Implementación:** `conversation.isPinned: boolean`

**Orden:** Pinned first → updatedAt desc

---

### Sidebar Collapse
**Sinónimos:** Toggle Sidebar, Hide/Show Sidebar

**Definición:** Acción de ocultar/mostrar la Primary Sidebar.

**Efecto:** Canvas se expande para ocupar espacio liberado

**Persistencia:** `workspaceStore.sidebarVisible`

---

### Timestamp Relativo
**Definición:** Representación de tiempo en formato legible (ej: "5m", "2h", "ayer").

**Lógica:**
- `< 1 min` → "Ahora"
- `< 60 min` → "Nm"
- `< 24h` → "Nh"
- `>= 24h` → "DD MMM"

**Archivo:** `src/components/workspace/ConversationListItem.tsx`

---

### Unread Count
**Sinónimos:** Badge Count

**Definición:** Contador de mensajes no leídos en una conversación.

**Representación visual:** Badge circular rojo con número blanco

**Lógica:** `conversation.unreadCount: number`

---

### Workspace
**Definición:** Entorno de trabajo del usuario, compuesto por Activity Bar + Primary Sidebar + Canvas.

**Futuro:** Multi-workspace support (diferentes configuraciones, temas, plugins por workspace)

---

## Referencias

- [Arquitectura Completa](./architecture/THREE_LEVEL_ARCHITECTURE.md)
- [README Principal](../README.md)
- [Sistema de Tema](../src/theme/README.md)
- [Guía de Componentes](./COMPONENTS.md)

---

**FluxCore Glossary v1.0** - Última actualización: 2025
