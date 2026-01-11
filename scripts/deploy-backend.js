// Script para desplegar backend al servidor via SFTP
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Client = require('ssh2-sftp-client');

const FTP_HOST = process.env.FTP_HOST;
const FTP_USER = process.env.FTP_USER;
const FTP_PASSWORD = process.env.FTP_PASSWORD;
const SSH_KEY_PATH = path.join(__dirname, '..', 'priv', 'id_rsa');
const REMOTE_PATH = 'public_html/api';
const LOCAL_BACKEND_DIR = path.join(__dirname, '..', 'backend');

console.log('═══════════════════════════════════════════════════════');
console.log('  📤 DEPLOY BACKEND AL SERVIDOR');
console.log('═══════════════════════════════════════════════════════');
console.log('');

async function deployBackend() {
    const sftp = new Client();

    try {
        console.log('🔑 Conectando via SFTP...');
        console.log(`   Host: ${FTP_HOST}`);
        console.log(`   User: ${FTP_USER}`);
        console.log('');

        // Try with SSH key first
        const configs = [
            {
                host: FTP_HOST,
                port: 22,
                username: FTP_USER,
                privateKey: fs.readFileSync(SSH_KEY_PATH),
                passphrase: FTP_PASSWORD,
                readyTimeout: 10000
            },
            {
                host: FTP_HOST,
                port: 22,
                username: FTP_USER,
                privateKey: fs.readFileSync(SSH_KEY_PATH),
                readyTimeout: 10000
            }
        ];

        let connected = false;
        for (let i = 0; i < configs.length && !connected; i++) {
            try {
                console.log(`🔌 Intento ${i + 1}/${configs.length}: Conectando...`);
                await sftp.connect(configs[i]);
                connected = true;
                console.log('✅ Conectado via SFTP\n');
            } catch (err) {
                if (i === configs.length - 1) throw err;
            }
        }

        // Get current directory
        const currentDir = await sftp.cwd();
        console.log(`📁 Directorio actual: ${currentDir}\n`);

        // Create api directory if not exists
        const apiPath = `${REMOTE_PATH}`;
        try {
            await sftp.mkdir(apiPath, true);
            console.log(`✅ Directorio creado: ${apiPath}\n`);
        } catch (err) {
            // Directory might already exist
            console.log(`📂 Directorio ya existe: ${apiPath}\n`);
        }

        // Create uploads directory
        const uploadsPath = `${apiPath}/uploads`;
        try {
            await sftp.mkdir(uploadsPath, true);
            console.log(`✅ Directorio uploads creado\n`);
        } catch (err) {
            console.log(`📂 Directorio uploads ya existe\n`);
        }

        // Files to upload
        const files = [
            'index.php',
            'config.php',
            'database.php',
            'auth.php',
            'email-service.php',
            'database-schema.sql',
            'README.md'
        ];

        console.log('📂 Subiendo archivos del backend:\n');

        for (const file of files) {
            const localFile = path.join(LOCAL_BACKEND_DIR, file);
            const remoteFile = `${apiPath}/${file}`;

            if (fs.existsSync(localFile)) {
                const stats = fs.statSync(localFile);
                const sizeKB = (stats.size / 1024).toFixed(2);

                await sftp.put(localFile, remoteFile);
                console.log(`   📄 ${file} (${sizeKB} KB)`);
            } else {
                console.log(`   ⚠️  ${file} no encontrado`);
            }
        }

        // Create .htaccess for API
        const htaccessContent = `# API Routing
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
<FilesMatch "(config|database|auth|email-service)\\.php$">
    Require all denied
</FilesMatch>
`;

        const htaccessPath = `${apiPath}/.htaccess`;
        await sftp.put(Buffer.from(htaccessContent), htaccessPath);
        console.log(`   📄 .htaccess (API routing)\n`);

        console.log('✅ Archivos del backend subidos exitosamente\n');

        await sftp.end();

        console.log('═══════════════════════════════════════════════════════');
        console.log('  ✅ DEPLOY BACKEND COMPLETADO');
        console.log('═══════════════════════════════════════════════════════');
        console.log('');
        console.log('📋 PRÓXIMOS PASOS:');
        console.log('');
        console.log('1️⃣  Crear base de datos MySQL en cPanel');
        console.log('   → Nombre: nhs13h5k_krause');
        console.log('   → Usuario: nhs13h5k_krauser');
        console.log('');
        console.log('2️⃣  Importar schema en phpMyAdmin');
        console.log('   → Archivo: database-schema.sql');
        console.log('');
        console.log('3️⃣  Actualizar credenciales en config.php');
        console.log('   → Editar via cPanel File Manager o SFTP');
        console.log('   → Actualizar DB_PASS, SMTP_PASS, secrets');
        console.log('');
        console.log('4️⃣  Crear email: notifications@ksinsurancee.com');
        console.log('   → cPanel → Email Accounts');
        console.log('');
        console.log('5️⃣  Probar API:');
        console.log('   → https://ksinsurancee.com/api/auth/login');
        console.log('');
        console.log('📖 Ver backend/README.md para instrucciones completas');
        console.log('');

    } catch (err) {
        console.log('');
        console.log('═══════════════════════════════════════════════════════');
        console.log('  ❌ ERROR EN EL DEPLOY DEL BACKEND');
        console.log('═══════════════════════════════════════════════════════');
        console.log('');
        console.error('Error:', err.message);
        console.log('');
        console.log('Verifica:');
        console.log('  • Credenciales SSH correctas');
        console.log('  • Servidor accesible');
        console.log('  • Permisos de escritura en public_html');
        console.log('');
        process.exit(1);
    }
}

deployBackend();
