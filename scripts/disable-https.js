const fs = require('fs');
const path = require('path');

console.log('🔓 Desactivando HTTPS Redirect en .htaccess...\n');

const htaccessPath = path.join(__dirname, '../public/.htaccess');
let content = fs.readFileSync(htaccessPath, 'utf8');

const httpsRedirect = `    # FORZAR HTTPS - SSL/TLS Activado
    RewriteCond %{HTTPS} off
    RewriteCond %{HTTP:X-Forwarded-Proto} !https
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]`;

const commentedRedirect = `    # FORZAR HTTPS - Activar cuando SSL esté disponible
    # Descomentar estas 3 líneas cuando tengas SSL activo:
    # RewriteCond %{HTTPS} off
    # RewriteCond %{HTTP:X-Forwarded-Proto} !https
    # RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]`;

if (content.includes(httpsRedirect)) {
    content = content.replace(httpsRedirect, commentedRedirect);
    fs.writeFileSync(htaccessPath, content, 'utf8');

    console.log('✅ HTTPS redirect desactivado');
    console.log('\n📋 El sitio ahora funciona en HTTP');
    console.log('   Deploy: node scripts/deploy-winscp.js');
    console.log('\n💡 Para activar SSL sigue: SSL-SETUP-GUIDE.md');
} else if (content.includes(commentedRedirect)) {
    console.log('✅ HTTPS redirect ya está desactivado');
} else {
    console.log('⚠️  No se encontró el bloque de configuración esperado');
}
