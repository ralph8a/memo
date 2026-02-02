#!/usr/bin/env node
/**
 * Deploy backend via SSH2 usando clave PEM
 */

const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('═══════════════════════════════════════════════════════');
console.log('  📤 DEPLOY via SSH2');
console.log('═══════════════════════════════════════════════════════');
console.log('');

const pemKeyPath = path.join(__dirname, '..', 'nhs13h5k0x0j_pem');
const backendFilePath = path.join(__dirname, '..', 'backend', 'api-endpoints.php');
const remoteDir = 'public_html/backend';
const remoteFile = `${remoteDir}/api-endpoints.php`;
const remoteBackup = `${remoteDir}/api-endpoints.php.backup`;

if (!fs.existsSync(pemKeyPath)) {
    console.log('❌ Clave SSH no encontrada:', pemKeyPath);
    process.exit(1);
}

if (!fs.existsSync(backendFilePath)) {
    console.log('❌ Archivo api-endpoints.php no encontrado:', backendFilePath);
    process.exit(1);
}

const privateKey = fs.readFileSync(pemKeyPath);
const fileContent = fs.readFileSync(backendFilePath);

const conn = new Client();

conn.on('ready', () => {
    console.log('✅ Conectado via SSH\n');
    console.log('📋 Pasos:');
    console.log('  1. Verificar/crear directorio backend');
    console.log('  2. Subir nuevo api-endpoints.php');
    console.log('  3. Verificar subida\n');

    // PASO 1: Crear directorio si no existe
    console.log('📁 Creando directorio backend...');
    conn.exec(`mkdir -p ${remoteDir} && echo "OK"`, (err, stream) => {
        if (err) {
            console.error('❌ Error:', err.message);
            conn.end();
            process.exit(1);
        }

        stream.on('data', (data) => {
            console.log('stdout:', data.toString().trim());
        });

        stream.stderr.on('data', (data) => {
            console.log('stderr:', data.toString().trim());
        });

        stream.on('close', (code, signal) => {
            console.log(`✅ Comando completado (code: ${code})\n`);

            // PASO 2: Subir archivo
            console.log('📤 Subiendo api-endpoints.php...');
            conn.sftp((err, sftp) => {
                if (err) {
                    console.error('❌ Error SFTP:', err.message);
                    conn.end();
                    process.exit(1);
                }

                const writeStream = sftp.createWriteStream(remoteFile);

                writeStream.on('close', () => {
                    console.log('✅ Archivo subido\n');

                    // PASO 3: Verificar
                    console.log('🔍 Verificando archivo...');
                    conn.exec(`ls -lh ${remoteFile}`, (err, stream) => {
                        if (err) {
                            console.error('❌ Error verificando:', err.message);
                            conn.end();
                            process.exit(1);
                        }

                        stream.on('data', (data) => {
                            console.log(data.toString().trim());
                        });

                        stream.on('close', () => {
                            console.log('\n═══════════════════════════════════════════════════════');
                            console.log('  ✅ DEPLOY EXITOSO');
                            console.log('═══════════════════════════════════════════════════════');
                            console.log('\n🌐 Prueba: https://ksinsurancee.com\n');
                            conn.end();
                        });
                    });
                });

                writeStream.on('error', (err) => {
                    console.error('❌ Error escribiendo archivo:', err.message);
                    conn.end();
                    process.exit(1);
                });

                writeStream.write(fileContent);
                writeStream.end();
            });
        });
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
