// API Integration Layer for Krause Insurance
// GoDaddy Server + Database Integration

// API Configuration
const API_CONFIG = {
  // Update these URLs when deploying to GoDaddy
  BASE_URL: window.location.hostname === 'localhost'
    ? 'http://localhost/backend/index.php'
    : 'https://' + window.location.hostname + '/backend/index.php', // Forzar HTTPS en producción

  ENDPOINTS: {
    // Authentication
    LOGIN: '?action=login',
    LOGOUT: '?action=logout',
    VERIFY_TOKEN: '?action=verify_token',

    // User Management
    GET_USER_PROFILE: '?action=user_profile',
    UPDATE_USER_PROFILE: '?action=update_profile',
    GET_USER_POLICIES: '?action=user_policies',

    // Policies
    GET_POLICIES: '?action=policies',
    GET_POLICY_DETAILS: '?action=policy_details',
    CREATE_POLICY: '?action=create_policy',
    UPDATE_POLICY: '?action=update_policy',

    // Claims
    GET_CLAIMS: '?action=claims',
    GET_USER_CLAIMS: '?action=user_claims',
    CREATE_CLAIM: '?action=submit_claim',
    SUBMIT_CLAIM: '?action=submit_claim',
    GET_CLAIM_DETAILS: '?action=claim_details',
    ADD_CLAIM_COMMENT: '?action=add_claim_comment',
    UPLOAD_CLAIM_DOCUMENT: '?action=upload_claim_doc',
    ASSIGN_CLAIM: '?action=assign_claim',

    // Payments
    GET_PAYMENT_HISTORY: '?action=payment_history',
    PROCESS_PAYMENT: '?action=process_payment',
    UPLOAD_PAYMENT_RECEIPT: '?action=upload_payment_receipt',
    VERIFY_PAYMENT_RECEIPT: '?action=verify_payment_receipt',
    DOWNLOAD_RECEIPT: '?action=download_receipt',

    // Documents
    UPLOAD_DOCUMENT: '?action=upload_document',
    DOWNLOAD_DOCUMENT: '?action=download_document',
    LIST_DOCUMENTS: '?action=recent_documents',
    DELETE_DOCUMENT: '?action=delete_document',

    // Quotes
    REQUEST_QUOTE: '?action=submit_quote',
    GET_QUOTES: '?action=quotes',

    // Dashboard Endpoints
    CLIENT_DASHBOARD: '?action=client_dashboard',
    CLIENT_PAYMENTS: '?action=payment_history',
    CLIENT_POLICIES: '?action=user_policies',
    CLIENT_CLAIMS: '?action=user_claims',
    CLIENT_DOCUMENTS: '?action=recent_documents',

    AGENT_DASHBOARD: '?action=agent_dashboard',
    AGENT_CLIENTS: '?action=agent_clients',
    AGENT_STATS: '?action=agent_stats',

    ADMIN_DASHBOARD: '?action=admin_dashboard',
    ADMIN_STATS: '?action=admin_stats',
    ADMIN_ACTIVITY: '?action=system_activity',

    // Questionnaires / Roadmap
    GET_QUESTIONNAIRES: '/questionnaires',
    SEND_QUESTIONNAIRE: '/questionnaires/send',
    RESEND_QUESTIONNAIRE: '/questionnaires/:id/resend',
    COMPLETE_QUESTIONNAIRE: '/questionnaires/:id/complete',
    GET_ROADMAP: '/agents/clients/:id/roadmap',


    // Calendar/Meetings
    CREATE_MEETING: '?action=create_meeting',
    LIST_MEETINGS: '?action=list_meetings',
    UPDATE_MEETING: '?action=update_meeting',
    CANCEL_MEETING: '?action=cancel_meeting',
    // Notifications
    SEND_NOTIFICATION: '/notifications/email',

    // Agents (for agent portal)
    GET_CLIENTS: '/agents/clients',
    GET_CLIENT_DETAILS: '?action=client_details',
    UPDATE_CLIENT: '/agents/clients/:id',
    GET_CLIENT_CONTACTS: '?action=client_contacts',
    GET_AGENT_LIST: '?action=agent_list',

    // Analytics
    GET_DASHBOARD_STATS: '/analytics/dashboard',
    GET_AGENT_PERFORMANCE: '/analytics/agent/:id'
  }
};

