# INHOST Frontend

Modern React + TypeScript frontend for the INHOST multi-channel messaging platform.

## Tech Stack

- ⚡ **Vite** - Ultra-fast build tool optimized for Bun
- ⚛️ **React 18** - Modern React with hooks
- 🎨 **TailwindCSS** - Utility-first CSS framework
- 📘 **TypeScript** - Type-safe development
- 🔌 **WebSocket** - Real-time messaging support

## Development

### Prerequisites

1. **API Gateway must be running:**
   ```bash
   # From root directory
   bun --cwd apps/api-gateway dev
   # Or use start-server.bat on Windows
   ```

2. **Install dependencies (from root):**
   ```bash
   bun install
   ```

### Start Development Server

```bash
# From root directory
bun --cwd apps/frontend dev

# Or if you're in apps/frontend/
bun dev
```

The frontend will be available at: **http://localhost:5173**

### API Proxy Configuration

The Vite dev server automatically proxies API requests:

- **Frontend:** `http://localhost:5173`
- **API requests:** `/api/*` → `http://localhost:3000/*`
- **WebSocket:** `/realtime` → `ws://localhost:3000/realtime`

This means you can call `/api/health` in your code and it will automatically route to the backend.

## Project Structure

```
inhost-frontend/
├── src/                      # 🎯 Main application code
│   ├── components/
│   │   ├── chat/            # Chat-specific components
│   │   │   ├── MessageList.tsx
│   │   │   └── MessageInput.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── StatusCard.tsx
│   │   └── ui/              # Reusable UI components
│   ├── pages/               # Page components
│   │   └── Dashboard.tsx
│   ├── services/            # API client services
│   │   └── api.ts
│   ├── hooks/               # Custom React hooks
│   │   └── useWebSocket.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── styles/              # Global styles
│   │   ├── components/      # Component-specific styles
│   │   └── themes/          # Theme styles
│   ├── store/               # State management (future)
│   ├── lib/                 # Utilities and helpers
│   ├── config/              # Configuration files
│   ├── App.tsx              # Root component
│   └── main.tsx             # Entry point
│
├── docs/                    # 📚 Documentation
│   ├── architecture/        # Architecture docs
│   │   ├── RESUMEN_EJECUTIVO.md
│   │   ├── ARQUITECTURA_PRIORITARIA.md
│   │   ├── frontend-strategy.md
│   │   └── plan-modular.md
│   ├── guides/              # Setup and user guides
│   │   ├── SETUP.md
│   │   └── frontend-backend-separation.md
│   └── decisions/           # Architecture Decision Records (ADRs)
│       ├── 001-reorganizacion-y-stack.md
│       └── 002-merge-preparation.md
│
├── tools/                   # 🛠️ Development tools (independent)
│   └── theme-builder/       # Color palette visual tool
│       ├── index.html       # Standalone tool UI
│       ├── themes.json      # Source of truth for colors
│       └── README.md
│
├── public/                  # Static assets
├── .env.example            # Environment variables template
└── package.json
```

**Note**: `/tools/theme-builder` is a **separate standalone tool** for designers, not part of the main INHOST frontend app.

## Features

### Current Features

✅ **Dashboard View** - Real-time message overview
✅ **Message List** - Display incoming/outgoing messages
✅ **Send Messages** - Post new messages to API Gateway
✅ **Health Monitoring** - API status checking
✅ **WebSocket Support** - Real-time updates
✅ **Responsive Design** - Mobile-friendly UI

### Planned Features

- 📊 Channel-specific views (WhatsApp, Telegram, SMS)
- 🔔 Notifications system
- 👥 User management
- 📈 Analytics dashboard
- 🎨 Theme customization
- 🔐 Authentication

## Building for Production

```bash
# Type check
bun run type-check

# Build
bun run build

# Preview production build
bun run preview
```

## Environment Variables

Create `.env` file if needed (optional):

```env
VITE_API_URL=http://localhost:3000
```

## Troubleshooting

### "Failed to fetch" errors

**Cause:** API Gateway not running or wrong port

**Solution:**
```bash
# Start API Gateway first
bun --cwd apps/api-gateway dev
```

### WebSocket not connecting

**Cause:** WebSocket endpoint not available

**Solution:** Ensure API Gateway is running and WebSocket route is enabled (Sprint 3+)

### Styles not loading

**Cause:** Tailwind not configured properly

**Solution:**
```bash
# Reinstall dependencies
bun install
```

## Contributing

This module is completely independent from `apps/api-gateway`. You can develop here without affecting the backend.

### Development Guidelines

1. **No backend changes** - Don't modify anything in `apps/api-gateway/`
2. **Use TypeScript** - All new files should be `.ts` or `.tsx`
3. **Follow component structure** - Keep components small and focused
4. **Use Tailwind** - Prefer Tailwind classes over custom CSS
5. **Type everything** - Leverage TypeScript for safety

## API Integration

See [src/services/api.ts](src/services/api.ts) for API client implementation.

### Example: Send a message

```typescript
import { apiClient } from '@services/api';

await apiClient.sendMessage({
  type: 'outgoing',
  channel: 'web',
  content: { text: 'Hello!' },
  metadata: {
    from: 'web-user',
    to: 'system',
    timestamp: new Date().toISOString(),
  },
});
```

### Example: Use WebSocket

```typescript
import { useWebSocket } from '@hooks/useWebSocket';

const { connected, sendMessage } = useWebSocket({
  onMessage: (data) => {
    console.log('Received:', data);
  },
});
```

## License

Part of the INHOST project.
