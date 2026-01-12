# 📊 ANÁLISIS COMPLETO DEL SISTEMA - KRAUSE INSURANCE

## 🎯 RESUMEN EJECUTIVO
Este documento contiene un análisis exhaustivo de:
1. Estructura del archivo Excel "PRODUCCION RISKMEDIA MEXICO.xlsx"
2. Componentes HTML de dashboards que requieren conexión a backend
3. Estado actual del backend PHP
4. Recomendaciones de tablas y campos para la base de datos

---

# PARTE A: ESTRUCTURA DEL ARCHIVO EXCEL

## 📁 Información General
- **Archivo**: PRODUCCION RISKMEDIA MEXICO .xlsx
- **Total de hojas**: 7
- **Hojas**: 2022, 2023, 2024, 2025, E&O 2023, PAGO COMS AMA-GALL 2023, E&O 2022+

---

## 📋 HOJA 1: "2022"

### Headers y Tipos de Datos:
| # | Campo | Tipo | Ejemplo |
|---|-------|------|---------|
| 1 | INSURED NAME | TEXTO | TVG TVGroup, Mediapro |
| 2 | PRODUCCION | TEXTO | Iron Chef, Muxes |
| 3 | NÚMERO DE PÓLIZA | TEXTO | 618401, 618001 |
| 4 | FECHA DE EMISIÓN | FECHA/HORA | 2021-10-14, 2021-10-18 |
| 5 | MES DE EMISION | TEXTO | OCTUBRE 2021 |
| 6 | PRODUCT/ COVERAGE OFFERED | TEXTO | Filmpackage |
| 7 | NEGOCIO ENTRANTE DE | TEXTO | Riskmedia |
| 8 | INSURER | TEXTO | Berkley |
| 9 | PRIMA NETA | NÚMERO DECIMAL | 680000.0, 418076.56 |
| 10 | COMISION TOTAL | NÚMERO DECIMAL | 15071.52, 56440.34 |
| 11 | SE COMPARTE COMISIÓN | TEXTO | NO, SI |
| 12 | COMISIÓN PARTNER | NÚMERO ENTERO | 0 |
| 13 | COMISIÓN PAGADA AL PARTNER | TEXTO | PAGADA |
| 14 | COMISIÓN RISKMEDIA | NÚMERO DECIMAL | 15071.52, 56440.34 |
| 15 | COMISIÓN PAGADA A RISKMEDIA | TEXTO | PAGADA |
| 16 | PAGADA POR EL CLIENTE | TEXTO | PAGADA |
| 17 | FECHA DE PAGO | FECHA/HORA | 2021-12-31 |
| 18 | No DE FACTURA | NÚMERO DECIMAL | 5323.0 |
| 19 | MES DE FACTURACION | TEXTO | MARZO |
| 20 | COMENTARIOS | NÚMERO DECIMAL | - |

---

## 📋 HOJA 2: "2023"

### Headers y Tipos de Datos:
| # | Campo | Tipo | Ejemplo |
|---|-------|------|---------|
| 1 | INSURED NAME | TEXTO | VOD ACQUISITION CO, LLC |
| 2 | CONTRATANTE | TEXTO | Dynamo Contenidos, Gato Estudio |
| 3 | PRODUCCION | TEXTO | Reshoot Riviera Maya |
| 4 | NÚMERO DE PÓLIZA | TEXTO | DVEP/00013628 |
| 5 | FECHA DE EMISIÓN | TEXTO | 2023-01-03 00:00:00 |
| 6 | MES DE EMISION | TEXTO | ENERO |
| 7 | PRODUCT/ COVERAGE OFFERED | TEXTO | Riesgos Profesionales |
| 8 | NEGOCIO ENTRANTE DE | TEXTO | Riskmedia, Sergio |
| 9 | PAQUETE (PROGRAMA VIX, DISNEY, AMAZON, PARAMOUNT) | TEXTO | Programa VIX |
| 10 | INSURER | TEXTO | Allianz |
| 11 | PRIMA NETA | NÚMERO DECIMAL | 24800.0, 22560.0 |
| 12 | COMISION TOTAL | NÚMERO DECIMAL | 2976.0, 2707.2 |
| 13 | SE COMPARTE COMISIÓN | TEXTO | NO, SI (SERGIO) |
| 14 | COMISION PARTNER | NÚMERO DECIMAL | 0.0, 2165.76 |
| 15 | COMISIÓN PAGADA AL PARTNER | TEXTO | PAGADA |
| 16 | COMISIÓN RISKMEDIA | NÚMERO DECIMAL | 2976.0, 541.44 |
| 17 | COMISIÓN PAGADA A RISKMEDIA | TEXTO | PAGADA |
| 18 | PAGADA POR EL CLIENTE | TEXTO | PAGADA |
| 19 | FECHA DE PAGO COMISION | FECHA/HORA | 2023-01-30 |
| 20 | No DE FACTURA | TEXTO | 1002246 |
| 21 | MES DE FACTURACION | TEXTO | ENERO |
| 22 | COMENTARIOS | NÚMERO DECIMAL | - |

---

## 📋 HOJA 3: "2024"

