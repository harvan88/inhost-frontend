class ChatSimulator {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Conversaciones
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.conversation-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.simulateTyping();
            });
        });

        // Envío de mensajes
        document.querySelector('.send-button').addEventListener('click', () => this.sendMessage());
        document.querySelector('.message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Modal actions
        document.getElementById('save-theme-btn').addEventListener('click', () => this.saveTheme());
        document.getElementById('cancel-theme-btn').addEventListener('click', () => this.closeThemeEditor());
    }

    sendMessage() {
        const input = document.querySelector('.message-input');
        const text = input.value.trim();
        
        if (!text) return;

        const messageList = document.querySelector('.message-list');
        const message = this.createMessage('outgoing', text);
        messageList.appendChild(message);
        
        input.value = '';
        this.scrollToBottom();
        
        // Simular respuesta
        setTimeout(() => this.simulateReply(), 1000);
    }

    createMessage(type, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const now = new Date();
        const time = now.getHours().toString().padStart(2, '0') + ':' + 
                     now.getMinutes().toString().padStart(2, '0');
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${text}</div>
                <div class="message-time">${time}</div>
                ${type === 'outgoing' ? '<div class="message-status">✓✓</div>' : ''}
            </div>
        `;
        
        return messageDiv;
    }

    simulateReply() {
        const replies = [
            "Entendido, gracias por la información",
            "¿Podrías enviarme más detalles?",
            "Perfecto, procedo con el pedido",
            "¿Hay algo más en lo que pueda ayudarte?"
        ];
        
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const messageList = document.querySelector('.message-list');
        const message = this.createMessage('incoming', randomReply);
        
        messageList.appendChild(message);
        this.scrollToBottom();
    }

    simulateTyping() {
        const messageList = document.querySelector('.message-list');
        let typingIndicator = messageList.querySelector('.typing-indicator');
        
        if (!typingIndicator) {
            typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator';
            typingIndicator.innerHTML = `
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span>Juan está escribiendo...</span>
            `;
            messageList.appendChild(typingIndicator);
            this.scrollToBottom();
        }

        // Remover después de 3 segundos
        setTimeout(() => {
            if (typingIndicator && typingIndicator.parentNode) {
                typingIndicator.remove();
            }
        }, 3000);
    }

    scrollToBottom() {
        const messageList = document.querySelector('.message-list');
        messageList.scrollTop = messageList.scrollHeight;
    }

    saveTheme() {
        // Aquí iría la lógica para guardar el tema en themes.json
        alert('Tema guardado (en una implementación real, esto guardaría en el archivo JSON)');
        this.closeThemeEditor();
    }

    closeThemeEditor() {
        document.getElementById('theme-editor').classList.add('hidden');
        // Re-aplicar el tema original para quitar preview
        window.themeManager.applyTheme(window.themeManager.currentTheme);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ChatSimulator();
});