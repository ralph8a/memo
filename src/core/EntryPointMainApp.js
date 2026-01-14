// Main Application Entry Point
// Import CSS in explicit order - webpack will inline in this exact sequence
import '../../styles/acrylic.css';
import '../../styles/auth.css';
import '../../styles/notifications.css';
import '../../styles/notification-modal.css'; // NEW: Sistema de notificaciones modal
import '../../styles/pages/home.css';
import '../../styles/pages/services.css';
import '../../styles/pages/quote.css';
import '../../styles/pages/about.css';
import '../../styles/pages/contact.css';
import '../../styles/dashboards.css';
import '../../styles/dashboards/client-dashboard.css';
import '../../styles/dashboards/agent-dashboard.css';
import '../../styles/dashboards/admin-dashboard.css';
import '../../styles/dashboard-components.css';
import '../../styles/chart-modals.css'; // Chart modal styles
import '../../styles/scheduling.css'; // Calendar & scheduling styles
import '../../styles/payments.css'; // NEW: Sistema de pagos
import '../../styles/dashboard-actions.css'; // NEW: Acciones y modales de dashboards
import '../../styles/scroll-modal-fixes.css'; // NEW: Fixes de scroll y modales
import '../../styles/app.css'; // Base styles
import '../../styles/dark-forest.css'; // Theme overrides MUST load last

import { startParticles } from '../modules/particles.js';
import { navigateTo, toggleMobileMenu, toggleFooter, initializeTemplates } from '../modules/simpleRouter.js';
import { login, logout, getRedirectPage } from '../modules/auth.js';
import { showLoading, hideLoading, withLoading } from '../modules/loadingModal.js';
import { showNotification } from '../modules/notifications.js';
import { skipToFinalState, showHomeSection } from '../modules/homeAnimations.js';
import { showNotification as notify } from '../modules/notifications.js';
import { NOTIFICATION_TYPES, PAGES } from '../utils/constants.js';
import { getUser } from './state.js';
import { setPendingQuoteType, notifyQuoteSuccess } from '../modules/quoteFlow.js';
import * as schedulingModule from '../modules/scheduling.js';
import * as contactsModule from '../modules/contactsManager.js';
import { renderAllLogos } from '../utils/logo.js';
import { initScrollCollapse } from '../utils/scrollCollapse.js';
import * as chartModals from '../modules/chartModals.js';

// NEW: Import payment and notification systems
import { NotificationModal } from '../modules/notificationModal.js';
import { PaymentAPI, PaymentScheduleComponent, PaymentNotificationsComponent, ProofReviewComponent } from '../modules/paymentIntegration.js';

// NEW: Import dashboard actions - Sistema completo de acciones
import * as dashboardActions from '../modules/dashboardActions.js';

// API service and dashboard loaders - loaded dynamically when needed
let apiService = null;
let API_CONFIG = null;
let apiAvailable = false;
let loadAgentDashboard = null;
let loadClientDashboard = null;
let loadAdminDashboard = null;
let loadClientDetailsData = null;