### Headers y Tipos de Datos (24 columnas):
| # | Campo | Tipo | Ejemplo |
|---|-------|------|---------|
| 1 | CONTRATANTE | TEXTO | TVG TVGROUP, Banijay México |
| 2 | PRODUCCION | TEXTO | RC GENERAL, LOL ARGENTINA T2 |
| 3 | STATUS | TEXTO | POLIZA PAGADA, TERMINÓ EL CIERRE |
| 4 | STATUS DE PRODUCCIÓN (PRE, RODAJE O POST) | NÚMERO DECIMAL | - |
| 5 | FECHAS DEL PROYECTO | TEXTO | VIGENCIA: 18 DE NOVIEMBRE 2023 AL 18... |
| 6 | NÚMERO DE PÓLIZA | TEXTO | 01-05-009797-002-01, DVED/00001929 |
| 7 | FECHA DE EMISIÓN | FECHA/HORA | 2023-11-29, 2024-02-07 |
| 8 | MES DE EMISION | TEXTO | NOVIEMBRE, FEBRERO |
| 9 | PRODUCT/ COVERAGE OFFERED | TEXTO | Filmpackage |
| 10 | NEGOCIO ENTRANTE DE | TEXTO | Riskmedia, Amazon / Gallaguer |
| 11 | PAQUETE (PROGRAMA VIX, DISNEY, AMAZON, PARAMOUNT) | TEXTO | Programa VIX |
| 12 | INSURER | TEXTO | Berkley, Allianz |
| 13 | PRIMA NETA | NÚMERO DECIMAL | 16464.55, 1416308.38 |
| 14 | COMISION TOTAL | NÚMERO DECIMAL | 2469.68, 212446.26 |
| 15 | SE COMPARTE COMISIÓN | TEXTO | NO, SI (GALLAGUER) |
| 16 | COMISION PARTNER | NÚMERO DECIMAL | 0.0, 70808.34 |
| 17 | COMISIÓN PAGADA AL PARTNER | TEXTO | NO PAGADA, PAGADA |
| 18 | COMISIÓN RISKMEDIA | NÚMERO DECIMAL | 2469.68, 141637.92 |
| 19 | COMISIÓN PAGADA A RISKMEDIA | TEXTO | PAGADA |
| 20 | PAGADA POR EL CLIENTE | TEXTO | PAGADA |
| 21 | FECHA DE PAGO COMISION | TEXTO | Q2 |
| 22 | No DE FACTURA | NÚMERO DECIMAL | - |
| 23 | MES DE FACTURACION | TEXTO | ENERO, FEBRERO |
| 24 | COMENTARIOS | NÚMERO DECIMAL | - |

---

## 📋 HOJA 4: "2025" (MÁS COMPLETA)

### Headers y Tipos de Datos (30 columnas):
| # | Campo | Tipo | Ejemplo |
|---|-------|------|---------|
| 1 | CONTRATANTE | TEXTO | The Media Pro Studios |
| 2 | PRODUCCION | TEXTO | El Conquistador |
| 3 | STATUS | TEXTO | No seguir (Enviar recordatorio...) |
| 4 | PENDIENTE O CERRADO | TEXTO | x |
| 5 | FECHAS DEL PROYECTO | TEXTO | Preproducción: 23 de diciembre 2024... |
| 6 | STATUS DE LA PRODUCCIÓN (CRÉDITOS) | TEXTO | ENVIADOS, POST-PRODUCCIÓN |
| 7 | NÚMERO DE PÓLIZA | TEXTO | DESP/00000001 |
| 8 | VIGENCIA DE LA PÓLIZA | TEXTO | Vigencia: 16 de enero 2025 al 16... |
| 9 | FECHA DE EMISION | FECHA/HORA | 2025-01-23 |
| 10 | MES DE EMISION | TEXTO | ENERO, DICIEMBRE |
| 11 | RAMO | TEXTO | DIVERSOS MX |
| 12 | SUBRAMO | TEXTO | Filmpackage |
| 13 | PAQUETE | TEXTO | Programa VIX, PARTNER LOCAL |
| 14 | VENDEDOR (Negocio entrante) | TEXTO | RISKMEDIA MEXICO, SEGUROS S.A. DE C.V. |
| 15 | AGENTE | TEXTO | Gallaguer, Sergio |
| 16 | INSURER | TEXTO | Allianz, Berkley |
| 17 | PRIMA NETA | NÚMERO DECIMAL | 1159475.34, 231082.59 |
| 18 | COMISION TOTAL | NÚMERO DECIMAL | 231895.07, 34662.39 |
| 19 | Unnamed: 18 | TEXTO | SI (GALLAGHER), SI (SERGIO) |
| 20 | COMISION PARTNER | NÚMERO DECIMAL | 115947.53, 20797.43 |
| 21 | COMISIÓN PAGADA AL PARTNER | TEXTO | PAGADA |
| 22 | COMISIÓN RISKMEDIA | NÚMERO DECIMAL | 115947.53, 13864.96 |
| 23 | IVA | NÚMERO DECIMAL | 37103.21, 5545.98 |
| 24 | TOTAL (INCLUYE IVA) | NÚMERO DECIMAL | 268998.28, 19410.94 |
| 25 | COMISIÓN PAGADA A RISKMEDIA | TEXTO | PAGADA |
| 26 | PAGADA POR EL ASEGURADO | TEXTO | PAGADA, PAGADA 24/12/2024 |
| 27 | PREVISION DE INGRESO EN CUENTA RISKMEDIA | TEXTO | PAGADA |
| 28 | CUENTA FORECAST | TEXTO | VIX // Gallagher, Sergio |
| 29 | FACTURACION | TEXTO | FEBRERO, ENERO |
| 30 | REFERENCIA SANTANDER | NÚMERO DECIMAL | - |

---

## 📋 HOJA 5: "E&O 2023"

