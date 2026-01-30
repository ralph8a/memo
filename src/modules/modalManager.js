// Modal Manager - Unified modal system for all dashboard interactions
// Handles: Claims, Policies, Payments, Client Details, etc.

import { showNotification } from './notifications.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';
import { apiService, API_CONFIG } from '../api-integration.js';

/**
 * Base modal template
 */
function createModal(title, content, actions = []) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    // Subtle dark overlay and centered layout for modern card-like modals
    // Slightly stronger overlay for dark theme with subtle radial vignette
    modal.style.cssText = 'display:flex; align-items:center; justify-content:center; padding: 2rem; z-index: 9999;';

    modal.innerHTML = `
        <div class="modal-content modal-card">
            <div class="modal-accent"></div>
            <div class="modal-header">
                <div class="modal-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--primary);">
                        <path d="M12 2l7 3v5c0 5-3.5 9.6-7 11-3.5-1.4-7-6-7-11V5l7-3z"></path>
                        <path d="M8 12s1.5-2 4-2 4 2 4 2"></path>
                    </svg>
                </div>
                <h2 class="modal-title">${title}</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${actions.length > 0 ? `
                <div class="modal-footer">
                    ${actions.map(action => `
                        <button class="btn ${action.className || 'btn-primary'}" 
                                onclick="${action.onclick}"
                                ${action.disabled ? 'disabled' : ''}>
                            ${action.label}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;

    // Prevent closing when clicking inside modal content
    const modalContent = modal.querySelector('.modal-content');
    modalContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Close when clicking on overlay (backdrop) ONLY
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    });

    // Close on ESC key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    document.body.appendChild(modal);
    return modal;
}

/**
 * View Policy Details Modal
 */
export async function openPolicyModal(policyId) {
    try {
        const policy = await apiService.request(
            API_CONFIG.ENDPOINTS.GET_POLICY_DETAILS,
            { method: 'GET', queryParams: { id: policyId } }
        );

        // Obtener comprobantes de pago
        let receipts = [];
        try {
            const receiptsData = await apiService.request(
                `${API_CONFIG.BASE_URL}?action=payment_receipts&policy_id=${policyId}`,
                { method: 'GET' }
            );
            receipts = receiptsData.receipts || [];
        } catch (e) {
            console.warn('No se pudieron cargar comprobantes:', e);
        }

        // Obtener claims
        let claims = [];
        try {
            const claimsData = await apiService.request(
                `${API_CONFIG.BASE_URL}?action=policy_claims&policy_id=${policyId}`,
                { method: 'GET' }
            );
            claims = claimsData.claims || [];
        } catch (e) {
            console.warn('No se pudieron cargar claims:', e);
        }

        // Obtener comentarios de la póliza
        let comments = [];
        try {
            const commentsData = await apiService.request(
                `${API_CONFIG.BASE_URL}?action=policy_comments&policy_id=${policyId}`,
                { method: 'GET' }
            );
            comments = commentsData.comments || [];
        } catch (e) {
            console.warn('No se pudieron cargar comentarios:', e);
        }

        // Obtener calendario de pagos
        let paymentSchedule = [];
        try {
            const scheduleData = await apiService.request(
                `${API_CONFIG.BASE_URL}?action=agent_payments`,
                { method: 'GET', queryParams: { policy_id: policyId } }
            );
            paymentSchedule = scheduleData.payments || [];
        } catch (e) {
            console.warn('No se pudo cargar calendario de pagos:', e);
        }

        const content = `
            <div class="policy-modal-content">
                <!-- Información General -->
                <div class="policy-details-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:0.75rem;">
                    <div class="detail-group">
                        <label>Número de Póliza</label>
                        <p><strong>${policy.policy_number}</strong></p>
                    </div>
                    <div class="detail-group">
                        <label>Tipo</label>
                        <p>${policy.policy_type}</p>
                    </div>
                    <div class="detail-group">
                        <label>Estado</label>
                        <p><span class="badge badge-${policy.status === 'active' ? 'success' : 'warning'}">${policy.status}</span></p>
                    </div>
                    <div class="detail-group">
                        <label>Prima Mensual</label>
                        <p>$${parseFloat(policy.premium_amount).toFixed(2)}</p>
                    </div>
                    <div class="detail-group">
                        <label>Cobertura Total</label>
                        <p>$${parseFloat(policy.coverage_amount).toLocaleString()}</p>
                    </div>
                    <div class="detail-group">
                        <label>Inicio de Vigencia</label>
                        <p>${new Date(policy.start_date).toLocaleDateString('es-MX')}</p>
                    </div>
                    <div class="detail-group">
                        <label>Fin de Vigencia</label>
                        <p>${new Date(policy.end_date).toLocaleDateString('es-MX')}</p>
                    </div>
                    <div class="detail-group">
                        <label>Fecha de Renovación</label>
                        <p>${new Date(policy.renewal_date).toLocaleDateString('es-MX')}</p>
                    </div>
                    ${policy.client_name ? `
                        <div class="detail-group full-width">
                            <label>Cliente</label>
                            <p>${policy.client_name} - ${policy.client_email || ''}</p>
                        </div>
                    ` : ''}
                    ${policy.agent_name ? `
                        <div class="detail-group full-width">
                            <label>Agente Asignado</label>
                            <p>${policy.agent_name} - ${policy.agent_email}</p>
                        </div>
                    ` : ''}
                </div>

                <div class="section-divider" style="height:1px; background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005), rgba(255,255,255,0.02)); margin: 1rem 0;"></div>

                <!-- Calendario de Pagos -->
                ${paymentSchedule.length > 0 ? `
                    <div class="policy-section" style="padding:0.75rem; border-radius:10px; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); box-shadow: 0 6px 18px rgba(0,0,0,0.5); border-left:4px solid rgba(var(--primary-rgb,80,145,255),0.12); padding-left:0.9rem;">
                        <h3 style="display:flex; align-items:center; gap:0.6rem; margin:0 0 0.5rem; color:var(--text-primary);">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" style="flex-shrink:0;">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <path d="M16 2v4M8 2v4M3 10h18"></path>
                          </svg>
                          <span>Calendario de Pagos</span>
                        </h3>
                        <div class="payment-schedule-compact">
                            ${paymentSchedule.slice(0, 5).map(payment => `
                                <div class="payment-row ${payment.status}" style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem; border-radius:8px; background: rgba(0,0,0,0.04); margin-bottom:0.5rem;">
                                    <span class="payment-date" style="font-weight:600;">${new Date(payment.due_date).toLocaleDateString('es-MX')}</span>
                                    <span class="payment-amount">$${parseFloat(payment.amount_due).toFixed(2)}</span>
                                    <span class="payment-status badge badge-${payment.status === 'paid' ? 'success' : payment.status === 'overdue' ? 'danger' : 'warning'}">
                                        ${payment.status === 'paid' ? 'Pagado' : payment.status === 'overdue' ? 'Vencido' : 'Pendiente'}
                                    </span>
                                </div>
                            `).join('')}
                            ${paymentSchedule.length > 5 ? `<p class="text-muted" style="margin-top: 0.5rem; font-size: 0.875rem;">Y ${paymentSchedule.length - 5} pagos más...</p>` : ''}
                        </div>
                    </div>
                ` : ''}

                <div class="section-divider" style="height:1px; background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005), rgba(255,255,255,0.02)); margin: 1rem 0;"></div>

                <!-- Comprobantes de Pago -->
                <div class="policy-section" style="padding:0.75rem; border-radius:10px; background: linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.01)); box-shadow:0 6px 18px rgba(0,0,0,0.45); border-left:4px solid rgba(var(--primary-rgb,80,145,255),0.12); padding-left:0.9rem;">
                    <h3 style="display:flex; align-items:center; gap:0.6rem; margin:0 0 0.5rem; color:var(--text-primary);">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
                        <path d="M21 8V7a2 2 0 0 0-2-2h-3"></path>
                        <path d="M3 6v12a2 2 0 0 0 2 2h14"></path>
                        <path d="M8 10h8v6H8z"></path>
                      </svg>
                      <span>Comprobantes de Pago</span>
                    </h3>
                    ${receipts.length > 0 ? `
                        <div class="receipts-list">
                            ${receipts.map(receipt => `
                                <div class="receipt-item" style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem; border-radius:8px; background: rgba(var(--bg-secondary-rgb,30,30,30),0.45); box-shadow:0 6px 14px rgba(0,0,0,0.45); margin-bottom:0.6rem;">
                                    <div class="receipt-info">
                                        <strong style="display:block; color:var(--text-primary);">${receipt.file_name}</strong>
                                        <small class="text-muted">$${parseFloat(receipt.amount).toFixed(2)} - ${new Date(receipt.uploaded_at).toLocaleDateString('es-MX')}</small>
                                        <span class="badge badge-${receipt.status === 'approved' ? 'success' : receipt.status === 'pending' ? 'warning' : 'danger'}" style="margin-left:0.5rem;">${receipt.status === 'approved' ? 'Aprobado' : receipt.status === 'pending' ? 'Pendiente' : 'Rechazado'}</span>
                                    </div>
                                    <button class="btn-icon" onclick="window.open('${receipt.file_path}', '_blank')" title="Ver comprobante" style="background:transparent; border:none; color:var(--primary);">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                            <path d="M12 2v6"></path>
                                            <path d="M21 21H3"></path>
                                            <path d="M16 6l-4 4-4-4"></path>
                                        </svg>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="text-muted">No hay comprobantes de pago</p>'}
                </div>

                <div class="section-divider" style="height:1px; background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005), rgba(255,255,255,0.02)); margin: 1rem 0;"></div>

                <!-- Claims / Siniestros -->
                <div class="policy-section" style="padding:0.75rem; border-radius:10px; background: linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.01)); box-shadow:0 6px 18px rgba(0,0,0,0.45); border-left:4px solid rgba(var(--primary-rgb,80,145,255),0.12); padding-left:0.9rem;">
                    <h3 style="display:flex; align-items:center; gap:0.6rem; margin:0 0 0.5rem; color:var(--text-primary);">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <path d="M12 9v4"></path>
                        <path d="M12 17h.01"></path>
                      </svg>
                      <span>Siniestros</span>
                    </h3>
                    ${claims.length > 0 ? `
                        <div class="claims-list">
                            ${claims.map(claim => `
                                <div class="claim-item" style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem; border-radius:8px; background: rgba(var(--bg-secondary-rgb,30,30,30),0.35); box-shadow: 0 6px 14px rgba(0,0,0,0.45); margin-bottom:0.6rem;">
                                    <div class="claim-info">
                                        <strong style="display:block; color:var(--text-primary);">${claim.claim_number}</strong>
                                        <small class="text-muted">${claim.claim_type} - $${parseFloat(claim.claim_amount).toFixed(2)}</small>
                                        <span class="badge badge-${claim.status === 'approved' ? 'success' : claim.status === 'pending' ? 'warning' : 'danger'}" style="margin-left:0.5rem;">${claim.status}</span>
                                    </div>
                                    <small class="text-muted">${new Date(claim.submitted_at).toLocaleDateString('es-MX')}</small>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="text-muted">No hay siniestros registrados</p>'}
                </div>

                <div class="section-divider" style="height:1px; background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005), rgba(255,255,255,0.02)); margin: 1rem 0;"></div>

                <!-- Comentarios -->
                <div class="policy-section" style="padding:0.75rem; border-radius:10px; background: linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.01)); box-shadow:0 6px 18px rgba(0,0,0,0.45); border-left:4px solid rgba(var(--primary-rgb,80,145,255),0.12); padding-left:0.9rem;">
                    <h3 style="display:flex; align-items:center; gap:0.6rem; margin:0 0 0.5rem; color:var(--text-primary);">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <span>Comentarios</span>
                    </h3>
                    ${comments.length > 0 ? `
                        <div class="comments-list" style="max-height: 300px; overflow-y: auto;">
                            ${comments.map(comment => `
                                <div class="comment-item" style="padding: 0.75rem; margin-bottom: 0.75rem; background: rgba(var(--bg-secondary-rgb,30,30,30),0.5); border-radius: 8px; box-shadow: 0 6px 14px rgba(0,0,0,0.45);">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                        <strong style="color: var(--text-primary);">${comment.from_name}</strong>
                                        <small class="text-muted">${new Date(comment.created_at).toLocaleDateString('es-MX')} ${new Date(comment.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</small>
                                    </div>
                                    <p style="margin: 0; color: var(--text-secondary);">${comment.message}</p>
                                    ${comment.file_url ? `
                                        <a href="${comment.file_url}" target="_blank" style="display: inline-block; margin-top: 0.5rem; color: var(--primary); text-decoration: none;">
                                            <svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align:middle; margin-right:6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11"></path><path d="M17 3v4"></path></svg> ${comment.file_name || 'Archivo adjunto'}
                                        </a>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="text-muted">No hay comentarios</p>'}
                    
                    <!-- Formulario para agregar comentario -->
                    <div class="add-comment-form" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                        <textarea id="new-policy-comment-${policyId}" 
                                  placeholder="Agregar un comentario..." 
                                  style="width: 100%; min-height: 80px; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; resize: vertical;"
                                  rows="3"></textarea>
                        <button class="btn btn-primary" 
                                onclick="window.addPolicyComment?.('${policyId}')"
                                style="margin-top: 0.5rem; display:inline-flex; align-items:center; gap:0.5rem;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M22 2L11 13"></path><path d="M22 2l-7 20 2-7 7-7z"></path></svg>
                            Agregar Comentario
                        </button>
                    </div>
                </div>
            </div>
        `;

        const actions = [
            { label: 'Descargar Documento', className: 'btn-outline', onclick: `downloadPolicyDocument('${policyId}')` },
            { label: 'Cerrar', className: 'btn-secondary', onclick: 'this.closest(".modal-overlay").remove()' }
        ];

        const modal = createModal(`Detalles de Póliza - ${policy.policy_number}`, content, actions);
        modal.classList.add('active');
    } catch (error) {
        showNotification('Error al cargar detalles de la póliza', NOTIFICATION_TYPES.ERROR);
    }
}

// Función global para agregar comentarios a póliza
window.addPolicyComment = async function (policyId) {
    const textarea = document.getElementById(`new-policy-comment-${policyId}`);
    const message = textarea?.value?.trim();

    if (!message) {
        showNotification('Escribe un comentario primero', NOTIFICATION_TYPES.WARNING);
        return;
    }

    try {
        await apiService.request(
            `${API_CONFIG.BASE_URL}?action=add_policy_comment`,
            {
                method: 'POST',
                body: { policy_id: policyId, message }
            }
        );

        showNotification('Comentario agregado exitosamente', NOTIFICATION_TYPES.SUCCESS);

        // Recargar el modal
        document.querySelector('.modal-overlay')?.remove();
        openPolicyModal(policyId);
    } catch (error) {
        showNotification('Error al agregar comentario', NOTIFICATION_TYPES.ERROR);
    }
};

/**
 * File Claim Modal with Comments
 */
export async function openFileClaimModal(policyId = null) {
    const policies = await apiService.request(
        API_CONFIG.ENDPOINTS.CLIENT_POLICIES,
        { method: 'GET' }
    );

    const content = `
        <form id="fileClaimForm" class="modal-form">
            <div class="form-group">
                <label for="claimPolicyId">Póliza Afectada *</label>
                <select id="claimPolicyId" required>
                    <option value="">Selecciona una póliza</option>
                    ${policies.map(p => `
                        <option value="${p.id}" ${p.id == policyId ? 'selected' : ''}>
                            ${p.policy_number} - ${p.policy_type}
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="claimType">Tipo de Siniestro *</label>
                <select id="claimType" required>
                    <option value="">Selecciona el tipo</option>
                    <option value="accident">Accidente</option>
                    <option value="theft">Robo</option>
                    <option value="damage">Daño</option>
                    <option value="medical">Médico</option>
                    <option value="other">Otro</option>
                </select>
            </div>
            <div class="form-group">
                <label for="incidentDate">Fecha del Incidente *</label>
                <input type="date" id="incidentDate" max="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label for="claimAmount">Monto Estimado *</label>
                <input type="number" id="claimAmount" step="0.01" min="0" placeholder="0.00" required>
            </div>
            <div class="form-group">
                <label for="claimDescription">Descripción del Siniestro *</label>
                <textarea id="claimDescription" rows="5" placeholder="Describe detalladamente lo sucedido..." required></textarea>
            </div>
            <div class="form-group">
                <label for="claimDocuments">Documentos de Soporte (opcional)</label>
                <input type="file" id="claimDocuments" multiple accept="image/*,.pdf">
                <small>Puedes adjuntar fotos, reportes, etc.</small>
            </div>
        </form>
    `;

    const actions = [
        {
            label: 'Enviar Siniestro',
            className: 'btn-primary',
            onclick: 'submitClaimForm()'
        },
        {
            label: 'Cancelar',
            className: 'btn-secondary',
            onclick: 'this.closest(".modal-overlay").remove()'
        }
    ];

    createModal('Reportar Siniestro', content, actions);
}

/**
 * Submit claim form
 */
window.submitClaimForm = async function () {
    const form = document.getElementById('fileClaimForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const data = {
        policy_id: document.getElementById('claimPolicyId').value,
        claim_type: document.getElementById('claimType').value,
        incident_date: document.getElementById('incidentDate').value,
        claim_amount: document.getElementById('claimAmount').value,
        description: document.getElementById('claimDescription').value
    };

    try {
        const result = await apiService.request(
            API_CONFIG.ENDPOINTS.SUBMIT_CLAIM,
            { method: 'POST', body: data },
            { useCache: false }
        );

        document.querySelector('.modal-overlay')?.remove();
        showNotification(`Siniestro #${result.claim_number} registrado exitosamente`, NOTIFICATION_TYPES.SUCCESS);

        // Reload claims if we're on dashboard
        if (window.appHandlers?.loadClientDashboard) {
            setTimeout(() => window.appHandlers.loadClientDashboard(), 1000);
        }
    } catch (error) {
        showNotification('Error al registrar el siniestro', NOTIFICATION_TYPES.ERROR);
    }
};

/**
 * View Claim Details with Comments Thread
 */
export async function openClaimDetailsModal(claimId) {
    try {
        const claim = await apiService.request(
            API_CONFIG.ENDPOINTS.GET_CLAIM_DETAILS,
            { method: 'GET', params: { id: claimId } }
        );

        const comments = claim.comments || [];

        const content = `
            <div class="claim-details-container">
                <div class="claim-info-section">
                    <div class="detail-group">
                        <label>Número de Siniestro</label>
                        <p>${claim.claim_number}</p>
                    </div>
                    <div class="detail-group">
                        <label>Estado</label>
                        <p><span class="badge badge-${getClaimStatusColor(claim.status)}">${getClaimStatusLabel(claim.status)}</span></p>
                    </div>
                    <div class="detail-group">
                        <label>Monto Reclamado</label>
                        <p>$${parseFloat(claim.claim_amount).toFixed(2)}</p>
                    </div>
                    ${claim.approved_amount ? `
                        <div class="detail-group">
                            <label>Monto Aprobado</label>
                            <p class="text-success">$${parseFloat(claim.approved_amount).toFixed(2)}</p>
                        </div>
                    ` : ''}
                    <div class="detail-group full-width">
                        <label>Descripción</label>
                        <p>${claim.description}</p>
                    </div>
                </div>

                <div class="comments-section">
                    <h3>Conversación</h3>
                    <div class="comments-thread" id="claimComments">
                        ${comments.length > 0 ? comments.map(comment => `
                            <div class="comment-item ${comment.from_type === 'agent' ? 'comment-agent' : 'comment-client'}">
                                <div class="comment-header">
                                    <strong>${comment.from_name}</strong>
                                    <span class="comment-date">${new Date(comment.created_at).toLocaleString()}</span>
                                </div>
                                <div class="comment-body">${comment.message}</div>
                            </div>
                        `).join('') : '<p class="empty-state">No hay comentarios aún</p>'}
                    </div>
                    <div class="comment-input-section">
                        <textarea id="newClaimComment" placeholder="Escribe un comentario..." rows="3"></textarea>
                        <button class="btn btn-primary" onclick="addClaimComment('${claimId}')">Enviar Comentario</button>
                    </div>
                </div>
            </div>
        `;

        createModal(`Siniestro #${claim.claim_number}`, content, [
            { label: 'Cerrar', className: 'btn-secondary', onclick: 'this.closest(".modal-overlay").remove()' }
        ]);
    } catch (error) {
        showNotification('Error al cargar detalles del siniestro', NOTIFICATION_TYPES.ERROR);
    }
}

/**
 * Add comment to claim
 */
window.addClaimComment = async function (claimId) {
    const textarea = document.getElementById('newClaimComment');
    const message = textarea.value.trim();

    if (!message) {
        showNotification('Escribe un mensaje primero', NOTIFICATION_TYPES.WARNING);
        return;
    }

    try {
        await apiService.request(
            API_CONFIG.ENDPOINTS.ADD_CLAIM_COMMENT,
            {
                method: 'POST',
                params: { id: claimId },
                body: { message }
            },
            { useCache: false }
        );

        // Reload the modal
        document.querySelector('.modal-overlay')?.remove();
        openClaimDetailsModal(claimId);

        showNotification('Comentario agregado. Se notificará a las partes.', NOTIFICATION_TYPES.SUCCESS);
    } catch (error) {
        showNotification('Error al agregar comentario', NOTIFICATION_TYPES.ERROR);
    }
};

/**
 * Upload Payment Receipt Modal
 */
export async function openMakePaymentModal() {
    const policies = await apiService.request(
        API_CONFIG.ENDPOINTS.CLIENT_POLICIES,
        { method: 'GET' }
    );

    const content = `
        <form id="makePaymentForm" class="modal-form" enctype="multipart/form-data">
            <div class="info-banner">
                <h4>📤 Subir Comprobante de Pago</h4>
                <p>Sube tu comprobante de transferencia o depósito bancario. Nuestro sistema lo analizará automáticamente.</p>
            </div>
            
            <div class="form-group">
                <label for="paymentPolicyId">Póliza a Pagar *</label>
                <select id="paymentPolicyId" required>
                    <option value="">Selecciona una póliza</option>
                    ${policies.filter(p => p.status === 'active').map(p => `
                        <option value="${p.id}" data-amount="${p.premium_amount}">
                            ${p.policy_number} - $${parseFloat(p.premium_amount).toFixed(2)}/mes
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label for="expectedAmount">Monto Esperado</label>
                <input type="text" id="expectedAmount" readonly style="background: #f5f5f5;">
            </div>
            
            <div class="form-group">
                <label for="paymentDate">Fecha del Pago *</label>
                <input type="date" id="paymentDate" max="${new Date().toISOString().split('T')[0]}" required>
            </div>
            
            <div class="form-group">
                <label for="paymentReference">Referencia/Folio (opcional)</label>
                <input type="text" id="paymentReference" placeholder="Ej: 123456789">
            </div>
            
            <div class="form-group">
                <label for="receiptFile">Comprobante de Pago * (imagen o PDF)</label>
                <input type="file" id="receiptFile" accept="image/*,.pdf" required>
                <small>Formatos: JPG, PNG, PDF. Máximo 5MB</small>
            </div>
            
            <div class="payment-info-box">
                <p>ℹ️ <strong>Datos bancarios para transferencia:</strong></p>
                <p>Banco: <strong>BBVA Bancomer</strong><br>
                   Cuenta: <strong>0123456789</strong><br>
                   CLABE: <strong>012180001234567890</strong><br>
                   Beneficiario: <strong>Krause Insurance LLC</strong></p>
            </div>
            
            <div id="uploadPreview" style="display: none; margin-top: 15px;">
                <h4>Vista Previa:</h4>
                <img id="previewImage" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
            </div>
        </form>
    `;

    const modal = createModal('Subir Comprobante de Pago', content, [
        { label: 'Subir y Analizar', className: 'btn-primary', onclick: 'uploadPaymentReceipt()' },
        { label: 'Cancelar', className: 'btn-secondary', onclick: 'this.closest(".modal-overlay").remove()' }
    ]);

    // Auto-fill amount when policy selected
    document.getElementById('paymentPolicyId').addEventListener('change', function () {
        const selectedOption = this.options[this.selectedIndex];
        const amount = selectedOption.dataset.amount || '0';
        document.getElementById('expectedAmount').value = '$' + parseFloat(amount).toFixed(2);
    });

    // Show preview when file selected
    document.getElementById('receiptFile').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const preview = document.getElementById('uploadPreview');
                const img = document.getElementById('previewImage');
                img.src = event.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Set today as default date
    document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];
}

/**
 * Upload payment receipt with OCR analysis
 */
window.uploadPaymentReceipt = async function () {
    const form = document.getElementById('makePaymentForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const fileInput = document.getElementById('receiptFile');
    const file = fileInput.files[0];

    if (!file) {
        showNotification('Selecciona un archivo', NOTIFICATION_TYPES.WARNING);
        return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('El archivo es demasiado grande. Máximo 5MB', NOTIFICATION_TYPES.ERROR);
        return;
    }

    const formData = new FormData();
    formData.append('receipt', file);
    formData.append('policy_id', document.getElementById('paymentPolicyId').value);
    formData.append('payment_date', document.getElementById('paymentDate').value);
    formData.append('reference', document.getElementById('paymentReference').value || '');

    try {
        // Show loading
        const submitBtn = document.querySelector('.modal-footer .btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Analizando...';
        submitBtn.disabled = true;

        const result = await apiService.request(
            API_CONFIG.ENDPOINTS.UPLOAD_PAYMENT_RECEIPT,
            {
                method: 'POST',
                body: formData,
                headers: {} // Let browser set Content-Type for FormData
            },
            { useCache: false }
        );

        document.querySelector('.modal-overlay')?.remove();

        // Show analysis results
        const analysis = result.extracted_data || {};
        let message = 'Comprobante subido exitosamente. ';

        if (analysis.amount) {
            message += `Monto detectado: $${analysis.amount}. `;
        }
        if (analysis.reference) {
            message += `Referencia: ${analysis.reference}. `;
        }
        message += 'Tu pago será verificado en breve.';

        showNotification(message, NOTIFICATION_TYPES.SUCCESS);

        // Reload dashboard
        if (window.appHandlers?.loadClientDashboard) {
            setTimeout(() => window.appHandlers.loadClientDashboard(), 1500);
        }
    } catch (error) {
        showNotification('Error al subir el comprobante: ' + error.message, NOTIFICATION_TYPES.ERROR);

        // Re-enable button
        const submitBtn = document.querySelector('.modal-footer .btn-primary');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
};

/**
 * Helper functions
 */
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

/**
 * Make Payment Modal (Quick Action)
 */
export async function openMakePaymentActionModal(policyId = null, scheduleId = null) {
    const modal = document.createElement('div');
    modal.className = 'app-modal-overlay active';
    modal.innerHTML = `
        <div class="app-modal app-modal-md">
            <div class="modal-accent"></div>
            <div class="app-modal-header">
                <div class="modal-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 8V7a2 2 0 0 0-2-2h-3"></path><path d="M3 6v12a2 2 0 0 0 2 2h14"></path><path d="M8 10h8v6H8z"></path></svg>
                </div>
                <h2 class="app-modal-title">Subir Comprobante de Pago</h2>
                <button class="app-modal-close" onclick="this.closest('.app-modal-overlay').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <div class="app-modal-body">
                <form id="makePaymentForm" class="payment-form" onsubmit="window.submitPaymentForm?.(event)" data-policy="${policyId || ''}" data-schedule="${scheduleId || ''}">
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
}

/**
 * File Claim Modal Quick Action
 */
export async function openFileClaimActionModal(policyId = null) {
    const policies = await apiService.request(
        API_CONFIG.ENDPOINTS.CLIENT_POLICIES,
        { method: 'GET' }
    ).catch(() => []);

    const modal = document.createElement('div');
    modal.className = 'app-modal-overlay active';
    modal.innerHTML = `
        <div class="app-modal app-modal-lg">
            <div class="modal-accent"></div>
            <div class="app-modal-header">
                <div class="modal-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>
                </div>
                <h2 class="app-modal-title">Nuevo Siniestro</h2>
                <button class="app-modal-close" onclick="this.closest('.app-modal-overlay').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <div class="app-modal-body">
                <form id="fileClaimForm" class="claim-form" onsubmit="window.submitClaimForm?.(event)">
                    <div class="form-group">
                        <label for="claim-policy">Póliza Afectada *</label>
                        <select id="claim-policy" required>
                            <option value="">Selecciona una póliza</option>
                            ${policies.map(p => `
                                <option value="${p.id}" ${p.id == policyId ? 'selected' : ''}>
                                    ${p.policy_number} - ${p.policy_type}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="claim-type">Tipo de Siniestro *</label>
                        <input type="text" id="claim-type" placeholder="Ej: Accidente, Daño, Robo" required>
                    </div>
                    <div class="form-group">
                        <label for="claim-date">Fecha del Incidente *</label>
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
}

/**
 * Update Info Modal Quick Action
 */
export function openUpdateInfoModal() {
    const modal = document.createElement('div');
    modal.className = 'app-modal-overlay active';
    modal.innerHTML = `
        <div class="app-modal app-modal-md">
            <div class="modal-accent"></div>
            <div class="app-modal-header">
                <div class="modal-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"></path></svg>
                </div>
                <h2 class="app-modal-title">Actualizar Información</h2>
                <button class="app-modal-close" onclick="this.closest('.app-modal-overlay').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <div class="app-modal-body">
                <form id="updateInfoForm" class="update-info-form" onsubmit="window.submitInfoForm?.(event)">
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
}

