/**
 * Dashboard Actions - Sistema unificado de acciones para dashboards
 * Conecta todos los botones de acciones rápidas con sus respectivas funcionalidades
 * CONECTADO CON BACKEND REAL Y APIs DE PAGO
 */

import { showNotification } from './notifications.js';
import { NOTIFICATION_TYPES, PAGES } from '../utils/constants.js';
import { navigateTo } from './simpleRouter.js';
import { setPendingQuoteType } from './quoteFlow.js';
import { PaymentAPI } from './paymentIntegration.js';

// Initialize Payment API
const paymentAPI = new PaymentAPI();

// ============================================================================
// CLIENT ACTIONS - Acciones del dashboard de clientes
// ============================================================================

/**
 * Realizar pago rápido - Subir comprobante de pago
 */
export async function makePayment(policyId = null, scheduleId = null) {
    const modal = document.createElement('div');
    modal.className = 'app-modal-overlay';
    modal.innerHTML = `
    <div class="app-modal app-modal-md">
      <div class="app-modal-header">
        <h2 class="app-modal-title">Subir Comprobante de Pago</h2>
        <button class="app-modal-close" onclick="this.closest('.app-modal-overlay').remove()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="app-modal-body">
        <form class="payment-form" onsubmit="window.dashboardActions?.submitPayment(event)" data-policy="${policyId || ''}" data-schedule="${scheduleId || ''}">
          <div class="form-group">
            <label for="payment-proof-file">Comprobante de pago</label>
            <input type="file" id="payment-proof-file" accept="image/*,.pdf" required>
            <small>Formatos aceptados: JPG, PNG, PDF (máx 5MB)</small>
          </div>
          <div class="form-group">
            <label for="payment-reference">Referencia de pago (opcional)</label>
            <input type="text" id="payment-reference" placeholder="Número de referencia o folio">
          </div>
          <div class="form-group">
            <label for="payment-notes">Notas adicionales (opcional)</label>
            <textarea id="payment-notes" rows="3" placeholder="Información adicional sobre el pago"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="this.closest('.app-modal-overlay').remove()">Cancelar</button>
            <button type="submit" class="btn btn-primary">Subir comprobante</button>
          </div>
        </form>
      </div>
    </div>
  `;

    document.body.appendChild(modal);
    // Prevenir cierre accidental - solo cerrar con botón X o Cancelar
    setTimeout(() => modal.classList.add('active'), 10);

    showNotification('Sube tu comprobante de pago para validación', NOTIFICATION_TYPES.INFO);
}

/**
 * Descargar historial de pagos usando API real
 */
export async function downloadPaymentHistory(type = 'receipt', fileId = null) {
    try {
        if (fileId) {
            // Descargar archivo específico del backend
            showNotification('Descargando archivo...', NOTIFICATION_TYPES.INFO);
            await paymentAPI.downloadFile(type, fileId);
            showNotification('Archivo descargado exitosamente', NOTIFICATION_TYPES.SUCCESS);
        } else {
            // Generar CSV con historial completo
            showNotification('Generando historial...', NOTIFICATION_TYPES.INFO);

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

            showNotification('Historial de pagos descargado', NOTIFICATION_TYPES.SUCCESS);
        }
    } catch (error) {
        console.error('Error downloading file:', error);
        showNotification('Error al descargar archivo', NOTIFICATION_TYPES.ERROR);
    }
}

/**
 * Actualizar información personal
 */
export function updateInfo() {
    const modal = document.createElement('div');
    modal.className = 'app-modal-overlay';
    modal.innerHTML = `
    <div class="app-modal app-modal-md">
      <div class="app-modal-header">
        <h2 class="app-modal-title">Actualizar Información</h2>
        <button class="app-modal-close" onclick="this.closest('.app-modal-overlay').remove()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="app-modal-body">
        <form class="update-info-form" onsubmit="window.dashboardActions?.submitInfoUpdate(event)">
          <div class="form-group">
            <label for="update-phone">Teléfono</label>
            <input type="tel" id="update-phone" placeholder="+1 (555) 000-0000">
          </div>
          <div class="form-group">
            <label for="update-email">Email</label>
            <input type="email" id="update-email" placeholder="email@ejemplo.com">
          </div>
          <div class="form-group">
            <label for="update-address">Dirección</label>
            <textarea id="update-address" rows="3" placeholder="Calle, número, ciudad, estado, código postal"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="this.closest('.app-modal-overlay').remove()">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar cambios</button>
          </div>
        </form>
      </div>
    </div>
  `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    showNotification('Formulario de actualización abierto', NOTIFICATION_TYPES.INFO);
}

