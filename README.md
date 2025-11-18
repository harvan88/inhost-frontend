# INHOST Frontend - FluxCore

Plataforma moderna de mensajería omnicanal con arquitectura modular de tres niveles.

## 🏗️ Arquitectura

FluxCore implementa una **arquitectura de tres niveles** inspirada en VS Code y entornos de desarrollo modernos:

```
┌─────────────────────────────────────────────────────────────┐
│  Nivel 1: Activity Bar   │ Nivel 2: Sidebar  │ Nivel 3: Canvas │
│  (Dominios)              │ (Contexto)        │ (Workspace)     │
├──────────────────────────┼───────────────────┼─────────────────┤
│  [💬] Mensajes           │ Conversaciones    │                 │
│  [👥] Contactos          │ Lista filtrable   │  Dynamic        │
│  [🔧] Herramientas       │ Con badges        │  Containers     │
│  [🧩] Plugins            │ Ordenadas         │  (multi-view)   │
│                          │                   │                 │
│  Estático (4-6 íconos)   │  Dinámico         │  Multi-tab      │
└──────────────────────────┴───────────────────┴─────────────────┘
```

Ver [documentación completa de arquitectura](./docs/architecture/THREE_LEVEL_ARCHITECTURE.md).

## ✨ Características

### Implementadas

✅ **Arquitectura de tres niveles** - Workspace modular y escalable
✅ **Design Tokens System** - Tema centralizado con WCAG 2.1 AA/AAA compliance
✅ **Contenedores Dinámicos** - Multi-view con tabs, split, expand
✅ **ChatArea** - Conversaciones con MessageList + MessageInput
✅ **Gestión de Estado** - Zustand con arquitectura ID-based
✅ **Real-time** - WebSocket support para mensajes instantáneos
✅ **Responsive Design** - Mobile-first, adaptable

### En Desarrollo

🚧 **ContactArea** - Perfiles detallados de contactos
🚧 **ToolArea** - Herramientas del sistema (transcriptor, analizador)
🚧 **PluginRenderArea** - Sistema de plugins extensibles
🚧 **Split View Resizable** - Redimensionar divisores manualmente

## 🎨 Sistema de Tema

FluxCore utiliza un **sistema de Design Tokens centralizados** basado en W3C:

- **Single Source of Truth**: `src/theme/theme.json`
- **WCAG 2.1 AA/AAA**: Contraste automático validado
- **Multi-tema**: Soporte para light/dark modes
- **Type-safe**: TypeScript + utilidades de validación

Ver [documentación de tema](./src/theme/README.md).

## 📦 Tech Stack

- ⚡ **Vite** - Build tool optimizado para Bun
- ⚛️ **React 18** - Hooks, Concurrent Features
- 🎨 **Tailwind CSS** - Utility-first (+ inline styles con theme tokens)
- 📘 **TypeScript** - Type-safety completo
- 🗄️ **Zustand** - State management minimalista
- 🔌 **WebSocket** - Real-time messaging
- ♿ **WCAG 2.1 AA** - Accesibilidad certificada

## 🚀 Desarrollo

### Prerequisitos

1. **Bun** instalado (`curl -fsSL https://bun.sh/install | bash`)
2. **API Gateway corriendo** en puerto 3000

### Instalación

```bash
# Desde el directorio raíz del monorepo
bun install

# Iniciar frontend
bun --cwd apps/frontend dev

# O si estás en apps/frontend/
bun dev
```

Frontend disponible en: **http://localhost:5173**

### Configuración de Proxy

El dev server proxea automáticamente:

- **API**: `/api/*` → `http://localhost:3000/*`
- **WebSocket**: `/realtime` → `ws://localhost:3000/realtime`

## 📁 Estructura del Proyecto

```
inhost-frontend/
├── src/
│   ├── components/           # Componentes React
│   │   ├── workspace/       # Nivel 1-3: Activity Bar, Sidebar, Canvas, Container
│   │   ├── chat/            # ChatArea, MessageList, MessageInput, ChatHeader
│   │   └── ui/              # Componentes reutilizables
│   ├── store/               # Zustand state management
│   │   ├── index.ts         # Store principal (entities, UI, network)
│   │   └── workspace.ts     # Workspace state (containers, tabs, layout)
│   ├── theme/               # Sistema de Design Tokens
│   │   ├── theme.json       # SSOT para colores, tipografía, spacing
│   │   ├── ThemeProvider.tsx
│   │   └── utils.ts         # Validación WCAG
│   ├── types/               # TypeScript types
│   │   └── index.ts         # Message, Conversation, Contact, etc.
│   ├── services/            # API client
│   │   └── api.ts
│   ├── hooks/               # Custom hooks
│   └── App.tsx              # Root component
│
├── docs/                    # 📚 Documentación
│   ├── architecture/
│   │   └── THREE_LEVEL_ARCHITECTURE.md  # Arquitectura completa
│   ├── GLOSSARY.md          # Glosario de términos
│   ├── COMPONENTS.md        # Guía de componentes
│   └── guides/
│       └── SETUP.md
│
├── tools/                   # 🛠️ Herramientas independientes
│   └── theme-builder/       # Visual color palette tool
│
├── public/                  # Assets estáticos
├── WCAG_AUDIT_REPORT.md     # Reporte de auditoría de accesibilidad
└── package.json
```

