// Dashboard Data Loaders - Backend Integration
import {
    apiService,
    API_CONFIG,
    getClientDashboardData,
    getClientPayments,
    getClientPolicies,
    getClientClaims,
    getClientDocuments,
    getAgentDashboardData,
    getAgentClients,
    getAgentStats,
    getAdminDashboardData,
    getAdminStats,
    getAdminActivity
} from '../api-integration.js';
import { showNotification } from './notifications.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Update user name in dashboard hero header
 * Gets user data from localStorage and updates the UI
 */
export function updateUserNameInHeader() {
    try {
        const userStr = localStorage.getItem('krauser_user');
        if (!userStr) return;

        const user = JSON.parse(userStr);
        const emailPart = user.email ? user.email.split('@')[0] : 'Usuario';
        const userName = user.full_name || user.name || emailPart;

        // Update all possible hero header selectors
        const selectors = [
            '[data-hero-user]',
            '[data-user-name]',
            '[data-agent-name]',
            '[data-admin-name]'
        ];

        selectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = userName;
            }
        });

        console.log('✅ User name updated in header:', userName);
    } catch (error) {
        console.error('Error updating user name in header:', error);
    }
}

// ============================================
// AGENT DASHBOARD LOADERS
// ============================================

export async function loadAgentDashboard() {
    console.log('🔄 loadAgentDashboard() called');
    try {
        // Update user name in header first
        updateUserNameInHeader();

        console.log('📡 Requesting agent dashboard data from API...');
        // Load dashboard data from backend
        const dashboardData = await apiService.request(
            API_CONFIG.ENDPOINTS.AGENT_DASHBOARD,
            { method: 'GET' },
            {
                cacheDuration: apiService.cache.CACHE_DURATION.SHORT,
                useCache: true
            }
        );

        console.log('📊 Agent dashboard data received:', dashboardData);

        // Update UI with real data
        if (dashboardData.stats) {
            console.log('Updating agent stats...');
            updateAgentStats(dashboardData.stats);
        }
        if (dashboardData.clients) {
            console.log('Rendering agent clients...');
            renderAgentClients(dashboardData.clients);
        }
        if (dashboardData.claims) {
            console.log('Rendering agent claims...');
            renderAgentClaims(dashboardData.claims);
        }

        // Load recent clients in sidebar
        console.log('🔄 Loading recent clients for sidebar...');
        await loadAgentRecentClients().catch(err => console.error('❌ Error loading recent clients:', err));

        // Initialize Agent Dashboard Manager for payment/policy panels
        console.log('🔄 Initializing Agent Dashboard Manager...');
        try {
            const { AgentDashboardManager } = await import('./agentDashboardComponents.js');
            if (!window.agentDashboard) {
                window.agentDashboard = new AgentDashboardManager();
                await window.agentDashboard.initialize();
                console.log('✅ Agent Dashboard Manager initialized');
            }
        } catch (err) {
            console.error('❌ Error initializing Agent Dashboard Manager:', err);
        }

        // Load dynamic chart data for agent dashboard
        loadPolicyHealthStats().catch(err => console.error('Error loading policy health:', err));
        loadPaymentTrends().catch(err => console.error('Error loading payment trends:', err));

        console.log('✅ Agent dashboard loaded with real data');
        return dashboardData;
    } catch (error) {
        console.error('❌ Error loading agent dashboard:', error);
        showNotification('Error al cargar datos del dashboard', NOTIFICATION_TYPES.ERROR);
        throw error;
    }
}
export async function loadAgentClients() {
    try {
        const clients = await apiService.request(
            API_CONFIG.ENDPOINTS.AGENT_CLIENTS,
            { method: 'GET' },
            {
                cacheDuration: apiService.cache.CACHE_DURATION.SHORT,
                useCache: true
            }
        );
        return clients;
    } catch (error) {
        console.error('Error loading clients:', error);
        return [];
    }
}

export async function loadClientDetails(clientId) {
    try {
        const data = await apiService.request(
            API_CONFIG.ENDPOINTS.GET_CLIENT_DETAILS,
            {
                method: 'GET',
                params: { id: clientId }
            }
        );
        return data;
    } catch (error) {
        console.error('Error loading client details:', error);
        showNotification('Error al cargar detalles del cliente', NOTIFICATION_TYPES.ERROR);
        return null;
    }
}