### Headers y Tipos de Datos:
| # | Campo | Tipo | Ejemplo |
|---|-------|------|---------|
| 1 | CONTRATANTE | TEXTO | Horizonte Films, Alazraki Films |
| 2 | PRODUCCION | TEXTO | Club Perfecto, Proyecto Bodas |
| 3 | NÚMERO DE PÓLIZA | NÚMERO DECIMAL | 1031201.0, 1014501.0 |
| 4 | FECHA DE EMISIÓN | TEXTO | 2023-02-08 00:00:00 |
| 5 | MES DE EMISION | TEXTO | FEBRERO, ENERO |
| 6 | PRODUCT/ COVERAGE OFFERED | TEXTO | E&O (Errors & Omissions) |
| 7 | NEGOCIO ENTRANTE DE | TEXTO | VIX / Gallaguer, Sergio |
| 8 | INSURER | TEXTO | Berkley |
| 9 | PRIMA NETA | TEXTO | 253323.42 |
| 10 | COMISION TOTAL | TEXTO | 45598.22 |
| 11 | SE COMPARTE COMISIÓN | TEXTO | SI (GALLAGUER), SI (SERGIO) |
| 12 | COMISION PARTNER | NÚMERO DECIMAL | 22799.11 |
| 13 | COMISIÓN PAGADA AL PARTNER | NÚMERO DECIMAL | - |
| 14 | COMISIÓN RISKMEDIA | NÚMERO DECIMAL | 22799.11 |
| 15 | COMISIÓN PAGADA A RISKMEDIA | TEXTO | PAGADA, PRODUCCION PENDIENTE |
| 16 | PAGADA POR EL CLIENTE | TEXTO | PAGADA |
| 17 | FECHA DE PAGO COMISION | FECHA/HORA | 2023-03-13 |
| 18 | No DE FACTURA | TEXTO | 6899229A |
| 19 | MES DE FACTURACION | TEXTO | MARZO, FEBRERO |
| 20 | COMENTARIOS | NÚMERO DECIMAL | - |

---

## 📋 HOJA 6: "PAGO COMS AMA-GALL 2023"

### Headers y Tipos de Datos:
| # | Campo | Tipo | Ejemplo |
|---|-------|------|---------|
| 1 | CONTRATANTE | TEXTO | TRZ SERVICIOS, S.A. DE C.V. |
| 2 | PRODUCCION | TEXTO | JUMPSTART MY HEART, Cometierra |
| 3 | NÚMERO DE PÓLIZA | TEXTO | DVEP/00013867 |
| 4 | FECHA DE EMISIÓN | TEXTO | 2023-03-22 00:00:00 |
| 5 | MES DE EMISION | TEXTO | MARZO, JUNIO |
| 6 | PRODUCT/ COVERAGE OFFERED | TEXTO | Filmpackage |
| 7 | NEGOCIO ENTRANTE DE | TEXTO | Amazon / Gallaguer |
| 8 | INSURER | TEXTO | Allianz |
| 9 | PRIMA NETA | NÚMERO DECIMAL | 984228.04, 428306.87 |
| 10 | COMISION TOTAL | NÚMERO DECIMAL | 147634.21, 64246.03 |
| 11 | SE COMPARTE COMISIÓN | TEXTO | SI (GALLAGUER) |
| 12 | COMISION PARTNER | NÚMERO DECIMAL | 73817.10, 32123.02 |
| 13 | COMISIÓN PAGADA AL PARTNER | TEXTO | NO PAGADA |
| 14 | COMISIÓN RISKMEDIA | NÚMERO DECIMAL | 73817.10, 32123.02 |
| 15 | COMISIÓN PAGADA A RISKMEDIA | TEXTO | PAGADA |
| 16 | PAGADA POR EL CLIENTE | TEXTO | PAGADA |
| 17 | FECHA DE PAGO COMISION | FECHA/HORA | 2023-05-16 |
| 18 | No DE FACTURA | TEXTO | 1047200, 1038106 |
| 19 | MES DE FACTURACION | TEXTO | MAYO, JULIO, ABRIL |
| 20 | COMENTARIOS | NÚMERO DECIMAL | - |

---

## 📋 HOJA 7: "E&O 2022+"

### Headers y Tipos de Datos:
| # | Campo | Tipo | Ejemplo |
|---|-------|------|---------|
| 1 | CONTRATANTE | TEXTO | Endemol Shine, Mediapro |
| 2 | PRODUCCION | TEXTO | El Brazo Corto de la Ley, Muxes |
| 3 | NÚMERO DE PÓLIZA | NÚMERO DECIMAL | 7000138.0, 7000143.0 |
| 4 | FECHA DE EMISIÓN | FECHA/HORA | 2021-12-06, 2021-12-30 |
| 5 | MES DE EMISION | TEXTO | DICIEMBRE 2021 |
| 6 | PRODUCT/ COVERAGE OFFERED | TEXTO | E&O |
| 7 | NEGOCIO ENTRANTE DE | TEXTO | Riskmedia, Sergio |
| 8 | INSURER | NÚMERO DECIMAL | 298000.0, 228571.4 |
| 9 | PRIMA NETA | NÚMERO DECIMAL | 40961.57, 31830.45 |
| 10 | COMISION TOTAL | TEXTO | NO |
| 11 | SE COMPARTE COMISIÓN | NÚMERO DECIMAL | 0.0 |
| 12 | COMISION PARTNER | TEXTO | PAGADA |
| 13 | COMISIÓN PAGADA AL PARTNER | NÚMERO DECIMAL | 40961.57, 31830.45 |
| 14 | COMISIÓN RISKMEDIA | TEXTO | PAGADA |
| 15 | COMISIÓN PAGADA A RISKMEDIA | TEXTO | PAGADA |
| 16 | PAGADA POR EL CLIENTE | FECHA/HORA | 2022-02-15 |
| 17 | FECHA DE PAGO COMISION | NÚMERO DECIMAL | 87685.0, 6300.0 |
| 18 | No DE FACTURA | TEXTO | MARZO |
| 19 | MES DE FACTURACION | TEXTO | Se agrega comisión por $76,728.48... |

