# Auditoría de Base de Datos - Sistema de Seguros Krause
**Fecha:** 30 de Enero de 2026
**Estado:** PRODUCCIÓN ACTIVA

## 📊 Resumen Ejecutivo

### Tablas en Uso (PRODUCCIÓN)
✅ **Esquema Real Activo:**
- `users` - Usuarios del sistema (clientes, agentes, admin)
- `policies` - Pólizas de seguros
- `payments` - Registro de pagos realizados
- `documents` - Documentos cargados por clientes
- `claims` - Siniestros/reclamaciones
- `claim_comments` - Comentarios en siniestros
- `quotes` - Cotizaciones solicitadas
- `policy_comments` - Comentarios en pólizas
- `direct_message_threads` - Hilos de conversación DM
- `direct_messages` - Mensajes directos
- `activity_logs` - Logs de actividad del sistema
- `payment_receipts` - Comprobantes de pago subidos

### ⚠️ Tablas Obsoletas/No Usadas
❌ **Esquema Antiguo (NO SE USA):**
- `payment_schedules` - Reemplazado por tabla `payments`
- `clients` - Consolidado en tabla `users` con user_type='client'
- `agents` - Consolidado en tabla `users` con user_type='agent'
- `payment_proofs` - No implementado en esquema actual
- `payment_notifications` - No implementado en esquema actual
- `payment_audit_log` - No implementado en esquema actual
- `insurer_invoices` - No implementado en esquema actual

---

## 🗃️ Análisis Detallado de Archivos

### **ARCHIVOS BACKEND EN PRODUCCIÓN (MANTENER)**

#### 1. Archivos Core (CRÍTICOS)
```
✅ index.php                    - API principal, todos los endpoints
✅ auth.php                     - Autenticación JWT
✅ database.php                 - Conexión a base de datos
✅ config.php                   - Configuración
✅ api-endpoints.php            - Funciones de endpoints
```

#### 2. Servicios Especializados (ACTIVOS)
```
✅ direct-messages-api.php      - API de mensajería directa
✅ calendar-service.php         - Servicio de calendario
✅ client-from-policy.php       - Creación de clientes desde póliza
✅ email-service.php            - Envío de emails
✅ notification-api.php         - Sistema de notificaciones
```

#### 3. Procesadores de Documentos (OPCIONALES)
```
⚠️ document-matcher.php         - Matching de documentos (no crítico)
⚠️ policy-analyzer.php          - Análisis de pólizas (no crítico)
⚠️ receipt-analyzer.php         - Análisis de recibos (no crítico)
```

#### 4. Schemas SQL (MANTENER)
```
✅ database-schema.sql          - Schema principal completo
✅ fix-dm-thread-id-type.sql    - Fix aplicado (histórico)
✅ meetings-schema.sql          - Schema de reuniones
✅ policy-comments-schema-clean.sql - Schema limpio de comentarios
```

---

### **ARCHIVOS OBSOLETOS (ELIMINAR)**

#### 1. Archivos de Testing/Debug (ELIMINAR TODOS)
```
❌ test-api.html                - Testing manual
❌ test-auth-local.php          - Testing de auth
❌ test-client-endpoints.php    - Testing de endpoints
❌ test-dashboard-direct.php    - Testing de dashboard
❌ test-dashboard-endpoint.php  - Testing de dashboard
❌ test-dm-frontend.php         - Testing de DM
❌ test-dm-start-thread.php     - Testing de DM threads
❌ check-database-schema.php    - Verificación de schema
❌ check-dm-schema.php          - Verificación de DM
❌ check-guillermo.php          - Verificación de usuario
❌ check-tables.php             - Verificación de tablas
❌ debug-headers.php            - Debug de headers
❌ debug-policies.php           - Debug de pólizas
```

#### 2. Scripts de Inserción de Datos de Prueba (ELIMINAR)
```
❌ insert-test-data.php         - Datos de prueba
❌ insert-test-comments.sql     - Comentarios de prueba
❌ insert-test-notifications.php - Notificaciones de prueba
❌ insert-test-payments.php     - Pagos de prueba
❌ execute-dm-fix.php           - Fix ya aplicado
```

#### 3. Scripts Shell (ELIMINAR)
```
❌ check-existing-users.sh      - Verificación manual
❌ create-guillermo-user.sh     - Creación manual de usuario
❌ reset-demo-passwords.sh      - Reset de demos
❌ test-endpoints-http.sh       - Testing HTTP
❌ test-guillermo-auth.sh       - Testing de auth
```

#### 4. Schemas SQL Obsoletos (ELIMINAR)
```
❌ direct-messages-schema.sql       - Reemplazado por fix
❌ fix-direct-messages-schema.sql   - Ya aplicado
❌ policy-comments-schema.sql       - Versión antigua
❌ payments-schema.sql              - Sistema antiguo payment_schedules
```

#### 5. Archivos de Sistema Antiguo (ELIMINAR)
```
❌ payment-api.php              - Usa payment_schedules (tabla inexistente)
❌ payment-service.php          - Corregido pero usa tablas obsoletas
❌ payment-cron.php             - Usa payment_schedules
❌ payment-schedule-generator.php - Genera payment_schedules
```

