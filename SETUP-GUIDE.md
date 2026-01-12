# 🚀 Guía Rápida de Configuración - Backend

## ✅ Deploy Completado
- **URL**: http://ksinsurancee.com
- **Backend**: http://ksinsurancee.com/backend/
- **Fecha**: 2026-01-11

---

## 📋 Pasos de Configuración

### **CRÍTICO: Estado Actual del Sistema**

⚠️ **El backend está desplegado pero la base de datos NO está inicializada.**

**Resultado del test**: Status 500 - "Database connection failed"

Esto significa que necesitas **crear la base de datos** en cPanel antes de que funcione.

---

### **1. Crear y Configurar Base de Datos en cPanel**

#### A) Crear la Base de Datos:
1. Login en cPanel: https://ksinsurancee.com:2083
2. Buscar "MySQL® Databases"
3. En "Create New Database", escribir: `krause`
4. Click "Create Database"
5. **Nombre completo será**: `nhs13h5k_krause` (cPanel agrega prefijo automáticamente)

#### B) Crear Usuario de Base de Datos:
1. En la misma página, buscar "Add New User"
2. Username: `krauser`
3. Password: `Inspiron1999#` (o generar una segura)
4. Click "Create User"
5. **Nombre completo será**: `nhs13h5k_krauser`

#### C) Asignar Privilegios:
1. Buscar "Add User To Database"
2. Usuario: `nhs13h5k_krauser`
3. Database: `nhs13h5k_krause`
4. Click "Add"
5. **Marcar "ALL PRIVILEGES"**
6. Click "Make Changes"

#### D) Ejecutar Schema SQL:
1. En cPanel, buscar "phpMyAdmin"
2. Click en la base de datos `nhs13h5k_krause` en el panel izquierdo
3. Click en pestaña "SQL" en el menú superior
4. Abrir el archivo local: `backend/database-schema.sql`
5. **Copiar TODO el contenido** (25KB de SQL)
6. **Pegar** en el campo SQL de phpMyAdmin
7. Click "Go" o "Ejecutar"

**Resultado esperado:**
```
✅ 15 tablas creadas exitosamente:
   - users, clients, agents
   - policies, coverages, beneficiaries
   - claims, payments, commissions
   - quotes, documents, notifications
   - questionnaires, renewals, activity_logs

✅ Datos dummy insertados:
   - 5 clientes de prueba
   - 4 agentes de prueba
   - 6 pólizas de prueba
   - 6 pagos de prueba
   - 3 reclamaciones de prueba
   - Y más...
```

---

### **2. Verificar Configuración del Backend**

El archivo `backend/config.php` está configurado con:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'nhs13h5k_krause');  // ✅ Correcto
define('DB_USER', 'nhs13h5k_krauser');  // ✅ Correcto
define('DB_PASS', 'Inspiron1999#');     // ✅ Ya configurado
```

**✅ No requiere cambios** (credenciales ya están correctas).

---

### **3. Probar Endpoints**

#### Opción A: Desde el Terminal (Recomendado)
```bash
node scripts/test-api-endpoints.js
```

**Esto probará:**
- ✅ Login (Admin, Agent, Client)
- ✅ Dashboard del Cliente
- ✅ Dashboard del Agente
- ✅ Dashboard del Admin
- ✅ Pólizas, Pagos, Reclamaciones
- ✅ Cotizaciones y Clientes
- ✅ Submit Quote

#### Opción B: Desde el Navegador
Abre la consola del navegador (F12) y ejecuta:

```javascript
// Test Login
fetch('http://ksinsurancee.com/backend/index.php?action=login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'maria.garcia@example.com',
    password: 'Admin123!'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Login:', data);
  
  // Test Dashboard
  return fetch('http://ksinsurancee.com/backend/index.php?action=client_dashboard', {
    headers: { 'Authorization': `Bearer ${data.token}` }
  });
})
.then(r => r.json())
.then(data => console.log('Dashboard:', data));
```

#### Opción C: Con cURL
```bash
# Login
curl -X POST http://ksinsurancee.com/backend/index.php?action=login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria.garcia@example.com","password":"Admin123!"}'

# Guardar el token y usarlo en siguientes requests:
curl -X GET "http://ksinsurancee.com/backend/index.php?action=client_dashboard" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 👥 Usuarios de Prueba

Todos usan la contraseña: **Admin123!**

### **Admin**
- Email: `admin@ksinsurancee.com`
- Rol: Administrador del sistema

### **Agentes**
- `guillermo.krause@ksinsurancee.com` - Agente Principal
- `sofia.torres@ksinsurancee.com` - Agente CDMX
- `ricardo.gomez@ksinsurancee.com` - Agente Norte

### **Clientes**
- `maria.garcia@example.com` - 2 pólizas activas
- `juan.martinez@example.com` - 1 póliza de vida
- `ana.lopez@example.com` - Seguro de salud
- `carlos.rodriguez@example.com` - Seguro de auto
- `laura.hernandez@example.com` - Póliza pendiente

---

## 📊 Datos Dummy Incluidos

