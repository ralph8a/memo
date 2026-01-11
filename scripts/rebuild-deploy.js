#!/usr/bin/env node
/**
 * Script de REBUILD y DEPLOY completo
 * Compila el proyecto y lo sube automáticamente al FTP
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ftp = require('basic-ftp');
require('dotenv').config();

const {
    FTP_HOST,
    FTP_PORT = '21',
    FTP_USER,
    FTP_PASSWORD,
    FTP_REMOTE_PATH = '/home/nhs13h5k0x0j/public_html'
} = process.env;

console.log('═══════════════════════════════════════════════════════');
console.log('  🚀 REBUILD & DEPLOY AUTOMÁTICO');
console.log('═══════════════════════════════════════════════════════');
console.log('');

// Función para subir directorio recursivamente
async function uploadDirectory(client, localDir, remoteDir) {
    const files = fs.readdirSync(localDir);

    for (const file of files) {
        const localPath = path.join(localDir, file);
        const remotePath = path.posix.join(remoteDir, file);
        const stats = fs.statSync(localPath);

        // Saltar el directorio .htaccess si es un directorio (webpack lo crea así a veces)
        if (stats.isDirectory() && file === '.htaccess') {
            console.log(`⚠️  Saltando directorio .htaccess`);
            continue;
        }

        if (stats.isDirectory()) {
            console.log(`📁 ${file}/`);
            try {
                await client.ensureDir(remotePath);
            } catch (err) {
                console.warn(`   ⚠️ ${err.message}`);
            }
            await uploadDirectory(client, localPath, remotePath);
        } else {
            const size = (stats.size / 1024).toFixed(2);
            console.log(`   📄 ${file} (${size} KB)`);
            await client.uploadFrom(localPath, remotePath);
        }
    }
}

async function main() {
    try {
        // PASO 1: BUILD
        console.log('📦 PASO 1/3: Compilando proyecto...');
        console.log('─'.repeat(55));
        execSync('npm run build', { stdio: 'inherit' });
        console.log('');
        console.log('✅ Compilación exitosa');
        console.log('');

        // Verificar que existe dist/
        const distPath = path.join(__dirname, '..', 'dist');
        if (!fs.existsSync(distPath)) {
            throw new Error('No se generó la carpeta dist/');
        }

        // Verificar .htaccess
        const htaccessPath = path.join(distPath, '.htaccess');
        const htaccessDirPath = path.join(distPath, '.htaccess', '.htaccess');

        if (fs.existsSync(htaccessDirPath)) {
            // Webpack lo creó como directorio, moverlo
            console.log('🔧 Corrigiendo .htaccess...');
            const content = fs.readFileSync(htaccessDirPath, 'utf8');
            fs.rmSync(path.join(distPath, '.htaccess'), { recursive: true, force: true });
            fs.writeFileSync(htaccessPath, content);
            console.log('✅ .htaccess corregido');
            console.log('');
        }

        // PASO 2: VALIDAR CREDENCIALES
        console.log('🔑 PASO 2/3: Verificando credenciales FTP...');
        console.log('─'.repeat(55));

        if (!FTP_PASSWORD || FTP_PASSWORD.startsWith('REPLACE')) {
            throw new Error('Falta FTP_PASSWORD en .env');
        }

        console.log(`   Host: ${FTP_HOST}:${FTP_PORT}`);
        console.log(`   User: ${FTP_USER}`);
        console.log(`   Dest: ${FTP_REMOTE_PATH}`);
        console.log('');

        // PASO 3: DEPLOY
        console.log('📤 PASO 3/3: Subiendo archivos al servidor...');
        console.log('─'.repeat(55));

        const client = new ftp.Client();
        client.ftp.verbose = false;

        try {
            // Conectar
            console.log('🔌 Conectando con TLS explícito (modo CoreFTP)...');
            await client.access({
                host: FTP_HOST,
                port: Number(FTP_PORT),
                user: FTP_USER,
                password: FTP_PASSWORD,
                secure: 'explicit',  // TLS explícito como CoreFTP
                secureOptions: {
                    rejectUnauthorized: false
                },
                connTimeout: 60000,
                pasvTimeout: 60000,
                keepalive: 30000
            });
            console.log('✅ Conectado');
            console.log('');

            // Navegar al directorio remoto
            await client.ensureDir(FTP_REMOTE_PATH);
            await client.cd(FTP_REMOTE_PATH);

            // Subir archivos
            console.log('📂 Subiendo archivos:');
            await uploadDirectory(client, distPath, FTP_REMOTE_PATH);

            console.log('');
            console.log('✅ Archivos subidos exitosamente');

        } finally {
            client.close();
        }

        // RESUMEN FINAL
        console.log('');
        console.log('═══════════════════════════════════════════════════════');
        console.log('  ✅ DEPLOY COMPLETADO EXITOSAMENTE');
        console.log('═══════════════════════════════════════════════════════');
        console.log('');
        console.log('🌐 Tu sitio debería estar disponible en:');
        console.log('   → http://i6n.1db.mytemp.website');
        console.log('');
        console.log('📝 Próximos pasos:');
        console.log('   1. Abre el sitio en modo incógnito');
        console.log('   2. Limpia caché: Ctrl + Shift + R');
        console.log('   3. Verifica que cargue con HTTP (sin HTTPS)');
        console.log('');

    } catch (error) {
        console.error('');
        console.error('═══════════════════════════════════════════════════════');
        console.error('  ❌ ERROR EN EL DEPLOY');
        console.error('═══════════════════════════════════════════════════════');
        console.error('');
        console.error('Error:', error.message);
        console.error('');

        if (error.message.includes('530') || error.message.includes('authentication')) {
            console.error('💡 Problema de autenticación FTP:');
            console.error('   1. Verifica usuario y contraseña en .env');
            console.error('   2. Resetea la contraseña en cPanel > FTP Accounts');
            console.error('   3. O sube manualmente vía File Manager');
        } else if (error.message.includes('build')) {
            console.error('💡 Problema en compilación:');
            console.error('   - Revisa errores de webpack arriba');
            console.error('   - Verifica que no haya errores de sintaxis');
        } else {
            console.error('💡 Soluciones:');
            console.error('   - Sube manualmente dist/ con File Manager');
            console.error('   - Verifica conexión a internet');
            console.error('   - Contacta a soporte de GoDaddy');
        }
        console.error('');
        process.exit(1);
    }
}

main();
