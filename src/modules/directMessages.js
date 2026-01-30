/**
 * Direct Messages Component
 * Sistema de mensajería temporal (42 horas)
 * Solo agentes pueden iniciar, clientes solo responder
 */

class DirectMessagesComponent {
    constructor() {
        this.threads = [];
        this.currentThread = null;
        this.unreadCount = 0;
        this.pollInterval = null;
        this.userType = null;
    }

    /**
     * Inicializar componente
     */
    async init() {
        try {
            const token = localStorage.getItem('jwt_token');
            if (!token) return;

            const payload = JSON.parse(atob(token.split('.')[1]));
            this.userType = payload.user_type;

            await this.loadUnreadCount();
            this.updateBadge();

            // Poll cada 30 segundos
            this.startPolling();

        } catch (error) {
            console.error('Error inicializando Direct Messages:', error);
        }
    }

    /**
     * Obtener contador de mensajes no leídos
     */
    async loadUnreadCount() {
        try {
            const { apiService } = await import('../api-integration.js');
            const data = await apiService.request('?action=dm_unread_count', {
                method: 'GET'
            });

            if (data.success) {
                this.unreadCount = data.unread_count;
                this.updateBadge();
            }
        } catch (error) {
            console.error('Error cargando contador:', error);
        }
    }

