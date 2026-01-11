#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const ftp = require('basic-ftp');
const SFTPClient = require('ssh2-sftp-client');
require('dotenv').config();

const {
    FTP_PROTOCOL = 'sftp',
    FTP_HOST = 'ftp.i6n.1db.mytemp.website',
    FTP_PORT = '22',
    FTP_USER = 'nhs13h5k0x0j',
    FTP_PASSWORD,
    FTP_REMOTE_PATH = '/home/nhs13h5k0x0j/public_html',
    FTP_SECURE = 'true',
    SSH_KEY_PATH = 'priv'
} = process.env;

async function deploySftp(distPath) {
    const client = new SFTPClient();
    try {
        console.log(`Conectando por SFTP a ${FTP_HOST}:${FTP_PORT} ...`);

        // Configuración de conexión - probar con contraseña primero
        const connectConfig = {
            host: FTP_HOST,
            port: Number(FTP_PORT),
            username: FTP_USER,
            password: FTP_PASSWORD,
            readyTimeout: 30000,
            algorithms: {
                serverHostKey: ['ssh-rsa', 'ssh-dss']
            }
        };

        console.log('Usando autenticación por contraseña SFTP');
        await client.connect(connectConfig);

        await client.mkdir(FTP_REMOTE_PATH, true);
        console.log('Limpiando directorio remoto...');
        try {
            const items = await client.list(FTP_REMOTE_PATH);
            for (const item of items) {
                const remoteItem = path.posix.join(FTP_REMOTE_PATH, item.name);
                if (item.type === 'd') {
                    await client.rmdir(remoteItem, true);
                } else {
                    await client.delete(remoteItem);
                }
            }
        } catch (e) {
            console.warn('Aviso al limpiar remoto (continuando):', e.message);
        }

        console.log('Subiendo dist/ ...');
        await client.uploadDir(distPath, FTP_REMOTE_PATH);
        console.log('✅ Deploy SFTP completado');
    } finally {
        client.end();
    }
}

async function deployFtp(distPath) {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        console.log(`Conectando por FTP/FTPS a ${FTP_HOST}:${FTP_PORT} ...`);
        await client.access({
            host: FTP_HOST,
            port: Number(FTP_PORT),
            user: FTP_USER,
            password: FTP_PASSWORD,
            secure: FTP_SECURE === 'true' ? true : FTP_SECURE,
            secureOptions: { rejectUnauthorized: false },
            passive: true
        });
        await client.ensureDir(FTP_REMOTE_PATH || '/');
        await client.clearWorkingDir();
        console.log('Subiendo dist/ ...');
        await client.uploadFromDir(distPath);
        console.log('✅ Deploy FTP/FTPS completado');
    } finally {
        client.close();
    }
}

async function main() {
    if (!FTP_PASSWORD || FTP_PASSWORD.startsWith('REPLACE_WITH')) {
        console.error('❌ Falta FTP_PASSWORD. Establécelo en .env o export FTP_PASSWORD=...');
        process.exit(1);
    }

    const distPath = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(distPath)) {
        console.error('❌ No existe dist/. Ejecuta "npm run build" primero.');
        process.exit(1);
    }

    try {
        if ((FTP_PROTOCOL || '').toLowerCase() === 'sftp') {
            await deploySftp(distPath);
        } else {
            await deployFtp(distPath);
        }
    } catch (err) {
        console.error('❌ Error en deploy:', err.message);
        process.exit(1);
    }
}

main();
