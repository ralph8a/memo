# ✅ Scripts de SQL Demo y Cronjobs - Configuración Completa

## 📊 Script SQL Demo - maria.garcia@example.com

### ✅ Archivos Creados

1. **`backend/execute-demo-data.php`** - Script PHP para ejecutar desde navegador
2. **`backend/demo-data-maria-garcia-ready.sql`** - SQL con hash de password generado
3. **`scripts/execute-sql-demo.js`** - Generador de scripts

### 🔐 Credenciales Generadas

```
Email: maria.garcia@example.com
Password: maria123
```

### 🚀 Cómo Ejecutar el Script SQL

#### OPCIÓN 1: Via PHP Script (RECOMENDADO - Más Fácil)

1. **Abrir en navegador:**
   ```
   http://ksinsurancee.com/backend/execute-demo-data.php?key=demo2026
   ```

2. **El script creará automáticamente:**
   - ✅ Usuario maria.garcia@example.com con password hasheado
   - ✅ Póliza AUTO-001-2026 (Honda Civic 2022)
   - ✅ 12 pagos mensuales de $1,625 MXN
   - ✅ 1 pago histórico completado
   - ✅ 2 citas programadas
   - ✅ Relación con documento PDF

3. **Verificación en pantalla:**
   - User ID
   - Policy ID
   - Total de pagos programados
   - Datos del cliente

4. **⚠️ IMPORTANTE:** Eliminar el archivo execute-demo-data.php después de usarlo por seguridad

#### OPCIÓN 2: Via cPanel phpMyAdmin

1. Ir a: https://ksinsurancee.com:2083
2. Credenciales cPanel: `nhs13h5k0x0j` / `Inspiron1999#`
3. Abrir phpMyAdmin
4. Seleccionar base de datos: `nhs13h5k_krause`
5. Ir a pestaña "SQL"
6. Copiar contenido de `backend/demo-data-maria-garcia-ready.sql`
7. Click "Ejecutar"

#### OPCIÓN 3: Via SSH

```bash
ssh nhs13h5k0x0j@208.109.62.140
cd public_html/backend
mysql -u nhs13h5k_krause -p nhs13h5k_krause < demo-data-maria-garcia-ready.sql
# Password: Inspiron1999#
```

---

## ⏰ Configuración de Cronjobs

### ✅ Archivos Creados

1. **`CRONJOB-SETUP-INSTRUCTIONS.txt`** - Instrucciones completas
2. **`scripts/setup-cronjobs.js`** - Generador de configuración
3. **`scripts/setup-cronjobs.sh`** - Script automatizado para SSH
4. **`scripts/setup-cronjobs-winscp.txt`** - Script para WinSCP

### 📋 Cronjobs a Configurar

#### 1. Notificaciones de Pagos (Diario 9:00 AM)
```bash
0 9 * * * /usr/bin/php /home/nhs13h5k0x0j/public_html/backend/payment-cron.php >> /home/nhs13h5k0x0j/logs/payment-cron.log 2>&1
```

**Funciones:**
- Envía recordatorios 7 días antes de vencimiento
- Notifica pagos vencidos (1, 3, 7, 15 días)
- Recuerda subir comprobantes

#### 2. Limpieza de Archivos Temporales (Diario 2:00 AM)
```bash
0 2 * * * /usr/bin/php /home/nhs13h5k0x0j/public_html/backend/cleanup-temp-files.php >> /home/nhs13h5k0x0j/logs/cleanup-cron.log 2>&1
```

**Funciones:**
- Elimina archivos temp mayores a 24 horas
- Limpia uploads fallidos
- Mantiene servidor optimizado

#### 3. Backup de Base de Datos (Semanal - Domingo 3:00 AM)
```bash
0 3 * * 0 /usr/bin/mysqldump -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause > /home/nhs13h5k0x0j/backups/db-backup-$(date +\%Y\%m\%d).sql 2>&1
```

**Funciones:**
- Backup completo de base de datos
- Guarda con fecha en nombre
- Retención: manual (eliminar backups antiguos)

---

### 🚀 Cómo Configurar Cronjobs

#### OPCIÓN 1: Via cPanel (RECOMENDADO)

1. **Acceder a cPanel:**
   ```
   https://ksinsurancee.com:2083
   Usuario: nhs13h5k0x0j
   Password: Inspiron1999#
   ```

2. **Buscar "Cron Jobs"** (en sección Advanced)

3. **Crear directorios primero (opcional):**
   - Ir a "File Manager"
   - Crear carpetas: `/logs` y `/backups`
   - O se crean automáticamente al ejecutar cronjobs

4. **Agregar cada cronjob:**
   - Click en "Add New Cron Job"
   - Seleccionar:
     - Common Settings: Custom
     - Minute: 0
     - Hour: 9 (para notificaciones)
     - Day: * (todos)
     - Month: * (todos)
     - Weekday: * (todos)
   - Comando: (copiar de arriba)
   - Click "Add New Cron Job"

5. **Repetir para los 3 cronjobs**

#### OPCIÓN 2: Via SSH (Automático)

```bash
# En tu máquina local (Windows Git Bash o WSL)
ssh nhs13h5k0x0j@208.109.62.140

# Una vez conectado:
mkdir -p ~/logs ~/backups
chmod 755 ~/logs ~/backups

# Editar crontab
crontab -e

# Pegar los 3 comandos de arriba
# Guardar y salir (:wq en vim)

# Verificar instalación
crontab -l
```

#### OPCIÓN 3: Ejecución Manual para Pruebas

Antes de configurar cronjobs, probar manualmente:

