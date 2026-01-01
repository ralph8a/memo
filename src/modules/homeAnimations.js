// Home Page Animations
import { TIMING, GRADIENT_CLASSES, SELECTORS } from '../utils/constants.js';
import { getElement, getElements, addClass, removeClass, replaceClass, setStyle } from '../utils/dom.js';
import { createTimer, clearAllTimers } from '../utils/timing.js';

// Toggle to enable verbose animation diagnostics in the console
const DEBUG = false;
const debugLog = (...args) => {
  if (DEBUG) console.log(...args);
};

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
  // Progress bar element (under sub-navigation)
  domCache.progress = getElement('#animation-progress .progress-fill', false);

  debugLog('🎬 DOM Cache initialized:', {
    hero: !!domCache.hero,
    parade: !!domCache.parade,
    cta: !!domCache.cta,
    subNav: !!domCache.subNav,
    skipBtn: !!domCache.skipBtn,
    progress: !!domCache.progress
  });
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

function setProgress(percent, durationMs = 0, easing = 'linear', defer = 50) {
  const p = domCache.progress;
  if (!p) return;

  // Set transition if requested
  setStyle(p, 'transition', durationMs ? `width ${durationMs}ms ${easing}` : '');

  // Defer the width change slightly so the transition takes effect
  createTimer(() => {
    setStyle(p, 'width', percent);
  }, defer);
}

function setActiveSubNav(sectionKey) {
  const subNav = domCache.subNav;
  if (!subNav) return;

  const buttons = subNav.querySelectorAll(SELECTORS.SUB_NAV_BUTTONS);
  buttons.forEach(btn => {
    removeClass(btn, 'active');
    if (btn.dataset.section === sectionKey) addClass(btn, 'active');
  });
}

export function cleanupHomeAnimations() {
  clearAllTimers();

  // Reset DOM state
  if (domCache.subNav) {
    // Hide sub-nav container animation state (home.css hides it unless .show)
    removeClass(domCache.subNav, 'show');

    const buttons = domCache.subNav.querySelectorAll(SELECTORS.SUB_NAV_BUTTONS);
    buttons.forEach(btn => {
      setStyle(btn, 'display', 'none');
      removeClass(btn, 'btn-droplet');
      removeClass(btn, 'active');
    });
  }

  // Reset progress bar
  if (domCache.progress) {
    setStyle(domCache.progress, 'transition', '');
    setStyle(domCache.progress, 'width', '0%');
  }

  // Clear DOM cache
  Object.keys(domCache).forEach(key => {
    domCache[key] = null;
  });
}

