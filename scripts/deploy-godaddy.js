#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const ftp = require('basic-ftp');
require('dotenv').config();

const {
    FTP_HOST = 'ftp.i6n.1db.mytemp.website',
    FTP_PORT = '21',
    FTP_USER = 'guillermo.krause@i6n.1db.mytemp.website',
    FTP_PASSWORD,
    FTP_REMOTE_PATH = '/public_html'
} = process.env;

async function uploadDirectory(client, localDir, remoteDir) {
    const files = fs.readdirSync(localDir);

    for (const file of files) {
        const localPath = path.join(localDir, file);
        const remotePath = path.posix.join(remoteDir, file);
        const stats = fs.statSync(localPath);

        if (stats.isDirectory()) {
            console.log(`📁 Creando directorio: ${remotePath}`);
            try {
                await client.ensureDir(remotePath);
            } catch (err) {
                console.warn(`Aviso al crear directorio ${remotePath}:`, err.message);
            }
            await uploadDirectory(client, localPath, remotePath);
        } else {
            console.log(`📄 Subiendo: ${file}`);
            await client.uploadFrom(localPath, remotePath);
        }
    }
}

async function deployGoDaddy() {
    const client = new ftp.Client();
    client.ftp.verbose = false; // Cambiar a true para más detalles

    try {
        // Verificar que existe dist/
        const distPath = path.join(__dirname, '..', 'dist');
        if (!fs.existsSync(distPath)) {
            console.error('❌ No existe el directorio dist/');
            console.log('💡 Ejecuta primero: npm run build');
            process.exit(1);
        }

        // Verificar que existe la contraseña
        if (!FTP_PASSWORD || FTP_PASSWORD.startsWith('REPLACE_WITH')) {
            console.error('❌ Falta FTP_PASSWORD en el archivo .env');
            process.exit(1);
        }

        console.log('🚀 Iniciando deploy a GoDaddy...');
        console.log(`📡 Conectando a ${FTP_HOST}:${FTP_PORT}...`);
        console.log(`👤 Usuario: ${FTP_USER}`);
        console.log(`📂 Destino: ${FTP_REMOTE_PATH}`);
        console.log(`🔑 Password length: ${FTP_PASSWORD ? FTP_PASSWORD.length : 0} chars`);

        // Conectar al servidor FTP
        await client.access({
            host: FTP_HOST,
            port: Number(FTP_PORT),
            user: FTP_USER,
            password: FTP_PASSWORD.replace(/^["']|["']$/g, ''), // Remover comillas si existen
            secure: false, // GoDaddy usa FTP estándar, no FTPS
            secureOptions: { rejectUnauthorized: false },
            connTimeout: 30000 // 30 segundos timeout
        });

        console.log('✅ Conectado exitosamente');

        // Navegar al directorio remoto
        console.log(`📂 Navegando a ${FTP_REMOTE_PATH}...`);
        try {
            await client.ensureDir(FTP_REMOTE_PATH);
            await client.cd(FTP_REMOTE_PATH);
        } catch (err) {
            console.error(`❌ Error al acceder a ${FTP_REMOTE_PATH}:`, err.message);
            console.log('💡 Verifica que el directorio existe en tu servidor GoDaddy');
            process.exit(1);
        }

        // Limpiar archivos antiguos (opcional - comentado por seguridad)
        // console.log('🧹 Limpiando archivos antiguos...');
        // await client.clearWorkingDir();

        // Subir archivos
        console.log('📤 Subiendo archivos desde dist/...');
        await uploadDirectory(client, distPath, FTP_REMOTE_PATH);

        console.log('');
        console.log('✅ ¡Deploy completado exitosamente!');
        console.log(`🌐 Tu sitio debería estar disponible pronto`);

    } catch (err) {
        console.error('');
        console.error('❌ Error durante el deploy:', err.message);
        console.error('');
        console.error('Detalles del error:');
        console.error(err);
        console.error('');
        console.error('💡 Soluciones posibles:');
        console.error('   1. Verifica que los datos de FTP en .env sean correctos');
        console.error('   2. Asegúrate de que el directorio remoto existe');
        console.error('   3. Verifica que tu contraseña FTP no haya caducado');
        console.error('   4. Intenta conectarte manualmente con FileZilla para probar');
        process.exit(1);
    } finally {
        client.close();
    }
}

// Ejecutar el deploy
deployGoDaddy();
