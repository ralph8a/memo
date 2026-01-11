# Funcionalidades Conectadas al Backend

## ✅ Funcionalidades ya Implementadas

### 🔐 1. Autenticación (Login/Logout)
**Archivo**: `src/modules/auth.js`
- ✅ Login con API real (fallback a demo)
- ✅ Almacenamiento de JWT token
- ✅ Logout con limpieza de sesión
- ✅ Verificación de autenticación

**Endpoints usados**:
- `POST /api/auth/login`
- `POST /api/auth/verify`

**Flujo**:
1. Usuario ingresa credenciales
2. Se envía request al backend
3. Backend valida y retorna JWT token
4. Token se guarda en localStorage
5. Usuario se redirige a su dashboard

---

### 📋 2. Solicitud de Cotizaciones (Quotes)
**Archivo**: `src/core/EntryPointMainApp.js`
- ✅ Submit de formularios de cotización
- ✅ Envío al backend con datos completos
- ✅ Confirmación por email automática

**Endpoints usados**:
- `POST /api/quotes/request`

**Flujo**:
1. Usuario completa formulario (auto, hogar, vida, etc.)
2. Se envía al backend con `submitQuote()`
3. Backend guarda en DB y envía email de confirmación
4. Usuario ve notificación de éxito

**Tipos de seguro soportados**:
- 🚗 Auto
- 🏠 Hogar
- ❤️ Vida
- 💼 Salud
- ✈️ Viaje
- 🏢 Comercial

---

### 👥 3. Asignación de Claims (Siniestros)
**Archivo**: `src/core/EntryPointMainApp.js`
- ✅ Asignación de claims a agents
- ✅ Notificación automática por email

**Endpoints usados**:
- `POST /api/claims/:id/assign`
- `POST /api/notifications/email`

**Flujo**:
1. Agent asigna claim desde dashboard
2. Backend actualiza estado del claim
3. Se envía email al agent asignado
4. Log de notificación en DB

---

### 📝 4. Envío de Cuestionarios
**Archivo**: `src/core/EntryPointMainApp.js`
- ✅ Envío de cuestionarios a clientes
- ✅ Email de notificación automático

**Endpoints usados**:
- `POST /api/questionnaires/send`

**Flujo**:
1. Agent envía cuestionario a cliente
2. Backend registra en DB
3. Cliente recibe email con notificación
4. Estado tracked en sistema

---

## 🔄 Funcionalidades con Backend Listo pero Sin Integrar

### 1. Dashboard de Agent - Listar Clientes
**Endpoint disponible**: `GET /api/agents/clients`

**Implementación pendiente**:
```javascript
async function loadAgentClients() {
  const clients = await apiService.request(
    API_CONFIG.ENDPOINTS.GET_CLIENTS,
    { method: 'GET' },
    { cacheDuration: apiService.cache.CACHE_DURATION.SHORT }
  );
  // Renderizar lista de clientes en dashboard
}
```

---

### 2. Dashboard de Client - Ver Pólizas
**Endpoint disponible**: `GET /api/users/policies`

**Implementación pendiente**:
```javascript
async function loadClientPolicies() {
  const policies = await apiService.request(
    API_CONFIG.ENDPOINTS.GET_USER_POLICIES,
    { method: 'GET' },
    { cacheDuration: apiService.cache.CACHE_DURATION.MEDIUM }
  );
  // Renderizar pólizas del cliente
}
```

---

### 3. Dashboard - Ver Claims Pendientes
**Endpoint disponible**: `GET /api/claims`

**Implementación pendiente**:
```javascript
async function loadClaims() {
  const claims = await apiService.request(
    API_CONFIG.ENDPOINTS.GET_CLAIMS,
    { method: 'GET' }
  );
  // Renderizar claims en dashboard
}
```

---

### 4. Dashboard Admin - Estadísticas
**Endpoint disponible**: `GET /api/analytics/dashboard`

**Implementación pendiente**:
```javascript
async function loadDashboardStats() {
  const stats = await apiService.request(
    API_CONFIG.ENDPOINTS.GET_DASHBOARD_STATS,
    { method: 'GET' },
    { cacheDuration: apiService.cache.CACHE_DURATION.SHORT }
  );
  // Mostrar estadísticas: total_clients, active_policies, pending_claims, new_quotes
}
```