---

# PARTE B: COMPONENTES HTML SIN BACKEND

## 🎨 CLIENT DASHBOARD

### 1. **Historial de Pagos**
- **Selector HTML**: `[data-payment-history]`
- **Ubicación**: `client-dashboard.html` línea 413
- **Endpoint necesario**: `GET /api/clients/:clientId/payments`
- **Datos requeridos**:
```json
{
  "payments": [
    {
      "id": 1,
      "date": "2024-03-08",
      "amount": 450.00,
      "status": "completed",
      "method": "card",
      "policy_number": "POL-001",
      "policy_type": "Auto",
      "receipt_url": "/receipts/123.pdf"
    }
  ]
}
```
- **Función JS**: `renderPaymentHistory(data)`
- **Estado actual**: `<p class="loading-state">Cargando historial...</p>`

### 2. **Lista de Pólizas Activas**
- **Selector HTML**: `.policies-list`
- **Ubicación**: `client-dashboard.html` línea 424
- **Endpoint necesario**: `GET /api/clients/:clientId/policies`
- **Datos requeridos**:
```json
{
  "policies": [
    {
      "id": 1,
      "policy_number": "POL-001",
      "type": "Auto",
      "status": "active",
      "coverage_amount": 50000,
      "premium": 450,
      "start_date": "2024-01-01",
      "end_date": "2025-01-01",
      "renewal_date": "2024-12-15"
    }
  ]
}
```
- **Función JS**: `renderClientPolicies(data)`
- **Estado actual**: `<p class="loading-state">Cargando pólizas...</p>`

### 3. **Reclamaciones Activas del Cliente**
- **Selector HTML**: `[data-client-claims-list]`
- **Ubicación**: `client-dashboard.html` línea 434
- **Endpoint necesario**: `GET /api/clients/:clientId/claims`
- **Datos requeridos**:
```json
{
  "claims": [
    {
      "id": 1,
      "claim_number": "CLM-001",
      "policy_id": 1,
      "type": "Auto",
      "status": "under_review",
      "amount": 5000,
      "incident_date": "2024-02-15",
      "submitted_at": "2024-02-16",
      "description": "Colisión trasera"
    }
  ]
}
```
- **Función JS**: `renderClientClaims(data)`
- **Estado actual**: `<p class="loading-state">Cargando...</p>`

### 4. **Documentos Recientes**
- **Selector HTML**: `[data-recent-docs]`
- **Ubicación**: `client-dashboard.html` línea 474
- **Endpoint necesario**: `GET /api/clients/:clientId/documents`
- **Datos requeridos**:
```json
{
  "documents": [
    {
      "id": 1,
      "title": "Comprobante de pago",
      "date": "2024-03-08",
      "type": "PDF",
      "href": "/documents/123.pdf",
      "policy_id": 1
    }
  ]
}
```
- **Función JS**: `window.renderRecentDocs(data)` (YA EXISTE en línea 613)
- **Estado actual**: `<p class="loading-state">Cargando documentos...</p>`

### 5. **Nombre del Usuario en Hero**
- **Selector HTML**: `[data-hero-user]`
- **Ubicación**: `client-dashboard.html` línea 95
- **Endpoint necesario**: `GET /api/auth/me` (YA EXISTE)
- **Datos requeridos**:
```json
{
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "user_type": "client"
  }
}
```
- **Función JS**: Script inline (YA EXISTE en línea 649)

---

## 🎯 AGENT DASHBOARD

### 6. **Lista de Clientes del Agente**
- **Selector HTML**: `[data-clients-list]`
- **Ubicación**: `agent-dashboard.html` línea 299
- **Endpoint necesario**: `GET /api/agents/clients` (YA EXISTE en backend)
- **Datos requeridos**:
```json
{
  "clients": [
    {
      "id": 1,
      "first_name": "María",
      "last_name": "González",
      "email": "maria@example.com",
      "phone": "+52-555-1234",
      "status": "active",
      "policies_count": 3,
      "total_premium": 1250.00,
      "created_at": "2024-01-15"
    }
  ]
}
```
- **Función JS**: `renderAgentClients(data)`
- **Estado actual**: `<p class="loading-state">Cargando clientes...</p>`

### 7. **Reclamaciones/Claims del Agente**
- **Selector HTML**: `[data-agent-claims-list]`
- **Ubicación**: `agent-dashboard.html` línea 341
- **Endpoint necesario**: `GET /api/claims?agent_id=:agentId`
- **Datos requeridos**:
```json
{
  "claims": [
    {
      "id": 1,
      "claim_number": "CLM-001",
      "client_name": "María González",
      "client_id": 5,
      "policy_type": "Auto",
      "status": "new",
      "amount": 5000,
      "incident_date": "2024-02-15",
      "submitted_at": "2024-02-16"
    }
  ]
}
```
- **Función JS**: `renderAgentClaims(data)`
- **Estado actual**: `<p class="loading-state">Cargando claims...</p>`

### 8. **Estadísticas del Dashboard (Agent)**
- **Selectores HTML**: 
  - `[data-stat-clients]` línea 121
  - `[data-stat-policies]` línea 133
  - `[data-stat-claims]` línea 145
  - `[data-stat-quotes]` línea 157
