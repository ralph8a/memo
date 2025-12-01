// Dashboard Template
export function getDashboardTemplate(user) {
  const userName = user?.name || 'Cliente';
  return `
<section class="dashboard-section">
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div>
        <h1>Mi Dashboard</h1>
        <p>Bienvenido, ${userName}</p>
      </div>
      <button class="btn btn-outline" onclick="window.appHandlers.logout(); window.appHandlers.navigateTo('home')">Cerrar Sesión</button>
    </div>
    <div class="dashboard-stats">
      <div class="dashboard-stat-card">
        <div class="stat-icon">📄</div>
        <div class="stat-info">
          <div class="stat-value">3</div>
          <div class="stat-label">Pólizas Activas</div>
        </div>
      </div>
    </div>
    <div class="dashboard-card">
      <h3>Mis Pólizas</h3>
      <p>Gestión de pólizas activas</p>
    </div>
  </div>
</section>
`;
}
