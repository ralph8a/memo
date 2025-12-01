// Services Template
export default `
<section class="page-header">
  <div class="container">
    <h1 class="page-title">Nuestros Servicios</h1>
    <p class="page-subtitle">Cobertura completa para todas tus necesidades</p>
  </div>
</section>
<section class="services-section">
  <div class="container">
    <div class="services-grid">
      <div class="service-card-detailed">
        <div class="service-icon-large">🚗</div>
        <h3>Seguros de Auto</h3>
        <p>Protección completa para tu vehículo</p>
        <ul class="service-list">
          <li>✓ Responsabilidad Civil</li>
          <li>✓ Cobertura Amplia</li>
          <li>✓ Asistencia Vial 24/7</li>
        </ul>
        <button class="btn btn-outline" onclick="window.appHandlers.openQuoteModal('auto')">Cotizar</button>
      </div>
      <div class="service-card-detailed featured">
        <div class="badge">Más Popular</div>
        <div class="service-icon-large">🏠</div>
        <h3>Seguros de Hogar</h3>
        <p>Tu patrimonio protegido</p>
        <ul class="service-list">
          <li>✓ Daños Estructurales</li>
          <li>✓ Contenido y Bienes</li>
          <li>✓ Responsabilidad Civil</li>
        </ul>
        <button class="btn btn-primary" onclick="window.appHandlers.openQuoteModal('hogar')">Cotizar</button>
      </div>
      <div class="service-card-detailed">
        <div class="service-icon-large">❤️</div>
        <h3>Seguros de Vida</h3>
        <p>Asegura el futuro de tu familia</p>
        <ul class="service-list">
          <li>✓ Cobertura Familiar</li>
          <li>✓ Planes Personalizados</li>
          <li>✓ Beneficios por Invalidez</li>
        </ul>
        <button class="btn btn-outline" onclick="window.appHandlers.openQuoteModal('vida')">Cotizar</button>
      </div>
    </div>
  </div>
</section>
`;
