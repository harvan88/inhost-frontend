# CLAUDE.md - INHOST Frontend

**INHOST** es una plataforma SaaS multi-tenant de mensajería omnicanal que permite a organizaciones gestionar conversaciones de clientes desde WhatsApp, Telegram, SMS y Web en una interfaz unificada.

---

## ¿Qué es INHOST?

**INHOST Frontend** es el dashboard web donde agentes de soporte:

1. **Ven conversaciones unificadas** de todos los canales en un solo lugar
2. **Responden mensajes** con contexto completo del cliente
3. **Reciben sugerencias AI** para responder más rápido y con mejor calidad
4. **Acceden a datos enriquecidos** (sentimiento, intención, historial CRM) sin salir del chat
5. **Colaboran en equipo** con asignaciones, menciones y estados

**Casos de uso del usuario:**
- Agente de soporte responde 50+ conversaciones diarias desde una bandeja
- AI sugiere respuestas basadas en el contexto del chat
- Sistema muestra automáticamente datos del cliente (CRM) al lado del chat
- Manager analiza calidad de respuestas y sentimiento de clientes
- Equipo colabora con menciones y notas internas

---

## Arquitectura de Enriquecimiento en el Frontend

**Modelo de Vista Enriquecida** (v3.0)

### Concepto Fundamental

El frontend recibe dos flujos de datos separados:

```
MessageEnvelopeCore (Núcleo del mensaje)
    +
MessageEnrichments[] (Capas de extensiones)
    ↓
Vista Enriquecida en UI
```

**Ejemplo visual:**

```
┌─────────────────────────────────────────────────────┐
│ WhatsApp - Juan Pérez                         [⋯]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🟢 Juan Pérez                          10:30 AM    │
│  "Hola, necesito ayuda con mi pedido #12345"       │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ 🤖 Sugerencias AI (Extension)                │  │
│  │ • "Hola Juan, ¿en qué puedo ayudarte?"     │  │
│  │ • "Déjame revisar tu pedido #12345..."     │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ 📊 Sentiment Analysis (Extension)            │  │
│  │ Neutral (0.5) | Intención: Support Request  │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ 🔗 CRM Data (Extension)                      │  │
│  │ Tier: Premium | Last Purchase: 2025-11-20   │  │
│  │ Open Tickets: 1 | Lifetime Value: $5000     │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  🟦 Agente (tú)                         10:32 AM    │
│  "Hola Juan, te ayudo con tu pedido..."           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Separación de datos:**
- **Núcleo** (azul/verde): Mensaje original, siempre visible
- **Enrichments** (cajas grises): Datos adicionales de extensiones, opcionales

### Sistema de Extensiones desde el Frontend

**Flujo de datos:**

```
WebSocket Event: message:new
    ↓
{
  message: MessageEnvelopeCore,     // Núcleo
  enrichments: [                     // Capas
    {
      extensionId: "ai-assistant",
      data: { suggestions: [...] }
    },
    {
      extensionId: "sentiment-analyzer",
      data: { score: 0.8, label: "positive" }
    }
  ]
}
    ↓
IndexedDB (persistencia local)
    ↓
Zustand Store (estado en memoria)
    ↓
React UI (renderizado)
```

**Zustand Store Modificado:**

```typescript
interface AppState {
  entities: {
    // Núcleo (siempre presente)
    conversations: Map<string, Conversation>;
    messages: Map<string, MessageEnvelopeCore[]>;
    contacts: Map<string, Contact>;

    // Enrichments (opcionales, por extensión)
    enrichments: Map<string, Map<string, MessageEnrichment>>;
    //           ↑ messageId  ↑ extensionId
  };

  actions: {
    addMessage: (conversationId, message) => void;

    // Nuevo: Gestionar enrichments
    addEnrichment: (enrichment: MessageEnrichment) => void;
    getEnrichments: (messageId: string) => MessageEnrichment[];
    getEnrichmentByExtension: (messageId, extensionId) => MessageEnrichment | null;
  };
}
```

**IndexedDB Schema:**

```typescript
// Object Store: messages (núcleo puro)
{
  key: string;  // message.id
  value: MessageEnvelopeCore;
  indexes: ['conversationId', 'timestamp', 'type', 'channel']
}

