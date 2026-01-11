#!/bin/bash
# Script para SOLUCIONAR problemas de SSL/HTTPS
# Ejecutar desde Terminal SSH de cPanel cuando el sitio no carga por problemas de certificados

echo "=========================================="
echo "  SOLUCIONADOR DE PROBLEMAS SSL/HTTPS"
echo "=========================================="
echo ""

PUBLIC_HTML="/home/nhs13h5k0x0j/public_html"
DOMAIN="i6n.1db.mytemp.website"

echo "Dominio: $DOMAIN"
echo "Directorio: $PUBLIC_HTML"
echo ""

# 1. Backup del .htaccess actual
echo "1. Creando backup de .htaccess..."
if [ -f "$PUBLIC_HTML/.htaccess" ]; then
    cp "$PUBLIC_HTML/.htaccess" "$PUBLIC_HTML/.htaccess.backup.$(date +%Y%m%d_%H%M%S)"
    echo "   ✓ Backup creado"
else
    echo "   ⚠ No existe .htaccess previo"
fi
echo ""

# 2. Crear .htaccess SIMPLE sin SSL
echo "2. Creando .htaccess SIN forzar HTTPS..."
cat > "$PUBLIC_HTML/.htaccess" << 'EOF'
# Configuración básica para SPA - SIN SSL

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # FORZAR HTTP (NO HTTPS) - Soluciona problemas de certificados
    RewriteCond %{HTTPS} on
    RewriteRule ^(.*)$ http://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # Redirigir todo a index.html (excepto archivos existentes)
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.html [QSA,L]
</IfModule>

# Tipos MIME básicos
<IfModule mod_mime.c>
    AddType application/javascript .js
    AddType text/css .css
    AddType application/json .json
</IfModule>

# Desactivar listado de directorios
Options -Indexes

# Página de error a index.html
ErrorDocument 404 /index.html
EOF

echo "   ✓ .htaccess creado (forzando HTTP)"
echo ""

# 3. Verificar redirecciones en cPanel
echo "3. Verificando archivo de redirecciones..."
if [ -f "$PUBLIC_HTML/.htaccess.redirects" ]; then
    echo "   ⚠ Encontrado archivo de redirecciones"
    mv "$PUBLIC_HTML/.htaccess.redirects" "$PUBLIC_HTML/.htaccess.redirects.disabled"
    echo "   ✓ Desactivado temporalmente"
else
    echo "   ✓ Sin redirecciones adicionales"
fi
echo ""

# 4. Eliminar configuraciones SSL automáticas
echo "4. Limpiando configuraciones SSL automáticas..."
if [ -f "$PUBLIC_HTML/.htaccess.ssl" ]; then
    mv "$PUBLIC_HTML/.htaccess.ssl" "$PUBLIC_HTML/.htaccess.ssl.backup"
    echo "   ✓ Configuración SSL desactivada"
fi
echo ""

# 5. Verificar index.html
echo "5. Verificando index.html..."
if [ -f "$PUBLIC_HTML/index.html" ]; then
    SIZE=$(stat -f%z "$PUBLIC_HTML/index.html" 2>/dev/null || stat -c%s "$PUBLIC_HTML/index.html" 2>/dev/null || echo "0")
    echo "   ✓ index.html encontrado (${SIZE} bytes)"
else
    echo "   ✗ ERROR: index.html NO ENCONTRADO"
    echo "   Debes subir tus archivos primero"
fi
echo ""

# 6. Permisos
echo "6. Verificando permisos..."
chmod 644 "$PUBLIC_HTML/.htaccess" 2>/dev/null && echo "   ✓ .htaccess: 644"
chmod 644 "$PUBLIC_HTML/index.html" 2>/dev/null && echo "   ✓ index.html: 644"
chmod 755 "$PUBLIC_HTML" 2>/dev/null && echo "   ✓ public_html: 755"
echo ""

# 7. Limpiar caché
echo "7. Limpiando caché del servidor..."
if [ -d "$PUBLIC_HTML/.cache" ]; then
    rm -rf "$PUBLIC_HTML/.cache"
fi
if [ -d "$PUBLIC_HTML/cache" ]; then
    rm -rf "$PUBLIC_HTML/cache"
fi
echo "   ✓ Caché limpiado"
echo ""

echo "=========================================="
echo "  ✓ SOLUCIÓN APLICADA"
echo "=========================================="
echo ""
echo "El sitio ahora debería cargar SIN HTTPS"
echo ""
echo "ACCEDE A TU SITIO CON HTTP (sin 's'):"
echo "  → http://$DOMAIN"
echo ""
echo "NO uses: https://$DOMAIN"
echo ""
echo "=========================================="
echo "  INSTRUCCIONES"
echo "=========================================="
echo ""
echo "1. Abre tu navegador en modo incógnito"
echo "2. Visita: http://$DOMAIN (sin https)"
echo "3. Limpia caché del navegador: Ctrl+Shift+R"
echo ""
echo "Si aún no carga:"
echo "  - Verifica que el dominio apunte a este servidor"
echo "  - Espera 5-10 minutos (propagación)"
echo "  - Revisa los logs: tail -f ~/logs/error_log"
echo ""
echo "Para HABILITAR SSL más tarde:"
echo "  1. Instala certificado SSL en cPanel"
echo "  2. Edita .htaccess y cambia las reglas de HTTP a HTTPS"
echo ""