- **Endpoint necesario**: `GET /api/agents/:agentId/stats`
- **Datos requeridos**:
```json
{
  "stats": {
    "total_clients": 142,
    "total_policies": 256,
    "pending_claims": 3,
    "new_quotes": 5
  }
}
```
- **Función JS**: `updateAgentStats(data)`

### 9. **Roadmap de Suscripción**
- **Selector HTML**: `[data-widget="roadmap"]` con `[data-endpoint="/agents/clients/:id/roadmap"]`
- **Ubicación**: `agent-dashboard.html` línea 169
- **Endpoint necesario**: `GET /agents/clients/:clientId/roadmap`
- **Datos requeridos**:
```json
{
  "client_id": 5,
  "client_name": "María González",
  "steps": [
    {
      "step": "Captura de Datos",
      "status": "done",
      "date": "2025-11-28",
      "meta": "Recibido"
    },
    {
      "step": "Cuestionario de Riesgo",
      "status": "done",
      "date": null,
      "meta": "Completo"
    },
    {
      "step": "Suscripción Técnica",
      "status": "in-progress",
      "date": null,
      "meta": "En revisión"
    },
    {
      "step": "Emisión & Bienvenida",
      "status": "pending",
      "date": null,
      "meta": "Pendiente"
    }
  ]
}
```
- **Función JS**: `renderRoadmap(data)`

### 10. **Cuestionarios**
- **Selector HTML**: `[data-widget="questionnaires"]` con `[data-endpoint="/questionnaires"]`
- **Ubicación**: `agent-dashboard.html` línea 399
- **Endpoint necesario**: `GET /api/questionnaires?agent_id=:agentId`
- **Datos requeridos**:
```json
{
  "questionnaires": [
    {
      "id": 1,
      "client_id": 5,
      "client_name": "María G.",
      "title": "Cuestionario Auto",
      "status": "sent",
      "sent_at": "2025-11-30",
      "meta": "Esperando respuestas"
    }
  ]
}
```
- **Función JS**: `renderQuestionnaires(data)`

### 11. **Alertas de Vencimiento**
- **Selector HTML**: `[data-widget="alerts"]` con `[data-endpoint="/policies"]`
- **Ubicación**: `agent-dashboard.html` línea 429
- **Endpoint necesario**: `GET /api/policies?expiring=true&agent_id=:agentId`
- **Datos requeridos**:
```json
{
  "alerts": [
    {
      "policy_id": 1,
      "policy_type": "Auto",
      "client_name": "María G.",
      "expiration_date": "2026-01-12",
      "days_until_expiration": 7,
      "note": "Enviar recordatorio + oferta renovación"
    }
  ]
}
```
- **Función JS**: `renderPolicyAlerts(data)`

### 12. **Widget de Claims con Notificación**
- **Selector HTML**: `[data-widget="claims"]` con atributos:
  - `[data-endpoint="/claims"]`
  - `[data-notify="email"]`
  - `[data-notify-domain="@ksinsurancee.com"]`
- **Ubicación**: `agent-dashboard.html` línea 346
- **Endpoint necesario**: 
  - `POST /api/claims/:id/assign` (YA EXISTE en backend)
  - Notificación por email (YA EXISTE: `EmailService::sendClaimAssignmentNotification`)
- **Función JS**: `assignClaimToAgent(clientCode)`

---

## 👨‍💼 ADMIN DASHBOARD

### 13. **Estadísticas del Admin**
- **Ubicación**: `admin-dashboard.html` líneas 9-30
- **Endpoint necesario**: `GET /api/analytics/dashboard` (YA EXISTE pero incompleto)
- **Datos requeridos**:
```json
{
  "total_users": 150,
  "active_policies": 1250,
  "monthly_revenue": 2500000,
  "pending_quotes": 12,
  "pending_renewals": 5,
  "open_claims": 3
}
```
- **Función JS**: `renderAdminStats(data)`

### 14. **Actividad Reciente (Live Feed)**
- **Ubicación**: `admin-dashboard.html` líneas 68-90
- **Endpoint necesario**: `GET /api/activity/recent`
- **Datos requeridos**:
```json
{
  "activities": [
    {
      "id": 1,
      "type": "quote_approved",
      "actor": "Agente Rivera",
      "description": "aprobó una cotización",
      "timestamp": "2025-01-11T10:45:00",
      "metadata": "Auto",
      "status": "OK"
    }
  ]
}
```
- **Función JS**: `renderActivityFeed(data)`

---

# PARTE C: BACKEND ACTUAL - ESTADO

## ✅ ENDPOINTS YA IMPLEMENTADOS

### Autenticación (`/auth/*`)
1. ✅ `POST /auth/login` - Login de usuarios
2. ✅ `POST /auth/verify` - Verificar token JWT

### Cotizaciones (`/quotes/*`)
3. ✅ `POST /quotes/request` - Solicitar cotización
4. ✅ `GET /quotes` - Listar cotizaciones (requiere auth agent/admin)

### Reclamaciones (`/claims/*`)
5. ✅ `POST /claims/:id/assign` - Asignar claim a agente
6. ✅ `GET /claims` - Listar claims (filtrado por tipo de usuario)

### Cuestionarios (`/questionnaires/*`)
7. ✅ `POST /questionnaires/send` - Enviar cuestionario a cliente

### Notificaciones (`/notifications/*`)
8. ✅ `POST /notifications/email` - Enviar email