// Object Store: message_enrichments (capas de extensiones)
{
  key: string;  // enrichment.id
  value: MessageEnrichment;
  indexes: [
    'messageId',              // para buscar todos los enrichments de un mensaje
    'extensionId',            // para buscar todos los enrichments de una extensión
    'messageId-extensionId'   // compound index para acceso rápido
  ]
}
```

### Renderizado de Extensiones en UI

**Componente MessageItem:**

```typescript
function MessageItem({ message }: { message: MessageEnvelopeCore }) {
  // Obtener enrichments del store
  const enrichments = useStore(state =>
    state.actions.getEnrichments(message.id)
  );

  const aiSuggestion = enrichments.find(e => e.extensionId === 'ai-assistant');
  const sentiment = enrichments.find(e => e.extensionId === 'sentiment-analyzer');
  const crmData = enrichments.find(e => e.extensionId === 'crm-integration');

  return (
    <div className="message-item">
      {/* Núcleo del mensaje (siempre visible) */}
      <MessageBubble content={message.content} type={message.type} />

      {/* Enrichments (solo si existen y usuario tiene permisos) */}
      {message.type === 'incoming' && (
        <>
          {/* AI Suggestions */}
          {aiSuggestion && (
            <AISuggestionCard
              suggestions={aiSuggestion.data.suggestions}
              onSelect={(text) => handleUseSuggestion(text)}
            />
          )}

          {/* Sentiment Badge */}
          {sentiment && (
            <SentimentBadge
              score={sentiment.data.score}
              label={sentiment.data.label}
            />
          )}

          {/* CRM Data Panel */}
          {crmData && (
            <CRMDataPanel
              customer={crmData.data.customer}
              tickets={crmData.data.relatedTickets}
            />
          )}
        </>
      )}
    </div>
  );
}
```

**Registro de Componentes de Extensión:**

```typescript
// src/extensions/registry.ts

interface ExtensionUIComponent {
  extensionId: string;
  component: React.ComponentType<{ data: any }>;
  position: 'inline' | 'sidebar' | 'modal';
  permissions: string[];  // Qué roles pueden ver
}

const extensionUIComponents: ExtensionUIComponent[] = [
  {
    extensionId: 'ai-assistant',
    component: AISuggestionCard,
    position: 'inline',
    permissions: ['agent', 'admin', 'owner']
  },
  {
    extensionId: 'sentiment-analyzer',
    component: SentimentBadge,
    position: 'inline',
    permissions: ['admin', 'owner']  // Solo managers
  },
  {
    extensionId: 'crm-integration',
    component: CRMDataPanel,
    position: 'sidebar',
    permissions: ['agent', 'admin', 'owner']
  }
];

// Renderizar dinámicamente
function renderEnrichments(messageId: string) {
  const enrichments = useStore(s => s.actions.getEnrichments(messageId));
  const userRole = useStore(s => s.ui.userRole);

  return enrichments
    .filter(e => {
      const uiConfig = extensionUIComponents.find(
        c => c.extensionId === e.extensionId
      );
      return uiConfig && uiConfig.permissions.includes(userRole);
    })
    .map(e => {
      const Component = extensionUIComponents.find(
        c => c.extensionId === e.extensionId
      ).component;
      return <Component key={e.extensionId} data={e.data} />;
    });
}
```

### Configuración de Extensiones por Tenant

**UI para habilitar/deshabilitar:**

```typescript
// src/pages/settings/ExtensionsPage.tsx

