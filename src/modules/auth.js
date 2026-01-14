// Authentication Module
import { getUser, setUser, clearState } from '../core/state.js';
import { DEMO_CREDENTIALS, PAGES, NOTIFICATION_TYPES } from '../utils/constants.js';
import { showNotification } from './notifications.js';

export function checkAuth() {
  // Check if user exists in state or has valid token
  const user = getUser();
  const token = localStorage.getItem('auth_token');
  return user !== null && token !== null;
}

export async function login(credentials, type = 'client') {
  try {
    // Import apiService dynamically
    const apiModule = await import('../api-integration.js');
    const apiService = apiModule.apiService;

    if (!apiService) {
      throw new Error('API service not available');
    }

    // Try real API first
    const email = credentials.email || credentials.agentId;
    const password = credentials.password;

    const result = await apiModule.loginUser(email, password);

    if (result && result.token) {
      // Store user from API
      const user = {
        ...result.user,
        name: `${result.user.first_name} ${result.user.last_name}`,
        type: result.user.user_type,
        email: result.user.email
      };

      setUser(user);
      localStorage.setItem('auth_token', result.token);
      showNotification('Inicio de sesión exitoso', NOTIFICATION_TYPES.SUCCESS);
      return user;
    }
  } catch (error) {
    console.warn('API login failed, trying demo credentials:', error);
  }

  // Fallback to demo credentials for development
  const user = type === 'client'
    ? validateClientLogin(credentials)
    : validateAgentLogin(credentials);

  if (user) {
    setUser(user);
    showNotification('Inicio de sesión exitoso (modo demo)', NOTIFICATION_TYPES.SUCCESS);
    return user;
  }

  showNotification('Credenciales incorrectas', NOTIFICATION_TYPES.ERROR);
  return null;
}

export function logout() {
  // Clear API token
  localStorage.removeItem('auth_token');

  // Import and call API logout if available
  import('../api-integration.js').then(({ logoutUser }) => {
    logoutUser();
  }).catch(() => { });

  clearState();
  showNotification('Sesión cerrada exitosamente', NOTIFICATION_TYPES.SUCCESS);
}

function validateClientLogin({ email, password }) {
  if (email === DEMO_CREDENTIALS.CLIENT.email &&
    password === DEMO_CREDENTIALS.CLIENT.password) {
    return {
      name: 'Juan Cliente',
      type: 'client',
      email
    };
  }
  return null;
}

function validateAgentLogin({ agentId, password }) {
  if (agentId === DEMO_CREDENTIALS.AGENT.id &&
    password === DEMO_CREDENTIALS.AGENT.password) {
    return {
      name: 'Guillermo Krause',
      type: 'agent',
      id: agentId
    };
  }
  return null;
}

export function getRedirectPage(user) {
  if (!user) return PAGES.HOME;

  if (user.type === 'client') return PAGES.CLIENT_DASHBOARD;
  if (user.type === 'agent') return PAGES.AGENT_DASHBOARD;
  if (user.type === 'admin') return PAGES.ADMIN_DASHBOARD;

  return PAGES.HOME;
}

