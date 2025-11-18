# Guía de Componentes - FluxCore

Documentación práctica de todos los componentes de FluxCore con ejemplos de código, props, y mejores prácticas.

---

## Tabla de Contenidos

1. [Workspace Components](#workspace-components)
2. [Chat Components](#chat-components)
3. [UI Components](#ui-components)
4. [Hooks Personalizados](#hooks-personalizados)
5. [Mejores Prácticas](#mejores-prácticas)

---

## Workspace Components

### ActivityBar

**Ubicación:** `src/components/workspace/ActivityBar.tsx`

**Propósito:** Barra lateral persistente con dominios principales del sistema.

**Props:** Ninguna (componente autónomo)

**Estado Global:**
- `activeActivity` - Dominio seleccionado
- `sidebarVisible` - Visibilidad de sidebar

**Uso:**
```tsx
import ActivityBar from '@/components/workspace/ActivityBar';

function Workspace() {
  return (
    <div className="flex h-screen">
      <ActivityBar />
      {/* Resto del workspace */}
    </div>
  );
}
```

**Customización:**

Para agregar nueva actividad:
```tsx
// En ActivityBar.tsx
const activities: Activity[] = [
  // ... actividades existentes
  {
    id: 'analytics',
    icon: <BarChart size={20} />,
    label: 'Analytics',
    shortcut: 'Ctrl+Shift+A'
  }
];
```

**Estilos:**
Todos los estilos provienen de `theme`:
```tsx
const { theme } = useTheme();

// Estado inactivo
color: theme.colors.neutral[500]

// Estado hover
color: theme.colors.neutral[700]
backgroundColor: theme.colors.neutral[100]

// Estado activo
color: theme.colors.primary[500]
backgroundColor: theme.colors.primary[50]
borderLeft: `4px solid ${theme.colors.primary[500]}`
```

---

### PrimarySidebar

**Ubicación:** `src/components/workspace/PrimarySidebar.tsx`

**Propósito:** Barra contextual que muestra elementos del dominio activo.

**Props:** Ninguna (lee estado global)

**Estado Global:**
- `activeActivity` - Determina qué vista renderizar
- `sidebarVisible` - Controla visibilidad
- `sidebarWidth` - Ancho en pixels

**Uso:**
```tsx
import PrimarySidebar from '@/components/workspace/PrimarySidebar';

function Workspace() {
  return (
    <div className="flex h-screen">
      <ActivityBar />
      <PrimarySidebar />
      <Canvas />
    </div>
  );
}
```

**Vistas Disponibles:**
```tsx
export default function PrimarySidebar() {
  const { activeActivity, sidebarVisible } = useWorkspaceStore();

  if (!sidebarVisible) return null;

  return (
    <div>
      {activeActivity === 'messages' && <ConversationListView />}
      {activeActivity === 'contacts' && <ContactsView />}
      {activeActivity === 'tools' && <ToolsView />}
      {activeActivity === 'plugins' && <PluginsView />}
    </div>
  );
}
```

**Agregar Nueva Vista:**
```tsx
// 1. Crear componente de vista
function AnalyticsView() {
  const { theme } = useTheme();
  return (
    <div style={{ padding: theme.spacing[4] }}>
      <h2>Analytics</h2>
      {/* Contenido */}
    </div>
  );
}

// 2. Registrar en PrimarySidebar
{activeActivity === 'analytics' && <AnalyticsView />}
```

**Collapse/Expand:**
```tsx
const { toggleSidebar, sidebarVisible } = useWorkspaceStore();

<button onClick={toggleSidebar}>
  {sidebarVisible ? 'Ocultar' : 'Mostrar'} Sidebar
</button>
```

---

### Canvas

**Ubicación:** `src/components/workspace/Canvas.tsx`

**Propósito:** Área principal que contiene Dynamic Containers y gestiona layout.

**Props:** Ninguna (componente autónomo)

**Estado Global:**
- `containers` - Array de containers activos
- `layout` - Tipo de layout (single, horizontal-split, vertical-split)
- `expandedContainerId` - Container en modo fullscreen

**Uso:**
```tsx
import Canvas from '@/components/workspace/Canvas';

function Workspace() {
  return (
    <div className="flex h-screen">
      <ActivityBar />
      <PrimarySidebar />
      <Canvas />
    </div>
  );
}
```

**Operaciones:**

**Split Horizontal:**
```tsx
const { splitCanvas } = useWorkspaceStore();
splitCanvas('horizontal');  // Divide en 2 containers lado a lado
```

**Split Vertical:**
```tsx
splitCanvas('vertical');  // Divide en 2 containers arriba/abajo
```

**Toolbar Personalizado:**
```tsx
// Dentro de Canvas.tsx
<div className="canvas-toolbar">
  <span>{containers.length} contenedores</span>
  <button onClick={() => splitCanvas('horizontal')}>
    <Columns2 size={14} /> Split Horizontal
  </button>
  <button onClick={() => splitCanvas('vertical')}>
    <Rows2 size={14} /> Split Vertical
  </button>
</div>
```

**Layout Modes:**
```tsx
// Single (1 container)
layout === 'single'

// Horizontal Split (2 containers lado a lado)
layout === 'horizontal-split'
// Renderiza: flexDirection: 'row'

// Vertical Split (2 containers arriba/abajo)
layout === 'vertical-split'
// Renderiza: flexDirection: 'column'
```

---

### DynamicContainer

**Ubicación:** `src/components/workspace/DynamicContainer.tsx`

**Propósito:** Contenedor con tabs que renderiza herramientas.

**Props:**
```typescript
interface DynamicContainerProps {
  containerId: string;  // ID único del container
}
```

**Uso:**
```tsx
import DynamicContainer from '@/components/workspace/DynamicContainer';

// Renderizado por Canvas
<DynamicContainer containerId="container-1" />
```

**Estructura Interna:**
```tsx
<div className="dynamic-container">
  {/* Tab Bar */}
  <div className="tab-bar">
    {tabs.map(tab => (
      <Tab
        key={tab.id}
        label={tab.label}
        isActive={tab.id === activeTabId}
        onClose={() => closeTab(tab.id)}
      />
    ))}
  </div>

  {/* Container Controls */}
  <div className="controls">
    <button onClick={handleAddAdjacentSpace}>+</button>
    <button onClick={() => setMenuOpen(true)}>⋮</button>
  </div>

  {/* Content Area */}
  <div className="content">
    {activeTab && renderToolArea(activeTab)}
  </div>
</div>
```

**Operaciones:**

**Agregar Tab:**
```tsx
const { openTab } = useWorkspaceStore();

openTab({
  id: 'chat-conv-123',
  type: 'conversation',
  label: 'Juan Pérez',
  entityId: 'conv-123',
  closable: true
});
```

**Cerrar Tab:**
```tsx
const { closeTab } = useWorkspaceStore();
closeTab('chat-conv-123', 'container-1');
```

**Duplicar Container:**
```tsx
const { duplicateContainer } = useWorkspaceStore();
duplicateContainer('container-1');
// Crea copia exacta con las mismas tabs
```

**Expandir Container:**
```tsx
const { expandContainer } = useWorkspaceStore();
expandContainer('container-1');
// Modo fullscreen, oculta otros containers
```

**Renderizar Tool Area:**
```tsx
function renderToolArea(tab: Tab) {
  switch (tab.type) {
    case 'conversation':
      return <ChatArea conversationId={tab.entityId} />;
    case 'customer_profile':
      return <ContactArea contactId={tab.entityId} />;
    case 'analytics':
      return <AnalyticsArea analyticsId={tab.entityId} />;
    default:
      return <div>Unknown tool type</div>;
  }
}
```

---

### ConversationListItem

**Ubicación:** `src/components/workspace/ConversationListItem.tsx`

**Propósito:** Item individual en la lista de conversaciones.

**Props:**
```typescript
interface ConversationListItemProps {
  conversation: Conversation;
}
```

**Uso:**
```tsx
import ConversationListItem from '@/components/workspace/ConversationListItem';

function ConversationListView() {
  const conversations = useStore(s => s.entities.conversations);

  return (
    <div>
      {Array.from(conversations.values()).map(conv => (
        <ConversationListItem key={conv.id} conversation={conv} />
      ))}
    </div>
  );
}
```

**Características:**
- **Avatar** - Imagen del contacto o placeholder
- **Nombre** - Truncado si es muy largo
- **Último mensaje** - Preview truncado
- **Timestamp** - Relativo ("5m", "2h", "ayer")
- **Channel badge** - WhatsApp, Telegram, etc.
- **Unread count** - Círculo rojo con número
- **Pin indicator** - Ícono de pin si está fijado

**Estado Activo:**
```tsx
const isActiveTab = containers.some(c =>
  c.tabs.some(t => t.entityId === conversation.id && t.id === c.activeTabId)
);

// Estilos condicionales
style={{
  backgroundColor: isActiveTab ? theme.colors.primary[50] : 'transparent',
  borderLeft: isActiveTab ? `4px solid ${theme.colors.primary[500]}` : 'none'
}}
```

**Interacción:**
```tsx
const handleClick = () => {
  openTab({
    id: `chat-${conversation.id}`,
    type: 'conversation',
    label: contact?.name || conversation.entityId,
    entityId: conversation.id,
    closable: true
  });
};
```

---

## Chat Components

### ChatArea

**Ubicación:** `src/components/chat/ChatArea.tsx`

**Propósito:** Orquestador principal de una conversación.

**Props:**
```typescript
interface ChatAreaProps {
  conversationId: string;  // ÚNICA prop requerida
}
```

**Uso:**
```tsx
import ChatArea from '@/components/chat/ChatArea';

// En DynamicContainer
{activeTab.type === 'conversation' && (
  <ChatArea conversationId={activeTab.entityId} />
)}
```

**Arquitectura:**
```tsx
export default function ChatArea({ conversationId }: ChatAreaProps) {
  const { theme } = useTheme();

  return (
    <div className="h-full relative flex flex-col">
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

**Empty State:**
```tsx
if (!conversationId) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p style={{ fontSize: theme.typography.sizes.xl }}>
          No conversation selected
        </p>
        <p style={{ fontSize: theme.typography.sizes.sm }}>
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
}
```

---

### ChatHeader

**Ubicación:** `src/components/chat/ChatHeader.tsx`

**Propósito:** Header de conversación con información del contacto.

**Props:**
```typescript
interface ChatHeaderProps {
  conversationId: string;
}
```

**Uso:**
```tsx
import ChatHeader from '@/components/chat/ChatHeader';

<ChatHeader conversationId="conv-123" />
```

**Contenido:**
```tsx
export default function ChatHeader({ conversationId }: ChatHeaderProps) {
  const conversation = useConversation(conversationId);
  const contact = useContact(conversation?.entityId);
  const { theme } = useTheme();

  return (
    <header style={{
      height: '64px',
      padding: theme.spacing[4],
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing[3]
    }}>
      {/* Avatar */}
      <img
        src={contact?.avatar || '/default-avatar.png'}
        alt={contact?.name}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: theme.radius.full
        }}
      />

      {/* Info */}
      <div>
        <h2 style={{
          fontSize: theme.typography.sizes.lg,
          fontWeight: theme.typography.weights.semibold,
          color: theme.colors.neutral[900]
        }}>
          {contact?.name || conversation.entityId}
        </h2>
        <p style={{
          fontSize: theme.typography.sizes.sm,
          color: theme.colors.neutral[600]
        }}>
          {contact?.status === 'online' ? 'En línea' : 'Desconectado'}
        </p>
      </div>
    </header>
  );
}
```

---

### MessageList

**Ubicación:** `src/components/chat/MessageList.tsx`

**Propósito:** Lista scrollable de mensajes con auto-scroll.

**Props:**
```typescript
interface MessageListProps {
  conversationId: string;
}
```

**Uso:**
```tsx
import MessageList from '@/components/chat/MessageList';

<MessageList conversationId="conv-123" />
```

**Implementación:**
```tsx
export default function MessageList({ conversationId }: MessageListProps) {
  const messages = useMessages(conversationId);
  const { theme } = useTheme();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll en nuevos mensajes
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  return (
    <div
      className="h-full overflow-y-auto px-6 py-4"
      style={{ backgroundColor: theme.colors.neutral[50] }}
    >
      {/* Render messages in normal flow */}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} theme={theme} />
      ))}

      {/* Invisible div at bottom for auto-scroll */}
      <div ref={bottomRef} />
    </div>
  );
}
```

**Características:**
- **Flujo normal** - No virtual scrolling (previene overlaps)
- **Auto-scroll** - Scroll automático en nuevos mensajes
- **Separación vertical** - `marginBottom: theme.spacing[4]` entre mensajes
- **Empty state** - Mensaje cuando no hay mensajes

**Empty State:**
```tsx
if (messages.length === 0) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center py-12">
        <p style={{ fontSize: theme.typography.sizes.lg }}>
          No messages yet
        </p>
        <p style={{ fontSize: theme.typography.sizes.sm }}>
          Send your first message below!
        </p>
      </div>
    </div>
  );
}
```

---

### MessageBubble

**Ubicación:** `src/components/chat/MessageList.tsx` (función interna)

**Propósito:** Renderizar burbuja individual de mensaje.

**Props:**
```typescript
interface MessageBubbleProps {
  message: Message;
  theme: Theme;
}
```

**Uso:**
```tsx
function MessageBubble({ message, theme }: MessageBubbleProps) {
  const isIncoming = message.type === 'incoming';
  const isSystem = message.type === 'system';

  return (
    <div style={{
      marginBottom: theme.spacing[4],
      width: '100%',
      display: 'flex',
      justifyContent: isIncoming ? 'flex-start' : isSystem ? 'center' : 'flex-end'
    }}>
      <div style={{
        ...getBubbleStyle(),
        borderRadius: theme.radius.lg,
        boxShadow: theme.elevation.sm,
        maxWidth: '640px'
      }}>
        {/* Header: Channel and Type badges */}
        {!isSystem && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="channel-badge">{message.channel}</span>
              <span className="type-badge">{message.type}</span>
            </div>
            <span className="timestamp">
              {formatTimestamp(message.metadata.timestamp)}
            </span>
          </div>
        )}

        {/* Message content */}
        <p className="whitespace-pre-wrap">
          {message.content.text}
        </p>

        {/* Footer: From/To info */}
        {!isSystem && (
          <div className="mt-2">
            <span>From:</span> {message.metadata.from}
            {' • '}
            <span>To:</span> {message.metadata.to}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Estilos por Tipo:**
```tsx
function getBubbleStyle() {
  if (isSystem) {
    return {
      backgroundColor: theme.colors.neutral[100],
      borderColor: theme.colors.neutral[300],
      color: theme.colors.neutral[700],
      marginLeft: 'auto',
      marginRight: 'auto',
      textAlign: 'center' as const,
      maxWidth: '28rem'
    };
  }

  if (isIncoming) {
    return {
      backgroundColor: theme.colors.neutral[0],
      borderColor: theme.colors.neutral[200],
      color: theme.colors.neutral[900]
    };
  }

  // Outgoing
  return {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
    color: theme.colors.neutral[0],
    marginLeft: 'auto'
  };
}
```

---

### MessageInput

**Ubicación:** `src/components/chat/MessageInput.tsx`

**Propósito:** Input de texto para enviar mensajes.

**Props:**
```typescript
interface MessageInputProps {
  conversationId: string;
}
```

**Uso:**
```tsx
import MessageInput from '@/components/chat/MessageInput';

<MessageInput conversationId="conv-123" />
```

**Implementación:**
```tsx
export default function MessageInput({ conversationId }: MessageInputProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  const addMessage = useStore(s => s.actions.addMessage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = text.trim();
    if (!validateMessage(trimmed)) return;

    setIsSending(true);

    try {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        type: 'outgoing',
        channel: 'web',
        content: { text: trimmed },
        metadata: {
          from: 'system',
          to: conversationId,
          timestamp: new Date().toISOString()
        }
      };

      addMessage(conversationId, newMessage);
      setText('');
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: theme.spacing[3] }}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message..."
        disabled={isSending}
        style={{
          flex: 1,
          padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
          borderRadius: theme.radius.lg,
          border: `1px solid ${theme.colors.neutral[300]}`,
          backgroundColor: theme.colors.neutral[0],
          color: theme.colors.neutral[900]  // ← CRÍTICO para visibilidad
        }}
        autoFocus
      />

      <button
        type="submit"
        disabled={!text.trim() || isSending}
        style={{
          padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
          backgroundColor: theme.colors.primary[500],
          color: theme.colors.neutral[0],
          borderRadius: theme.radius.lg,
          border: 'none'
        }}
      >
        {isSending ? 'Sending...' : <><Send /> Send</>}
      </button>
    </form>
  );
}
```

**Validación:**
```tsx
const MIN_MESSAGE_LENGTH = 1;
const MAX_MESSAGE_LENGTH = 4096;

function validateMessage(content: string): boolean {
  const trimmed = content.trim();

  if (trimmed.length < MIN_MESSAGE_LENGTH) {
    setError('Message cannot be empty');
    return false;
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    setError(`Message is too long (max ${MAX_MESSAGE_LENGTH} characters)`);
    return false;
  }

  return true;
}
```

**Contador de Caracteres:**
```tsx
const charCount = text.length;
const isOverLimit = charCount > MAX_MESSAGE_LENGTH;
const isNearLimit = charCount > MAX_MESSAGE_LENGTH * 0.9;

function getCharCountColor() {
  if (isOverLimit) return theme.colors.semantic.danger;
  if (isNearLimit) return theme.colors.semantic.warning;
  return theme.colors.neutral[500];
}

// Renderizado
<div style={{ color: getCharCountColor() }}>
  {charCount} / {MAX_MESSAGE_LENGTH}
</div>
```

---

## UI Components

### Avatar

**Ubicación:** `src/components/ui/Avatar.tsx` (futuro)

**Propósito:** Componente reutilizable de avatar con fallback.

**Props:**
```typescript
interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: React.ReactNode;
}
```

**Uso:**
```tsx
<Avatar src={contact.avatar} alt={contact.name} size="md" />
```

---

### Badge

**Ubicación:** `src/components/ui/Badge.tsx` (futuro)

**Propósito:** Badge genérico para contadores y labels.

**Props:**
```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
}
```

**Uso:**
```tsx
<Badge variant="primary">{unreadCount}</Badge>
<Badge variant="success">WHATSAPP</Badge>
```

---

## Hooks Personalizados

### useConversation

**Ubicación:** `src/hooks/useConversation.ts` (futuro)

**Propósito:** Hook para leer una conversación por ID.

**Signature:**
```typescript
function useConversation(conversationId: string): Conversation | undefined
```

**Uso:**
```tsx
const conversation = useConversation('conv-123');

if (!conversation) {
  return <div>Conversación no encontrada</div>;
}

console.log(conversation.channel);  // 'whatsapp'
```

**Implementación:**
```tsx
export function useConversation(conversationId: string) {
  return useStore(
    state => state.entities.conversations.get(conversationId),
    shallow
  );
}
```

---

### useMessages

**Ubicación:** `src/hooks/useMessages.ts` o integrado en store

**Propósito:** Hook para leer mensajes de una conversación.

**Signature:**
```typescript
function useMessages(conversationId: string): Message[]
```

**Uso:**
```tsx
const messages = useMessages('conv-123');

console.log(`${messages.length} mensajes`);
```

**Implementación:**
```tsx
export function useMessages(conversationId: string) {
  return useStore(
    state => state.entities.messages.get(conversationId) ?? [],
    shallow
  );
}
```

---

### useTheme

**Ubicación:** `src/theme/ThemeProvider.tsx`

**Propósito:** Hook para acceder al tema actual.

**Signature:**
```typescript
function useTheme(): {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
```

**Uso:**
```tsx
const { theme } = useTheme();

<div style={{
  color: theme.colors.neutral[900],
  padding: theme.spacing[4],
  borderRadius: theme.radius.md
}}>
  Contenido
</div>
```

---

### useWorkspaceStore

**Ubicación:** `src/store/workspace.ts`

**Propósito:** Hook para acceder al estado del workspace.

**Signature:**
```typescript
function useWorkspaceStore(): WorkspaceState & WorkspaceActions
```

**Uso:**
```tsx
const {
  containers,
  activeContainerId,
  openTab,
  closeTab,
  splitCanvas,
  expandContainer
} = useWorkspaceStore();

// Abrir tab
openTab({
  id: 'chat-conv-123',
  type: 'conversation',
  label: 'Juan Pérez',
  entityId: 'conv-123',
  closable: true
});

// Split horizontal
splitCanvas('horizontal');

// Expandir container
expandContainer('container-1');
```

---

## Mejores Prácticas

### 1. ID-Based Components

**✅ Correcto:**
```tsx
<ChatArea conversationId="conv-123" />
```

**❌ Incorrecto:**
```tsx
<ChatArea conversation={conversationData} messages={messagesData} />
```

**Por qué:** Permite múltiples instancias, re-renders selectivos, desacoplamiento.

---

### 2. Theme Tokens Everywhere

**✅ Correcto:**
```tsx
const { theme } = useTheme();

<div style={{
  color: theme.colors.neutral[900],
  backgroundColor: theme.colors.neutral[0],
  padding: theme.spacing[4]
}}>
```

**❌ Incorrecto:**
```tsx
<div style={{
  color: '#171717',
  backgroundColor: '#ffffff',
  padding: '16px'
}}>
```

**Por qué:** Consistencia visual, temas cambiables, WCAG compliance automático.

---

### 3. Contraste WCAG

**✅ Correcto:**
```tsx
// Texto normal en fondo blanco
color: theme.colors.neutral[900]  // #171717 (ratio 16.48:1) ✅

// Iconos
color: theme.colors.neutral[700]  // #404040 (ratio 8.59:1) ✅
```

**❌ Incorrecto:**
```tsx
// Texto gris claro en fondo blanco
color: '#cccccc'  // (ratio 1.61:1) ❌ NO cumple WCAG AA
```

**Validar:**
```tsx
import { validateContrast } from '@/theme';

const result = validateContrast(foreground, background);
console.log(result.passAA);  // true/false
```

---

### 4. Separation of Concerns

**Layout Components:**
```tsx
// Solo estructura, no lógica
function Layout() {
  return (
    <div className="flex h-screen">
      <ActivityBar />
      <PrimarySidebar />
      <Canvas />
    </div>
  );
}
```

**Container Components:**
```tsx
// Fetch datos, orquesta
function ChatArea({ conversationId }) {
  const conversation = useConversation(conversationId);

  return (
    <>
      <ChatHeader conversationId={conversationId} />
      <MessageList conversationId={conversationId} />
      <MessageInput conversationId={conversationId} />
    </>
  );
}
```

**Presentational Components:**
```tsx
// UI pura, sin lógica de negocio
function MessageBubble({ message }) {
  return (
    <div className="message-bubble">
      {message.content.text}
    </div>
  );
}
```

---

### 5. TypeScript Strict

**✅ Correcto:**
```tsx
interface ChatAreaProps {
  conversationId: string;
}

export default function ChatArea({ conversationId }: ChatAreaProps) {
  // ...
}
```

**❌ Incorrecto:**
```tsx
export default function ChatArea({ conversationId }: any) {
  // ...
}
```

---

### 6. Error Boundaries

**Implementar:**
```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}

// Usar
<ErrorBoundary>
  <ChatArea conversationId={id} />
</ErrorBoundary>
```

---

### 7. Performance: React.memo

**Cuando usar:**
```tsx
// MessageBubble re-renderiza mucho (lista larga)
const MessageBubble = React.memo(({ message, theme }) => {
  return (
    <div>
      {message.content.text}
    </div>
  );
});
```

**Cuando NO usar:**
```tsx
// ChatArea ya tiene re-render selectivo por conversationId
// No necesita memo
export default function ChatArea({ conversationId }) {
  // ...
}
```

---

### 8. Documentar Componentes Complejos

**JSDoc:**
```tsx
/**
 * DynamicContainer - Contenedor con tabs que renderiza herramientas
 *
 * @param containerId - ID único del container
 *
 * @example
 * <DynamicContainer containerId="container-1" />
 *
 * Responsabilidades:
 * - Mostrar barra de tabs
 * - Renderizar herramienta activa
 * - Gestionar cierre de tabs
 *
 * NO hace:
 * - Gestionar layout del Canvas
 * - Conocer otros containers
 */
export default function DynamicContainer({ containerId }: Props) {
  // ...
}
```

---

## Referencias

- [Arquitectura Completa](./architecture/THREE_LEVEL_ARCHITECTURE.md)
- [Glosario de Términos](./GLOSSARY.md)
- [Sistema de Tema](../src/theme/README.md)
- [README Principal](../README.md)

---

**FluxCore Components Guide v1.0** - Última actualización: 2025