function ExtensionsPage() {
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [enabledExtensions, setEnabledExtensions] = useState([]);

  useEffect(() => {
    // Obtener extensiones disponibles del marketplace
    adminAPI.getAvailableExtensions().then(setAvailableExtensions);

    // Obtener extensiones habilitadas para este tenant
    adminAPI.getEnabledExtensions().then(setEnabledExtensions);
  }, []);

  const handleToggleExtension = async (extensionId: string) => {
    const isEnabled = enabledExtensions.includes(extensionId);

    if (isEnabled) {
      await adminAPI.disableExtension(extensionId);
    } else {
      // Mostrar modal de configuración
      const config = await showExtensionConfigModal(extensionId);
      await adminAPI.enableExtension(extensionId, config);
    }

    // Recargar
    setEnabledExtensions(await adminAPI.getEnabledExtensions());
  };

  return (
    <div className="extensions-page">
      <h1>Extensiones Disponibles</h1>

      {availableExtensions.map(ext => (
        <ExtensionCard
          key={ext.id}
          extension={ext}
          enabled={enabledExtensions.includes(ext.id)}
          onToggle={() => handleToggleExtension(ext.id)}
        />
      ))}
    </div>
  );
}
```

---

## Stack Tecnológico

**Source:** `docs/ARCHITECTURE.md`

- **Runtime:** Browser (ES2022)
- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.8
- **Language:** TypeScript 5.3.3 (strict mode)
- **State Management:** Zustand 5.0.8
- **Persistence:** IndexedDB (idb 8.0.3)
- **Router:** React Router DOM 7.9.6
- **Icons:** Lucide React 0.554.0
- **Styling:** Tailwind CSS 3.3.6

---

## Comandos de Desarrollo

```bash
# Desarrollo
npm run dev                  # Start Vite dev server

# Build
npm run build                # TypeScript check + Vite build
npm run preview              # Preview production build

# Type Checking
npm run type-check           # Run TypeScript without emitting
```

---

## Arquitectura: Three-Tier Persistence

**From ARCHITECTURE.md:**

```
React Components
    ↓
Zustand Store (in-memory)
    ↓
IndexedDB (local persistence)
    ↓
Backend PostgreSQL (via API)
```

**Data Flow:**
1. **Read:** IndexedDB → Zustand → React (on boot)
2. **Write:** React → Zustand → IndexedDB → Backend API
3. **Real-Time:** WebSocket → Zustand → IndexedDB

**⚠️ CRITICAL RULE:** IndexedDB es el source of truth local. Always persist to IndexedDB before updating Zustand.

---

## Workspace Architecture: VS Code-Inspired Layout

**From ARCHITECTURE.md:**

### Three-Level Hierarchy

```
┌──────────────────────────────────────────────┐
│  Activity Bar  │ Primary Sidebar │  Canvas   │
│  (Fixed 60px)  │  (Resizable)    │  (Flex)   │
├────────────────┼─────────────────┼───────────┤
│  [Chat]        │  Conversations  │  Tabs     │
│  [Orders]      │  Filters        │  Content  │
│  [Customers]   │  Search         │  Panels   │
│  [Team]        │                 │           │
│  [Settings]    │                 │           │
└────────────────┴─────────────────┴───────────┘
```

**Activity Bar** (Level 1): Main navigation

**Primary Sidebar** (Level 2): Context-specific content

**Canvas** (Level 3): Workspace tabs with dynamic containers (up to 3 containers, resizable)

---

## WebSocket Events (v3.0 - Con Enrichments)

**Endpoint:** `ws://localhost:3000/realtime`

**Events Received:**
- `connection`: Connection established
- `message:new`: New message + enrichments (estructura modificada)
- `message:status`: Message status updated
- `enrichment:new`: Nuevo enrichment disponible (streaming)
- `typing:indicator`: User typing
- `conversation:updated`: Conversation changed
- `client_toggle`, `extension_toggle`: Simulation events

**Estructura de `message:new` (v3.0):**

```typescript
{
  type: 'message:new',
  data: {
    message: MessageEnvelopeCore,  // Núcleo puro
    enrichments: [                 // Enrichments disponibles
      {
        extensionId: 'ai-assistant',
        extensionVersion: '1.0.0',
        data: {
          suggestions: [
            { text: "Hola, ¿en qué puedo ayudarte?", confidence: 0.95 },
            { text: "Déjame revisar eso...", confidence: 0.87 }
          ]
        },
        metadata: {
          createdAt: '2025-11-28T10:00:00Z',
          ttl: 3600,
          persistent: false
        }
      }
    ]
  },
  timestamp: '2025-11-28T10:00:01Z'
}
```

