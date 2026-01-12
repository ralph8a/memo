/**
 * Contacts Manager Module
 * Manages agent directory, client contacts, and contact information
 */

// In-memory storage (replace with API for production)
let agents = [];
let clients = [];

/**
 * Agent directory structure
 * @typedef {Object} Agent
 * @property {string} id - Agent ID (ag_xxx)
 * @property {string} name - Full name
 * @property {string} email - Agent email
 * @property {string} phone - Phone number
 * @property {string} avatar - Avatar URL/initials
 * @property {Array<string>} specialties - Insurance types: ['auto', 'hogar', 'vida', 'salud', 'viaje', 'comercial']
 * @property {string} bio - Short biography
 * @property {number} yearsExperience - Years in the business
 * @property {number} clientsServed - Total clients
 * @property {number} satisfaction - Satisfaction rating (0-100)
 * @property {Array<string>} languages - Languages spoken
 * @property {string} status - 'available', 'busy', 'offline'
 */

/**
 * Client contact structure
 * @typedef {Object} ClientContact
 * @property {string} id - Client ID
 * @property {string} name - Client name
 * @property {string} email - Email address
 * @property {string} phone - Phone number
 * @property {string} lastInteraction - ISO date string
 * @property {Array<string>} tags - Custom tags/labels
 * @property {string} notes - Internal notes
 */

/**
 * Initialize agents directory
 */
function initializeAgents() {
    agents = [
        {
            id: 'ag_001',
            name: 'Carlos Mendez',
            email: 'agente@demo.com',
            phone: '+1 (555) 123-4567',
            avatar: 'CM',
            specialties: ['auto', 'hogar', 'comercial'],
            bio: 'Especialista en seguros de vehículos y propiedades',
            yearsExperience: 8,
            clientsServed: 234,
            satisfaction: 4.8,
            languages: ['Spanish', 'English'],
            status: 'available'
        },
        {
            id: 'ag_002',
            name: 'María López',
            email: 'maria@ksinsurance.com',
            phone: '+1 (555) 234-5678',
            avatar: 'ML',
            specialties: ['vida', 'salud', 'viaje'],
            bio: 'Experta en seguros de vida y gastos médicos',
            yearsExperience: 12,
            clientsServed: 456,
            satisfaction: 4.9,
            languages: ['Spanish', 'English', 'Portuguese'],
            status: 'available'
        },
        {
            id: 'ag_003',
            name: 'Juan Rivera',
            email: 'juan@ksinsurance.com',
            phone: '+1 (555) 345-6789',
            avatar: 'JR',
            specialties: ['comercial', 'auto', 'viaje'],
            bio: 'Especialista en seguros comerciales',
            yearsExperience: 10,
            clientsServed: 189,
            satisfaction: 4.7,
            languages: ['Spanish', 'English'],
            status: 'busy'
        }
    ];
}

/**
 * Get all agents
 * @param {Object} options - Filter options: {specialties, status, search}
 * @returns {Array} Agents
 */
export function getAgents(options = {}) {
    let filtered = [...agents];

    if (options.specialties && options.specialties.length > 0) {
        filtered = filtered.filter(agent =>
            agent.specialties.some(s => options.specialties.includes(s))
        );
    }

    if (options.status) {
        filtered = filtered.filter(agent => agent.status === options.status);
    }

    if (options.search) {
        const searchLower = options.search.toLowerCase();
        filtered = filtered.filter(agent =>
            agent.name.toLowerCase().includes(searchLower) ||
            agent.email.toLowerCase().includes(searchLower) ||
            agent.specialties.join(',').includes(searchLower)
        );
    }

    return filtered;
}

/**
 * Get agent by ID
 * @param {string} agentId - Agent ID
 * @returns {Object} Agent or null
 */
export function getAgentById(agentId) {
    return agents.find(a => a.id === agentId) || null;
}

/**
 * Get agents by specialty
 * @param {string} specialty - Insurance type: auto, hogar, vida, salud, viaje, comercial
 * @returns {Array} Agents with that specialty
 */
export function getAgentsBySpecialty(specialty) {
    return agents.filter(agent => agent.specialties.includes(specialty));
}

/**
 * Update agent status
 * @param {string} agentId - Agent ID
 * @param {string} status - New status: 'available', 'busy', 'offline'
 * @returns {Object} Updated agent
 */
