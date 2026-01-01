// Router Module - Simplified Direct Navigation
import { setPage, getUser } from '../core/state.js';
import { PAGES, PAGES_WITHOUT_FOOTER, SELECTORS } from '../utils/constants.js';
import { getElement, getElements, addClass, removeClass, hide, show } from '../utils/dom.js';
import { cleanupHomeAnimations, startHomeSequence, initStatsAnimation } from './homeAnimations.js';
import { showNotification } from './notifications.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';
import { clearAllTimers } from '../utils/timing.js';
import { stopParticles, startParticles } from './particles.js';
import { loadTemplate, loadStyles, unloadStyles } from './templateLoader.js';
import { initServicesTechNav } from './servicesTechNav.js';

// Track current loaded style to unload when navigating away
let currentLoadedStyle = null;

// Direct page-to-template mapping (no heuristics - exact matches only)
const PAGE_CONFIG = {
  home: { template: 'pages/home', style: 'pages/home' },
  services: { template: 'pages/services', style: 'pages/services' },
  about: { template: 'pages/about', style: 'pages/about' },
  contact: { template: 'pages/contact', style: 'pages/contact' },
  'client-login': { template: 'auth/client-login', style: 'auth' },
  'agent-login': { template: 'auth/agent-login', style: 'auth' },
  'client-dashboard': { template: 'dashboards/client-dashboard', style: 'dashboards/client-dashboard' },
  'agent-dashboard': { template: 'dashboards/agent-dashboard', style: 'dashboards/agent-dashboard' },
  'admin-dashboard': { template: 'dashboards/admin-dashboard', style: 'dashboards/admin-dashboard' }
};

export async function navigateTo(page, event) {
  // Prevent default anchor behavior
  if (event) {
    event.preventDefault();
  }

  // Only allow opening the contact page when explicitly triggered by an agent click
  if (page === PAGES.CONTACT && !window.__allowContact) {
    showNotification('La sección de Contacto sólo se abre desde el contacto con un agente.', NOTIFICATION_TYPES.INFO);
    return;
  }

  // Validate page exists
  if (!PAGE_CONFIG[page]) {
    console.error(`[ROUTER] Unknown page: ${page}`);
    showNotification(`Página no encontrada: ${page}`, NOTIFICATION_TYPES.ERROR);
    return;
  }

  // Cleanup
  cleanupHomeAnimations();
  clearAllTimers();
  setPage(page);

  // Close mobile menu
  const navMenu = getElement(SELECTORS.NAV_MENU);
  if (navMenu) removeClass(navMenu, 'active');

  // Update active nav link
  getElements(SELECTORS.NAV_LINKS).forEach(link => {
    removeClass(link, 'active');
    if (link.dataset.page === page) addClass(link, 'active');
  });

  // Handle footer visibility
  const footer = getElement(SELECTORS.FOOTER);
  if (footer) {
    if (PAGES_WITHOUT_FOOTER.includes(page)) {
      hide(footer);
    } else {
      show(footer);
    }
  }

  // Unload previous style
  if (currentLoadedStyle) {
    unloadStyles(currentLoadedStyle);
  }

  // Load page content
  const mainContent = getElement('#mainContent');
  if (!mainContent) {
    console.error('[ROUTER] mainContent element not found');
    return;
  }

  const config = PAGE_CONFIG[page];

  // Load page-specific styles FIRST (before template injection)
  if (currentLoadedStyle) {
    unloadStyles(currentLoadedStyle);
  }
  loadStyles(config.style);
  currentLoadedStyle = config.style;

  // Then load template
  const html = await loadTemplate(config.template);

  if (!html) {
    mainContent.innerHTML = `<div class="error-message">Error cargando página: ${page}</div>`;
    return;
  }

  // Clear and inject template (CSS already loaded)
  mainContent.innerHTML = '';
  const pageContainer = document.createElement('div');
  pageContainer.setAttribute('data-page', page);
  pageContainer.innerHTML = html;
  mainContent.appendChild(pageContainer);

  // Page-specific setup
  if (page === PAGES.SERVICES || page === 'services') {
    initServicesTechNav(pageContainer);
  }

  // Control particles animation
  if (['services', 'about', 'contact'].includes(page)) {
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

  // Clear the temporary agent-contact flag after navigation
  if (page === PAGES.CONTACT) {
    setTimeout(() => { window.__allowContact = false; }, 500);
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function toggleMobileMenu() {
  const navMenu = getElement(SELECTORS.NAV_MENU);
  if (navMenu) navMenu.classList.toggle('active');
}

export function toggleFooter() {
  const footer = getElement(SELECTORS.FOOTER);
  const toggleText = getElement('#footer-toggle-text', false);
  if (!footer) return;

  if (footer.classList.contains('collapsed')) {
    removeClass(footer, 'collapsed');
    if (toggleText) toggleText.textContent = 'Ocultar Información';
  } else {
    addClass(footer, 'collapsed');
    if (toggleText) toggleText.textContent = 'Mostrar Información';
  }
}
