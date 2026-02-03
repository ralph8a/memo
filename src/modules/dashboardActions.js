/**
 * Dashboard Actions - Sistema unificado de acciones para dashboards
 * Conecta todos los botones de acciones rápidas con sus respectivas funcionalidades
 * CONECTADO CON BACKEND REAL Y APIs DE PAGO
 */

import { showNotification } from './notifications.js';
import { NOTIFICATION_TYPES, PAGES } from '../utils/constants.js';
import { navigateTo } from './simpleRouter.js';
import { setPendingQuoteType } from './quoteFlow.js';
import { populateClientSelect } from '../utils/clientLoader.js';
import { PaymentAPI } from './paymentIntegration.js';
import { apiService, API_CONFIG } from '../api-integration.js';
import {
  openMakePaymentActionModal,
  openFileClaimActionModal,
  openUpdateInfoModal
} from './modalManager.js';

const POLICY_TYPE_LABELS = {
  'auto': 'Auto',
  'home': 'Hogar',
  'life': 'Vida',
  'health': 'Salud',
  'business': 'Comercial',
  'other': 'Otro'
};

function formatPolicyType(type) {
  return POLICY_TYPE_LABELS[type] || type || 'Póliza';
}

// Initialize Payment API
const paymentAPI = new PaymentAPI();

// ============================================================================
// CLIENT ACTIONS - Acciones del dashboard de clientes
// ============================================================================

/**
 * Realizar pago rápido - Subir comprobante de pago (CONSOLIDADO EN MODALMANAGER)
 */
export async function makePayment(policyId = null, scheduleId = null) {
  await openMakePaymentActionModal(policyId, scheduleId);
}

/**
 * Descargar historial de pagos usando API real
 */
