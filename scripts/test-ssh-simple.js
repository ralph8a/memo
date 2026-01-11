#!/usr/bin/env node
/**
 * Test simple de conexión SSH sin claves
 */

const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const {
    FTP_HOST,
    FTP_PORT,
    FTP_USER,
    FTP_PASSWORD
} = process.env;

console.log('🔍 Probando conexión SSH directa...\n');
console.log(`Host: ${FTP_HOST}:${FTP_PORT}`);
console.log(`User: ${FTP_USER}\n`);

const conn = new Client();

conn.on('ready', () => {
    console.log('✅ ¡CONEXIÓN SSH EXITOSA!\n');

    conn.sftp((err, sftp) => {
        if (err) {
            console.log('❌ Error SFTP:', err.message);
            conn.end();
            return;
        }

        console.log('✅ Canal SFTP abierto\n');

        sftp.realpath('.', (err, absPath) => {
            if (err) {
                console.log('❌ Error obteniendo path:', err.message);
            } else {
                console.log(`📁 Directorio actual: ${absPath}\n`);
            }

            sftp.readdir('.', (err, list) => {
                if (err) {
                    console.log('❌ Error listando:', err.message);
                } else {
                    console.log(`📂 Contenido (${list.length} items):`);
                    list.slice(0, 10).forEach(item => {
                        const type = item.attrs.isDirectory() ? '📁' : '📄';
                        console.log(`   ${type} ${item.filename}`);
                    });
                }

                console.log('\n═══════════════════════════════════════════════════════');
                console.log('  ✅ CONEXIÓN FUNCIONANDO - LISTO PARA DEPLOY');
                console.log('═══════════════════════════════════════════════════════\n');

                conn.end();
            });
        });
    });
}).on('error', (err) => {
    console.log('❌ Error de conexión:', err.message);
    console.log('\nDetalles:', err.level || err.code || 'N/A');
}).connect({
    host: FTP_HOST,
    port: parseInt(FTP_PORT),
    username: FTP_USER,
    password: FTP_PASSWORD,
    readyTimeout: 30000,
    algorithms: {
        serverHostKey: ['ssh-rsa', 'ssh-dss', 'ecdsa-sha2-nistp256', 'ecdsa-sha2-nistp384', 'ecdsa-sha2-nistp521'],
    }
});