**WebSocketProvider Handling:**

```typescript
// src/providers/WebSocketProvider.tsx

function handleMessageNew(event: MessageNewEvent) {
  const { message, enrichments } = event.data;

  // 1. Persistir núcleo
  await db.addMessage(message);

  // 2. Persistir enrichments
  for (const enrichment of enrichments) {
    await db.addEnrichment({
      messageId: message.id,
      extensionId: enrichment.extensionId,
      extensionVersion: enrichment.extensionVersion,
      data: enrichment.data,
      metadata: enrichment.metadata
    });
  }

  // 3. Actualizar Zustand
  useStore.getState().actions.addMessage(message.conversationId, message);

  for (const enrichment of enrichments) {
    useStore.getState().actions.addEnrichment({
      messageId: message.id,
      extensionId: enrichment.extensionId,
      data: enrichment.data
    });
  }

  // 4. Notificación visual (si no está en la conversación activa)
  if (message.conversationId !== activeConversationId) {
    showToast('Nuevo mensaje de ' + contactName);
  }
}
```

---

## Sincronización y Persistencia

**loadFromIndexedDB (modificado para enrichments):**

```typescript
async function loadFromIndexedDB() {
  // 1. Cargar núcleo
  const conversations = await db.getAllConversations();
  const contacts = await db.getAllContacts();

  const messagesMap = new Map();
  const enrichmentsMap = new Map();

  for (const conv of conversations) {
    // Cargar mensajes
    const messages = await db.getMessagesByConversation(conv.id, 100);
    messagesMap.set(conv.id, messages);

    // Cargar enrichments de esos mensajes
    for (const message of messages) {
      const enrichments = await db.getEnrichmentsByMessageId(message.id);
      enrichmentsMap.set(message.id, enrichments);
    }
  }

  // 2. Hidratar Zustand
  useStore.setState({
    entities: {
      conversations: new Map(conversations.map(c => [c.id, c])),
      messages: messagesMap,
      contacts: new Map(contacts.map(c => [c.id, c])),
      enrichments: enrichmentsMap
    }
  });
}
```

---

## CRITICAL ISSUES from TECHNICAL_AUDIT.md

### P0 - BLOCKERS (fix before production)

**1. No Tests - 0% Coverage (CRÍTICO)**
- **Impact:** No regression detection
- **Action:** Implement Vitest + Testing Library

**2. JWT Without Refresh Tokens**
- **Impact:** User abruptly logged out when token expires
- **Action:** Implement TokenRefreshService

**3. Lists Without Virtualization**
- **Impact:** Severe lag with 1000+ messages
- **Action:** Use `@tanstack/react-virtual` (already installed but NOT USED)

**4. Eager Loading of All Conversations**
- **Impact:** Long initial load time
- **Action:** Lazy load messages on-demand

**5. Type Assertions Without Guards**
- **Impact:** Runtime errors difficult to debug
- **Action:** Implement type guards for WebSocket events

**6. Race Conditions Between WebSocket and HTTP**
- **Impact:** Lost messages, inconsistent state
- **Action:** Implement SyncLock

---

## Performance Considerations

**From ARCHITECTURE.md and TECHNICAL_AUDIT.md:**

- **Virtualization:** REQUIRED for lists with 50+ items (currently NOT IMPLEMENTED)
- **Memoization:** Use `useMemo` for expensive computations
- **Lazy Loading:** Load messages on-demand (currently loads ALL at boot)
- **Code Splitting:** Lazy load routes with `React.lazy()` (NOT IMPLEMENTED)
- **Debouncing:** Debounce search inputs (300ms)
- **Extension Rendering:** Only render enrichments for visible messages (use virtualizer)

**Optimización para Enrichments:**