### Agentes (`/agents/*`)
9. ✅ `GET /agents/clients` - Listar clientes del agente
10. ✅ `GET /agents/clients/:id` - Detalles de cliente (incluye policies y claims)

### Analytics (`/analytics/*`)
11. ✅ `GET /analytics/dashboard` - Estadísticas básicas para admin

---

## ❌ ENDPOINTS FALTANTES (CRÍTICOS)

### Para CLIENT DASHBOARD:
1. ❌ `GET /api/clients/:clientId/payments` - Historial de pagos del cliente
2. ❌ `GET /api/clients/:clientId/policies` - Pólizas del cliente
3. ❌ `GET /api/clients/:clientId/claims` - Reclamaciones del cliente
4. ❌ `GET /api/clients/:clientId/documents` - Documentos del cliente
5. ❌ `POST /api/payments` - Registrar nuevo pago
6. ❌ `GET /api/payments/:id/receipt` - Descargar comprobante

### Para AGENT DASHBOARD:
7. ❌ `GET /api/agents/:agentId/stats` - Estadísticas del agente
8. ❌ `GET /agents/clients/:clientId/roadmap` - Roadmap de suscripción
9. ❌ `GET /api/questionnaires?agent_id=:id` - Cuestionarios del agente
10. ❌ `PUT /api/questionnaires/:id/resend` - Reenviar cuestionario
11. ❌ `GET /api/policies?expiring=true&agent_id=:id` - Pólizas por vencer
12. ❌ `GET /api/agents/:agentId/commissions` - Comisiones del agente

### Para ADMIN DASHBOARD:
13. ❌ `GET /api/activity/recent` - Actividad reciente del sistema
14. ❌ `GET /api/users/stats` - Estadísticas completas de usuarios
15. ❌ `POST /api/agents/create` - Crear nuevo agente
16. ❌ `POST /api/clients/import` - Importar clientes masivamente
17. ❌ `GET /api/reports/monthly` - Reporte mensual

### Para PRODUCCIÓN (basado en Excel):
18. ❌ `GET /api/productions` - Listar producciones
19. ❌ `POST /api/productions` - Crear nueva producción
20. ❌ `GET /api/productions/:id` - Detalles de producción
21. ❌ `PUT /api/productions/:id` - Actualizar producción
22. ❌ `GET /api/productions/:id/commissions` - Comisiones de producción
23. ❌ `PUT /api/productions/:id/status` - Actualizar estado
24. ❌ `GET /api/partners` - Listar partners (Gallaguer, Sergio, etc.)
25. ❌ `GET /api/insurers` - Listar aseguradoras (Berkley, Allianz)

### Para COMISIONES:
26. ❌ `GET /api/commissions` - Listar comisiones
27. ❌ `PUT /api/commissions/:id/pay` - Marcar comisión como pagada
28. ❌ `GET /api/commissions/forecast` - Previsión de ingresos

---

## 📊 ESTRUCTURA DE RESPUESTAS JSON (Backend Actual)

### Login Response:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "user_type": "client",
    "first_name": "Juan",
    "last_name": "Pérez"
  }
}
```

### Error Response:
```json
{
  "error": "Error message"
}
```

### Success Response:
```json
{
  "success": true,
  "quote_id": 123
}
```

---

# PARTE D: RECOMENDACIÓN DE TABLAS PARA LA BASE DE DATOS

## 🗄️ TABLAS EXISTENTES (en `database-schema.sql`)

1. ✅ `users` - Usuarios (admin, agent, client)
2. ✅ `policies` - Pólizas
3. ✅ `claims` - Reclamaciones
4. ✅ `questionnaires` - Cuestionarios
5. ✅ `documents` - Documentos
6. ✅ `payments` - Pagos
7. ✅ `notifications` - Notificaciones
8. ✅ `quotes` - Cotizaciones

---

## 🆕 NUEVAS TABLAS COMPLEMENTARIAS (basadas en Excel)

### 1. Tabla: `productions`
**Propósito**: Gestionar producciones audiovisuales (corazón del negocio)

```sql
CREATE TABLE productions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Información básica
    contratante VARCHAR(255) NOT NULL,
    production_name VARCHAR(255) NOT NULL,
    insured_name VARCHAR(255),
    
    -- Números y referencias
    policy_number VARCHAR(100) UNIQUE,
    invoice_number VARCHAR(100),
    santander_reference VARCHAR(100),
    
    -- Fechas
    issue_date DATE,
    issue_month VARCHAR(50),
    project_dates TEXT,
    policy_validity TEXT,
    payment_date DATE,
    billing_month VARCHAR(50),
    
    -- Clasificación
    ramo VARCHAR(100), -- DIVERSOS MX
    subramo VARCHAR(100), -- Filmpackage, E&O
    product_coverage VARCHAR(100),
    package_program VARCHAR(100), -- VIX, DISNEY, AMAZON, PARAMOUNT
    
    -- Status
    status ENUM('pending', 'active', 'closed', 'cancelled') DEFAULT 'pending',
    production_status VARCHAR(100), -- PRE, RODAJE, POST
    credits_status VARCHAR(100), -- ENVIADOS, POST-PRODUCCIÓN
    payment_status ENUM('unpaid', 'partial', 'paid') DEFAULT 'unpaid',
    
    -- Montos
    net_premium DECIMAL(12, 2),
    total_commission DECIMAL(12, 2),
    partner_commission DECIMAL(12, 2),
    riskmedia_commission DECIMAL(12, 2),
    iva DECIMAL(12, 2),
    total_with_iva DECIMAL(12, 2),
    
    -- Relaciones
    vendor_id INT, -- FK a tabla vendors/sellers
    agent_id INT, -- FK a tabla partners (Gallaguer, Sergio)
    insurer_id INT, -- FK a tabla insurers
    
    -- Estado de pagos
    commission_shared ENUM('yes', 'no') DEFAULT 'no',
    partner_paid ENUM('yes', 'no', 'pending') DEFAULT 'pending',
    riskmedia_paid ENUM('yes', 'no', 'pending') DEFAULT 'pending',
    client_paid ENUM('yes', 'no', 'pending') DEFAULT 'pending',
    
    -- Forecasting
    income_forecast VARCHAR(100),
    forecast_account VARCHAR(100), -- VIX // Gallagher, Sergio
    
    -- Observaciones
    comments TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_policy_number (policy_number),
    INDEX idx_contratante (contratante),
    INDEX idx_status (status),
    INDEX idx_issue_date (issue_date),
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_agent_id (agent_id),
    INDEX idx_insurer_id (insurer_id),
    
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
    FOREIGN KEY (agent_id) REFERENCES partners(id) ON DELETE SET NULL,
    FOREIGN KEY (insurer_id) REFERENCES insurers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 2. Tabla: `partners` (Agentes/Brokers externos)
