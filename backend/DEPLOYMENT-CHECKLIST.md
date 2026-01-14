# Checklist de Despliegue - Sistema de Pagos
## GoDaddy Shared Hosting

## 📋 Pre-Despliegue

- [ ] Acceso a cPanel confirmado
- [ ] Acceso a phpMyAdmin confirmado
- [ ] Backup de base de datos actual realizado
- [ ] Backup de archivos actual realizado

---

## 🗄️ Base de Datos

### Paso 1: Crear Tablas y Stored Procedures

- [ ] Abrir cPanel → phpMyAdmin
- [ ] Seleccionar base de datos
- [ ] Ir a pestaña "SQL"
- [ ] Copiar contenido completo de `backend/payments-schema.sql`
- [ ] Ejecutar script (click "Continuar")
- [ ] Verificar creación exitosa:
  ```sql
  SHOW TABLES LIKE 'payment%';
  SHOW PROCEDURE STATUS WHERE Db = 'nombre_base_datos';
  ```
- [ ] Confirmar 6 tablas creadas
- [ ] Confirmar 4 stored procedures creados

**Tablas esperadas:**
- payment_schedules
- payment_proofs
- policy_comments
- payment_notifications
- insurer_invoices
- payment_audit_log

**Stored procedures esperados:**
- sp_generate_payment_schedule
- sp_get_upcoming_due_payments
- sp_get_overdue_payments
- sp_get_pending_proof_reviews

---

## 📁 Sistema de Archivos

### Paso 2: Crear Directorios de Uploads

**Vía File Manager (cPanel):**

- [ ] Ir a File Manager en cPanel
- [ ] Navegar a `public_html/` (o donde esté tu aplicación)
- [ ] Crear carpeta `uploads`
- [ ] Dentro de `uploads`, crear carpeta `proofs`
- [ ] Dentro de `uploads`, crear carpeta `invoices`
- [ ] Dentro de `uploads`, crear carpeta `policies` (NUEVO - documentos de pólizas)

**Permisos (importante):**
- [ ] `uploads/` → Permisos 755
- [ ] `uploads/proofs/` → Permisos 755
- [ ] `uploads/invoices/` → Permisos 755
- [ ] `uploads/policies/` → Permisos 755 (NUEVO)

### Paso 3: Proteger Directorios

**Crear `.htaccess` en `uploads/proofs/`:**
- [ ] Crear archivo nuevo `.htaccess`
- [ ] Contenido:
  ```apache
  Require all denied
  ```

**Crear `.htaccess` en `uploads/invoices/`:**
- [ ] Crear archivo nuevo `.htaccess`
- [ ] Contenido:
  ```apache
  Req

**Crear `.htaccess` en `uploads/policies/` (NUEVO):**
- [ ] Crear archivo nuevo `.htaccess`
- [ ] Contenido:
  ```apache
  Require all denied
  ```uire all denied
  ```

---

## 📤 Subir Archivos Backend

### Pasoolicy-analyzer.php` (NUEVO - análisis de pólizas)
- [ ] `p 4: Subir Archivos PHP

**Archivos a subir a `/backend/`:**

- [ ] `payment-service.php`
- [ ] `payment-api.php`
- [ ] `payment-cron.php`
- [ ] `payments-schema.sql` (para referencia)
- [ ] `PAYMENT-SYSTEM-README.md` (documentación)

**Verificar permisos:**
- [ ] Todos los `.php` → Permisos 644

---

## ⚙️ Configuración

### Paso 5: Actualizar config.php

- [ ] Abrir `backend/config.php`
- [ ] Agregar al final:
  ```php
  // Configuración de pagos
  define('UPLOAD_BASE_DIR', __DIR__ . '/../uploads/');
  define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
  define('ALLOWED_FILE_TYPES', ['pdf', 'jpg', 'jpeg', 'png']);
  ```
- [ ] Guardar cambios

---

## ⏰ Cron Jobs

### Paso 6: Configurar Tarea Automatizada

- [ ] Ir a cPanel → Cron Jobs
- [ ] Agregar nuevo cron job:

**Configuración:**
```
Minuto: 0
Hora: 9
Día: *
Mes: *
Día de la semana: *
```

**Comando:**
```bash
/usr/bin/php /home/TU_USUARIO_CPANEL/public_html/backend/payment-cron.php
```

**⚠️ Importante:** Reemplazar `TU_USUARIO_CPANEL` con tu usuario real de cPanel

- [ ] Guardar cron job
- [ ] Configurar email para recibir notificaciones del cron

### Paso 7: Probar Cron Manualmente

**Opción A - Vía SSH:**
```bash
php /home/tu_usuario/public_html/backend/payment-cron.php
```

**Opción B - Vía navegador (desarrollo):**
```
https://tu-dominio.com/backend/payment-cron.php?cron_key=change_this_in_production
```

- [ ] Ejecutar prueba manual
- [ ] Verificar output (debe mostrar logs)
- [ ] Revisar tabla `payment_notifications` para confirmar funcionamiento

---

## 🧪 Pruebas
Subir Póliza (Agente) - NUEVO**
- [ ] Usar Postman o herramienta similar
- [ ] POST a `/backend/payment-api.php/upload-policy`
- [ ] Enviar:
  ```
  Content-Type: multipart/form-data
  client_id: 1
  policy_file: [archivo PDF de póliza de prueba]
  ```
- [ ] Verificar que se crea archivo en `uploads/policies/`
- [ ] Verificar que se crea registro en tabla `policies`
- [ ] Verificar que se generan pagos en `payment_schedules`
- [ ] Revisar `confidence` en respuesta (high/medium/low)

**Test 3: Generar Schedule Manual (Agente - Fallback)**
- [ ] POST a `/backend/payment-api.php/generate-schedule`
- [ ] Enviar:
  ```json
  {
    "policy_id": 1,
    "total_premium": 6000,
    "payment_frequency": 12,
    "start_date": "2024-01-01"
  }
  ```
- [ ] Verificar que se crean 12 registros en `payment_schedules`

**Test 4icy_id": 1,
    "total_premium": 6000,
    "payment_frequency": 12,
    "start_date": "2024-01-01"
  }
  ```