```typescript
// ✅ GOOD: Solo cargar enrichments de mensajes visibles
const MessageList = () => {
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5
  });

  const visibleMessages = virtualizer.getVirtualItems();

  return visibleMessages.map(virtual => {
    const message = messages[virtual.index];

    // Solo cargar enrichments para mensajes visibles
    const enrichments = useStore(s =>
      s.actions.getEnrichments(message.id)
    );

    return <MessageItem message={message} enrichments={enrichments} />;
  });
};
```

---

## Security Rules (from TECHNICAL_AUDIT.md Section 8)

**JWT Storage:**
- Currently stored in `localStorage` (XSS risk)
- Mitigate with Content Security Policy (CSP)
- Future: Migrate to httpOnly cookies (requires backend changes)

**Input Validation:**
- Validate ALL user inputs before sending to backend
- Use Zod schemas for form validation
- Sanitize before display (prevent XSS)

**Extension Security:**
- Never execute arbitrary code from enrichments
- Render enrichments through whitelisted components
- Validate extension data structure before rendering

**CORS:**
- Vite proxy is dev-only
- Production: Backend must configure CORS correctly

---

## Contract Changes (Extensiones)

When modifying types in `src/types/index.ts`:

1. **Check if it's a shared contract** (e.g., MessageEnvelope, Conversation)
2. **Coordinate with backend team** - frontend and backend must stay in sync
3. Document changes in commit message
4. Test both sides together
5. Consider backward compatibility

When backend adds a new extension:

1. **Frontend receives enrichment automatically** vía WebSocket
2. **UI component needs to be registered** en `src/extensions/registry.ts`
3. **Test rendering** with mock data first
4. **Verify permissions** - qué roles pueden ver el enrichment

**⚠️ IMPORTANT:** Frontend manually mirrors backend types. Changes to backend contracts require manual updates here.

---

## Critical Rules Summary

1. ✅ IndexedDB is local source of truth - persist before Zustand
2. ✅ Always use selectors to read from Zustand (avoid full store access)
3. ✅ Never mutate statusChain - only append
4. ✅ Use logger service instead of console.log
5. ✅ Validate user inputs before API calls
6. ✅ Implement type guards for WebSocket events
7. ✅ Handle errors in ALL async functions
8. ✅ Virtualize lists with 50+ items
9. ✅ Render enrichments only for visible messages
10. ✅ Validate enrichment data structure before rendering
11. ❌ Never store sensitive data in localStorage without encryption
12. ❌ Never render 1000+ items without virtualization
13. ❌ Never execute arbitrary code from extensions
14. ❌ Never trust enrichment output without validation

---

## Deployment Checklist

**Before deploying to production:**
- [ ] Implement tests (target >80% coverage)
- [ ] Implement JWT refresh tokens
- [ ] Implement virtualization for MessageList and ConversationList
- [ ] Implement lazy loading for messages and enrichments
- [ ] Add type guards for WebSocket events
- [ ] Implement SyncLock for race conditions
- [ ] Add error handling to all async functions
- [ ] Remove unused dependencies (`@tanstack/react-query`, `axios`)
- [ ] Replace console.log with logger service
- [ ] Implement input validation with Zod
- [ ] Configure CSP headers
- [ ] Implement code splitting
- [ ] Register UI components for all enabled extensions
- [ ] Test enrichment rendering performance (1000+ messages)

**For cross-stack issues:** Coordinate with backend team. Changes to MessageEnvelope, API contracts, or WebSocket events require synchronized updates.

---

## Documentation

- **Architecture:** `docs/ARCHITECTURE.md` (1350 lines)
- **Technical Audit:** `docs/TECHNICAL_AUDIT.md` (3099 lines)
- **Theme System:** `docs/THEME-SYSTEM.md`
- **Enrichment Architecture:** `../ENRICHMENT-ANALYSIS.md` (detailed design)
- **Extension UI Guide:** `docs/EXTENSION-UI-DEVELOPMENT.md` (pending)

---

**This is the FRONTEND monorepo.** Backend lives at `../inhost-backend/` as a completely separate monorepo.
