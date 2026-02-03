/**
 * Meeting Scheduling Module
 * Manages calendar events, reservations, and meeting bookings
 * Now with backend integration and monthly/yearly views
 */

import { apiService, API_CONFIG } from '../api-integration.js';
import { showNotification } from './notifications.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';

// In-memory storage (synced with backend)
let meetings = [];
let agentAvailability = {};
let currentView = 'week'; // 'day', 'week', 'month', 'year'

/**
 * Meeting data structure
 * @typedef {Object} Meeting
 * @property {string} id - Unique meeting ID (mtg_xxx)
 * @property {string} agentId - Agent identifier
 * @property {string} agentName - Agent full name
 * @property {string} clientId - Client identifier (if scheduled)
 * @property {string} clientName - Client name (if scheduled)
 * @property {string} clientEmail - Client email
 * @property {Date} startTime - Meeting start time
 * @property {Date} endTime - Meeting end time
 * @property {string} type - Meeting type: 'quote', 'consultation', 'renewal', 'support'
 * @property {string} status - 'available', 'requested', 'confirmed', 'completed', 'cancelled'
 * @property {string} notes - Additional notes
 * @property {Object} confirmations - {agent: bool, client: bool}
 * @property {Object} reminders - {agent: string, client: string} ('24h', '1h', etc)
 */

/**
 * Get agent availability for a date range
 * @param {string} agentId - Agent ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Available slots (30-min intervals)
 */
export function getAgentAvailability(agentId, startDate, endDate) {
    const slots = [];
    const current = new Date(startDate);

    while (current < endDate) {
        const hour = current.getHours();
        // Business hours: 9 AM - 5 PM, Mon-Fri
        if (hour >= 9 && hour < 17 && current.getDay() !== 0 && current.getDay() !== 6) {
            // Check if slot is already booked
            const isBooked = meetings.some(m =>
                m.agentId === agentId &&
                m.status !== 'cancelled' &&
                new Date(m.startTime) <= current &&
                new Date(m.endTime) > current
            );

            if (!isBooked) {
                slots.push({
                    time: new Date(current),
                    available: true
                });
            }
        }
        current.setMinutes(current.getMinutes() + 30);
    }

    return slots;
}

/**
 * Get all meetings for an agent
 * @param {string} agentId - Agent ID
 * @param {Object} options - Filters: {startDate, endDate, status}
 * @returns {Array} Filtered meetings
 */
