# CLAUDE.md - INHOST Frontend

This file provides guidance to Claude Code when working with the **INHOST frontend monorepo**.

**Source:** This file is based EXCLUSIVELY on `docs/ARCHITECTURE.md` and `docs/TECHNICAL_AUDIT.md`.

## Project Identity

**This is the FRONTEND monorepo only.** The backend lives at `../inhost-backend/` as a completely separate monorepo.

## Stack (from ARCHITECTURE.md)

- **Runtime:** Browser (ES2022)
- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.8
- **Language:** TypeScript 5.3.3 (strict mode)
- **State Management:** Zustand 5.0.8
- **Persistence:** IndexedDB (idb 8.0.3)
- **Router:** React Router DOM 7.9.6
- **Icons:** Lucide React 0.554.0
- **Styling:** Tailwind CSS 3.3.6

## Development Commands

```bash
# Development
npm run dev                  # Start Vite dev server

# Build
npm run build                # TypeScript check + Vite build
npm run preview              # Preview production build

# Type Checking
npm run type-check           # Run TypeScript without emitting
```

## Architecture: Three-Tier Persistence

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

**⚠️ CRITICAL RULE:** IndexedDB is the local source of truth. Always persist to IndexedDB before updating Zustand.

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

## Zustand Store Structure

**From ARCHITECTURE.md:**

**Location:** `src/store/index.ts`

**State Domains:**
- `entities`: Conversations, messages, contacts (Maps)
- `simulation`: Simulation state (clients, extensions, stats)
- `ui`: UI state (activeConversationId, theme, workspace, typingUsers)
- `network`: Network state (connectionStatus, pendingMessages, lastSync, retryQueue)

**Actions:** 25+ methods

**Example:**
```typescript
// ✅ GOOD: Selector - only re-renders when conversation changes
const conversation = useStore((s) => s.entities.conversations.get(id));

// ❌ BAD: Full store access - re-renders on ANY store change
const store = useStore();
const conversation = store.entities.conversations.get(id);
```

## IndexedDB Schema

**From ARCHITECTURE.md:**

**Database:** `inhost-chat-db`
**Version:** 1

**Stores:**
- `messages`: Primary key = message.id
- `conversations`: Primary key = conversation.id
- `contacts`: Primary key = contact.id
- `logs`: System logs with rotation

## MessageEnvelope Contract

**Location:** `src/types/index.ts`

**From ARCHITECTURE.md:**

```typescript
interface MessageEnvelope {
  id: string;
  type: 'incoming' | 'outgoing' | 'system' | 'status';
  channel: 'whatsapp' | 'telegram' | 'web' | 'sms';
  content: {
    text?: string;
    contentType: string;
    media?: { url, type, caption };
    location?: { latitude, longitude, name };
    buttons?: Array<{ id, text, type }>;
  };
  metadata: {
    from: string;
    to: string;
    timestamp: string;  // ISO 8601
    messageId?: string;
    conversationId?: string;
    ownerId?: string;
    platformMessageId?: string;
    tenantId?: string;
  };
  statusChain: Array<{  // APPEND-ONLY
    status: MessageStatus;
    timestamp: string;
    messageId: string;
    details?: string;
  }>;
  context: {
    plan: 'free' | 'premium';
    timestamp: string;
    source?: string;
    extension?: { id, name, latency };
    [key: string]: unknown;
  };
}
```

**⚠️ RULES:**
- Never mutate statusChain entries, only append
- Always preserve all fields
- This contract is manually mirrored from backend - keep in sync

## WebSocket Events

**From ARCHITECTURE.md:**

**Endpoint:** `ws://localhost:3000/realtime`

**Events Received:**
- `connection`: Connection established
- `message:new`: New message received
- `message:status`: Message status updated
- `message:processing`: Message processing
- `message:queued`: Message queued
- `message:error`: Message error
- `typing:indicator`: User typing
- `conversation:updated`: Conversation changed
- `client_toggle`: Simulation client toggled
- `extension_toggle`: Simulation extension toggled

**Events Sent:**
- `typing`: Typing indicator
- `message_received`: Message acknowledgment

## CRITICAL ISSUES from TECHNICAL_AUDIT.md

### P0 - BLOCKERS (fix before production)

**1. No Tests - 0% Coverage (CRÍTICO)**

