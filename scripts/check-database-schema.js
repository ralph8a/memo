const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔍 Verificando esquema de base de datos...\n');

const conn = new Client();

conn.on('ready', () => {
    console.log('✅ Conectado via SSH\n');

    const commands = [
        {
            name: 'Tablas existentes',
            cmd: `mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause -e "SHOW TABLES;"`
        },
        {
            name: 'Estructura de tabla users',
            cmd: `mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause -e "DESCRIBE users;"`
        },
        {
            name: 'Estructura de tabla policies',
            cmd: `mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause -e "DESCRIBE policies;"`
        },
        {
            name: 'Buscar tablas de payments',
            cmd: `mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause -e "SHOW TABLES LIKE '%payment%';"`
        }
    ];

    let index = 0;

    function runNext() {
        if (index >= commands.length) {
            console.log('\n✅ Verificación completada\n');
            conn.end();
            return;
        }

        const { name, cmd } = commands[index++];
        console.log(`\n📊 ${name}:`);
        console.log('─'.repeat(60));

        conn.exec(cmd, (err, stream) => {
            if (err) {
                console.error('❌ Error:', err.message);
                runNext();
                return;
            }

            stream.on('data', (data) => {
                console.log(data.toString());
            });

            stream.stderr.on('data', (data) => {
                const msg = data.toString();
                if (!msg.includes('tput')) {
                    console.error(msg);
                }
            });

            stream.on('close', () => {
                runNext();
            });
        });
    }

    runNext();

}).on('error', (err) => {
    console.error('❌ Error SSH:', err.message);
    process.exit(1);
});

const pemKeyPath = path.join(__dirname, '..', 'nhs13h5k0x0j_pem');
const privateKey = fs.readFileSync(pemKeyPath);

conn.connect({
    host: process.env.FTP_HOST,
    port: 22,
    username: process.env.FTP_USER,
    privateKey: privateKey,
    passphrase: process.env.SSH_KEY_PASSPHRASE || '12345678'
});
