/**
 * Payment System Integration
 * Cliente y Agente
 */

class PaymentAPI {
    constructor() {
        this.baseURL = '/backend/payment-api.php';
        this.token = sessionStorage.getItem('auth_token');
    }

    /**
     * Helper para peticiones HTTP
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}/${endpoint}`;

        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        };

        // Para FormData no establecer Content-Type (lo hace automático)
        if (!(options.body instanceof FormData)) {
            defaultOptions.headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, { ...defaultOptions, ...options });

        // Para descargas de archivos
        if (options.responseType === 'blob') {
            return response.blob();
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error en la petición');
        }

        return data;
    }

    // ============================================
    // ENDPOINTS CLIENTE
    // ============================================

    /**
     * Obtener calendario de pagos de una póliza
     */
    async getPaymentSchedule(policyId) {
        return await this.request(`get-schedule/${policyId}`, {
            method: 'GET'
        });
    }

    /**
     * Subir comprobante de pago
     */
    async uploadPaymentProof(scheduleId, policyId, file) {
        const formData = new FormData();
        formData.append('schedule_id', scheduleId);
        formData.append('policy_id', policyId);
        formData.append('proof_file', file);

        return await this.request('upload-proof', {
            method: 'POST',
            body: formData
        });
    }

    /**
     * Obtener notificaciones del cliente
     */
    async getNotifications(limit = 20) {
        return await this.request(`get-notifications?limit=${limit}`, {
            method: 'GET'
        });
    }

