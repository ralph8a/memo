// Services Template
export default `
<section class="services-fullpage">
  <div class="services-container">
    <div class="services-header-compact">
      <h1 class="services-main-title">Nuestros Servicios</h1>
      <p class="services-main-subtitle">Cobertura completa para todas tus necesidades</p>
    </div>
    
    <div class="services-grid-compact">
      <div class="service-card-compact card-1">
        <div class="service-icon-compact">🚗</div>
        <h3 class="service-name-compact">Seguros de Auto</h3>
        <p class="service-desc-compact">Protección completa para tu vehículo con las mejores coberturas del mercado.</p>
        <ul class="service-features-compact">
          <li>✓ Responsabilidad Civil</li>
          <li>✓ Cobertura Amplia</li>
          <li>✓ Asistencia Vial 24/7</li>
          <li>✓ Auto de Reemplazo</li>
          <li>✓ Cristales y Robo</li>
        </ul>
        <button class="btn-compact" onclick="window.appHandlers.openQuoteModal('auto')">Cotizar Ahora</button>
      </div>

      <div class="service-card-compact card-2 featured-compact">
        <div class="badge-compact">MÁS POPULAR</div>
        <div class="service-icon-compact">🏠</div>
        <h3 class="service-name-compact">Seguros de Hogar</h3>
        <p class="service-desc-compact">Tu patrimonio protegido contra todo tipo de riesgos y eventualidades.</p>
        <ul class="service-features-compact">
          <li>✓ Daños Estructurales</li>
          <li>✓ Contenido y Bienes</li>
          <li>✓ Responsabilidad Civil</li>
          <li>✓ Desastres Naturales</li>
          <li>✓ Robo y Vandalismo</li>
        </ul>
        <button class="btn-compact primary-compact" onclick="window.appHandlers.openQuoteModal('hogar')">Cotizar Ahora</button>
      </div>

      <div class="service-card-compact card-3">
        <div class="service-icon-compact">❤️</div>
        <h3 class="service-name-compact">Seguros de Vida</h3>
        <p class="service-desc-compact">Asegura el futuro de tus seres queridos con planes flexibles y accesibles.</p>
        <ul class="service-features-compact">
          <li>✓ Cobertura Familiar</li>
          <li>✓ Planes Personalizados</li>
          <li>✓ Beneficios por Invalidez</li>
          <li>✓ Enfermedades Graves</li>
          <li>✓ Ahorro e Inversión</li>
        </ul>
        <button class="btn-compact" onclick="window.appHandlers.openQuoteModal('vida')">Cotizar Ahora</button>
      </div>

      <div class="service-card-compact card-4">
        <div class="service-icon-compact">🏢</div>
        <h3 class="service-name-compact">Seguros Comerciales</h3>
        <p class="service-desc-compact">Protección integral para tu negocio y continuidad operativa.</p>
        <ul class="service-features-compact">
          <li>✓ Responsabilidad General</li>
          <li>✓ Propiedad Comercial</li>
          <li>✓ Compensación Laboral</li>
          <li>✓ Interrupción de Negocio</li>
          <li>✓ Cyber Seguridad</li>
        </ul>
        <button class="btn-compact" onclick="window.appHandlers.openQuoteModal('comercial')">Cotizar Ahora</button>
      </div>

      <div class="service-card-compact card-5">
        <div class="service-icon-compact">💼</div>
        <h3 class="service-name-compact">Seguros de Salud</h3>
        <p class="service-desc-compact">Acceso a los mejores servicios médicos con cobertura amplia.</p>
        <ul class="service-features-compact">
          <li>✓ Hospitalización</li>
          <li>✓ Cirugías y Tratamientos</li>
          <li>✓ Medicamentos</li>
          <li>✓ Red Médica Extensa</li>
          <li>✓ Exámenes Preventivos</li>
        </ul>
        <button class="btn-compact" onclick="window.appHandlers.openQuoteModal('salud')">Cotizar Ahora</button>
      </div>

      <div class="service-card-compact card-6">
        <div class="service-icon-compact">✈️</div>
        <h3 class="service-name-compact">Seguros de Viaje</h3>
        <p class="service-desc-compact">Viaja tranquilo con cobertura internacional completa.</p>
        <ul class="service-features-compact">
          <li>✓ Asistencia Mundial</li>
          <li>✓ Gastos Médicos</li>
          <li>✓ Cancelación de Viaje</li>
          <li>✓ Equipaje Protegido</li>
          <li>✓ Repatriación</li>
        </ul>
        <button class="btn-compact" onclick="window.appHandlers.openQuoteModal('viaje')">Cotizar Ahora</button>
      </div>
    </div>
  </div>
</section>
`;
