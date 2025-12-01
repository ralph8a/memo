// Main Application Entry Point
import { startParticles } from '../modules/particles.js';
import { navigateTo, toggleMobileMenu, toggleFooter } from '../modules/router.js';
import { login, logout, checkAuth, getRedirectPage } from '../modules/auth.js';
import { showNotification } from '../modules/notifications.js';
import { skipToFinalState, showHomeSection } from '../modules/homeAnimations.js';
import { getUser } from './state.js';
import { showNotification as notify } from '../modules/notifications.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';

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
  processRenewal,
  viewReports,
  completeTask,
  viewCommissionDetails,
  showAgentRegistration
};

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
    navigateTo('dashboard');
  }
}

function handleAgentLogin(e) {
  e.preventDefault();
  const agentId = e.target[0].value;
  const password = e.target[1].value;
  
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
  notify('Abriendo chat con agente...', NOTIFICATION_TYPES.INFO);
}

function downloadPaymentHistory() {
  notify('Descargando historial...', NOTIFICATION_TYPES.INFO);
}

function openQuoteModal(type) {
  notify(`Abriendo cotización para seguro de ${type}`, NOTIFICATION_TYPES.INFO);
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
  notify('Creando nueva cotización...', NOTIFICATION_TYPES.INFO);
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

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Start particles animation
  startParticles();
  
  // Check authentication and navigate
  if (checkAuth()) {
    const user = getUser();
    const redirectPage = getRedirectPage(user);
    navigateTo(redirectPage);
  } else {
    navigateTo('home');
  }
  
  console.log('🏛️ Krause Insurance App cargada correctamente (Modular)');
});
