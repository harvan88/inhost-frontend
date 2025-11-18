# Flujo Bidireccional Completo - Chat INHOST

## 📊 ESTADO ACTUAL vs DESEADO

### Escenario: Usuario A envía mensaje "Hola" a Usuario B

---

## 🟢 LADO EMISOR (Usuario A)

### ✅ ACTUAL (Implementado)
```
1. Usuario A escribe "Hola"
2. Usuario A presiona Enter
3. MessageInput.handleSubmit()
   → apiClient.sendClientMessage({ clientId, text: "Hola" })
   → POST /simulate/client-message
4. Backend responde (broadcast via WebSocket)
5. handleMessageReceived()
   → db.addMessage() → Persist
   → store.addMessage() → UI actualiza
6. Usuario A ve "Hola" en MessageList
```

### ❌ FALTA (No implementado)
```
1. Usuario A escribe "H"
   → ❌ NO envía typing indicator

2. Usuario A escribe "Ho"
   → ❌ NO envía typing indicator

3. Usuario A escribe "Hol"
   → ❌ NO envía typing indicator

4. Usuario A escribe "Hola"
   → ❌ NO envía typing indicator

5. Usuario A para de escribir (3 segundos sin teclear)
   → ❌ NO envía stop typing

6. Usuario A presiona Enter
   → ❌ NO se agrega mensaje localmente (optimistic)
   → ❌ Usuario NO ve su mensaje inmediatamente
   → ✅ Envía al backend
   → ❌ Mensaje local NO tiene estado "sending"
   → ❌ Mensaje local NO actualiza a "sent" cuando backend responde

7. Backend procesa mensaje
   → ❌ NO recibe actualización "entregado"
   → ❌ NO recibe actualización "visto"
   → ❌ UI NO muestra checkmarks (✓ ✓✓)
```

---

## 🔵 LADO RECEPTOR (Usuario B)

### ✅ ACTUAL (Implementado)
```
1. Backend broadcast: message_received
2. handleMessageReceived()
   → db.addMessage() → Persist ✅
   → Verifica conversación → Crea si no existe ✅
   → Verifica contacto → Crea si no existe ✅
   → store.addMessage() → UI actualiza ✅
3. Usuario B ve "Hola" en MessageList ✅
```

### ❌ FALTA (No implementado)
```
1. Usuario B recibe mensaje
   → ❌ NO muestra que Usuario A "está escribiendo..." antes del mensaje

2. Usuario B ve el mensaje
   → ❌ NO envía confirmación "entregado" al backend
   → ❌ Usuario A NO ve checkmark gris ✓

3. Usuario B lee el mensaje (abre conversación)
   → ❌ NO envía confirmación "visto" al backend
   → ❌ Usuario A NO ve checkmarks azules ✓✓

4. Usuario B escribe respuesta "Hola!"
   → ❌ NO envía typing indicator
   → ❌ Usuario A NO ve "Usuario B está escribiendo..."

5. Usuario B para de escribir
   → ❌ NO envía stop typing
   → ❌ Usuario A NO deja de ver "está escribiendo..."

6. Usuario B envía "Hola!"
   → ❌ Mismo problema que Usuario A (falta optimistic update, estados)
```

---

## 🎯 IMPLEMENTACIÓN NECESARIA

### 1️⃣ TYPING INDICATOR

**Archivo**: `MessageInput.tsx`

**Lógica**:
```typescript
// Estado
const [isTyping, setIsTyping] = useState(false);
const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

// Enviar typing indicator
const sendTyping = useCallback((typing: boolean) => {
  // TODO: Implementar WebSocket send
  ws.send(JSON.stringify({
    type: 'typing',
    conversationId,
    isTyping: typing
  }));
}, [conversationId]);

// Detectar cuando escribe
const handleChange = (e) => {
  const value = e.target.value;
  setText(value);

  // Empezó a escribir
  if (!isTyping && value.length > 0) {
    setIsTyping(true);
    sendTyping(true);
  }

  // Reset timeout (si sigue escribiendo)
  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }

  // Si para de escribir por 3 segundos → stop typing
  typingTimeoutRef.current = setTimeout(() => {
    setIsTyping(false);
    sendTyping(false);
  }, 3000);
};

// Limpiar al desmontar
useEffect(() => {
  return () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTyping) {
      sendTyping(false);
    }
  };
}, [isTyping, sendTyping]);
```

---

### 2️⃣ OPTIMISTIC UPDATE

**Archivo**: `MessageInput.tsx`

