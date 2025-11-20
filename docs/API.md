# INHOST Frontend - Documentación de API

> **Endpoints REST y WebSocket para comunicación con el backend**
>
> **Base URL**: `http://localhost:3000` (desarrollo)
> **WebSocket URL**: `ws://localhost:3000/realtime`

---

## Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Sincronización](#sincronización)
3. [Conversaciones](#conversaciones)
4. [Mensajes](#mensajes)
5. [End Users (Contactos)](#end-users-contactos)
6. [Equipo](#equipo)
7. [Cuenta](#cuenta)
8. [Integraciones](#integraciones)
9. [Menciones](#menciones)
10. [Feedback de Mensajes](#feedback-de-mensajes)
11. [Simulación (Dev)](#simulación-dev)
12. [WebSocket Events](#websocket-events)

---

## Autenticación

### POST `/admin/auth/login`

Autenticación de usuario con email y contraseña.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin",
      "tenantId": "tenant_456",
      "tenantName": "Acme Corp",
      "tenantSlug": "acme-corp"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  },
  "metadata": {
    "timestamp": "2025-01-20T10:30:00Z"
  }
}
```

**Errors**:
- `400 Bad Request`: Email o password faltantes
- `401 Unauthorized`: Credenciales inválidas
- `429 Too Many Requests`: Rate limit excedido

---

### POST `/admin/auth/signup`

Registro de nuevo usuario y tenant.

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "name": "Jane Smith",
  "tenantName": "Jane's Company",
  "plan": "professional"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_789",
      "email": "newuser@example.com",
      "name": "Jane Smith",
      "role": "owner",
      "tenantId": "tenant_999",
      "tenantName": "Jane's Company",
      "tenantSlug": "janes-company"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}
```

**Errors**:
- `400 Bad Request`: Datos faltantes o inválidos
- `409 Conflict`: Email ya registrado

---

### POST `/admin/auth/refresh`

Renovar access token usando refresh token.

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

**Errors**:
- `401 Unauthorized`: Refresh token inválido o expirado

---

## Sincronización

### GET `/admin/sync/initial`

Sincronización inicial de datos al hacer login.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv_123",
        "endUserId": "user_456",
        "channel": "whatsapp",
        "status": "active",
        "lastMessage": {
          "id": "msg_789",
          "text": "Hello!",
          "type": "incoming",
          "timestamp": "2025-01-20T10:25:00Z"
        },
        "unreadCount": 2,
        "isPinned": false,
        "assignedTo": {
          "id": "agent_123",
          "name": "John Doe"
        },
        "createdAt": "2025-01-15T08:00:00Z",
        "updatedAt": "2025-01-20T10:25:00Z"
      }
    ],
    "contacts": [
      {
        "id": "user_456",
        "name": "Customer One",
        "email": "customer@example.com",
        "phone": "+1234567890",
        "createdAt": "2025-01-15T08:00:00Z",
        "lastContactAt": "2025-01-20T10:25:00Z"
      }
    ],
    "team": [
      {
        "id": "agent_123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin",
        "status": "active",
        "joinedAt": "2025-01-01T00:00:00Z",
        "lastActive": "2025-01-20T10:20:00Z"
      }
    ],
    "integrations": [
      {
        "id": "int_whatsapp_1",
        "type": "whatsapp",
        "name": "WhatsApp Business",
        "status": "connected",
        "connectedAt": "2025-01-10T12:00:00Z"
      }
    ]
  }
}
```

**Query Parameters**:
- `conversationsLimit` (number): Límite de conversaciones a devolver (default: todas)
- `conversationsOffset` (number): Offset para paginación (default: 0)
- `includeMessages` (boolean): Incluir mensajes (default: false)

**Errors**:
- `401 Unauthorized`: Token inválido o expirado
- `500 Internal Server Error`: Error de sincronización

---

## Conversaciones

### GET `/admin/conversations`

Obtener lista de conversaciones.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Query Parameters**:
- `limit` (number): Número de conversaciones (default: 50, max: 100)
- `offset` (number): Offset para paginación (default: 0)
- `status` (string): Filtrar por estado (`active`, `closed`, `archived`)
- `channel` (string): Filtrar por canal (`whatsapp`, `telegram`, `web`, `sms`)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv_123",
        "endUserId": "user_456",
        "channel": "whatsapp",
        "status": "active",
        "lastMessage": {
          "id": "msg_789",
          "text": "Hello!",
          "type": "incoming",
          "timestamp": "2025-01-20T10:25:00Z"
        },
        "unreadCount": 2,
        "isPinned": false,
        "assignedTo": null,
        "createdAt": "2025-01-15T08:00:00Z",
        "updatedAt": "2025-01-20T10:25:00Z"
      }
    ],
    "total": 42
  }
}
```

---

### GET `/admin/conversations/:id`

Obtener detalles de una conversación específica.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conv_123",
      "endUserId": "user_456",
      "channel": "whatsapp",
      "status": "active",
      "lastMessage": {
        "id": "msg_789",
        "text": "Hello!",
        "type": "incoming",
        "timestamp": "2025-01-20T10:25:00Z"
      },
      "unreadCount": 2,
      "isPinned": false,
      "assignedTo": null,
      "createdAt": "2025-01-15T08:00:00Z",
      "updatedAt": "2025-01-20T10:25:00Z"
    }
  }
}
```

**Errors**:
- `404 Not Found`: Conversación no encontrada

---

### POST `/admin/conversations`

Crear nueva conversación.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request Body**:
```json
{
  "endUserId": "user_456",
  "channel": "whatsapp"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conv_new_123",
      "endUserId": "user_456",
      "channel": "whatsapp",
      "status": "active",
      "unreadCount": 0,
      "isPinned": false,
      "createdAt": "2025-01-20T10:30:00Z",
      "updatedAt": "2025-01-20T10:30:00Z"
    }
  }
}
```

---

### PATCH `/admin/conversations/:id`

Actualizar conversación.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request Body**:
```json
{
  "status": "closed",
  "assignedTo": "agent_123",
  "isPinned": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conv_123",
      "status": "closed",
      "assignedTo": {
        "id": "agent_123",
        "name": "John Doe"
      },
      "isPinned": true,
      "updatedAt": "2025-01-20T10:35:00Z"
    }
  }
}
```

---

### POST `/admin/conversations/:id/mark-as-read`

Marcar conversación como leída.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request Body** (opcional):
```json
{
  "messageIds": ["msg_123", "msg_456"]
}
```

Si no se especifica `messageIds`, se marcan todos los mensajes como leídos.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "markedCount": 5,
    "conversation": {
      "id": "conv_123",
      "unreadCount": 0
    }
  }
}
```

