// API Integration Layer for Krause Insurance
// GoDaddy Server + Database Integration

// API Configuration
const API_CONFIG = {
  // Update these URLs when deploying to GoDaddy
  BASE_URL: window.location.hostname === 'localhost'
    ? 'http://localhost/api'
    : 'https://ksinsurancee.com/api',

  ENDPOINTS: {
    // Authentication
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VERIFY_TOKEN: '/auth/verify',

    // User Management
    GET_USER_PROFILE: '/users/profile',
    UPDATE_USER_PROFILE: '/users/profile',
    GET_USER_POLICIES: '/users/policies',

    // Policies
    GET_POLICIES: '/policies',
    GET_POLICY_DETAILS: '/policies/:id',
    CREATE_POLICY: '/policies/create',
    UPDATE_POLICY: '/policies/:id',

    // Claims
    GET_CLAIMS: '/claims',
    CREATE_CLAIM: '/claims/create',
    GET_CLAIM_DETAILS: '/claims/:id',
    UPLOAD_CLAIM_DOCUMENT: '/claims/:id/upload',
    ASSIGN_CLAIM: '/claims/:id/assign',

    // Payments
    GET_PAYMENT_HISTORY: '/payments/history',
    PROCESS_PAYMENT: '/payments/process',
    DOWNLOAD_RECEIPT: '/payments/:id/receipt',

    // Documents
    UPLOAD_DOCUMENT: '/documents/upload',
    DOWNLOAD_DOCUMENT: '/documents/:id',
    LIST_DOCUMENTS: '/documents',
    DELETE_DOCUMENT: '/documents/:id',

    // Quotes
    REQUEST_QUOTE: '/quotes/request',
    GET_QUOTES: '/quotes',

    // Questionnaires / Roadmap
    GET_QUESTIONNAIRES: '/questionnaires',
    SEND_QUESTIONNAIRE: '/questionnaires/send',
    RESEND_QUESTIONNAIRE: '/questionnaires/:id/resend',
    COMPLETE_QUESTIONNAIRE: '/questionnaires/:id/complete',
    GET_ROADMAP: '/agents/clients/:id/roadmap',

    // Notifications
    SEND_NOTIFICATION: '/notifications/email',

    // Agents (for agent portal)
    GET_CLIENTS: '/agents/clients',
    GET_CLIENT_DETAILS: '/agents/clients/:id',
    UPDATE_CLIENT: '/agents/clients/:id',

    // Analytics
    GET_DASHBOARD_STATS: '/analytics/dashboard',
    GET_AGENT_PERFORMANCE: '/analytics/agent/:id'
  }
};

// API Service with caching
class APIService {
  constructor() {
    this.cache = window.cacheManager || new CacheManager();
    this.fileManager = window.fileManager || new FileManager();
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

    // Add query parameters
    const urlObj = new URL(url);
    Object.keys(queryParams).forEach(key => {
      urlObj.searchParams.append(key, queryParams[key]);
    });

    const fullUrl = urlObj.toString();

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

  // Upload file with progress
  async uploadFile(endpoint, file, onProgress, params = {}) {
    const url = this.buildUrl(endpoint, params);

    try {
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

// Initialize API Service
const apiService = new APIService();

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
        showLoading: true
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

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    APIService,
    apiService,
    API_CONFIG,
    loginUser,
    getUserPolicies,
    uploadClaimDocument,
    downloadPaymentReceipt,
    logoutUser
  };
}
