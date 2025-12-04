// Contact Template
export default `
<section class="contact-fullpage">
  <div class="contact-container">
    <div class="contact-header-main">
      <h1 class="contact-main-title">Contáctanos</h1>
      <p class="contact-main-subtitle">Estamos aquí para ayudarte</p>
    </div>
    
    <div class="contact-content-wrapper">
      <div class="contact-info-section">
        <div class="contact-info-card animated-info-1">
          <div class="contact-info-icon">📞</div>
          <h3 class="contact-info-title">Teléfono</h3>
          <a href="tel:+1234567890" class="contact-info-value">+1 (234) 567-890</a>
          <p class="contact-info-desc">Lun - Vie: 9:00 AM - 6:00 PM</p>
        </div>
        
        <div class="contact-info-card animated-info-2">
          <div class="contact-info-icon">✉️</div>
          <h3 class="contact-info-title">Email</h3>
          <a href="mailto:contact@krause.com" class="contact-info-value">contact@krause.com</a>
          <p class="contact-info-desc">Te respondemos en 24 horas</p>
        </div>
        
        <div class="contact-info-card animated-info-3">
          <div class="contact-info-icon">📍</div>
          <h3 class="contact-info-title">Ubicación</h3>
          <p class="contact-info-value">Calle Principal 123</p>
          <p class="contact-info-desc">Ciudad, Estado 12345</p>
        </div>
      </div>
      
      <div class="contact-form-section">
        <form class="contact-form-modern" onsubmit="window.appHandlers.handleContactSubmit(event)">
          <div class="form-row-double">
            <div class="form-group-modern">
              <input type="text" class="form-input-modern" placeholder="Tu nombre" required>
            </div>
            <div class="form-group-modern">
              <input type="email" class="form-input-modern" placeholder="Tu email" required>
            </div>
          </div>
          <div class="form-row-double">
            <div class="form-group-modern">
              <input type="tel" class="form-input-modern" placeholder="Teléfono">
            </div>
            <div class="form-group-modern">
              <select class="form-input-modern" required>
                <option value="">Selecciona un servicio</option>
                <option value="auto">Seguros de Auto</option>
                <option value="hogar">Seguros de Hogar</option>
                <option value="vida">Seguros de Vida</option>
                <option value="comercial">Seguros Comerciales</option>
                <option value="salud">Seguros de Salud</option>
                <option value="viaje">Seguros de Viaje</option>
              </select>
            </div>
          </div>
          <div class="form-group-modern">
            <textarea class="form-textarea-modern" placeholder="Tu mensaje" rows="3" required></textarea>
          </div>
          <button type="submit" class="btn-submit-modern">Enviar Mensaje</button>
          
          <div class="contact-social-card-inline">
            <h3 class="contact-social-title-inline">Síguenos</h3>
            <div class="contact-social-icons-inline">
              <a href="#" class="social-icon-inline">📘</a>
              <a href="#" class="social-icon-inline">📷</a>
              <a href="#" class="social-icon-inline">🐦</a>
              <a href="#" class="social-icon-inline">💼</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>
`;