---

## Mensajes

### GET `/admin/conversations/:conversationId/messages`

Obtener mensajes de una conversación.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Query Parameters**:
- `limit` (number): Número de mensajes (default: 50, max: 100)
- `before` (string): ID del mensaje antes del cual cargar (para paginación)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_123",
        "conversationId": "conv_123",
        "type": "incoming",
        "channel": "whatsapp",
        "content": {
          "text": "Hello! How can I help you?",
          "contentType": "text/plain"
        },
        "metadata": {
          "from": "+1234567890",
          "to": "+0987654321",
          "timestamp": "2025-01-20T10:25:00Z",
          "messageId": "msg_123",
          "conversationId": "conv_123",
          "ownerId": "tenant_456"
        },
        "statusChain": [
          {
            "status": "received",
            "timestamp": "2025-01-20T10:25:00Z",
            "messageId": "msg_123"
          }
        ],
        "context": {
          "plan": "premium",
          "timestamp": "2025-01-20T10:25:00Z"
        }
      }
    ],
    "hasMore": true
  }
}
```

---

### POST `/admin/conversations/:conversationId/messages`

Enviar mensaje en una conversación.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request Body**:
```json
{
  "type": "outgoing",
  "content": {
    "text": "Thank you for contacting us!",
    "contentType": "text/plain"
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg_new_456",
      "conversationId": "conv_123",
      "type": "outgoing",
      "channel": "whatsapp",
      "content": {
        "text": "Thank you for contacting us!",
        "contentType": "text/plain"
      },
      "metadata": {
        "from": "+0987654321",
        "to": "+1234567890",
        "timestamp": "2025-01-20T10:30:00Z",
        "messageId": "msg_new_456",
        "conversationId": "conv_123",
        "ownerId": "tenant_456"
      },
      "statusChain": [
        {
          "status": "sending",
          "timestamp": "2025-01-20T10:30:00Z",
          "messageId": "msg_new_456"
        }
      ],
      "context": {
        "plan": "premium",
        "timestamp": "2025-01-20T10:30:00Z"
      }
    }
  }
}
```

---

### PATCH `/admin/messages/:messageId/status`

Actualizar estado de un mensaje.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request Body**:
```json
{
  "status": "delivered"
}
```

**Response** (200 OK):
```json
{
  "success": true
}
```

**Status Values**:
- `received`: Recibido del usuario
- `processing`: Procesando
- `sending`: Enviando
- `sent`: Enviado
- `delivered`: Entregado
- `read`: Leído
- `failed`: Falló

---

## End Users (Contactos)

### GET `/admin/end-users`

Obtener lista de end users (contactos).

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Query Parameters**:
- `limit` (number): Número de contactos (default: 50)
- `offset` (number): Offset para paginación (default: 0)
- `search` (string): Buscar por nombre, email o teléfono

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "user_456",
      "name": "Customer One",
      "email": "customer@example.com",
      "phone": "+1234567890",
      "createdAt": "2025-01-15T08:00:00Z",
      "lastContactAt": "2025-01-20T10:25:00Z"
    }
  ],
  "total": 150
}
```