**From TECHNICAL_AUDIT.md Section "Tests Faltantes Críticos":**

**Problem:** NO unit tests, NO integration tests, NO E2E tests in entire project.

**Impact:**
- No regression detection
- Unsafe refactoring
- Unknown bugs in production

**Action:** Implement testing infrastructure:
```bash
npm install --save-dev vitest @vitest/ui
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev fake-indexeddb  # Mock IndexedDB
```

**Test Priority:**
1. Services (database.ts, sync.ts, api client) - CRITICAL
2. Store (Zustand actions) - HIGH
3. Hooks (useWebSocket) - MEDIUM
4. Components (pages, UI) - MEDIUM
5. Integration (full flows) - HIGH

**Severidad:** CRÍTICA
**Esfuerzo:** Alto (2-3 semanas para cobertura >80%)

---

**2. JWT Without Refresh Tokens**

**From TECHNICAL_AUDIT.md Section 8.1:**

**Location:** `src/lib/api/admin-client.ts:32-40`, `src/store/auth-store.ts`

**Problem:**
```typescript
export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: {
      accessToken: string;   // ← Only used
      refreshToken: string;  // ← Backend returns but NOT USED
      expiresIn: number;
    };
  };
}
```

Frontend does NOT implement token refresh. When accessToken expires, user is logged out abruptly.

**Impact:**
- Poor user experience
- User loses work in progress
- Multiple logins per day

**Action:** Implement TokenRefreshService that starts auto-refresh timer (refresh 5 min before expiration), calls `/admin/auth/refresh`, updates token, logs out if refresh fails.

**Severidad:** ALTA
**Esfuerzo:** Medio (3-4 horas)

---

**3. Lists Without Virtualization**

**From TECHNICAL_AUDIT.md Section 6.1:**

**Location:**
- `src/components/chat/MessageList.tsx`
- `src/components/workspace/PrimarySidebar.tsx`

**Problem:**
```typescript
export default function MessageList({ messages }: MessageListProps) {
  return (
    <div>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}
```

If there are 1000+ messages, ALL are rendered in the DOM.

**Impact:**
- Severe lag when scrolling
- High memory usage (1000+ items in DOM)
- Degraded user experience

**Action:** Use `@tanstack/react-virtual` (already installed but NOT USED).

**Severidad:** ALTA
**Esfuerzo:** Medio (3-4 horas per list)

---

**4. Eager Loading of All Conversations**

**From TECHNICAL_AUDIT.md Section 6.2:**

**Location:** `src/services/sync.ts:32-46`

**Problem:**
```typescript
const conversations = await db.getAllConversations();
// ...
for (const conversation of conversations) {
  const messages = await db.getMessagesByConversation(conversation.id, 100);
  messagesMap.set(conversation.id, messages);
}
```

If there are 100 conversations, loads 100 * 100 = 10,000 messages at boot.

**Impact:**
- Very long initial load time
- High memory usage
- Can block UI

**Action:** Implement lazy loading:
1. Initial load: Only conversations (no messages)
2. Load messages on-demand when user opens conversation
3. Cache loaded messages in Zustand

**Severidad:** ALTA
**Esfuerzo:** Medio (4-6 horas)

---

**5. Type Assertions Without Guards**

**From TECHNICAL_AUDIT.md Section 4.2:**

**Location:** `src/providers/WebSocketProvider.tsx`

**Problem:**
```typescript
case 'connection':
  handleConnection(data as ConnectionEvent);  // ⚠️ Unsafe
  break;
case 'message_received':
  handleMessageReceived(data as MessageReceivedEvent);  // ⚠️ Unsafe
  break;
```

If backend sends event with incorrect type, type assertion fails silently in runtime.

**Impact:**
- Runtime errors difficult to debug
- App crash if payload doesn't match

**Recomendación:**
```typescript
// src/utils/type-guards.ts
export function isConnectionEvent(data: WebSocketEvent): data is ConnectionEvent {
  return data.type === 'connection' &&
         'status' in data &&
         'timestamp' in data &&
         'clientId' in data;
}

// Usage
case 'connection':
  if (isConnectionEvent(data)) {
    handleConnection(data);
  } else {
    console.error('Invalid connection event:', data);
  }
  break;
```