export function startHomeSequence() {
  // Ensure previous animations are cleared before caching DOM nodes
  cleanupHomeAnimations();
  initDOMCache();

  const { hero, parade, cta, subNav, skipBtn } = domCache;
  debugLog('🏠 startHomeSequence initiated - Parade element:', parade);
  if (!hero || !parade || !cta) {
    console.error('❌ Missing required sections:', { hero, parade, cta });
    return;
  }

  // Always reset home sections to a known baseline.
  // Important: showHomeSection() uses inline display styles; those can block .active CSS.
  const allSections = getElements(SELECTORS.HOME_SECTIONS);
  allSections.forEach(section => {
    removeClass(section, 'active');
    removeClass(section, 'fade-out-up');
    // Clear any inline display overrides so CSS can drive visibility again
    setStyle(section, 'display', '');
  });

  // Ensure hero starts visible
  addClass(hero, 'active');
  setActiveSubNav('hero');

  // Set initial gradient
  removeClass(document.body, GRADIENT_CLASSES.PARADE);
  removeClass(document.body, GRADIENT_CLASSES.CTA);
  addClass(document.body, GRADIENT_CLASSES.HERO);

  // Show sub-nav but hide all buttons
  if (subNav) {
    // home.css keeps sub-nav hidden unless the `.show` class is present
    setStyle(subNav, 'display', 'flex');
    removeClass(subNav, 'show');
    // Defer so the browser can apply initial (hidden) state, then animate in
    createTimer(() => addClass(subNav, 'show'), 30);

    const allButtons = subNav.querySelectorAll(SELECTORS.SUB_NAV_BUTTONS);
    allButtons.forEach(btn => setStyle(btn, 'display', 'none'));

    // Show the first button early so the sub-nav isn't an empty bar.
    showButtonWithDroplet('[data-section="hero"]', 120);
  }

  // Initialize and animate progress bar (if present)
  if (domCache.progress) {
    // Reset
    setStyle(domCache.progress, 'width', '0%');
    // Animate to first milestone (hero -> 33%) over HERO_DURATION
    setProgress('33%', TIMING.HERO_DURATION);
  }

  // Step 1: Show hero for duration
  createTimer(() => {
    // Transition to parade
    replaceClass(document.body, GRADIENT_CLASSES.HERO, GRADIENT_CLASSES.PARADE);
    // If a fade-out class exists, it can be applied here; otherwise we rely on section swap.

    // Immediately show parade (removed the CTA_FADE_IN delay)
    createTimer(() => {
      removeClass(hero, 'active');

      // Clear any inline display overrides that could prevent the parade from showing
      setStyle(parade, 'display', '');

      addClass(parade, 'active');
      debugLog('🎪 Parade class added:', parade.className);
      debugLog('🎪 Parade element:', parade);
      debugLog('🎪 Parade classList:', parade.classList);

      setActiveSubNav('eleccion');

      showButtonWithDroplet('[data-section="eleccion"]', TIMING.BUTTON_DELAY);

      // Step 2: Show parade for duration
      // Update progress to 66% during parade
      if (domCache.progress) setProgress('66%', TIMING.PARADE_DURATION);

      createTimer(() => {
        // Transition to CTA
        replaceClass(document.body, GRADIENT_CLASSES.PARADE, GRADIENT_CLASSES.CTA);
        // Remove parade visibility without using non-existent class
        removeClass(parade, 'active');

        // Clear any inline display overrides that could prevent the CTA from showing
        setStyle(cta, 'display', '');

        createTimer(() => {
          addClass(cta, 'active');

          setActiveSubNav('cotiza');

          showButtonWithDroplet('[data-section="cotiza"]', TIMING.BUTTON_DELAY);

          if (skipBtn) setStyle(skipBtn, 'display', 'none');
          // Complete progress on CTA show
          if (domCache.progress) setProgress('100%', TIMING.CTA_FADE_IN, 'ease-out');
        }, TIMING.CTA_FADE_IN);
      }, TIMING.PARADE_DURATION);
    }, 0); // No delay - show immediately after hero transition
  }, TIMING.HERO_DURATION);
}

export function skipToFinalState() {
  // Clear any running animations first, then initialize DOM cache
  cleanupHomeAnimations();
  initDOMCache();

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
    // Clear any inline display overrides so .active can take effect
    setStyle(section, 'display', '');
  });

  // Now show ONLY the CTA section
  setStyle(cta, 'display', '');
  addClass(cta, 'active');

  // Show all buttons with stagger
  if (subNav) {
    setStyle(subNav, 'display', 'flex');
    removeClass(subNav, 'show');
    createTimer(() => addClass(subNav, 'show'), 30);

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

  // Ensure progress is complete
  if (domCache.progress) {
    // Fast completion without long transition
    setProgress('100%', 300, 'ease-out', 10);
  }
}

export function showHomeSection(section) {
  // Manual navigation should cancel the automated intro sequence to avoid desync.
  clearAllTimers();
  initDOMCache();

  // Update gradient based on section
  const sectionMap = {
    hero: GRADIENT_CLASSES.HERO,
    eleccion: GRADIENT_CLASSES.PARADE,
    cotiza: GRADIENT_CLASSES.CTA
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
    // Update progress bar to reflect manual selection
    if (domCache.progress) {
      const mapping = {
        hero: '33%',
        eleccion: '66%',
        cotiza: '100%'
      };
      const pct = mapping[section] || '0%';
      setProgress(pct, 400, 'ease-out', 10);
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