---

### GET `/admin/end-users/:id`

Obtener detalles de un end user.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "contact": {
      "id": "user_456",
      "name": "Customer One",
      "email": "customer@example.com",
      "phone": "+1234567890",
      "createdAt": "2025-01-15T08:00:00Z",
      "lastContactAt": "2025-01-20T10:25:00Z"
    }
  }
}
```

---

### POST `/admin/end-users`

Crear nuevo end user.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request Body**:
```json
{
  "name": "New Customer",
  "channel": "whatsapp",
  "metadata": {
    "phoneNumber": "+1234567890",
    "email": "newcustomer@example.com"
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "contact": {
      "id": "user_new_789",
      "name": "New Customer",
      "email": "newcustomer@example.com",
      "phone": "+1234567890",
      "createdAt": "2025-01-20T10:30:00Z"
    }
  }
}
```

---

### PATCH `/admin/end-users/:id`

Actualizar end user.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request Body**:
```json
{
  "name": "Updated Name",
  "metadata": {
    "email": "updated@example.com"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "contact": {
      "id": "user_456",
      "name": "Updated Name",
      "email": "updated@example.com",
      "phone": "+1234567890"
    }
  }
}
```

---

## Equipo

### GET `/admin/team`

Obtener lista de miembros del equipo.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "agent_123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin",
        "status": "active",
        "joinedAt": "2025-01-01T00:00:00Z",
        "lastActive": "2025-01-20T10:20:00Z"
      }
    ]
  }
}
```

---

### POST `/admin/team/invites`

Invitar nuevo miembro al equipo.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request Body**:
```json
{
  "email": "newagent@example.com",
  "name": "Jane Smith",
  "role": "agent"
}
```

**Roles**:
- `admin`: Administrador con permisos completos
- `agent`: Agente con permisos limitados

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "invite": {
      "id": "invite_123",
      "email": "newagent@example.com",
      "role": "agent",
      "status": "pending",
      "expiresAt": "2025-01-27T10:30:00Z"
    }
  }
}
```

---

### DELETE `/admin/team/members/:memberId`

Eliminar miembro del equipo.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "memberId": "agent_123"
  }
}
```

---

### PATCH `/admin/team/members/:memberId`

Actualizar rol de miembro.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request Body**:
```json
{
  "role": "admin"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "member": {
      "id": "agent_123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "status": "active"
    }
  }
}
```

---

## Cuenta

### GET `/admin/account`

Obtener información de cuenta y tenant.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin",
      "tenantId": "tenant_456"
    },
    "tenant": {
      "id": "tenant_456",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "plan": "professional",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  }
}
```

---

### PATCH `/admin/account`

Actualizar información de cuenta.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request Body**:
```json
{
  "name": "John Updated",
  "timezone": "America/New_York"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123",
      "email": "user@example.com",
      "name": "John Updated",
      "timezone": "America/New_York"
    }
  }
}
```

---

## Integraciones

### GET `/admin/integrations`

Obtener lista de integraciones.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "integrations": [
      {
        "id": "int_whatsapp_1",
        "type": "whatsapp",
        "name": "WhatsApp Business",
        "status": "connected",
        "connectedAt": "2025-01-10T12:00:00Z"
      },
      {
        "id": "int_telegram_1",
        "type": "telegram",
        "name": "Telegram Bot",
        "status": "disconnected",
        "connectedAt": null
      }
    ]
  }
}
```