**Severidad:** ALTA
**Esfuerzo:** Medio (2-3 horas)

---

**6. Race Conditions Between WebSocket and HTTP**

**From TECHNICAL_AUDIT.md Section 9.1:**

**Location:** `src/providers/WebSocketProvider.tsx`, `src/pages/auth/LoginPage.tsx`

**Problem:**
1. User logs in
2. `syncFromBackend()` fetches conversations from API
3. Meanwhile, WebSocket receives new message
4. `handleMessageReceived()` tries to create conversation that doesn't exist in store yet
5. Inconsistent state

**Impact:**
- Lost messages
- Duplicate conversations
- Inconsistent state between IndexedDB and Zustand

**Recomendación:**
```typescript
// src/services/sync/sync-lock.ts
export class SyncLock {
  private syncing = false;

  async withLock<T>(fn: () => Promise<T>): Promise<T> {
    while (this.syncing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.syncing = true;
    try {
      return await fn();
    } finally {
      this.syncing = false;
    }
  }
}

const syncLock = new SyncLock();

// Uso
await syncLock.withLock(async () => {
  await syncService.syncFromBackend();
  await syncService.loadFromIndexedDB();
});
```

**Severidad:** ALTA
**Esfuerzo:** Medio (4-6 horas)

---

### P1 - URGENT (fix this sprint)

**From TECHNICAL_AUDIT.md:**

**1. Duplicación de Normalización de conversationId (Section 2.2)**
- Location: `src/providers/WebSocketProvider.tsx:106-110`, `src/services/sync.ts`
- Problem: Logic duplicated in multiple places
- Action: Centralize in `src/utils/conversationId.ts`
- Severidad: ALTA, Esfuerzo: Bajo (1 hora)

**2. Inconsistencia entityId vs endUserId (Section 12.1)**
- Location: `src/types/index.ts`, `src/services/database.ts:365`
- Problem: Conversation uses `endUserId` but code uses `entityId`
- Action: Use `endUserId` consistently
- Severidad: ALTA, Esfuerzo: Bajo (30 minutos)

**3. Missing Error Handling en Async Functions (Section 10.1)**
- Location: Múltiples archivos
- Problem: `await db.addMessage()` without try-catch
- Action: Add error handling to ALL async functions
- Severidad: ALTA, Esfuerzo: Medio (1 día)

**4. JWT in localStorage (XSS Risk) (Section 8.2)**
- Location: `src/store/auth-store.ts:26-27`
- Problem: `localStorage.setItem('inhost_admin_token', token)`
- Mitigation: Implement Content Security Policy (CSP)
- Future: Migrate to httpOnly cookies (requires backend changes)
- Severidad: ALTA, Esfuerzo: Bajo (CSP) a Alto (httpOnly)

**5. No Input Validation (Section 8.3)**
- Location: `src/components/chat/MessageInput.tsx`, `src/pages/auth/LoginPage.tsx`
- Problem: No validation before sending to backend
- Action: Implement Zod schemas for form validation
- Severidad: ALTA, Esfuerzo: Medio (1-2 horas per form)

---

### P2 - MEDIUM (next sprint)

**From TECHNICAL_AUDIT.md:**

- Console.log without structured logging (Section 5.4) - 90+ occurrences
- Bundle size without code splitting (Section 7.4)
- Unused dependencies (Section 11.1): `@tanstack/react-query` (remove), `axios` (remove, using fetch)
- Re-renders due to incorrect selectors (Section 7.1)
- WebSocketProvider violates SRP (Section 3.1.1) - 754 lines, 7 responsibilities

---

## Key Services

### DatabaseService (`src/services/database.ts`)

**Manages IndexedDB operations:**
- `init()`: Initialize database
- `addMessage(message)`: Add/update message
- `getMessage(id)`: Get message by ID
- `getMessagesByConversation(conversationId, limit)`: Get messages
- `saveConversation(conversation)`: Save conversation
- `getAllConversations()`: Get all conversations
- `saveContact(contact)`: Save contact
- `deleteOldMessages(olderThanDays)`: Cleanup (default 30 days)

**⚠️ ISSUE:** No abstraction layer - tightly coupled to IndexedDB (Section 2.5).

---

### SyncService (`src/services/sync.ts`)

