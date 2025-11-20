# INHOST Frontend

> **Frontend de chat multi-canal para gestión de conversaciones en tiempo real**
>
> Sistema de chat unificado que permite a los agentes gestionar conversaciones desde múltiples plataformas (WhatsApp, Telegram, Web, SMS) en una interfaz tipo workspace inspirada en VS Code.

---

## 📋 Tabla de Contenidos

1. [Características](#características)
2. [Tecnologías](#tecnologías)
3. [Requisitos](#requisitos)
4. [Instalación](#instalación)
5. [Configuración](#configuración)
6. [Scripts Disponibles](#scripts-disponibles)
7. [Estructura del Proyecto](#estructura-del-proyecto)
8. [Flujo de Desarrollo](#flujo-de-desarrollo)
9. [Arquitectura](#arquitectura)
10. [Documentación](#documentación)
11. [Testing](#testing)
12. [Despliegue](#despliegue)
13. [Convenciones](#convenciones)
14. [Troubleshooting](#troubleshooting)
15. [Contribución](#contribución)
16. [Licencia](#licencia)

---

## ✨ Características

### Core Features

- **🔐 Autenticación JWT**: Sistema multi-tenant con autenticación basada en tokens
- **💬 Chat en Tiempo Real**: WebSocket para mensajes instantáneos bi-direccionales
- **📱 Multi-Canal**: Soporte para WhatsApp, Telegram, Web Chat y SMS
- **🗄️ Offline-First**: IndexedDB como source of truth local con sincronización automática
- **🎨 Workspace Dinámico**: Arquitectura de 3 niveles (Activity Bar, Sidebar, Canvas) con tabs y splits
- **📊 Gestión de Equipo**: Invitaciones, roles y asignación de conversaciones
- **🔔 Menciones**: Sistema de menciones tipo Slack con notificaciones
- **👍 Feedback**: Rating y feedback de mensajes generados por IA
- **📈 Analytics**: Métricas de feedback y performance de extensiones

### UI/UX Features

- **📱 Responsive**: Soporte completo para móvil y desktop
- **🎨 Theming**: Sistema de temas personalizable con editor visual
- **⌨️ Keyboard Shortcuts**: Atajos de teclado para acciones comunes
- **🔍 Search & Filter**: Búsqueda y filtrado de conversaciones y contactos
- **♿ Accessibility**: Soporte ARIA y navegación por teclado
- **🌐 Internacionalización**: Preparado para i18n (pendiente implementar)

### Developer Features

- **🛠️ Dev Tools**: Panel de herramientas de desarrollo integrado
- **🔬 Theme Editor**: Editor visual de temas en tiempo real
- **📊 Database Inspector**: Visualización y edición de IndexedDB
- **🎭 Simulation Mode**: Simulador de clientes y extensiones para testing

---

## 🚀 Tecnologías

### Core Stack

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | ^18.2.0 | UI Library |
| **TypeScript** | ^5.3.3 | Type Safety |
| **Vite** | ^5.0.8 | Build Tool & Dev Server |
| **Zustand** | ^5.0.8 | State Management |
| **React Router** | ^7.9.6 | Client-side Routing |

### Data & Networking

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **IndexedDB (idb)** | ^8.0.3 | Local Persistence |
| **WebSocket** | Native | Real-time Communication |
| **Fetch API** | Native | HTTP Requests |

### UI & Styling

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Tailwind CSS** | ^3.3.6 | Utility-first CSS |
| **Lucide React** | ^0.554.0 | Icon Library |

### Development

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Vite Plugin React** | ^4.2.1 | React Fast Refresh |
| **PostCSS** | ^8.4.32 | CSS Processing |
| **Autoprefixer** | ^10.4.16 | CSS Vendor Prefixes |

---

## 📦 Requisitos

### Sistema

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 (o pnpm >= 8.0.0, yarn >= 1.22.0)
- **Sistema Operativo**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)

### Backend

- **INHOST Backend**: Debe estar corriendo en `http://localhost:3000`
- **WebSocket**: Debe estar disponible en `ws://localhost:3000/realtime`
- **Database**: PostgreSQL + Redis

### Navegadores Soportados

- **Chrome/Edge**: >= 90
- **Firefox**: >= 88
- **Safari**: >= 14
- **Opera**: >= 76

---

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/harvan88/inhost-frontend.git
cd inhost-frontend
```

### 2. Instalar dependencias

```bash
npm install
```

O con yarn:

```bash
yarn install
```

O con pnpm:

```bash
pnpm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Editar `.env` con tus valores:

```env
# API Backend
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/realtime

# Environment
VITE_ENV=development

# Feature Flags (opcional)
VITE_ENABLE_DEV_TOOLS=true
VITE_ENABLE_THEME_EDITOR=true
```

### 4. Verificar instalación

```bash
npm run dev
```

La aplicación debería estar disponible en `http://localhost:5173`

---

## ⚙️ Configuración

### Configuración del Backend

Asegurar que el backend esté configurado correctamente:

1. Backend corriendo en puerto 3000
2. CORS habilitado para `http://localhost:5173`
3. WebSocket endpoint disponible en `/realtime`

### Configuración de CORS (Backend)

En el backend, asegurar CORS configurado:

```typescript
// Backend (ejemplo con Express)
app.use(cors({
  origin: ['http://localhost:5173', 'https://app.inhost.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Proxy de Vite (Desarrollo)

El `vite.config.ts` ya incluye configuración de proxy:

```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
    '/realtime': {
      target: 'ws://localhost:3000',
      ws: true,
    },
  },
}
```

---

## 📜 Scripts Disponibles

### Desarrollo

```bash
# Iniciar dev server con hot reload
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

### Build

```bash
# Build para producción
npm run build
```

Genera archivos optimizados en `/dist`.

### Preview

```bash
# Preview del build de producción
npm run preview
```

Sirve el build de producción en `http://localhost:4173`.

### Type Checking

```bash
# Verificar tipos TypeScript
npm run type-check
```

---

## 📁 Estructura del Proyecto

```
inhost-frontend/
├── docs/                          # Documentación
│   ├── ARCHITECTURE.md            # Arquitectura del sistema
│   ├── TECHNICAL_AUDIT.md         # Auditoría técnica
│   ├── API.md                     # Documentación de API
│   └── COMPONENTS.md              # Documentación de componentes
├── public/                        # Assets estáticos
├── src/
│   ├── components/                # Componentes React
│   │   ├── auth/                  # Autenticación
│   │   ├── chat/                  # Chat (MessageList, MessageInput, etc.)
│   │   ├── common/                # Componentes comunes reutilizables
│   │   ├── feedback/              # Sistema de feedback (Toast, ErrorBoundary)
│   │   ├── layout/                # Layouts (Header, StatusCard)
│   │   ├── mentions/              # Menciones
│   │   ├── mobile/                # Componentes específicos de móvil
│   │   ├── settings/              # Configuraciones (Team, Account, Integrations)
│   │   ├── tools/                 # Herramientas de desarrollo
│   │   ├── ui/                    # UI primitives (Button, Input, Card, etc.)
│   │   └── workspace/             # Workspace (ActivityBar, Sidebar, Canvas)
│   ├── hooks/                     # Custom React Hooks
│   │   ├── useWebSocket.ts
│   │   ├── useToast.ts
│   │   ├── useBreakpoint.ts
│   │   └── ...
│   ├── lib/                       # Librerías y utilidades
│   │   ├── api/
│   │   │   └── admin-client.ts    # Cliente API administrativa
│   │   └── auth/
│   │       └── jwt.ts             # Utilidades JWT
│   ├── pages/                     # Páginas (rutas)
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── SignupPage.tsx
│   │   └── Dashboard.tsx
│   ├── providers/                 # React Context Providers
│   │   └── WebSocketProvider.tsx
│   ├── services/                  # Servicios de negocio
│   │   ├── api.ts                 # Cliente API de simulación
│   │   ├── database.ts            # Servicio IndexedDB
│   │   ├── logger.ts              # Sistema de logging
│   │   └── sync.ts                # Sincronización IndexedDB ↔ Backend
│   ├── store/                     # Zustand Stores
│   │   ├── index.ts               # Main store (entities, simulation, ui, network)
│   │   ├── workspace.ts           # Workspace store
│   │   └── auth-store.ts          # Auth store
│   ├── styles/                    # Estilos globales
│   │   ├── index.css              # Tailwind imports
│   │   └── App.css                # Estilos de la app
│   ├── theme/                     # Sistema de temas
│   │   ├── ThemeProvider.tsx
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── index.ts
│   ├── types/                     # TypeScript types
│   │   └── index.ts               # Tipos globales (MessageEnvelope, Conversation, etc.)
│   ├── utils/                     # Utilidades generales
│   ├── App.tsx                    # Root component con routing
│   ├── main.tsx                   # Entry point
│   └── vite-env.d.ts              # Vite types
├── .env.example                   # Ejemplo de variables de entorno
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json                  # TypeScript config
├── tsconfig.node.json             # TypeScript config para Vite
├── vite.config.ts                 # Vite config
├── tailwind.config.js             # Tailwind config
├── postcss.config.js              # PostCSS config
└── README.md
```

---

## 🔄 Flujo de Desarrollo

### 1. Clonar y Setup

```bash
git clone https://github.com/harvan88/inhost-frontend.git
cd inhost-frontend
npm install
cp .env.example .env
npm run dev
```

### 2. Crear Feature Branch

```bash
git checkout -b feature/my-new-feature
```

### 3. Desarrollar Feature

- Escribir código siguiendo las [Convenciones](#convenciones)
- Testear localmente
- Hacer commits atómicos con mensajes descriptivos

### 4. Testing

```bash
# Type checking
npm run type-check

# Manual testing
npm run dev
```

### 5. Pull Request

```bash
git push origin feature/my-new-feature
```

Crear PR en GitHub con descripción detallada.

### 6. Code Review

- El equipo revisa el código
- Hacer cambios solicitados
- Aprobar y mergear

---

## 🏛️ Arquitectura

### Visión General

INHOST Frontend sigue una **arquitectura de 3 niveles** inspirada en VS Code:

```
┌──────────────┬──────────────────┬────────────────────────────┐
│ Activity Bar │ Sidebar          │ Canvas (Lienzo)            │
│ (Nivel 1)    │ Contextual       │ (Nivel 3)                  │
│              │ (Nivel 2)        │                            │
└──────────────┴──────────────────┴────────────────────────────┘
```

- **Nivel 1 - Activity Bar**: Selección de dominio (Messages, Contacts, Tools, Settings)
- **Nivel 2 - Sidebar Contextual**: Lista de entidades del dominio activo
- **Nivel 3 - Canvas**: Superficie con múltiples contenedores dinámicos (tabs, splits)

### Capas de la Aplicación

```
┌─────────────────────────────────────────────────────────┐
│                     PRESENTATION                         │
│  Components (UI) - Pages - Layouts                      │
└─────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────┐
│                   STATE MANAGEMENT                       │
│  Zustand Stores (Global State)                          │
└─────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────┐
│                      SERVICES                            │
│  Business Logic & Orchestration                         │
└─────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────┐
│                    PERSISTENCE                           │
│  IndexedDB (Source of Truth Local)                      │
└─────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────┐
│                    BACKEND API                           │
│  REST API + WebSocket                                   │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Datos

**Boot Flow**:
1. App monta → WebSocketProvider monta
2. Initialize logger → Initialize IndexedDB
3. Load data from IndexedDB → Zustand Store
4. Connect WebSocket
5. User lands on /login or /workspace

**Message Reception Flow** (WebSocket):
1. WebSocket receives 'message_received' event
2. Parse MessageEnvelope
3. Persist to IndexedDB
4. Ensure conversation & contact exist
5. Update Zustand Store
6. Show toast notification (if needed)

**Message Sending Flow**:
1. User types in MessageInput
2. adminAPI.sendMessage()
3. Backend processes message
4. WebSocket broadcasts 'message:new' event
5. handleMessageNew() → Same as Message Reception Flow

Ver documentación completa en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 📚 Documentación

### Documentos Disponibles

| Documento | Descripción |
|-----------|-------------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Arquitectura completa del sistema |
| [`docs/TECHNICAL_AUDIT.md`](docs/TECHNICAL_AUDIT.md) | Auditoría técnica exhaustiva |
| [`docs/API.md`](docs/API.md) | Documentación de API REST y WebSocket |
| `docs/COMPONENTS.md` | Documentación de componentes (pendiente) |

### Recursos Externos

- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Vite Docs](https://vitejs.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

---

## 🧪 Testing

### Estado Actual

⚠️ **Cobertura de Tests: 0%** (CRÍTICO)

No hay tests unitarios ni de integración implementados.

### Configuración Recomendada

```bash
# Instalar dependencias de testing
npm install --save-dev vitest @vitest/ui
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev fake-indexeddb  # Mock IndexedDB
```

### Ejecutar Tests (cuando estén implementados)

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con UI
npm run test:ui

# Ejecutar tests con coverage
npm run test:coverage
```

### Prioridades de Testing

1. **Services** (database, sync, api) - CRÍTICO
2. **Stores** (Zustand stores) - ALTO
3. **API Clients** (admin-client) - ALTO
4. **Hooks** (useWebSocket, useToast) - MEDIO
5. **Components** (LoginPage, Workspace) - MEDIO

Ver plan completo en [`docs/TECHNICAL_AUDIT.md#tests-faltantes-críticos`](docs/TECHNICAL_AUDIT.md#tests-faltantes-críticos).

---

## 🚢 Despliegue

### Build de Producción

```bash
# 1. Build
npm run build

# 2. Verificar build
npm run preview

# 3. Los archivos estarán en /dist
```

### Despliegue en Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

O configurar en Vercel dashboard:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Despliegue en Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

O configurar en Netlify dashboard:
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

### Variables de Entorno en Producción

Configurar en el panel de tu hosting provider:

```env
VITE_API_BASE_URL=https://api.inhost.com
VITE_WS_URL=wss://api.inhost.com/realtime
VITE_ENV=production
```

### Consideraciones de Producción

1. **CORS**: Configurar CORS en el backend para el dominio de producción
2. **HTTPS**: Usar HTTPS para WebSocket (wss://)
3. **CDN**: Configurar CDN para assets estáticos
4. **Monitoring**: Implementar Sentry o similar para error tracking
5. **Analytics**: Configurar Google Analytics o similar

---

## 📝 Convenciones

### Naming Conventions

#### Archivos

- **Componentes**: `PascalCase.tsx` (ej: `MessageInput.tsx`)
- **Hooks**: `camelCase.ts` con prefijo `use` (ej: `useWebSocket.ts`)
- **Services**: `camelCase.ts` (ej: `database.ts`)
- **Types**: `camelCase.ts` o `index.ts` (ej: `types/index.ts`)
- **Utils**: `camelCase.ts` (ej: `tabHelpers.ts`)

#### Código

- **Variables**: `camelCase` (ej: `conversationId`)
- **Constants**: `UPPER_SNAKE_CASE` (ej: `MAX_RECONNECT_ATTEMPTS`)
- **Funciones**: `camelCase` (ej: `handleMessageReceived`)
- **Interfaces**: `PascalCase` (ej: `MessageEnvelope`)
- **Types**: `PascalCase` (ej: `MessageType`)
- **Enums**: `PascalCase` para el enum, `UPPER_SNAKE_CASE` para valores (ej: `enum Status { ACTIVE = 'ACTIVE' }`)

### Git Conventions

#### Commit Messages

Formato: `<type>(<scope>): <message>`

**Types**:
- `feat`: Nueva feature
- `fix`: Bug fix
- `docs`: Documentación
- `style`: Formateo, punto y coma faltantes, etc.
- `refactor`: Refactorización de código
- `test`: Agregar tests
- `chore`: Mantenimiento, dependencias, etc.

**Ejemplos**:
```
feat(chat): agregar virtualización a MessageList
fix(auth): corregir refresh de tokens
docs: actualizar README con instrucciones de deployment
refactor(services): separar AdminAPIClient en clientes especializados
test(store): agregar tests unitarios para workspace store
```

#### Branch Naming

- **Features**: `feature/descripcion-corta`
- **Fixes**: `fix/descripcion-del-bug`
- **Hotfix**: `hotfix/descripcion-urgente`
- **Refactor**: `refactor/que-se-refactoriza`
- **Docs**: `docs/que-se-documenta`

### Code Style

#### TypeScript

```typescript
// ✅ GOOD: Tipos explícitos
function handleMessage(message: MessageEnvelope): void {
  console.log(message.id);
}

// ❌ BAD: Sin tipos
function handleMessage(message) {
  console.log(message.id);
}

// ✅ GOOD: Interfaces segregadas
interface MessageActions {
  addMessage: (conversationId: string, message: MessageEnvelope) => void;
  setMessages: (conversationId: string, messages: MessageEnvelope[]) => void;
}

// ❌ BAD: Interface monolítica
interface Actions {
  // 50+ métodos...
}
```

#### React

```typescript
// ✅ GOOD: Functional components con TypeScript
interface MessageInputProps {
  conversationId: string;
  onSend: (text: string) => void;
}

export default function MessageInput({ conversationId, onSend }: MessageInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSend(text);
    setText('');
  };

  return (/* JSX */);
}

// ❌ BAD: Sin tipos
export default function MessageInput({ conversationId, onSend }) {
  // ...
}
```

#### Imports

Orden de imports:

1. React y librerías externas
2. Componentes internos
3. Hooks internos
4. Services
5. Types
6. Estilos

```typescript
// ✅ GOOD: Orden claro
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { MessageInput } from '@/components/chat';
import { useWebSocketContext } from '@/providers/WebSocketProvider';
import { useStore } from '@/store';
import { adminAPI } from '@/lib/api/admin-client';
import type { MessageEnvelope } from '@/types';

import './styles.css';
```

---

## 🐛 Troubleshooting

### Problema: WebSocket no conecta

**Síntomas**:
- Error en consola: `WebSocket connection failed`
- Status: `disconnected`

**Soluciones**:
1. Verificar que el backend esté corriendo en `http://localhost:3000`
2. Verificar que el WebSocket endpoint esté disponible en `/realtime`
3. Verificar configuración de proxy en `vite.config.ts`
4. Revisar logs del backend para errores de CORS

---

### Problema: Token JWT expirado

**Síntomas**:
- Redirigido a login inesperadamente
- Error 401 en requests

**Soluciones**:
1. Login nuevamente
2. Implementar refresh de tokens (ver `docs/TECHNICAL_AUDIT.md`)
3. Verificar expiración del token en localStorage

---

### Problema: IndexedDB no carga datos

**Síntomas**:
- Conversaciones no aparecen después de login
- Error en consola: `Failed to load from IndexedDB`

**Soluciones**:
1. Abrir DevTools → Application → IndexedDB → Verificar `inhost-chat-db`
2. Limpiar IndexedDB:
   ```javascript
   // En consola del navegador
   indexedDB.deleteDatabase('inhost-chat-db');
   // Recargar página
   ```
3. Verificar logs en consola para errores de schema

---

### Problema: Performance lenta con muchas conversaciones

**Síntomas**:
- Lag al scrollear lista de conversaciones
- Alto uso de CPU/memoria

**Soluciones**:
1. Implementar virtualización (ver `docs/TECHNICAL_AUDIT.md`)
2. Limitar número de conversaciones cargadas inicialmente
3. Implementar paginación

---

### Problema: Build falla en producción

**Síntomas**:
- Error durante `npm run build`
- TypeScript errors

**Soluciones**:
1. Ejecutar `npm run type-check` para ver errores
2. Verificar que todas las dependencias estén instaladas
3. Limpiar `node_modules` y reinstalar:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## 🤝 Contribución

### Proceso de Contribución

1. Fork el repositorio
2. Crear feature branch (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'feat: agregar feature amazing'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

### Guidelines

- Seguir las [Convenciones](#convenciones)
- Escribir tests para nuevas features
- Actualizar documentación si es necesario
- Mantener el código limpio y legible
- Hacer commits atómicos con mensajes descriptivos

### Code Review Process

1. PR es creado
2. CI/CD ejecuta checks (lint, type-check, tests)
3. Al menos 1 reviewer aprueba
4. PR es merged a `main`

---

## 📜 Licencia

Este proyecto es privado y pertenece a INHOST.

**Copyright © 2025 INHOST. Todos los derechos reservados.**

---

## 📞 Contacto

- **Equipo**: INHOST Development Team
- **Email**: dev@inhost.com
- **Issues**: [GitHub Issues](https://github.com/harvan88/inhost-frontend/issues)
- **Slack**: #inhost-frontend

---

## 🙏 Agradecimientos

- **VS Code Team**: Por la inspiración de la arquitectura de workspace
- **Zustand**: Por el excelente state management
- **Tailwind CSS**: Por el sistema de diseño utility-first
- **React Team**: Por React 18 y Concurrent Features

---

**Última Actualización**: 2025-01-20
**Versión**: 1.0.0
**Mantenido por**: Equipo INHOST
