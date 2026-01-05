// Main Application Entry Point
// Import CSS in explicit order - webpack will inline in this exact sequence
import '../../styles/acrylic.css';
import '../../styles/auth.css';
import '../../styles/notifications.css';
import '../../styles/pages/home.css';
import '../../styles/pages/services.css';
import '../../styles/pages/quote.css';
import '../../styles/pages/about.css';
import '../../styles/pages/contact.css';
import '../../styles/dashboards.css';
import '../../styles/dashboards/client-dashboard.css';
import '../../styles/dashboards/agent-dashboard.css';
import '../../styles/dashboards/admin-dashboard.css';
import '../../styles/app.css'; // Base styles
import '../../styles/dark-forest.css'; // Theme overrides MUST load last

import { startParticles } from '../modules/particles.js';
import { navigateTo, toggleMobileMenu, toggleFooter, initializeTemplates } from '../modules/simpleRouter.js';
import { login, logout, checkAuth, getRedirectPage } from '../modules/auth.js';
import { showNotification } from '../modules/notifications.js';
import { skipToFinalState, showHomeSection } from '../modules/homeAnimations.js';
import { getUser } from './state.js';
import { showNotification as notify } from '../modules/notifications.js';
import { NOTIFICATION_TYPES, PAGES } from '../utils/constants.js';
import { setPendingQuoteType, notifyQuoteSuccess } from '../modules/quoteFlow.js';

// Expose handlers globally for onclick handlers in templates
window.appHandlers = {
  navigateTo,
  toggleMobileMenu,
  toggleFooter,
  skipToFinalState,
  showHomeSection,
  handleClientLogin,
  handleAgentLogin,
  handleContactSubmit,
  logout,
  toggleTheme,
  // Dashboard placeholders
  viewPolicy,
  makePayment,
  fileClaim,
  updateInfo,
  contactAgent,
  downloadPaymentHistory,
  openQuoteModal,
  addNewClient,
  viewClientDetails,
  editClient,
  processQuote,
  createQuote,
  submitQuote,
  processRenewal,
  viewReports,
  completeTask,
  viewCommissionDetails,
  showAgentRegistration
};

// Also expose common helpers as globals for legacy inline onclicks
window.navigateTo = navigateTo;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleFooter = toggleFooter;
window.handleContactSubmit = handleContactSubmit;
window.handleClientLogin = handleClientLogin;
window.handleAgentLogin = handleAgentLogin;
window.contactAgent = contactAgent;
window.toggleTheme = toggleTheme;
window.submitQuote = submitQuote;
// Expose notification helper for quick console testing / legacy inline calls
window.showNotification = showNotification;

// Form handlers
function handleContactSubmit(e) {
  e.preventDefault();
  notify('Mensaje enviado exitosamente. Te contactaremos pronto.', NOTIFICATION_TYPES.SUCCESS);
  e.target.reset();
}

function handleClientLogin(e) {
  e.preventDefault();
  const email = e.target[0].value;
  const password = e.target[1].value;

  const user = login({ email, password }, 'client');
  if (user) {
    navigateTo('client-dashboard');
  }
}

function handleAgentLogin(e) {
  e.preventDefault();
  const agentId = e.target[0].value;
  const password = e.target[1].value;

  // Check if admin credentials
  if (agentId === 'admin' && password === 'admin123') {
    // Store admin session and redirect to admin page
    localStorage.setItem('krause_admin', JSON.stringify({ name: 'Administrator', loggedAt: Date.now() }));
    // Use a relative URL so it works both locally and under a subpath (e.g. /memo/ on GitHub Pages)
    window.location.href = 'admin.html';
    return;
  }

  // Normal agent login
  const user = login({ agentId, password }, 'agent');
  if (user) {
    navigateTo('agent-dashboard');
  }
}

// Dashboard placeholder functions
function viewPolicy(policyId) {
  notify(`Mostrando detalles de póliza ${policyId}`, NOTIFICATION_TYPES.INFO);
}

function makePayment() {
  notify('Redirigiendo a pasarela de pago...', NOTIFICATION_TYPES.INFO);
}

function fileClaim() {
  notify('Abriendo formulario de siniestros...', NOTIFICATION_TYPES.INFO);
}

function updateInfo() {
  notify('Abriendo formulario de actualización...', NOTIFICATION_TYPES.INFO);
}

function contactAgent() {
  // Allow navigation to contact page when triggered from an agent action
  window.__allowContact = true;
  notify('Abriendo chat con agente...', NOTIFICATION_TYPES.INFO);
  navigateTo('contact');
  // Clear temporary flag shortly after navigation
  setTimeout(() => { window.__allowContact = false; }, 500);
}

