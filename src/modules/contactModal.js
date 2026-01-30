/**
 * Contact Modal Component
 * Modal para que agentes contacten clientes
 * Muestra 3 recientes + resto alfabético
 */
import { apiService, API_CONFIG } from '../api-integration.js';

class ContactModalComponent {
    constructor() {
        this.clients = [];
        this.recentClients = [];
    }

    /**
     * Abrir modal de contacto
     */
    async open() {
        await this.loadClients();
        this.render();
    }

    /**
     * Cargar clientes
     */
    async loadClients() {
        try {
            // Use centralized apiService so Authorization header is handled consistently
            const data = await apiService.get(API_CONFIG.ENDPOINTS.AGENT_CLIENTS);
            const clients = Array.isArray(data) ? data : (data?.clients || []);

            this.clients = clients || [];

            // Obtener 3 más recientes
            this.recentClients = [...this.clients]
                .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                .slice(0, 3);

            // Ordenar resto alfabéticamente
            this.clients.sort((a, b) => {
                const nameA = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
                const nameB = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
                return nameA.localeCompare(nameB);
            });
        } catch (error) {
            console.error('Error cargando clientes:', error);
            this.clients = [];
            this.recentClients = [];
        }
    }

    /**
     * Renderizar modal
     */
    render() {
        const existingModal = document.getElementById('contact-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'contact-modal';
        // use unified modal classes so styles/themes apply consistently
        modal.className = 'app-modal-overlay active';
        modal.innerHTML = `
            <div class="app-modal app-modal-md contact-modal-container">
                <div class="app-modal-header">
                    <h2>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        ¿A quién quieres contactar?
                    </h2>
                    <button class="app-modal-close" onclick="window.contactModal.close()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="app-modal-body">
                    <div class="contact-search-box">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="7" />
                            <line x1="16.65" y1="16.65" x2="21" y2="21" />
                        </svg>
                        <input 
                            type="text" 
                            id="contact-search" 
                            placeholder="Buscar cliente..." 
                            oninput="window.contactModal.filterClients(this.value)"
                        />
                    </div>

                    ${this.recentClients.length > 0 ? `
                        <div class="contact-section">
                            <h4 class="contact-section-title">Recientes</h4>
                            <div class="contact-list">
                                ${this.recentClients.map(client => this.renderClientItem(client)).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="contact-section">
                        <h4 class="contact-section-title">Todos los clientes</h4>
                        <div class="contact-list" id="all-clients-list">
                            ${this.clients.map(client => this.renderClientItem(client)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Renderizar item de cliente
     */
    renderClientItem(client) {
        const first = client.first_name || '';
        const last = client.last_name || '';
        const fullName = `${first} ${last}`.trim();
        const initials = `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();

        // Escape single quotes to safely interpolate into onclick handlers
        const safeName = fullName.replace(/'/g, "\\'");
        const safeEmail = (client.email || '').replace(/'/g, "\\'");
        const safePhone = (client.phone || '').replace(/'/g, "\\'");
        const dataName = fullName.toLowerCase().replace(/"/g, '&quot;');

        return `
            <div class="contact-item" data-client-id="${client.id}" data-client-name="${dataName}">
                <div class="contact-avatar">${initials}</div>
                <div class="contact-info">
                    <strong>${fullName}</strong>
                    <small>${client.email || ''}</small>
                </div>
                <div class="contact-actions">
                    <button 
                        class="btn-action" 
                        title="Ver información"
                        onclick="window.contactModal.showClientInfo(${client.id}, '${safeName}', '${safeEmail}', '${safePhone}')"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                    </button>
                    <button 
                        class="btn-action btn-message" 
                        title="Enviar mensaje directo"
                        onclick="window.contactModal.startDirectMessage(${client.id}, '${safeName}')"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Filtrar clientes
     */
    filterClients(searchTerm) {
        const term = searchTerm.toLowerCase();
        const items = document.querySelectorAll('.contact-item');

        items.forEach(item => {
            const name = item.dataset.clientName;
            if (name.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    /**
     * Mostrar información del cliente
     */
    showClientInfo(clientId, name, email, phone) {
        const infoHtml = `
            <div class="client-info-popup">
                <h4>${name}</h4>
                <div class="info-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <a href="mailto:${email}">${email}</a>
                </div>
                ${phone ? `
                    <div class="info-row">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        <a href="tel:${phone}">${phone}</a>
                    </div>
                ` : ''}
                <button class="btn-primary" onclick="window.contactModal.startDirectMessage(${clientId}, '${name}')">
                    Enviar mensaje directo
                </button>
            </div>
        `;

        // Mostrar popup temporal
        const popup = document.createElement('div');
        popup.className = 'info-popup-overlay';
        popup.innerHTML = `<div class="info-popup">${infoHtml}</div>`;
        popup.onclick = (e) => {
            if (e.target === popup) popup.remove();
        };
        document.body.appendChild(popup);

        setTimeout(() => popup.classList.add('active'), 10);
    }

    /**
     * Iniciar mensaje directo
     */
    startDirectMessage(clientId, clientName) {
        this.close();

        // Crear mini-modal para escribir mensaje (unified modal classes)
        const messageModal = document.createElement('div');
        messageModal.className = 'app-modal-overlay active';
        messageModal.innerHTML = `
            <div class="app-modal app-modal-md" style="max-width: 500px;">
                <div class="app-modal-header">
                    <h3>Mensaje directo a ${clientName}</h3>
                    <button class="app-modal-close" onclick="this.closest('.app-modal-overlay').remove()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="app-modal-body">
                    <div class="form-group">
                        <label>Mensaje (expira en 42 horas)</label>
                        <textarea id="dm-text" rows="4" placeholder="Escribe tu mensaje..."></textarea>
                    </div>
                    <div class="alert alert-info">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                        Este mensaje será visible durante 42 horas. El cliente puede responder durante ese tiempo.
                    </div>
                </div>
                <div class="app-modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.app-modal-overlay').remove()">Cancelar</button>
                    <button class="btn-primary" onclick="window.contactModal.sendDirectMessage(${clientId}, '${clientName}')">
                        Enviar mensaje
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(messageModal);
    }

    /**
     * Enviar mensaje directo
     */
    async sendDirectMessage(clientId, clientName) {
        const textarea = document.getElementById('dm-text');
        if (!textarea || !textarea.value.trim()) {
            alert('Por favor escribe un mensaje');
            return;
        }

        const messageText = textarea.value.trim();

        try {
            // Dynamically import apiService
            const { apiService } = await import('../api-integration.js');

            const data = await apiService.request('?action=dm_start_thread', {
                method: 'POST',
                body: {
                    client_id: clientId,
                    subject: `Mensaje de tu agente`,
                    message: messageText
                }
            });

            if (data.success) {
                // Remove both legacy and unified modal overlays just in case
                document.querySelectorAll('.modal-overlay, .app-modal-overlay').forEach(m => m.remove());

                if (window.showNotification) {
                    window.showNotification(`Mensaje enviado a ${clientName}`, 'success');
                } else {
                    alert(`Mensaje enviado a ${clientName}`);
                }

                // Actualizar contador
                if (window.directMessages) {
                    window.directMessages.loadUnreadCount();
                }
            } else {
                alert(data.error || 'Error enviando mensaje');
            }
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            alert('Error enviando mensaje: ' + (error.message || 'Unknown error'));
        }
    }

    /**
     * Cerrar modal
     */
    close() {
        const modal = document.getElementById('contact-modal');
        if (modal) modal.remove();

        const popup = document.querySelector('.info-popup-overlay');
        if (popup) popup.remove();
    }
}

// Instancia global
window.contactModal = new ContactModalComponent();
