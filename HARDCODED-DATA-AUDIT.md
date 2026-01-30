# Auditoría de Datos Hardcodeados

## Resumen
Este documento identifica todos los datos hardcodeados que deben ser reemplazados por datos dinámicos desde la base de datos.

## Datos Encontrados

### 1. **client-dashboard.html** 
#### Stats Cards (Líneas 140-205)
- ❌ **Hardcoded**: `data-stat-policies`, `data-stat-payments`, `data-next-payment`, `data-total-monthly` muestran "—" por defecto
- ✅ **Solución**: Ya están configurados con `data-*` attributes para ser llenados dinámicamente por dashboardLoaders.js

#### Monitor de Pólizas (Líneas 210-270)
- ❌ **Hardcoded**: 
  - "65% activas, 22% en renovación, 13% con riesgo"
  - Donut chart con valores fijos
  - Acciones pendientes con ejemplos "Firma la renovación de Auto (vence 15 Mar)"
- ✅ **Solución**: Debe generarse desde `dashboardData.policies` y `dashboardData.pendingActions`

#### Documentos Recientes (Líneas 500-512)
- ❌ **Hardcoded**:
  ```javascript
  const demoDocs = [
    { title: 'Comprobante de pago', date: 'Mar 08, 2024', type: 'PDF', href: '#' },
    { title: 'Póliza Auto 2024', date: 'Feb 22, 2024', type: 'DOC', href: '#' },
    { title: 'Endoso Hogar', date: 'Feb 10, 2024', type: 'PDF', href: '#' }
  ];
  ```
- ✅ **Solución**: Ya usa `window.dashboardData?.recentDocs` pero tiene fallback a demo

### 2. **agent-dashboard.html**
#### Similar a client-dashboard
- Stats con valores placeholders
- Lista de clientes debe venir de BD

### 3. **constants.js**
#### Demo Credentials
```javascript
export const DEMO_CREDENTIALS = {
  CLIENT: {
    email: 'cliente@demo.com',
    password: 'demo123'
  },
  AGENT: {
    id: 'agente@demo.com',
    password: 'demo123'
  }
};
```
- ⚠️ **Mantener**: Útil para desarrollo/testing pero debe deshabilitarse en producción

### 4. **EntryPointMainApp.js**
#### Fallbacks en modo demo (Líneas 95-99)
```javascript
loadAgentDashboard = () => {
  const container = document.querySelector('[data-clients-list]');
  if (container) container.innerHTML = '<p class="empty-state">Modo demo - sin datos del backend</p>';
};
```
- ⚠️ **Mantener**: Son fallbacks necesarios cuando API no está disponible

## Plan de Acción

### Prioridad ALTA ✅ (Ya Implementado)
1. ✅ Stats cards usan data attributes
2. ✅ Documentos recientes usan `dashboardData.recentDocs`
3. ✅ Hero user name usa `dashboardData.user.name`

### Prioridad MEDIA 🔶 (Requiere Implementación)
1. **Monitor de Pólizas**: Generar desde `dashboardData.policies`
2. **Acciones Pendientes**: Crear endpoint `/backend?action=pending_actions`
3. **Chart Data**: Calendario de pagos, tendencias - ya tiene estructura pero falta poblar

### Prioridad BAJA ⬇️ (Mantener como está)
1. Placeholders "—" para datos no disponibles
2. Demo credentials (desarrollo)
3. Fallbacks de modo demo

## Endpoints de Backend Necesarios

### Ya Existentes ✅
- `?action=client_dashboard` - Dashboard data
- `?action=user_policies` - Pólizas del cliente
- `?action=payment_history` - Historial de pagos
- `?action=recent_documents` - Documentos recientes

### Por Implementar 📝
- `?action=pending_actions` - Acciones pendientes por póliza
- `?action=policy_health_stats` - Estadísticas de salud de pólizas (para donut chart)
- `?action=payment_trends` - Datos de tendencias de pago (para sparkline)

## Estado del Sistema

### Funcional ✅
- Autenticación JWT
- Carga de dashboard data
- Políticas desde BD
- Pagos desde BD
- Documentos desde BD

### Parcialmente Funcional 🟡
- Monitor de pólizas (estructura existe, falta poblar)
- Charts (placeholders, necesitan datos reales)
- Acciones pendientes (hardcodeadas)

### Por Implementar 📝
- Generación dinámica del donut chart
- Sparklines con datos reales
- Sistema de acciones pendientes completo
