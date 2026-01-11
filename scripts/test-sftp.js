#!/usr/bin/env node
/**
 * Test SFTP con diferentes configuraciones de SSH
 */

const SftpClient = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const {
    FTP_HOST,
    FTP_USER,
    FTP_PASSWORD,
    SSH_KEY_PATH = 'priv'
} = process.env;

console.log('🔍 Probando conexión SFTP...\n');

async function testSFTP(config, label) {
    console.log(`📡 Intentando: ${label}`);
    console.log('─'.repeat(55));

    const sftp = new SftpClient();

    try {
        await sftp.connect(config);
        console.log(`✅ ¡ÉXITO! ${label} funciona`);

        const pwd = await sftp.pwd();
        console.log(`📁 Directorio: ${pwd}`);

        const list = await sftp.list(pwd);
        console.log(`📂 Archivos encontrados: ${list.length}`);
        list.slice(0, 3).forEach(item => {
            console.log(`   - ${item.name}`);
        });

        await sftp.end();
        console.log('');
        return true;

    } catch (err) {
        console.log(`❌ Error: ${err.message.split('\n')[0]}`);
        await sftp.end();
        console.log('');
        return false;
    }
}

async function main() {
    const keyPath = path.join(__dirname, '..', SSH_KEY_PATH, 'id_rsa');
    const privateKey = fs.readFileSync(keyPath);
    const host = FTP_HOST.replace('ftp.', ''); // ksinsurancee.com

    console.log(`Host: ${host}`);
    console.log(`User: ${FTP_USER}`);
    console.log(`Key: ${keyPath}`);
    console.log('');

    const configs = [
        // 1. Con passphrase
        {
            host,
            port: 22,
            username: FTP_USER,
            privateKey,
            passphrase: FTP_PASSWORD,
            readyTimeout: 20000
        },
        // 2. Sin passphrase
        {
            host,
            port: 22,
            username: FTP_USER,
            privateKey,
            readyTimeout: 20000
        },
        // 3. Solo con password (sin clave)
        {
            host,
            port: 22,
            username: FTP_USER,
            password: FTP_PASSWORD,
            readyTimeout: 20000
        },
        // 4. Puerto alternativo con passphrase
        {
            host,
            port: 21098,
            username: FTP_USER,
            privateKey,
            passphrase: FTP_PASSWORD,
            readyTimeout: 20000
        }
    ];

    const labels = [
        'SSH Key + Passphrase (puerto 22)',
        'SSH Key sin Passphrase (puerto 22)',
        'Solo Password SSH (puerto 22)',
        'SSH Key + Passphrase (puerto 21098)'
    ];

    for (let i = 0; i < configs.length; i++) {
        const success = await testSFTP(configs[i], labels[i]);
        if (success) {
            console.log('═══════════════════════════════════════════════════════');
            console.log(`  ✅ CONFIGURACIÓN QUE FUNCIONA: ${labels[i]}`);
            console.log('═══════════════════════════════════════════════════════');
            return;
        }
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('  ❌ NINGUNA CONFIGURACIÓN FUNCIONÓ');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('💡 Puerto 22 (SSH/SFTP) está bloqueado por GoDaddy');
    console.log('   Usa el método manual con File Manager');
    console.log('');
}

main();
