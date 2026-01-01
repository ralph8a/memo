// Application Constants

// Animation Timings
export const TIMING = {
  HERO_DURATION: 6000,
  PARADE_DURATION: 8000,
  CTA_FADE_IN: 800,
  BUTTON_DELAY: 400,
  BUTTON_STAGGER: 150,
  DROPLET_DURATION: 600,
  NOTIFICATION_DURATION: 3000,
  STATS_ANIMATION: 2000
};

// Page Routes
export const PAGES = {
  HOME: 'home',
  SERVICES: 'services',
  ABOUT: 'about',
  CONTACT: 'contact',
  LOGIN: 'login',
  AGENT_LOGIN: 'agent-login',
  CLIENT_DASHBOARD: 'client-dashboard',
  AGENT_DASHBOARD: 'agent-dashboard'
};

// Pages that hide footer
export const PAGES_WITHOUT_FOOTER = [
  PAGES.LOGIN,
  PAGES.AGENT_LOGIN,
  PAGES.CLIENT_DASHBOARD,
  PAGES.AGENT_DASHBOARD
];

// Demo Credentials
export const DEMO_CREDENTIALS = {
  CLIENT: {
    email: 'cliente@demo.com',
    password: 'demo123'
  },
  AGENT: {
    id: 'agente@demo.com',
    password: 'agent123'
  }
};

// Gradient Section Classes
export const GRADIENT_CLASSES = {
  HERO: 'section-hero',
  PARADE: 'section-parade',
  CTA: 'section-cta'
};

// DOM Selectors
export const SELECTORS = {
  NAV_MENU: '#navMenu',
  FOOTER: '#footer',
  MAIN_CONTENT: '#mainContent',
  SUB_NAV: '#sub-nav',
  PARTICLES_CANVAS: '#particles-canvas',
  HERO_SECTION: '.hero-intro',
  PARADE_SECTION: '.features-parade',
  CTA_SECTION: '.final-cta',
  SKIP_BUTTON: '.btn-home-start',
  HOME_SECTIONS: '.home-section',
  SUB_NAV_BUTTONS: '.sub-nav-btn',
  STAT_NUMBERS: '.stat-number',
  NAV_LINKS: '.nav-link'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

// Particles Configuration
export const PARTICLES_CONFIG = {
  MAX_COUNT: 60,
  MIN_SIZE: 2,
  MAX_SIZE: 5,
  // Velocidades reducidas para movimiento más calmado
  MIN_SPEED: 0.01,
  MAX_SPEED: 0.06,
  MIN_OPACITY: 0.25,
  MAX_OPACITY: 0.6,
  CONNECTION_DISTANCE: 120,
  CONNECTION_OPACITY: 0.10,
  DENSITY_FACTOR: 10000
};