export function updateAgentStatus(agentId, status) {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) throw new Error('Agent not found');

    if (!['available', 'busy', 'offline'].includes(status)) {
        throw new Error('Invalid status');
    }

    agent.status = status;
    return agent;
}

/**
 * Get agent contact card (public info)
 * @param {string} agentId - Agent ID
 * @returns {Object} Public agent info
 */
export function getAgentCard(agentId) {
    const agent = getAgentById(agentId);
    if (!agent) return null;

    return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        avatar: agent.avatar,
        specialties: agent.specialties,
        bio: agent.bio,
        yearsExperience: agent.yearsExperience,
        satisfaction: agent.satisfaction,
        languages: agent.languages,
        status: agent.status
    };
}

/**
 * Add client contact
 * @param {string} clientId - Client ID
 * @param {Object} contactData - Contact data
 * @returns {Object} Client contact
 */
export function addClientContact(clientId, contactData) {
    const {
        name,
        email,
        phone,
        tags = [],
        notes = ''
    } = contactData;

    if (!clientId || !name || !email) {
        throw new Error('Missing required fields: clientId, name, email');
    }

    const contact = {
        id: clientId,
        name,
        email,
        phone: phone || '',
        lastInteraction: new Date().toISOString(),
        tags,
        notes
    };

    // Remove if exists, then add (update behavior)
    clients = clients.filter(c => c.id !== clientId);
    clients.push(contact);

    return contact;
}

/**
 * Get client contact
 * @param {string} clientId - Client ID
 * @returns {Object} Client contact or null
 */
export function getClientContact(clientId) {
    return clients.find(c => c.id === clientId) || null;
}

/**
 * Update client contact
 * @param {string} clientId - Client ID
 * @param {Object} updates - Fields to update
 * @returns {Object} Updated contact
 */
export function updateClientContact(clientId, updates) {
    const contact = clients.find(c => c.id === clientId);
    if (!contact) throw new Error('Contact not found');

    Object.assign(contact, updates);
    contact.lastInteraction = new Date().toISOString();

    return contact;
}

/**
 * Add tag to client
 * @param {string} clientId - Client ID
 * @param {string} tag - Tag to add
 * @returns {Object} Updated contact
 */
export function addClientTag(clientId, tag) {
    const contact = getClientContact(clientId);
    if (!contact) throw new Error('Contact not found');

    if (!contact.tags.includes(tag)) {
        contact.tags.push(tag);
    }

    return contact;
}

/**
 * Search clients
 * @param {string} query - Search query
 * @returns {Array} Matching clients
 */
export function searchClients(query) {
    const queryLower = query.toLowerCase();
    return clients.filter(c =>
        c.name.toLowerCase().includes(queryLower) ||
        c.email.toLowerCase().includes(queryLower) ||
        c.phone.includes(query) ||
        c.tags.some(t => t.toLowerCase().includes(queryLower))
    );
}

/**
 * Get clients by tag
 * @param {string} tag - Tag name
 * @returns {Array} Clients with that tag
 */
export function getClientsByTag(tag) {
    return clients.filter(c => c.tags.includes(tag));
}

/**
 * Get all client contacts
 * @returns {Array} All client contacts
 */
export function getAllClients() {
    return [...clients];
}

/**
 * Initialize with demo data
 */
export function initializeDemo() {
    initializeAgents();

    clients = [
        {
            id: 'cl_001',
            name: 'Roberto García',
            email: 'cliente@demo.com',
            phone: '+1 (555) 111-2222',
            lastInteraction: new Date().toISOString(),
            tags: ['auto', 'hogar', 'vip'],
            notes: 'Cliente desde 2020, muy satisfecho'
        },
        {
            id: 'cl_002',
            name: 'Ana Martinez',
            email: 'ana@example.com',
            phone: '+1 (555) 222-3333',
            lastInteraction: new Date().toISOString(),
            tags: ['vida', 'nuevo'],
            notes: 'Nuevos cliente, requiere seguimiento'
        }
    ];
}

// Initialize on module load
initializeDemo();

export default {
    getAgents,
    getAgentById,
    getAgentsBySpecialty,
    updateAgentStatus,
    getAgentCard,
    addClientContact,
    getClientContact,
    updateClientContact,
    addClientTag,
    searchClients,
    getClientsByTag,
    getAllClients,
    initializeDemo
};
