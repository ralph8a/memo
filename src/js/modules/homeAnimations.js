// Home Page Animations
import { TIMING, GRADIENT_CLASSES, SELECTORS } from '../utils/constants.js';
import { getElement, getElements, addClass, removeClass, replaceClass, setStyle } from '../utils/dom.js';
import { createTimer, clearAllTimers } from '../utils/timing.js';

// DOM Cache
const domCache = {
  hero: null,
  parade: null,
  cta: null,
  subNav: null,
  skipBtn: null
};

function initDOMCache() {
  if (domCache.hero) return; // Already initialized
  
  domCache.hero = getElement(SELECTORS.HERO_SECTION, false);
  domCache.parade = getElement(SELECTORS.PARADE_SECTION, false);
  domCache.cta = getElement(SELECTORS.CTA_SECTION, false);
  domCache.subNav = getElement(SELECTORS.SUB_NAV, false);
  domCache.skipBtn = getElement(SELECTORS.SKIP_BUTTON, false);
}

function showButtonWithDroplet(selector, delay = 0) {
  createTimer(() => {
    const btn = domCache.subNav?.querySelector(selector);
    if (!btn) return;
    
    setStyle(btn, 'display', 'inline-block');
    addClass(btn, 'btn-droplet');
    
    createTimer(() => {
      removeClass(btn, 'btn-droplet');
    }, TIMING.DROPLET_DURATION);
  }, delay);
}

export function cleanupHomeAnimations() {
  clearAllTimers();
  
  // Reset DOM state
  if (domCache.subNav) {
    const buttons = domCache.subNav.querySelectorAll(SELECTORS.SUB_NAV_BUTTONS);
    buttons.forEach(btn => {
      setStyle(btn, 'display', 'none');
      removeClass(btn, 'btn-droplet');
      removeClass(btn, 'active');
    });
  }
  
  // Clear DOM cache
  Object.keys(domCache).forEach(key => {
    domCache[key] = null;
  });
}

export function startHomeSequence() {
  initDOMCache();
  cleanupHomeAnimations();
  
  const { hero, parade, cta, subNav, skipBtn } = domCache;
  if (!hero || !parade || !cta) return;
  
  // Set initial gradient
  addClass(document.body, GRADIENT_CLASSES.HERO);
  
  // Show sub-nav but hide all buttons
  if (subNav) {
    setStyle(subNav, 'display', 'flex');
    const allButtons = subNav.querySelectorAll(SELECTORS.SUB_NAV_BUTTONS);
    allButtons.forEach(btn => setStyle(btn, 'display', 'none'));
  }
  
  // Step 1: Show hero for duration
  createTimer(() => {
    // Transition to parade
    replaceClass(document.body, GRADIENT_CLASSES.HERO, GRADIENT_CLASSES.PARADE);
    addClass(hero, 'fade-out-up');
    
    showButtonWithDroplet('[data-section="hero"]', TIMING.BUTTON_DELAY);
    
    createTimer(() => {
      removeClass(hero, 'active');
      addClass(parade, 'active');
      
      // Step 2: Show parade for duration
      createTimer(() => {
        // Transition to CTA
        replaceClass(document.body, GRADIENT_CLASSES.PARADE, GRADIENT_CLASSES.CTA);
        addClass(parade, 'fade-out-up');
        
        showButtonWithDroplet('[data-section="eleccion"]', TIMING.BUTTON_DELAY);
        
        createTimer(() => {
          removeClass(parade, 'active');
          addClass(cta, 'active');
          
          showButtonWithDroplet('[data-section="cotiza"]', TIMING.BUTTON_DELAY);
          
          if (skipBtn) setStyle(skipBtn, 'display', 'none');
        }, TIMING.CTA_FADE_IN);
      }, TIMING.PARADE_DURATION);
    }, TIMING.CTA_FADE_IN);
  }, TIMING.HERO_DURATION);
}

export function skipToFinalState() {
  initDOMCache();
  cleanupHomeAnimations();
  
  const { hero, parade, cta, subNav, skipBtn } = domCache;
  if (!hero || !parade || !cta) return;
  
  // Set final gradient
  removeClass(document.body, GRADIENT_CLASSES.HERO);
  removeClass(document.body, GRADIENT_CLASSES.PARADE);
  addClass(document.body, GRADIENT_CLASSES.CTA);
  
  // IMPORTANT: Hide ALL sections first, including any fade animations
  const allSections = getElements(SELECTORS.HOME_SECTIONS);
  allSections.forEach(section => {
    removeClass(section, 'active');
    removeClass(section, 'fade-out-up');
  });
  
  // Now show ONLY the CTA section
  addClass(cta, 'active');
  
  // Show all buttons with stagger
  if (subNav) {
    setStyle(subNav, 'display', 'flex');
    const allButtons = subNav.querySelectorAll(SELECTORS.SUB_NAV_BUTTONS);
    allButtons.forEach((btn, index) => {
      setStyle(btn, 'display', 'inline-block');
      createTimer(() => {
        addClass(btn, 'btn-droplet');
        createTimer(() => {
          removeClass(btn, 'btn-droplet');
        }, TIMING.DROPLET_DURATION);
      }, index * TIMING.BUTTON_STAGGER);
    });
  }
  
  // Remove skip button
  if (skipBtn) setStyle(skipBtn, 'display', 'none');
}

export function showHomeSection(section) {
  // Update gradient based on section
  const sectionMap = {
    hero: GRADIENT_CLASSES.HERO,
    eleccion: GRADIENT_CLASSES.PARADE,
    contacto: GRADIENT_CLASSES.CTA
  };
  
  // Remove all gradient classes
  removeClass(document.body, GRADIENT_CLASSES.HERO);
  removeClass(document.body, GRADIENT_CLASSES.PARADE);
  removeClass(document.body, GRADIENT_CLASSES.CTA);
  
  // Add new gradient class
  if (sectionMap[section]) {
    addClass(document.body, sectionMap[section]);
  }
  
  // Update nav buttons
  const buttons = getElements(SELECTORS.SUB_NAV_BUTTONS);
  buttons.forEach(btn => {
    removeClass(btn, 'active');
    if (btn.dataset.section === section) {
      addClass(btn, 'active');
    }
  });
  
  // Hide all sections
  const allSections = getElements(SELECTORS.HOME_SECTIONS);
  allSections.forEach(sec => {
    removeClass(sec, 'active');
    removeClass(sec, 'fade-out-up');
    setStyle(sec, 'display', 'none');
  });
  
  // Show selected section
  const targetSection = getElement(`#${section}-section`, false);
  if (targetSection) {
    setStyle(targetSection, 'display', 'flex');
    addClass(targetSection, 'active');
    
    // Reinitialize stats if showing hero
    if (section === 'hero') {
      createTimer(() => {
        initStatsAnimation();
      }, 100);
    }
  }
}

export function initStatsAnimation() {
  const statNumbers = getElements(SELECTORS.STAT_NUMBERS);
  statNumbers.forEach(stat => {
    const target = parseInt(stat.dataset.target);
    animateCounter(stat, target);
  });
}

function animateCounter(element, target, duration = TIMING.STATS_ANIMATION) {
  const startTime = Date.now();
  
  function update() {
    const now = Date.now();
    const progress = Math.min((now - startTime) / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(easeOut * target);
    
    element.textContent = currentValue;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target;
    }
  }
  
  requestAnimationFrame(update);
}
