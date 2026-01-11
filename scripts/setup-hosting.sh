#!/bin/bash
# Script de Configuración Completa del Hosting desde Cero
# Ejecutar desde Terminal SSH de cPanel

echo "=========================================="
echo "  CONFIGURACIÓN DE HOSTING DESDE CERO"
echo "=========================================="
echo ""

# Variables
PUBLIC_HTML="/home/nhs13h5k0x0j/public_html"
DOMAIN="i6n.1db.mytemp.website"
BACKUP_DIR="/home/nhs13h5k0x0j/backups/config_$(date +%Y%m%d_%H%M%S)"

# 1. CREAR BACKUP
echo "1. Creando backup de configuración actual..."
mkdir -p "$BACKUP_DIR"
cp -r "$PUBLIC_HTML"/.htaccess "$BACKUP_DIR/" 2>/dev/null || echo "   Sin .htaccess previo"
echo "   ✓ Backup en: $BACKUP_DIR"
echo ""

# 2. LIMPIAR ARCHIVOS INNECESARIOS
echo "2. Limpiando archivos innecesarios..."
cd "$PUBLIC_HTML"
rm -f index.html.bak
rm -f index.php.bak
rm -rf cgi-bin 2>/dev/null
echo "   ✓ Limpieza completada"
echo ""

# 3. VERIFICAR ESTRUCTURA DE ARCHIVOS
echo "3. Verificando estructura de archivos..."
if [ ! -f "$PUBLIC_HTML/index.html" ]; then
    echo "   ✗ ERROR: No se encuentra index.html"
    echo "   Buscando en subdirectorios..."
    INDEX_LOCATION=$(find "$PUBLIC_HTML" -name "index.html" -type f | head -n 1)
    if [ -n "$INDEX_LOCATION" ]; then
        INDEX_DIR=$(dirname "$INDEX_LOCATION")
        echo "   Encontrado en: $INDEX_DIR"
        echo "   Moviendo archivos a la raíz..."
        cp -r "$INDEX_DIR"/* "$PUBLIC_HTML/"
        echo "   ✓ Archivos movidos"
    else
        echo "   ✗ No se encontró index.html en ningún lugar"
        echo "   Asegúrate de haber subido los archivos compilados"
        exit 1
    fi
else
    echo "   ✓ index.html encontrado"
fi

# Verificar assets
if [ -d "$PUBLIC_HTML/assets" ]; then
    echo "   ✓ Carpeta assets/ encontrada"
else
    echo "   ⚠ Advertencia: No se encuentra carpeta assets/"
fi

echo ""

# 4. CREAR .htaccess OPTIMIZADO
echo "4. Creando archivo .htaccess optimizado..."
cat > "$PUBLIC_HTML/.htaccess" << 'HTACCESS_EOF'
# Configuración Apache para Single Page Application (SPA)
# Generado automáticamente

# Habilitar RewriteEngine
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Forzar HTTP (desactivar HTTPS para evitar problemas con certificados)
    RewriteCond %{HTTPS} on
    RewriteRule ^(.*)$ http://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # No reescribir archivos o directorios existentes
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    
    # Redirigir todo a index.html para SPA
    RewriteRule ^(.*)$ index.html [QSA,L]
</IfModule>

# Configuración de tipos MIME
<IfModule mod_mime.c>
    AddType application/javascript .js
    AddType text/css .css
    AddType image/svg+xml .svg
    AddType application/json .json
    AddType application/manifest+json .webmanifest
</IfModule>

# Habilitar compresión
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Caché del navegador
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Seguridad
<IfModule mod_headers.c>
    # Prevenir clickjacking
    Header always set X-Frame-Options "SAMEORIGIN"
    
    # Prevenir MIME sniffing
    Header always set X-Content-Type-Options "nosniff"
    
    # Habilitar XSS Protection
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>

# Página de error personalizada (opcional)
ErrorDocument 404 /index.html

# Desactivar listado de directorios
Options -Indexes

# Proteger archivos sensibles
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>
HTACCESS_EOF

echo "   ✓ .htaccess creado"
echo ""

# 5. CONFIGURAR PERMISOS
echo "5. Configurando permisos correctos..."
# Permisos para directorios
find "$PUBLIC_HTML" -type d -exec chmod 755 {} \;
echo "   ✓ Directorios: 755"

# Permisos para archivos
find "$PUBLIC_HTML" -type f -exec chmod 644 {} \;
echo "   ✓ Archivos: 644"

# .htaccess debe ser 644
chmod 644 "$PUBLIC_HTML/.htaccess"
echo "   ✓ .htaccess: 644"
echo ""

# 6. VERIFICAR PHP (si existe)
echo "6. Verificando configuración PHP..."
if [ -f "$PUBLIC_HTML/.user.ini" ]; then
    echo "   ✓ .user.ini encontrado"
else
    echo "   Creando .user.ini básico..."
    cat > "$PUBLIC_HTML/.user.ini" << 'PHP_EOF'
; Configuración PHP
upload_max_filesize = 64M
post_max_size = 64M
max_execution_time = 300
max_input_time = 300
memory_limit = 256M
PHP_EOF
    echo "   ✓ .user.ini creado"
fi
echo ""

# 7. LIMPIAR CACHÉ
echo "7. Limpiando caché..."
if [ -d "$PUBLIC_HTML/.cache" ]; then
    rm -rf "$PUBLIC_HTML/.cache"
    echo "   ✓ Caché eliminado"
fi
echo ""

# 8. VERIFICACIÓN FINAL
echo "8. Verificación final de archivos..."
echo ""
echo "Archivos en $PUBLIC_HTML:"
ls -lh "$PUBLIC_HTML" | grep -v "^total" | awk '{print "   " $9 " (" $5 ")"}'
echo ""

# 9. INFORMACIÓN DE CONFIGURACIÓN
echo "=========================================="
echo "  ✓ CONFIGURACIÓN COMPLETADA"
echo "=========================================="
echo ""
echo "Dominio: http://$DOMAIN"
echo "Directorio: $PUBLIC_HTML"
echo "Backup: $BACKUP_DIR"
echo ""
echo "Archivos importantes verificados:"
[ -f "$PUBLIC_HTML/index.html" ] && echo "  ✓ index.html" || echo "  ✗ index.html FALTANTE"
[ -f "$PUBLIC_HTML/.htaccess" ] && echo "  ✓ .htaccess" || echo "  ✗ .htaccess FALTANTE"
[ -d "$PUBLIC_HTML/assets" ] && echo "  ✓ assets/" || echo "  ⚠ assets/ no encontrado"
[ -f "$PUBLIC_HTML/manifest.json" ] && echo "  ✓ manifest.json" || echo "  ⚠ manifest.json no encontrado"
echo ""
echo "=========================================="
echo "  PRÓXIMOS PASOS"
echo "=========================================="
echo ""
echo "1. Visita tu sitio: http://$DOMAIN"
echo "2. Limpia el caché del navegador (Ctrl+Shift+R)"
echo "3. Si no carga, revisa los logs:"
echo "   - Error log en cPanel"
echo "   - O ejecuta: tail -f ~/public_html/error_log"
echo ""
echo "4. Si sigue sin funcionar, verifica:"
echo "   - Que el dominio apunte a este servidor"
echo "   - Configuración DNS en GoDaddy"
echo "   - Que no haya redirecciones en cPanel"
echo ""
