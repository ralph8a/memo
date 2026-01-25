# Instrucciones de Instalación del Backend

## 📋 Pre-requisitos

- Acceso a cPanel de GoDaddy
- Base de datos MySQL creada
- Credenciales SSH (ya configuradas)

## 🗄️ Paso 1: Crear Base de Datos en cPanel

1. **Acceder a cPanel** → MySQL Databases

2. **Crear nueva base de datos**:
   - Nombre: `krause` (se creará como `nhs13h5k_krause`)
   - Click en "Create Database"

3. **Crear usuario de base de datos**:
   - Usuario: `krauser` (se creará como `nhs13h5k_krauser`)
   - Contraseña: Genera una contraseña fuerte
   - **¡GUARDA LA CONTRASEÑA!**

4. **Asignar permisos**:
   - En "Add User To Database"
   - Usuario: `nhs13h5k_krauser`
   - Base de datos: `nhs13h5k_krause`
   - Marcar **ALL PRIVILEGES**
   - Click "Make Changes"

5. **Importar schema**:
   - cPanel → phpMyAdmin
   - Seleccionar `nhs13h5k_krause`
   - Click tab "SQL"
   - Copiar y pegar contenido de `database-schema.sql`
   - Click "Go"

## 📧 Paso 2: Configurar Email para Notificaciones

1. **Crear cuenta de email en cPanel**:
   - cPanel → Email Accounts
   - Email: `notifications@ksinsurancee.com`
   - Contraseña: Genera una fuerte
   - **¡GUARDA LA CONTRASEÑA!**

## ⚙️ Paso 3: Configurar Backend

1. **Editar `backend/config.php`**:
   ```php
   define('DB_NAME', 'nhs13h5k_krause');
   define('DB_USER', 'nhs13h5k_krauser');
   define('DB_PASS', 'TU_CONTRASEÑA_MYSQL'); // ← Poner aquí
   
   define('SMTP_USER', 'notifications@ksinsurancee.com');
   define('SMTP_PASS', 'TU_CONTRASEÑA_EMAIL'); // ← Poner aquí
   ```

2. **Generar secrets de seguridad**:
   - Ejecutar en terminal PHP o generar strings aleatorios
   - Reemplazar en `config.php`:
   ```php
   define('API_SECRET_KEY', 'tu-string-aleatorio-32-caracteres');
   define('JWT_SECRET', 'otro-string-aleatorio-32-caracteres');
   ```

## 🚀 Paso 4: Desplegar Backend al Servidor

El backend debe ir en `/home/nhs13h5k0x0j/public_html/api/`

### Opción A: Usando SFTP Script (recomendado)

```bash
npm run deploy:backend
```

### Opción B: Manual via SFTP

1. Conectar con WinSCP o FileZilla
2. Host: `208.109.62.140`
3. User: `nhs13h5k0x0j`
4. Subir carpeta `backend/` a `public_html/api/`

## 🔒 Paso 5: Configurar .htaccess del API

Crear `/public_html/api/.htaccess`:

```apache
# API Routing
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /api/
    
    # Redirect all requests to index.php
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "DENY"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Disable directory listing
Options -Indexes

# Protect sensitive files
<FilesMatch "(config|database|auth|email-service)\.php$">
    Require all denied
</FilesMatch>
```

## ✅ Paso 6: Probar el API

### Test 1: Health Check
```bash
curl https://ksinsurancee.com/api/
```

### Test 2: Login
```bash
curl -X POST https://ksinsurancee.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ksinsurancee.com",
    "password": "Admin123!"
  }'
```

**Respuesta esperada**: Token JWT + datos del usuario

### Test 3: Solicitar Quote
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

## 📁 Estructura de Archivos en Servidor

```
/home/nhs13h5k0x0j/
├── public_html/
│   ├── index.html (frontend)
│   ├── krause.app.js
│   ├── .htaccess (frontend routing)
│   └── api/
│       ├── index.php (router principal)
│       ├── config.php
│       ├── database.php
│       ├── auth.php
│       ├── email-service.php
│       ├── .htaccess (API routing)
│       └── uploads/ (crear directorio)
```

## 🔧 Troubleshooting

### Error: "Database connection failed"
- Verificar credenciales en `config.php`
- Verificar que el usuario tiene permisos
- Revisar en cPanel que la DB existe

### Error: "Email sending failed"
- Verificar credenciales SMTP en `config.php`
- Revisar que el email existe en cPanel
- GoDaddy puede requerir usar `localhost` como SMTP_HOST

### Error: "Endpoint not found"
- Verificar que .htaccess está en `/api/`
- Verificar mod_rewrite habilitado
- Revisar logs de Apache en cPanel

## 📝 Credenciales de Prueba

**Admin**:
- Email: `admin@ksinsurancee.com`
- Password: `Admin123!`

**Agent**:
- Email: `agent.one@ksinsurancee.com`
- Password: `Admin123!`

**Client**:
- Email: `client.test@example.com`
- Password: `Admin123!`

## 🔐 Seguridad Post-Instalación

1. **Cambiar contraseñas por defecto** en la DB
2. **Regenerar secrets** en `config.php`
3. **Restringir permisos** de archivos:
   ```bash
   chmod 644 *.php
   chmod 600 config.php
   ```

## 📊 Siguiente Paso

Una vez desplegado el backend, actualizar el frontend en `src/api-integration.js`:

```javascript
BASE_URL: window.location.hostname === 'localhost'
  ? 'http://localhost/api'
  : 'https://ksinsurancee.com/api',  // ← Actualizar aquí
```
