// Particles Animation System (theme-aware)
// Default theme: Dust/Bokeh
// Dark Forest theme: Fireflies
import { PARTICLES_CONFIG, SELECTORS } from '../utils/constants.js';
import { getElement } from '../utils/dom.js';

let canvas = null;
let ctx = null;
let particles = [];
let animationFrameId = null;

let canvasWidth = 0;
let canvasHeight = 0;
let dpr = 1;

let themeObserver = null;
let activeThemeKey = null;
let activeProfile = null;
let activePalette = null;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function parseCssColorToRgb(color) {
  if (!color) return { r: 255, g: 255, b: 255 };
  const c = String(color).trim();

  // hex
  if (c.startsWith('#')) {
    const hex = c.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b };
    }
  }

  // rgb/rgba
  const m = c.match(/rgba?\(([^)]+)\)/i);
  if (m) {
    const parts = m[1].split(',').map(s => s.trim());
    const r = parseFloat(parts[0]);
    const g = parseFloat(parts[1]);
    const b = parseFloat(parts[2]);
    if ([r, g, b].every(v => Number.isFinite(v))) {
      return { r, g, b };
    }
  }

  // fallback
  return { r: 255, g: 255, b: 255 };
}

function rgba(rgb, a) {
  const alpha = clamp(a, 0, 1);
  return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${alpha})`;
}

function getThemeKey() {
  const theme = document.documentElement.getAttribute('data-theme');
  return theme === 'dark-forest' ? 'dark-forest' : 'default';
}

function readCssVar(name, fallback = '') {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name);
    const out = (v || '').trim();
    return out || fallback;
  } catch {
    return fallback;
  }
}

function buildPalette(themeKey) {
  // Use semantic theme tokens so visuals adapt correctly
  const text = parseCssColorToRgb(readCssVar('--theme-text-primary', '#ffffff'));
  const accent = parseCssColorToRgb(readCssVar('--theme-accent-color', '#ffffff'));
  const glow = parseCssColorToRgb(readCssVar('--theme-highlight-glow', 'rgba(255,255,255,0.35)'));
  const warm = parseCssColorToRgb(readCssVar('--theme-highlight-strong', '#ffd700'));

  if (themeKey === 'dark-forest') {
    return {
      core: warm,
      halo: glow,
      line: accent,
      ink: text
    };
  }

  // default: dust/bokeh reads nicer with a softer highlight
  const soft = parseCssColorToRgb(readCssVar('--theme-highlight-light', '#ffffff'));
  return {
    core: soft,
    halo: glow,
    line: accent,
    ink: text
  };
}

function getProfile(themeKey) {
  // Keep counts conservative (dashboards are UI-dense)
  if (themeKey === 'dark-forest') {
    return {
      style: 'fireflies',
      maxCount: 42,
      densityFactor: 38000,
      minSize: 1.4,
      maxSize: 3.2,
      minSpeed: 0.01,
      maxSpeed: 0.055,
      minOpacity: 0.22,
      maxOpacity: 0.55,
      twinkleMin: 0.003,
      twinkleMax: 0.012,
      glowRadiusMin: 12,
      glowRadiusMax: 26,
      composite: 'lighter',
      connections: {
        enabled: false
      }
    };
  }

  return {
    style: 'dust',
    maxCount: Math.min(PARTICLES_CONFIG.MAX_COUNT, 70),
    densityFactor: 24000,
    minSize: 1.2,
    maxSize: 4.6,
    minSpeed: 0.008,
    maxSpeed: 0.05,
    minOpacity: 0.16,
    maxOpacity: 0.38,
    twinkleMin: 0.0015,
    twinkleMax: 0.006,
    glowRadiusMin: 8,
    glowRadiusMax: 18,
    composite: 'source-over',
    // very subtle (option C flavor) so it doesn't fight UI
    connections: {
      enabled: true,
      distance: 120,
      baseOpacity: 0.10,
      lineWidth: 1
    }
  };
}

class Particle {
  constructor(width, height, profile) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;

    this.baseSize = rand(profile.minSize, profile.maxSize);
    this.size = this.baseSize;

    const speed = rand(profile.minSpeed, profile.maxSpeed);
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.baseOpacity = rand(profile.minOpacity, profile.maxOpacity);
    this.opacity = this.baseOpacity;

    this.twinklePhase = Math.random() * Math.PI * 2;
    this.twinkleSpeed = rand(profile.twinkleMin, profile.twinkleMax);
    this.driftPhase = Math.random() * Math.PI * 2;
    this.driftSpeed = rand(0.0008, 0.002);
    this.driftStrength = rand(0.0006, 0.0022);

    this.width = width;
    this.height = height;
    this.profile = profile;
  }

  update() {
    // gentle drift/wander
    this.driftPhase += this.driftSpeed;
    this.vx += Math.cos(this.driftPhase) * this.driftStrength;
    this.vy += Math.sin(this.driftPhase) * this.driftStrength;

    // clamp speed
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const max = this.profile.maxSpeed;
    if (speed > max) {
      const s = max / speed;
      this.vx *= s;
      this.vy *= s;
    }

    this.x += this.vx;
    this.y += this.vy;

    // wrap edges (calmer than bouncing)
    const margin = 20;
    if (this.x < -margin) this.x = this.width + margin;
    if (this.x > this.width + margin) this.x = -margin;
    if (this.y < -margin) this.y = this.height + margin;
    if (this.y > this.height + margin) this.y = -margin;

    // twinkle
    this.twinklePhase += this.twinkleSpeed;
    const tw = 0.65 + 0.35 * Math.sin(this.twinklePhase);
    this.opacity = this.baseOpacity * tw;
    this.size = this.baseSize * (0.92 + 0.12 * tw);
  }

  draw(palette) {
    const profile = this.profile;

    // Fireflies: warmer core + stronger halo
    if (profile.style === 'fireflies') {
      const glowR = rand(profile.glowRadiusMin, profile.glowRadiusMax);
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowR);
      g.addColorStop(0, rgba(palette.core, this.opacity * 0.85));
      g.addColorStop(0.5, rgba(palette.halo, this.opacity * 0.22));
      g.addColorStop(1, rgba(palette.halo, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(this.x, this.y, glowR, 0, Math.PI * 2);
      ctx.fill();

      // tiny core dot
      ctx.fillStyle = rgba(palette.core, this.opacity);
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.8, this.size * 0.85), 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Dust/Bokeh: soft blobs
    const r = Math.max(2, this.size * 3.8);
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
    grad.addColorStop(0, rgba(palette.core, this.opacity * 0.80));
    grad.addColorStop(0.45, rgba(palette.halo, this.opacity * 0.22));
    grad.addColorStop(1, rgba(palette.halo, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function connectParticles(palette, profile) {
  const conn = profile.connections;
  if (!conn || !conn.enabled) return;

  const maxD = conn.distance;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance >= maxD) continue;

      const a = conn.baseOpacity * (1 - distance / maxD);
      ctx.strokeStyle = rgba(palette.line, a);
      ctx.lineWidth = conn.lineWidth || 1;
      ctx.beginPath();
      ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(particles[j].x, particles[j].y);
      ctx.stroke();
    }
  }
}

function resizeCanvas() {
  if (!canvas) return;

  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;

  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(canvasWidth * dpr);
  canvas.height = Math.floor(canvasHeight * dpr);
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;

  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Reinitialize particles with new dimensions
  if (activeProfile) {
    particles = particles.map(() => new Particle(canvasWidth, canvasHeight, activeProfile));
  }
}

function applyThemeProfile(force = false) {
  const themeKey = getThemeKey();
  if (!force && themeKey === activeThemeKey) return;

  activeThemeKey = themeKey;
  activeProfile = getProfile(themeKey);
  activePalette = buildPalette(themeKey);

  if (!canvas) return;
  // rebuild particles to match style and count
  particles = [];
  const particleCount = Math.min(
    activeProfile.maxCount,
    Math.floor((canvasWidth * canvasHeight) / activeProfile.densityFactor)
  );
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(canvasWidth, canvasHeight, activeProfile));
  }
}

function watchThemeChanges() {
  if (themeObserver) return;
  themeObserver = new MutationObserver(() => applyThemeProfile(false));
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

function unwatchThemeChanges() {
  if (!themeObserver) return;
  themeObserver.disconnect();
  themeObserver = null;
}

function initParticles() {
  canvas = getElement(SELECTORS.PARTICLES_CANVAS, false);
  if (!canvas) return false;

  ctx = canvas.getContext('2d');
  resizeCanvas();

  applyThemeProfile(true);

  return true;
}

function animateParticles() {
  if (!ctx || !canvas) return;

  // Ensure composite mode matches active style
  if (activeProfile && activeProfile.composite) {
    ctx.globalCompositeOperation = activeProfile.composite;
  } else {
    ctx.globalCompositeOperation = 'source-over';
  }

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  particles.forEach(particle => {
    particle.update();
    particle.draw(activePalette);
  });

  // Keep constellation flavor only on default (very subtle)
  connectParticles(activePalette, activeProfile);

  animationFrameId = requestAnimationFrame(animateParticles);
}

export function startParticles() {
  if (initParticles()) {
    window.addEventListener('resize', resizeCanvas);
    watchThemeChanges();
    animateParticles();
  }
}

export function stopParticles() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  window.removeEventListener('resize', resizeCanvas);
  unwatchThemeChanges();
  particles = [];
}
