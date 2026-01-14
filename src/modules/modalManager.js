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
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
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

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
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
            { method: 'GET', params: { id: policyId } }
        );

        const content = `
            <div class="policy-details-grid">
                <div class="detail-group">
                    <label>Número de Póliza</label>
                    <p>${policy.policy_number}</p>
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
                    <label>Fecha de Renovación</label>
                    <p>${new Date(policy.renewal_date).toLocaleDateString()}</p>
                </div>
                ${policy.agent_name ? `
                    <div class="detail-group full-width">
                        <label>Agente Asignado</label>
                        <p>${policy.agent_name} - ${policy.agent_email}</p>
                    </div>
                ` : ''}
            </div>
        `;

        const actions = [
            { label: 'Descargar Documento', className: 'btn-outline', onclick: `downloadPolicyDocument('${policyId}')` },
            { label: 'Cerrar', className: 'btn-secondary', onclick: 'this.closest(".modal-overlay").remove()' }
        ];

        createModal(`Detalles de Póliza - ${policy.policy_number}`, content, actions);
    } catch (error) {
        showNotification('Error al cargar detalles de la póliza', NOTIFICATION_TYPES.ERROR);
    }
}

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

// Export modal functions
export {
    createModal,
    openPolicyModal,
    openFileClaimModal,
    openClaimDetailsModal,
    openMakePaymentModal
};
