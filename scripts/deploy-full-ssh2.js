#!/usr/bin/env node
/**
 * Full deploy via SSH2 - sube toda la carpeta dist
 */

const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('═══════════════════════════════════════════════════════');
console.log('  📤 FULL DEPLOY via SSH2');
console.log('═══════════════════════════════════════════════════════');
console.log('');

const pemKeyPath = path.join(__dirname, '..', 'nhs13h5k0x0j_pem');
const distPath = path.join(__dirname, '..', 'dist');
const remotePath = 'public_html';

if (!fs.existsSync(pemKeyPath)) {
    console.log('❌ Clave SSH no encontrada:', pemKeyPath);
    process.exit(1);
}

if (!fs.existsSync(distPath)) {
    console.log('❌ Carpeta dist/ no encontrada. Ejecuta npm run build primero.');
    process.exit(1);
}

const privateKey = fs.readFileSync(pemKeyPath);
const conn = new Client();

conn.on('ready', () => {
    console.log('✅ Conectado via SSH\n');

    conn.sftp((err, sftp) => {
        if (err) {
            console.error('❌ Error SFTP:', err.message);
            conn.end();
            process.exit(1);
        }

        console.log('📤 Subiendo archivos...\n');

        const filesToUpload = [];

        function scanDirectory(localDir, remoteDir) {
            const items = fs.readdirSync(localDir);

            items.forEach(item => {
                const localItem = path.join(localDir, item);
                const remoteItem = `${remoteDir}/${item}`;
                const stats = fs.statSync(localItem);

                if (stats.isDirectory()) {
                    if (!item.startsWith('.')) {
                        scanDirectory(localItem, remoteItem);
                    }
                } else {
                    filesToUpload.push({
                        local: localItem,
                        remote: remoteItem
                    });
                }
            });
        }

        scanDirectory(distPath, remotePath);

        console.log(`📦 Total archivos a subir: ${filesToUpload.length}\n`);

        let uploadedCount = 0;

        function uploadNext() {
            if (uploadedCount >= filesToUpload.length) {
                console.log('\n═══════════════════════════════════════════════════════');
                console.log('  ✅ DEPLOY EXITOSO');
                console.log('═══════════════════════════════════════════════════════');
                console.log(`\n📊 ${uploadedCount} archivos subidos`);
                console.log('🌐 Prueba: https://ksinsurancee.com\n');
                conn.end();
                return;
            }

            const file = filesToUpload[uploadedCount];
            const fileName = path.basename(file.local);

            // Crear directorio remoto si no existe
            const remoteDir = path.dirname(file.remote);

            sftp.mkdir(remoteDir, { recursive: true }, (err) => {
                // Ignorar error si ya existe

                const readStream = fs.createReadStream(file.local);
                const writeStream = sftp.createWriteStream(file.remote);

                writeStream.on('close', () => {
                    uploadedCount++;
                    const progress = Math.round((uploadedCount / filesToUpload.length) * 100);
                    console.log(`[${progress}%] ✓ ${fileName}`);
                    uploadNext();
                });

                writeStream.on('error', (err) => {
                    console.error(`❌ Error subiendo ${fileName}:`, err.message);
                    uploadedCount++;
                    uploadNext();
                });

                readStream.pipe(writeStream);
            });
        }

        uploadNext();
    });
});

conn.on('error', (err) => {
    console.error('❌ Error SSH:', err.message);
    process.exit(1);
});

console.log('🔐 Conectando al servidor...\n');

conn.connect({
    host: process.env.FTP_HOST,
    port: 22,
    username: process.env.FTP_USER,
    privateKey: privateKey,
    passphrase: process.env.SSH_KEY_PASSPHRASE || '12345678'
});
