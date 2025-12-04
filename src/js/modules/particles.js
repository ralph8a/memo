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
    this.baseSize = this.size;
    
    // Velocidad base más suave
    const speed = Math.random() * (PARTICLES_CONFIG.MAX_SPEED - PARTICLES_CONFIG.MIN_SPEED) + PARTICLES_CONFIG.MIN_SPEED;
    const angle = Math.random() * Math.PI * 2;
    this.speedX = Math.cos(angle) * speed;
    this.speedY = Math.sin(angle) * speed;
    
    // Velocidad objetivo para movimiento suave
    this.targetSpeedX = this.speedX;
    this.targetSpeedY = this.speedY;
    
    this.opacity = Math.random() * (PARTICLES_CONFIG.MAX_OPACITY - PARTICLES_CONFIG.MIN_OPACITY) + PARTICLES_CONFIG.MIN_OPACITY;
    this.baseOpacity = this.opacity;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    
    // Estado de colisión para evitar rebotes múltiples
    this.inCollision = false;
    this.collisionCooldown = 0;
    
    // Animación de rebote
    this.bounceScale = 1;
    this.bounceAnimation = 0;
    this.glowEffect = 0;
  }

  checkCollisionWithElements() {
    // Cooldown para evitar detecciones múltiples
    if (this.collisionCooldown > 0) {
      this.collisionCooldown--;
      return false;
    }

    const elements = document.querySelectorAll('.navbar, .sub-navigation, .hero-section, .feature-box, .stat-box, .btn, .cta-section');
    
    for (let elem of elements) {
      const rect = elem.getBoundingClientRect();
      const padding = 30; // Mayor padding para detección más temprana
      
      // Verificar si está cerca del elemento
      if (this.x > rect.left - padding && this.x < rect.right + padding && 
          this.y > rect.top - padding && this.y < rect.bottom + padding) {
        
        // Calcular vector desde centro del elemento a la partícula
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = this.x - centerX;
        const dy = this.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          // Normalizar el vector de alejamiento
          const normalX = dx / distance;
          const normalY = dy / distance;
          
          // Fuerza de repulsión suave basada en distancia
          const repulsionForce = Math.max(0, 1 - distance / (Math.max(rect.width, rect.height) / 2 + padding));
          
          // Aplicar fuerza de repulsión gradual
          const pushStrength = 0.3 * repulsionForce;
          this.targetSpeedX = normalX * Math.abs(this.speedX) * (1 + pushStrength);
          this.targetSpeedY = normalY * Math.abs(this.speedY) * (1 + pushStrength);
          
          // Activar animación de rebote
          this.bounceAnimation = 1;
          this.glowEffect = repulsionForce;
          
          this.collisionCooldown = 20; // Frames de cooldown
          return true;
        }
      }
    }
    
    this.inCollision = false;
    return false;
  }

  update() {
    // Interpolación suave hacia la velocidad objetivo (easing)
    const lerpFactor = 0.1;
    this.speedX += (this.targetSpeedX - this.speedX) * lerpFactor;
    this.speedY += (this.targetSpeedY - this.speedY) * lerpFactor;
    
    // Actualizar posición
    this.x += this.speedX;
    this.y += this.speedY;
    
    // Rebote suave en los bordes
    const damping = 0.9; // Factor de amortiguación
    const margin = 10;
    
    if (this.x > this.canvasWidth - margin) {
      this.x = this.canvasWidth - margin;
      this.speedX *= -damping;
      this.targetSpeedX *= -damping;
      this.bounceAnimation = 0.7; // Activar rebote en borde
      this.glowEffect = 0.5;
    }
    if (this.x < margin) {
      this.x = margin;
      this.speedX *= -damping;
      this.targetSpeedX *= -damping;
      this.bounceAnimation = 0.7;
      this.glowEffect = 0.5;
    }
    if (this.y > this.canvasHeight - margin) {
      this.y = this.canvasHeight - margin;
      this.speedY *= -damping;
      this.targetSpeedY *= -damping;
      this.bounceAnimation = 0.7;
      this.glowEffect = 0.5;
    }
    if (this.y < margin) {
      this.y = margin;
      this.speedY *= -damping;
      this.targetSpeedY *= -damping;
      this.bounceAnimation = 0.7;
      this.glowEffect = 0.5;
    }
    
    // Actualizar animación de rebote (efecto elástico)
    if (this.bounceAnimation > 0) {
      // Efecto de squeeze and stretch
      this.bounceScale = 1 + Math.sin(this.bounceAnimation * Math.PI) * 0.4;
      this.bounceAnimation -= 0.08; // Velocidad de decaimiento
    } else {
      this.bounceScale = 1;
    }
    
    // Actualizar efecto de brillo
    if (this.glowEffect > 0) {
      this.glowEffect -= 0.05;
    } else {
      this.glowEffect = 0;
    }
    
    // Verificar colisiones con elementos
    this.checkCollisionWithElements();
    
    // Mantener velocidad mínima para evitar partículas estáticas
    const currentSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
    if (currentSpeed < PARTICLES_CONFIG.MIN_SPEED * 0.5) {
      const angle = Math.random() * Math.PI * 2;
      this.speedX = Math.cos(angle) * PARTICLES_CONFIG.MIN_SPEED;
      this.speedY = Math.sin(angle) * PARTICLES_CONFIG.MIN_SPEED;
      this.targetSpeedX = this.speedX;
      this.targetSpeedY = this.speedY;
    }
  }

  draw() {
    // Aplicar escala de rebote
    const scaledSize = this.baseSize * this.bounceScale;
    
    // Calcular opacidad con efecto de brillo
    const glowOpacity = this.baseOpacity + (this.glowEffect * 0.3);
    
    // Dibujar halo de brillo si está activo
    if (this.glowEffect > 0) {
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, scaledSize * 2.5);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${this.glowEffect * 0.4})`);
      gradient.addColorStop(0.5, `rgba(155, 89, 182, ${this.glowEffect * 0.2})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, scaledSize * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Dibujar partícula principal
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, glowOpacity)})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, scaledSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Añadir anillo exterior durante rebote
    if (this.bounceAnimation > 0.3) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${this.bounceAnimation * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, scaledSize * 1.3, 0, Math.PI * 2);
      ctx.stroke();
    }
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
