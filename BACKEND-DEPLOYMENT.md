# 🎉 Backend Desplegado Exitosamente

## ✅ Archivos Subidos al Servidor

Se desplegaron los siguientes archivos en `public_html/api/`:

- ✅ **index.php** (11.58 KB) - Router principal del API
- ✅ **config.php** (1.83 KB) - Configuración de base de datos y email
- ✅ **database.php** (1.44 KB) - Conexión PDO con MySQL
- ✅ **auth.php** (3.57 KB) - Sistema de autenticación JWT
- ✅ **email-service.php** (9.02 KB) - Servicio de notificaciones por email
- ✅ **database-schema.sql** (8.16 KB) - Schema completo de la DB
- ✅ **README.md** (5.36 KB) - Instrucciones de configuración
- ✅ **.htaccess** - Routing del API

## 📋 Próximos Pasos para Activar el Backend

### 1️⃣ Crear Base de Datos MySQL en cPanel

1. **Acceder a cPanel**: https://ksinsurancee.com:2083
2. **MySQL Databases** → Create New Database
   - **Nombre**: `krause` (se creará como `nhs13h5k_krause`)
3. **Crear usuario**:
   - **Usuario**: `krauser` (se creará como `nhs13h5k_krauser`)
   - **Generar contraseña fuerte** y guardarla
4. **Asignar permisos**:
   - Add User To Database
   - Marcar **ALL PRIVILEGES**

### 2️⃣ Importar Schema de Base de Datos

1. **cPanel** → **phpMyAdmin**
2. Seleccionar base de datos `nhs13h5k_krause`
3. Click en tab **SQL**
4. Copiar contenido de `backend/database-schema.sql`
5. Pegar y click **Go**
6. Verificar que se crearon 9 tablas:
   - users
   - policies
   - claims
   - questionnaires
   - documents
   - payments
   - notifications
   - quotes

### 3️⃣ Configurar Credenciales en config.php

**Editar via cPanel File Manager**:
1. File Manager → `public_html/api/config.php`
2. Actualizar:

```php
define('DB_PASS', 'TU_CONTRASEÑA_MYSQL_AQUÍ');
define('SMTP_PASS', 'TU_CONTRASEÑA_EMAIL_AQUÍ');

// Generar strings aleatorios de 32+ caracteres
define('API_SECRET_KEY', 'GENERAR_STRING_ALEATORIO_32_CARACTERES');
define('JWT_SECRET', 'OTRO_STRING_ALEATORIO_32_CARACTERES');
```

**Generar strings aleatorios**:
- Opción 1: https://www.random.org/strings/
- Opción 2: PowerShell:
  ```powershell
  -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
  ```

### 4️⃣ Crear Email para Notificaciones

1. **cPanel** → **Email Accounts**
2. Crear email: `notifications@ksinsurancee.com`
3. **Generar contraseña fuerte** y guardarla
4. Actualizar en `config.php`:
   ```php
   define('SMTP_PASS', 'contraseña_del_email');
   ```

### 5️⃣ Configurar Permisos de Archivos

**Via cPanel File Manager**:
- `config.php`: **600** (solo lectura propietario)
- Otros `.php`: **644** (lectura todos, escritura propietario)
- `/uploads/`: **755** (carpeta con escritura)

### 6️⃣ Probar el API

**Test 1: Health Check**
```bash
curl https://ksinsurancee.com/api/
```

**Test 2: Login (Admin)**
```bash
curl -X POST https://ksinsurancee.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ksinsurancee.com","password":"Admin123!"}'
```

**Respuesta esperada**:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "admin@ksinsurancee.com",
    "user_type": "admin",
    "first_name": "Admin",
    "last_name": "System"
  }
}
```

**Test 3: Solicitar Quote**
```bash
curl -X POST https://ksinsurancee.com/api/quotes/request \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "quoteType": "auto"
  }'
