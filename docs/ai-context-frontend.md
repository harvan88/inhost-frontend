# Project Architecture Context

Generated: 2025-11-27T18:29:00.350Z

## Statistics

- **Total Files Documented:** 21
- **Critical Files:** 21
- **Total Dependencies:** 109

## Architecture Overview

### Layers

- **frontend:** 21 files (21 critical)

### Domains

- **ui:** 9 files (9 critical)
- **auth:** 3 files (3 critical)
- **messaging:** 2 files (2 critical)
- **sync:** 3 files (3 critical)
- **api:** 2 files (2 critical)
- **database:** 1 files (1 critical)
- **config:** 1 files (1 critical)

## Critical Files

- **..\inhost-frontend\src\App.tsx** [frontend/ui]
  - Type: component
  - Exports: App
- **..\inhost-frontend\src\components\auth\ProtectedRoute.tsx** [frontend/auth]
  - Type: component
  - Exports: ProtectedRoute
- **..\inhost-frontend\src\components\chat\MessageInput.tsx** [frontend/messaging]
  - Type: component
  - Exports: MessageInput
- **..\inhost-frontend\src\components\chat\MessageList.tsx** [frontend/ui]
  - Type: component
  - Exports: MessageList
- **..\inhost-frontend\src\components\workspace\ActivityBar.tsx** [frontend/ui]
  - Type: component
  - Exports: ActivityBar
- **..\inhost-frontend\src\components\workspace\Canvas.tsx** [frontend/ui]
  - Type: component
  - Exports: Canvas
- **..\inhost-frontend\src\components\workspace\PrimarySidebar.tsx** [frontend/ui]
  - Type: component
  - Exports: PrimarySidebar
- **..\inhost-frontend\src\hooks\useToast.ts** [frontend/ui]
  - Type: utility
  - Exports: useToast, useToastStore
- **..\inhost-frontend\src\hooks\useWebSocket.ts** [frontend/sync]
  - Type: utility
  - Exports: useWebSocket
- **..\inhost-frontend\src\lib\api\admin-client.ts** [frontend/api]
  - Type: service
  - Exports: adminClient, User, LoginRequest, SignupRequest, AuthResponse, Conversation, EndUser, TeamMember, Integration, SyncInitialData, Mention
- **..\inhost-frontend\src\lib\auth\jwt.ts** [frontend/auth]
  - Type: utility
  - Exports: JWTPayload, decodeJWT, getStoredToken, isAuthenticated, isTokenExpired, removeToken, storeToken
- **..\inhost-frontend\src\providers\WebSocketProvider.tsx** [frontend/sync]
  - Type: component
  - Exports: WebSocketProvider, useWebSocketContext, WebSocketContextValue
- **..\inhost-frontend\src\services\api.ts** [frontend/api]
  - Type: service
  - Exports: apiClient, ApiClient
- **..\inhost-frontend\src\services\database.ts** [frontend/database]
  - Type: service
  - Exports: DatabaseService, db
- **..\inhost-frontend\src\services\logger.ts** [frontend/config]
  - Type: service
  - Exports: Logger, logger, LogLevel, LogEntry
- **..\inhost-frontend\src\services\sync.ts** [frontend/sync]
  - Type: service
  - Exports: SyncService, syncService
- **..\inhost-frontend\src\store\auth-store.ts** [frontend/auth]
  - Type: store
  - Exports: useAuthStore, AuthState
- **..\inhost-frontend\src\store\index.ts** [frontend/ui]
  - Type: store
  - Exports: useStore, AppState
- **..\inhost-frontend\src\store\workspace.ts** [frontend/ui]
  - Type: store
  - Exports: DynamicContainer, WorkspaceTab, useActiveContainer, useActiveTab, useContainer, useTabCount, useWorkspaceStore
- **..\inhost-frontend\src\theme\ThemeProvider.tsx** [frontend/ui]
  - Type: component
  - Exports: ThemeProvider, useTheme
- **..\inhost-frontend\src\types\index.ts** [frontend/messaging]
  - Type: type
  - Exports: MessageEnvelope, MessageType, ChannelType, MessageStatus, PlanType, ApiResponse, HealthStatus, SimulationClient, SimulationExtension, SimulationStatus, ClientId, ExtensionId

## Layer-Domain Matrix

| Layer \ Domain | ui | auth | messaging | sync | api | database | config |
|------|---|---|---|---|---|---|---|
| frontend | 9 | 3 | 2 | 3 | 2 | 1 | 1 |