export async function loadQuotes() {
    try {
        const quotes = await apiService.request(
            API_CONFIG.ENDPOINTS.GET_QUOTES,
            { method: 'GET' },
            {
                cacheDuration: apiService.cache.CACHE_DURATION.SHORT,
                useCache: true
            }
        );
        return quotes;
    } catch (error) {
        console.error('Error loading quotes:', error);
        return [];
    }
}

// ============================================
// CLIENT DASHBOARD LOADERS
// ============================================

export async function loadClientDashboard() {
    console.log('🔄 loadClientDashboard() called');
    try {
        // Update user name in header first
        updateUserNameInHeader();

        console.log('📡 Requesting client dashboard data from API...');
        // Load dashboard data from backend
        const dashboardData = await apiService.request(
            API_CONFIG.ENDPOINTS.CLIENT_DASHBOARD,
            { method: 'GET' },
            {
                cacheDuration: apiService.cache.CACHE_DURATION.SHORT,
                useCache: true
            }
        );

        console.log('📊 Client dashboard data received:', dashboardData);

        // Load additional data in parallel
        console.log('📡 Loading policies, claims, and payments...');
        const [policies, claims, payments] = await Promise.all([
            loadClientPolicies(),
            loadClientClaims(),
            loadPaymentHistory()
        ]);

        console.log('📊 Data loaded - Policies:', policies?.length, 'Claims:', claims?.length, 'Payments:', payments?.length);

        // Update stats from dashboard data
        if (dashboardData.stats) {
            console.log('Updating client stats...');
            updateClientStats(dashboardData.stats);
        }

        // Render lists
        if (policies) {
            console.log('Rendering policies...');
            renderClientPolicies(policies);
        }
        if (claims) {
            console.log('Rendering claims...');
            renderClientClaims(claims);
        }
        if (payments) {
            console.log('Rendering payment history...');
            renderPaymentHistory(payments);
        }

        // Load client contacts from backend
        loadClientContacts().catch(err => console.error('Error loading contacts:', err));

        // Initialize payment calendar
        console.log('🔄 Initializing payment calendar...');
        if (typeof window.initPaymentCalendar === 'function') {
            window.initPaymentCalendar();
        } else {
            // Dynamic import if not available
            import('./paymentCalendar.js').then(({ initPaymentCalendar }) => {
                if (initPaymentCalendar) initPaymentCalendar();
            }).catch(e => console.error('Failed to load payment calendar:', e));
        }

        // Load dynamic chart data
        loadPolicyHealthStats().catch(err => console.error('Error loading policy health:', err));
        loadPaymentTrends().catch(err => console.error('Error loading payment trends:', err));
        loadPendingActions().catch(err => console.error('Error loading pending actions:', err));

        console.log('✅ Client dashboard loaded with real data');
        return { dashboardData, policies, claims, payments };
    } catch (error) {
        console.error('❌ Error loading client dashboard:', error);
        showNotification('Error al cargar datos del dashboard', NOTIFICATION_TYPES.ERROR);
        throw error;
    }
}

export async function loadClientPolicies() {
    try {
        const policies = await apiService.request(
            API_CONFIG.ENDPOINTS.CLIENT_POLICIES,
            { method: 'GET' },
            {
                cacheDuration: apiService.cache.CACHE_DURATION.MEDIUM,
                useCache: true
            }
        );
        return policies;
    } catch (error) {
        console.error('Error loading policies:', error);
        return [];
    }
}

export async function loadPaymentHistory() {
    try {
        const payments = await apiService.request(
            API_CONFIG.ENDPOINTS.CLIENT_PAYMENTS,
            { method: 'GET' },
            {
                cacheDuration: apiService.cache.CACHE_DURATION.MEDIUM,
                useCache: true
            }
        );
        return payments;
    } catch (error) {
        console.error('Error loading payment history:', error);
        return [];
    }
}

// ============================================
// ADMIN DASHBOARD LOADERS
// ============================================

