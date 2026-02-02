#!/usr/bin/env node
/**
 * Deploy usando FTP tradicional
 */

const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function deploy() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  📤 DEPLOY con FTP');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    const distPath = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(distPath)) {
        console.log('❌ Carpeta dist/ no existe. Ejecuta npm run build primero.\n');
        process.exit(1);
    }

    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        console.log('📡 Conectando al servidor FTP...\n');

        await client.access({
            host: process.env.FTP_HOST || '208.109.62.140',
            user: process.env.FTP_USER || 'nhs13h5k0x0j',
            password: process.env.FTP_PASSWORD || '',
            secure: false,
            port: 21
        });

        console.log('✅ Conectado\n');
        console.log('📁 Cambiando a directorio remoto...\n');

        const remotePath = process.env.FTP_REMOTE_PATH || 'public_html';
        await client.ensureDir(remotePath);

        console.log('📤 Subiendo archivos...\n');
        await client.uploadFromDir(distPath);

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  ✅ DEPLOY EXITOSO');
        console.log('═══════════════════════════════════════════════════════');
        console.log('\n🌐 Sitio: https://ksinsurancee.com\n');

    } catch (error) {
        console.error('\n❌ Error FTP:', error.message);
        process.exit(1);
    } finally {
        client.close();
    }
}

deploy();