**Propósito**: Gestionar partners como Gallaguer, Sergio, Amazon

```sql
CREATE TABLE partners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    partner_type ENUM('broker', 'agent', 'distributor') DEFAULT 'broker',
    
    -- Contacto
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_person VARCHAR(255),
    
    -- Comisiones
    default_commission_rate DECIMAL(5, 2), -- Porcentaje (ej: 50.00 = 50%)
    
    -- Status
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_partner_type (partner_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales
INSERT INTO partners (name, partner_type) VALUES 
('Gallagher', 'broker'),
('Sergio', 'agent'),
('Amazon', 'distributor'),
('VIX', 'distributor');
```

---

### 3. Tabla: `insurers` (Aseguradoras)
**Propósito**: Catálogo de aseguradoras

```sql
CREATE TABLE insurers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    
    -- Información corporativa
    legal_name VARCHAR(255),
    tax_id VARCHAR(100),
    
    -- Contacto
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website VARCHAR(255),
    
    -- Productos que ofrecen
    products TEXT, -- JSON: ["Filmpackage", "E&O", "RC General"]
    
    -- Status
    status ENUM('active', 'inactive') DEFAULT 'active',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales
INSERT INTO insurers (name, legal_name) VALUES 
('Berkley', 'W. R. Berkley Corporation'),
('Allianz', 'Allianz SE');
```

---

### 4. Tabla: `vendors` (Vendedores/Sellers)
**Propósito**: Gestionar vendedores (ej: RISKMEDIA MEXICO, SEGUROS S.A. DE C.V.)

```sql
CREATE TABLE vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    
    -- Contacto
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Status
    status ENUM('active', 'inactive') DEFAULT 'active',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales
INSERT INTO vendors (name, legal_name) VALUES 
('Riskmedia', 'RISKMEDIA MEXICO, SEGUROS S.A. DE C.V.');
```

---

### 5. Tabla: `commission_payments`
**Propósito**: Registro detallado de pagos de comisiones