export async function loadAdminDashboard() {
    try {
        // Update user name in header first
        updateUserNameInHeader();

        // Load admin dashboard data from backend
        const dashboardData = await apiService.request(
            API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD,
            { method: 'GET' },
            {
                cacheDuration: apiService.cache.CACHE_DURATION.SHORT,
                useCache: true
            }
        );

        // Update UI with real data
        if (dashboardData.stats) updateAdminStats(dashboardData.stats);
        if (dashboardData.activity) renderAdminActivity(dashboardData.activity);

        console.log('✅ Admin dashboard loaded with real data');
        return dashboardData;
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        showNotification('Error al cargar dashboard de administración', NOTIFICATION_TYPES.ERROR);
    }
}

// ============================================
// SHARED LOADERS
// ============================================

export async function loadClientClaims() {
    try {
        const claims = await apiService.request(
            API_CONFIG.ENDPOINTS.CLIENT_CLAIMS,
            { method: 'GET' },
            {
                cacheDuration: apiService.cache.CACHE_DURATION.SHORT,
                useCache: true
            }
        );
        return claims;
    } catch (error) {
        console.error('Error loading claims:', error);
        return [];
    }
}

export async function loadDashboardStats() {
    try {
        const stats = await apiService.request(
            API_CONFIG.ENDPOINTS.GET_DASHBOARD_STATS,
            { method: 'GET' },
            {
                cacheDuration: apiService.cache.CACHE_DURATION.SHORT,
                useCache: true
            }
        );
        return stats;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        return null;
    }
}

// ============================================
// RENDERERS - AGENT
// ============================================