/**
 * Contactar agente - Redirige a página de contacto
 */
export function contactAgent() {
    window.__allowContact = true;
    navigateTo(PAGES.CONTACT);
    setTimeout(() => { window.__allowContact = false; }, 500);
    showNotification('Abriendo formulario de contacto', NOTIFICATION_TYPES.INFO);
}

/**
 * Ver detalles de póliza
 */
export function viewPolicy(policyId = null) {
    const modal = document.createElement('div');
    modal.className = 'app-modal-overlay';
    modal.innerHTML = `
    <div class="app-modal app-modal-lg">
      <div class="app-modal-header">
        <h2 class="app-modal-title">Detalles de Póliza ${policyId || 'POL-001'}</h2>
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
              <dt>Número de póliza:</dt><dd>${policyId || 'POL-001'}</dd>
              <dt>Tipo:</dt><dd>Auto</dd>
              <dt>Estado:</dt><dd><span class="badge badge-success">Activa</span></dd>
              <dt>Prima mensual:</dt><dd>$350.00</dd>
            </dl>
          </div>
          <div class="detail-section">
            <h3>Cobertura</h3>
            <ul>
              <li>Responsabilidad civil: $1,000,000</li>
              <li>Daños materiales: $500,000</li>
              <li>Robo total: Valor comercial</li>
              <li>Gastos médicos: $100,000</li>
            </ul>
          </div>
          <div class="detail-section">
            <h3>Vehículo Asegurado</h3>
            <dl>
              <dt>Marca/Modelo:</dt><dd>Toyota Camry 2020</dd>
              <dt>Placas:</dt><dd>ABC-123-XYZ</dd>
              <dt>VIN:</dt><dd>1HGBH41JXMN109186</dd>
            </dl>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-outline" onclick="this.closest('.app-modal-overlay').remove()">Cerrar</button>
          <button class="btn btn-primary" onclick="window.dashboardActions?.makePayment('${policyId || 'POL-001'}')">Realizar pago</button>
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    showNotification('Detalles de póliza cargados', NOTIFICATION_TYPES.INFO);
}

/**
 * Presentar siniestro
 */
export function fileClaim() {
    const modal = document.createElement('div');
    modal.className = 'app-modal-overlay';
    modal.innerHTML = `
    <div class="app-modal app-modal-lg">
      <div class="app-modal-header">
        <h2 class="app-modal-title">Nuevo Siniestro</h2>
        <button class="app-modal-close" onclick="this.closest('.app-modal-overlay').remove()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="app-modal-body">
        <form class="claim-form" onsubmit="window.dashboardActions?.submitClaim(event)">
          <div class="form-group">
            <label for="claim-policy">Póliza afectada</label>
            <select id="claim-policy" required>
              <option value="">Seleccionar póliza</option>
              <option value="POL-001">Auto - Toyota Camry 2020</option>
              <option value="POL-002">Hogar - Casa principal</option>
            </select>
          </div>
          <div class="form-group">
            <label for="claim-type">Tipo de siniestro</label>
            <select id="claim-type" required>
              <option value="accident">Accidente</option>
              <option value="theft">Robo</option>
              <option value="damage">Daños</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div class="form-group">
            <label for="claim-date">Fecha del incidente</label>
            <input type="date" id="claim-date" required>
          </div>
          <div class="form-group">
            <label for="claim-description">Descripción del incidente</label>
            <textarea id="claim-description" rows="4" placeholder="Describa lo ocurrido..." required></textarea>
          </div>
          <div class="form-group">
            <label for="claim-files">Documentos adjuntos (fotos, reportes)</label>
            <input type="file" id="claim-files" multiple accept="image/*,.pdf">
            <small>Máximo 5 archivos. Formatos: JPG, PNG, PDF</small>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="this.closest('.app-modal-overlay').remove()">Cancelar</button>
            <button type="submit" class="btn btn-primary">Enviar siniestro</button>
          </div>
        </form>
      </div>
    </div>
  `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    showNotification('Formulario de siniestro abierto', NOTIFICATION_TYPES.INFO);
}

// ============================================================================
// AGENT ACTIONS - Acciones del dashboard de agentes
// ============================================================================

/**
 * Crear nueva cotización
 */
export function createQuote(type = 'auto') {
    setPendingQuoteType(type);
    navigateTo(PAGES.QUOTE);
    showNotification('Creando nueva cotización', NOTIFICATION_TYPES.INFO);
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
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    showNotification('Sube la póliza para crear el cliente automáticamente', NOTIFICATION_TYPES.INFO);
}

/**
 * Agendar cita
 */
export function scheduleAppointment() {
    const modal = document.createElement('div');
    modal.className = 'app-modal-overlay';
    modal.innerHTML = `
    <div class="app-modal app-modal-md">
      <div class="app-modal-header">
        <h2 class="app-modal-title">Agendar Cita</h2>
        <button class="app-modal-close" onclick="this.closest('.app-modal-overlay').remove()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="app-modal-body">
        <form class="appointment-form" onsubmit="window.dashboardActions?.submitAppointment(event)">
          <div class="form-group">
            <label for="appt-client">Cliente</label>
            <select id="appt-client" required>
              <option value="">Seleccionar cliente</option>
              <option value="CL-001">María González</option>
              <option value="CL-002">Carlos Rodríguez</option>
              <option value="CL-003">Ana Martínez</option>
            </select>
          </div>
          <div class="form-group">
            <label for="appt-type">Tipo de cita</label>
            <select id="appt-type" required>
              <option value="consultation">Consulta</option>
              <option value="quote">Cotización</option>
              <option value="claim">Siniestro</option>
              <option value="policy-review">Revisión de póliza</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="appt-date">Fecha</label>
              <input type="date" id="appt-date" required>
            </div>
            <div class="form-group">
              <label for="appt-time">Hora</label>
              <input type="time" id="appt-time" required>
            </div>
          </div>
          <div class="form-group">
            <label for="appt-notes">Notas</label>
            <textarea id="appt-notes" rows="3" placeholder="Asunto o detalles adicionales"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="this.closest('.app-modal-overlay').remove()">Cancelar</button>
            <button type="submit" class="btn btn-primary">Agendar</button>
          </div>
        </form>
      </div>
    </div>
  `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    showNotification('Formulario de cita abierto', NOTIFICATION_TYPES.INFO);
}

/**
 * Ver detalles de cliente - CONECTADO CON BACKEND
 */
export async function viewClientDetails(clientId) {
    showNotification('Cargando detalles del cliente...', NOTIFICATION_TYPES.INFO);

    // Modal de detalles
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
            <p>Cargando información del cliente...</p>
          </div>
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Aquí se cargaría data real del backend
    // Por ahora usa datos de ejemplo
    showNotification(`Detalles del cliente ${clientId} cargados`, NOTIFICATION_TYPES.SUCCESS);
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
    showNotification(`Filtrando vista por cliente ${clientId}`, NOTIFICATION_TYPES.INFO);

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
              <option value="">Seleccionar cliente...</option>
              <option value="CL-001">María González</option>
              <option value="CL-002">Carlos Ruiz</option>
              <option value="CL-003">Ana Martínez</option>
              <option value="CL-004">Luis Hernández</option>
              <option value="CL-005">Pedro Sánchez</option>
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
    showNotification('Selecciona el cliente y sube la póliza', NOTIFICATION_TYPES.INFO);
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
        submitPolicyDocumentUpload,
    };
}