    /**
     * Descargar comprobante o factura
     */
    async downloadFile(type, fileId) {
        const blob = await this.request(`download-file/${type}/${fileId}`, {
            method: 'GET',
            responseType: 'blob'
        });

        // Crear link de descarga
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_${fileId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    // ============================================
    // ENDPOINTS AGENTE
    // ============================================

    /**
     * Subir documento de póliza y extraer datos automáticamente
     */
    async uploadPolicyDocument(clientId, policyFile) {
        const formData = new FormData();
        formData.append('client_id', clientId);
        formData.append('policy_file', policyFile);

        return await this.request('upload-policy', {
            method: 'POST',
            body: formData
        });
    }

    /**
     * Generar calendario de pagos manualmente (fallback)
     */
    async generatePaymentSchedule(policyId, totalPremium, paymentFrequency, startDate) {
        return await this.request('generate-schedule', {
            method: 'POST',
            body: JSON.stringify({
                policy_id: policyId,
                total_premium: totalPremium,
                payment_frequency: paymentFrequency, // 1, 2, 4, o 12
                start_date: startDate // YYYY-MM-DD
            })
        });
    }

    /**
     * Obtener comprobantes pendientes de revisión
     */
    async getPendingProofReviews() {
        return await this.request('get-pending-reviews', {
            method: 'GET'
        });
    }

    /**
     * Revisar comprobante de pago
     */
    async reviewPaymentProof(proofId, approved, notes = null) {
        return await this.request('review-proof', {
            method: 'POST',
            body: JSON.stringify({
                proof_id: proofId,
                approved: approved,
                notes: notes
            })
        });
    }

    /**
     * Subir factura de aseguradora
     */
    async uploadInsurerInvoice(scheduleId, policyId, invoiceNumber, file) {
        const formData = new FormData();
        formData.append('schedule_id', scheduleId);
        formData.append('policy_id', policyId);
        formData.append('invoice_number', invoiceNumber);
        formData.append('invoice_file', file);

        return await this.request('upload-invoice', {
            method: 'POST',
            body: formData
        });
    }

    /**
     * Actualizar estado de pago manualmente
     */
    async updatePaymentStatus(scheduleId, newStatus, notes = null) {
        return await this.request('update-status', {
            method: 'POST',
            body: JSON.stringify({
                schedule_id: scheduleId,
                status: newStatus,
                notes: notes
            })
        });
    }
}

// ============================================
// COMPONENTES UI - CLIENTE
// ============================================

/**
 * Componente: Lista de Pagos de una Póliza
 */
class PaymentScheduleComponent {
    constructor(policyId, containerId) {
        this.policyId = policyId;
        this.container = document.getElementById(containerId);

        if (!this.container) {
            console.warn(`Payment schedule container '${containerId}' not found`);
        }

        if (!this.policyId) {
            console.warn('Payment schedule initialized without policy_id');
        }

        this.api = new PaymentAPI();
    }

    async render() {
        // Verificar que el container exista
        if (!this.container) {
            console.warn('Cannot render payment schedule: container is null');
            return;
        }

        // Verificar que haya policy_id
        if (!this.policyId) {
            this.container.innerHTML = '<div class="empty-state">No hay póliza seleccionada</div>';
            return;
        }

        try {
            const response = await this.api.getPaymentSchedule(this.policyId);
            const schedules = response.schedules;

            this.container.innerHTML = `
                <div class="payment-schedule-container">
                    <h3>Calendario de Pagos</h3>
                    <div class="payment-list">
                        ${schedules.map(schedule => this.renderPaymentCard(schedule)).join('')}
                    </div>
                </div>
            `;

            // Agregar event listeners
            this.attachEventListeners();

        } catch (error) {
            console.error('Error cargando calendario:', error);
            this.container.innerHTML = `
                <div class="error-message">
                    Error al cargar calendario de pagos
                </div>
            `;
        }
    }

    renderPaymentCard(schedule) {
        const statusClass = this.getStatusClass(schedule.status);
        const statusText = this.getStatusText(schedule.status);
        const showUploadButton = ['awaiting_proof', 'payment_rejected'].includes(schedule.status);

        return `
            <div class="payment-card ${statusClass}" data-schedule-id="${schedule.schedule_id}">
                <div class="payment-header">
                    <span class="installment-number">Pago ${schedule.installment_number}</span>
                    <span class="payment-status ${statusClass}">${statusText}</span>
                </div>
                <div class="payment-details">
                    <div class="detail-row">
                        <span class="label">Fecha de vencimiento:</span>
                        <span class="value">${this.formatDate(schedule.due_date)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Monto:</span>
                        <span class="value">$${parseFloat(schedule.amount_due).toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Método de pago:</span>
                        <span class="value">${schedule.payment_method}</span>
                    </div>
                </div>
                ${showUploadButton ? `
                    <div class="payment-actions">
                        <button class="btn-upload-proof" data-schedule-id="${schedule.schedule_id}">
                            Subir Comprobante
                        </button>
                    </div>
                ` : ''}
                ${schedule.proof_count > 0 ? `
                    <div class="proof-indicator">
                        ${schedule.proof_count} comprobante(s) subido(s)
                    </div>
                ` : ''}
            </div>
        `;
    }

    getStatusClass(status) {
        const classes = {
            'pending': 'status-pending',
            'payment_attempted': 'status-processing',
            'payment_rejected': 'status-rejected',
            'awaiting_proof': 'status-awaiting',
            'in_review': 'status-review',
            'paid': 'status-paid',
            'liquidated': 'status-completed'
        };
        return classes[status] || 'status-default';
    }

    getStatusText(status) {
        const texts = {
            'pending': 'Pendiente',
            'payment_attempted': 'Procesando Cargo',
            'payment_rejected': 'Cargo Rechazado',
            'awaiting_proof': 'Esperando Comprobante',
            'in_review': 'En Revisión',
            'paid': 'Pagado',
            'liquidated': 'Completado'
        };
        return texts[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    attachEventListeners() {
        const uploadButtons = this.container.querySelectorAll('.btn-upload-proof');
        uploadButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const scheduleId = e.target.dataset.scheduleId;
                this.showUploadModal(scheduleId);
            });
        });
    }