// Initialize API and dashboard loaders
(async () => {
  try {
    const apiModule = await import('../api-integration.js');
    apiService = apiModule.apiService;
    API_CONFIG = apiModule.API_CONFIG;
    apiAvailable = true;
  } catch (e) {
    console.warn('API service not available, using stub mode');
  }

  try {
    const dashboardModule = await import('../modules/dashboardLoaders.js');
    loadAgentDashboard = dashboardModule.loadAgentDashboard;
    loadClientDashboard = dashboardModule.loadClientDashboard;
    loadAdminDashboard = dashboardModule.loadAdminDashboard;
    loadClientDetailsData = dashboardModule.loadClientDetails;
  } catch (e) {
    console.warn('Dashboard loaders not available, using stubs');
    loadAgentDashboard = () => {
      const container = document.querySelector('[data-clients-list]');
      if (container) container.innerHTML = '<p class="empty-state">Modo demo - sin datos del backend</p>';
    };
    loadClientDashboard = () => {
      const container = document.querySelector('.policies-list');
      if (container) container.innerHTML = '<p class="empty-state">Modo demo - sin datos del backend</p>';
    };
    loadAdminDashboard = () => {
      console.log('Admin dashboard - stub mode');
    };
    loadClientDetailsData = async () => ({ client: {}, policies: [], claims: [] });
  }
})();

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
  logout: handleLogout,
  toggleTheme,
  // Dashboard actions - NUEVAS ACCIONES CONECTADAS
  ...dashboardActions,
  // Dashboard placeholders (legacy - algunos serán reemplazados por dashboardActions)
  viewPolicy: dashboardActions.viewPolicy,
  makePayment: dashboardActions.makePayment,
  fileClaim: dashboardActions.fileClaim,
  updateInfo: dashboardActions.updateInfo,
  contactAgent: dashboardActions.contactAgent,
  downloadPaymentHistory: dashboardActions.downloadPaymentHistory,
  viewClientDetails: dashboardActions.viewClientDetails,
  createQuote: dashboardActions.createQuote,
  addClient: dashboardActions.addClient,
  scheduleAppointment: dashboardActions.scheduleAppointment,
  openQuoteModal,
  addNewClient: dashboardActions.addClient,
  editClient,
  processQuote,
  submitQuote,
  processRenewal,
  viewReports,
  completeTask,
  viewCommissionDetails,
  showAgentRegistration,
  // Scheduling & Contacts handlers
  viewAgentDirectory,
  handleAgentContact,
  // New dashboard data loaders
  loadAgentDashboard,
  loadClientDashboard,
  loadAdminDashboard,
  refreshDashboard,
  // Chart modals
  openPaymentTrendsModal: chartModals.openPaymentTrendsModal,
  openPolicyHealthModal: chartModals.openPolicyHealthModal,
  closeChartModal: chartModals.closeChartModal
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
window.logout = handleLogout;
window.scheduleAppointment = scheduleAppointment;
window.viewAgentDirectory = viewAgentDirectory;
// Expose notification helper for quick console testing / legacy inline calls
window.showNotification = showNotification;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Form handlers
function handleContactSubmit(e) {
  e.preventDefault();
  notify('Mensaje enviado exitosamente. Te contactaremos pronto.', NOTIFICATION_TYPES.SUCCESS);
  e.target.reset();
}

async function _handleClientLoginAsync(e) {
  const email = e.target[0].value;
  const password = e.target[1].value;

  showLoading('Autenticando cliente', 'Verificando credenciales', true);
  await delay(200);

  const user = await login({ email, password }, 'client');
  if (user) {
    navigateTo('client-dashboard');
    hideLoading(250);
  } else {
    hideLoading(150);
  }
}

function handleClientLogin(e) {
  e.preventDefault();
  _handleClientLoginAsync(e).catch(err => {
    console.error('Client login error:', err);
    hideLoading(150);
  });
  return false;
}

async function _handleAgentLoginAsync(e) {
  const agentId = e.target[0].value;
  const password = e.target[1].value;

  showLoading('Autenticando agente', 'Verificando credenciales', true);
  await delay(200);

  // Check if admin credentials
  if (agentId === 'admin' && password === 'admin123') {
    // Store admin session and redirect to admin page
    localStorage.setItem('krause_admin', JSON.stringify({ name: 'Administrator', loggedAt: Date.now() }));
    // Use a relative URL so it works both locally and under a subpath (e.g. /memo/ on GitHub Pages)
    hideLoading(150);
    window.location.href = 'admin.html';
    return;
  }

  // Normal agent login
  const user = await login({ agentId, password }, 'agent');
  if (user) {
    navigateTo('agent-dashboard');
    hideLoading(250);
  } else {
    hideLoading(150);
  }
}

function handleAgentLogin(e) {
  e.preventDefault();
  _handleAgentLoginAsync(e).catch(err => {
    console.error('Agent login error:', err);
    hideLoading(150);
  });
  return false;
}