**Manages data synchronization:**
- `loadFromIndexedDB()`: Hydrate Zustand from IndexedDB on boot
- `syncFromBackend()`: Fetch data from backend API
- `deriveContactsFromConversations()`: Create contacts from conversations
- `deriveConversationsFromMessages()`: Create conversations from messages

**⚠️ ISSUE:** Violates SRP (Section 2.3) - 314 lines with 5 responsibilities.

---

### AdminAPIClient (`src/lib/api/admin-client.ts`)

**Handles all backend API calls:**
- Auth: `login()`, `signup()`, `logout()`
- Sync: `syncInitial()`
- Conversations: CRUD + mark as read
- Messages: CRUD + status updates
- End Users: CRUD
- Team: CRUD + invites
- Account: Get/update
- Integrations: CRUD
- Mentions: CRUD + mark as read
- Message Feedback: CRUD + analytics

**⚠️ ISSUE:** Violates SRP (Section 3.1.2) - 581 lines, single class handles ALL endpoints.

**⚠️ ISSUE:** Uses `any` in 6 locations (Section 4.1) - `params as any` loses type safety.

---

## Common Patterns

### Reading from Store with Selector

```typescript
// ✅ GOOD: Only re-renders when conversation changes
const conversation = useStore((state) => state.entities.conversations.get(id));

// ❌ BAD: Re-renders on ANY store change
const store = useStore();
const conversation = store.entities.conversations.get(id);
```

### Persisting Data

```typescript
// ✅ GOOD: IndexedDB first, then Zustand
await db.addMessage(message);
useStore.getState().actions.addMessage(conversationId, message);

// ❌ BAD: Zustand first (can lose data if app crashes)
useStore.getState().actions.addMessage(conversationId, message);
await db.addMessage(message);
```

### Error Handling in Async Functions

```typescript
// ✅ GOOD
try {
  await db.addMessage(message);
} catch (error) {
  logger.error('db', 'Failed to persist message', {
    messageId: message.id,
    error: error instanceof Error ? error.message : String(error),
  });
  // Show error to user or retry
}

// ❌ BAD: No error handling (current state)
await db.addMessage(message);
```

## WebSocket Provider

**Location:** `src/providers/WebSocketProvider.tsx` (754 lines)

**⚠️ CRITICAL ISSUE:** Violates SRP with 7 responsibilities (Section 3.1.1):
1. WebSocket connection management
2. Event routing
3. IndexedDB persistence
4. Zustand store updates
5. conversationId normalization
6. Conversation/contact creation
7. Toast notifications

**Should be split into:**
- `WebSocketConnection`: Connection management
- `WebSocketEventRouter`: Event routing
- `MessageHandler`: Message-specific logic
- `ConversationManager`: Conversation logic
- `NotificationService`: Toasts

**Severidad:** ALTA
**Esfuerzo:** Alto (1-2 días)

## Logging

**From TECHNICAL_AUDIT.md Section 5.4:**

**Problem:** 90+ occurrences of `console.log` throughout codebase.

**Solution:** Use logger service (`src/services/logger.ts`) consistently:

```typescript
// ❌ AVOID (current state)
console.log('📨 Message received:', event.data);

// ✅ USE
logger.info('websocket', 'Message received', {
  messageId: event.data.id,
  conversationId: event.data.conversationId,
  type: event.data.type,
  channel: event.data.channel,
});
```

Logger service exists but is NOT used consistently.

**Severidad:** MEDIA
**Esfuerzo:** Medio (1 día)

## Performance Considerations

**From ARCHITECTURE.md and TECHNICAL_AUDIT.md:**

- **Virtualization:** REQUIRED for lists with 50+ items (currently NOT IMPLEMENTED)
- **Memoization:** Use `useMemo` for expensive computations
- **Lazy Loading:** Load messages on-demand (currently loads ALL at boot)
- **Code Splitting:** Lazy load routes with `React.lazy()` (NOT IMPLEMENTED)
- **Image Optimization:** Use `loading="lazy"` on images
- **Debouncing:** Debounce search inputs (300ms)

## Security Rules (from TECHNICAL_AUDIT.md Section 8)

**JWT Storage:**
- Currently stored in `localStorage` (XSS risk)
- Mitigate with Content Security Policy (CSP)
- Future: Migrate to httpOnly cookies (requires backend changes)