```bash
# Via SSH
ssh nhs13h5k0x0j@208.109.62.140
php ~/public_html/backend/payment-cron.php

# Via navegador (con clave de seguridad)
http://ksinsurancee.com/backend/payment-cron.php?cron_key=your_secret_key
```

---

## 📊 Verificación de Configuración

### Verificar Script SQL Ejecutado

```sql
-- Via phpMyAdmin o SSH
SELECT 
    u.user_id,
    u.email,
    u.first_name,
    u.last_name,
    p.policy_number,
    p.premium_amount,
    COUNT(ps.schedule_id) as total_payments
FROM users u
LEFT JOIN policies p ON u.user_id = p.user_id
LEFT JOIN payment_schedule ps ON p.policy_id = ps.policy_id
WHERE u.email = 'maria.garcia@example.com'
GROUP BY u.user_id, p.policy_id;
```

**Resultado esperado:**
- User ID: (número)
- Email: maria.garcia@example.com
- Policy: AUTO-001-2026
- Total payments: 12

### Verificar Cronjobs Activos

```bash
# Via SSH
ssh nhs13h5k0x0j@208.109.62.140
crontab -l

# Debería mostrar 3 líneas (los 3 cronjobs)
```

### Verificar Logs de Cronjobs

```bash
# Via SSH
tail -f ~/logs/payment-cron.log
tail -f ~/logs/cleanup-cron.log

# O via cPanel File Manager
# Navegar a /logs/ y abrir archivos
```

---

## 🔧 Troubleshooting

### Si el script PHP no funciona:

1. **Verificar permisos:**
   ```bash
   chmod 644 ~/public_html/backend/execute-demo-data.php
   ```

2. **Verificar URL correcta:**
   - Debe incluir `?key=demo2026`
   - Ejemplo: `http://ksinsurancee.com/backend/execute-demo-data.php?key=demo2026`

3. **Ver errores PHP:**
   - Agregar al inicio del archivo: `ini_set('display_errors', 1);`
   - O revisar logs: `~/logs/error_log`

### Si los cronjobs no se ejecutan:

1. **Verificar ruta de PHP:**
   ```bash
   which php
   # Debería ser: /usr/bin/php
   ```

2. **Probar ejecución manual:**
   ```bash
   /usr/bin/php ~/public_html/backend/payment-cron.php
   ```

3. **Revisar logs del sistema:**
   ```bash
   tail -f /var/log/cron
   # O solicitar a GoDaddy support
   ```

4. **Verificar sintaxis de cronjobs:**
   - Usar: https://crontab.guru
   - Validar formato: `minute hour day month weekday command`

### Si el backup falla:

1. **Verificar permisos de backup folder:**
   ```bash
   chmod 755 ~/backups
   ```

2. **Probar mysqldump manual:**
   ```bash
   mysqldump -u nhs13h5k_krause -p nhs13h5k_krause > test-backup.sql
   # Ingresar password cuando lo pida
   ```

---

## 📁 Estructura de Archivos en Servidor

```
/home/nhs13h5k0x0j/
├── public_html/
│   ├── backend/
│   │   ├── execute-demo-data.php ← Script PHP ejecutable
│   │   ├── demo-data-maria-garcia.sql
│   │   ├── demo-data-maria-garcia-ready.sql ← Con hash
│   │   ├── payment-cron.php ← Cronjob notificaciones
│   │   ├── cleanup-temp-files.php ← Cronjob limpieza
│   │   └── demo-policies/
│   │       └── maria-garcia-AUTO-001.pdf
│   └── ...
├── logs/ ← Crear manualmente
│   ├── payment-cron.log
│   └── cleanup-cron.log
└── backups/ ← Crear manualmente
    └── db-backup-YYYYMMDD.sql
```

---

## 🎯 Checklist de Implementación

### Paso 1: Ejecutar Script SQL
- [ ] Abrir http://ksinsurancee.com/backend/execute-demo-data.php?key=demo2026
- [ ] Verificar mensaje de éxito en pantalla
- [ ] Confirmar credenciales:
  - Email: maria.garcia@example.com
  - Password: maria123
- [ ] Eliminar execute-demo-data.php por seguridad

### Paso 2: Configurar Cronjobs
- [ ] Acceder a cPanel: https://ksinsurancee.com:2083
- [ ] Crear directorios `/logs` y `/backups`
- [ ] Ir a "Cron Jobs"
- [ ] Agregar cronjob de notificaciones (9:00 AM)
- [ ] Agregar cronjob de limpieza (2:00 AM)
- [ ] Agregar cronjob de backup (Domingo 3:00 AM)
- [ ] Verificar con `crontab -l` via SSH

### Paso 3: Pruebas
- [ ] Login con maria.garcia@example.com / maria123
- [ ] Verificar póliza AUTO-001-2026 visible
- [ ] Verificar 12 pagos programados
- [ ] Verificar próximo pago pendiente
- [ ] Ejecutar payment-cron.php manualmente para probar

### Paso 4: Monitoreo
- [ ] Revisar logs después de 24 horas
- [ ] Verificar que se creó backup el domingo
- [ ] Confirmar notificaciones de email funcionando

---

## 📞 Soporte

Si tienes problemas:

1. **Revisar logs del servidor:**
   ```bash
   tail -f ~/logs/payment-cron.log
   ```

2. **Contactar GoDaddy Support:**
   - Para problemas de cronjobs
   - Para verificar configuración de PHP
   - Para acceso a logs del sistema

3. **Verificar documentación:**
   - CRONJOB-SETUP-INSTRUCTIONS.txt (detalles completos)
   - backend/PAYMENT-SYSTEM-README.md (sistema de pagos)

---

**Fecha de Creación:** ${new Date().toISOString()}
**Estado:** ✅ Todos los scripts deployados exitosamente
**URL Base:** http://ksinsurancee.com