```sql
CREATE TABLE commission_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    production_id INT NOT NULL,
    recipient_type ENUM('partner', 'riskmedia') NOT NULL,
    recipient_id INT, -- FK a partners o vendors
    
    -- Montos
    commission_amount DECIMAL(12, 2) NOT NULL,
    iva_amount DECIMAL(12, 2),
    total_amount DECIMAL(12, 2),
    
    -- Pago
    payment_status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    payment_date DATE,
    payment_method VARCHAR(100),
    
    -- Referencias
    invoice_number VARCHAR(100),
    billing_month VARCHAR(50),
    transaction_reference VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (production_id) REFERENCES productions(id) ON DELETE CASCADE,
    INDEX idx_production_id (production_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 6. Tabla: `roadmap_steps`
**Propósito**: Seguimiento del proceso de suscripción (Roadmap)

```sql
CREATE TABLE roadmap_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    client_id INT NOT NULL,
    production_id INT,
    
    -- Paso
    step_name VARCHAR(255) NOT NULL, -- "Captura de Datos", "Cuestionario", etc.
    step_order INT NOT NULL,
    
    -- Estado
    status ENUM('pending', 'in-progress', 'done', 'skipped') DEFAULT 'pending',
    
    -- Fechas
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    
    -- Metadata
    notes TEXT,
    assigned_to INT, -- FK a users (agente responsable)
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (production_id) REFERENCES productions(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_client_id (client_id),
    INDEX idx_production_id (production_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 7. Tabla: `activity_log`
**Propósito**: Registro de actividades para el feed del admin

```sql
CREATE TABLE activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Actor
    user_id INT,
    user_name VARCHAR(255),
    user_type ENUM('admin', 'agent', 'client', 'system'),
    
    -- Acción
    action_type VARCHAR(100) NOT NULL, -- 'quote_approved', 'claim_assigned', etc.
    description TEXT NOT NULL,
    
    -- Metadata
    entity_type VARCHAR(50), -- 'quote', 'claim', 'policy', etc.
    entity_id INT,
    metadata JSON,
    
    -- Clasificación
    severity ENUM('info', 'warning', 'critical') DEFAULT 'info',
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at),
    INDEX idx_entity_type (entity_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 📝 CAMPOS A AGREGAR EN TABLAS EXISTENTES

### Tabla `users`:
```sql
ALTER TABLE users ADD COLUMN commission_rate DECIMAL(5, 2) DEFAULT 0.00 AFTER region;
ALTER TABLE users ADD COLUMN partner_id INT AFTER commission_rate;
ALTER TABLE users ADD FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL;
```

### Tabla `policies`:
```sql
ALTER TABLE policies ADD COLUMN production_id INT AFTER policy_type;
ALTER TABLE policies ADD COLUMN insurer_id INT AFTER agent_id;
ALTER TABLE policies ADD COLUMN package_program VARCHAR(100) AFTER policy_type;
ALTER TABLE policies ADD COLUMN commission_shared ENUM('yes', 'no') DEFAULT 'no' AFTER premium_amount;
ALTER TABLE policies ADD COLUMN partner_id INT AFTER agent_id;

ALTER TABLE policies ADD FOREIGN KEY (production_id) REFERENCES productions(id) ON DELETE SET NULL;
ALTER TABLE policies ADD FOREIGN KEY (insurer_id) REFERENCES insurers(id) ON DELETE SET NULL;
ALTER TABLE policies ADD FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL;
```

### Tabla `payments`:
```sql
ALTER TABLE payments ADD COLUMN invoice_number VARCHAR(100) AFTER transaction_id;
ALTER TABLE payments ADD COLUMN billing_month VARCHAR(50) AFTER payment_date;
ALTER TABLE payments ADD COLUMN iva_amount DECIMAL(10, 2) AFTER amount;
ALTER TABLE payments ADD COLUMN total_with_iva DECIMAL(10, 2) AFTER iva_amount;
```

### Tabla `claims`:
```sql
ALTER TABLE claims ADD COLUMN priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium' AFTER status;
ALTER TABLE claims ADD COLUMN attachments_count INT DEFAULT 0 AFTER description;
```

---

## 🔗 RELACIONES RECOMENDADAS

### Diagrama de Relaciones Principales:

```
users (clients)
    ├─── policies (1:N)
    │       ├─── payments (1:N)
    │       ├─── claims (1:N)
    │       └─── documents (1:N)
    ├─── roadmap_steps (1:N)
    └─── questionnaires (1:N)

productions
    ├─── policies (1:1 or 1:N)
    ├─── commission_payments (1:N)
    ├─── roadmap_steps (1:N)
    ├─── vendor (N:1)
    ├─── partner (N:1)
    └─── insurer (N:1)

partners
    ├─── productions (1:N)
    ├─── policies (1:N)
    └─── users (1:N) -- agentes asignados

insurers
    ├─── productions (1:N)
    └─── policies (1:N)

activity_log
    └─── user (N:1)
```

---

## 🎯 PRIORIDADES DE IMPLEMENTACIÓN

### 🔴 PRIORIDAD ALTA (Semana 1):
1. Crear tabla `productions` (corazón del negocio)
2. Crear tablas `partners`, `insurers`, `vendors` (catálogos)
3. Implementar endpoints:
   - `GET /api/clients/:id/payments`
   - `GET /api/clients/:id/policies`
   - `GET /api/clients/:id/claims`
   - `GET /api/agents/:id/stats`

### 🟡 PRIORIDAD MEDIA (Semana 2):
4. Crear tabla `commission_payments`
5. Crear tabla `roadmap_steps`
6. Implementar endpoints:
   - `GET /api/productions`
   - `POST /api/productions`
   - `GET /agents/clients/:id/roadmap`
   - `GET /api/commissions`

### 🟢 PRIORIDAD BAJA (Semana 3):
7. Crear tabla `activity_log`
8. Implementar endpoints:
   - `GET /api/activity/recent`
   - `GET /api/reports/monthly`
   - `POST /api/clients/import`

---

## 📌 NOTAS IMPORTANTES

### Campos del Excel que NO están en BD actual:
- **CONTRATANTE** (diferente de INSURED NAME)
- **PRODUCCION** (nombre del proyecto)
- **PAQUETE/PROGRAMA** (VIX, Disney, Amazon, Paramount)
- **RAMO y SUBRAMO** (clasificación mexicana)
- **VENDEDOR** (seller/vendor)
- **AGENTE** (partner/broker externo)
- **IVA** (impuesto)
- **COMISIÓN COMPARTIDA** (split commission)
- **STATUS DE PRODUCCIÓN** (PRE, RODAJE, POST)
- **FECHAS DEL PROYECTO** (timeline completo)
- **VIGENCIA DE LA PÓLIZA** (como texto descriptivo)
- **PREVISION DE INGRESO** (forecast)
- **CUENTA FORECAST** (forecasting account)
- **REFERENCIA SANTANDER** (bank reference)

### Tipos de productos únicos en Excel:
- Filmpackage
- E&O (Errors & Omissions)
- Riesgos Profesionales
- RC General (Responsabilidad Civil)

### Partners/Brokers identificados:
- Gallagher (más frecuente)
- Sergio
- Amazon
- VIX

### Aseguradoras identificadas:
- Berkley (más frecuente)
- Allianz

---

## 🚀 SIGUIENTES PASOS SUGERIDOS

1. **Ejecutar scripts de creación de tablas** en phpMyAdmin/cPanel
2. **Migrar datos del Excel a la BD** usando script Python
3. **Implementar endpoints faltantes** en `backend/index.php`
4. **Conectar componentes HTML** a los nuevos endpoints
5. **Implementar funciones JS** de renderizado
6. **Pruebas end-to-end** de cada dashboard
7. **Documentar API** completa para el equipo

---

**Generado**: 11 de enero de 2026  
**Versión**: 1.0  
**Analista**: GitHub Copilot
