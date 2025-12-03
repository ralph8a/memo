// Particles Animation System
import { PARTICLES_CONFIG, SELECTORS } from '../utils/constants.js';
import { getElement } from '../utils/dom.js';

let canvas = null;
let ctx = null;
let particles = [];
let animationFrameId = null;

class Particle {
  constructor(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.size = Math.random() * (PARTICLES_CONFIG.MAX_SIZE - PARTICLES_CONFIG.MIN_SIZE) + PARTICLES_CONFIG.MIN_SIZE;
    this.speedX = Math.random() * (PARTICLES_CONFIG.MAX_SPEED - PARTICLES_CONFIG.MIN_SPEED) + PARTICLES_CONFIG.MIN_SPEED;
    this.speedY = Math.random() * (PARTICLES_CONFIG.MAX_SPEED - PARTICLES_CONFIG.MIN_SPEED) + PARTICLES_CONFIG.MIN_SPEED;
    this.opacity = Math.random() * (PARTICLES_CONFIG.MAX_OPACITY - PARTICLES_CONFIG.MIN_OPACITY) + PARTICLES_CONFIG.MIN_OPACITY;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  checkCollisionWithElements() {
    const elements = document.querySelectorAll('.navbar, .sub-navigation, .main-content, .home-section, .feature-box, .agent-card, .stat-box, .btn, .auth-card, .dashboard-card, .service-card-detailed, .cta-section');
    
    for (let elem of elements) {
      const rect = elem.getBoundingClientRect();
      const padding = 20;
      
      if (this.x > rect.left - padding && this.x < rect.right + padding && 
          this.y > rect.top - padding && this.y < rect.bottom + padding) {
        
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        if (this.x < centerX) {
          this.speedX = -Math.abs(this.speedX);
        } else {
          this.speedX = Math.abs(this.speedX);
        }
        
        if (this.y < centerY) {
          this.speedY = -Math.abs(this.speedY);
        } else {
          this.speedY = Math.abs(this.speedY);
        }
        
        return true;
      }
    }
    return false;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    
    if (this.x > this.canvasWidth) this.speedX *= -1;
    if (this.x < 0) this.speedX *= -1;
    if (this.y > this.canvasHeight) this.speedY *= -1;
    if (this.y < 0) this.speedY *= -1;
    
    this.checkCollisionWithElements();
  }

  draw() {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function connectParticles() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < PARTICLES_CONFIG.CONNECTION_DISTANCE) {
        const opacity = PARTICLES_CONFIG.CONNECTION_OPACITY * (1 - distance / PARTICLES_CONFIG.CONNECTION_DISTANCE);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function resizeCanvas() {
  if (!canvas) return;
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Reinitialize particles with new dimensions
  particles = particles.map(() => new Particle(canvas.width, canvas.height));
}

function initParticles() {
  canvas = getElement(SELECTORS.PARTICLES_CANVAS, false);
  if (!canvas) return false;
  
  ctx = canvas.getContext('2d');
  resizeCanvas();
  
  particles = [];
  const particleCount = Math.min(
    PARTICLES_CONFIG.MAX_COUNT,
    Math.floor((canvas.width * canvas.height) / PARTICLES_CONFIG.DENSITY_FACTOR)
  );
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(canvas.width, canvas.height));
  }
  
  return true;
}

function animateParticles() {
  if (!ctx || !canvas) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });
  
  connectParticles();
  
  animationFrameId = requestAnimationFrame(animateParticles);
}

export function startParticles() {
  if (initParticles()) {
    window.addEventListener('resize', resizeCanvas);
    animateParticles();
  }
}

export function stopParticles() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  window.removeEventListener('resize', resizeCanvas);
  particles = [];
}
