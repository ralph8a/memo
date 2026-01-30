// Chart Modals Module - Handles modal displays for payment trends and policy health
import { showNotification } from './notifications.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';
import { apiService } from '../api-integration.js';

// Modal HTML templates
// PAYMENT_TRENDS_MODAL removed - now generated dynamically with real data in openPaymentTrendsModal()

const POLICY_HEALTH_MODAL = `
  <div class="chart-modal-overlay active" id="chartModalOverlay">
    <div class="chart-modal-content">
      <div class="chart-modal-header">
        <h2 class="chart-modal-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="10" width="4" height="10" rx="1" />
            <rect x="10" y="6" width="4" height="14" rx="1" />
            <rect x="17" y="3" width="4" height="17" rx="1" />
          </svg>
          Salud de Pólizas - Vista Completa
        </h2>
        <button class="chart-modal-close" onclick="window.appHandlers?.closeChartModal?.()" aria-label="Cerrar">×</button>
      </div>
      <div class="chart-modal-body">
        <div class="chart-stats-row">
          <div class="chart-stat-box success">
            <span class="chart-stat-label">Pólizas Activas</span>
            <span class="chart-stat-value">3</span>
            <span class="chart-stat-trend">100% operativas</span>
          </div>
          <div class="chart-stat-box warning">
            <span class="chart-stat-label">Próximas Renovaciones</span>
            <span class="chart-stat-value">2</span>
            <span class="chart-stat-trend">En 30-60 días</span>
          </div>
          <div class="chart-stat-box success">
            <span class="chart-stat-label">Alertas</span>
            <span class="chart-stat-value">0</span>
            <span class="chart-stat-trend">Sin pendientes</span>
          </div>
          <div class="chart-stat-box info">
            <span class="chart-stat-label">Cobertura Total</span>
            <span class="chart-stat-value">$500K</span>
            <span class="chart-stat-trend">Protección completa</span>
          </div>
        </div>
        
        <!-- Monitor gráfico integrado -->
        <div class="chart-visualization">
          <div class="monitor-visual-modal">
            <div class="donut-figure" aria-hidden="true">
              <svg viewBox="0 0 120 120" class="donut-svg" role="presentation">
                <circle class="donut-track" cx="60" cy="60" r="46" />
                <circle class="donut-segment active" cx="60" cy="60" r="46" stroke-dasharray="65 100" stroke-dashoffset="0" />
                <circle class="donut-segment renew" cx="60" cy="60" r="46" stroke-dasharray="22 100" stroke-dashoffset="-65" />
                <circle class="donut-segment risk" cx="60" cy="60" r="46" stroke-dasharray="13 100" stroke-dashoffset="-87" />
                <text x="60" y="56" text-anchor="middle" class="donut-title">65%</text>
                <text x="60" y="74" text-anchor="middle" class="donut-sub">Activas</text>
              </svg>
            </div>
            <div class="donut-meta">
              <p class="donut-desc">65% activas, 22% en renovación, 13% con riesgo.</p>
              <div class="donut-legend">
                <span class="donut-key"><span class="dot active"></span>Activas</span>
                <span class="donut-key"><span class="dot renew"></span>Renovación</span>
                <span class="donut-key"><span class="dot risk"></span>Riesgo</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-details-section">
          <h3>Acciones Pendientes</h3>
          <div class="policy-actions-list">
            <div class="action-item warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div class="action-content">
                <strong>Firma la renovación de Auto</strong>
                <span class="action-detail">Vence el 15 de Marzo</span>
              </div>
              <button class="action-btn" onclick="window.appHandlers?.viewPolicy?.('AUTO-001')">Revisar</button>
            </div>
            <div class="action-item warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div class="action-content">
                <strong>Confirma método de pago para póliza Hogar</strong>
                <span class="action-detail">Requerido para continuar cobertura</span>
              </div>
              <button class="action-btn" onclick="window.appHandlers?.makePayment?.()">Actualizar</button>
            </div>
          </div>
        </div>

        <div class="chart-details-section">
          <h3>Recomendaciones</h3>
          <div class="policy-actions-list">
            <div class="action-item info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
              <div class="action-content">
                <strong>Activa alertas por WhatsApp</strong>
                <span class="action-detail">Recibe notificaciones de vencimientos</span>
              </div>
              <button class="action-btn" onclick="window.appHandlers?.updateInfo?.()">Activar</button>
            </div>
            <div class="action-item info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
              <div class="action-content">
                <strong>Completa tus beneficiarios en póliza Vida</strong>
                <span class="action-detail">Asegura la protección de tu familia</span>
              </div>
              <button class="action-btn" onclick="window.appHandlers?.updateInfo?.()">Completar</button>
            </div>
          </div>
        </div>
        
        <div class="policy-grid-detailed">
          <div class="policy-detail-card active">
            <div class="policy-detail-header">
              <div class="policy-icon auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path>
                  <polygon points="12 15 17 21 7 21 12 15"></polygon>
                </svg>
              </div>
              <div class="policy-detail-info">
                <h4>Póliza Auto</h4>
                <span class="policy-number">#AUTO-001</span>
              </div>
              <span class="policy-status-badge active">Activa</span>
            </div>
            <div class="policy-detail-body">
              <div class="policy-row">
                <span class="policy-label">Cobertura:</span>
                <span class="policy-value">Amplia</span>
              </div>
              <div class="policy-row">
                <span class="policy-label">Vigencia:</span>
                <span class="policy-value">15 Mar 2026 - 15 Mar 2027</span>
              </div>
              <div class="policy-row">
                <span class="policy-label">Prima mensual:</span>
                <span class="policy-value">$150.00</span>
              </div>
              <div class="policy-row">
                <span class="policy-label">Renovación:</span>
                <span class="policy-value warning">En 60 días</span>
              </div>
            </div>
          </div>

          <div class="policy-detail-card active">
            <div class="policy-detail-header">
              <div class="policy-icon home">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div class="policy-detail-info">
                <h4>Póliza Hogar</h4>
                <span class="policy-number">#HOME-001</span>
              </div>
              <span class="policy-status-badge active">Activa</span>
            </div>
            <div class="policy-detail-body">
              <div class="policy-row">
                <span class="policy-label">Cobertura:</span>
                <span class="policy-value">Integral</span>
              </div>
              <div class="policy-row">
                <span class="policy-label">Vigencia:</span>
                <span class="policy-value">01 Ene 2026 - 01 Ene 2027</span>
              </div>
              <div class="policy-row">
                <span class="policy-label">Prima mensual:</span>
                <span class="policy-value">$200.00</span>
              </div>
              <div class="policy-row">
                <span class="policy-label">Renovación:</span>
                <span class="policy-value">En 180 días</span>
              </div>
            </div>
          </div>

          <div class="policy-detail-card active">
            <div class="policy-detail-header">
              <div class="policy-icon life">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <div class="policy-detail-info">
                <h4>Póliza Vida</h4>
                <span class="policy-number">#LIFE-001</span>
              </div>
              <span class="policy-status-badge active">Activa</span>
            </div>
            <div class="policy-detail-body">
              <div class="policy-row">
                <span class="policy-label">Cobertura:</span>
                <span class="policy-value">$250,000</span>
              </div>
              <div class="policy-row">
                <span class="policy-label">Vigencia:</span>
                <span class="policy-value">10 Feb 2026 - 10 Feb 2027</span>
              </div>
              <div class="policy-row">
                <span class="policy-label">Prima mensual:</span>
                <span class="policy-value">$100.00</span>
              </div>
              <div class="policy-row">
                <span class="policy-label">Renovación:</span>
                <span class="policy-value warning">En 30 días</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

// Export modal opener functions

/**
 * Load real payment trends data from backend
 */
async function loadPaymentTrendsData() {
  try {
    const response = await apiService.request('?action=payment_trends', { method: 'GET' });
    if (response.success) {
      return response;
    }
    return null;
  } catch (error) {
    console.error('Error loading payment trends:', error);
    return null;
  }
}

/**
 * Generate chart bars HTML from real data
 */
function generateChartBars(trends) {
  if (!trends || trends.length === 0) {
    return '<div class="no-data-message">No hay datos de pagos disponibles</div>';
  }

  const maxAmount = Math.max(...trends.map(t => parseFloat(t.total_amount || 0)));
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  return trends.map(trend => {
    const amount = parseFloat(trend.total_amount || 0);
    const height = maxAmount > 0 ? (amount / maxAmount * 100) : 0;
    const onTimeCount = parseInt(trend.on_time_count || 0);
    const lateCount = parseInt(trend.late_count || 0);
    const barColor = lateCount > onTimeCount ? '#f5576c' : '#38ef7d';
    const monthParts = trend.month.split('-');
    const monthLabel = monthNames[parseInt(monthParts[1]) - 1] || trend.month;

    return `
            <div class="chart-bar" style="height: ${Math.max(height, 5)}%; --bar-color: ${barColor};">
                <span class="bar-label">${monthLabel}</span>
                <span class="bar-value">$${amount.toFixed(0)}</span>
            </div>
        `;
  }).join('');
}

async function openPaymentTrendsModal() {
  closeChartModal(); // Close any existing modal first

  const data = await loadPaymentTrendsData();

  const chartBarsHTML = data && data.trends ? generateChartBars(data.trends) : `
      <div class="chart-bar" style="height: 65%; --bar-color: #38ef7d;">
          <span class="bar-label">Ene</span>
          <span class="bar-value">$420</span>
      </div>
      <div class="chart-bar" style="height: 72%; --bar-color: #38ef7d;">
          <span class="bar-label">Feb</span>
          <span class="bar-value">$435</span>
      </div>
      <div class="chart-bar" style="height: 85%; --bar-color: #38ef7d;">
          <span class="bar-label">Mar</span>
          <span class="bar-value">$450</span>
      </div>
  `;

  const summary = data?.summary || {
    total_payments: 24,
    on_time: 23,
    late: 2,
    on_time_rate: 96
  };

  const PAYMENT_TRENDS_MODAL_DYNAMIC = `
    <div class="chart-modal-overlay active" id="chartModalOverlay">
      <div class="chart-modal-content">
        <div class="chart-modal-header">
          <h2 class="chart-modal-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 17 8 11 13 14 21 6" />
              <polyline points="14 6 21 6 21 13" />
            </svg>
            Tendencia de Pagos - Vista Completa
          </h2>
          <button class="chart-modal-close" onclick="window.appHandlers?.closeChartModal?.()" aria-label="Cerrar">×</button>
        </div>
        <div class="chart-modal-body">
          <div class="chart-stats-row">
            <div class="chart-stat-box">
              <span class="chart-stat-label">Total de pagos</span>
              <span class="chart-stat-value">${summary.total_payments}</span>
              <span class="chart-stat-trend positive">Últimos 12 meses</span>
            </div>
            <div class="chart-stat-box">
              <span class="chart-stat-label">Pagos puntuales</span>
              <span class="chart-stat-value">${summary.on_time_rate}%</span>
              <span class="chart-stat-trend positive">${summary.on_time} de ${summary.total_payments}</span>
            </div>
            <div class="chart-stat-box">
              <span class="chart-stat-label">Retrasos</span>
              <span class="chart-stat-value">${summary.late}</span>
              <span class="chart-stat-trend ${summary.late > 0 ? 'negative' : 'positive'}">${summary.late > 0 ? 'Mejorar' : 'Excelente'}</span>
            </div>
          </div>
          
          <div class="chart-visualization">
            <div class="chart-graph-placeholder">
              <div class="chart-bars">
                ${chartBarsHTML}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', PAYMENT_TRENDS_MODAL_DYNAMIC);

  const modal = document.getElementById('chartModalOverlay');
  if (modal) {
    const modalContent = modal.querySelector('.chart-modal-content');

    // Prevent closing when clicking inside modal content
    if (modalContent) {
      modalContent.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Close when clicking on overlay (backdrop) ONLY
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeChartModal();
      }
    });

    // Add keyboard ESC to close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeChartModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }
}

function openPolicyHealthModal() {
  closeChartModal(); // Close any existing modal first
  document.body.insertAdjacentHTML('beforeend', POLICY_HEALTH_MODAL);

  const modal = document.getElementById('chartModalOverlay');
  if (modal) {
    const modalContent = modal.querySelector('.chart-modal-content');

    // Prevent closing when clicking inside modal content
    if (modalContent) {
      modalContent.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Close when clicking on overlay (backdrop) ONLY
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeChartModal();
      }
    });

    // Add keyboard ESC to close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeChartModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }
}

function closeChartModal() {
  const modal = document.getElementById('chartModalOverlay');
  if (modal) {
    modal.remove();
  }
}

export {
  openPaymentTrendsModal,
  openPolicyHealthModal,
  closeChartModal
};
