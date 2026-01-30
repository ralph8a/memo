/**
 * Sistema de notificaciones con modal
 * Reemplaza el sistema de banner con un modal completo para notificaciones detalladas
 */
import { PaymentAPI } from './paymentIntegration.js';

export class NotificationModal {
    constructor() {
        this.modal = null;
        this.notifications = [];
        this.unreadCount = 0;
        this.paymentApi = null;
        this.init();
    }

    init() {
        this.createModal();
        this.attachEventListeners();
        this.updateBadge();
    }

    createModal() {
        const modalHTML = `
            <div id="notification-modal" class="notification-modal" aria-modal="true" role="dialog">
                <div class="notification-modal-overlay" data-close-modal></div>
                <div class="notification-modal-content">
                    <div class="notification-modal-header">
                        <h2 class="notification-modal-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            Notificaciones
                            <span class="notification-count-badge" data-notification-count></span>
                        </h2>
                        <button class="notification-modal-close" data-close-modal aria-label="Cerrar notificaciones">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                    
                    <div class="notification-modal-filters">
                        <button class="notification-filter active" data-filter="all">
                            Todas <span class="filter-count" data-count="all">0</span>
                        </button>
                        <button class="notification-filter" data-filter="payment">
                            Pagos <span class="filter-count" data-count="payment">0</span>
                        </button>
                        <button class="notification-filter" data-filter="policy">
                            Pólizas <span class="filter-count" data-count="policy">0</span>
                        </button>
                        <button class="notification-filter" data-filter="comment">
                            Comentarios <span class="filter-count" data-count="comment">0</span>
                        </button>
                        <button class="notification-filter" data-filter="system">
                            Sistema <span class="filter-count" data-count="system">0</span>
                        </button>
                    </div>

                    <div class="notification-modal-body" data-notification-list>
                        <!-- Notifications will be injected here -->
                    </div>

                    <div class="notification-modal-footer">
                        <button class="notification-action-btn secondary" onclick="window.notificationModal?.markAllAsRead()">
                            Marcar todas como leídas
                        </button>
                        <button class="notification-action-btn secondary" onclick="window.notificationModal?.clearAll()">
                            Limpiar todas
                        </button>
                    </div>
                </div>
            </div>
        `;

        const container = document.createElement('div');
        container.innerHTML = modalHTML;
        this.modal = container.firstElementChild;
        document.body.appendChild(this.modal);
    }