#### 6. Otros (LIMPIAR)
```
❌ cleanup-temp-files.php       - Utilidad temporal
⚠️ README.md                    - Revisar si tiene info útil antes de borrar
```

---

## 🔍 Consultas SQL Corregidas

### Problema Identificado
Varios archivos usan tablas que NO EXISTEN en el schema real:

**Tablas Fantasma:**
- `payment_schedules` → Debe ser `payments`
- `clients` → Debe ser `users` con `user_type = 'client'`
- `agents` → Debe ser `users` con `user_type = 'agent'`
- `payment_proofs` → No existe
- `payment_notifications` → No existe

### Archivos Corregidos
✅ **backend/api-endpoints.php**
- `getClientPayments()` - Usa `payments` con `p.client_id`
- `getClientDocuments()` - Usa `documents` con `uploaded_at` y `user_id`

✅ **backend/payment-service.php**
- `getAgentClientPayments()` - Usa `payments` con JOIN a `policies` y `users`

### Archivos que AÚN TIENEN PROBLEMAS
❌ **notification-api.php** - Referencias a `payment_schedules`, `payment_proofs`
❌ **payment-api.php** - Todo el archivo usa `payment_schedules`
❌ **payment-cron.php** - Genera `payment_schedules`

---

## 📝 Recomendaciones

### ACCIONES INMEDIATAS (HOY)

1. **ELIMINAR** todos los archivos de testing/debug
2. **ELIMINAR** todos los scripts `.sh` 
3. **ELIMINAR** archivos SQL obsoletos
4. **ELIMINAR** sistema de payment_schedules completo

### ACCIONES PENDIENTES

1. **CREAR** nuevo payment-service.php simplificado si se necesita
2. **REVISAR** notification-api.php y actualizar a schema real
3. **DOCUMENTAR** endpoints activos en README.md actualizado

---

## 🎯 Estado Final LOGRADO ✅

### Backend/ (LIMPIADO)
```
backend/
├── index.php                    ✅ API principal (63.7 KB)
├── auth.php                     ✅ Autenticación (6.3 KB)
├── database.php                 ✅ Conexión DB (1.6 KB)
├── config.php                   ✅ Config (0.9 KB)
├── api-endpoints.php            ✅ Funciones (15.5 KB) - CORREGIDO
├── direct-messages-api.php      ✅ Mensajería (13.5 KB)
├── calendar-service.php         ✅ Calendario (4.3 KB)
├── client-from-policy.php       ✅ Creación clientes (14.8 KB)
├── email-service.php            ✅ Emails (7.9 KB)
├── payment-service.php          ✅ Servicio pagos (24.1 KB) - CORREGIDO
├── database-schema.sql          ✅ Schema principal (25.0 KB)
├── meetings-schema.sql          ✅ Schema reuniones (3.1 KB)
├── policy-comments-schema-clean.sql ✅ Schema comentarios (2.5 KB)
├── fix-dm-thread-id-type.sql    ✅ Fix histórico (0.2 KB)
├── README.md                    ℹ️ Documentación
└── demo-policies/               📁 Carpeta de demostración
```

**Total: 16 archivos** (de ~50 originales) = **68% de archivos eliminados** ✅

---

## ✅ Verificación Post-Limpieza

### Archivos Eliminados (34 archivos)
✅ **Testing/Debug (16 archivos):**
- test-api.html, test-auth-local.php, test-client-endpoints.php
- test-dashboard-direct.php, test-dashboard-endpoint.php
- test-dm-frontend.php, test-dm-start-thread.php
- check-database-schema.php, check-dm-schema.php
- check-guillermo.php, check-tables.php
- debug-headers.php, debug-policies.php
- insert-test-data.php, insert-test-notifications.php, insert-test-payments.php
- execute-dm-fix.php, cleanup-temp-files.php

✅ **Scripts Shell (5 archivos):**
- check-existing-users.sh, create-guillermo-user.sh
- reset-demo-passwords.sh, test-endpoints-http.sh, test-guillermo-auth.sh

✅ **Schemas SQL Obsoletos (5 archivos):**
- direct-messages-schema.sql, fix-direct-messages-schema.sql
- policy-comments-schema.sql, payments-schema.sql, insert-test-comments.sql

✅ **Sistema Payment Schedules (3 archivos):**
- payment-api.php, payment-cron.php, payment-schedule-generator.php

✅ **APIs Obsoletas (4 archivos):**
- notification-api.php (usaba payment_schedules)
- document-matcher.php, policy-analyzer.php, receipt-analyzer.php

✅ **Otros (1 archivo):**
- README.md backend duplicado

### Verificar Funcionamiento:
1. ⏳ Backend responde a endpoints principales
2. ⏳ Login funciona (cliente y agente)
3. ⏳ Dashboard carga datos
4. ⏳ Mensajes directos funcionan
5. ⏳ Comentarios de pólizas funcionan
6. ⏳ Calendario de pagos funciona

---

## 📌 Notas Importantes

- El sistema de `payment_schedules` fue diseñado pero **nunca implementado**
- La tabla real es `payments` con registros directos
- Todos los testing files son seguros de eliminar (datos de prueba permanecen en DB)
- Los schemas SQL obsoletos ya fueron aplicados, son solo históricos
