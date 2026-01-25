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
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token');
            }

            // Obtener pagos de todos los clientes del agente
            const response = await fetch(`${window.API_BASE_URL || ''}/backend/payment-api.php/agent-payments`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error loading payments');
            }

            const data = await response.json();
            let payments = data.payments || [];

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

            this.container.innerHTML = `
                <div class="agent-payment-panel">
                    <div class="panel-header">
                        <h3>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                            Calendario de Pagos ${this.filteredClientId ? '- Cliente Filtrado' : ''}
                        </h3>
                        <div class="panel-filters">
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
                    </div>
                    <div class="panel-body">
                        ${payments.length > 0 ? `
                            <div class="payment-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Cliente</th>
                                            <th>Póliza</th>
                                            <th>Monto</th>
                                            <th>Vencimiento</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${payments.map(p => this.renderPaymentRow(p)).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <div class="empty-state">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                                    <rect x="2" y="5" width="20" height="14" rx="2" />
                                    <line x1="2" y1="10" x2="22" y2="10" />
                                </svg>
                                <p>No hay pagos ${this.viewMode !== 'all' ? this.viewMode === 'pending' ? 'pendientes' : 'vencidos' : ''}</p>
                            </div>
                        `}
                    </div>
                </div>
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

        return `
            <tr class="${urgencyClass}">
                <td>
                    <div class="client-info">
                        <strong>${payment.client_name}</strong>
                        <small>${payment.client_email}</small>
                    </div>
                </td>
                <td>${payment.policy_number}</td>
                <td class="amount">$${parseFloat(payment.amount).toFixed(2)}</td>
                <td>
                    <div class="due-date ${urgencyClass}">
                        ${this.formatDate(payment.due_date)}
                        ${daysUntilDue < 0 ? `<span class="overdue-badge">${Math.abs(daysUntilDue)} días atrasado</span>` :
                daysUntilDue <= 3 ? `<span class="warning-badge">Vence en ${daysUntilDue} días</span>` : ''}
                    </div>
                </td>
                <td><span class="status-badge ${statusClass}">${this.getStatusText(payment.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" title="Ver detalles" 
                                onclick="window.appHandlers?.viewClientDetails?.('${payment.client_id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                        ${payment.proof_id ? `
                            <button class="btn-icon" title="Revisar comprobante"
                                    onclick="window.agentDashboard?.reviewProof('${payment.proof_id}')">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                </svg>
                            </button>
                        ` : ''}
                        <button class="btn-icon" title="Contactar cliente"
                                onclick="window.agentDashboard?.contactClient('${payment.client_id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    getStatusClass(status) {
        const classes = {
            'paid': 'success',
            'pending': 'warning',
            'overdue': 'danger',
            'cancelled': 'neutral'
        };
        return classes[status] || 'neutral';
    }

    getStatusText(status) {
        const texts = {
            'paid': 'Pagado',
            'pending': 'Pendiente',
            'overdue': 'Vencido',
            'cancelled': 'Cancelado'
        };
        return texts[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
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
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token');
            }

            const url = this.filteredClientId
                ? `${window.API_BASE_URL || ''}/backend/api-endpoints.php/policies?client_id=${this.filteredClientId}`
                : `${window.API_BASE_URL || ''}/backend/api-endpoints.php/agent-policies`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error loading policies');
            }

            const data = await response.json();
            let policies = data.policies || [];

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

            this.container.innerHTML = `
                <div class="agent-policies-panel">
                    <div class="panel-header">
                        <h3>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            Pólizas ${this.filteredClientId ? '- Cliente Filtrado' : ''}
                        </h3>
                        <div class="panel-filters">
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
                    </div>
                    <div class="panel-body">
                        ${policies.length > 0 ? `
                            <div class="policies-grid">
                                ${policies.map(p => this.renderPolicyCard(p)).join('')}
                            </div>
                        ` : `
                            <div class="empty-state">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                </svg>
                                <p>No hay pólizas</p>
                            </div>
                        `}
                    </div>
                </div>
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
        const filterIndicator = document.getElementById('client-filter-indicator');
        if (filterIndicator) {
            if (clientId) {
                filterIndicator.textContent = `Filtrando por cliente: ${clientId}`;
                filterIndicator.style.display = 'block';
            } else {
                filterIndicator.style.display = 'none';
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

// Exports
export { AgentPaymentSchedulePanel, AgentPoliciesPanel, AgentDashboardManager };