function handleLogout() {
  showLoading('Cerrando sesión', 'Limpiando sesión');
  logout();
  try {
    localStorage.removeItem('krause_admin');
  } catch (e) {
    // Non-fatal cleanup
  }
  navigateTo(PAGES.HOME);
  startParticles();
  hideLoading(200);
}

// Dashboard placeholder functions - LEGACY (ahora manejadas por dashboardActions.js)
// Mantenidas solo para compatibilidad temporal

async function refreshDashboard() {
  const user = getUser();
  if (!user) return;

  const isAgent = user.type === 'agent';
  const isAdmin = user.type === 'admin';
  const message = isAdmin
    ? 'Actualizando panel de administración'
    : isAgent
      ? 'Actualizando panel de agente'
      : 'Actualizando panel de cliente';

  document.body.classList.add('skeleton-mode');

  try {
    await withLoading(async () => {
      if (isAdmin && loadAdminDashboard) {
        await loadAdminDashboard();
      } else if (isAgent && loadAgentDashboard) {
        await loadAgentDashboard();
      } else if (!isAgent && loadClientDashboard) {
        await loadClientDashboard();
      }
      await delay(200);
    }, { message, detail: 'Cargando últimos datos', minDelay: 420 });

    notify('Datos actualizados', NOTIFICATION_TYPES.INFO);
  } catch (e) {
    console.warn('Could not refresh dashboard:', e);
    notify('Modo demo - sin conexión al backend', NOTIFICATION_TYPES.INFO);
  } finally {
    document.body.classList.remove('skeleton-mode');
  }
}

async function viewClientDetails(clientId) {
  if (!loadClientDetailsData) {
    notify('Detalles no disponibles en modo demo', NOTIFICATION_TYPES.INFO);
    return;
  }

  try {
    notify('Cargando detalles del cliente...', NOTIFICATION_TYPES.INFO);
    const data = await loadClientDetailsData(clientId);

    if (data) {
      showClientDetailsModal(data);
    }
  } catch (error) {
    notify('Error al cargar detalles del cliente', NOTIFICATION_TYPES.ERROR);
  }
}