- [ ] Verificar que se crean 12 registros en `payment_schedules`

**Test 3: Upload Comprobante (Cliente)**
- [ ] POST a `/backend/payment-api.php/upload-proof`
- [ ] Enviar archivo PDF/JPG
- [ ] Verificar que se crea archivo en `uploads/proofs/`
- [ ] Verificar que se crea registro en `payment_proofs`

**Test 4: Descarga de Archivo**
- [ ] GET `/backend/payment-api.php/download-file/proof/1`
- [ ] Debe descargar archivo (con autenticación)
- [ ] Confirmar validación de permisos funciona

---

## 🔍 Verificación Post-Despliegue

### Paso 9: Checklist Final

**Base de Datos:**
- [ ] Tablas creadas correctamente
- [ ] Stored procedures funcionando
- [ ] Foreign keys configurados
- [ ] Índices creados

**Sistema de Archivos:**
- [ ] Directorios `uploads/proofs/` y `uploads/invoices/` existen
- [ ] Permisos correctos (755)
- [ ] `.htaccess` protegiendo directorios
- [ ] Archivos PHP subidos

**API:**
- [ ] Endpoints responden correctamente
- [ ] Validación de autenticación funciona
- [ ] Upload de archivos funciona
- [ ] Download de archivos funciona
- [ ] Validación de permisos funciona

**Cron Job:**
- [ ] Configurado en cPanel
- [ ] Ejecuta correctamente (test manual)
- [ ] Envía notificaciones
- [ ] Registra logs

**Seguridad:**
- [ ] `.htaccess` bloquea acceso directo a uploads
- [ ] Validación de tipos de archivo funciona
- [ ] Validación de tamaño funciona
- [ ] SQL injection protegido (prepared statements)
- [ ] Auditoría registrando cambios

---

## 📊 Monitoreo Post-Despliegue

### Primeras 24 Horas

- [ ] Revisar logs de PHP: `php_error_log`
- [ ] Revisar emails del cron job
- [ ] Verificar tabla `payment_audit_log`
- [ ] Verificar tabla `payment_notifications`

**Queries de verificación:**
```sql
-- Ver actividad reciente
SELECT * FROM payment_audit_log 
ORDER BY action_date DESC LIMIT 20;

-- Ver notificaciones enviadas
SELECT * FROM payment_notifications 
ORDER BY sent_at DESC LIMIT 20;

-- Ver comprobantes subidos
SELECT * FROM payment_proofs 
ORDER BY upload_date DESC LIMIT 10;
```

---

## 🚨 Plan de Rollback

### En caso de problemas:

**Rollback de Base de Datos:**
- [ ] Restaurar backup de BD desde phpMyAdmin
- [ ] Ejecutar:
  ```sql
  DROP TABLE IF EXISTS payment_schedules, payment_proofs, 
                       policy_comments, payment_notifications, 
                       insurer_invoices, payment_audit_log;
  DROP PROCEDURE IF EXISTS sp_generate_payment_schedule;
  DROP PROCEDURE IF EXISTS sp_get_upcoming_due_payments;
  DROP PROCEDURE IF EXISTS sp_get_overdue_payments;
  DROP PROCEDURE IF EXISTS sp_get_pending_proof_reviews;
  ```

**Rollback de Archivos:**
- [ ] Eliminar archivos PHP nuevos de `/backend/`
- [ ] Eliminar directorios `/uploads/proofs/` y `/uploads/invoices/`
- [ ] Restaurar `config.php` desde backup

**Rollback de Cron:**
- [ ] Eliminar cron job desde cPanel

---

## ✅ Checklist Completado

**Fecha de despliegue:** _______________

**Desplegado por:** _______________

**Verificado por:** _______________

**Notas:**
_______________________________________________
_______________________________________________
_______________________________________________

---

## 📞 Contactos de Emergencia

- **Hosting:** Soporte GoDaddy - https://www.godaddy.com/help
- **Base de Datos:** phpMyAdmin en cPanel
- **Logs:** `/home/usuario/public_html/php_error_log`
- **Documentación completa:** `PAYMENT-SYSTEM-README.md`

---

## 🎯 Próximos Pasos (Post-Despliegue)

- [ ] Capacitar al equipo en uso de API
- [ ] Implementar frontend para clientes (upload de comprobantes)
- [ ] Implementar dashboard de agente (revisión de comprobantes)
- [ ] Configurar envío de emails (SendGrid/SMTP)
- [ ] Configurar WhatsApp (opcional, Twilio)
- [ ] Crear reportes de pagos
- [ ] Implementar seguimiento de comisiones (futuro)