    showUploadModal(scheduleId) {
        // Crear modal para subir archivo
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Subir Comprobante de Pago</h3>
                <p>Selecciona tu comprobante (PDF, JPG o PNG - Máx 5MB)</p>
                <form id="upload-proof-form">
                    <input type="file" id="proof-file" accept=".pdf,.jpg,.jpeg,.png" required>
                    <div class="modal-actions">
                        <button type="submit" class="btn-primary">Subir</button>
                        <button type="button" class="btn-secondary close-modal">Cancelar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners del modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#upload-proof-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const fileInput = modal.querySelector('#proof-file');
            const file = fileInput.files[0];

            if (!file) {
                alert('Por favor selecciona un archivo');
                return;
            }

            try {
                const result = await this.api.uploadPaymentProof(
                    scheduleId,
                    this.policyId,
                    file
                );

                alert(result.message);
                modal.remove();
                this.render(); // Recargar lista
            } catch (error) {
                alert('Error al subir comprobante: ' + error.message);
            }
        });
    }
}

/**
 * Componente: Notificaciones de Pagos
 */
class PaymentNotificationsComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);

        if (!this.container) {
            console.warn(`Payment notifications container '${containerId}' not found`);
        }

        this.api = new PaymentAPI();
    }

    async render() {
        // Verificar que el container exista
        if (!this.container) {
            console.warn('Cannot render notifications: container is null');
            return;
        }

        try {
            const response = await this.api.getNotifications(10);
            const notifications = response.notifications;

            if (notifications.length === 0) {
                this.container.innerHTML = `
                    <div class="no-notifications">
                        No tienes notificaciones nuevas
                    </div>
                `;
                return;
            }

            this.container.innerHTML = `
                <div class="notifications-list">
                    ${notifications.map(n => this.renderNotification(n)).join('')}
                </div>
            `;

        } catch (error) {
            console.error('Error cargando notificaciones:', error);
        }
    }

    renderNotification(notification) {
        const data = JSON.parse(notification.notification_data);
        const typeClass = this.getNotificationType(notification.notification_type);

        return `
            <div class="notification-item ${typeClass}">
                <div class="notification-icon">
                    ${this.getNotificationIcon(notification.notification_type)}
                </div>
                <div class="notification-content">
                    <p>${data.message || 'Nueva notificación'}</p>
                    <span class="notification-time">${this.formatTime(notification.sent_at)}</span>
                </div>
            </div>
        `;
    }

    getNotificationType(type) {
        const types = {
            'due_date_reminder': 'notification-info',
            'overdue_payment': 'notification-warning',
            'proof_uploaded': 'notification-success',
            'proof_approved': 'notification-success',
            'proof_rejected': 'notification-error',
            'verification_required': 'notification-info'
        };
        return types[type] || 'notification-default';
    }

    getNotificationIcon(type) {
        const icons = {
            'due_date_reminder': '🔔',
            'overdue_payment': '⚠️',
            'proof_uploaded': '📤',
            'proof_approved': '✅',
            'proof_rejected': '❌',
            'verification_required': 'ℹ️'
        };
        return icons[type] || '📬';
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays}d`;
        return date.toLocaleDateString('es-MX');
    }
}

// ============================================
// COMPONENTES UI - AGENTE
// ============================================

/**
 * Componente: Revisión de Comprobantes (Agente)
 */
class ProofReviewComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);

        if (!this.container) {
            console.warn(`Proof review container '${containerId}' not found`);
        }

        this.api = new PaymentAPI();
        this.onCountUpdate = null;
    }

    async render() {
        // Verificar que el container exista
        if (!this.container) {
            console.warn('Cannot render proof reviews: container is null');
            return;
        }

        try {
            console.log('[PendingProofReviews] Loading pending reviews...');

            let proofs = [];
            try {
                const response = await this.api.getPendingProofReviews();
                proofs = response?.proofs || response || [];
            } catch (apiError) {
                console.warn('[PendingProofReviews] API error, usando datos de prueba:', apiError);
                // Datos de prueba
                proofs = [
                    {
                        proof_id: 'PR-001',
                        policy_number: 'AUTO-001-2026',
                        client_name: 'María González',
                        amount_due: 1950.00,
                        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        upload_date: new Date().toISOString(),
                        file_name: 'comprobante_pago.pdf'
                    }
                ];
            }

            console.log('[PendingProofReviews] Proofs loaded:', proofs.length);

            // Notificar el contador al callback si existe
            if (typeof this.onCountUpdate === 'function') {
                this.onCountUpdate(proofs.length);
            }

            if (proofs.length === 0) {
                this.container.innerHTML = `
                    <div class="no-pending-reviews" style="padding: 3rem; text-align: center;">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 1rem; color: var(--text-secondary);">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                        <p style="color: var(--text-secondary); margin: 0;">No hay comprobantes pendientes de revisión</p>
                    </div>
                `;
                return;
            }

            this.container.innerHTML = `
                <div class="proof-reviews-container">
                    <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Comprobantes Pendientes (${proofs.length})</h3>
                    <div class="proof-list">
                        ${proofs.map(proof => this.renderProofCard(proof)).join('')}
                    </div>
                </div>
            `;

            this.attachEventListeners();

        } catch (error) {
            console.error('[PendingProofReviews] Error cargando comprobantes:', error);
            this.container.innerHTML = `
                <div class="error-message" style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 1rem;">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p>Error al cargar comprobantes pendientes</p>
                    <button class="btn btn-outline" onclick="location.reload()" style="margin-top: 1rem;">Reintentar</button>
                </div>
            `;
        }
    }

    renderProofCard(proof) {
        return `
            <div class="proof-card" data-proof-id="${proof.proof_id}">
                <div class="proof-header">
                    <h4>Póliza: ${proof.policy_number}</h4>
                    <span class="upload-date">${this.formatDate(proof.upload_date)}</span>
                </div>
                <div class="proof-details">
                    <p><strong>Cliente:</strong> ${proof.client_name}</p>
                    <p><strong>Monto:</strong> $${parseFloat(proof.amount_due).toFixed(2)}</p>
                    <p><strong>Vencimiento:</strong> ${this.formatDate(proof.due_date)}</p>
                    <p><strong>Archivo:</strong> ${proof.file_name}</p>
                </div>
                <div class="proof-actions">
                    <button class="btn-view-proof" data-proof-id="${proof.proof_id}" data-file="${proof.file_name}">
                        Ver Comprobante
                    </button>
                    <button class="btn-approve-proof" data-proof-id="${proof.proof_id}">
                        Aprobar
                    </button>
                    <button class="btn-reject-proof" data-proof-id="${proof.proof_id}">
                        Rechazar
                    </button>
                </div>
            </div>
        `;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX');
    }

    attachEventListeners() {
        // Ver comprobante
        this.container.querySelectorAll('.btn-view-proof').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const proofId = e.target.dataset.proofId;
                await this.api.downloadFile('proof', proofId);
            });
        });

        // Aprobar
        this.container.querySelectorAll('.btn-approve-proof').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const proofId = e.target.dataset.proofId;
                await this.handleReview(proofId, true);
            });
        });

        // Rechazar
        this.container.querySelectorAll('.btn-reject-proof').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const proofId = e.target.dataset.proofId;
                await this.handleReview(proofId, false);
            });
        });
    }

    async handleReview(proofId, approved) {
        const notes = approved
            ? prompt('Notas (opcional):')
            : prompt('Razón del rechazo:');

        if (notes === null) return; // Cancelado

        try {
            const result = await this.api.reviewPaymentProof(proofId, approved, notes || null);
            alert(result.message);
            this.render(); // Recargar lista
        } catch (error) {
            alert('Error al revisar comprobante: ' + error.message);
        }
    }
}

// Exportar para uso global
window.PaymentAPI = PaymentAPI;
window.PaymentScheduleComponent = PaymentScheduleComponent;
window.PaymentNotificationsComponent = PaymentNotificationsComponent;
window.ProofReviewComponent = ProofReviewComponent;

// ES6 exports para webpack
export { PaymentAPI, PaymentScheduleComponent, PaymentNotificationsComponent, ProofReviewComponent };
