// Router Module
import { setPage, getPage, getUser } from '../core/state.js';
import { PAGES, PAGES_WITHOUT_FOOTER, SELECTORS } from '../utils/constants.js';
import { getElement, getElements, addClass, removeClass, setStyle, setHTML, hide, show } from '../utils/dom.js';
import { cleanupHomeAnimations, startHomeSequence, initStatsAnimation } from './homeAnimations.js';
import { clearAllTimers } from '../utils/timing.js';
import { stopParticles, startParticles } from './particles.js';

// Import templates
import { getTemplate } from '../templates/index.js';

// Pages that don't need particles animation
const PAGES_WITHOUT_PARTICLES = ['services', 'about', 'contact'];

export function navigateTo(page, event) {
  // Prevent default anchor behavior
  if (event) {
    event.preventDefault();
  }
  
  // Cleanup previous page
  cleanupHomeAnimations();
  clearAllTimers();
  
  setPage(page);
  
  // Close mobile menu
  const navMenu = getElement(SELECTORS.NAV_MENU);
  if (navMenu) {
    removeClass(navMenu, 'active');
  }
  
  // Update active nav link
  updateNavLinks(page);
  
  // Handle footer visibility
  updateFooterVisibility(page);
  
  // Load page content
  loadPage(page);
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateNavLinks(page) {
  const navLinks = getElements(SELECTORS.NAV_LINKS);
  navLinks.forEach(link => {
    removeClass(link, 'active');
    if (link.dataset.page === page) {
      addClass(link, 'active');
    }
  });
}

function updateFooterVisibility(page) {
  const footer = getElement(SELECTORS.FOOTER);
  if (footer) {
    if (PAGES_WITHOUT_FOOTER.includes(page)) {
      hide(footer);
    } else {
      show(footer);
    }
  }
}

function loadPage(page) {
  const mainContent = getElement(SELECTORS.MAIN_CONTENT);
  if (!mainContent) return;
  
  const template = getTemplate(page);
  if (template) {
    setHTML(mainContent, template);
    
    // Control particles animation based on page
    if (PAGES_WITHOUT_PARTICLES.includes(page)) {
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
  } else {
    setHTML(mainContent, '<div class="container"><h1>Página no encontrada</h1></div>');
  }
}

export function getCurrentPage() {
  return getPage();
}

export function toggleMobileMenu() {
  const navMenu = getElement(SELECTORS.NAV_MENU);
  if (navMenu) {
    navMenu.classList.toggle('active');
  }
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
