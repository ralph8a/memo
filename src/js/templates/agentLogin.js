// Agent Login Template
export default `
<section class="auth-section">
  <div class="auth-container">
    <div class="auth-card">
      <h2>Portal de Agentes</h2>
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