    attachEventListeners() {
        // Close modal on overlay click or close button
        this.modal.querySelectorAll('[data-close-modal]').forEach(el => {
            el.addEventListener('click', () => this.close());
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });

        // Filter buttons
        this.modal.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveFilter(e.target.dataset.filter);
            });
        });
    }

    open() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.loadNotifications();
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    async loadNotifications() {
        try {
            // Obtener token de autenticación
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                console.warn('No hay token de autenticación');
                this.notifications = [];
                this.renderNotifications();
                return;
            }

            // Llamar a la API de notificaciones
            const response = await fetch(`${window.API_BASE_URL || 'https://ksinsurancee.com'}/backend/index.php?action=notifications`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar notificaciones');
            }

            const data = await response.json();

            if (data.success) {
                this.notifications = data.notifications || [];
                this.unreadCount = this.notifications.filter(n => !n.read).length;
                this.renderNotifications();
                this.updateBadge();
                this.updateFilterCounts();
            } else {
                throw new Error(data.error || 'Error desconocido');
            }

        } catch (error) {
            console.error('Error loading notifications:', error);
            // Mostrar notificaciones vacías en caso de error
            this.notifications = [];
            this.renderNotifications();
        }
    }

    renderNotifications(filter = 'all') {
        const list = this.modal.querySelector('[data-notification-list]');

        const filteredNotifications = filter === 'all' ?
            this.notifications :
            this.notifications.filter(n => n.type === filter);

        if (filteredNotifications.length === 0) {
            list.innerHTML = `
                <div class="notification-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <p>No hay notificaciones</p>
                </div>
            `;
            return;
        }

        list.innerHTML = filteredNotifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'} priority-${notification.priority}" 
                 data-notification-id="${notification.id}">
                <div class="notification-item-icon type-${notification.type}">
                    ${this.getIconForType(notification.type)}
                </div>
                <div class="notification-item-content">
                    <div class="notification-item-header">
                        <h3 class="notification-item-title">${notification.title}</h3>
                        <span class="notification-item-time">${notification.time}</span>
                    </div>
                    <p class="notification-item-message">${notification.message}</p>
                    ${notification.actions && notification.actions.length > 0 ? `
                        <div class="notification-item-actions">
                            ${notification.actions.map(action => `
                                <button class="notification-action-btn" 
                                        onclick="window.notificationModal?.handleAction('${action.action}', ${JSON.stringify(action).replace(/"/g, '&quot;')})">
                                    ${action.label}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                ${!notification.read ? `
                    <button class="notification-mark-read" 
                            onclick="window.notificationModal?.markAsRead('${notification.id}')" 
                            aria-label="Marcar como leída">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </button>
                ` : ''}
            </div>
        `).join('');

        this.updateUnreadCount();
    }

    getIconForType(type) {
        const icons = {
            payment: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>',
            policy: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>',
            comment: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>',
            system: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>'
        };
        return icons[type] || icons.system;
    }

    setActiveFilter(filter) {
        this.modal.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.renderNotifications(filter);
    }

    updateFilterCounts() {
        const counts = {
            all: this.notifications.length,
            payment: this.notifications.filter(n => n.type === 'payment').length,
            policy: this.notifications.filter(n => n.type === 'policy').length,
            comment: this.notifications.filter(n => n.type === 'comment').length,
            system: this.notifications.filter(n => n.type === 'system').length
        };

        Object.keys(counts).forEach(type => {
            const el = this.modal.querySelector(`[data-count="${type}"]`);
            if (el) el.textContent = counts[type];
        });
    }

    updateUnreadCount() {
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        this.updateBadge();
    }

    updateBadge() {
        // Actualizar badge en la campana del header
        document.querySelectorAll('.icon-pill .dot').forEach(dot => {
            if (this.unreadCount > 0) {
                dot.classList.add('active');
                dot.setAttribute('data-count', this.unreadCount);
            } else {
                dot.classList.remove('active');
                dot.removeAttribute('data-count');
            }
        });

        // Actualizar badge en el modal
        const badge = this.modal.querySelector('[data-notification-count]');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.renderNotifications();

            // Si es del sistema de pagos, marcar en backend
            if (notificationId.startsWith('payment-') && this.paymentApi?.markNotificationAsRead) {
                const id = notificationId.replace('payment-', '');
                this.paymentApi.markNotificationAsRead(id);
            }
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.renderNotifications();

        // Marcar todas en backend si es necesario
        if (this.paymentApi?.markAllNotificationsAsRead) {
            this.paymentApi.markAllNotificationsAsRead();
        }
    }

    clearAll() {
        if (confirm('¿Estás seguro de que deseas eliminar todas las notificaciones?')) {
            this.notifications = [];
            this.renderNotifications();
        }
    }

    handleAction(action, data) {
        console.log('Notification action:', action, data);

        switch (action) {
            case 'payment':
                // Abrir modal de pago rápido
                if (window.appHandlers?.makePayment) {
                    window.appHandlers.makePayment(data.policyId);
                }
                break;

            case 'viewPolicy':
                // Ver detalles de póliza
                if (window.appHandlers?.viewPolicy) {
                    window.appHandlers.viewPolicy(data.policyId);
                }
                break;

            case 'viewComments':
                // Abrir sección de comentarios
                if (window.appHandlers?.openComments) {
                    window.appHandlers.openComments(data.policyId);
                }
                break;

            case 'reviewProof':
                // Para agentes: revisar comprobante
                if (window.appHandlers?.reviewPaymentProof) {
                    window.appHandlers.reviewPaymentProof(data.proofId || data.clientId);
                }
                break;

            case 'viewClient':
                // Para agentes: ver detalles de cliente
                if (window.appHandlers?.viewClientDetails) {
                    window.appHandlers.viewClientDetails(data.clientId);
                }
                break;

            case 'reply':
                // Responder comentario
                if (window.appHandlers?.replyToClient) {
                    window.appHandlers.replyToClient(data.clientId);
                }
                break;

            case 'download':
                // Descargar documento
                if (window.appHandlers?.downloadPolicy) {
                    window.appHandlers.downloadPolicy(data.policyId);
                }
                break;

            case 'viewReport':
                // Ver reporte
                if (window.appHandlers?.viewReport) {
                    window.appHandlers.viewReport();
                }
                break;

            default:
                console.warn('Acción no implementada:', action);
        }

        this.close();
    }

    formatTime(timestamp) {
        if (!timestamp) return 'Hace un momento';

        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Hace un momento';
        if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
        if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;

        return time.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
}

// Inicializar el sistema de notificaciones cuando cargue el DOM
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        window.notificationModal = new NotificationModal();

        // Exponer handler global para la campana
        if (!window.appHandlers) window.appHandlers = {};
        window.appHandlers.openNotifications = () => {
            window.notificationModal.open();
        };
    });
}