**Lógica**:
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();

  // 1. Crear mensaje local con estado "pending"
  const tempId = `temp-${Date.now()}`;
  const tempMessage: MessageEnvelope = {
    id: tempId,  // ID temporal
    conversationId: conversation.id,
    type: 'outgoing',
    channel: conversation.channel,
    content: {
      text: trimmed,
      contentType: 'text/plain'
    },
    metadata: {
      from: 'system',
      to: conversation.entityId,
      timestamp: new Date().toISOString()
    },
    statusChain: [
      {
        status: 'sending',  // Estado inicial
        timestamp: new Date().toISOString(),
        messageId: tempId
      }
    ],
    context: {
      plan: 'free',
      timestamp: new Date().toISOString()
    }
  };

  // 2. Agregar al store inmediatamente (optimistic)
  addMessage(conversationId, tempMessage);

  // 3. Limpiar input
  setText('');

  // 4. Enviar al backend
  try {
    const response = await apiClient.sendClientMessage({
      clientId: conversation.channel,
      text: trimmed
    });

    // 5. Reemplazar mensaje temporal con mensaje real del backend
    // (esto lo hará el WebSocket cuando llegue message_received)
    // Solo necesitamos eliminar el mensaje temporal
    // store.removeMessage(conversationId, tempId);

  } catch (error) {
    // 6. Marcar mensaje como failed
    updateMessageStatus(conversationId, tempId, 'failed');
  }
};
```

---

### 3️⃣ ACTUALIZACIÓN DE ESTADOS

**Archivo**: `WebSocketProvider.tsx`

**handleMessageStatus**:
```typescript
const handleMessageStatus = useCallback((event: MessageStatusEvent) => {
  console.log('📊 Message:status:', event.data);

  const { messageId, status, timestamp } = event.data;

  // 1. Obtener mensaje del store
  const { entities } = useStore.getState();

  // Buscar mensaje en todas las conversaciones
  for (const [convId, messages] of entities.messages.entries()) {
    const messageIndex = messages.findIndex(m => m.id === messageId);

    if (messageIndex !== -1) {
      const message = messages[messageIndex];

      // 2. Actualizar statusChain
      const updatedMessage = {
        ...message,
        statusChain: [
          ...message.statusChain,
          {
            status,
            timestamp,
            messageId
          }
        ]
      };

      // 3. Actualizar en IndexedDB
      await db.addMessage(updatedMessage);

      // 4. Actualizar en store
      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = updatedMessage;
      useStore.getState().actions.setMessages(convId, updatedMessages);

      break;
    }
  }
}, []);
```

---

### 4️⃣ VISUALIZACIÓN DE ESTADOS

**Archivo**: `MessageList.tsx` (MessageBubble)

**Agregar iconos de estado**:
```typescript
const MessageBubble = memo(({ message }: { message: MessageEnvelope }) => {
  const isOutgoing = message.type === 'outgoing';

  // Obtener último estado del statusChain
  const latestStatus = message.statusChain[message.statusChain.length - 1];

  const getStatusIcon = () => {
    if (!isOutgoing) return null;

    switch (latestStatus?.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-neutral-400" />; // Reloj
      case 'sent':
        return <Check className="w-3 h-3 text-neutral-400" />; // ✓ gris
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-neutral-400" />; // ✓✓ gris
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />; // ✓✓ azul
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />; // ⚠️ rojo
      default:
        return null;
    }
  };

  return (
    <div className="message-bubble">
      <p>{message.content.text}</p>

      {/* Footer con estado */}
      <div className="flex items-center gap-2">
        <span className="text-xs">{formatTime(message.metadata.timestamp)}</span>
        {getStatusIcon()}
      </div>
    </div>
  );
});
```

---

### 5️⃣ TYPING INDICATOR UI

**Archivo**: `MessageList.tsx`

**Agregar indicador "está escribiendo..."**:
```typescript
export default function MessageList({ conversationId }: MessageListProps) {
  const messages = useMessages(conversationId);
  const typingUsers = useStore(s => s.ui.typingUsers?.[conversationId] || []);

  return (
    <div>
      {/* Mensajes */}
      {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          <span>{typingUsers[0]} está escribiendo</span>
          <span className="dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      )}
    </div>
  );
}
```

---

## 📊 RESUMEN DE TAREAS

- [ ] 1. Typing Indicator en MessageInput (onChange + timeout)
- [ ] 2. Enviar typing via WebSocket (agregar método al WebSocketProvider)
- [ ] 3. Optimistic Update (agregar mensaje local con estado "sending")
- [ ] 4. handleMessageStatus (actualizar statusChain en store + IndexedDB)
- [ ] 5. Visualización de estados en MessageBubble (iconos Check, CheckCheck, Clock)
- [ ] 6. Typing Indicator UI en MessageList
- [ ] 7. Agregar typingUsers al store (ui.typingUsers)
- [ ] 8. handleTypingIndicator (actualizar ui.typingUsers en store)

---

## 🎯 ORDEN DE IMPLEMENTACIÓN

1. **WebSocketProvider**: Agregar método `sendTyping()`
2. **Store**: Agregar `ui.typingUsers` y acciones
3. **WebSocketProvider**: Implementar `handleTypingIndicator()`
4. **MessageInput**: Implementar typing detection + optimistic update
5. **WebSocketProvider**: Implementar `handleMessageStatus()` completo
6. **MessageList**: Agregar typing indicator UI
7. **MessageBubble**: Agregar visualización de estados

---

## ✅ FLUJO FINAL ESPERADO

### Usuario A envía "Hola" a Usuario B

```
[Usuario A escribe "H"]
  → MessageInput detecta onChange
    → Envía typing=true via WebSocket
      → Usuario B ve "Usuario A está escribiendo..."

[Usuario A escribe "Hola"]
  → (Sigue enviando typing=true cada cambio)

[Usuario A para de escribir (3s)]
  → Timeout dispara
    → Envía typing=false via WebSocket
      → Usuario B deja de ver "está escribiendo..."

[Usuario A presiona Enter]
  → Crea mensaje local con estado "sending"
    → Agrega a store (optimistic)
      → Usuario A ve su mensaje inmediatamente con ⏱️
        → Envía al backend
          → Backend responde → WebSocket: message_received
            → Reemplaza mensaje temporal con mensaje real
              → statusChain: ["sent"]
                → Usuario A ve ✓

[Backend procesa y entrega]
  → WebSocket: message:status { status: "delivered" }
    → handleMessageStatus()
      → Actualiza statusChain en IndexedDB + Store
        → Usuario A ve ✓✓ (gris)

[Usuario B lee el mensaje]
  → Frontend de Usuario B detecta conversación activa
    → Envía confirmación "read" al backend
      → WebSocket broadcast: message:status { status: "read" }
        → handleMessageStatus()
          → Actualiza statusChain
            → Usuario A ve ✓✓ (azul)
```

---

**Estado**: Pendiente de implementación
**Prioridad**: Alta
**Archivos a modificar**: 8 archivos
