/**
 * Ultra-simple router - NO fetch, NO template loading
 * All templates are already in index.html as hidden sections (injected by webpack at build time)
 * Navigation = just show/hide with classList
 */

import { setPage } from '../core/state.js';
import { PAGES, PAGES_WITHOUT_FOOTER } from '../utils/constants.js';
import { cleanupHomeAnimations, startHomeSequence, initStatsAnimation } from './homeAnimations.js';
import { showNotification } from './notifications.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';
import { clearAllTimers } from '../utils/timing.js';
import { stopParticles, startParticles } from './particles.js';
import { initServicesTechNav } from './servicesTechNav.js';
import { initAboutEnhancements } from './aboutEnhancements.js';
import { initQuoteFlow } from './quoteFlow.js';
import { showLoading, hideLoading } from './loadingModal.js';

const PAGES_WITH_MODAL_LOADING = ['quote', 'client-dashboard', 'agent-dashboard', 'admin-dashboard'];

// Loading messages for different page types
const LOADING_MESSAGES = {
    'quote': { message: 'Preparando cotización', detail: 'Cargando formulario inteligente' },
    'client-dashboard': { message: 'Accediendo a tu panel', detail: 'Cargando tus pólizas y documentos' },
    'agent-dashboard': { message: 'Cargando panel de agente', detail: 'Sincronizando clientes y estadísticas' },
    'admin-dashboard': { message: 'Panel administrativo', detail: 'Cargando análisis y reportes' }
};

let currentPage = 'home';

/**
 * Navigate to a page by showing its section and hiding others
 * Templates are already in the DOM (injected by webpack at build time)
 * We just show/hide them
 */
export function navigateTo(page, event) {
    if (event) {
        event.preventDefault();
    }

    if (!page) page = 'home';

    // Contact page restriction
    if (page === PAGES.CONTACT && !window.__allowContact) {
        showNotification('La sección de Contacto sólo se abre desde el contacto con un agente.', NOTIFICATION_TYPES.INFO);
        return;
    }

    const shouldShowModal = PAGES_WITH_MODAL_LOADING.includes(page);
    if (shouldShowModal) {
        const loadingConfig = LOADING_MESSAGES[page] || { message: 'Cargando sección', detail: 'Preparando contenido' };
        showLoading(loadingConfig.message, loadingConfig.detail, true);
        document.body.classList.add('skeleton-mode');
    }

    // Cleanup previous page
    cleanupHomeAnimations();
    clearAllTimers();

    // Page-specific cleanup hooks (avoid duplicated listeners when revisiting pages)
    try {
        if (typeof window.__servicesTechNavCleanup === 'function') {
            window.__servicesTechNavCleanup();
        }
        delete window.__servicesTechNavCleanup;

        if (typeof window.__aboutEnhancementsCleanup === 'function') {
            window.__aboutEnhancementsCleanup();
        }
        delete window.__aboutEnhancementsCleanup;
    } catch (e) {
        // Non-fatal
        console.warn('[ROUTER] cleanup hook error', e);
    }
    setPage(page);

    // Expose current page as an attribute for page-scoped CSS (e.g. home progress bar)
    document.body.setAttribute('data-page', page);

    // Close mobile menu
    const navMenu = document.getElementById('navMenu');
    if (navMenu) navMenu.classList.remove('active');

    // Update nav links active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) link.classList.add('active');
    });

    // Handle footer visibility & body spacing
    const footer = document.getElementById('footer');
    const hideFooter = PAGES_WITHOUT_FOOTER.includes(page);

    document.body.classList.toggle('no-footer', hideFooter);

    if (footer) {
        if (hideFooter) {
            footer.classList.add('d-none');
        } else {
            footer.classList.remove('d-none');
        }
    }

    // Hide all page sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Show the requested page
    const pageElement = document.getElementById(`page-${page}`);
    if (pageElement) {
        pageElement.classList.remove('hidden');
        currentPage = page;
    } else {
        console.warn(`Page element with id "page-${page}" not found, falling back to home`);
        document.getElementById('page-home').classList.remove('hidden');
        currentPage = 'home';
    }

    // Control particles (keep UI-dense work areas distraction-free)
    if (['services', 'about', 'contact', 'quote', 'client-dashboard', 'agent-dashboard', 'admin-dashboard', 'login', 'agent-login'].includes(page)) {
        stopParticles();
    } else {
        startParticles();
    }

    // Initialize page-specific features
    if (page === PAGES.HOME) {
        setTimeout(() => {
            initStatsAnimation();
            startHomeSequence();
        }, 100);
    }

    if (page === PAGES.SERVICES || page === 'services') {
        initServicesTechNav(pageElement || document);
    }

    if (page === PAGES.ABOUT || page === 'about') {
        initAboutEnhancements(pageElement || document);
    }

    if (page === PAGES.QUOTE || page === 'quote') {
        initQuoteFlow(pageElement || document);
    }

    // Load dashboard data when navigating to dashboards
    if (page === 'client-dashboard' || page === PAGES.CLIENT_DASHBOARD) {
        setTimeout(async () => {
            try {
                if (window.appHandlers && typeof window.appHandlers.loadClientDashboard === 'function') {
                    await window.appHandlers.loadClientDashboard();
                }
            } catch (e) {
                console.warn('Could not load client dashboard data:', e);
                const container = document.querySelector('.policies-list');
                if (container) {
                    container.innerHTML = '<p class="empty-state">Error al cargar datos - modo demo activo</p>';
                }
            }
        }, 200);
    }

    if (page === 'agent-dashboard' || page === PAGES.AGENT_DASHBOARD) {
        setTimeout(async () => {
            try {
                if (window.appHandlers && typeof window.appHandlers.loadAgentDashboard === 'function') {
                    await window.appHandlers.loadAgentDashboard();
                }
            } catch (e) {
                console.warn('Could not load agent dashboard data:', e);
                const container = document.querySelector('[data-clients-list]');
                if (container) {
                    container.innerHTML = '<p class="empty-state">Error al cargar datos - modo demo activo</p>';
                }
            }
        }, 200);
    }

    // Clear contact flag
    if (page === PAGES.CONTACT) {
        setTimeout(() => { window.__allowContact = false; }, 500);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (shouldShowModal) {
        setTimeout(() => {
            hideLoading(320);
            document.body.classList.remove('skeleton-mode');
        }, 220);
    }
}

/**
 * Toggle mobile menu
 */
export function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

/**
 * Toggle footer
 */
export function toggleFooter() {
    const footer = document.getElementById('footer');
    const toggleText = document.getElementById('footer-toggle-text');
    if (!footer) return;

    if (footer.classList.contains('collapsed')) {
        footer.classList.remove('collapsed');
        if (toggleText) toggleText.textContent = 'Ocultar Información';
    } else {
        footer.classList.add('collapsed');
        if (toggleText) toggleText.textContent = 'Mostrar Información';
    }
}

/**
 * Dummy function (no longer needed, templates are already in DOM)
 */
export async function initializeTemplates() {
    console.log('[ROUTER] Templates already injected in index.html by webpack');
}

/**
 * Get current page
 */
export function getCurrentPage() {
    return currentPage;
}

export default {
    navigateTo,
    toggleMobileMenu,
    toggleFooter,
    initializeTemplates,
    getCurrentPage
};