function renderAgentClients(clients) {
    const container = document.querySelector('[data-clients-list]');
    if (!container || !clients || clients.length === 0) return;

    const html = clients.map(client => {
        const isAssigned = client.is_assigned || client.assigned_policies > 0;
        const assignedBadge = isAssigned
            ? '<span class="badge badge-primary" style="margin-left: 8px;">Asignado</span>'
            : '';
        const policyCount = client.policy_count || 0;
        const policyInfo = policyCount > 0
            ? `<span>${policyCount} póliza${policyCount !== 1 ? 's' : ''}</span>`
            : '<span class="text-muted">Sin pólizas</span>';

        return `
        <div class="client-item ${isAssigned ? 'client-assigned' : ''}" data-client-id="${client.id}">
          <div class="client-info">
            <h4>
              ${client.first_name} ${client.last_name}
              ${assignedBadge}
            </h4>
            <p>${client.email}</p>
            <div class="client-meta">
              <span class="badge badge-${client.status === 'active' ? 'success' : 'warning'}">
                ${client.status}
              </span>
              ${policyInfo}
              <span>Desde: ${new Date(client.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div class="client-actions">
            <button class="btn btn-sm btn-outline" onclick="window.appHandlers.viewClientDetails('${client.id}')">
              Ver Detalles
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
}

function renderAgentClaims(claims) {
    const container = document.querySelector('[data-agent-claims-list]');
    if (!container || !claims || claims.length === 0) return;

    const html = claims.slice(0, 5).map(claim => `
    <div class="claim-item" data-claim-id="${claim.id}">
      <div class="claim-info">
        <h4>Claim #${claim.claim_number}</h4>
        <p>${claim.description || 'Sin descripción'}</p>
        <div class="claim-meta">
          <span class="badge badge-${getClaimStatusColor(claim.status)}">
            ${getClaimStatusLabel(claim.status)}
          </span>
          <span>$${parseFloat(claim.claim_amount).toFixed(2)}</span>
        </div>
      </div>
    </div>
  `).join('');

    container.innerHTML = html;
}

function updateAgentStats(stats) {
    if (!stats) return;

    // Update stat cards
    const statsMap = {
        'stat-clients': stats.total_clients || 0,
        'stat-policies': stats.active_policies || 0,
        'stat-claims': stats.pending_claims || 0,
        'stat-quotes': stats.new_quotes || 0
    };

    Object.entries(statsMap).forEach(([key, value]) => {
        const element = document.querySelector(`[data-${key}]`);
        if (element) {
            element.textContent = value;
        }
    });
}

// ============================================
// RENDERERS - CLIENT
// ============================================

function updateClientStats(stats) {
    if (!stats) return;

    // Update stat cards with real data from backend
    const statsSelectors = {
        '[data-stat-policies]': stats.active_policies || 0,
        '[data-stat-claims]': stats.pending_claims || 0,
        '[data-stat-payments]': stats.payment_status || 'current',
        '[data-next-payment]': stats.next_payment_date ? new Date(stats.next_payment_date).toLocaleDateString() : 'N/A',
        '[data-total-monthly]': stats.total_monthly ? `$${parseFloat(stats.total_monthly).toFixed(2)}` : '$0.00'
    };

    Object.entries(statsSelectors).forEach(([selector, value]) => {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value;
        }
    });

    console.log('✅ Client stats updated:', stats);
}

function renderClientPolicies(policies) {
    const container = document.querySelector('.policies-list');
    if (!container) return;

    if (!policies || policies.length === 0) {
        container.innerHTML = '<p class="empty-state">No tienes pólizas activas</p>';
        return;
    }

    const policyIcons = {
        'auto': '🚗',
        'home': '🏠',
        'life': '❤️',
        'health': '💼',
        'business': '🏢',
        'other': '📄'
    };

    // Normaliza claves del backend (type vs policy_type)
    const html = policies.map(policy => {
        const policyType = policy.policy_type || policy.type || 'other';
        const endDate = policy.end_date || policy.renewal_date;
        const status = (policy.status || 'active').toLowerCase();
        return `
                <div class="policy-item" data-policy-id="${policy.id}" data-policy-number="${policy.policy_number}">
                    <div class="policy-icon">${policyIcons[policyType] || '📄'}</div>
                    <div class="policy-info">
                        <h4>Seguro de ${getPolicyTypeName(policyType)}</h4>
                        <p>Póliza #${policy.policy_number}</p>
                        <div class="policy-meta">
                            <span class="badge badge-${status === 'active' ? 'success' : status === 'expired' ? 'danger' : 'warning'}">
                                ${status}
                            </span>
                            <span>${endDate ? 'Vence: ' + new Date(endDate).toLocaleDateString() : ''}</span>
                        </div>
                    </div>
                    <div class="policy-actions">
                        <button class="btn btn-sm btn-outline" data-action="view-policy" data-policy-id="${policy.id}">
                            Ver Detalles
                        </button>
                    </div>
                </div>`;
    }).join('');

    container.innerHTML = html;

    // Bind clicks a cada póliza
    container.querySelectorAll('[data-action="view-policy"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const policyId = e.currentTarget.dataset.policyId;
            if (window.appHandlers?.viewPolicy) {
                window.appHandlers.viewPolicy(policyId);
            }
        });
    });

    // Permitir click en todo el item
    container.querySelectorAll('.policy-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            const policyId = item.dataset.policyId;
            if (window.appHandlers?.viewPolicy) {
                window.appHandlers.viewPolicy(policyId);
            }
        });
    });
}

function renderClientClaims(claims) {
    const container = document.querySelector('[data-client-claims-list]');
    if (!container) return;

    if (!claims || claims.length === 0) {
        container.innerHTML = '<p class="empty-state">No tienes reclamaciones</p>';
        return;
    }

    const html = claims.map(claim => `
    <div class="claim-item" data-claim-id="${claim.id}">
      <div class="claim-info">
        <h4>Reclamación #${claim.claim_number}</h4>
        <p>${claim.description || 'Sin descripción'}</p>
        <div class="claim-meta">
          <span class="badge badge-${getClaimStatusColor(claim.status)}">
            ${getClaimStatusLabel(claim.status)}
          </span>
          <span>Monto: $${parseFloat(claim.claim_amount).toFixed(2)}</span>
        </div>
      </div>
    </div>
  `).join('');

    container.innerHTML = html;
}

function renderPaymentHistory(payments) {
    const container = document.querySelector('[data-payment-history]');
    if (!container) return;

    if (!payments || payments.length === 0) {
        container.innerHTML = '<p class="empty-state">No hay historial de pagos</p>';
        return;
    }

    const html = payments.slice(0, 10).map(payment => `
    <div class="payment-item" data-payment-id="${payment.id}">
      <div class="payment-info">
                <p class="payment-date">${new Date(payment.payment_date || payment.date).toLocaleDateString()}</p>
        <p class="payment-amount">$${parseFloat(payment.amount).toFixed(2)}</p>
        <span class="badge badge-${payment.status === 'completed' ? 'success' : 'warning'}">
          ${payment.status}
        </span>
      </div>
    </div>
  `).join('');

    container.innerHTML = html;
}

// ============================================
// RENDERERS - ADMIN
// ============================================

function updateAdminStats(stats) {
    if (!stats) return;

    // Update admin stat cards with real data
    const statsSelectors = {
        '[data-stat-users]': (stats.users_client || 0) + (stats.users_agent || 0) + (stats.users_admin || 0),
        '[data-stat-clients]': stats.users_client || 0,
        '[data-stat-agents]': stats.users_agent || 0,
        '[data-stat-policies]': stats.policies_active || 0,
        '[data-stat-claims]': stats.pending_claims || 0,
        '[data-stat-revenue]': stats.monthly_revenue ? `$${parseFloat(stats.monthly_revenue).toLocaleString()}` : '$0'
    };

    Object.entries(statsSelectors).forEach(([selector, value]) => {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value;
        }
    });

    console.log('✅ Admin stats updated:', stats);
}

function renderAdminActivity(activities) {
    const container = document.querySelector('[data-admin-activity]');
    if (!container) return;

    if (!activities || activities.length === 0) {
        container.innerHTML = '<p class="empty-state">No hay actividad reciente</p>';
        return;
    }

    const html = activities.map(activity => {
        const icon = activity.type === 'policy' ? '📄' : '🔔';
        const date = new Date(activity.timestamp).toLocaleDateString();

        return `
        <div class="activity-item">
            <div class="activity-icon">${icon}</div>
            <div class="activity-info">
                <p><strong>${activity.user_name}</strong> ${activity.type === 'policy' ? 'creó una póliza' : 'presentó un reclamo'}</p>
                <p class="activity-meta">${activity.type === 'policy' ? activity.policy_type : activity.claim_type} - ${activity.status}</p>
                <span class="activity-date">${date}</span>
            </div>
        </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// ============================================
// HELPERS
// ============================================

function getClaimStatusColor(status) {
    const colors = {
        'submitted': 'primary',
        'under_review': 'warning',
        'approved': 'success',
        'rejected': 'danger',
        'paid': 'success'
    };
    return colors[status] || 'secondary';
}

function getClaimStatusLabel(status) {
    const labels = {
        'submitted': 'Enviado',
        'under_review': 'En Revisión',
        'approved': 'Aprobado',
        'rejected': 'Rechazado',
        'paid': 'Pagado'
    };
    return labels[status] || status;
}

function getPolicyTypeName(type) {
    const names = {
        'auto': 'Auto',
        'home': 'Hogar',
        'life': 'Vida',
        'health': 'Salud',
        'business': 'Comercial',
        'other': 'Otro'
    };
    return names[type] || type;
}

/**
 * Load client contacts - agents assigned to client's policies
 */
async function loadClientContacts() {
    try {
        const contacts = await apiService.request(API_CONFIG.ENDPOINTS.GET_CLIENT_CONTACTS, {
            method: 'GET'
        });

        if (!contacts || contacts.length === 0) {
            console.warn('No contacts found for client');
            const contactChipsContainer = document.querySelector('.contact-chips');
            if (contactChipsContainer) {
                contactChipsContainer.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #999;">
                        <p style="margin: 0; font-size: 13px;">No hay contactos asignados</p>
                    </div>
                `;
            }
            return;
        }

        const contactChipsContainer = document.querySelector('.contact-chips');
        if (contactChipsContainer) {
            contactChipsContainer.innerHTML = contacts.map(contact => `
                <button class="contact-chip" 
                    data-name="${contact.full_name}" 
                    data-phone="${contact.phone || 'No disponible'}" 
                    data-email="${contact.email}" 
                    data-role="${contact.role || 'Agente'}" 
                    data-policy="${contact.policy_types || '—'}">
                    ${contact.full_name}
                </button>
            `).join('');

            if (window.reinitializeContactChips) {
                window.reinitializeContactChips();
            }
        }

        console.log('✅ Client contacts loaded:', contacts.length);
    } catch (error) {
        console.error('Error loading client contacts:', error);
        const contactChipsContainer = document.querySelector('.contact-chips');
        if (contactChipsContainer) {
            contactChipsContainer.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #f44;">
                    <p style="margin: 0; font-size: 13px;">Error al cargar contactos</p>
                </div>
            `;
        }
    }
}

/**
 * Load recent clients for agent sidebar
 * Fetches clients from AGENT_CLIENTS endpoint and renders them dynamically
 */
async function loadAgentRecentClients() {
    console.log('🚀 loadAgentRecentClients() STARTED');
    const clientsPillsContainer = document.querySelector('.recent-clients-pills');
    console.log('📍 Container found:', !!clientsPillsContainer);
    if (!clientsPillsContainer) {
        console.log('⚠️ Recent clients container not found');
        return;
    }

    try {
        console.log('📡 Loading recent clients from API...');
        const clients = await apiService.request(
            API_CONFIG.ENDPOINTS.AGENT_CLIENTS,
            { method: 'GET' },
            {
                cacheDuration: apiService.cache.CACHE_DURATION.SHORT,
                useCache: true
            }
        );

        console.log('📊 Clients received:', clients?.length || 0, clients);

        if (!clients || clients.length === 0) {
            console.log('⚠️ No clients to display');
            clientsPillsContainer.innerHTML = `
                <div style="padding: 12px; text-align: center; color: var(--theme-text-secondary); font-size: 0.875rem;">
                    No hay clientes asignados
                </div>
            `;
            return;
        }

        // Get only the 5 most recent clients (sorted by most recent policy activity)
        const recentClients = clients
            .sort((a, b) => new Date(b.last_policy_update || b.created_at) - new Date(a.last_policy_update || a.created_at))
            .slice(0, 5);

        // Render client pills
        clientsPillsContainer.innerHTML = recentClients.map(client => {
            const initials = `${client.first_name?.[0] || ''}${client.last_name?.[0] || ''}`.toUpperCase();
            const fullName = `${client.first_name || ''} ${client.last_name || ''}`.trim();
            const shortName = `${client.first_name || ''} ${client.last_name?.[0] || ''}.`.trim();

            return `
                <button class="client-pill" 
                    onclick="window.appHandlers?.viewClientDetails?.('${client.id}')">
                    <span class="client-pill-avatar">${initials}</span>
                    <span class="client-pill-name">${shortName}</span>
                </button>
            `;
        }).join('');

        console.log(`✅ Loaded ${recentClients.length} recent clients`);
    } catch (error) {
        console.error('❌ Error loading recent clients:', error);
        clientsPillsContainer.innerHTML = `
            <div style="padding: 12px; text-align: center; color: var(--theme-text-secondary);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 8px;">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div style="font-size: 0.875rem;">Error al cargar clientes</div>
            </div>
        `;
    }
}

// ============================================
// DYNAMIC CHART DATA LOADERS
// ============================================

/**
 * Load policy health statistics for donut chart
 */
async function loadPolicyHealthStats() {
    try {
        const data = await apiService.request('?action=policy_health_stats', {
            method: 'GET'
        });

        if (data.success && data.stats) {
            renderPolicyHealthChart(data.stats);
        }
    } catch (error) {
        console.error('Error loading policy health stats:', error);
    }
}

/**
 * Render policy health donut chart with real data
 */
function renderPolicyHealthChart(stats) {
    // Update the monitor text in client dashboard
    const monitors = document.querySelectorAll('.chart-card');
    monitors.forEach(card => {
        const title = card.querySelector('.chart-title');
        if (title?.textContent.includes('Salud de pólizas')) {
            // Update legend with real percentages
            const legend = card.querySelector('.chart-legend');
            if (legend) {
                legend.innerHTML = `
                    <span class="chart-legend-item">
                        <span class="chart-legend-dot" style="background: #38ef7d; box-shadow: 0 0 0 4px rgba(56, 239, 125, 0.12);"></span> 
                        Activas (${stats.active_percent}%)
                    </span>
                    <span class="chart-legend-item">
                        <span class="chart-legend-dot" style="background: #f5576c; box-shadow: 0 0 0 4px rgba(245, 87, 108, 0.12);"></span> 
                        Riesgo (${stats.risk_percent}%)
                    </span>
                `;
            }

            // You can also update a visual chart here if implementing canvas/svg donut
            console.log('✅ Policy health chart updated:', stats);
        }
    });
}

/**
 * Load payment trends for sparkline chart
 */
async function loadPaymentTrends() {
    try {
        const data = await apiService.request('?action=payment_trends', {
            method: 'GET'
        });

        if (data.success) {
            renderPaymentTrendsChart(data.trends, data.summary);
        }
    } catch (error) {
        console.error('Error loading payment trends:', error);
    }
}

/**
 * Render payment trends chart with real data
 */
function renderPaymentTrendsChart(trends, summary) {
    const chartCards = document.querySelectorAll('.chart-card');
    chartCards.forEach(card => {
        const title = card.querySelector('.chart-title');
        if (title?.textContent.includes('Tendencia de pagos')) {
            // Update metrics with real data
            const metrics = card.querySelector('.chart-metrics');
            if (metrics) {
                metrics.innerHTML = `
                    <div class="chart-metric">
                        <span class="label">Total pagos</span>
                        <span class="value">${summary.total_payments}</span>
                    </div>
                    <div class="chart-metric">
                        <span class="label">Pagos puntuales</span>
                        <span class="value">${summary.on_time}</span>
                    </div>
                    <div class="chart-metric">
                        <span class="label">Retrasos</span>
                        <span class="value">${summary.late}</span>
                    </div>
                `;
            }

            // Update legend
            const legend = card.querySelector('.chart-legend');
            if (legend) {
                legend.innerHTML = `
                    <span class="chart-legend-item"><span class="chart-legend-dot"></span> Pagos</span>
                    <span class="chart-legend-item" style="color: var(--theme-accent-color);">
                        ${summary.on_time_rate}% puntualidad
                    </span>
                `;
            }

            console.log('✅ Payment trends chart updated:', summary);
        }
    });
}

/**
 * Load pending actions/tasks
 */
async function loadPendingActions() {
    try {
        const data = await apiService.request('?action=pending_actions', {
            method: 'GET'
        });

        if (data.success && data.actions) {
            renderPendingActions(data.actions);
        }
    } catch (error) {
        console.error('Error loading pending actions:', error);
    }
}

/**
 * Render pending actions list
 */
function renderPendingActions(actions) {
    // Find pending actions container (could be in sidebar or main area)
    const containers = document.querySelectorAll('[data-pending-actions], .pending-actions-list');

    // Update count badge
    const countBadges = document.querySelectorAll('[data-actions-count]');
    countBadges.forEach(badge => {
        badge.textContent = actions.length;
    });

    if (actions.length === 0) {
        containers.forEach(container => {
            container.innerHTML = `
                <div style="padding: 20px; text-align: center; color: var(--theme-text-secondary);">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 8px; opacity: 0.5;">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <p style="margin: 0; font-size: 0.875rem;">No hay acciones pendientes</p>
                </div>
            `;
        });
        return;
    }

    const html = actions.map(action => {
        const daysUntil = action.days_until;
        const urgencyClass = daysUntil < 3 ? 'urgent' : daysUntil < 7 ? 'warning' : 'info';
        const daysText = daysUntil < 0
            ? `Vencido hace ${Math.abs(daysUntil)}d`
            : daysUntil === 0
                ? 'Hoy'
                : `En ${daysUntil}d`;

        return `
            <div class="pending-action-item ${urgencyClass}" style="padding: 10px; border-left: 3px solid ${daysUntil < 3 ? '#f5576c' : daysUntil < 7 ? '#ffa726' : 'var(--theme-accent-color)'}; margin-bottom: 8px; background: var(--theme-surface-variant); border-radius: 6px;">
                <div style="display: flex; align-items: start; gap: 10px;">
                    <div style="flex-shrink: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: ${daysUntil < 3 ? '#f5576c' : daysUntil < 7 ? '#ffa726' : 'var(--theme-accent-color)'};">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${action.action.includes('Pago')
                ? '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>'
                : '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>'}
                        </svg>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 2px;">${action.action}</div>
                        <div style="font-size: 0.8125rem; color: var(--theme-text-secondary); margin-bottom: 4px;">${action.policy_number}</div>
                        <div style="font-size: 0.75rem; font-weight: 600; color: ${daysUntil < 3 ? '#f5576c' : daysUntil < 7 ? '#ffa726' : 'var(--theme-text-secondary)'};">${daysText}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    containers.forEach(container => {
        container.innerHTML = html;
    });

    console.log(`✅ Rendered ${actions.length} pending actions`);
}