---

### POST `/admin/integrations/:type/connect`

Conectar nueva integración.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request Body** (ejemplo WhatsApp):
```json
{
  "credentials": {
    "apiKey": "your-api-key",
    "phoneNumber": "+1234567890"
  },
  "config": {
    "webhookUrl": "https://your-domain.com/webhook"
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "integration": {
      "id": "int_whatsapp_new",
      "type": "whatsapp",
      "name": "WhatsApp Business",
      "status": "connected",
      "connectedAt": "2025-01-20T10:30:00Z"
    }
  }
}
```

---

### DELETE `/admin/integrations/:integrationId`

Desconectar integración.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "integrationId": "int_whatsapp_1"
  }
}
```

---

## Menciones

### GET `/admin/mentions`

Obtener menciones del usuario actual.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Query Parameters**:
- `status` (string): Filtrar por estado (`all`, `read`, `unread`) (default: `all`)
- `limit` (number): Número de menciones (default: 50)
- `offset` (number): Offset para paginación (default: 0)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "mentions": [
      {
        "id": "mention_123",
        "entityType": "message",
        "entityId": "msg_456",
        "entityDetails": {
          "id": "msg_456",
          "type": "incoming",
          "text": "Can someone help? @john",
          "conversationId": "conv_789",
          "endUser": {
            "id": "user_999",
            "name": "Customer Two",
            "externalId": "+1234567890"
          },
          "createdAt": "2025-01-20T10:25:00Z"
        },
        "mentionType": "user",
        "context": "Message in conversation with Customer Two",
        "isRead": false,
        "mentionedBy": {
          "id": "agent_456",
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "createdAt": "2025-01-20T10:25:00Z"
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 15
    }
  }
}
```

---

### GET `/admin/mentions/unread-count`

Obtener contador de menciones no leídas.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "unreadCount": 3
  }
}
```

---

### GET `/admin/mentions/:id`

Obtener detalles de una mención.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "mention_123",
    "entityType": "message",
    "entityId": "msg_456",
    "isRead": false,
    "createdAt": "2025-01-20T10:25:00Z"
  }
}
```

---

### POST `/admin/mentions/:id/mark-as-read`

Marcar mención como leída.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "mention_123",
    "isRead": true,
    "message": "Mention marked as read"
  }
}
```

---

### POST `/admin/mentions/mark-all-read`

Marcar todas las menciones como leídas.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "markedCount": 15,
    "message": "All mentions marked as read"
  }
}
```

---

## Feedback de Mensajes

### POST `/admin/messages/:messageId/feedback`

Crear o actualizar feedback de mensaje (rating positivo/negativo).

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request Body**:
```json
{
  "rating": "positive",
  "comment": "Great response!",
  "suggestedCorrection": null
}
```

**Ratings**:
- `positive`: Feedback positivo
- `negative`: Feedback negativo

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "feedback": {
      "id": "feedback_123",
      "messageId": "msg_456",
      "rating": "positive",
      "comment": "Great response!",
      "suggestedCorrection": null,
      "extensionId": "ext_ai_1",
      "givenBy": {
        "id": "agent_123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2025-01-20T10:30:00Z",
      "updatedAt": "2025-01-20T10:30:00Z"
    },
    "message": "Feedback saved successfully"
  }
}
```

---

### GET `/admin/messages/:messageId/feedback`

Obtener feedback de un mensaje.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "feedback": [
      {
        "id": "feedback_123",
        "messageId": "msg_456",
        "rating": "positive",
        "comment": "Great response!",
        "givenBy": {
          "id": "agent_123",
          "name": "John Doe"
        },
        "createdAt": "2025-01-20T10:30:00Z"
      }
    ]
  }
}
```

---

### GET `/admin/feedback`

