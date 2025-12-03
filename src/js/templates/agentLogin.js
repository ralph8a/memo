// Agent Login Template
export default `
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
      <form class="auth-form" onsubmit="window.appHandlers.handleAgentLogin(event)">
        <input type="text" class="form-control" placeholder="ID de Agente" required>
        <input type="password" class="form-control" placeholder="Contraseña" required>
        <button type="submit" class="btn btn-primary btn-block">Iniciar Sesión</button>
      </form>
      <div class="demo-credentials">
        <p><strong>Demo:</strong> agente@demo.com / agent123</p>
      </div>
    </div>
  </div>
</section>
`;