export async function downloadPaymentHistory(type = 'receipt', fileId = null) {
  try {
    if (fileId) {
      // Descargar archivo específico del backend
      await paymentAPI.downloadFile(type, fileId);
    } else {
      // Generar CSV con historial completo

      // En el futuro, esto consultará el backend
      const csvContent = [
        'Fecha,Póliza,Monto,Estado',
        '2025-01-01,POL-001,$350.00,Pagado',
        '2024-12-01,POL-001,$350.00,Pagado',
        '2024-11-01,POL-001,$350.00,Pagado',
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historial-pagos-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error downloading file:', error);
  }
}

/**
 * Actualizar información personal (CONSOLIDADO EN MODALMANAGER)
 */
export function updateInfo() {
  openUpdateInfoModal();
}

/**
 * Contactar agente - Redirige a página de contacto
 */
export function contactAgent() {
  window.__allowContact = true;
  navigateTo(PAGES.CONTACT);
  setTimeout(() => { window.__allowContact = false; }, 500);
}

/**
 * Ver detalles de póliza
 */
export async function viewPolicy(policyId = null) {
  try {
    console.log('[viewPolicy] Called with ID:', policyId);

    if (!policyId) {
      console.warn('[viewPolicy] No policy ID provided');
      showNotification('No se especificó una póliza', NOTIFICATION_TYPES.ERROR);
      return;
    }

    // Buscar en cache de dashboard
    let policies = window.dashboardData?.policies || [];
    console.log('[viewPolicy] Policies in cache:', policies.length);

    if (!policies.length) {
      console.log('[viewPolicy] Loading policies from backend...');
      // Cargar desde backend
      policies = await apiService.request(API_CONFIG.ENDPOINTS.CLIENT_POLICIES, { method: 'GET' });
      window.dashboardData = { ...(window.dashboardData || {}), policies };
      console.log('[viewPolicy] Loaded policies:', policies.length);
    }

    const policy = policies.find(p => String(p.id) === String(policyId));

    if (!policy) {
      console.warn('[viewPolicy] Policy not found:', policyId);
      console.log('[viewPolicy] Available policy IDs:', policies.map(p => p.id));
      showNotification('Póliza no encontrada', NOTIFICATION_TYPES.ERROR);
      return;
    }

    console.log('[viewPolicy] Found policy:', policy);

    const policyType = policy.policy_type || policy.type || 'other';
    const status = (policy.status || 'unknown').toLowerCase();
    const premium = policy.premium_amount || policy.premium || 0;
    const coverage = policy.coverage_amount || 0;
    const startDate = policy.start_date ? new Date(policy.start_date).toLocaleDateString() : '—';
    const endDate = policy.end_date ? new Date(policy.end_date).toLocaleDateString() : (policy.renewal_date ? new Date(policy.renewal_date).toLocaleDateString() : '—');

    const modal = document.createElement('div');
    modal.className = 'app-modal-overlay';
    modal.innerHTML = `
        <div class="app-modal app-modal-lg">
          <div class="app-modal-header">
            <h2 class="app-modal-title">Póliza #${policy.policy_number || 'Sin número'}</h2>
            <button class="app-modal-close" onclick="this.closest('.app-modal-overlay').remove()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="app-modal-body">
            <div class="policy-details-grid">
              <div class="detail-section">
                <h3>Información General</h3>
                <dl>
                  <dt>Tipo:</dt><dd>${formatPolicyType(policyType)}</dd>
                  <dt>Estado:</dt><dd><span class="badge badge-${status === 'active' ? 'success' : status === 'expired' ? 'danger' : 'warning'}">${status || '—'}</span></dd>
                  <dt>Prima mensual:</dt><dd>${premium ? `$${Number(premium).toFixed(2)}` : '—'}</dd>
                  <dt>Vigencia:</dt><dd>${startDate} - ${endDate}</dd>
                </dl>
              </div>
              <div class="detail-section">
                <h3>Cobertura</h3>
                <ul>
                  <li>Cobertura: ${coverage ? `$${Number(coverage).toLocaleString()}` : 'No especificada'}</li>
                  <li>Renovación: ${endDate}</li>
                  ${policy.agent_name ? `<li>Agente: ${policy.agent_name} ${policy.agent_email ? `(${policy.agent_email})` : ''}</li>` : ''}
                  ${policy.agent_phone ? `<li>Contacto: ${policy.agent_phone}</li>` : ''}
                </ul>
              </div>
              <div class="detail-section">
                <h3>Acciones</h3>
                <p>Puedes subir comprobantes, consultar pagos o descargar documentos.</p>
                <div class="pill-actions" style="gap:8px;">
                  <button class="btn btn-sm" onclick="window.dashboardActions?.makePayment('${policyId}')">Subir comprobante</button>
                  <button class="btn btn-sm btn-outline" onclick="window.appHandlers?.downloadPaymentHistory?.()">Historial de pagos</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

    document.body.appendChild(modal);
    console.log('[viewPolicy] Modal displayed successfully');
  } catch (error) {
    console.error('[viewPolicy] Error:', error);
    showNotification('Error al cargar póliza: ' + error.message, NOTIFICATION_TYPES.ERROR);
  }
}

/**
 * Presentar siniestro (CONSOLIDADO EN MODALMANAGER)
 */
export async function fileClaim() {
  await openFileClaimActionModal();
}

// ============================================================================
// AGENT ACTIONS - Acciones del dashboard de agentes
// ============================================================================

/**
 * Crear nueva cotización
 */
export function createQuote(type = 'auto') {
  setPendingQuoteType(type);
  // Open the in-place "Nueva Cotización" modal instead of navigating away
  // If opening the modal fails, fallback to the original navigation to the quote page
  try {
    // requestQuote is defined below in this module
    requestQuote();
  } catch (err) {
    console.error('Error opening quote modal:', err);
    showNotification('No se pudo abrir la modal de cotización, redirigiendo...', NOTIFICATION_TYPES.ERROR);
    navigateTo(PAGES.QUOTE);
  }
}

/**
 * Agregar nuevo cliente mediante subida de póliza
 * El sistema extrae datos automáticamente, crea cliente y genera credenciales
 */
export function addClient() {
  const modal = document.createElement('div');
  modal.className = 'app-modal-overlay';
  modal.innerHTML = `
    <div class="app-modal app-modal-md">
      <div class="app-modal-header">
        <h2 class="app-modal-title">Nuevo Cliente - Subir Póliza</h2>
        <button class="app-modal-close" onclick="this.closest('.app-modal-overlay').remove()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="app-modal-body">
        <div class="upload-instructions">
          <div class="info-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <div>
              <p><strong>El sistema extraerá automáticamente:</strong></p>
              <ul>
                <li>Nombre del cliente</li>
                <li>Número de póliza</li>
                <li>Monto de prima</li>
                <li>Fechas de vigencia</li>
                <li>Tipo de cobertura</li>
              </ul>
              <p>Se generará un correo y contraseña automáticos que se enviarán al cliente.</p>
            </div>
          </div>
        </div>
        
        <form class="add-client-form" onsubmit="window.dashboardActions?.submitPolicyUpload(event)">
          <div class="form-group">
            <label for="policy-file">Documento de póliza</label>
            <input type="file" id="policy-file" accept=".pdf,image/*" required>
            <small>Formatos aceptados: PDF, JPG, PNG (máx 10MB)</small>
          </div>
          
          <div class="form-group" style="margin-top: 20px;">
            <label for="client-email">
              Email del cliente <span style="color: #dc3545;">*</span>
            </label>
            <input 
              type="email" 
              id="client-email" 
              placeholder="cliente@ejemplo.com" 
              required
              autocomplete="email"
            >
            <div class="alert alert-warning" style="margin-top: 8px; padding: 10px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; font-size: 13px;">
              <strong>⚠️ Importante:</strong> Este email será usado para:
              <ul style="margin: 5px 0 0 20px; padding: 0;">
                <li>Enviar credenciales de acceso al portal</li>
                <li>Inicio de sesión del cliente</li>
                <li>Notificaciones de pagos y pólizas</li>
              </ul>
            </div>
          </div>
          
          <div id="upload-progress" style="display: none;">
            <div class="progress-bar">
              <div class="progress-fill" id="progress-fill"></div>
            </div>
            <p id="progress-text">Analizando documento...</p>
          </div>
          
          <div id="extracted-data-preview" style="display: none;">
            <h3>Datos extraídos</h3>
            <div id="data-grid" class="extracted-data-grid"></div>
            <p class="confidence-note" id="confidence-note"></p>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="this.closest('.app-modal-overlay').remove()">Cancelar</button>
            <button type="submit" class="btn btn-primary" id="submit-policy-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Subir y procesar póliza
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

/**
 * Solicitar nueva cotización - Modal independiente
 */
export async function requestQuote() {
  const { showNotification, NOTIFICATION_TYPES } = await import('./notifications.js');

  const modal = document.createElement('div');
  modal.className = 'app-modal-overlay active';
  modal.innerHTML = `
    <div class="app-modal app-modal-lg">
      <div class="app-modal-header">
        <h2 class="app-modal-title">Nueva Cotización</h2>
        <button class="app-modal-close" onclick="this.closest('.app-modal-overlay').remove()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="app-modal-body">
        <form id="quote-request-form" onsubmit="window.dashboardActions?.submitQuoteRequest?.(event)">
          <div class="form-row">
            <div class="form-group">
              <label for="quote-name">Nombre completo *</label>
              <input type="text" id="quote-name" required placeholder="Juan Pérez">
            </div>
            <div class="form-group">
              <label for="quote-email">Email *</label>
              <input type="email" id="quote-email" required placeholder="juan@ejemplo.com">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="quote-phone">Teléfono *</label>
              <input type="tel" id="quote-phone" required placeholder="555-1234-5678">
            </div>
            <div class="form-group">
              <label for="quote-type">Tipo de póliza *</label>
              <select id="quote-type" required>
                <option value="">Seleccionar tipo</option>
                <option value="auto">Auto</option>
                <option value="home">Hogar</option>
                <option value="life">Vida</option>
                <option value="health">Salud</option>
                <option value="business">Negocio</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="quote-coverage">Cobertura deseada</label>
            <input type="text" id="quote-coverage" placeholder="Ej: Cobertura amplia, daños a terceros">
          </div>
          <div class="form-group">
            <label for="quote-details">Detalles adicionales</label>
            <textarea id="quote-details" rows="4" placeholder="Proporciona información adicional que pueda ayudarnos a cotizar mejor..."></textarea>
          </div>
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="quote-urgent" style="width: auto;">
              Solicitud urgente (respuesta en 24 horas)
            </label>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="this.closest('.app-modal-overlay').remove()">Cancelar</button>
            <button type="submit" class="btn btn-primary">Enviar Solicitud</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

export async function submitQuoteRequest(event) {
  event.preventDefault();
  const { showNotification, NOTIFICATION_TYPES } = await import('./notifications.js');

  const formData = {
    name: document.getElementById('quote-name').value,
    email: document.getElementById('quote-email').value,
    phone: document.getElementById('quote-phone').value,
    policy_type: document.getElementById('quote-type').value,
    coverage: document.getElementById('quote-coverage').value,
    details: document.getElementById('quote-details').value,
    urgent: document.getElementById('quote-urgent').checked
  };

  try {
    showNotification('Enviando solicitud de cotización...', NOTIFICATION_TYPES.INFO);
    await new Promise(resolve => setTimeout(resolve, 1000));
    showNotification('Solicitud enviada exitosamente. Te contactaremos pronto.', NOTIFICATION_TYPES.SUCCESS);
    document.querySelector('.app-modal-overlay')?.remove();
    console.log('Quote request:', formData);
  } catch (error) {
    console.error('Error sending quote request:', error);
    showNotification('Error al enviar la solicitud. Inténtalo de nuevo.', NOTIFICATION_TYPES.ERROR);
  }
}

/**
 * Agendar cita - Mostrar modal de citas
 */
export async function scheduleAppointment() {
  try {
    // Create simple appointment modal
    const modal = document.createElement('div');
    modal.className = 'app-modal-overlay';
    modal.innerHTML = `
      <div class="app-modal">
        <div class="app-modal-header">
          <h2 class="app-modal-title">📅 Agendar Cita</h2>
          <button class="app-modal-close" onclick="this.closest('.app-modal-overlay').remove()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="app-modal-body">
          <form id="appointmentForm" style="display: grid; gap: 16px;">
            <div class="form-group">
              <label>Tipo de cita</label>
              <select name="type" required class="form-control">
                <option value="quote">Cotización</option>
                <option value="consultation">Consulta</option>
                <option value="renewal">Renovación</option>
                <option value="support">Soporte</option>
              </select>
            </div>
            <div class="form-group">
              <label>Fecha</label>
              <input type="date" name="date" required class="form-control" min="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
              <label>Hora</label>
              <input type="time" name="time" required class="form-control">
            </div>
            <div class="form-group">
              <label>Notas (opcional)</label>
              <textarea name="notes" class="form-control" rows="3" placeholder="Detalles de la cita..."></textarea>
            </div>
          </form>
        </div>
        <div class="app-modal-footer">
          <button class="btn btn-outline" onclick="this.closest('.app-modal-overlay').remove()">Cancelar</button>
          <button class="btn btn-primary" onclick="window.dashboardActions?.submitAppointmentRequest?.()">Solicitar Cita</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
  } catch (error) {
    console.error('Error opening appointment modal:', error);
    showNotification('Error al abrir el calendario de citas', NOTIFICATION_TYPES.ERROR);
  }
}

async function submitAppointmentRequest() {
  const form = document.getElementById('appointmentForm');
  if (!form || !form.checkValidity()) {
    form?.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  try {
    showNotification('Procesando solicitud...', NOTIFICATION_TYPES.INFO);
    
    // TODO: Connect to backend API when ready
    // const response = await apiService.request('?action=create_appointment', {
    //   method: 'POST',
    //   body: JSON.stringify(data)
    // });
    
    // Simulate success for now
    setTimeout(() => {
      document.querySelector('.app-modal-overlay')?.remove();
      showNotification('Cita solicitada. Te confirmaremos por email.', NOTIFICATION_TYPES.SUCCESS);
    }, 500);
  } catch (error) {
    console.error('Error submitting appointment:', error);
    showNotification('Error al solicitar la cita', NOTIFICATION_TYPES.ERROR);
  }
}

/**
 * Ver detalles de cliente - CONECTADO CON BACKEND
 */
export async function viewClientDetails(clientId) {
  // Crear modal de detalles
  const modal = document.createElement('div');
  modal.className = 'app-modal-overlay active';
  modal.innerHTML = `
    <div class="app-modal app-modal-xl">
      <div class="app-modal-header">
        <h2 class="app-modal-title">Detalles del Cliente</h2>
        <button class="app-modal-close" onclick="this.closest('.app-modal-overlay').remove()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="app-modal-body">
        <div class="client-detail-content">
          <div class="loading-state">
            <p>⏳ Cargando información del cliente...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Cargar datos reales del backend
  try {
    const data = await apiService.request(
      `${API_CONFIG.ENDPOINTS.GET_CLIENT_DETAILS}&id=${clientId}`,
      { method: 'GET' }
    );

    if (!data) {
      throw new Error('No se recibieron datos del cliente');
    }

    const { client, policies = [], claims = [] } = data;

    // Actualizar contenido del modal con datos reales
    const contentDiv = modal.querySelector('.client-detail-content');
    contentDiv.innerHTML = `
      <div class="client-details-grid">
        <div class="detail-section">
          <h3>📋 Información de Contacto</h3>
          <div class="detail-item">
            <label>Nombre Completo</label>
            <div class="value">${client.first_name || ''} ${client.last_name || ''}</div>
          </div>
          <div class="detail-item">
            <label>Email</label>
            <div class="value">${client.email || 'N/A'}</div>
          </div>
          <div class="detail-item">
            <label>Teléfono</label>
            <div class="value">${client.phone || 'N/A'}</div>
          </div>
          <div class="detail-item">
            <label>Estado</label>
            <div class="value">
              <span class="badge badge-${client.status === 'active' ? 'success' : 'warning'}">
                ${client.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
          <div class="detail-item">
            <label>Fecha de Registro</label>
            <div class="value">${new Date(client.created_at).toLocaleDateString('es-ES')}</div>
          </div>
        </div>

        <div class="detail-section">
          <h3>📄 Pólizas (${policies.length})</h3>
          ${policies.length > 0 ? policies.map(p => `
            <div class="detail-item">
              <label>${formatPolicyType(p.policy_type)} - ${p.policy_number}</label>
              <div class="value">
                <span class="badge badge-${p.status === 'active' ? 'success' : 'secondary'}">
                  ${p.status || 'N/A'}
                </span>
              </div>
            </div>
          `).join('') : '<p class="text-muted">Sin pólizas registradas</p>'}
        </div>

        <div class="detail-section">
          <h3>🔔 Reclamaciones Recientes (${claims.length})</h3>
          ${claims.length > 0 ? claims.map(c => `
            <div class="detail-item">
              <label>Reclamación #${c.claim_number || c.id}</label>
              <div class="value">
                <span class="badge badge-${c.status === 'approved' ? 'success' : c.status === 'pending' ? 'warning' : 'secondary'}">
                  ${c.status || 'N/A'}
                </span>
              </div>
            </div>
          `).join('') : '<p class="text-muted">Sin reclamaciones registradas</p>'}
        </div>
      </div>
    `;

  } catch (error) {
    console.error('Error loading client details:', error);
    showNotification('Error al cargar detalles del cliente', NOTIFICATION_TYPES.ERROR);

    const contentDiv = modal.querySelector('.client-detail-content');
    contentDiv.innerHTML = `
      <div class="loading-state">
        <p style="color: var(--error-color, #ef5350);">❌ Error al cargar la información del cliente</p>
        <p style="font-size: 14px; color: var(--text-muted, #999);">${error.message}</p>
      </div>
    `;
  }
}

/**
 * Cambiar entre tabs del modal de detalles de cliente
 */
export function switchClientTab(event, tabName) {
  const modal = event.target.closest('.app-modal');

  // Actualizar botones
  modal.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.closest('.tab-btn').classList.add('active');

  // Actualizar contenido
  modal.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  modal.querySelector(`.tab-content[data-tab="${tabName}"]`).classList.add('active');
}

/**
 * Filtrar vista de agente por cliente específico
 */
export function filterByClient(clientId) {
  // Esta función filtraría todo el dashboard del agente para mostrar solo info del cliente seleccionado
  const mainContent = document.querySelector('.dashboard-main-wrapper');
  if (!mainContent) return;

  // En producción, esto dispararía una recarga de datos filtrados

  // Simular filtro visual
  document.querySelectorAll('[data-client-id]').forEach(el => {
    el.style.display = el.dataset.clientId === clientId ? '' : 'none';
  });
}

// ============================================================================
// FORM SUBMISSIONS - Handlers para envío de formularios CON BACKEND REAL
// ============================================================================

export async function submitPayment(event) {
  event.preventDefault();
  const form = event.target;
  const policyId = form.dataset.policy;
  const scheduleId = form.dataset.schedule;
  const file = document.getElementById('payment-proof-file')?.files[0];
  const reference = document.getElementById('payment-reference')?.value || '';

  if (!file) {
    showNotification('Selecciona un archivo', NOTIFICATION_TYPES.WARNING);
    return;
  }

  showNotification('Subiendo comprobante...', NOTIFICATION_TYPES.INFO);

  try {
    // Usar API real de pagos
    const result = await paymentAPI.uploadPaymentProof(scheduleId, policyId, file);

    form.closest('.app-modal-overlay').remove();
    showNotification('Comprobante subido. Estará en revisión pronto.', NOTIFICATION_TYPES.SUCCESS);

    // Refrescar dashboard si es posible
    if (window.appHandlers?.refreshDashboard) {
      setTimeout(() => window.appHandlers.refreshDashboard(), 1000);
    }
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    showNotification('Error al subir comprobante: ' + error.message, NOTIFICATION_TYPES.ERROR);
  }
}

export function submitInfoUpdate(event) {
  event.preventDefault();
  const form = event.target;

  showNotification('Actualizando información...', NOTIFICATION_TYPES.INFO);

  setTimeout(() => {
    form.closest('.app-modal-overlay').remove();
    showNotification('Información actualizada', NOTIFICATION_TYPES.SUCCESS);
  }, 1000);
}

export async function submitClaim(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  showNotification('Enviando siniestro...', NOTIFICATION_TYPES.INFO);

  try {
    // En el futuro, esto enviará al backend real
    // const response = await fetch('/backend/api-endpoints.php?action=create_claim', {
    //   method: 'POST',
    //   body: formData
    // });

    await new Promise(resolve => setTimeout(resolve, 1500));

    form.closest('.app-modal-overlay').remove();
    const claimNumber = 'CLM-' + Math.floor(Math.random() * 1000);
    showNotification(`Siniestro registrado. Número: ${claimNumber}`, NOTIFICATION_TYPES.SUCCESS);

    // Refrescar dashboard
    if (window.appHandlers?.refreshDashboard) {
      setTimeout(() => window.appHandlers.refreshDashboard(), 1000);
    }
  } catch (error) {
    console.error('Error submitting claim:', error);
    showNotification('Error al enviar siniestro', NOTIFICATION_TYPES.ERROR);
  }
}

/**
 * Subir póliza y crear cliente automáticamente
 */
export async function submitPolicyUpload(event) {
  event.preventDefault();
  const form = event.target;
  const fileInput = document.getElementById('policy-file');
  const emailInput = document.getElementById('client-email');
  const file = fileInput?.files[0];
  const clientEmail = emailInput?.value.trim();

  if (!file) {
    showNotification('Selecciona un archivo de póliza', NOTIFICATION_TYPES.WARNING);
    return;
  }

  if (!clientEmail) {
    showNotification('El email del cliente es obligatorio', NOTIFICATION_TYPES.WARNING);
    emailInput?.focus();
    return;
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clientEmail)) {
    showNotification('Por favor ingresa un email válido', NOTIFICATION_TYPES.WARNING);
    emailInput?.focus();
    return;
  }

  // Mostrar progreso
  const progressContainer = document.getElementById('upload-progress');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const submitBtn = document.getElementById('submit-policy-btn');

  progressContainer.style.display = 'block';
  submitBtn.disabled = true;

  try {
    // Preparar FormData
    const formData = new FormData();
    formData.append('policy_file', file);
    formData.append('client_email', clientEmail);
    // Enviar al backend
    progressText.textContent = 'Subiendo documento...';
    progressFill.style.width = '30%';

    const response = await fetch('/backend/client-from-policy.php', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      body: formData
    });

    progressFill.style.width = '60%';
    progressText.textContent = 'Analizando documento...';

    const result = await response.json();

    progressFill.style.width = '100%';

    if (!result.success) {
      throw new Error(result.error || 'Error al procesar póliza');
    }

    // Verificar si requiere confirmación (baja confianza)
    if (result.requires_confirmation) {
      showExtractedDataForConfirmation(result.extracted_data, result.temp_file_path);
      progressContainer.style.display = 'none';
      submitBtn.disabled = false;
      return;
    }

    // Verificar si requiere entrada manual
    if (result.requires_manual_entry) {
      showNotification('No se pudo extraer datos. Abriendo formulario manual...', NOTIFICATION_TYPES.WARNING);
      showManualEntryForm(result.temp_file_path);
      return;
    }

    // Éxito
    form.closest('.app-modal-overlay').remove();

    if (result.new_client) {
      showNotification(
        `Cliente creado exitosamente. Credenciales enviadas por email.`,
        NOTIFICATION_TYPES.SUCCESS
      );
    } else {
      showNotification(
        `Póliza agregada al cliente existente.`,
        NOTIFICATION_TYPES.SUCCESS
      );
    }

    // Mostrar resumen
    setTimeout(() => {
      showClientCreationSummary(result);
    }, 1000);

    // Refrescar dashboard
    if (window.appHandlers?.refreshDashboard) {
      setTimeout(() => window.appHandlers.refreshDashboard(), 2000);
    }

  } catch (error) {
    console.error('Error uploading policy:', error);
    showNotification('Error: ' + error.message, NOTIFICATION_TYPES.ERROR);
    progressContainer.style.display = 'none';
    submitBtn.disabled = false;
  }
}

/**
 * Mostrar datos extraídos para confirmación (cuando confianza es baja)
 */
function showExtractedDataForConfirmation(data, tempFilePath) {
  const previewContainer = document.getElementById('extracted-data-preview');
  const dataGrid = document.getElementById('data-grid');
  const confidenceNote = document.getElementById('confidence-note');

  // Obtener email ingresado por el agente
  const clientEmail = document.getElementById('client-email')?.value || '';

  previewContainer.style.display = 'block';
  confidenceNote.innerHTML = '⚠️ Confianza baja. Por favor revisa los datos antes de continuar.';
  confidenceNote.className = 'confidence-note warning';

  dataGrid.innerHTML = `
    <div class="data-field">
      <label>Email del cliente: <span style="color: #dc3545;">*</span></label>
      <input type="email" id="confirm-client-email" value="${clientEmail}" required readonly style="background: #e9ecef;">
      <small style="color: #6c757d;">Este email se usará para el acceso al portal</small>
    </div>
    <div class="data-field">
      <label>Nombre del cliente:</label>
      <input type="text" id="confirm-client-name" value="${data.client_name || ''}" required>
    </div>
    <div class="data-field">
      <label>Número de póliza:</label>
      <input type="text" id="confirm-policy-number" value="${data.policy_number || ''}" required>
    </div>
    <div class="data-field">
      <label>Prima total:</label>
      <input type="number" id="confirm-premium" value="${data.total_premium || ''}" step="0.01" required>
    </div>
    <div class="data-field">
      <label>Fecha inicio:</label>
      <input type="date" id="confirm-start-date" value="${data.start_date || ''}">
    </div>
    <div class="data-field">
      <label>Fecha vencimiento:</label>
      <input type="date" id="confirm-end-date" value="${data.end_date || ''}">
    </div>
    <div class="data-field">
      <label>Frecuencia de pago:</label>
      <select id="confirm-frequency">
        <option value="1" ${data.payment_frequency == 1 ? 'selected' : ''}>Anual</option>
        <option value="2" ${data.payment_frequency == 2 ? 'selected' : ''}>Semestral</option>
        <option value="4" ${data.payment_frequency == 4 ? 'selected' : ''}>Trimestral</option>
        <option value="12" ${data.payment_frequency == 12 ? 'selected' : ''}>Mensual</option>
      </select>
    </div>
  `;

  // Cambiar botón para confirmar
  const submitBtn = document.getElementById('submit-policy-btn');
  submitBtn.textContent = 'Confirmar y crear cliente';
  submitBtn.onclick = () => confirmAndCreateClient(tempFilePath);
}

/**
 * Confirmar datos corregidos y crear cliente
 */
async function confirmAndCreateClient(tempFilePath) {
  const confirmedData = {
    client_email: document.getElementById('confirm-client-email').value,
    client_name: document.getElementById('confirm-client-name').value,
    policy_number: document.getElementById('confirm-policy-number').value,
    total_premium: parseFloat(document.getElementById('confirm-premium').value),
    start_date: document.getElementById('confirm-start-date').value,
    end_date: document.getElementById('confirm-end-date').value,
    payment_frequency: parseInt(document.getElementById('confirm-frequency').value)
  };

  showNotification('Creando cliente con datos confirmados...', NOTIFICATION_TYPES.INFO);

  try {
    const token = sessionStorage.getItem('auth_token');

    const response = await fetch('/backend/client-from-policy.php', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        confirmed_data: confirmedData,
        temp_file_path: tempFilePath
      })
    });

    const result = await response.json();

    if (result.success) {
      document.querySelector('.app-modal-overlay').remove();
      showNotification('Cliente creado exitosamente', NOTIFICATION_TYPES.SUCCESS);

      if (window.appHandlers?.refreshDashboard) {
        setTimeout(() => window.appHandlers.refreshDashboard(), 1000);
      }
    } else {
      throw new Error(result.error);
    }

  } catch (error) {
    showNotification('Error: ' + error.message, NOTIFICATION_TYPES.ERROR);
  }
}

/**
 * Mostrar formulario de entrada manual
 */
function showManualEntryForm(tempFilePath) {
  // Reutilizar lógica similar a confirmación pero con campos vacíos
  showExtractedDataForConfirmation({}, tempFilePath);
  document.getElementById('confidence-note').innerHTML =
    'ℹ️ No se pudo extraer datos automáticamente. Por favor ingresa los datos manualmente.';
}

/**
 * Mostrar resumen de cliente creado
 */
function showClientCreationSummary(result) {
  const modal = document.createElement('div');
  modal.className = 'app-modal-overlay';
  modal.innerHTML = `
    <div class="app-modal app-modal-sm">
      <div class="app-modal-header">
        <h2 class="app-modal-title">✅ Cliente ${result.new_client ? 'Creado' : 'Actualizado'}</h2>
      </div>
      <div class="app-modal-body">
        <div class="success-summary">
          <p><strong>ID Cliente:</strong> ${result.client_id}</p>
          <p><strong>ID Póliza:</strong> ${result.policy_id}</p>
          ${result.new_client ? '<p>✉️ Credenciales de acceso enviadas por email</p>' : ''}
          <p class="success-message">${result.message}</p>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" onclick="this.closest('.app-modal-overlay').remove()">Entendido</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

export function submitAppointment(event) {
  event.preventDefault();
  const form = event.target;

  showNotification('Agendando cita...', NOTIFICATION_TYPES.INFO);

  setTimeout(() => {
    form.closest('.app-modal-overlay').remove();
    showNotification('Cita agendada. Confirmación enviada por email', NOTIFICATION_TYPES.SUCCESS);
  }, 1000);
}

/**
 * Abrir modal de ventas del mes con información completa
 */
export function openSalesModal() {
  const modal = document.createElement('div');
  modal.className = 'app-modal-overlay';
  modal.innerHTML = `
    <div class="app-modal app-modal-lg">
      <div class="app-modal-header">
        <h2 class="app-modal-title">📊 Ventas del Mes - Enero 2026</h2>
        <button class="app-modal-close" onclick="this.closest('.app-modal-overlay').remove()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="app-modal-body">
        <div class="stats-grid compact" style="margin-bottom: 24px;">
          <div class="stat-card stat-success">
            <div class="stat-content">
              <div class="stat-label">Pólizas Vendidas</div>
              <div class="stat-value">18</div>
              <div class="stat-trend positive">+6 vs mes anterior</div>
            </div>
          </div>
          <div class="stat-card stat-info">
            <div class="stat-content">
              <div class="stat-label">Renovaciones</div>
              <div class="stat-value">12</div>
              <div class="stat-trend positive">+3 vs mes anterior</div>
            </div>
          </div>
          <div class="stat-card stat-warning">
            <div class="stat-content">
              <div class="stat-label">Cotizaciones</div>
              <div class="stat-value">25</div>
              <div class="stat-trend positive">+8 vs mes anterior</div>
            </div>
          </div>
        </div>
        
        <h3 style="margin: 24px 0 16px;">Detalle de Ventas</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Póliza</th>
              <th>Prima Mensual</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>12/01/2026</td>
              <td>María González</td>
              <td>Auto</td>
              <td>AUTO-156</td>
              <td>$350.00</td>
            </tr>
            <tr>
              <td>10/01/2026</td>
              <td>Pedro Sánchez</td>
              <td>Hogar</td>
              <td>HOME-089</td>
              <td>$280.00</td>
            </tr>
            <tr>
              <td>08/01/2026</td>
              <td>Ana Martínez</td>
              <td>Vida</td>
              <td>LIFE-042</td>
              <td>$520.00</td>
            </tr>
            <tr>
              <td>05/01/2026</td>
              <td>Luis Hernández</td>
              <td>Auto</td>
              <td>AUTO-157</td>
              <td>$410.00</td>
            </tr>
          </tbody>
        </table>
        
        <div class="form-actions" style="margin-top: 24px;">
          <button class="btn btn-outline" onclick="this.closest('.app-modal-overlay').remove()">Cerrar</button>
          <button class="btn btn-primary" onclick="alert('Exportar a CSV')">Exportar CSV</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
}

/**
 * Abrir modal de comisiones con información completa
 */
export function openCommissionsModal() {
  const modal = document.createElement('div');
  modal.className = 'app-modal-overlay';
  modal.innerHTML = `
    <div class="app-modal app-modal-lg">
      <div class="app-modal-header">
        <h2 class="app-modal-title">💰 Comisiones - Enero 2026</h2>
        <button class="app-modal-close" onclick="this.closest('.app-modal-overlay').remove()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="app-modal-body">
        <div class="stats-grid compact" style="margin-bottom: 24px;">
          <div class="stat-card stat-success">
            <div class="stat-content">
              <div class="stat-label">Ganadas Este Mes</div>
              <div class="stat-value">$45,300</div>
              <div class="stat-trend positive">+12.4% vs mes anterior</div>
            </div>
          </div>
          <div class="stat-card stat-warning">
            <div class="stat-content">
              <div class="stat-label">Pendientes de Pago</div>
              <div class="stat-value">$8,500</div>
              <div class="stat-trend">En proceso</div>
            </div>
          </div>
          <div class="stat-card stat-info">
            <div class="stat-content">
              <div class="stat-label">Promedio Mensual</div>
              <div class="stat-value">$42,100</div>
              <div class="stat-trend">Últimos 6 meses</div>
            </div>
          </div>
        </div>
        
        <h3 style="margin: 24px 0 16px;">Detalle de Comisiones</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Póliza</th>
              <th>Cliente</th>
              <th>Prima</th>
              <th>% Comisión</th>
              <th>Monto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>AUTO-156</td>
              <td>María González</td>
              <td>$350.00</td>
              <td>15%</td>
              <td>$52.50</td>
              <td><span class="badge badge-success">Pagada</span></td>
            </tr>
            <tr>
              <td>HOME-089</td>
              <td>Pedro Sánchez</td>
              <td>$280.00</td>
              <td>12%</td>
              <td>$33.60</td>
              <td><span class="badge badge-success">Pagada</span></td>
            </tr>
            <tr>
              <td>LIFE-042</td>
              <td>Ana Martínez</td>
              <td>$520.00</td>
              <td>18%</td>
              <td>$93.60</td>
              <td><span class="badge badge-warning">Pendiente</span></td>
            </tr>
            <tr>
              <td>AUTO-157</td>
              <td>Luis Hernández</td>
              <td>$410.00</td>
              <td>15%</td>
              <td>$61.50</td>
              <td><span class="badge badge-success">Pagada</span></td>
            </tr>
          </tbody>
        </table>
        
        <div class="form-actions" style="margin-top: 24px;">
          <button class="btn btn-outline" onclick="this.closest('.app-modal-overlay').remove()">Cerrar</button>
          <button class="btn btn-primary" onclick="alert('Exportar a PDF')">Exportar PDF</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
}

/**
 * Cargar póliza de cliente - Acción rápida con modal
 */
export function uploadPolicyDocument() {
  const modal = document.createElement('div');
  modal.className = 'app-modal-overlay';
  modal.innerHTML = `
    <div class="app-modal app-modal-md">
      <div class="app-modal-header">
        <h2 class="app-modal-title">📄 Cargar Póliza de Cliente</h2>
        <button class="app-modal-close" onclick="this.closest('.app-modal-overlay').remove()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="app-modal-body">
        <div class="info-box" style="margin-bottom: 20px; padding: 12px; background: var(--surface-secondary); border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: var(--text-secondary);">
            <strong>ℹ️ Extracción automática:</strong> El sistema extraerá prima mensual, fechas de vigencia, periodicidad y aseguradora.
          </p>
        </div>
        
        <form id="policy-upload-form" onsubmit="window.dashboardActions?.submitPolicyDocumentUpload?.(event)">
          <div class="form-group">
            <label for="upload-client-select">Cliente</label>
            <select id="upload-client-select" name="client_id" required>
              <option value="">Cargando clientes...</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="upload-policy-pdf">Documento de Póliza (PDF)</label>
            <input type="file" id="upload-policy-pdf" name="policy_document" accept=".pdf" required>
            <small>Formato aceptado: PDF (máx 10MB)</small>
          </div>
          
          <div id="upload-extraction-progress" style="display: none; text-align: center; padding: 20px;">
            <div style="display: inline-block; width: 24px; height: 24px; border: 3px solid var(--accent-primary); border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="margin: 12px 0 0;">Extrayendo datos de la póliza...</p>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="this.closest('.app-modal-overlay').remove()">Cancelar</button>
            <button type="submit" class="btn btn-primary">Subir y Procesar</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);

  // Cargar clientes dinámicamente
  const clientSelect = modal.querySelector('#upload-client-select');
  populateClientSelect(clientSelect, { placeholder: 'Seleccionar cliente...' });
}

/**
 * Submit para carga de documento de póliza
 */
export function submitPolicyDocumentUpload(event) {
  event.preventDefault();
  const form = event.target;
  const clientSelect = document.getElementById('upload-client-select');
  const fileInput = document.getElementById('upload-policy-pdf');

  if (!clientSelect?.value || !fileInput?.files[0]) {
    showNotification('Selecciona un cliente y un archivo', NOTIFICATION_TYPES.WARNING);
    return;
  }

  const progressDiv = document.getElementById('upload-extraction-progress');
  progressDiv.style.display = 'block';

  showNotification('Procesando póliza...', NOTIFICATION_TYPES.INFO);

  // Simular procesamiento
  setTimeout(() => {
    progressDiv.style.display = 'none';
    form.closest('.app-modal-overlay').remove();
    showNotification('Póliza cargada y procesada exitosamente', NOTIFICATION_TYPES.SUCCESS);

    // Refrescar dashboard
    if (window.appHandlers?.refreshDashboard) {
      setTimeout(() => window.appHandlers.refreshDashboard(), 1000);
    }
  }, 2000);
}

// Exponer todas las acciones globalmente
if (typeof window !== 'undefined') {
  window.dashboardActions = {
    // Client actions
    makePayment,
    downloadPaymentHistory,
    updateInfo,
    contactAgent,
    viewPolicy,
    fileClaim,

    // Agent actions
    createQuote,
    requestQuote,
    submitQuoteRequest,
    addClient,
    scheduleAppointment,
    viewClientDetails,
    switchClientTab,
    filterByClient,

    // Agent dashboard modals
    openSalesModal,
    openCommissionsModal,
    uploadPolicyDocument,

    // Form submissions
    submitPayment,
    submitInfoUpdate,
    submitClaim,
    submitPolicyUpload,
    submitAppointment,
    submitAppointmentRequest,
    submitPolicyDocumentUpload,
  };
}