export function getAgentMeetings(agentId, options = {}) {
    let filtered = meetings.filter(m => m.agentId === agentId);

    if (options.startDate) {
        filtered = filtered.filter(m => new Date(m.startTime) >= new Date(options.startDate));
    }
    if (options.endDate) {
        filtered = filtered.filter(m => new Date(m.startTime) <= new Date(options.endDate));
    }
    if (options.status) {
        filtered = filtered.filter(m => m.status === options.status);
    }

    return filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

/**
 * Get client meetings
 * @param {string} clientId - Client ID
 * @param {Object} options - Filter options
 * @returns {Array} Client meetings
 */
export function getClientMeetings(clientId, options = {}) {
    let filtered = meetings.filter(m => m.clientId === clientId);

    if (options.startDate) {
        filtered = filtered.filter(m => new Date(m.startTime) >= new Date(options.startDate));
    }
    if (options.endDate) {
        filtered = filtered.filter(m => new Date(m.startTime) <= new Date(options.endDate));
    }
    if (options.status) {
        filtered = filtered.filter(m => m.status === options.status);
    }

    return filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

/**
 * Request a meeting with an agent
 * @param {Object} request - Request data
 * @returns {Promise<Object>} Created meeting or error
 */
export async function requestMeeting(request) {
    const {
        agentId,
        agentName,
        clientId,
        clientName,
        clientEmail,
        startTime,
        endTime,
        type,
        notes,
        location
    } = request;

    // Validate
    if (!startTime || !endTime || !clientEmail) {
        throw new Error('Missing required fields');
    }

    try {
        const result = await apiService.request(
            API_CONFIG.ENDPOINTS.CREATE_MEETING,
            {
                method: 'POST',
                body: {
                    title: type ? `${type.charAt(0).toUpperCase() + type.slice(1)} - ${clientName}` : `Meeting with ${clientName}`,
                    description: notes || '',
                    start_time: startTime,
                    end_time: endTime,
                    location: location || 'Virtual Meeting',
                    attendee_email: clientEmail,
                    attendee_name: clientName,
                    organizer_email: agentName ? 'agent@ksinsurancee.com' : 'admin@ksinsurancee.com',
                    organizer_name: agentName || 'Krause Insurance'
                }
            },
            { useCache: false }
        );

        // Add to local cache
        await loadMeetingsFromBackend();

        showNotification('Meeting created and invitation sent via email', NOTIFICATION_TYPES.SUCCESS);
        return result;
    } catch (error) {
        showNotification('Failed to create meeting: ' + error.message, NOTIFICATION_TYPES.ERROR);
        throw error;
    }
}

/**
 * Confirm a meeting request
 * @param {string} meetingId - Meeting ID
 * @param {string} confirmedBy - 'agent' or 'client'
 * @returns {Promise<Object>} Updated meeting
 */
export async function confirmMeeting(meetingId, confirmedBy) {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) throw new Error('Meeting not found');

    meeting.confirmations[confirmedBy] = true;

    // If both confirmed, update status
    if (meeting.confirmations.agent && meeting.confirmations.client) {
        meeting.status = 'confirmed';
        scheduleReminder(meeting, 'agent');
        scheduleReminder(meeting, 'client');
    }

    return meeting;
}

/**
 * Cancel a meeting
 * @param {string} meetingId - Meeting ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Cancelled meeting
 */
export async function cancelMeeting(meetingId, reason = '') {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) throw new Error('Meeting not found');

    meeting.status = 'cancelled';
    meeting.notes = (meeting.notes ? meeting.notes + ' | ' : '') + `Cancelled: ${reason}`;

    return meeting;
}

/**
 * Complete a meeting
 * @param {string} meetingId - Meeting ID
 * @param {string} summary - Meeting summary/notes
 * @returns {Promise<Object>} Completed meeting
 */
export async function completeMeeting(meetingId, summary = '') {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) throw new Error('Meeting not found');

    meeting.status = 'completed';
    if (summary) {
        meeting.notes = (meeting.notes ? meeting.notes + ' | ' : '') + `Summary: ${summary}`;
    }

    return meeting;
}

/**
 * Schedule a reminder (trigger notification)
 * @param {Object} meeting - Meeting object
 * @param {string} recipientType - 'agent' or 'client'
 */
function scheduleReminder(meeting, recipientType) {
    const recipient = recipientType === 'agent' ? meeting.agentName : meeting.clientName;
    const reminderTime = meeting.reminders[recipientType];

    // Calculate delay based on reminder preference
    const meetingTime = new Date(meeting.startTime).getTime();
    const now = Date.now();
    let delayMs = meetingTime - now;

    // Set reminder for the specified time before meeting
    if (reminderTime === '24h') {
        delayMs = meetingTime - (24 * 60 * 60 * 1000) - now;
    } else if (reminderTime === '1h') {
        delayMs = meetingTime - (60 * 60 * 1000) - now;
    }

    if (delayMs > 0) {
        setTimeout(() => {
            triggerReminder(meeting, recipientType);
        }, delayMs);
    }
}

/**
 * Trigger reminder notification
 * @param {Object} meeting - Meeting object
 * @param {string} recipientType - 'agent' or 'client'
 */
function triggerReminder(meeting, recipientType) {
    const recipient = recipientType === 'agent' ? meeting.agentName : meeting.clientName;
    const time = new Date(meeting.startTime).toLocaleString();

    const message = `Recordatorio: Tienes una cita ${meeting.type} en ${time}`;

    // Store reminder (could also send email/SMS in production)
    if (window.showNotification) {
        window.showNotification(message, 'info');
    }
}

