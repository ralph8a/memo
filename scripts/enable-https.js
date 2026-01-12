const fs = require('fs');
const path = require('path');

console.log('🔒 Activando HTTPS Redirect en .htaccess...\n');

const htaccessPath = path.join(__dirname, '../public/.htaccess');
let content = fs.readFileSync(htaccessPath, 'utf8');

// Descomentar las líneas de HTTPS redirect
const httpsRedirect = `    # FORZAR HTTPS - SSL/TLS Activado
    RewriteCond %{HTTPS} off
    RewriteCond %{HTTP:X-Forwarded-Proto} !https
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]`;

const commentedRedirect = `    # FORZAR HTTPS - Activar cuando SSL esté disponible
    # Descomentar estas 3 líneas cuando tengas SSL activo:
    # RewriteCond %{HTTPS} off
    # RewriteCond %{HTTP:X-Forwarded-Proto} !https
    # RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]`;

if (content.includes(commentedRedirect)) {
    content = content.replace(commentedRedirect, httpsRedirect);
    fs.writeFileSync(htaccessPath, content, 'utf8');

    console.log('✅ HTTPS redirect activado en .htaccess');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. node scripts/deploy-winscp.js');
    console.log('   2. Verificar https://ksinsurancee.com');
    console.log('\n⚠️  Si ves "too many redirects":');
    console.log('   - El SSL aún no está activo en el servidor');
    console.log('   - Ejecuta: node scripts/disable-https.js');
    console.log('   - Sigue la guía: SSL-SETUP-GUIDE.md');
} else if (content.includes(httpsRedirect)) {
    console.log('✅ HTTPS redirect ya está activado');
} else {
    console.log('⚠️  No se encontró el bloque de configuración esperado');
    console.log('   Edita manualmente public/.htaccess líneas 7-11');
}