// API Service with caching
class APIService {
  constructor() {
    // Use cache manager if available, otherwise use simple localStorage
    this.cache = window.cacheManager || {
      get: () => null,
      set: () => { },
      clearUserCache: () => { },
      CACHE_DURATION: { SHORT: 60, MEDIUM: 300, LONG: 3600 }
    };
    this.fileManager = window.fileManager || null;
  }

  // Build full URL
  buildUrl(endpoint, params = {}) {
    let url = API_CONFIG.BASE_URL + endpoint;

    // Replace path parameters
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });

    return url;
  }

  // Make API request with caching
  async request(endpoint, options = {}, cacheOptions = {}) {
    const {
      method = 'GET',
      body = null,
      headers = {},
      params = {},
      queryParams = {}
    } = options;

    const {
      useCache = true,
      cacheDuration = this.cache.CACHE_DURATION.MEDIUM,
      forceRefresh = false,
      showLoading = false
    } = cacheOptions;

    const url = this.buildUrl(endpoint, params);

    // Add query parameters - handle both absolute and relative URLs
    let fullUrl = url;
    if (Object.keys(queryParams).length > 0) {
      const separator = url.includes('?') ? '&' : '?';
      const queryString = Object.keys(queryParams)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
        .join('&');
      fullUrl = url + separator + queryString;
    }

    // Cache identifier
    const cacheIdentifier = `api_${method}_${endpoint}_${JSON.stringify(params)}_${JSON.stringify(queryParams)}`;
    const userId = this.getCurrentUserId();

    // Check cache for GET requests
    if (method === 'GET' && useCache && !forceRefresh) {
      const cached = this.cache.get(cacheIdentifier, userId);
      if (cached) {
        console.log('✅ API Cache hit:', cacheIdentifier);
        return cached;
      }
    }

    // Show loading if needed
    if (showLoading) {
      this.showLoadingScreen();
    }

    try {
      // Get auth token
      const token = this.getAuthToken();

      const requestOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...headers
        }
      };

      if (body && method !== 'GET') {
        requestOptions.body = JSON.stringify(body);
      }

      const response = await fetch(fullUrl, requestOptions);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful GET requests
      if (method === 'GET' && useCache) {
        this.cache.set(cacheIdentifier, data, cacheDuration, userId);
      }

      // Invalidate related cache on mutations
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        this.invalidateRelatedCache(endpoint);
      }

      if (showLoading) {
        this.hideLoadingScreen();
      }

      return data;

    } catch (error) {
      console.error('API Request failed:', error);

      if (showLoading) {
        this.hideLoadingScreen();
      }

      throw error;
    }
  }

  // Invalidate related cache after mutations
  invalidateRelatedCache(endpoint) {
    // Clear cache entries related to this endpoint
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes(endpoint.split('/')[1])) {
        localStorage.removeItem(key);
      }
    });
  }

  // Get current user ID from session
  getCurrentUserId() {
    try {
      const user = localStorage.getItem('krauser_user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.id || userData.email;
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  // Get auth token
  getAuthToken() {
    return localStorage.getItem('auth_token');
  }

  // Set auth token
  setAuthToken(token) {
    localStorage.setItem('auth_token', token);
  }

  // Clear auth token
  clearAuthToken() {
    localStorage.removeItem('auth_token');
  }

  // Show loading screen
  showLoadingScreen() {
    const currentUrl = encodeURIComponent(window.location.href);
    window.location.href = `loading.html?redirect=${currentUrl}`;
  }

  // Hide loading screen (handled by loading.html)
  hideLoadingScreen() {
    // Auto-handled by loading screen
  }

  // HTTP Method Helpers
  async get(endpoint, params = {}, cacheOptions = {}) {
    return this.request(endpoint, { method: 'GET', params }, cacheOptions);
  }

  async post(endpoint, body, params = {}) {
    return this.request(endpoint, { method: 'POST', body, params }, { useCache: false });
  }

  async put(endpoint, body, params = {}) {
    return this.request(endpoint, { method: 'PUT', body, params }, { useCache: false });
  }

  async delete(endpoint, params = {}) {
    return this.request(endpoint, { method: 'DELETE', params }, { useCache: false });
  }

  // Upload file with progress
  async uploadFile(endpoint, file, onProgress, params = {}) {
    const url = this.buildUrl(endpoint, params);

    try {
      if (!this.fileManager) {
        throw new Error('File manager not available');
      }

      const result = await this.fileManager.uploadFile(url, file, (percent) => {
        if (onProgress) onProgress(percent);
      });

      // Invalidate document cache
      this.invalidateRelatedCache('/documents');

      return result;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  // Download file with progress
  async downloadFile(endpoint, filename, onProgress, params = {}) {
    const url = this.buildUrl(endpoint, params);

    try {
      if (!this.fileManager) {
        throw new Error('File manager not available');
      }

      const result = await this.fileManager.downloadFile(url, filename, (percent) => {
        if (onProgress) onProgress(percent);
      });

      return result;
    } catch (error) {
      console.error('File download failed:', error);
      throw error;
    }
  }
}

// Initialize and export API Service immediately
const apiService = new APIService();
export { apiService };

// Example usage functions for common operations

// Login with caching
async function loginUser(email, password) {
  try {
    const response = await apiService.request(
      API_CONFIG.ENDPOINTS.LOGIN,
      {
        method: 'POST',
        body: { email, password }
      },
      {
        useCache: false,
        showLoading: false // No usar loading screen automático, el auth module ya maneja el loading
      }
    );

    if (response.token) {
      apiService.setAuthToken(response.token);
      apiService.cache.set('user_profile', response.user, apiService.cache.CACHE_DURATION.LONG, response.user.id);
    }

    return response;
  } catch (error) {
    throw new Error('Login failed: ' + error.message);
  }
}

// Get user policies with caching
async function getUserPolicies(forceRefresh = false) {
  try {
    const policies = await apiService.request(
      API_CONFIG.ENDPOINTS.GET_USER_POLICIES,
      { method: 'GET' },
      {
        useCache: true,
        cacheDuration: apiService.cache.CACHE_DURATION.MEDIUM,
        forceRefresh: forceRefresh,
        showLoading: !forceRefresh
      }
    );

    return policies;
  } catch (error) {
    console.error('Failed to get policies:', error);
    return [];
  }
}

// Upload claim document with progress
async function uploadClaimDocument(claimId, file, onProgress) {
  try {
    const result = await apiService.uploadFile(
      API_CONFIG.ENDPOINTS.UPLOAD_CLAIM_DOCUMENT,
      file,
      onProgress,
      { id: claimId }
    );

    return result;
  } catch (error) {
    throw new Error('Document upload failed: ' + error.message);
  }
}

// Download payment receipt
async function downloadPaymentReceipt(paymentId, onProgress) {
  try {
    const filename = `recibo_pago_${paymentId}.pdf`;
    const result = await apiService.downloadFile(
      API_CONFIG.ENDPOINTS.DOWNLOAD_RECEIPT,
      filename,
      onProgress,
      { id: paymentId }
    );

    return result;
  } catch (error) {
    throw new Error('Receipt download failed: ' + error.message);
  }
}

// Clear user cache on logout
function logoutUser() {
  const userId = apiService.getCurrentUserId();
  if (userId) {
    apiService.cache.clearUserCache(userId);
  }
  apiService.clearAuthToken();
  localStorage.removeItem('krauser_user');
}

// ===== DASHBOARD DATA FETCHERS =====

/**
 * CLIENT DASHBOARD
 */
async function getClientDashboardData(clientId = null) {
  try {
    const endpoint = clientId
      ? `${API_CONFIG.ENDPOINTS.CLIENT_DASHBOARD}/${clientId}`
      : API_CONFIG.ENDPOINTS.CLIENT_DASHBOARD;

    return await apiService.get(endpoint);
  } catch (error) {
    console.error('Failed to load client dashboard:', error);
    throw error;
  }
}

async function getClientPayments(clientId = null) {
  try {
    const endpoint = clientId
      ? `${API_CONFIG.ENDPOINTS.CLIENT_PAYMENTS}/${clientId}`
      : API_CONFIG.ENDPOINTS.CLIENT_PAYMENTS;

    return await apiService.get(endpoint);
  } catch (error) {
    console.error('Failed to load payment history:', error);
    return [];
  }
}

async function getClientPolicies(clientId = null) {
  try {
    const endpoint = clientId
      ? `${API_CONFIG.ENDPOINTS.CLIENT_POLICIES}/${clientId}`
      : API_CONFIG.ENDPOINTS.CLIENT_POLICIES;

    return await apiService.get(endpoint);
  } catch (error) {
    console.error('Failed to load policies:', error);
    return [];
  }
}

async function getClientClaims(clientId = null) {
  try {
    const endpoint = clientId
      ? `${API_CONFIG.ENDPOINTS.CLIENT_CLAIMS}/${clientId}`
      : API_CONFIG.ENDPOINTS.CLIENT_CLAIMS;

    return await apiService.get(endpoint);
  } catch (error) {
    console.error('Failed to load claims:', error);
    return [];
  }
}

async function getClientDocuments(clientId = null) {
  try {
    const endpoint = clientId
      ? `${API_CONFIG.ENDPOINTS.CLIENT_DOCUMENTS}/${clientId}`
      : API_CONFIG.ENDPOINTS.CLIENT_DOCUMENTS;

    return await apiService.get(endpoint);
  } catch (error) {
    console.error('Failed to load documents:', error);
    return [];
  }
}

/**
 * AGENT DASHBOARD
 */
async function getAgentDashboardData(agentId = null) {
  try {
    const endpoint = agentId
      ? `${API_CONFIG.ENDPOINTS.AGENT_DASHBOARD}/${agentId}`
      : API_CONFIG.ENDPOINTS.AGENT_DASHBOARD;

    return await apiService.get(endpoint);
  } catch (error) {
    console.error('Failed to load agent dashboard:', error);
    throw error;
  }
}

async function getAgentClients(agentId = null) {
  try {
    const endpoint = agentId
      ? `${API_CONFIG.ENDPOINTS.AGENT_CLIENTS}/${agentId}`
      : API_CONFIG.ENDPOINTS.AGENT_CLIENTS;

    return await apiService.get(endpoint);
  } catch (error) {
    console.error('Failed to load clients:', error);
    return [];
  }
}

async function getAgentStats(agentId = null) {
  try {
    const endpoint = agentId
      ? `${API_CONFIG.ENDPOINTS.AGENT_STATS}/${agentId}`
      : API_CONFIG.ENDPOINTS.AGENT_STATS;

    return await apiService.get(endpoint);
  } catch (error) {
    console.error('Failed to load agent stats:', error);
    return {
      total_clients: 0,
      active_policies: 0,
      pending_claims: 0,
      monthly_revenue: 0
    };
  }
}

/**
 * ADMIN DASHBOARD
 */
async function getAdminDashboardData() {
  try {
    return await apiService.get(API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD);
  } catch (error) {
    console.error('Failed to load admin dashboard:', error);
    throw error;
  }
}

async function getAdminStats() {
  try {
    return await apiService.get(API_CONFIG.ENDPOINTS.ADMIN_STATS);
  } catch (error) {
    console.error('Failed to load admin stats:', error);
    return {};
  }
}

async function getAdminActivity() {
  try {
    return await apiService.get(API_CONFIG.ENDPOINTS.ADMIN_ACTIVITY);
  } catch (error) {
    console.error('Failed to load admin activity:', error);
    return [];
  }
}

// Export for use (ES6 modules)
export {
  APIService,
  API_CONFIG,
  loginUser,
  getUserPolicies,
  uploadClaimDocument,
  downloadPaymentReceipt,
  logoutUser,
  // Dashboard exports
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
};
