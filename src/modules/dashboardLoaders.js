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
// AGENT DASHBOARD LOADERS
// ============================================

export async function loadAgentDashboard() {
    try {
        // Load all data in parallel
        const [clients, claims, stats] = await Promise.all([
            loadAgentClients(),
            loadClaims(),
            loadDashboardStats()
        ]);

        // Update UI
        if (clients) renderAgentClients(clients);
        if (claims) renderAgentClaims(claims);
        if (stats) updateAgentStats(stats);

        return { clients, claims, stats };
    } catch (error) {
        console.error('Error loading agent dashboard:', error);
        showNotification('Error al cargar datos del dashboard', NOTIFICATION_TYPES.ERROR);
    }
}

export async function loadAgentClients() {
    try {
        const clients = await apiService.request(
            API_CONFIG.ENDPOINTS.GET_CLIENTS,
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
        const [policies, claims, payments] = await Promise.all([
            loadClientPolicies(),
            loadClaims(),
            loadPaymentHistory()
        ]);

        if (policies) renderClientPolicies(policies);
        if (claims) renderClientClaims(claims);
        if (payments) renderPaymentHistory(payments);

        return { policies, claims, payments };
    } catch (error) {
        console.error('Error loading client dashboard:', error);
        showNotification('Error al cargar datos del dashboard', NOTIFICATION_TYPES.ERROR);
    }
}

export async function loadClientPolicies() {
    try {
        const policies = await apiService.request(
            API_CONFIG.ENDPOINTS.GET_USER_POLICIES,
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
            API_CONFIG.ENDPOINTS.GET_PAYMENT_HISTORY,
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
// SHARED LOADERS
// ============================================

export async function loadClaims() {
    try {
        const claims = await apiService.request(
            API_CONFIG.ENDPOINTS.GET_CLAIMS,
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

function renderClientPolicies(policies) {
    const container = document.querySelector('.policies-list');
    if (!container || !policies || policies.length === 0) {
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

    const html = policies.map(policy => `
    <div class="policy-item" data-policy-id="${policy.id}">
      <div class="policy-icon">${policyIcons[policy.policy_type] || '📄'}</div>
      <div class="policy-info">
        <h4>Seguro de ${getPolicyTypeName(policy.policy_type)}</h4>
        <p>Póliza #${policy.policy_number}</p>
        <div class="policy-meta">
          <span class="badge badge-${policy.status === 'active' ? 'success' : 'warning'}">
            ${policy.status}
          </span>
          <span>Vence: ${new Date(policy.end_date || policy.renewal_date).toLocaleDateString()}</span>
        </div>
      </div>
      <div class="policy-actions">
        <button class="btn btn-sm btn-outline" onclick="window.appHandlers.viewPolicy('${policy.id}')">
          Ver Detalles
        </button>
      </div>
    </div>
  `).join('');

    container.innerHTML = html;
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
        <p class="payment-date">${new Date(payment.payment_date).toLocaleDateString()}</p>
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