/**
 * Get meeting by ID
 * @param {string} meetingId - Meeting ID
 * @returns {Object} Meeting or null
 */
export function getMeetingById(meetingId) {
    return meetings.find(m => m.id === meetingId) || null;
}

/**
 * Get all pending meeting requests for an agent
 * @param {string} agentId - Agent ID
 * @returns {Array} Pending requests
 */
export function getPendingRequests(agentId) {
    return meetings.filter(m =>
        m.agentId === agentId &&
        m.status === 'requested' &&
        !m.confirmations.agent
    );
}

/**
 * Get available agents for a time slot
 * @param {Date} startTime - Requested start time
 * @param {Date} endTime - Requested end time
 * @returns {Array} Available agents
 */
export function getAvailableAgents(startTime, endTime) {
    // Mock agents list - replace with API call
    const allAgents = [
        { id: 'ag_001', name: 'Carlos Mendez', specialties: ['auto', 'hogar'] },
        { id: 'ag_002', name: 'María López', specialties: ['vida', 'salud'] },
        { id: 'ag_003', name: 'Juan Rivera', specialties: ['comercial', 'viaje'] }
    ];

    return allAgents.filter(agent => {
        const conflict = meetings.find(m =>
            m.agentId === agent.id &&
            m.status !== 'cancelled' &&
            new Date(m.startTime) < new Date(endTime) &&
            new Date(m.endTime) > new Date(startTime)
        );
        return !conflict;
    });
}

/**
 * Load meetings from backend
 */
export async function loadMeetingsFromBackend(startDate = null, endDate = null) {
    try {
        const params = {};
        if (startDate) params.start = startDate;
        if (endDate) params.end = endDate;

        const result = await apiService.request(
            API_CONFIG.ENDPOINTS.LIST_MEETINGS,
            { method: 'GET', queryParams: params }
        );

        meetings = result.map(m => ({
            id: m.id,
            agentId: m.user_id,
            agentName: m.organizer_name || 'Krause Insurance',
            clientId: m.attendee_id,
            clientName: m.attendee_name,
            clientEmail: m.attendee_email,
            startTime: new Date(m.start_time),
            endTime: new Date(m.end_time),
            type: m.title.toLowerCase().includes('quote') ? 'quote' : 'consultation',
            status: m.status,
            notes: m.description || '',
            location: m.location,
            confirmations: {
                agent: m.status !== 'pending',
                client: m.status === 'confirmed'
            },
            reminders: { agent: '24h', client: '24h' }
        }));

        return meetings;
    } catch (error) {
        console.error('Failed to load meetings:', error);
        return [];
    }
}

/**
 * Change calendar view
 */
export function setCalendarView(view) {
    if (['day', 'week', 'month', 'year'].includes(view)) {
        currentView = view;
        return currentView;
    }
    throw new Error('Invalid view. Use: day, week, month, or year');
}

/**
 * Get current calendar view
 */
export function getCalendarView() {
    return currentView;
}

/**
 * Get meetings for month view
 */