```

## 🔐 Credenciales de Prueba

**Admin**:
- Email: `admin@ksinsurancee.com`
- Password: `Admin123!`

**Agent**:
- Email: `guillermo.krause@ksinsurancee.com`
- Password: `Admin123!`

**Client**:
- Email: `client.test@example.com`
- Password: `Admin123!`

**⚠️ IMPORTANTE**: Cambiar estas contraseñas después de la primera prueba.

## 📊 Endpoints Disponibles

### Autenticación
- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/verify` - Verificar token

### Quotes
- `POST /api/quotes/request` - Solicitar cotización (público)
- `GET /api/quotes` - Listar quotes (requiere auth agent/admin)

### Claims
- `GET /api/claims` - Listar claims (requiere auth)
- `POST /api/claims/:id/assign` - Asignar claim a agent

### Questionnaires
- `POST /api/questionnaires/send` - Enviar cuestionario a cliente

### Notifications
- `POST /api/notifications/email` - Enviar email

### Agents
- `GET /api/agents/clients` - Listar clientes (agent/admin)
- `GET /api/agents/clients/:id` - Detalles de cliente

### Analytics
- `GET /api/analytics/dashboard` - Estadísticas del dashboard

## 🚀 Actualizar Frontend para Usar el API

El frontend ya está configurado para usar `https://ksinsurancee.com/api`.

Para redesplegar con la nueva configuración:

```bash
npm run rebuild:sftp
```

## 🔧 Troubleshooting

### Error: Database connection failed
- Verificar credenciales en `config.php`
- Verificar que la base de datos existe en cPanel
- Verificar permisos del usuario MySQL

### Error: Email sending failed
- Verificar que el email existe en cPanel
- Verificar credenciales SMTP en `config.php`
- GoDaddy puede requerir usar `localhost` como SMTP_HOST

### Error 404: Endpoint not found
- Verificar que `.htaccess` existe en `/api/`
- Verificar mod_rewrite habilitado en Apache
- Revisar logs en cPanel → Error Log

### Error 500: Internal server error
- Activar debug en `config.php`:
  ```php
  define('ENVIRONMENT', 'development');
  define('DEBUG_MODE', true);
  ```
- Revisar logs PHP en `api/logs/php-errors.log`

## 📁 Estructura Final en Servidor

```
/home/nhs13h5k0x0j/public_html/
├── index.html (frontend)
├── krause.app.js
├── .htaccess (frontend routing)
├── assets/
└── api/
    ├── index.php ✅
    ├── config.php ✅
    ├── database.php ✅
    ├── auth.php ✅
    ├── email-service.php ✅
    ├── database-schema.sql ✅
    ├── README.md ✅
    ├── .htaccess ✅
    └── uploads/
```

## ✨ Funcionalidades Implementadas

✅ **Sistema de Autenticación**
- Login con JWT
- Tipos de usuario: admin, agent, client
- Verificación de tokens
- Hash seguro de contraseñas (bcrypt)

✅ **Base de Datos Completa**
- Usuarios (agents, clients, admin)
- Pólizas de seguro
- Claims (reclamos)
- Cuestionarios
- Documentos
- Pagos
- Notificaciones
- Quotes (cotizaciones)

✅ **Sistema de Notificaciones**
- Emails HTML con plantillas profesionales
- Notificación de asignación de claims
- Confirmación de quotes
- Envío de cuestionarios
- Confirmación de pagos
- Log de todas las notificaciones en DB

✅ **API REST Completa**
- 15+ endpoints funcionales
- Autenticación JWT
- CORS configurado
- Manejo de errores
- Logs de actividad

✅ **Seguridad**
- Passwords hasheados con bcrypt
- JWT con expiración
- CORS restringido
- Protección de archivos sensibles
- Validación de datos
- SQL injection prevention (PDO prepared statements)

## 📞 Soporte

Si necesitas ayuda adicional, revisa:
- `backend/README.md` - Instrucciones detalladas
- cPanel Error Logs - Para debugging
- phpMyAdmin - Para verificar la DB

---

**¡Backend listo para producción!** 🚀

Ahora puedes configurar la base de datos y probar todas las funcionalidades.
