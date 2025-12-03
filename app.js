// Krause Insurance Web App - Main JavaScript

// User session management
let currentUser = null;
let currentPage = 'home';

// Check if user is logged in
function checkAuth() {
  const user = localStorage.getItem('krauser_user');
  if (user) {
    currentUser = JSON.parse(user);
    return true;
  }
  return false;
}

// Logout function
function logout() {
  localStorage.removeItem('krauser_user');
  currentUser = null;
  navigateTo('home');
  showNotification('Sesión cerrada exitosamente', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Toggle mobile menu
function toggleMobileMenu() {
  const navMenu = document.getElementById('navMenu');
  navMenu.classList.toggle('active');
}

// Navigation function
function navigateTo(page, event) {
  if (event) {
    event.preventDefault();
  }
  
  currentPage = page;
  
  // Close mobile menu
  const navMenu = document.getElementById('navMenu');
  navMenu.classList.remove('active');
  
  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === page) {
      link.classList.add('active');
    }
  });
  
  // Hide footer on certain pages
  const footer = document.getElementById('footer');
  if (['login', 'agent-login', 'dashboard', 'agent-dashboard'].includes(page)) {
    footer.classList.add('d-none');
    footer.classList.remove('d-block');
  } else {
    footer.classList.add('d-block');
    footer.classList.remove('d-none');
  }
  
  // Load page content
  loadPage(page);
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Page templates
const pages = {
  home: `
    <nav class="sub-navigation sub-nav-hidden" id="sub-nav">
      <button class="sub-nav-btn active" data-section="hero" onclick="showHomeSection('hero')">Hero</button>
      <button class="sub-nav-btn" data-section="eleccion" onclick="showHomeSection('eleccion')">Elección</button>
      <button class="sub-nav-btn" data-section="cotiza" onclick="showHomeSection('cotiza')">Cotizar</button>
    </nav>
    
    <section class="hero-section hero-intro home-section active" id="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-word">Protection</span>
          <span class="title-word accent">Beyond</span>
          <span class="title-word">The Limits</span>
        </h1>
        <p class="hero-subtitle">
          Más de 25 años protegiendo lo que más valoras. 
          Seguros personalizados respaldados por experiencia y compromiso.
        </p>
        
        <div class="hero-stats">
          <div class="stat-box">
            <div class="stat-number" data-target="25">0</div>
            <div class="stat-label">Años de Experiencia</div>
          </div>
          <div class="stat-box">
            <div class="stat-number" data-target="5000">0</div>
            <div class="stat-label">Clientes Activos</div>
          </div>
          <div class="stat-box">
            <div class="stat-number" data-target="10000">0</div>
            <div class="stat-label">Pólizas Vigentes</div>
          </div>
          <div class="stat-box">
            <div class="stat-number" data-target="98">0</div>
            <div class="stat-label">% Satisfacción</div>
          </div>
        </div>
        
        <button class="btn-home-start" onclick="skipToFinalState()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          Saltar Animación
        </button>
      </div>
    </section>
    
    <section class="features-section features-parade home-section" id="eleccion-section">
      <div class="features-content">
        <h2 class="section-title">¿Por Qué Elegirnos?</h2>
        <div class="features-grid">
          <div class="feature-box feature-card-1">
            <div class="feature-icon">🛡️</div>
            <h3>Cobertura Integral</h3>
            <p>Protección completa adaptada a tus necesidades específicas</p>
          </div>
          <div class="feature-box feature-card-2">
            <div class="feature-icon">⚡</div>
            <h3>Respuesta Inmediata</h3>
            <p>Atención 24/7 cuando más nos necesitas</p>
          </div>
          <div class="feature-box feature-card-3">
            <div class="feature-icon">💰</div>
            <h3>Mejores Precios</h3>
            <p>Cotizamos con múltiples aseguradoras para ti</p>
          </div>
          <div class="feature-box feature-card-4">
            <div class="feature-icon">👨‍💼</div>
            <h3>Asesoría Experta</h3>
            <p>25+ años de experiencia a tu servicio</p>
          </div>
        </div>
      </div>
    </section>
    
    <section class="cta-section final-cta home-section" id="cotiza-section">
      <div class="container">
        <div class="cta-hero-title">
          <svg class="cta-logo-large" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <ellipse class="shield-circle" cx="40" cy="38" rx="22" ry="22" stroke="currentColor" stroke-width="3" fill="none" />
            <path class="shield-diamond" d="M40 12 L62 35 L40 70 L18 35 Z" stroke="currentColor" stroke-width="3" fill="none" />
            <path class="shield-arc" d="M24 50 Q40 30 56 50" stroke="currentColor" stroke-width="3" fill="none" />
            <line class="shield-line" x1="40" y1="50" x2="40" y2="68" stroke="currentColor" stroke-width="3" />
          </svg>
          <h2 class="animated-title main-hero">
            <span class="title-line">¿Listo para</span>
            <span class="title-line highlight">Proteger</span>
            <span class="title-line">tu Futuro?</span>
          </h2>
          <div class="title-underline"></div>
        </div>
        
        <p class="cta-subtitle">Obtén una cotización personalizada sin compromiso</p>
        
        <div class="cta-buttons cta-main-buttons">
          <button class="btn btn-primary btn-lg btn-pulse" onclick="navigateTo('contact')">
            <span>📝 Solicitar Cotización Gratis</span>
          </button>
          <button class="btn btn-secondary btn-lg" onclick="navigateTo('services')">
            <span>🛡️ Ver Servicios</span>
          </button>
        </div>
        
        <div class="section-divider"></div>
        
        <h3 class="agents-section-title">Contacta a Nuestros Agentes</h3>
        
        <div class="agents-grid">
          <div class="agent-card">
            <div class="agent-avatar">👨‍💼</div>
            <h4>Carlos Méndez</h4>
            <p class="agent-title">Agente Senior</p>
            <a href="tel:+525512345678" class="agent-contact">📞 (55) 1234-5678</a>
          </div>
          
          <div class="agent-card">
            <div class="agent-avatar">👩‍💼</div>
            <h4>Ana Rodríguez</h4>
            <p class="agent-title">Especialista Vida</p>
            <a href="tel:+525598765432" class="agent-contact">📞 (55) 9876-5432</a>
          </div>
          
          <div class="agent-card">
            <div class="agent-avatar">👨‍💼</div>
            <h4>Miguel Torres</h4>
            <p class="agent-title">Seguros Auto</p>
            <a href="tel:+525555551234" class="agent-contact">📞 (55) 5555-1234</a>
          </div>
          
          <div class="agent-card">
            <div class="agent-avatar">👩‍💼</div>
            <h4>Laura Gómez</h4>
            <p class="agent-title">Seguros Hogar</p>
            <a href="tel:+525544445555" class="agent-contact">📞 (55) 4444-5555</a>
          </div>
        </div>
      </div>
    </section>
  `,
  
  services: `
    <section class="page-header services-hero">
      <div class="container">
        <div class="services-hero-content">
          <svg class="services-logo" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <ellipse class="shield-circle" cx="40" cy="38" rx="22" ry="22" stroke="currentColor" stroke-width="3" fill="none" />
            <path class="shield-diamond" d="M40 12 L62 35 L40 70 L18 35 Z" stroke="currentColor" stroke-width="3" fill="none" />
            <path class="shield-arc" d="M24 50 Q40 30 56 50" stroke="currentColor" stroke-width="3" fill="none" />
            <line class="shield-line" x1="40" y1="50" x2="40" y2="68" stroke="currentColor" stroke-width="3" />
          </svg>
          <h1 class="page-title animated-title">
            <span class="title-line">Nuestros</span>
            <span class="title-line highlight">Servicios</span>
          </h1>
          <p class="page-subtitle">Cobertura completa para todas tus necesidades</p>
          <div class="services-stats">
            <div class="stat-mini">
              <div class="stat-number">6</div>
              <div class="stat-label">Tipos de Seguro</div>
            </div>
            <div class="stat-mini">
              <div class="stat-number">25+</div>
              <div class="stat-label">Años Experiencia</div>
            </div>
            <div class="stat-mini">
              <div class="stat-number">10K+</div>
              <div class="stat-label">Pólizas Activas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <section class="services-intro">
      <div class="container">
        <div class="intro-content">
          <h2>¿Por Qué Elegirnos?</h2>
          <p>En Krause Insurance nos especializamos en encontrar la cobertura perfecta para ti. Con más de 25 años de experiencia, trabajamos con las mejores aseguradoras del mercado para ofrecerte planes personalizados, precios competitivos y un servicio excepcional.</p>
          <div class="intro-features">
            <div class="intro-feature">
              <span class="feature-icon-small">🛡️</span>
              <span>Cobertura Integral</span>
            </div>
            <div class="intro-feature">
              <span class="feature-icon-small">💰</span>
              <span>Mejores Precios</span>
            </div>
            <div class="intro-feature">
              <span class="feature-icon-small">⚡</span>
              <span>Atención 24/7</span>
            </div>
            <div class="intro-feature">
              <span class="feature-icon-small">👨‍💼</span>
              <span>Asesoría Experta</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <section class="services-section">
      <div class="container">
        <div class="section-header-services">
          <h2>Explora Nuestras Soluciones</h2>
          <p>Selecciona el tipo de seguro que mejor se adapte a tus necesidades</p>
        </div>
        <div class="services-grid">
          <div class="service-card-detailed">
            <div class="service-icon-large">🚗</div>
            <h3>Seguros de Auto</h3>
            <p>Protección completa para tu vehículo con las mejores coberturas del mercado.</p>
            <ul class="service-list">
              <li>✓ Responsabilidad Civil</li>
              <li>✓ Cobertura Amplia</li>
              <li>✓ Asistencia Vial 24/7</li>
              <li>✓ Auto de Reemplazo</li>
              <li>✓ Cristales y Robo</li>
            </ul>
            <button class="btn btn-outline" onclick="openQuoteModal('auto')">Cotizar Ahora</button>
          </div>
          
          <div class="service-card-detailed featured">
            <div class="badge">Más Popular</div>
            <div class="service-icon-large">🏠</div>
            <h3>Seguros de Hogar</h3>
            <p>Tu patrimonio protegido contra todo tipo de riesgos y eventualidades.</p>
            <ul class="service-list">
              <li>✓ Daños Estructurales</li>
              <li>✓ Contenido y Bienes</li>
              <li>✓ Responsabilidad Civil</li>
              <li>✓ Desastres Naturales</li>
              <li>✓ Robo y Vandalismo</li>
            </ul>
            <button class="btn btn-primary" onclick="openQuoteModal('hogar')">Cotizar Ahora</button>
          </div>
          
          <div class="service-card-detailed">
            <div class="service-icon-large">❤️</div>
            <h3>Seguros de Vida</h3>
            <p>Asegura el futuro de tus seres queridos con planes flexibles y accesibles.</p>
            <ul class="service-list">
              <li>✓ Cobertura Familiar</li>
              <li>✓ Planes Personalizados</li>
              <li>✓ Beneficios por Invalidez</li>
              <li>✓ Enfermedades Graves</li>
              <li>✓ Ahorro e Inversión</li>
            </ul>
            <button class="btn btn-outline" onclick="openQuoteModal('vida')">Cotizar Ahora</button>
          </div>
          
          <div class="service-card-detailed">
            <div class="service-icon-large">🏢</div>
            <h3>Seguros Comerciales</h3>
            <p>Protección integral para tu negocio y continuidad operativa.</p>
            <ul class="service-list">
              <li>✓ Responsabilidad General</li>
              <li>✓ Propiedad Comercial</li>
              <li>✓ Compensación Laboral</li>
              <li>✓ Interrupción de Negocio</li>
              <li>✓ Cyber Seguridad</li>
            </ul>
            <button class="btn btn-outline" onclick="openQuoteModal('comercial')">Cotizar Ahora</button>
          </div>
          
          <div class="service-card-detailed">
            <div class="service-icon-large">💼</div>
            <h3>Seguros de Salud</h3>
            <p>Acceso a los mejores servicios médicos con cobertura amplia.</p>
            <ul class="service-list">
              <li>✓ Hospitalización</li>
              <li>✓ Cirugías y Tratamientos</li>
              <li>✓ Medicamentos</li>
              <li>✓ Red Médica Extensa</li>
              <li>✓ Exámenes Preventivos</li>
            </ul>
            <button class="btn btn-outline" onclick="openQuoteModal('salud')">Cotizar Ahora</button>
          </div>
          
          <div class="service-card-detailed">
            <div class="service-icon-large">✈️</div>
            <h3>Seguros de Viaje</h3>
            <p>Viaja tranquilo con cobertura internacional completa.</p>
            <ul class="service-list">
              <li>✓ Asistencia Mundial</li>
              <li>✓ Gastos Médicos</li>
              <li>✓ Cancelación de Viaje</li>
              <li>✓ Equipaje Protegido</li>
              <li>✓ Repatriación</li>
            </ul>
            <button class="btn btn-outline" onclick="openQuoteModal('viaje')">Cotizar Ahora</button>
          </div>
        </div>
      </div>
    </section>
  `,
  
  about: `
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">Sobre Nosotros</h1>
        <p class="page-subtitle">Protection Beyond The Limits</p>
      </div>
    </section>
    
    <section class="about-section">
      <div class="container">
        <div class="about-grid">
          <div class="about-content">
            <h2>Nuestra Historia</h2>
            <p>Con más de 25 años de experiencia en el sector de seguros, Krause Insurance ha protegido a miles de familias y negocios. Fundada por Guillermo Krause, nuestra empresa se ha construido sobre los pilares de confianza, profesionalismo y compromiso genuino con nuestros clientes.</p>
            
            <h3>Nuestra Misión</h3>
            <p>Proporcionar soluciones de seguros personalizadas que superen las expectativas de nuestros clientes, brindando protección integral y paz mental.</p>
            
            <h3>Nuestros Valores</h3>
            <ul class="values-list">
              <li><strong>Integridad:</strong> Actuamos con honestidad y transparencia</li>
              <li><strong>Compromiso:</strong> Dedicados al bienestar de nuestros clientes</li>
              <li><strong>Excelencia:</strong> Buscamos la perfección en cada servicio</li>
              <li><strong>Innovación:</strong> Adaptándonos a las necesidades cambiantes</li>
            </ul>
          </div>
          
          <div class="about-image">
            <div class="stat-highlight">
              <div class="stat-number">25+</div>
              <div class="stat-text">Años de Experiencia</div>
            </div>
            <div class="stat-highlight">
              <div class="stat-number">5,000+</div>
              <div class="stat-text">Clientes Satisfechos</div>
            </div>
            <div class="stat-highlight">
              <div class="stat-number">98%</div>
              <div class="stat-text">Satisfacción</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <section class="team-section">
      <div class="container">
        <h2 class="section-title">Nuestro Equipo</h2>
        <div class="team-grid">
          <div class="team-member">
            <div class="member-avatar">GK</div>
            <h3>Guillermo Krause</h3>
            <p class="member-role">Fundador & CEO</p>
            <p>25+ años liderando la industria de seguros con pasión y dedicación.</p>
          </div>
          <div class="team-member">
            <div class="member-avatar">AS</div>
            <h3>Agentes Especializados</h3>
            <p class="member-role">Equipo Comercial</p>
            <p>Expertos certificados listos para asesorarte en cada paso.</p>
          </div>
          <div class="team-member">
            <div class="member-avatar">SC</div>
            <h3>Servicio al Cliente</h3>
            <p class="member-role">Soporte 24/7</p>
            <p>Siempre disponibles para resolver tus dudas y necesidades.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  
  contact: `
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">Contáctanos</h1>
        <p class="page-subtitle">Estamos aquí para ayudarte</p>
      </div>
    </section>
    
    <section class="contact-section">
      <div class="container">
        <div class="contact-grid-layout">
          <div class="contact-info-panel">
            <h2>Información de Contacto</h2>
            <p>¿Tienes preguntas? Estamos aquí para responder. Contáctanos por cualquiera de estos medios:</p>
            
            <div class="contact-methods-list">
              <div class="contact-method-item">
                <div class="method-icon">📞</div>
                <div>
                  <div class="method-label">Teléfono</div>
                  <a href="tel:+123456789" class="method-value">+1 (234) 567-89</a>
                </div>
              </div>
              
              <div class="contact-method-item">
                <div class="method-icon">📧</div>
                <div>
                  <div class="method-label">Email</div>
                  <a href="mailto:info@krauseinsurances.com" class="method-value">info@krauseinsurances.com</a>
                </div>
              </div>
              
              <div class="contact-method-item">
                <div class="method-icon">📍</div>
                <div>
                  <div class="method-label">Oficina</div>
                  <div class="method-value">Tu Ciudad, Estado<br>Código Postal</div>
                </div>
              </div>
              
              <div class="contact-method-item">
                <div class="method-icon">🕐</div>
                <div>
                  <div class="method-label">Horario</div>
                  <div class="method-value">Lun - Vie: 9:00 AM - 6:00 PM<br>Sáb: 10:00 AM - 2:00 PM</div>
                </div>
              </div>
            </div>
            
            <div class="social-links-contact">
              <a href="#" class="social-link">LinkedIn</a>
              <a href="#" class="social-link">Facebook</a>
              <a href="#" class="social-link">Instagram</a>
            </div>
          </div>
          
          <div class="contact-form-panel">
            <h2>Envíanos un Mensaje</h2>
            <form class="contact-form-app" onsubmit="handleContactSubmit(event)">
              <div class="form-row">
                <div class="form-group">
                  <input type="text" class="form-control" placeholder="Nombre completo" required>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <input type="email" class="form-control" placeholder="Email" required>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <input type="tel" class="form-control" placeholder="Teléfono" required>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <select class="form-control" required>
                    <option value="">Selecciona un servicio</option>
                    <option value="auto">Seguro de Auto</option>
                    <option value="hogar">Seguro de Hogar</option>
                    <option value="vida">Seguro de Vida</option>
                    <option value="salud">Seguro de Salud</option>
                    <option value="comercial">Seguro Comercial</option>
                    <option value="viaje">Seguro de Viaje</option>
                  </select>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <textarea class="form-control" rows="5" placeholder="Cuéntanos cómo podemos ayudarte..." required></textarea>
                </div>
              </div>
              
              <button type="submit" class="btn btn-primary btn-block">
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  `,
  
  login: `
    <section class="auth-section">
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <svg class="logo-shield-auth" width="60" height="60" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <ellipse class="shield-circle" cx="40" cy="38" rx="22" ry="22" stroke="currentColor" stroke-width="3" fill="none" />
              <path class="shield-diamond" d="M40 12 L62 35 L40 70 L18 35 Z" stroke="currentColor" stroke-width="3" fill="none" />
              <path class="shield-arc" d="M24 50 Q40 30 56 50" stroke="currentColor" stroke-width="3" fill="none" />
              <line class="shield-line" x1="40" y1="50" x2="40" y2="68" stroke="currentColor" stroke-width="3" />
            </svg>
            <h2>Portal de Clientes</h2>
            <p>Accede a tu cuenta para revisar tus pólizas</p>
          </div>
          
          <form class="auth-form" onsubmit="handleClientLogin(event)">
            <div class="form-group">
              <label class="form-label">Número de Póliza o Email</label>
              <input type="text" class="form-control" placeholder="Ingresa tu número de póliza" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">Contraseña</label>
              <input type="password" class="form-control" placeholder="Ingresa tu contraseña" required>
            </div>
            
            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox"> Recordarme
              </label>
              <a href="#" class="link-text">¿Olvidaste tu contraseña?</a>
            </div>
            
            <button type="submit" class="btn btn-primary btn-block">
              Iniciar Sesión
            </button>
          </form>
          
          <div class="auth-footer">
            <p>¿No tienes cuenta? <a href="#" onclick="navigateTo('contact')" class="link-text">Contáctanos</a></p>
          </div>
          
          <div class="demo-credentials">
            <p><strong>Credenciales de Prueba:</strong></p>
            <p>Usuario: cliente@demo.com</p>
            <p>Contraseña: demo123</p>
          </div>
        </div>
      </div>
    </section>
  `,
  
  'agent-login': `
    <section class="auth-section">
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <svg class="logo-shield-auth" width="60" height="60" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <ellipse class="shield-circle" cx="40" cy="38" rx="22" ry="22" stroke="currentColor" stroke-width="3" fill="none" />
              <path class="shield-diamond" d="M40 12 L62 35 L40 70 L18 35 Z" stroke="currentColor" stroke-width="3" fill="none" />
              <path class="shield-arc" d="M24 50 Q40 30 56 50" stroke="currentColor" stroke-width="3" fill="none" />
              <line class="shield-line" x1="40" y1="50" x2="40" y2="68" stroke="currentColor" stroke-width="3" />
            </svg>
            <h2>Portal de Agentes</h2>
            <p>Acceso exclusivo para agentes certificados</p>
          </div>
          
          <form class="auth-form" onsubmit="handleAgentLogin(event)">
            <div class="form-group">
              <label class="form-label">ID de Agente</label>
              <input type="text" class="form-control" placeholder="Ingresa tu ID de agente" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">Contraseña</label>
              <input type="password" class="form-control" placeholder="Ingresa tu contraseña" required>
            </div>
            
            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox"> Recordarme
              </label>
              <a href="#" class="link-text">¿Olvidaste tu contraseña?</a>
            </div>
            
            <button type="submit" class="btn btn-primary btn-block">
              Iniciar Sesión
            </button>
          </form>
          
          <div class="auth-footer">
            <p>¿Nuevo agente? <a href="#" onclick="showAgentRegistration()" class="link-text">Solicita acceso</a></p>
          </div>
          
          <div class="demo-credentials">
            <p><strong>Credenciales de Prueba:</strong></p>
            <p>Agente: agente@demo.com</p>
            <p>Contraseña: agent123</p>
          </div>
        </div>
      </div>
    </section>
  `
};

// Client Dashboard
pages.dashboard = `
  <section class="dashboard-section">
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          <h1>Mi Dashboard</h1>
          <p>Bienvenido, ${currentUser?.name || 'Cliente'}</p>
        </div>
        <button class="btn btn-outline" onclick="logout()">Cerrar Sesión</button>
      </div>
      
      <div class="dashboard-stats">
        <div class="dashboard-stat-card">
          <div class="stat-icon">📄</div>
          <div class="stat-info">
            <div class="stat-value">3</div>
            <div class="stat-label">Pólizas Activas</div>
          </div>
        </div>
        <div class="dashboard-stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-value">Al Día</div>
            <div class="stat-label">Estado de Pagos</div>
          </div>
        </div>
        <div class="dashboard-stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <div class="stat-value">15 Mar</div>
            <div class="stat-label">Próximo Pago</div>
          </div>
        </div>
        <div class="dashboard-stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <div class="stat-value">$450</div>
            <div class="stat-label">Total Mensual</div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-grid">
        <div class="dashboard-main">
          <div class="dashboard-card">
            <div class="card-header">
              <h3>Mis Pólizas</h3>
              <button class="btn btn-sm btn-outline" onclick="showNotification('Función disponible próximamente', 'info')">Nueva Póliza</button>
            </div>
            <div class="policies-list">
              <div class="policy-item">
                <div class="policy-icon">🚗</div>
                <div class="policy-info">
                  <h4>Seguro de Auto</h4>
                  <p>Toyota Camry 2022 • Póliza #A-12345</p>
                  <div class="policy-meta">
                    <span class="badge badge-success">Activa</span>
                    <span>Vence: 15 Dic 2025</span>
                  </div>
                </div>
                <div class="policy-actions">
                  <button class="btn btn-sm btn-outline" onclick="viewPolicy('A-12345')">Ver Detalles</button>
                </div>
              </div>
              
              <div class="policy-item">
                <div class="policy-icon">🏠</div>
                <div class="policy-info">
                  <h4>Seguro de Hogar</h4>
                  <p>Propiedad Residencial • Póliza #H-67890</p>
                  <div class="policy-meta">
                    <span class="badge badge-success">Activa</span>
                    <span>Vence: 20 Nov 2025</span>
                  </div>
                </div>
                <div class="policy-actions">
                  <button class="btn btn-sm btn-outline" onclick="viewPolicy('H-67890')">Ver Detalles</button>
                </div>
              </div>
              
              <div class="policy-item">
                <div class="policy-icon">❤️</div>
                <div class="policy-info">
                  <h4>Seguro de Vida</h4>
                  <p>Plan Familiar • Póliza #V-24680</p>
                  <div class="policy-meta">
                    <span class="badge badge-success">Activa</span>
                    <span>Vence: 01 Ene 2026</span>
                  </div>
                </div>
                <div class="policy-actions">
                  <button class="btn btn-sm btn-outline" onclick="viewPolicy('V-24680')">Ver Detalles</button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="dashboard-card">
            <div class="card-header">
              <h3>Historial de Pagos</h3>
              <button class="btn btn-sm btn-outline" onclick="downloadPaymentHistory()">Descargar</button>
            </div>
            <div class="payments-table">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Póliza</th>
                    <th>Monto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>15 Feb 2025</td>
                    <td>Auto - A-12345</td>
                    <td>$150.00</td>
                    <td><span class="badge badge-success">Pagado</span></td>
                  </tr>
                  <tr>
                    <td>20 Ene 2025</td>
                    <td>Hogar - H-67890</td>
                    <td>$200.00</td>
                    <td><span class="badge badge-success">Pagado</span></td>
                  </tr>
                  <tr>
                    <td>01 Ene 2025</td>
                    <td>Vida - V-24680</td>
                    <td>$100.00</td>
                    <td><span class="badge badge-success">Pagado</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div class="dashboard-sidebar">
          <div class="dashboard-card">
            <h3>Acciones Rápidas</h3>
            <div class="quick-actions">
              <button class="btn btn-outline btn-block" onclick="makePayment()">
                💳 Realizar Pago
              </button>
              <button class="btn btn-outline btn-block" onclick="fileClaim()">
                📋 Reportar Siniestro
              </button>
              <button class="btn btn-outline btn-block" onclick="updateInfo()">
                ✏️ Actualizar Información
              </button>
              <button class="btn btn-outline btn-block" onclick="contactAgent()">
                📞 Contactar Agente
              </button>
            </div>
          </div>
          
          <div class="dashboard-card">
            <h3>Mi Agente</h3>
            <div class="agent-info">
              <div class="agent-avatar">GK</div>
              <h4>Guillermo Krause</h4>
              <p>Agente Principal</p>
              <div class="agent-contact">
                <p>📞 +1 (234) 567-89</p>
                <p>📧 gkrause@krauseins.com</p>
              </div>
              <button class="btn btn-sm btn-outline btn-block" onclick="contactAgent()">Contactar</button>
            </div>
          </div>
          
          <div class="dashboard-card">
            <h3>Documentos</h3>
            <div class="documents-list">
              <a href="#" class="document-link">
                📄 Póliza Auto (PDF)
              </a>
              <a href="#" class="document-link">
                📄 Póliza Hogar (PDF)
              </a>
              <a href="#" class="document-link">
                📄 Póliza Vida (PDF)
              </a>
              <a href="#" class="document-link">
                📊 Estado de Cuenta
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
`;

// Agent Dashboard
pages['agent-dashboard'] = `
  <section class="dashboard-section agent-dashboard">
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          <h1>Panel de Agente</h1>
          <p>Bienvenido, ${currentUser?.name || 'Agente'}</p>
        </div>
        <button class="btn btn-outline" onclick="logout()">Cerrar Sesión</button>
      </div>
      
      <div class="dashboard-stats">
        <div class="dashboard-stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <div class="stat-value">142</div>
            <div class="stat-label">Clientes Activos</div>
          </div>
        </div>
        <div class="dashboard-stat-card">
          <div class="stat-icon">📄</div>
          <div class="stat-info">
            <div class="stat-value">256</div>
            <div class="stat-label">Pólizas Totales</div>
          </div>
        </div>
        <div class="dashboard-stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <div class="stat-value">$85K</div>
            <div class="stat-label">Primas Este Mes</div>
          </div>
        </div>
        <div class="dashboard-stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-info">
            <div class="stat-value">+12%</div>
            <div class="stat-label">Crecimiento</div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-grid">
        <div class="dashboard-main">
          <div class="dashboard-card">
            <div class="card-header">
              <h3>Clientes Recientes</h3>
              <button class="btn btn-sm btn-primary" onclick="addNewClient()">+ Nuevo Cliente</button>
            </div>
            <div class="clients-table">
              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Pólizas</th>
                    <th>Estado</th>
                    <th>Última Actividad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div class="client-cell">
                        <div class="client-avatar">MG</div>
                        <div>
                          <div class="client-name">María González</div>
                          <div class="client-email">maria.g@email.com</div>
                        </div>
                      </div>
                    </td>
                    <td>3 Activas</td>
                    <td><span class="badge badge-success">Al Día</span></td>
                    <td>Hace 2 días</td>
                    <td>
                      <button class="btn-icon" onclick="viewClientDetails('MG')">👁️</button>
                      <button class="btn-icon" onclick="editClient('MG')">✏️</button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div class="client-cell">
                        <div class="client-avatar">CR</div>
                        <div>
                          <div class="client-name">Carlos Ramírez</div>
                          <div class="client-email">carlos.r@email.com</div>
                        </div>
                      </div>
                    </td>
                    <td>2 Activas</td>
                    <td><span class="badge badge-success">Al Día</span></td>
                    <td>Hace 5 días</td>
                    <td>
                      <button class="btn-icon" onclick="viewClientDetails('CR')">👁️</button>
                      <button class="btn-icon" onclick="editClient('CR')">✏️</button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div class="client-cell">
                        <div class="client-avatar">AM</div>
                        <div>
                          <div class="client-name">Ana Martínez</div>
                          <div class="client-email">ana.m@email.com</div>
                        </div>
                      </div>
                    </td>
                    <td>4 Activas</td>
                    <td><span class="badge badge-warning">Pago Pendiente</span></td>
                    <td>Hace 1 semana</td>
                    <td>
                      <button class="btn-icon" onclick="viewClientDetails('AM')">👁️</button>
                      <button class="btn-icon" onclick="editClient('AM')">✏️</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="dashboard-card">
            <div class="card-header">
              <h3>Cotizaciones Pendientes</h3>
            </div>
            <div class="quotes-list">
              <div class="quote-item">
                <div class="quote-info">
                  <h4>Juan Pérez - Seguro de Auto</h4>
                  <p>Toyota Corolla 2023</p>
                  <span class="quote-date">Solicitado: 28 Nov 2025</span>
                </div>
                <button class="btn btn-sm btn-primary" onclick="processQuote('Q-001')">Procesar</button>
              </div>
              <div class="quote-item">
                <div class="quote-info">
                  <h4>Sofía López - Seguro de Hogar</h4>
                  <p>Casa 2 pisos, $350K</p>
                  <span class="quote-date">Solicitado: 27 Nov 2025</span>
                </div>
                <button class="btn btn-sm btn-primary" onclick="processQuote('Q-002')">Procesar</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="dashboard-sidebar">
          <div class="dashboard-card">
            <h3>Acciones Rápidas</h3>
            <div class="quick-actions">
              <button class="btn btn-primary btn-block" onclick="addNewClient()">
                👥 Nuevo Cliente
              </button>
              <button class="btn btn-outline btn-block" onclick="createQuote()">
                📝 Nueva Cotización
              </button>
              <button class="btn btn-outline btn-block" onclick="processRenewal()">
                🔄 Renovaciones
              </button>
              <button class="btn btn-outline btn-block" onclick="viewReports()">
                📊 Reportes
              </button>
            </div>
          </div>
          
          <div class="dashboard-card">
            <h3>Tareas Pendientes</h3>
            <div class="tasks-list">
              <div class="task-item">
                <input type="checkbox" onchange="completeTask(1)">
                <span>Seguimiento a María González</span>
              </div>
              <div class="task-item">
                <input type="checkbox" onchange="completeTask(2)">
                <span>Renovación póliza Carlos R.</span>
              </div>
              <div class="task-item">
                <input type="checkbox" onchange="completeTask(3)">
                <span>Llamar a Ana Martínez (pago)</span>
              </div>
            </div>
          </div>
          
          <div class="dashboard-card">
            <h3>Comisiones</h3>
            <div class="commissions-info">
              <div class="commission-row">
                <span>Este Mes:</span>
                <strong>$3,250</strong>
              </div>
              <div class="commission-row">
                <span>Mes Anterior:</span>
                <strong>$2,890</strong>
              </div>
              <div class="commission-row">
                <span>Año a la Fecha:</span>
                <strong>$28,450</strong>
              </div>
              <button class="btn btn-sm btn-outline btn-block" onclick="viewCommissionDetails()">Ver Detalles</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
`;

// Load page function
function loadPage(page) {
  const mainContent = document.getElementById('mainContent');
  if (pages[page]) {
    mainContent.innerHTML = pages[page];
    
    // Initialize animations for stats and start sequence if on home page
    if (page === 'home') {
      setTimeout(() => {
        initStatsAnimation();
        startHomeSequence();
      }, 100);
    }
  } else {
    mainContent.innerHTML = '<div class="container"><h1>Página no encontrada</h1></div>';
  }
}

// Home animation sequence
function startHomeSequence() {
  const heroSection = document.querySelector('.hero-intro');
  const paradeSection = document.querySelector('.features-parade');
  const ctaSection = document.querySelector('.final-cta');
  const subNav = document.getElementById('sub-nav');
  const skipBtn = document.querySelector('.btn-home-start');

  if (!heroSection || !paradeSection || !ctaSection) return;

  // Set initial gradient position
  document.body.classList.add('section-hero');

  // Show sub-nav bar but hide all buttons initially
  if (subNav) {
    subNav.classList.add('d-flex');
    subNav.classList.remove('d-none');
    const allButtons = subNav.querySelectorAll('.sub-nav-btn');
    allButtons.forEach(btn => {
      btn.classList.add('d-none');
      btn.classList.remove('d-inline-block');
    });
  }

  // Step 1: Show hero for 6 seconds
  setTimeout(() => {
    // Step 2: Transition to parade
    document.body.classList.remove('section-hero');
    document.body.classList.add('section-parade');
    heroSection.classList.add('fade-out-up');
    
    // Show Hero button with droplet effect after section starts minimizing
    setTimeout(() => {
      const heroBtn = subNav.querySelector('[data-section="hero"]');
      if (heroBtn) {
        heroBtn.classList.add('d-inline-block');
        heroBtn.classList.remove('d-none');
        heroBtn.classList.add('btn-droplet');
        setTimeout(() => heroBtn.classList.remove('btn-droplet'), 600);
      }
    }, 400);
    
    setTimeout(() => {
      heroSection.classList.remove('active');
      paradeSection.classList.add('active');
      
      // Step 3: After parade, show CTA
      setTimeout(() => {
        document.body.classList.remove('section-parade');
        document.body.classList.add('section-cta');
        paradeSection.classList.add('fade-out-up');
        
        // Show Elección button with droplet effect
        setTimeout(() => {
          const eleccionBtn = subNav.querySelector('[data-section="eleccion"]');
          if (eleccionBtn) {
            eleccionBtn.classList.add('d-inline-block');
            eleccionBtn.classList.remove('d-none');
            eleccionBtn.classList.add('btn-droplet');
            setTimeout(() => eleccionBtn.classList.remove('btn-droplet'), 600);
          }
        }, 400);
        
        setTimeout(() => {
          paradeSection.classList.remove('active');
          ctaSection.classList.add('active');
          
          // Show Cotiza button with droplet effect
          setTimeout(() => {
            const cotizaBtn = subNav.querySelector('[data-section="cotiza"]');
            if (cotizaBtn) {
              cotizaBtn.classList.add('d-inline-block');
              cotizaBtn.classList.remove('d-none');
              cotizaBtn.classList.add('btn-droplet');
              setTimeout(() => cotizaBtn.classList.remove('btn-droplet'), 600);
            }
          }, 400);
          
          // Remove skip button
          if (skipBtn) {
            skipBtn.classList.add('d-none');
            skipBtn.classList.remove('d-block');
          }
        }, 800);
      }, 8000); // Show parade for 8 seconds
    }, 800);
  }, 6000); // Show hero for 6 seconds
}

// Skip to final state
function skipToFinalState() {
  const heroSection = document.querySelector('.hero-intro');
  const paradeSection = document.querySelector('.features-parade');
  const ctaSection = document.querySelector('.final-cta');
  const subNav = document.getElementById('sub-nav');
  const skipBtn = document.querySelector('.btn-home-start');

  if (!heroSection || !paradeSection || !ctaSection) return;

  // Update gradient position
  document.body.classList.remove('section-hero', 'section-parade');
  document.body.classList.add('section-cta');

  // Hide all sections properly
  const allSections = document.querySelectorAll('.home-section');
  allSections.forEach(section => {
    section.classList.remove('active', 'fade-out-up');
    section.classList.add('d-none');
    section.classList.remove('d-flex');
  });
  
  // Show CTA section
  ctaSection.classList.add('d-flex');
  ctaSection.classList.remove('d-none');
  ctaSection.classList.add('active');
  
  // Show sub-navigation with all buttons
  if (subNav) {
    subNav.classList.add('d-flex');
    subNav.classList.remove('d-none');
    const allButtons = subNav.querySelectorAll('.sub-nav-btn');
    allButtons.forEach((btn, index) => {
      btn.classList.add('d-inline-block');
      btn.classList.remove('d-none');
      setTimeout(() => {
        btn.classList.add('btn-droplet');
        setTimeout(() => btn.classList.remove('btn-droplet'), 600);
      }, index * 150);
    });
  }
  
  // Remove skip button
  if (skipBtn) {
    skipBtn.classList.add('d-none');
    skipBtn.classList.remove('d-block');
  }
}

function showHomeSection(section) {
  // Update gradient position based on section
  document.body.classList.remove('section-hero', 'section-parade', 'section-cta');
  if (section === 'hero') {
    document.body.classList.add('section-hero');
  } else if (section === 'eleccion') {
    document.body.classList.add('section-parade');
  } else if (section === 'cotiza') {
    document.body.classList.add('section-cta');
  }

  // Update nav buttons
  document.querySelectorAll('.sub-nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.section === section) {
      btn.classList.add('active');
    }
  });
  
  // Hide all sections and remove from DOM flow
  const allSections = document.querySelectorAll('.home-section');
  allSections.forEach(sec => {
    sec.classList.remove('active');
    sec.classList.remove('fade-out-up');
    sec.classList.add('d-none');
    sec.classList.remove('d-flex');
  });
  
  // Show selected section
  const targetSection = document.getElementById(`${section}-section`);
  if (targetSection) {
    targetSection.classList.add('d-flex');
    targetSection.classList.remove('d-none');
    targetSection.classList.add('active');
    
    // Reinitialize stats if showing hero
    if (section === 'hero') {
      setTimeout(initStatsAnimation, 100);
    }
  }
}

// Toggle footer
function toggleFooter() {
  const footer = document.getElementById('footer');
  const toggleText = document.getElementById('footer-toggle-text');
  
  if (footer.classList.contains('collapsed')) {
    footer.classList.remove('collapsed');
    toggleText.textContent = 'Ocultar Información';
  } else {
    footer.classList.add('collapsed');
    toggleText.textContent = 'Mostrar Información';
  }
}

// Initialize stats animation
function initStatsAnimation() {
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach(stat => {
    const target = parseInt(stat.dataset.target);
    animateCounter(stat, target);
  });
}

// Animate counter
function animateCounter(element, target, duration = 2000) {
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

// Form handlers
function handleContactSubmit(e) {
  e.preventDefault();
  showNotification('Mensaje enviado exitosamente. Te contactaremos pronto.', 'success');
  e.target.reset();
}

function handleClientLogin(e) {
  e.preventDefault();
  const email = e.target[0].value;
  const password = e.target[1].value;
  
  if (email === 'cliente@demo.com' && password === 'demo123') {
    currentUser = { name: 'Juan Cliente', type: 'client', email };
    localStorage.setItem('krause_user', JSON.stringify(currentUser));
    showNotification('Inicio de sesión exitoso', 'success');
    navigateTo('dashboard');
  } else {
    showNotification('Credenciales incorrectas', 'error');
  }
}

function handleAgentLogin(e) {
  e.preventDefault();
  const agentId = e.target[0].value;
  const password = e.target[1].value;
  
  if (agentId === 'agente@demo.com' && password === 'agent123') {
    currentUser = { name: 'Guillermo Krause', type: 'agent', id: agentId };
    localStorage.setItem('krause_user', JSON.stringify(currentUser));
    showNotification('Inicio de sesión exitoso', 'success');
    navigateTo('agent-dashboard');
  } else {
    showNotification('Credenciales incorrectas', 'error');
  }
}

// Dashboard functions (placeholders)
function viewPolicy(policyId) {
  showNotification(`Mostrando detalles de póliza ${policyId}`, 'info');
}

function makePayment() {
  showNotification('Redirigiendo a pasarela de pago...', 'info');
}

function fileClaim() {
  showNotification('Abriendo formulario de siniestros...', 'info');
}

function updateInfo() {
  showNotification('Abriendo formulario de actualización...', 'info');
}

function contactAgent() {
  showNotification('Abriendo chat con agente...', 'info');
}

function downloadPaymentHistory() {
  showNotification('Descargando historial...', 'info');
}

function openQuoteModal(type) {
  showNotification(`Abriendo cotización para seguro de ${type}`, 'info');
}

function addNewClient() {
  showNotification('Abriendo formulario de nuevo cliente...', 'info');
}

function viewClientDetails(clientId) {
  showNotification(`Mostrando detalles del cliente ${clientId}`, 'info');
}

function editClient(clientId) {
  showNotification(`Editando cliente ${clientId}`, 'info');
}

function processQuote(quoteId) {
  showNotification(`Procesando cotización ${quoteId}`, 'info');
}

function createQuote() {
  showNotification('Creando nueva cotización...', 'info');
}

function processRenewal() {
  showNotification('Abriendo renovaciones pendientes...', 'info');
}

function viewReports() {
  showNotification('Generando reportes...', 'info');
}

function completeTask(taskId) {
  showNotification('Tarea completada', 'success');
}

function viewCommissionDetails() {
  showNotification('Mostrando detalle de comisiones...', 'info');
}

function showAgentRegistration() {
  showNotification('Contacta al administrador para solicitar acceso como agente', 'info');
}

// Particles animation (same as landing)
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 4 + 2;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
    this.opacity = Math.random() * 0.4 + 0.4;
  }

  checkCollisionWithElements() {
    // Verificar colisión con elementos del DOM que tengan contenido
    const elements = document.querySelectorAll('.navbar, .sub-navigation, .main-content, .home-section, .feature-box, .agent-card, .stat-box, .btn, .auth-card, .dashboard-card, .service-card-detailed, .cta-section');
    
    for (let elem of elements) {
      const rect = elem.getBoundingClientRect();
      const padding = 20; // Margen de seguridad alrededor del elemento
      
      // Verificar si la partícula está dentro o cerca del elemento
      if (this.x > rect.left - padding && 
          this.x < rect.right + padding && 
          this.y > rect.top - padding && 
          this.y < rect.bottom + padding) {
        
        // Rebotar en la dirección opuesta
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calcular dirección de rebote basada en la posición relativa
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
    
    // Rebotar en los bordes del canvas
    if (this.x > canvas.width) {
      this.x = canvas.width;
      this.speedX *= -1;
    }
    if (this.x < 0) {
      this.x = 0;
      this.speedX *= -1;
    }
    if (this.y > canvas.height) {
      this.y = canvas.height;
      this.speedY *= -1;
    }
    if (this.y < 0) {
      this.y = 0;
      this.speedY *= -1;
    }
    
    // Verificar colisiones con elementos del DOM
    this.checkCollisionWithElements();
  }

  draw() {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 10000));
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

function connectParticles() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 120) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - distance / 120)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });
  connectParticles();
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  if (checkAuth()) {
    if (currentUser.type === 'client') {
      navigateTo('dashboard');
    } else if (currentUser.type === 'agent') {
      navigateTo('agent-dashboard');
    } else {
      navigateTo('home');
    }
  } else {
    navigateTo('home');
  }
});

console.log('🏛️ Krause Insurance App cargada correctamente');