**Input Validation:**
- Validate ALL user inputs before sending to backend
- Use Zod schemas for form validation
- Sanitize before display (prevent XSS)

**CORS:**
- Vite proxy is dev-only
- Production: Backend must configure CORS correctly

## Configuration

**Location:** `vite.config.ts`

**Proxy Configuration (Dev Only):**
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}
```

**⚠️ NOTE:** This proxy is ONLY for development.

## Contract Changes

When modifying types in `src/types/index.ts`:

1. **Check if it's a shared contract** (e.g., MessageEnvelope, Conversation)
2. **Coordinate with backend team** - frontend and backend must stay in sync
3. Document changes in commit message
4. Test both sides together
5. Consider backward compatibility

**⚠️ IMPORTANT:** Frontend manually mirrors backend types. Changes to backend contracts require manual updates here.

## Documentation

- **Architecture:** `docs/ARCHITECTURE.md` (1350 lines)
- **Technical Audit:** `docs/TECHNICAL_AUDIT.md` (3099 lines)
- **Theme System:** `docs/THEME-SYSTEM.md`

## Critical Rules Summary

1. ✅ IndexedDB is local source of truth - persist before Zustand
2. ✅ Always use selectors to read from Zustand (avoid full store access)
3. ✅ Never mutate statusChain - only append
4. ✅ Use logger service instead of console.log
5. ✅ Validate user inputs before API calls
6. ✅ Implement type guards for WebSocket events
7. ✅ Handle errors in ALL async functions
8. ✅ Virtualize lists with 50+ items
9. ❌ Never store sensitive data in localStorage without encryption
10. ❌ Never render 1000+ items without virtualization
11. ❌ Never load all conversations eagerly - use lazy loading
12. ❌ Never use type assertions without guards

## Matriz de Severidad (from TECHNICAL_AUDIT.md)

| Problema | Severidad | Esfuerzo | Prioridad |
|----------|-----------|----------|-----------|
| **Sin tests (0% cobertura)** | ❌ CRÍTICA | Alto | 🔥 P0 |
| **JWT sin refresh tokens** | ⚠️ ALTA | Medio | 🔥 P0 |
| **Listas sin virtualización** | ⚠️ ALTA | Medio | 🔥 P0 |
| **Carga eager de conversaciones** | ⚠️ ALTA | Medio | 🔥 P0 |
| **Type assertions sin guards** | ⚠️ ALTA | Medio | 🔥 P0 |
| **Race conditions WebSocket/HTTP** | ⚠️ ALTA | Medio | 🔥 P0 |
| **Missing error handling** | ⚠️ ALTA | Medio | 🔴 P1 |
| **Duplicación normalización conversationId** | ⚠️ ALTA | Bajo | 🔴 P1 |
| **Inconsistencia entityId vs endUserId** | ⚠️ ALTA | Bajo | 🔴 P1 |
| **JWT en localStorage (XSS)** | ⚠️ ALTA | Alto | 🔴 P1 |
| **No validación de inputs** | ⚠️ ALTA | Medio | 🟡 P2 |
| **WebSocketProvider SRP violation** | ⚠️ ALTA | Alto | 🟡 P2 |
| **Bundle sin code splitting** | 🔵 MEDIA | Medio | 🟡 P2 |
| **console.log en producción** | 🔵 MEDIA | Medio | 🟡 P2 |
| **Dependencias no utilizadas** | 🔵 MEDIA | Bajo | 🟡 P2 |

## Deployment Checklist

**Before deploying to production:**
- [ ] Implement tests (target >80% coverage)
- [ ] Implement JWT refresh tokens
- [ ] Implement virtualization for MessageList and ConversationList
- [ ] Implement lazy loading for messages
- [ ] Add type guards for WebSocket events
- [ ] Implement SyncLock for race conditions
- [ ] Add error handling to all async functions
- [ ] Centralize conversationId normalization
- [ ] Fix entityId vs endUserId inconsistency
- [ ] Remove unused dependencies (`@tanstack/react-query`, `axios`)
- [ ] Replace console.log with logger service
- [ ] Implement input validation with Zod
- [ ] Configure CSP headers
- [ ] Implement code splitting

**For cross-stack issues:** Coordinate with backend team. Changes to MessageEnvelope, API contracts, or WebSocket events require synchronized updates.

---

## Documentation System (SDT-SPEC-1.0)

**Status:** ✅ Production-ready (Sprint 3 + skeleton masivo completado)
**Coverage:** 80/80 files documented (100.0%) ✅

### Documented Files

**Location:** `docs/documented-files.json`

**Fully documented (Sprint 1-3):**
1. **[src/App.tsx](src/App.tsx)** - Application entry point with routing
2. **[src/services/api.ts](src/services/api.ts)** - Backend API client
3. **[src/store/auth-store.ts](src/store/auth-store.ts)** - Authentication state management
4. **[src/providers/WebSocketProvider.tsx](src/providers/WebSocketProvider.tsx)** - Real-time WebSocket provider
5. **[src/lib/api/admin-client.ts](src/lib/api/admin-client.ts)** - Admin API client
6. **[src/store/index.ts](src/store/index.ts)** - Main Zustand store
7. **[src/hooks/useWebSocket.ts](src/hooks/useWebSocket.ts)** - WebSocket hook
8. Plus 14 more files (see [docs/ai-context-frontend.md](docs/ai-context-frontend.md))

**Skeleton generated (placeholders pending):**
- [src/main.tsx](src/main.tsx) - Application entry point
- [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx) - Main dashboard
- [src/pages/auth/LoginPage.tsx](src/pages/auth/LoginPage.tsx) - Login page
- [src/pages/auth/SignupPage.tsx](src/pages/auth/SignupPage.tsx) - Signup page
- [src/components/workspace/Workspace.tsx](src/components/workspace/Workspace.tsx) - Core workspace
- [src/theme/index.ts](src/theme/index.ts) - Theme system
- [src/theme/types.ts](src/theme/types.ts) - Theme types

### Architecture Overview

**Location:** [docs/architecture-overview.md](docs/architecture-overview.md)

Provides:
- Complete architecture map of documented files
- Dependency graph
- Layer-domain matrix
- Integration points

### Using Documentation System

**Scripts:** See `../documentation-scripts/README.md`

```bash
# Validate documentation format
cd ../documentation-scripts
npm run validate:frontend