Obtener todos los feedbacks (para análisis).

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Query Parameters**:
- `extensionId` (string): Filtrar por extensión
- `rating` (string): Filtrar por rating (`positive`, `negative`, `none`, `all`)
- `limit` (number): Número de feedbacks (default: 50)
- `offset` (number): Offset para paginación (default: 0)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "feedback": [
      {
        "id": "feedback_123",
        "messageId": "msg_456",
        "rating": "positive",
        "comment": "Great response!",
        "extensionId": "ext_ai_1",
        "message": {
          "id": "msg_456",
          "type": "outgoing",
          "text": "Hello! How can I help you?",
          "conversationId": "conv_789",
          "endUser": {
            "id": "user_999",
            "name": "Customer Two",
            "externalId": "+1234567890"
          },
          "createdAt": "2025-01-20T10:25:00Z"
        },
        "givenBy": {
          "id": "agent_123",
          "name": "John Doe"
        },
        "createdAt": "2025-01-20T10:30:00Z"
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0
    }
  }
}
```

---

### GET `/admin/feedback/analytics`

Obtener análisis de feedback.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Query Parameters**:
- `extensionId` (string): Filtrar por extensión
- `days` (number): Período de análisis en días (default: 30)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "period": {
      "days": 30,
      "from": "2024-12-21T00:00:00Z",
      "to": "2025-01-20T23:59:59Z"
    },
    "overall": {
      "total": 150,
      "positive": 120,
      "negative": 30,
      "positivePercentage": 80,
      "negativePercentage": 20,
      "withComments": 45,
      "withCorrections": 12
    },
    "byExtension": [
      {
        "extensionId": "ext_ai_1",
        "total": 100,
        "positive": 85,
        "negative": 15,
        "positivePercentage": 85,
        "negativePercentage": 15
      },
      {
        "extensionId": "ext_echo_1",
        "total": 50,
        "positive": 35,
        "negative": 15,
        "positivePercentage": 70,
        "negativePercentage": 30
      }
    ]
  }
}
```

---

## Simulación (Dev)

> Endpoints para simulación de clientes y extensiones durante desarrollo

### GET `/health`

Health check del backend.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "postgresql",
    "timestamp": "2025-01-20T10:30:00Z",
    "version": "1.0.0",
    "redis": {
      "status": "connected",
      "host": "localhost",
      "port": 6379
    }
  }
}
```

---

### GET `/simulate/status`

Obtener estado de simulación.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "whatsapp-sim",
        "name": "WhatsApp Simulator",
        "icon": "whatsapp",
        "channel": "whatsapp",
        "connected": true,
        "metadata": {
          "phone": "+1234567890",
          "businessId": "business_123"
        }
      }
    ],
    "extensions": [
      {
        "id": "echo",
        "name": "Echo Extension",
        "icon": "repeat",
        "active": true,
        "latency": 500,
        "subscriptions": ["incoming"]
      }
    ],
    "stats": {
      "activeExtensions": 2,
      "connectedClients": 3,
      "totalClients": 4,
      "totalExtensions": 3
    }
  }
}
```

---

### POST `/simulate/client-message`

Simular mensaje entrante desde un cliente.

**Request Body**:
```json
{
  "clientId": "whatsapp",
  "text": "Hello from simulation!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "clientMessage": {
      "id": "msg_sim_123",
      "conversationId": "conv_sim_456",
      "type": "incoming",
      "channel": "whatsapp",
      "content": {
        "text": "Hello from simulation!",
        "contentType": "text/plain"
      }
    },
    "extensionResponses": [
      {
        "id": "msg_sim_789",
        "conversationId": "conv_sim_456",
        "type": "outgoing",
        "channel": "whatsapp",
        "content": {
          "text": "Echo: Hello from simulation!",
          "contentType": "text/plain"
        },
        "metadata": {
          "extensionId": "echo"
        }
      }
    ],
    "processedCount": 2
  }
}
```

**WebSocket Broadcasts Automáticos**:
- `message_received`: Mensaje original
- `message_processing`: Durante procesamiento
- `extension_response`: Por cada respuesta de extensión

---

### POST `/simulate/client-toggle`

Conectar/desconectar cliente simulado.

**Request Body**:
```json
{
  "clientId": "whatsapp"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "clientId": "whatsapp-sim",
    "connected": true
  }
}
```

**WebSocket Broadcast**: `client_toggle`

---

