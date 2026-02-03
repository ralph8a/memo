/**
 * Agent Dashboard Components
 * Componentes específicos para el portal del agente
 */

import { apiService, API_CONFIG } from '../api-integration.js';

/**
 * Panel de Calendario de Pagos del Agente
 * Muestra todos los pagos de sus clientes con filtros
 */
export class AgentPaymentSchedulePanel {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.filteredClientId = options.clientId || null;
        this.viewMode = options.viewMode || 'all'; // 'all', 'pending', 'overdue'
    }

    async render() {
        if (!this.container) {
            console.warn('Agent payment schedule container not found');
            return;
        }

        try {
            // Obtener clientes completos con sus pólizas desde agent_clients
            const clients = await apiService.request('?action=agent_clients', {
                method: 'GET'
            });

            // Transformar datos de clientes a estructura de pagos
            // Cada póliza activa genera un "pago pendiente" ficticio
            let payments = [];
            clients.forEach(client => {
                if (client.policies && client.policies.length > 0) {
                    client.policies.forEach(policy => {
                        if (policy.status === 'active') {
                            // Calcular próxima fecha de pago basado en renewal_date
                            const renewalDate = policy.renewal_date ? new Date(policy.renewal_date) : null;
                            const nextPaymentDate = renewalDate || new Date();
                            
                            payments.push({
                                id: `payment_${policy.id}`,
                                client_id: client.id,
                                client_name: client.name,
                                client_email: client.email,
                                policy_id: policy.id,
                                policy_number: policy.policy_number,
                                policy_type: policy.policy_type,
                                amount: parseFloat(policy.premium_amount || 0),
                                due_date: nextPaymentDate.toISOString().split('T')[0],
                                status: this.calculatePaymentStatus(nextPaymentDate),
                                proof_id: null
                            });
                        }
                    });
                }
            });

            // Guardar datos completos en JSON para reutilización
            window.agentClientsData = {
                clients: clients,
                payments: payments,
                lastUpdated: new Date().toISOString()
            };
            console.log('💾 Agent clients data stored:', window.agentClientsData);

            // Filtrar por cliente si está especificado
            if (this.filteredClientId) {
                payments = payments.filter(p => p.client_id === this.filteredClientId);
            }

            // Filtrar por modo de vista
            if (this.viewMode === 'pending') {
                payments = payments.filter(p => p.status === 'pending');
            } else if (this.viewMode === 'overdue') {
                payments = payments.filter(p => p.status === 'overdue');
            }

            // Renderizar solo el contenido interno (tabla o empty state)
            this.container.innerHTML = `
                ${payments.length > 0 ? `
                    <div class="payment-table-wrapper">
                        <div class="payment-filters" style="margin-bottom: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
                            <button class="filter-btn ${this.viewMode === 'all' ? 'active' : ''}" 
                                    onclick="window.agentDashboard?.setPaymentView('all')">
                                Todos (${payments.length})
                            </button>
                            <button class="filter-btn ${this.viewMode === 'pending' ? 'active' : ''}" 
                                    onclick="window.agentDashboard?.setPaymentView('pending')">
                                Pendientes (${payments.filter(p => p.status === 'pending').length})
                            </button>
                            <button class="filter-btn ${this.viewMode === 'overdue' ? 'active' : ''}" 
                                    onclick="window.agentDashboard?.setPaymentView('overdue')">
                                Vencidos (${payments.filter(p => p.status === 'overdue').length})
                            </button>
                        </div>
                        <div class="modern-table">
                            <table class="payments-table">
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Póliza</th>
                                        <th>Monto</th>
                                        <th>Vence</th>
                                        <th>Estado</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${payments.map(p => this.renderPaymentRow(p)).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : `
                    <div class="empty-state" style="text-align: center; padding: 3rem 1rem;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin: 0 auto 1rem; opacity: 0.5;">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                        <p style="margin: 0; color: var(--text-muted);">No hay pagos ${this.viewMode !== 'all' ? (this.viewMode === 'pending' ? 'pendientes' : 'vencidos') : ''}</p>
                    </div>
                `}
            `;

        } catch (error) {
            console.error('Error rendering agent payments:', error);
            this.container.innerHTML = `
                <div class="error-state">
                    <p>Error al cargar pagos: ${error.message}</p>
                </div>
            `;
        }
    }

    renderPaymentRow(payment) {
        const statusClass = this.getStatusClass(payment.status);
        const daysUntilDue = Math.ceil((new Date(payment.due_date) - new Date()) / (1000 * 60 * 60 * 24));
        const urgencyClass = daysUntilDue < 0 ? 'urgent' : daysUntilDue <= 3 ? 'warning' : '';

        const shortName = payment.client_name?.split(' ').slice(0, 2).join(' ') || 'N/A';

        return `
            <tr class="${urgencyClass}">
                <td>
                    <div class="client-info">
                        <strong>${shortName}</strong>
                    </div>
                </td>
                <td><span class="policy-num">${payment.policy_number}</span></td>
                <td class="amount">$${parseFloat(payment.amount).toFixed(2)}</td>
                <td>
                    <div class="due-date ${urgencyClass}">
                        ${this.formatShortDate(payment.due_date)}
                        ${daysUntilDue < 0 ? `<small class="text-danger">-${Math.abs(daysUntilDue)}d</small>` :
                daysUntilDue <= 3 ? `<small class="text-warning">${daysUntilDue}d</small>` : ''}
                    </div>
                </td>
                <td><span class="status-badge ${statusClass}">${this.getStatusText(payment.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        ${payment.proof_id ? `
                            <button class="btn-icon" title="Revisar comprobante"
                                    onclick="window.agentDashboard.paymentSchedule?.reviewReceipt('${payment.proof_id}', '${payment.id}')">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <path d="M16 13l-4 4-2-2"/>
                                </svg>
                            </button>
                        ` : ''}
                        <button class="btn-icon" title="Ver Póliza"
                                onclick="window.openPolicyModal?.('${payment.policy_id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <path d="M9 15h6"/>
                                <path d="M9 11h6"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    calculatePaymentStatus(dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'overdue';
        if (diffDays <= 7) return 'pending';
        return 'upcoming';
    }

    getStatusClass(status) {
        const classes = {
            'paid': 'success',
            'pending': 'warning',
            'overdue': 'danger',
            'upcoming': 'info',
            'cancelled': 'neutral'
        };
        return classes[status] || 'neutral';
    }

    getStatusText(status) {
        const texts = {
            'paid': 'Pagado',
            'pending': 'Pendiente',
            'overdue': 'Vencido',
            'upcoming': 'Próximo',
            'cancelled': 'Cancelado'
        };
        return texts[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    formatShortDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }

    reviewReceipt(proofId, paymentId) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>Revisar Comprobante de Pago</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="receipt-preview">
                        <div class="receipt-image-placeholder" style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 8px; margin-bottom: 1rem;">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto; color: #666;">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>
                            <p style="margin-top: 1rem; color: #666;">Comprobante ID: ${proofId}</p>
                        </div>
                        <div class="receipt-details" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div class="detail-group">
                                <label>ID de Pago</label>
                                <p>${paymentId}</p>
                            </div>
                            <div class="detail-group">
                                <label>Estado Actual</label>
                                <p><span class="badge badge-warning">Pendiente de Revisión</span></p>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="receipt-notes">Notas de Revisión (Opcional)</label>
                        <textarea id="receipt-notes" rows="3" placeholder="Agrega comentarios sobre este comprobante..."></textarea>
                    </div>
                </div>
                <div class="modal-footer" style="display: flex; gap: 12px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid #e5e5e5;">
                    <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button class="btn btn-danger" onclick="window.agentDashboard.paymentSchedule?.rejectReceipt('${proofId}', '${paymentId}')">
                        Rechazar
                    </button>
                    <button class="btn btn-success" onclick="window.agentDashboard.paymentSchedule?.approveReceipt('${proofId}', '${paymentId}')">
                        Aprobar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    approveReceipt(proofId, paymentId) {
        const notes = document.getElementById('receipt-notes')?.value || '';
        console.log('Approving receipt:', proofId, paymentId, notes);
        showNotification('Comprobante aprobado exitosamente', NOTIFICATION_TYPES.SUCCESS);
        document.querySelector('.modal-overlay')?.remove();
        this.loadPaymentSchedule();
    }

    rejectReceipt(proofId, paymentId) {
        const notes = document.getElementById('receipt-notes')?.value || '';
        console.log('Rejecting receipt:', proofId, paymentId, notes);
        showNotification('Comprobante rechazado', NOTIFICATION_TYPES.INFO);
        document.querySelector('.modal-overlay')?.remove();
        this.loadPaymentSchedule();
    }
}

/**
 * Panel de Pólizas del Agente
 * Lista todas las pólizas de sus clientes
 */
export class AgentPoliciesPanel {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.filteredClientId = options.clientId || null;
        this.viewMode = options.viewMode || 'all'; // 'all', 'active', 'expiring'
    }

    async render() {
        if (!this.container) {
            console.warn('Agent policies container not found');
            return;
        }

        try {
            // Usar apiService para obtener datos del dashboard del agente
            const { apiService } = await import('../api-integration.js');
            const dashboardData = await apiService.request('?action=agent_dashboard', {
                method: 'GET'
            });

            let policies = dashboardData.clients?.flatMap(c => c.policies || []) || [];

            // Filtrar por cliente si está especificado
            if (this.filteredClientId) {
                policies = policies.filter(p => p.client_id === this.filteredClientId);
            }

            // Filtrar por modo de vista
            if (this.viewMode === 'active') {
                policies = policies.filter(p => p.status === 'active');
            } else if (this.viewMode === 'expiring') {
                const now = new Date();
                const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
                policies = policies.filter(p => {
                    const renewalDate = new Date(p.renewal_date);
                    return renewalDate <= thirtyDaysFromNow && renewalDate > now;
                });
            }

            // Renderizar solo el contenido interno (tabla o empty state)
            this.container.innerHTML = `
                ${policies.length > 0 ? `
                    <div class="policies-table-wrapper">
                        <div class="policy-filters" style="margin-bottom: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
                            <button class="filter-btn ${this.viewMode === 'all' ? 'active' : ''}" 
                                    onclick="window.agentDashboard?.setPoliciesView('all')">
                                Todas (${policies.length})
                            </button>
                            <button class="filter-btn ${this.viewMode === 'active' ? 'active' : ''}" 
                                    onclick="window.agentDashboard?.setPoliciesView('active')">
                                Activas (${policies.filter(p => p.status === 'active').length})
                            </button>
                            <button class="filter-btn ${this.viewMode === 'expiring' ? 'active' : ''}" 
                                    onclick="window.agentDashboard?.setPoliciesView('expiring')">
                                Por vencer (${this.getExpiringCount(policies)})
                            </button>
                        </div>
                        <div class="modern-table">
                            <table class="policies-table">
                                <thead>
                                    <tr>
                                        <th>Póliza</th>
                                        <th>Tipo</th>
                                        <th>Cliente</th>
                                        <th>Prima</th>
                                        <th>Renovación</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${policies.map(p => this.renderPolicyRow(p)).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : `
                    <div class="empty-state" style="text-align: center; padding: 3rem 1rem;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin: 0 auto 1rem; opacity: 0.5;">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <p style="margin: 0; color: var(--text-muted);">No hay pólizas</p>
                    </div>
                `}
            `;

        } catch (error) {
            console.error('Error rendering agent policies:', error);
            this.container.innerHTML = `
                <div class="error-state">
                    <p>Error al cargar pólizas: ${error.message}</p>
                </div>
            `;
        }
    }

    renderPolicyRow(policy) {
        const statusClass = policy.status === 'active' ? 'success' : policy.status === 'expired' ? 'danger' : 'neutral';
        const daysUntilRenewal = Math.ceil((new Date(policy.renewal_date) - new Date()) / (1000 * 60 * 60 * 24));

        return `
            <tr>
                <td><strong>${policy.policy_number}</strong></td>
                <td>${this.getPolicyTypeLabel(policy.policy_type)}</td>
                <td>${policy.client_name || 'N/A'}</td>
                <td>$${parseFloat(policy.premium_amount || 0).toFixed(2)}</td>
                <td>
                    ${this.formatDate(policy.renewal_date)}
                    ${daysUntilRenewal <= 30 && daysUntilRenewal > 0 ? `<br><small class="text-warning">${daysUntilRenewal} días</small>` : ''}
                </td>
                <td><span class="status-badge ${statusClass}">${policy.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" title="Ver detalles" 
                                onclick="window.openPolicyModal?.('${policy.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    renderPolicyCard(policy) {
        const statusClass = policy.status === 'active' ? 'success' : policy.status === 'expired' ? 'danger' : 'neutral';
        const daysUntilRenewal = Math.ceil((new Date(policy.renewal_date) - new Date()) / (1000 * 60 * 60 * 24));

        return `
            <div class="policy-card ${statusClass}">
                <div class="policy-header">
                    <span class="policy-type">${this.getPolicyTypeLabel(policy.policy_type)}</span>
                    <span class="policy-status ${statusClass}">${policy.status}</span>
                </div>
                <div class="policy-body">
                    <h4>${policy.policy_number}</h4>
                    <p class="client-name">${policy.client_name || 'Cliente N/A'}</p>
                    <div class="policy-details">
                        <div class="detail-item">
                            <span class="label">Prima:</span>
                            <span class="value">$${parseFloat(policy.premium_amount).toFixed(2)}/mes</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Cobertura:</span>
                            <span class="value">$${parseFloat(policy.coverage_amount).toLocaleString()}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Renovación:</span>
                            <span class="value ${daysUntilRenewal <= 30 ? 'warning' : ''}">
                                ${this.formatDate(policy.renewal_date)}
                                ${daysUntilRenewal <= 30 && daysUntilRenewal > 0 ? ` (${daysUntilRenewal} días)` : ''}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="policy-footer">
                    <button class="btn btn-sm btn-outline" 
                            onclick="window.appHandlers?.viewPolicy?.('${policy.id}')">
                        Ver detalles
                    </button>
                    <button class="btn btn-sm btn-primary" 
                            onclick="window.appHandlers?.viewClientDetails?.('${policy.client_id}')">
                        Ver cliente
                    </button>
                </div>
            </div>
        `;
    }

    getPolicyTypeLabel(type) {
        const labels = {
            'auto': '🚗 Auto',
            'home': '🏠 Hogar',
            'life': '❤️ Vida',
            'health': '🏥 Salud',
            'business': '💼 Negocio'
        };
        return labels[type] || type;
    }

    getExpiringCount(policies) {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
        return policies.filter(p => {
            const renewalDate = new Date(p.renewal_date);
            return renewalDate <= thirtyDaysFromNow && renewalDate > now;
        }).length;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    }
}

/**
 * Dashboard Manager para Agente
 * Coordina todos los paneles y filtros
 */
export class AgentDashboardManager {
    constructor() {
        this.filteredClientId = null;
        this.paymentPanel = null;
        this.policiesPanel = null;
        this.paymentViewMode = 'all';
        this.policiesViewMode = 'all';
    }

    async initialize() {
        // Inicializar paneles
        this.paymentPanel = new AgentPaymentSchedulePanel('agent-payments-container', {
            clientId: this.filteredClientId,
            viewMode: this.paymentViewMode
        });

        this.policiesPanel = new AgentPoliciesPanel('agent-policies-container', {
            clientId: this.filteredClientId,
            viewMode: this.policiesViewMode
        });

        await this.render();
    }

    async render() {
        if (this.paymentPanel) {
            await this.paymentPanel.render();
        }
        if (this.policiesPanel) {
            await this.policiesPanel.render();
        }
    }

    setClientFilter(clientId) {
        this.filteredClientId = clientId;

        // Actualizar paneles con nuevo filtro
        if (this.paymentPanel) {
            this.paymentPanel.filteredClientId = clientId;
        }
        if (this.policiesPanel) {
            this.policiesPanel.filteredClientId = clientId;
        }

        this.render();

        // Actualizar UI del filtro
        this.updateFilterUI(clientId);
    }

    clearClientFilter() {
        this.setClientFilter(null);
    }

    setPaymentView(viewMode) {
        this.paymentViewMode = viewMode;
        if (this.paymentPanel) {
            this.paymentPanel.viewMode = viewMode;
            this.paymentPanel.render();
        }
    }

    setPoliciesView(viewMode) {
        this.policiesViewMode = viewMode;
        if (this.policiesPanel) {
            this.policiesPanel.viewMode = viewMode;
            this.policiesPanel.render();
        }
    }

    updateFilterUI(clientId) {
        const filterPanel = document.getElementById('client-filter-panel');
        const filterClientName = document.querySelector('[data-filter-client-name]');

        if (filterPanel) {
            if (clientId) {
                // Mostrar panel
                filterPanel.style.display = 'block';

                // Buscar nombre del cliente en los datos cargados
                if (filterClientName && window.dashboardData?.clients) {
                    const client = window.dashboardData.clients.find(c => c.id == clientId);
                    if (client) {
                        filterClientName.textContent = client.name;
                    } else {
                        filterClientName.textContent = `Cliente ID: ${clientId}`;
                    }
                }
            } else {
                // Ocultar panel
                filterPanel.style.display = 'none';
            }
        }
    }

    reviewProof(proofId) {
        // Implementar lógica de revisión de comprobante
        console.log('Reviewing proof:', proofId);
        // Abrir modal de revisión
        if (window.appHandlers?.reviewPaymentProof) {
            window.appHandlers.reviewPaymentProof(proofId);
        }
    }

    contactClient(clientId) {
        // Implementar lógica de contacto
        console.log('Contacting client:', clientId);
        // Abrir modal de contacto o email
        if (window.appHandlers?.contactClient) {
            window.appHandlers.contactClient(clientId);
        }
    }
}

// Inicializar cuando el DOM esté listo
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        // Solo inicializar si estamos en el dashboard de agente
        if (document.getElementById('agent-payments-container') ||
            document.getElementById('agent-policies-container')) {
            window.agentDashboard = new AgentDashboardManager();
            window.agentDashboard.initialize();
        }
    });
}