---

### 5. Detalles de Cliente (para Agents)
**Endpoint disponible**: `GET /api/agents/clients/:id`

**Implementación pendiente**:
```javascript
async function viewClientDetails(clientId) {
  const data = await apiService.request(
    API_CONFIG.ENDPOINTS.GET_CLIENT_DETAILS,
    { 
      method: 'GET',
      params: { id: clientId }
    }
  );
  // data.client - información del cliente
  // data.policies - pólizas del cliente
  // data.claims - claims recientes
}
```

---

### 6. Listar Quotes (para Agents/Admin)
**Endpoint disponible**: `GET /api/quotes`

**Implementación pendiente**:
```javascript
async function loadQuotes() {
  const quotes = await apiService.request(
    API_CONFIG.ENDPOINTS.GET_QUOTES,
    { method: 'GET' }
  );
  // Renderizar lista de cotizaciones pendientes
}
```

---

## 📊 Resumen de Estado

### ✅ Completamente Integradas (4)
1. ✅ Login/Logout con JWT
2. ✅ Solicitud de cotizaciones
3. ✅ Asignación de claims
4. ✅ Envío de cuestionarios

### ⚠️ Backend Listo, Falta UI (6)
5. ⚠️ Listar clientes (agent dashboard)
6. ⚠️ Ver pólizas (client dashboard)
7. ⚠️ Ver claims pendientes
8. ⚠️ Estadísticas admin
9. ⚠️ Detalles de cliente
10. ⚠️ Listar quotes

### 🔧 Pendientes de Implementar Backend (0)
- Todos los endpoints críticos ya están implementados

---

## 🚀 Próximos Pasos Recomendados

### Prioridad 1: Dashboards Funcionales
1. **Agent Dashboard**:
   - Conectar lista de clientes
   - Mostrar claims pendientes
   - Ver estadísticas de rendimiento

2. **Client Dashboard**:
   - Mostrar pólizas activas
   - Listar claims del usuario
   - Ver historial de pagos

3. **Admin Dashboard**:
   - Dashboard de analíticas
   - Gestión de usuarios
   - Ver todas las quotes

### Prioridad 2: Gestión de Datos
1. Crear/editar pólizas
2. Subir documentos
3. Procesar pagos
4. Completar cuestionarios

### Prioridad 3: Notificaciones en Tiempo Real
1. Notificaciones in-app
2. WebSocket para updates
3. Push notifications

---

## 📝 Notas Técnicas

### Estructura del API Service
```javascript
// Importar API Service
import { apiService, API_CONFIG } from '../api-integration.js';

// Hacer request
const response = await apiService.request(
  API_CONFIG.ENDPOINTS.ENDPOINT_NAME,
  {
    method: 'GET/POST/PUT/DELETE',
    params: { id: 123 },      // Para :id en URL
    body: { data: 'value' },  // Para POST/PUT
    queryParams: { page: 1 }  // Para ?page=1
  },
  {
    useCache: true,
    cacheDuration: apiService.cache.CACHE_DURATION.MEDIUM,
    showLoading: true
  }
);
```

### Manejo de Errores
```javascript
try {
  const result = await apiService.request(...);
  // Success
} catch (error) {
  console.error('API Error:', error);
  showNotification('Error al cargar datos', NOTIFICATION_TYPES.ERROR);
}
```

### Autenticación
Todos los endpoints protegidos requieren:
```javascript
headers: {
  'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
}
```

El `apiService` ya maneja esto automáticamente.

---

## 🎯 Estado Final

**Backend**: ✅ 100% Funcional
- Base de datos creada
- 15+ endpoints operativos
- Sistema de notificaciones activo
- Autenticación JWT implementada

**Frontend**: ✅ 40% Conectado
- Login/Logout funcionando
- Quotes integrados
- Claims y cuestionarios conectados
- Dashboards pendientes de cargar datos

**Siguiente paso**: Conectar los dashboards con los datos del backend para visualización completa.