### **Pólizas (6)**
- POL-2024-001: Auto - María García ($450/mes)
- POL-2024-002: Hogar - María García ($280/mes)
- POL-2024-003: Vida - Juan Martínez ($180/mes)
- POL-2024-004: Salud - Ana López ($520/mes)
- POL-2024-005: Auto - Carlos Rodríguez ($380/mes)
- POL-2024-006: Hogar - Laura Hernández ($310/mes) - Pendiente

### **Pagos (6)**
Historial completo con estados: completed, pending

### **Reclamaciones (3)**
- CLM-2024-001: Accidente vehicular - Aprobada ($14,500)
- CLM-2024-002: Daño por agua - En revisión ($8,000)
- CLM-2024-003: Gastos médicos - Pagada ($3,500)

### **Cotizaciones (3)**
Nuevas solicitudes de clientes potenciales

### **Coberturas (4)**
Detalles de cobertura por póliza

### **Beneficiarios (3)**
Familiares asignados a pólizas de vida

### **Comisiones (3)**
Comisiones de agentes (paid/pending)

---

## 🔧 Endpoints Disponibles

### **Autenticación**
- `POST /backend/index.php?action=login`
- `POST /backend/index.php?action=register`
- `POST /backend/index.php?action=logout`
- `GET /backend/index.php?action=verify_token`

### **Cliente**
- `GET /backend/index.php?action=client_dashboard`
- `GET /backend/index.php?action=user_policies`
- `GET /backend/index.php?action=payment_history`
- `GET /backend/index.php?action=user_claims`
- `GET /backend/index.php?action=recent_documents`

### **Agente**
- `GET /backend/index.php?action=agent_dashboard`
- `GET /backend/index.php?action=agent_clients`
- `GET /backend/index.php?action=agent_stats`
- `GET /backend/index.php?action=agent_activity`

### **Admin**
- `GET /backend/index.php?action=admin_dashboard`
- `GET /backend/index.php?action=admin_stats`
- `GET /backend/index.php?action=system_activity`

### **General**
- `GET /backend/index.php?action=quotes`
- `GET /backend/index.php?action=claims`
- `GET /backend/index.php?action=clients`
- `POST /backend/index.php?action=submit_quote`
- `POST /backend/index.php?action=submit_claim`

---

## 🚨 Troubleshooting

### **Problema: Login falla con error de base de datos**
**Solución:**
1. Verificar que database-schema.sql se ejecutó correctamente
2. Revisar credenciales en `backend/config.php`
3. Verificar logs de PHP en cPanel

### **Problema: CORS error en el navegador**
**Solución:**
El backend ya tiene headers CORS configurados. Si persiste:
1. Verificar que el archivo `backend/.htaccess` exista
2. Agregar en cPanel > Apache Configuration si es necesario

### **Problema: Endpoints retornan 404**
**Solución:**
1. Verificar que los archivos se subieron correctamente
2. Check URL: http://ksinsurancee.com/backend/index.php
3. Verificar permisos de archivos (chmod 644)

### **Problema: "Database connection failed"**
**Solución:**
1. Ir a cPanel > MySQL Databases
2. Verificar que la base `nhs13h5k_krause_insurance` existe
3. Verificar usuario `nhs13h5k_admin` tiene permisos
4. Ejecutar: `GRANT ALL PRIVILEGES ON nhs13h5k_krause_insurance.* TO 'nhs13h5k_admin'@'localhost';`

---

## 📈 Siguientes Pasos

### **Inmediato**
1. ✅ Ejecutar `database-schema.sql`
2. ✅ Probar login con usuarios dummy
3. ✅ Verificar dashboards cargan datos

### **Corto Plazo**
4. Conectar formularios de frontend con endpoints
5. Implementar carga de archivos para documentos
6. Configurar SMTP para emails

### **Mediano Plazo**
7. Importar datos reales de producción
8. Configurar backups automáticos
9. Implementar analytics y reportes

---

## 🔒 Seguridad

### **Implementado**
- ✅ JWT Authentication con tokens de 1 hora
- ✅ Passwords hasheados con bcrypt
- ✅ SQL Prepared Statements (prevención de SQL Injection)
- ✅ CORS headers configurados
- ✅ Input validation en todos los endpoints

### **Recomendaciones Adicionales**
- 🔹 Cambiar contraseñas por defecto en producción
- 🔹 Habilitar HTTPS (SSL)
- 🔹 Configurar rate limiting en cPanel
- 🔹 Habilitar logs de acceso
- 🔹 Backups diarios automáticos

---

## 📞 Comandos Útiles

```bash
# Deploy completo
node scripts/deploy-winscp.js

# Test endpoints
node scripts/test-api-endpoints.js

# Build sin deploy
npm run build

# Start dev server
npm run dev
```

---

## ✅ Checklist Post-Configuración

- [ ] Base de datos creada
- [ ] Schema SQL ejecutado correctamente
- [ ] Login funciona con usuario dummy
- [ ] Dashboard del cliente carga datos
- [ ] Dashboard del agente carga clientes
- [ ] Dashboard del admin muestra estadísticas
- [ ] Submit quote funciona
- [ ] Payment history se visualiza
- [ ] Claims se listan correctamente

**Cuando todos estén ✅, el sistema estará listo para producción!**

---

**Última actualización**: 2026-01-11  
**Versión**: 1.0.0  
**Status**: ✅ Deployed - Listo para configuración de BD