# Generate AI context
npm run context:frontend

# Coverage reports (Sprint 3)
npm run coverage:frontend    # List documented/undocumented files

# Analyze dependencies
npm run analyze:frontend
```

**Dead Code Detection (Professional Tools - Sprint 3):**
```bash
cd inhost-frontend/

# Run professional tools
npm run deadcode:all        # ts-prune + unimported
npm run deadcode:exports    # Unused TypeScript exports
npm run deadcode:files      # Files without imports
npm run deadcode:deps       # Unused npm dependencies
```

**Tools installed:**
- **ts-prune** - Detects unused exports (75% more accurate than custom scripts)
- **unimported** - Detects files without imports
- **depcheck** - Detects unused npm dependencies

### Documentation Format

All critical files include structured metadata at the top:

```typescript
/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "src/example.ts"
 *   type: "component|service|store|utility"
 *   layer: "frontend"
 *   domain: "ui|api|auth|sync|database|config"
 *   purpose: "Brief description"
 *
 * DEPENDENCIES:
 *   internal: ["@/types", "./utils"]
 *   external: ["react", "zustand"]
 *   infrastructure: ["localStorage", "websocket"]
 *
 * CONTRACTS:
 *   exports: ["Component", "hook"]
 *   inputs: ["PropsType", "ConfigType"]
 *   outputs: ["JSX.Element", "ReturnType"]
 *   errors: ["ValidationError"]
 *
 * INTEGRATION:
 *   data_flow: "[source] → [transform] → [destination]"
 *   events_emitted: ["event_name"]
 *   events_consumed: ["event_name"]
 *
 * IMPACT:
 *   used_by: ["components/Parent"]
 *   uses: ["services/api"]
 *   critical: true|false
 *
 * === DOC_END :: example.ts ===
 */
```

### Benefits for AI Context

- **70% token reduction** - Only load relevant context
- **Impact analysis** - Understand change consequences
- **Dependency tracking** - Clear relationships
- **Cross-reference** - Find related files quickly

### Next Steps

- [ ] Document remaining high-priority files
- [ ] Integrate validation in CI/CD
- [ ] Generate context for specific tasks
- [ ] Maintain documentation as code evolves
