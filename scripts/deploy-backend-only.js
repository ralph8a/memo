#!/usr/bin/env node
/**
 * Deploy backend/index.php via SSH2
 */

const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('═══════════════════════════════════════════════════════');
console.log('  📤 BACKEND DEPLOY via SSH2');
console.log('═══════════════════════════════════════════════════════\n');

const pemKeyPath = path.join(__dirname, '..', 'nhs13h5k0x0j_pem');
const backendFile = path.join(__dirname, '..', 'backend', 'index.php');
const remotePath = 'public_html/backend/index.php';

if (!fs.existsSync(pemKeyPath)) {
    console.log('❌ Clave SSH no encontrada:', pemKeyPath);
    process.exit(1);
}

if (!fs.existsSync(backendFile)) {
    console.log('❌ Archivo backend/index.php no encontrado');
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

        console.log('📤 Subiendo backend/index.php...\n');

        const readStream = fs.createReadStream(backendFile);
        const writeStream = sftp.createWriteStream(remotePath);

        writeStream.on('close', () => {
            console.log('═══════════════════════════════════════════════════════');
            console.log('  ✅ DEPLOY EXITOSO');
            console.log('═══════════════════════════════════════════════════════\n');
            console.log('📊 backend/index.php actualizado');
            console.log('🌐 API: https://ksinsurancee.com/backend/index.php\n');
            conn.end();
        });

        writeStream.on('error', (err) => {
            console.error('❌ Error al subir archivo:', err.message);
            conn.end();
            process.exit(1);
        });

        readStream.pipe(writeStream);
    });
}).connect({
    host: 'ksinsurancee.com',
    port: 22,
    username: 'nhs13h5k0x0j',
    privateKey: privateKey
});

conn.on('error', (err) => {
    console.error('❌ Error de conexión SSH:', err.message);
    process.exit(1);
});
