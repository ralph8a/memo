// Agent Dashboard Template
export function getAgentDashboardTemplate(user) {
  const userName = user?.name || 'Agente';
  return `
<section class="dashboard-section agent-dashboard">
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div>
        <h1>Panel de Agente</h1>
        <p>Bienvenido, ${userName}</p>
      </div>
      <button class="btn btn-outline" onclick="window.appHandlers.logout(); window.appHandlers.navigateTo('home')">Cerrar Sesión</button>
    </div>
    <div class="dashboard-stats">
      <div class="dashboard-stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <div class="stat-value">142</div>
          <div class="stat-label">Clientes Activos</div>
        </div>
      </div>
    </div>
    <div class="dashboard-card">
      <h3>Clientes Recientes</h3>
      <p>Gestión de clientes y pólizas</p>
    </div>
  </div>
</section>
`;
}