## 🧩 Componentes Clave

### Workspace (Arquitectura de 3 Niveles)

- **ActivityBar** - Barra lateral izquierda con dominios (Mensajes, Contactos, etc.)
- **PrimarySidebar** - Barra contextual con listas/árboles del dominio activo
- **Canvas** - Lienzo dinámico que contiene DynamicContainers
- **DynamicContainer** - Contenedor con tabs que renderiza herramientas

### Chat

- **ChatArea** - Orquestador principal de conversación (ID-based)
- **ChatHeader** - Header con contacto, avatar, estado
- **MessageList** - Lista de mensajes con auto-scroll
- **MessageBubble** - Burbuja individual con badges (channel, type)
- **MessageInput** - Input con validación y contador de caracteres

Ver [guía completa de componentes](./docs/COMPONENTS.md).

## 🎯 Principios de Diseño

### 1. ID-Based Architecture

Todos los componentes reciben **IDs** en lugar de datos completos:

```tsx
// ✅ Correcto
<ChatArea conversationId="conv-123" />

// ❌ Incorrecto
<ChatArea conversation={conversationData} />
```

**Por qué:** Permite múltiples instancias sin prop drilling, re-renders selectivos.

### 2. Separation of Concerns

- **Layout** → Estructura física (grid, responsive)
- **Containers** → Lógica de orquestación (fetch, subscribe)
- **Presentational** → UI pura (renderizado, eventos)

### 3. Design Tokens Everywhere

Ningún componente define colores, tipografía o espaciado propio:

```tsx
// ✅ Correcto
const { theme } = useTheme();
<div style={{ color: theme.colors.neutral[900] }}>

// ❌ Incorrecto
<div style={{ color: '#171717' }}>
```

### 4. WCAG 2.1 AA Compliance

- Contraste mínimo 4.5:1 para texto
- Contraste 3:1 para UI non-text
- Validación automática en theme

## 📊 Gestión de Estado

FluxCore utiliza **Zustand** con tres dominios separados:

```typescript
interface AppState {
  // DOMINIO 1: Entidades (persisten, se cachean)
  entities: {
    conversations: Map<string, Conversation>,
    messages: Map<string, Message[]>,
    contacts: Map<string, Contact>
  },

  // DOMINIO 2: UI (efímero, solo frontend)
  ui: {
    activeConversationId: string | null,
    sidebarCollapsed: boolean,
    theme: 'light' | 'dark'
  },

  // DOMINIO 3: Network (transitorio, sincronización)
  network: {
    connectionStatus: 'connected' | 'disconnected',
    pendingMessages: Set<string>,
    lastSync: Map<string, number>
  }
}
```

Ver [documentación de store](./src/store/README.md).

## 🔍 Testing

```bash
# Type checking
bun run type-check

# Build (verifica errores)
bun run build

# Preview build de producción
bun run preview
```

## 📝 Variables de Entorno

Crear `.env` (opcional):

```env
VITE_API_URL=http://localhost:3000
```

## 🐛 Troubleshooting

### "Failed to fetch" errors

**Causa:** API Gateway no está corriendo

**Solución:**
```bash
bun --cwd apps/api-gateway dev
```

### Texto invisible en inputs

**Causa:** Falta color del theme

**Solución:** Todos los elementos deben usar `theme.colors.*`

### Mensajes superpuestos

**Causa:** Virtual scrolling con absolute positioning

**Solución:** Usar flujo normal con `marginBottom` entre mensajes

## 📚 Documentación Adicional

- [Arquitectura de Tres Niveles](./docs/architecture/THREE_LEVEL_ARCHITECTURE.md)
- [Glosario de Términos](./docs/GLOSSARY.md)
- [Guía de Componentes](./docs/COMPONENTS.md)
- [Sistema de Tema](./src/theme/README.md)
- [Reporte WCAG](./WCAG_AUDIT_REPORT.md)

## 🤝 Contribuir

### Guidelines

1. **Arquitectura ID-based** - Componentes reciben IDs, no datos
2. **Design Tokens** - Usar `theme.*` para todos los estilos
3. **TypeScript strict** - Todo debe estar tipado
4. **WCAG compliance** - Validar contraste antes de commit
5. **Documentar** - Componentes complejos llevan comentarios JSDoc

### Commit Messages

```bash
feat: Implementar ContactArea con perfiles detallados
fix: Corregir contraste en MessageBubble para WCAG AA
refactor: Extraer lógica de tabs a hook reutilizable
docs: Actualizar arquitectura con sección de plugins
```

## 📄 Licencia

Parte del proyecto INHOST.

---

**FluxCore** - La próxima generación de workspaces modulares.
