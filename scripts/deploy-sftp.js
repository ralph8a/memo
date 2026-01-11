#!/usr/bin/env node
/**
 * DEPLOY con SFTP usando claves SSH
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const SftpClient = require('ssh2-sftp-client');
require('dotenv').config();

const {
    FTP_HOST,
    FTP_PORT = '22',
    FTP_USER,
    FTP_PASSWORD,
    FTP_REMOTE_PATH = '/public_html',
    SSH_KEY_PATH = 'priv'
} = process.env;

console.log('═══════════════════════════════════════════════════════');
console.log('  🚀 REBUILD & DEPLOY con SFTP (SSH)');
console.log('═══════════════════════════════════════════════════════');
console.log('');

// Función para subir directorio recursivamente
async function uploadDirectory(sftp, localDir, remoteDir) {
    const files = fs.readdirSync(localDir);

    // Asegurar que existe el directorio remoto
    try {
        await sftp.mkdir(remoteDir, true);
    } catch (err) {
        // Ya existe, continuar
    }

    for (const file of files) {
        const localPath = path.join(localDir, file);
        const remotePath = path.posix.join(remoteDir, file);
        const stats = fs.statSync(localPath);

        // Saltar .htaccess si es directorio
        if (stats.isDirectory() && file === '.htaccess') {
            console.log(`⚠️  Saltando directorio .htaccess`);
            continue;
        }

        if (stats.isDirectory()) {
            console.log(`📁 ${file}/`);
            await uploadDirectory(sftp, localPath, remotePath);
        } else {
            const size = (stats.size / 1024).toFixed(2);
            console.log(`   📄 ${file} (${size} KB)`);
            await sftp.put(localPath, remotePath);
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

        // Verificar dist/
        const distPath = path.join(__dirname, '..', 'dist');
        if (!fs.existsSync(distPath)) {
            throw new Error('No se generó la carpeta dist/');
        }

        // Corregir .htaccess
        const htaccessPath = path.join(distPath, '.htaccess');
        const htaccessDirPath = path.join(distPath, '.htaccess', '.htaccess');

        if (fs.existsSync(htaccessDirPath)) {
            console.log('🔧 Corrigiendo .htaccess...');
            const content = fs.readFileSync(htaccessDirPath, 'utf8');
            fs.rmSync(path.join(distPath, '.htaccess'), { recursive: true, force: true });
            fs.writeFileSync(htaccessPath, content);
            console.log('✅ .htaccess corregido');
            console.log('');
        }

        // PASO 2: PREPARAR SSH
        console.log('🔑 PASO 2/3: Preparando conexión SSH...');
        console.log('─'.repeat(55));

        const keyPath = path.join(__dirname, '..', SSH_KEY_PATH, 'id_rsa');
        if (!fs.existsSync(keyPath)) {
            throw new Error(`No se encuentra la clave SSH: ${keyPath}`);
        }

        console.log(`   Host: ${FTP_HOST}`);
        console.log(`   User: ${FTP_USER}`);
        console.log(`   Key: ${keyPath}`);
        console.log(`   Dest: ${FTP_REMOTE_PATH}`);
        console.log('');

        // PASO 3: DEPLOY
        console.log('📤 PASO 3/3: Subiendo archivos via SFTP...');
        console.log('─'.repeat(55));

        const sftp = new SftpClient();
        const privateKey = fs.readFileSync(keyPath);

        // Intentar diferentes configuraciones
        const configs = [
            // Con passphrase de la clave SSH
            {
                host: FTP_HOST,
                port: Number(FTP_PORT),
                username: FTP_USER,
                privateKey: privateKey,
                passphrase: FTP_PASSWORD,
                readyTimeout: 60000,
                algorithms: {
                    serverHostKey: ['ssh-rsa', 'rsa-sha2-512', 'rsa-sha2-256', 'ssh-dss'],
                }
            },
            // Sin passphrase
            {
                host: FTP_HOST,
                port: Number(FTP_PORT),
                username: FTP_USER,
                privateKey: privateKey,
                readyTimeout: 60000,
                algorithms: {
                    serverHostKey: ['ssh-rsa', 'rsa-sha2-512', 'rsa-sha2-256', 'ssh-dss'],
                }
            }
        ];

        let connected = false;
        let lastError = null;

        for (let i = 0; i < configs.length; i++) {
            try {
                console.log(`🔌 Intento ${i + 1}/${configs.length}: Conectando con SFTP...`);
                await sftp.connect(configs[i]);
                console.log('✅ Conectado via SFTP');
                console.log('');
                connected = true;
                break;
            } catch (err) {
                lastError = err;
                console.log(`❌ Intento ${i + 1} falló: ${err.message.split('\n')[0]}`);
                if (i < configs.length - 1) {
                    console.log('   Probando siguiente configuración...');
                }
            }
        }

        if (!connected) {
            throw lastError || new Error('No se pudo conectar con ninguna configuración');
        }

        try {
            const pwd = await sftp.cwd();
            console.log(`📁 Directorio actual: ${pwd}`);
            console.log('');

            // Subir archivos
            console.log('📂 Subiendo archivos:');
            await uploadDirectory(sftp, distPath, FTP_REMOTE_PATH);

            console.log('');
            console.log('✅ Archivos subidos exitosamente');

        } finally {
            await sftp.end();
        }

        // RESUMEN
        console.log('');
        console.log('═══════════════════════════════════════════════════════');
        console.log('  ✅ DEPLOY COMPLETADO EXITOSAMENTE');
        console.log('═══════════════════════════════════════════════════════');
        console.log('');
        console.log('🌐 Tu sitio debería estar disponible en:');
        console.log('   → http://ksinsurancee.com');
        console.log('');

    } catch (err) {
        console.log('');
        console.log('═══════════════════════════════════════════════════════');
        console.log('  ❌ ERROR EN EL DEPLOY');
        console.log('═══════════════════════════════════════════════════════');
        console.log('');
        console.log('Error:', err.message);
        console.log('');

        if (err.message.includes('Cannot parse privateKey')) {
            console.log('💡 La clave SSH está encriptada o es inválida');
            console.log('   Verifica que el archivo id_rsa sea correcto');
        } else if (err.message.includes('All configured authentication')) {
            console.log('💡 Autenticación SSH fallida:');
            console.log('   - Verifica que la clave pública esté en el servidor');
            console.log('   - Prueba con la contraseña si no funciona la clave');
        } else if (err.message.includes('ECONNREFUSED') || err.message.includes('Timed out')) {
            console.log('💡 Puerto 22 (SSH) bloqueado o inaccesible');
            console.log('   - Usa el método manual (File Manager)');
        }
        console.log('');

        process.exit(1);
    }
}

main();