    /**
     * Actualizar badge en el header
     */
    updateBadge() {
        const badge = document.querySelector('[data-dm-badge]');
        if (!badge) return;

        if (this.unreadCount > 0) {
            badge.textContent = this.unreadCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }

    /**
     * Abrir modal de Direct Messages
     */
    async openModal() {
        await this.loadThreads();
        this.renderModal();
    }

    /**
     * Cargar threads del usuario
     */
    async loadThreads() {
        try {
            const { apiService } = await import('../api-integration.js');
            const data = await apiService.request('?action=dm_my_threads', {
                method: 'GET'
            });

            if (data.success) {
                this.threads = data.threads;
                this.unreadCount = data.total_unread;
                this.updateBadge();
            }
        } catch (error) {
            console.error('Error cargando threads:', error);
        }
    }

    /**
     * Renderizar modal
     */
    renderModal() {
        const existingModal = document.getElementById('dm-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'dm-modal';
        modal.className = 'app-modal-overlay dm-modal-overlay active';
        modal.innerHTML = `
            <div class="app-modal app-modal-lg dm-modal-container" onclick="event.stopPropagation()">
                <div class="app-modal-header">
                    <h2>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Direct Messages
                    </h2>
                    <button class="app-modal-close" onclick="window.directMessages.closeModal()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="app-modal-body dm-modal-body">
                    <div class="dm-content">
                        <div class="dm-threads-list">
                            ${this.renderThreadsList()}
                        </div>
                        <div class="dm-messages-area" id="dm-messages-area">
                            <div class="dm-empty-state">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <p>Selecciona una conversación</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Cerrar modal al hacer clic en el overlay (fuera del contenido)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        document.body.appendChild(modal);
    }

    /**
     * Renderizar lista de threads
     */
    renderThreadsList() {
        if (this.threads.length === 0) {
            return `
                <div class="dm-empty-list">
                    <p>No tienes mensajes directos</p>
                    ${this.userType === 'agent' ? '<button class="btn-primary" onclick="window.contactModal.open()">Iniciar conversación</button>' : ''}
                </div>
            `;
        }

        return this.threads.map(thread => `
            <div class="dm-thread-item ${thread.unread_count > 0 ? 'unread' : ''}" onclick="window.directMessages.openThread(&quot;${thread.thread_id}&quot;)">
                <div class="dm-thread-avatar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                </div>
                <div class="dm-thread-info">
                    <div class="dm-thread-header">
                        <strong>${this.userType === 'agent' ? thread.client_name : thread.agent_name}</strong>
                        <span class="dm-thread-time">${this.formatTime(thread.last_message_at)}</span>
                    </div>
                    <div class="dm-thread-preview">${thread.last_message || thread.subject}</div>
                    <div class="dm-thread-footer">
                        <span class="dm-expires">Expira en ${this.formatTimeLeft(thread.expires_at)}</span>
                        ${thread.unread_count > 0 ? `<span class="dm-unread-badge">${thread.unread_count}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Abrir thread específico
     */
    async openThread(threadId) {
        try {
            const { apiService } = await import('../api-integration.js');
            const data = await apiService.request(`?action=dm_messages&thread_id=${threadId}`, {
                method: 'GET'
            });

            if (data.success) {
                this.currentThread = {
                    ...data.thread,
                    thread_id: threadId,
                    messages: data.messages
                };
                this.renderMessages();
                await this.loadUnreadCount();
            }
        } catch (error) {
            console.error('Error cargando mensajes:', error);
        }
    }

    /**
     * Renderizar mensajes del thread
     */
    renderMessages() {
        const container = document.getElementById('dm-messages-area');
        if (!container || !this.currentThread) return;

        const token = localStorage.getItem('jwt_token');
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentUserId = payload.user_id;

        container.innerHTML = `
            <div class="dm-messages-header">
                <button class="btn-back" onclick="window.directMessages.renderModal()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="19" y1="12" x2="5" y2="12"/>
                        <polyline points="12 19 5 12 12 5"/>
                    </svg>
                </button>
                <div>
                    <strong>${this.userType === 'agent' ? 'Cliente' : 'Agente'}</strong>
                    <small>Expira en ${this.formatTimeLeft(this.currentThread.expires_at)}</small>
                </div>
            </div>
            <div class="dm-messages-list" id="dm-messages-list">
                ${this.currentThread.messages.map(msg => `
                    <div class="dm-message ${msg.sender_id == currentUserId ? 'sent' : 'received'}">
                        <div class="dm-message-content">
                            <div class="dm-message-header">
                                <strong>${msg.sender_name}</strong>
                                <span class="dm-message-time">${this.formatTime(msg.created_at)}</span>
                            </div>
                            <p>${this.escapeHtml(msg.message_text)}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="dm-message-input">
                <textarea id="dm-input" placeholder="Escribe un mensaje..." rows="2"></textarea>
                <button class="btn-send" onclick="window.directMessages.sendMessage()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                </button>
            </div>
        `;

        // Scroll al último mensaje
        setTimeout(() => {
            const messagesList = document.getElementById('dm-messages-list');
            if (messagesList) {
                messagesList.scrollTop = messagesList.scrollHeight;
            }
        }, 100);
    }

    /**
     * Enviar mensaje
     */
    async sendMessage() {
        const input = document.getElementById('dm-input');
        if (!input || !input.value.trim()) return;

        const messageText = input.value.trim();
        input.value = '';

        try {
            // Dynamically import apiService
            const { apiService } = await import('../api-integration.js');

            const data = await apiService.request('?action=dm_send_message', {
                method: 'POST',
                body: {
                    thread_id: this.currentThread.thread_id,
                    message: messageText
                }
            });

            if (data.success) {
                await this.openThread(this.currentThread.thread_id);
            } else {
                alert(data.error || 'Error enviando mensaje');
                input.value = messageText;
            }
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            alert('Error enviando mensaje: ' + (error.message || 'Unknown error'));
            input.value = messageText;
        }
    }

    /**
     * Cerrar modal
     */
    closeModal() {
        const modal = document.getElementById('dm-modal');
        if (modal) modal.remove();
    }

    /**
     * Iniciar polling
     */
    startPolling() {
        this.pollInterval = setInterval(() => {
            this.loadUnreadCount();
        }, 30000); // 30 segundos
    }

    /**
     * Detener polling
     */
    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    /**
     * Formatear tiempo relativo
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        return `${days}d`;
    }

    /**
     * Formatear tiempo restante
     */
    formatTimeLeft(expiresAt) {
        if (!expiresAt) return 'Sin límite';
        const expires = new Date(expiresAt);
        if (isNaN(expires.getTime())) return 'Sin límite';

        const now = new Date();
        const diff = expires - now;

        if (diff <= 0) return 'Expirado';

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }

    /**
     * Escapar HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Instancia global
window.directMessages = new DirectMessagesComponent();

// Export for manual initialization after login
export function initDirectMessages() {
    if (localStorage.getItem('jwt_token') && window.directMessages) {
        window.directMessages.init();
    }
}

// Auto-inicializar si ya está logueado al cargar página
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (localStorage.getItem('jwt_token')) {
            initDirectMessages();
        }
    });
}