function downloadPaymentHistory() {
  notify('Descargando historial...', NOTIFICATION_TYPES.INFO);
}

function openQuoteModal(type) {
  const normalized = (type || 'auto').toLowerCase();
  setPendingQuoteType(normalized);
  navigateTo(PAGES.QUOTE);
  notify(`Preparando formulario para seguro de ${normalized}`, NOTIFICATION_TYPES.INFO);
}

function addNewClient() {
  notify('Abriendo formulario de nuevo cliente...', NOTIFICATION_TYPES.INFO);
}

function viewClientDetails(clientId) {
  notify(`Mostrando detalles del cliente ${clientId}`, NOTIFICATION_TYPES.INFO);
}

function editClient(clientId) {
  notify(`Editando cliente ${clientId}`, NOTIFICATION_TYPES.INFO);
}

function processQuote(quoteId) {
  notify(`Procesando cotización ${quoteId}`, NOTIFICATION_TYPES.INFO);
}

function createQuote() {
  navigateTo(PAGES.QUOTE);
  notify('Creando nueva cotización...', NOTIFICATION_TYPES.INFO);
}

function submitQuote(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  const quoteType = (data.quoteType || form.dataset.quoteType || 'auto').toLowerCase();
  const labelMap = {
    auto: 'Seguro de Auto',
    hogar: 'Seguro de Hogar',
    vida: 'Seguro de Vida',
    salud: 'Gastos Médicos',
    viaje: 'Seguro de Viaje',
    comercial: 'Seguro Comercial'
  };

  const label = labelMap[quoteType] || 'Seguro';
  notifyQuoteSuccess(label);

  try {
    form.reset();
    const hiddenType = form.querySelector('input[name="quoteType"]');
    if (hiddenType) hiddenType.value = quoteType;
    setPendingQuoteType(quoteType);
  } catch (err) {
    console.warn('Quote reset error', err);
  }
}

function processRenewal() {
  notify('Abriendo renovaciones pendientes...', NOTIFICATION_TYPES.INFO);
}

function viewReports() {
  notify('Generando reportes...', NOTIFICATION_TYPES.INFO);
}

function completeTask(taskId) {
  notify('Tarea completada', NOTIFICATION_TYPES.SUCCESS);
}

function viewCommissionDetails() {
  notify('Mostrando detalle de comisiones...', NOTIFICATION_TYPES.INFO);
}

function showAgentRegistration() {
  notify('Contacta al administrador para solicitar acceso como agente', NOTIFICATION_TYPES.INFO);
}

// Theme helpers (global toggle separate from any contact-card toggle)
function applyTheme(theme) {
  try {
    const root = document.documentElement;
    if (theme === 'dark-forest') {
      root.setAttribute('data-theme', 'dark-forest');
      localStorage.setItem('krause_theme', 'dark-forest');
    } else if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('krause_theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.removeItem('krause_theme');
    }
  } catch (e) {
    console.warn('applyTheme error', e);
  }
}

function toggleTheme() {
  const root = document.documentElement;
  const current = root.getAttribute('data-theme');
  // Toggle the 'dark-forest' theme specifically (secondary theme requested)
  if (current === 'dark-forest') {
    applyTheme('light');
  } else {
    applyTheme('dark-forest');
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // If a service worker was registered in a previous session, it can keep serving stale HTML/CSS.
  // Since SW registration is intentionally disabled during testing, proactively unregister it on localhost.
  try {
    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (isLocalhost && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then(regs => Promise.all(regs.map(r => r.unregister())))
        .catch(() => undefined);
    }
  } catch (e) {
    // Non-fatal
  }

  // Apply light theme by default (restore from localStorage if saved)
  const savedTheme = localStorage.getItem('krause_theme');
  applyTheme(savedTheme || 'light');

  // Check authentication and navigate (this will start particles)
  if (checkAuth()) {
    const user = getUser();
    const redirectPage = getRedirectPage(user);
    navigateTo(redirectPage);
  } else {
    navigateTo('home');
  }

  console.log('🏛️ Krause Insurance App cargada correctamente (Modular)');
  // Service worker disabled during testing
  // if ('serviceWorker' in navigator) {
  //   window.addEventListener('load', () => {
  //     navigator.serviceWorker.register('/service-worker.js')
  //       .then(reg => console.log('ServiceWorker registered with scope:', reg.scope))
  //       .catch(err => console.warn('ServiceWorker registration failed:', err));
  //   });
  // }
});