function showClientDetailsModal(data) {
  const { client, policies, claims } = data;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${client.first_name} ${client.last_name}</h2>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
      </div>
      <div class="modal-body">
        <div class="client-details-grid">
          <div>
            <h3>Información de Contacto</h3>
            <p><strong>Email:</strong> ${client.email}</p>
            <p><strong>Teléfono:</strong> ${client.phone || 'N/A'}</p>
            <p><strong>Estado:</strong> <span class="badge badge-${client.status === 'active' ? 'success' : 'warning'}">${client.status}</span></p>
          </div>
          <div>
            <h3>Pólizas (${policies.length})</h3>
            ${policies.length > 0 ? policies.map(p => `
              <p>• ${p.policy_type} - ${p.policy_number}</p>
            `).join('') : '<p>Sin pólizas</p>'}
          </div>
          <div>
            <h3>Reclamaciones Recientes (${claims.length})</h3>
            ${claims.length > 0 ? claims.map(c => `
              <p>• #${c.claim_number} - ${c.status}</p>
            `).join('') : '<p>Sin reclamaciones</p>'}
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
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

async function submitQuote(e) {
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

  // Check if API is available
  if (!apiAvailable || !apiService || !API_CONFIG) {
    showLoading('Procesando cotización', 'Calculando cobertura y prima', true);
    await delay(800);
    hideLoading(200);
    notifyQuoteSuccess(label);
    form.reset();
    const hiddenType = form.querySelector('input[name="quoteType"]');
    if (hiddenType) hiddenType.value = quoteType;
    setPendingQuoteType(quoteType);
    return;
  }

  try {
    // Send quote request to API
    showLoading('Enviando cotización', 'Procesando solicitud', true);

    const response = await apiService.request(
      API_CONFIG.ENDPOINTS.REQUEST_QUOTE,
      {
        method: 'POST',
        body: {
          email: data.email,
          firstName: data.fullName?.split(' ')[0] || '',
          lastName: data.fullName?.split(' ').slice(1).join(' ') || '',
          phone: data.phone,
          quoteType: quoteType,
          coverageDetails: data
        }
      },
      { useCache: false }
    );

    if (response.success) {
      hideLoading(200);
      notifyQuoteSuccess(label);
      form.reset();
      const hiddenType = form.querySelector('input[name="quoteType"]');
      if (hiddenType) hiddenType.value = quoteType;
      setPendingQuoteType(quoteType);
    } else {
      hideLoading(150);
    }
  } catch (err) {
    console.error('Quote submission error:', err);
    hideLoading(150);
    notify('Error al enviar cotización. Por favor intenta de nuevo.', NOTIFICATION_TYPES.ERROR);
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

// --- Agent dashboard wiring ---
async function assignClaimToAgent(claimIdOrClient) {
  if (!apiAvailable || !apiService || !API_CONFIG) {
    notify('Siniestro asignado (modo demo)', NOTIFICATION_TYPES.SUCCESS);
    return;
  }

  try {
    notify('Asignando siniestro y notificando...', NOTIFICATION_TYPES.INFO);
    await apiService.request(
      API_CONFIG.ENDPOINTS.ASSIGN_CLAIM,
      {
        method: 'POST',
        params: { id: claimIdOrClient },
        body: {
          assignee: 'auto',
          notifyDomain: '@ksinsurancee.com'
        }
      },
      { useCache: false }
    );

    await apiService.request(
      API_CONFIG.ENDPOINTS.SEND_NOTIFICATION,
      {
        method: 'POST',
        body: {
          toDomain: '@ksinsurancee.com',
          subject: 'Nuevo siniestro asignado',
          message: `Se asignó el siniestro/reclamo ${claimIdOrClient}.`
        }
      },
      { useCache: false }
    );

    notify('Siniestro asignado y notificación enviada.', NOTIFICATION_TYPES.SUCCESS);
  } catch (err) {
    console.error('Assign claim failed', err);
    notify('Error al asignar o notificar el siniestro.', NOTIFICATION_TYPES.ERROR);
  }
}

async function sendQuestionnaire(clientId = '') {
  if (!apiAvailable || !apiService || !API_CONFIG) {
    notify('Cuestionario enviado (modo demo)', NOTIFICATION_TYPES.SUCCESS);
    return;
  }

  try {
    notify('Enviando cuestionario...', NOTIFICATION_TYPES.INFO);
    await apiService.request(
      API_CONFIG.ENDPOINTS.SEND_QUESTIONNAIRE,
      {
        method: 'POST',
        body: { clientId }
      },
      { useCache: false }
    );
    notify('Cuestionario enviado al cliente.', NOTIFICATION_TYPES.SUCCESS);
  } catch (err) {
    console.error('Send questionnaire failed', err);
    notify('No se pudo enviar el cuestionario.', NOTIFICATION_TYPES.ERROR);
  }
}

async function resendQuestionnaire(id) {
  if (!apiAvailable || !apiService || !API_CONFIG) {
    notify('Cuestionario reenviado (modo demo)', NOTIFICATION_TYPES.SUCCESS);
    return;
  }

  try {
    notify('Reenviando cuestionario...', NOTIFICATION_TYPES.INFO);
    await apiService.request(
      API_CONFIG.ENDPOINTS.RESEND_QUESTIONNAIRE,
      {
        method: 'POST',
        params: { id }
      },
      { useCache: false }
    );
    notify('Cuestionario reenviado.', NOTIFICATION_TYPES.SUCCESS);
  } catch (err) {
    console.error('Resend questionnaire failed', err);
    notify('No se pudo reenviar el cuestionario.', NOTIFICATION_TYPES.ERROR);
  }
}

async function completeQuestionnaire(id) {
  if (!apiAvailable || !apiService || !API_CONFIG) {
    notify('Cuestionario completado (modo demo)', NOTIFICATION_TYPES.SUCCESS);
    return;
  }

  try {
    notify('Marcando cuestionario como completado...', NOTIFICATION_TYPES.INFO);
    await apiService.request(
      API_CONFIG.ENDPOINTS.COMPLETE_QUESTIONNAIRE,
      {
        method: 'POST',
        params: { id }
      },
      { useCache: false }
    );
    notify('Cuestionario completado.', NOTIFICATION_TYPES.SUCCESS);
  } catch (err) {
    console.error('Complete questionnaire failed', err);
    notify('No se pudo completar el cuestionario.', NOTIFICATION_TYPES.ERROR);
  }
}

async function reviewQuestionnaire(id) {
  notify(`Abriendo revisión del cuestionario ${id}...`, NOTIFICATION_TYPES.INFO);
}

async function openSupport(type) {
  notify(`Abriendo caso de soporte (${type})...`, NOTIFICATION_TYPES.INFO);

  if (!apiAvailable || !apiService || !API_CONFIG) {
    return;
  }

  try {
    await apiService.request(
      API_CONFIG.ENDPOINTS.SEND_NOTIFICATION,
      {
        method: 'POST',
        body: {
          toDomain: '@ksinsurancee.com',
          subject: `Nuevo caso de soporte (${type})`,
          message: 'Un agente abrió un caso desde el dashboard.'
        }
      },
      { useCache: false }
    );
  } catch (err) {
    console.error('Support notification failed', err);
  }
}

function showAgentRegistration() {
  notify('Contacta al administrador para solicitar acceso como agente', NOTIFICATION_TYPES.INFO);
}

// ========== SCHEDULING HANDLERS ==========
async function scheduleAppointment() {
  const user = getUser();
  if (!user) {
    notify('Debes iniciar sesión para agendar citas', NOTIFICATION_TYPES.INFO);
    return;
  }

  showLoading('Cargando calendario', 'Buscando agentes disponibles', true);
  await delay(300);

  try {
    const availableAgents = contactsModule.getAgents({ status: 'available' });

    if (availableAgents.length === 0) {
      hideLoading(100);
      notify('No hay agentes disponibles en este momento', NOTIFICATION_TYPES.WARNING);
      return;
    }

    hideLoading(150);
    openSchedulingModal(availableAgents);
  } catch (error) {
    console.error('Error loading agents:', error);
    hideLoading(100);
    notify('Error al cargar agentes disponibles', NOTIFICATION_TYPES.ERROR);
  }
}

function openSchedulingModal(agents) {
  const modal = document.createElement('div');
  modal.className = 'booking-modal';
  modal.innerHTML = `
    <div class="booking-modal-content">
      <div class="booking-modal-header">
        <h2>Agendar Cita</h2>
        <button class="booking-modal-close" onclick="this.closest('.booking-modal').remove()">×</button>
      </div>
      <div class="booking-form">
        <div class="booking-form-group">
          <label>Selecciona un agente</label>
          <select id="agentSelect" required>
            <option value="">-- Selecciona un agente --</option>
            ${agents.map(a => `
              <option value="${a.id}">
                ${a.name} (${a.specialties.join(', ')})
              </option>
            `).join('')}
          </select>
        </div>
        <div class="booking-form-group">
          <label>Tipo de Consulta</label>
          <select id="meetingType" required>
            <option value="quote">Solicitar Cotización</option>
            <option value="consultation">Consultoría</option>
            <option value="renewal">Renovación de Póliza</option>
            <option value="support">Soporte Técnico</option>
          </select>
        </div>
        <div class="booking-form-group">
          <label>Fecha Preferida</label>
          <input type="date" id="meetingDate" required min="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="booking-form-group">
          <label>Hora Preferida</label>
          <input type="time" id="meetingTime" required>
        </div>
        <div class="booking-form-group">
          <label>Notas (Opcional)</label>
          <textarea id="meetingNotes" placeholder="Cuéntale al agente sobre tu necesidad..."></textarea>
        </div>
        <button class="meeting-btn meeting-btn-primary" style="width: 100%; padding: 12px;" 
          onclick="confirmSchedulingSubmit('${document.currentScript?.dataset?.modal || 'modal'}')">
          Solicitar Cita
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

async function confirmSchedulingSubmit(modalElement) {
  const agentId = document.getElementById('agentSelect')?.value;
  const meetingType = document.getElementById('meetingType')?.value;
  const meetingDate = document.getElementById('meetingDate')?.value;
  const meetingTime = document.getElementById('meetingTime')?.value;
  const notes = document.getElementById('meetingNotes')?.value || '';

  if (!agentId || !meetingDate || !meetingTime) {
    notify('Por favor completa todos los campos requeridos', NOTIFICATION_TYPES.WARNING);
    return;
  }

  showLoading('Procesando solicitud', 'Solicitando cita con agente', true);

  try {
    const agent = contactsModule.getAgentById(agentId);
    const user = getUser();
    const [hours, minutes] = meetingTime.split(':');
    const startTime = new Date(`${meetingDate}T${meetingTime}:00`);
    const endTime = new Date(startTime.getTime() + 30 * 60000);

    const meeting = await schedulingModule.requestMeeting({
      agentId,
      agentName: agent.name,
      clientId: user.id,
      clientName: user.name,
      clientEmail: user.email,
      startTime,
      endTime,
      type: meetingType,
      notes
    });

    await delay(400);
    hideLoading(150);

    document.querySelector('.booking-modal')?.remove();
    notify(`Solicitud enviada a ${agent.name}. Te notificaremos cuando confirme.`, NOTIFICATION_TYPES.SUCCESS);
  } catch (error) {
    console.error('Scheduling error:', error);
    hideLoading(100);
    notify('Error al agendar la cita: ' + error.message, NOTIFICATION_TYPES.ERROR);
  }
}

async function viewAgentDirectory() {
  showLoading('Cargando directorio', 'Buscando agentes disponibles', true);
  await delay(250);

  try {
    const agents = contactsModule.getAgents();
    hideLoading(100);
    openAgentDirectoryModal(agents);
  } catch (error) {
    console.error('Error loading agents:', error);
    hideLoading(100);
    notify('Error al cargar directorio de agentes', NOTIFICATION_TYPES.ERROR);
  }
}

function openAgentDirectoryModal(agents) {
  const modal = document.createElement('div');
  modal.className = 'booking-modal';
  modal.style.overflowY = 'auto';

  const content = document.createElement('div');
  content.className = 'booking-modal-content';
  content.style.maxHeight = '80vh';
  content.style.overflowY = 'auto';

  content.innerHTML = `
    <div class="booking-modal-header" style="position: sticky; top: 0; background: white; z-index: 10;">
      <h2>Directorio de Agentes</h2>
      <button class="booking-modal-close" onclick="this.closest('.booking-modal').remove()">×</button>
    </div>
    <div class="agents-grid" style="grid-template-columns: 1fr;">
      ${agents.map(agent => `
        <div class="agent-card">
          <div class="agent-avatar">${agent.avatar}</div>
          <div class="agent-info">
            <h3>${agent.name}</h3>
            <p><strong>Email:</strong> ${agent.email}</p>
            <p><strong>Teléfono:</strong> ${agent.phone}</p>
            <p><strong>Experiencia:</strong> ${agent.yearsExperience} años</p>
            <p><strong>Clientes:</strong> ${agent.clientsServed}</p>
          </div>
          <div class="agent-specialties">
            ${agent.specialties.map(s => `<span class="specialty-tag">${s}</span>`).join('')}
          </div>
          <div class="agent-rating">
            <span>⭐ ${agent.satisfaction}/5.0</span>
          </div>
          <div class="agent-status">
            <div class="status-badge">
              <span class="status-dot ${agent.status}"></span>
              ${agent.status === 'available' ? 'Disponible' : agent.status === 'busy' ? 'Ocupado' : 'No disponible'}
            </div>
            <button class="meeting-btn meeting-btn-primary" 
              onclick="handleAgentContact('${agent.id}', '${agent.name}')"
              ${agent.status !== 'available' ? 'disabled' : ''}>
              Contactar
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

function handleAgentContact(agentId, agentName) {
  document.querySelector('.booking-modal')?.remove();
  notify(`Iniciando contacto con ${agentName}...`, NOTIFICATION_TYPES.INFO);
  scheduleAppointment();
}

// ========== END SCHEDULING HANDLERS ==========

// Theme helpers (global toggle separate from any contact-card toggle)
function applyTheme(theme) {
  try {
    const root = document.documentElement;
    const normalized = theme === 'dark-forest-lab' ? 'dark-forest' : theme;

    if (normalized === 'dark-forest') {
      root.setAttribute('data-theme', 'dark-forest');
      localStorage.setItem('krause_theme', 'dark-forest');
    } else if (normalized === 'dark') {
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
  const variant = root.getAttribute('data-theme-variant');
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

  // Apply dark-forest by default (map any old lab value to dark-forest)
  const savedTheme = localStorage.getItem('krause_theme');
  const normalizedSaved = savedTheme === 'dark-forest-lab' ? 'dark-forest' : savedTheme;
  applyTheme(normalizedSaved || 'dark-forest');

  // Render all shared logo slots (navbar, footer, auth, etc.) with consistent sizing/contrast
  renderAllLogos();

  // Keep theme toggle on the header logo (stays consistent even with dynamic renders)
  const headerLogo = document.querySelector('.nav-brand .krause-shield');
  if (headerLogo) {
    headerLogo.addEventListener('click', () => {
      setTimeout(() => {
        if (typeof toggleTheme === 'function') {
          toggleTheme();
          return;
        }
        const root = document.documentElement;
        const current = root.getAttribute('data-theme');
        if (current === 'dark-forest') {
          root.removeAttribute('data-theme');
        } else {
          root.setAttribute('data-theme', 'dark-forest');
        }
      }, 10);
    });
  }

  // If a session exists, offer redirect or logout
  try {
    const existingUser = getUser();
    if (existingUser) {
      showNotification('Tienes una sesión activa. ¿Quieres ir a tu panel o cerrar sesión?', NOTIFICATION_TYPES.INFO, { duration: 0 });
      setTimeout(() => {
        const goToPanel = window.confirm('Sesión activa detectada. ¿Ir a tu panel ahora?');
        if (goToPanel) {
          const target = getRedirectPage(existingUser) || PAGES.HOME;
          navigateTo(target);
          return;
        }
        const shouldLogout = window.confirm('¿Deseas cerrar sesión?');
        if (shouldLogout) {
          handleLogout();
        }
      }, 100);
    }
  } catch (e) {
    console.warn('Session check error', e);
  }

  // Always land on Home (Inicio) first; keep session info for optional redirects later
  navigateTo(PAGES.HOME);

  // Initialize scroll collapse for dashboards (will retry if dashboard not loaded yet)
  initScrollCollapse();

  // Re-initialize scroll collapse whenever page changes
  const originalNavigateTo = window.navigateTo;
  if (originalNavigateTo) {
    window.navigateTo = function (...args) {
      originalNavigateTo.apply(this, args);
      // Reinit scroll collapse after navigation completes
      setTimeout(() => {
        if (args[0] && args[0].includes('dashboard')) {
          initScrollCollapse();
        }
      }, 300);
    };
  }

  console.log('🏛️ Krause Insurance App cargada correctamente (Modular)');

  // Service worker DESACTIVADO durante testing
  // Desregistrar cualquier service worker existente para limpiar caché
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
        console.log('✅ Service Worker desregistrado durante testing');
      }
    });
  }
});
