/**
 * Meeting Scheduling Module
 * Manages calendar events, reservations, and meeting bookings
 */

// In-memory storage (replace with API calls for production)
let meetings = [];
let agentAvailability = {};

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
        notes
    } = request;

    // Validate
    if (!agentId || !clientId || !startTime || !endTime) {
        throw new Error('Missing required fields');
    }

    // Check for conflicts
    const conflicting = meetings.find(m =>
        m.agentId === agentId &&
        m.status !== 'cancelled' &&
        new Date(m.startTime) < new Date(endTime) &&
        new Date(m.endTime) > new Date(startTime)
    );

    if (conflicting) {
        throw new Error('Agent has a conflict at that time');
    }

    const meeting = {
        id: `mtg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        agentId,
        agentName,
        clientId,
        clientName,
        clientEmail,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        type: type || 'consultation',
        status: 'requested',
        notes: notes || '',
        confirmations: {
            agent: false,
            client: false
        },
        reminders: {
            agent: '24h',
            client: '24h'
        }
    };

    meetings.push(meeting);

    // Trigger notification to agent
    scheduleReminder(meeting, 'agent');

    return meeting;
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

// Initialize mock data on module load
initializeMockMeetings();

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
    initializeMockMeetings
};