export function getMonthMeetings(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    return meetings.filter(m => {
        const meetingDate = new Date(m.startTime);
        return meetingDate >= firstDay && meetingDate <= lastDay;
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

/**
 * Get meetings for year view (grouped by month)
 */
export function getYearMeetings(year) {
    const yearMeetings = {};

    for (let month = 0; month < 12; month++) {
        const monthName = new Date(year, month, 1).toLocaleString('es', { month: 'long' });
        yearMeetings[monthName] = getMonthMeetings(year, month);
    }

    return yearMeetings;
}

/**
 * Get meeting statistics for a period
 */
export function getMeetingStats(startDate, endDate) {
    const filtered = meetings.filter(m => {
        const meetingDate = new Date(m.startTime);
        return meetingDate >= new Date(startDate) && meetingDate <= new Date(endDate);
    });

    return {
        total: filtered.length,
        confirmed: filtered.filter(m => m.status === 'confirmed').length,
        pending: filtered.filter(m => m.status === 'pending').length,
        completed: filtered.filter(m => m.status === 'completed').length,
        cancelled: filtered.filter(m => m.status === 'cancelled').length,
        byType: {
            quote: filtered.filter(m => m.type === 'quote').length,
            consultation: filtered.filter(m => m.type === 'consultation').length,
            renewal: filtered.filter(m => m.type === 'renewal').length,
            support: filtered.filter(m => m.type === 'support').length
        }
    };
}

/**
 * Initialize with mock data (for demo)
 */
export function initializeMockMeetings() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    meetings = [
        {
            id: 'mtg_demo_001',
            agentId: 'ag_001',
            agentName: 'Carlos Mendez',
            clientId: 'cl_001',
            clientName: 'Roberto García',
            clientEmail: 'cliente@demo.com',
            startTime: new Date(tomorrow.setHours(10, 0, 0)),
            endTime: new Date(tomorrow.setHours(10, 30, 0)),
            type: 'quote',
            status: 'confirmed',
            notes: 'Consulta sobre seguro de auto',
            confirmations: { agent: true, client: true },
            reminders: { agent: '24h', client: '24h' }
        },
        {
            id: 'mtg_demo_002',
            agentId: 'ag_002',
            agentName: 'María López',
            clientId: 'cl_002',
            clientName: 'Ana Martinez',
            clientEmail: 'ana@example.com',
            startTime: new Date(nextWeek.setHours(14, 0, 0)),
            endTime: new Date(nextWeek.setHours(14, 30, 0)),
            type: 'renewal',
            status: 'requested',
            notes: 'Renovación de póliza de vida',
            confirmations: { agent: false, client: false },
            reminders: { agent: '24h', client: '24h' }
        }
    ];
}

/**
 * Open meeting scheduler modal with calendar UI
 */
export async function openMeetingScheduler() {
    // Load current meetings from backend
    await loadMeetingsFromBackend();

    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const availableSlots = getAgentAvailability('ag_001', today, nextMonth);

    const modal = document.createElement('div');
    modal.className = 'app-modal-overlay';
    modal.innerHTML = `
        <div class="app-modal app-modal-lg">
            <div class="app-modal-header">
                <h2 class="app-modal-title">📅 Calendario de Citas</h2>
                <button class="app-modal-close" onclick="this.closest('.app-modal-overlay').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="app-modal-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    <div>
                        <h3 style="margin: 0 0 16px;">Seleccionar Horario</h3>
                        <form id="meetingSchedulerForm" style="display: grid; gap: 16px;">
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
                                <input type="date" name="date" required class="form-control" 
                                    min="${today.toISOString().split('T')[0]}"
                                    value="${today.toISOString().split('T')[0]}">
                            </div>
                            <div class="form-group">
                                <label>Hora de inicio</label>
                                <select name="startTime" required class="form-control">
                                    ${generateTimeOptions()}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Duración</label>
                                <select name="duration" required class="form-control">
                                    <option value="30">30 minutos</option>
                                    <option value="60" selected>1 hora</option>
                                    <option value="90">1.5 horas</option>
                                    <option value="120">2 horas</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Cliente (Email)</label>
                                <input type="email" name="clientEmail" required class="form-control" 
                                    placeholder="cliente@example.com">
                            </div>
                            <div class="form-group">
                                <label>Nombre del cliente</label>
                                <input type="text" name="clientName" required class="form-control" 
                                    placeholder="Nombre completo">
                            </div>
                            <div class="form-group">
                                <label>Notas (opcional)</label>
                                <textarea name="notes" class="form-control" rows="3" 
                                    placeholder="Detalles adicionales..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div>
                        <h3 style="margin: 0 0 16px;">Próximas Citas</h3>
                        <div id="upcomingMeetingsContainer" style="max-height: 400px; overflow-y: auto;">
                            ${renderUpcomingMeetings(meetings)}
                        </div>
                    </div>
                </div>
            </div>
            <div class="app-modal-footer">
                <button class="btn btn-outline" onclick="this.closest('.app-modal-overlay').remove()">Cancelar</button>
                <button class="btn btn-primary" onclick="window.scheduling?.submitMeetingRequest?.()">Crear Cita</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

/**
 * Generate time slot options for select
 */
function generateTimeOptions() {
    const options = [];
    for (let hour = 9; hour < 17; hour++) {
        for (let min = 0; min < 60; min += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
            const label = new Date(2000, 0, 1, hour, min).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
            options.push(`<option value="${time}">${label}</option>`);
        }
    }
    return options.join('');
}

/**
 * Render upcoming meetings list
 */
function renderUpcomingMeetings(meetingsList) {
    if (!meetingsList || meetingsList.length === 0) {
        return '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No hay citas programadas</p>';
    }

    const upcoming = meetingsList
        .filter(m => new Date(m.startTime) >= new Date() && m.status !== 'cancelled')
        .slice(0, 10);

    if (upcoming.length === 0) {
        return '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No hay citas próximas</p>';
    }

    return upcoming.map(meeting => {
        const startTime = new Date(meeting.startTime);
        const statusColors = {
            'confirmed': '#38ef7d',
            'requested': '#ffd700',
            'pending': '#ff9800'
        };

        return `
            <div style="padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <strong style="color: var(--text-primary);">${meeting.clientName}</strong>
                    <span style="padding: 2px 8px; border-radius: 4px; font-size: 11px; background: ${statusColors[meeting.status]}22; color: ${statusColors[meeting.status]};">
                        ${meeting.status}
                    </span>
                </div>
                <div style="font-size: 13px; color: var(--text-secondary);">
                    📅 ${startTime.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    • ${startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                    ${meeting.type} • ${meeting.clientEmail}
                </div>
                ${meeting.notes ? `<div style="font-size: 12px; color: var(--text-tertiary); margin-top: 8px; font-style: italic;">${meeting.notes}</div>` : ''}
            </div>
        `;
    }).join('');
}

/**
 * Submit meeting request from modal
 */
export async function submitMeetingRequest() {
    const form = document.getElementById('meetingSchedulerForm');
    if (!form || !form.checkValidity()) {
        form?.reportValidity();
        return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Parse date and time
    const [year, month, day] = data.date.split('-').map(Number);
    const [hours, minutes] = data.startTime.split(':').map(Number);
    const duration = parseInt(data.duration);

    const startTime = new Date(year, month - 1, day, hours, minutes);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    try {
        showNotification('Creando cita...', NOTIFICATION_TYPES.INFO);

        await requestMeeting({
            agentId: 'ag_001', // TODO: Get from current user
            agentName: 'Krause Insurance',
            clientId: null,
            clientName: data.clientName,
            clientEmail: data.clientEmail,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            type: data.type,
            notes: data.notes,
            location: 'Virtual Meeting'
        });

        // Close modal
        document.querySelector('.app-modal-overlay')?.remove();

    } catch (error) {
        console.error('Error creating meeting:', error);
        showNotification('Error al crear la cita', NOTIFICATION_TYPES.ERROR);
    }
}

// Initialize mock data on module load
initializeMockMeetings();

// Expose functions globally for modal callbacks
if (typeof window !== 'undefined') {
    window.scheduling = {
        submitMeetingRequest,
        openMeetingScheduler
    };
}

export default {
    getAgentAvailability,
    getAgentMeetings,
    getClientMeetings,
    requestMeeting,
    confirmMeeting,
    cancelMeeting,
    completeMeeting,
    getMeetingById,
    getPendingRequests,
    getAvailableAgents,
    initializeMockMeetings,
    openMeetingScheduler,
    submitMeetingRequest
};