### POST `/simulate/extension-toggle`

Activar/desactivar extensión.

**Request Body**:
```json
{
  "extensionId": "echo"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "extensionId": "echo",
    "active": true
  }
}
```

**WebSocket Broadcast**: `extension_toggle`

---

### PATCH `/simulate/extension-latency`

Actualizar latencia de extensión.

**Request Body**:
```json
{
  "extensionId": "echo",
  "latency": 1000
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "extensionId": "echo",
    "latency": 1000
  }
}
```

---

## WebSocket Events

**WebSocket URL**: `ws://localhost:3000/realtime`

### Eventos Recibidos (del Backend)

#### `connection`

Confirmación de conexión WebSocket.

**Payload**:
```json
{
  "type": "connection",
  "status": "connected",
  "timestamp": "2025-01-20T10:30:00Z",
  "clientId": "client_abc123"
}
```

---

#### `message_received`

Nuevo mensaje recibido de cliente externo.

**Payload**:
```json
{
  "type": "message_received",
  "data": {
    "id": "msg_123",
    "conversationId": "conv_456",
    "type": "incoming",
    "channel": "whatsapp",
    "content": {
      "text": "Hello!",
      "contentType": "text/plain"
    },
    "metadata": {
      "from": "+1234567890",
      "to": "+0987654321",
      "timestamp": "2025-01-20T10:30:00Z"
    },
    "statusChain": [
      {
        "status": "received",
        "timestamp": "2025-01-20T10:30:00Z",
        "messageId": "msg_123"
      }
    ],
    "context": {
      "plan": "premium",
      "timestamp": "2025-01-20T10:30:00Z"
    }
  },
  "timestamp": "2025-01-20T10:30:00Z"
}
```

---

#### `message_processing`

Notificación de que las extensiones están procesando.

**Payload**:
```json
{
  "type": "message_processing",
  "extensionCount": 2,
  "timestamp": "2025-01-20T10:30:01Z"
}
```

---

#### `extension_response`

Respuesta de una extensión.

**Payload**:
```json
{
  "type": "extension_response",
  "data": {
    "id": "msg_789",
    "conversationId": "conv_456",
    "type": "outgoing",
    "channel": "whatsapp",
    "content": {
      "text": "Automated response",
      "contentType": "text/plain"
    },
    "metadata": {
      "from": "+0987654321",
      "to": "+1234567890",
      "timestamp": "2025-01-20T10:30:05Z",
      "extensionId": "ai"
    }
  },
  "timestamp": "2025-01-20T10:30:05Z"
}
```

---

#### `message:new`

Notificación de nuevo mensaje (FASE 1).

**Payload**:
```json
{
  "type": "message:new",
  "data": {
    "id": "msg_123",
    "conversationId": "conv_456",
    "type": "incoming",
    "content": {
      "text": "New message",
      "contentType": "text/plain"
    }
  },
  "timestamp": "2025-01-20T10:30:00Z"
}
```

---

#### `message:status`

Actualización de estado de mensaje.

**Payload**:
```json
{
  "type": "message:status",
  "data": {
    "messageId": "msg_123",
    "status": "delivered",
    "timestamp": "2025-01-20T10:30:10Z",
    "details": "Message delivered successfully"
  },
  "timestamp": "2025-01-20T10:30:10Z"
}
```

---

#### `typing:indicator`

Indicador de escritura.

**Payload**:
```json
{
  "type": "typing:indicator",
  "data": {
    "userId": "user_456",
    "conversationId": "conv_789",
    "isTyping": true,
    "timestamp": "2025-01-20T10:30:00Z"
  },
  "timestamp": "2025-01-20T10:30:00Z"
}
```

---

#### `conversation:read`

Conversación marcada como leída.

**Payload**:
```json
{
  "type": "conversation:read",
  "data": {
    "conversationId": "conv_456",
    "userId": "agent_123",
    "unreadCount": 0,
    "lastReadAt": "2025-01-20T10:30:00Z",
    "timestamp": "2025-01-20T10:30:00Z"
  },
  "timestamp": "2025-01-20T10:30:00Z"
}
```

---

#### `conversation:updated`

Conversación actualizada.

