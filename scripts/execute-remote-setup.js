const https = require('https');
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Ignorar certificado auto-firmado
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

console.log('🚀 Ejecutando configuración remota en el servidor...\n');

// PASO 1: Ejecutar SQL via HTTPS
console.log('📊 PASO 1: Ejecutando script SQL de datos demo...');
const url = 'https://ksinsurancee.com/backend/execute-demo-data.php?key=demo2026';

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('\n✅ Respuesta del servidor:');
        console.log(data);

        // PASO 2: Configurar via SSH
        setupSSH();
    });
}).on('error', (err) => {
    console.error('❌ Error ejecutando SQL:', err.message);
    console.log('\n⚠️  Continuando con configuración SSH...');
    setupSSH();
});

function setupSSH() {
    console.log('\n📂 PASO 2: Creando directorios y configurando cronjobs...');

    const conn = new Client();

    conn.on('ready', () => {
        console.log('✅ Conectado via SSH\n');

        // Crear directorios
        const commands = [
            'mkdir -p ~/logs ~/backups',
            'ls -la ~/ | grep -E "logs|backups"',
            'crontab -l 2>/dev/null || echo "# No hay cronjobs"'
        ];

        executeCommands(conn, commands, 0);
    });

    conn.on('error', (err) => {
        console.error('❌ Error SSH:', err.message);
        process.exit(1);
    });

    // Leer llave PEM
    const pemKeyPath = path.join(__dirname, '..', 'nhs13h5k0x0j_pem');
    const privateKey = fs.readFileSync(pemKeyPath);

    conn.connect({
        host: process.env.FTP_HOST,
        port: 22,
        username: process.env.FTP_USER,
        privateKey: privateKey,
        passphrase: process.env.SSH_KEY_PASSPHRASE || '12345678'
    });
}

function executeCommands(conn, commands, index) {
    if (index >= commands.length) {
        console.log('\n🎯 Agregando cronjobs...');
        addCronjobs(conn);
        return;
    }

    const cmd = commands[index];
    console.log(`\n▶️  ${cmd}`);

    conn.exec(cmd, (err, stream) => {
        if (err) {
            console.error('❌ Error:', err.message);
            executeCommands(conn, commands, index + 1);
            return;
        }

        stream.on('data', (data) => {
            console.log(data.toString().trim());
        });

        stream.stderr.on('data', (data) => {
            console.error(data.toString().trim());
        });

        stream.on('close', () => {
            executeCommands(conn, commands, index + 1);
        });
    });
}

function addCronjobs(conn) {
    const cronjobs = `
# Notificaciones de pagos - 9:00 AM diario
0 9 * * * /usr/bin/php ~/public_html/backend/payment-cron.php >> ~/logs/payment-cron.log 2>&1

# Limpieza de archivos temporales - 2:00 AM diario
0 2 * * * /usr/bin/php ~/public_html/backend/cleanup-temp-files.php >> ~/logs/cleanup-cron.log 2>&1

# Backup de base de datos - Domingos 3:00 AM
0 3 * * 0 /usr/bin/mysqldump -u nhs13h5k_krause -p'${process.env.DB_PASSWORD || 'Inspiron1999#'}' nhs13h5k_krause > ~/backups/db-backup-$(date +\\%Y\\%m\\%d).sql 2>&1
`;

    const tempFile = '/tmp/new-crontab.txt';

    // Primero, guardar crontab actual y agregar nuevos
    conn.exec(`crontab -l 2>/dev/null > ${tempFile}; echo "${cronjobs.trim()}" >> ${tempFile}; crontab ${tempFile}; rm ${tempFile}; crontab -l`, (err, stream) => {
        if (err) {
            console.error('❌ Error configurando cronjobs:', err.message);
            conn.end();
            return;
        }

        console.log('\n📋 Cronjobs configurados:');

        stream.on('data', (data) => {
            console.log(data.toString());
        });

        stream.stderr.on('data', (data) => {
            console.error(data.toString());
        });

        stream.on('close', () => {
            console.log('\n✅ CONFIGURACIÓN COMPLETADA EXITOSAMENTE\n');
            console.log('📝 Próximos pasos:');
            console.log('   1. Verificar login: http://ksinsurancee.com');
            console.log('      - Email: maria.garcia@example.com');
            console.log('      - Password: maria123');
            console.log('   2. Eliminar execute-demo-data.php del servidor');
            console.log('   3. Verificar logs mañana en ~/logs/\n');

            conn.end();
            process.exit(0);
        });
    });
}
