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
    try {
        // Update user name in header first
        updateUserNameInHeader();

        // Load dashboard data from backend
        const dashboardData = await apiService.request(
            API_CONFIG.ENDPOINTS.AGENT_DASHBOARD,
            { method: 'GET' },
            {
                cacheDuration: apiService.cache.CACHE_DURATION.SHORT,
                useCache: true
            }
        );

        // Update UI with real data
        if (dashboardData.stats) updateAgentStats(dashboardData.stats);
        if (dashboardData.clients) renderAgentClients(dashboardData.clients);
        if (dashboardData.claims) renderAgentClaims(dashboardData.claims);

        console.log('✅ Agent dashboard loaded with real data');
        return dashboardData;
    } catch (error) {
        console.error('Error loading agent dashboard:', error);
        showNotification('Error al cargar datos del dashboard', NOTIFICATION_TYPES.ERROR);
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
    try {
        // Update user name in header first
        updateUserNameInHeader();

        // Load dashboard data from backend
        const dashboardData = await apiService.request(
            API_CONFIG.ENDPOINTS.CLIENT_DASHBOARD,
            { method: 'GET' },
            {
                cacheDuration: apiService.cache.CACHE_DURATION.SHORT,
                useCache: true
            }
        );

        // Load additional data in parallel
        const [policies, claims, payments] = await Promise.all([
            loadClientPolicies(),
            loadClientClaims(),
            loadPaymentHistory()
        ]);

        // Update stats from dashboard data
        if (dashboardData.stats) updateClientStats(dashboardData.stats);

        // Render lists
        if (policies) renderClientPolicies(policies);
        if (claims) renderClientClaims(claims);
        if (payments) renderPaymentHistory(payments);

        console.log('✅ Client dashboard loaded with real data');
        return { dashboardData, policies, claims, payments };
    } catch (error) {
        console.error('Error loading client dashboard:', error);
        showNotification('Error al cargar datos del dashboard', NOTIFICATION_TYPES.ERROR);
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

    const html = clients.map(client => `
    <div class="client-item" data-client-id="${client.id}">
      <div class="client-info">
        <h4>${client.first_name} ${client.last_name}</h4>
        <p>${client.email}</p>
        <div class="client-meta">
          <span class="badge badge-${client.status === 'active' ? 'success' : 'warning'}">
            ${client.status}
          </span>
          <span>Desde: ${new Date(client.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      <div class="client-actions">
        <button class="btn btn-sm btn-outline" onclick="window.appHandlers.viewClientDetails('${client.id}')">
          Ver Detalles
        </button>
      </div>
    </div>
  `).join('');

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