**Payload**:
```json
{
  "type": "conversation:updated",
  "data": {
    "conversationId": "conv_456",
    "updates": {
      "lastMessage": {
        "id": "msg_999",
        "text": "Latest message",
        "type": "incoming",
        "timestamp": "2025-01-20T10:30:00Z"
      },
      "unreadCount": 3,
      "status": "active",
      "assignedTo": {
        "id": "agent_123",
        "name": "John Doe"
      },
      "isPinned": true,
      "updatedAt": "2025-01-20T10:30:00Z"
    },
    "timestamp": "2025-01-20T10:30:00Z"
  },
  "timestamp": "2025-01-20T10:30:00Z"
}
```

---

#### `client_toggle`

Cliente conectado/desconectado.

**Payload**:
```json
{
  "type": "client_toggle",
  "clientId": "whatsapp-sim",
  "connected": true,
  "timestamp": "2025-01-20T10:30:00Z"
}
```

---

#### `extension_toggle`

Extensión activada/desactivada.

**Payload**:
```json
{
  "type": "extension_toggle",
  "extensionId": "echo",
  "active": true,
  "timestamp": "2025-01-20T10:30:00Z"
}
```

---

#### `error`

Error del servidor.

**Payload**:
```json
{
  "type": "error",
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please wait before retrying.",
  "retryAfter": 60,
  "limit": 100,
  "resetAt": "2025-01-20T10:31:00Z",
  "timestamp": "2025-01-20T10:30:00Z"
}
```

**Error Codes**:
- `RATE_LIMIT_EXCEEDED`: Rate limit excedido
- `UNAUTHORIZED`: Token inválido
- `SERVER_ERROR`: Error interno del servidor

---

### Eventos Enviados (al Backend)

#### `typing:indicator`

Enviar indicador de escritura.

**Payload**:
```json
{
  "type": "typing:indicator",
  "data": {
    "conversationId": "conv_456",
    "userId": "agent_123",
    "isTyping": true,
    "timestamp": "2025-01-20T10:30:00Z"
  }
}
```

---

## Error Responses

Todos los endpoints pueden devolver los siguientes errores:

### 400 Bad Request

Request inválido (datos faltantes, formato incorrecto, etc.).

```json
{
  "error": "Invalid request",
  "message": "Email is required",
  "statusCode": 400
}
```

---

### 401 Unauthorized

Token inválido, expirado o faltante.

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "statusCode": 401
}
```

---

### 403 Forbidden

Usuario no tiene permisos suficientes.

```json
{
  "error": "Forbidden",
  "message": "You don't have permission to perform this action",
  "statusCode": 403
}
```

---

### 404 Not Found

Recurso no encontrado.

```json
{
  "error": "Not found",
  "message": "Conversation not found",
  "statusCode": 404
}
```

---

### 409 Conflict

Conflicto (ej: email ya registrado).

```json
{
  "error": "Conflict",
  "message": "Email already exists",
  "statusCode": 409
}
```

---

### 429 Too Many Requests

Rate limit excedido.

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please wait before retrying.",
  "retryAfter": 60,
  "limit": 100,
  "resetAt": "2025-01-20T10:31:00Z",
  "statusCode": 429
}
```

---

### 500 Internal Server Error

Error interno del servidor.

```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred",
  "statusCode": 500
}
```

---

## Rate Limiting

Todos los endpoints administrativos están sujetos a rate limiting:

- **Límite Global**: 100 requests por minuto por IP
- **Límite de Autenticación**: 5 intentos de login por minuto por IP
- **Límite de WebSocket**: 50 mensajes por minuto por conexión

Headers de respuesta:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642758000
```

---

## Versionado

La API usa versionado en la URL:

- **Versión Actual**: Sin prefijo de versión (v1 implícito)
- **Futura**: `/v2/admin/...`

---

## Changelog

### v1.0.0 (2025-01-20)

- ✅ Endpoints de autenticación (login, signup)
- ✅ Sincronización inicial
- ✅ CRUD de conversaciones
- ✅ CRUD de mensajes
- ✅ CRUD de end users
- ✅ CRUD de equipo
- ✅ CRUD de integraciones
- ✅ Menciones
- ✅ Feedback de mensajes
- ✅ Endpoints de simulación
- ✅ WebSocket en tiempo real

---

**Última Actualización**: 2025-01-20
**Versión**: 1.0.0
**Autor**: Equipo INHOST
