// Authentication Module
import { getUser, setUser, clearState } from '../core/state.js';
import { DEMO_CREDENTIALS, PAGES, NOTIFICATION_TYPES } from '../utils/constants.js';
import { showNotification } from './notifications.js';

export function checkAuth() {
  return getUser() !== null;
}

export function login(credentials, type = 'client') {
  const user = type === 'client'
    ? validateClientLogin(credentials)
    : validateAgentLogin(credentials);

  if (user) {
    setUser(user);
    showNotification('Inicio de sesión exitoso', NOTIFICATION_TYPES.SUCCESS);
    return user;
  }

  showNotification('Credenciales incorrectas', NOTIFICATION_TYPES.ERROR);
  return null;
}

export function logout() {
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

  return PAGES.HOME;
}
