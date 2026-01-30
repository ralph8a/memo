/**
 * Payment Calendar Module
 * Renders a dynamic payment calendar with upcoming payment dates from the backend
 */

import { apiService, API_CONFIG } from '../api-integration.js';
import { showNotification } from './notifications.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';

/**
 * Render payment calendar with real data from backend
 */
export async function renderPaymentCalendar() {
    const calendarContainer = document.querySelector('.calendar-card .calendar-grid');
    if (!calendarContainer) return;

    // Don't fetch if not authenticated
    if (!localStorage.getItem('jwt_token')) {
        console.log('⚠️ Payment calendar skipped - user not authenticated');
        return;
    }

    try {
        // Fetch payment history and schedules from backend
        const payments = await apiService.request(
            API_CONFIG.ENDPOINTS.CLIENT_PAYMENTS,
            { method: 'GET' }
        ).catch(() => []);

        // Build calendar data
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Get first day of current month and number of days
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Days of week headers
        const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        // Create calendar HTML
        let calendarHTML = '';

        // Add day headers
        daysOfWeek.forEach(day => {
            calendarHTML += `<div class="cal-day-header">${day}</div>`;
        });

        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarHTML += `<div class="cal-day muted"></div>`;
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(currentYear, currentMonth, day);
            const dateStr = dateObj.toISOString().split('T')[0];

            // Check if this date has payments
            const dayPayments = payments.filter(p => p.payment_date?.startsWith(dateStr));
            const isToday = day === today.getDate() && currentMonth === today.getMonth();

            let dayClass = 'cal-day';
            if (isToday) dayClass += ' today';
            if (dayPayments.length > 0) dayClass += ' has-payment';

            const paymentInfo = dayPayments.length > 0
                ? `<span class="payment-count">${dayPayments.length}</span>`
                : '';

            calendarHTML += `
                <div class="${dayClass}" data-date="${dateStr}" title="${dayPayments.length} pago(s)">
                    ${day}${paymentInfo}
                </div>
            `;
        }

        // Update calendar container
        calendarContainer.innerHTML = calendarHTML;

        // Render upcoming payment slots below the calendar
        renderUpcomingPaymentSlots(payments);

    } catch (error) {
        console.error('Error rendering payment calendar:', error);
        calendarContainer.innerHTML = `
            <div class="calendar-error">
                <p>Error cargando calendario de pagos</p>
            </div>
        `;
    }
}

/**
 * Render upcoming payment schedule in the calendar card
 */
function renderUpcomingPaymentSlots(payments) {
    const calendarCard = document.querySelector('.calendar-card');
    if (!calendarCard) return;

    // Find or create upcoming payments container
    let upcomingContainer = calendarCard.querySelector('.upcoming-payments');
    if (!upcomingContainer) {
        upcomingContainer = document.createElement('div');
        upcomingContainer.className = 'upcoming-payments';
        calendarCard.appendChild(upcomingContainer);
    }

    // Get next 5 upcoming payments
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingPayments = payments
        .filter(p => {
            const payDate = new Date(p.payment_date);
            payDate.setHours(0, 0, 0, 0);
            return payDate >= today;
        })
        .sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date))
        .slice(0, 5);

    if (upcomingPayments.length === 0) {
        upcomingContainer.innerHTML = `
            <div class="payment-slot muted">
                <span>Próximos pagos: No hay pagos programados</span>
            </div>
        `;
        return;
    }

    // Render each upcoming payment
    let html = '';
    upcomingPayments.forEach(payment => {
        const payDate = new Date(payment.payment_date);
        const dateStr = payDate.toLocaleDateString('es-MX', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        const statusClass = `status-${payment.status || 'pending'}`;
        const amount = typeof payment.amount === 'number'
            ? `$${payment.amount.toFixed(2)}`
            : payment.amount;

        const policyInfo = payment.policy_number || payment.policy_type || 'Póliza';

        html += `
            <div class="payment-slot ${statusClass}" data-payment-id="${payment.id || ''}">
                <div class="payment-slot-info">
                    <span class="payment-date">${dateStr}</span>
                    <span class="payment-policy">${policyInfo}</span>
                    <span class="payment-amount">${amount}</span>
                </div>
                <button class="btn btn-xs btn-ghost payment-receipt-btn" data-payment-id="${payment.id || ''}" title="Ver comprobante">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                </button>
            </div>
        `;
    });

    upcomingContainer.innerHTML = html;

    // Add click handlers for payment slots
    upcomingContainer.querySelectorAll('.payment-slot-info').forEach(slot => {
        slot.addEventListener('click', () => {
            const paymentSlot = slot.closest('.payment-slot');
            const paymentId = paymentSlot.getAttribute('data-payment-id');
            if (paymentId) {
                showPaymentDetails(paymentId, payments);
            }
        });
    });

    // Add click handlers for receipt buttons
    upcomingContainer.querySelectorAll('.payment-receipt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const paymentId = btn.getAttribute('data-payment-id');
            if (paymentId && window.appHandlers?.viewReceipt) {
                window.appHandlers.viewReceipt(paymentId);
            } else {
                showNotification('Función de comprobantes próximamente disponible', NOTIFICATION_TYPES.INFO);
            }
        });
    });
}

/**
 * Show payment details in a tooltip/modal
 */
function showPaymentDetails(paymentId, payments) {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    const message = `
        <strong>${payment.policy_number}</strong><br/>
        Monto: $${payment.amount?.toFixed(2) || '0.00'}<br/>
        Estado: ${payment.status || 'Pendiente'}<br/>
        Fecha: ${new Date(payment.payment_date).toLocaleDateString()}
    `;

    showNotification(message, NOTIFICATION_TYPES.INFO);
}

/**
 * Initialize calendar on dashboard load
 */
export function initPaymentCalendar() {
    // Check if calendar card exists
    const calendarCard = document.querySelector('.calendar-card');
    if (!calendarCard) return;

    // Render calendar on page load
    renderPaymentCalendar();

    // Refresh calendar every 5 minutes
    setInterval(() => {
        renderPaymentCalendar();
    }, 5 * 60 * 1000);
}

