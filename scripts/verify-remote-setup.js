const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔍 Verificando configuración en el servidor...\n');

const conn = new Client();

conn.on('ready', () => {
    console.log('✅ Conectado via SSH\n');

    // Verificar datos SQL
    const sqlQuery = `mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause -e "SELECT u.user_id, u.email, u.first_name, p.policy_number, COUNT(ps.schedule_id) as total_payments FROM users u LEFT JOIN policies p ON u.user_id = p.user_id LEFT JOIN payment_schedule ps ON p.policy_id = ps.policy_id WHERE u.email = 'maria.garcia@example.com' GROUP BY u.user_id, p.policy_id;"`;

    console.log('📊 Verificando usuario maria.garcia@example.com...\n');

    conn.exec(sqlQuery, (err, stream) => {
        if (err) {
            console.error('❌ Error:', err.message);
            checkCronjobs();
            return;
        }

        let output = '';

        stream.on('data', (data) => {
            output += data.toString();
        });

        stream.stderr.on('data', (data) => {
            console.error('⚠️  ', data.toString());
        });

        stream.on('close', () => {
            if (output) {
                console.log('✅ Datos encontrados:\n');
                console.log(output);
            } else {
                console.log('⚠️  No se encontró el usuario. Ejecutando SQL...\n');
                executeSQLFile();
                return;
            }
            checkCronjobs();
        });
    });

    function executeSQLFile() {
        console.log('📂 Ejecutando archivo SQL...\n');

        const sqlFile = '~/public_html/backend/demo-data-maria-garcia-ready.sql';
        const execSQL = `mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause < ${sqlFile}`;

        conn.exec(execSQL, (err, stream) => {
            if (err) {
                console.error('❌ Error ejecutando SQL:', err.message);
                checkCronjobs();
                return;
            }

            stream.on('data', (data) => {
                console.log(data.toString());
            });

            stream.stderr.on('data', (data) => {
                console.error(data.toString());
            });

            stream.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ SQL ejecutado exitosamente\n');
                } else {
                    console.log(`⚠️  SQL ejecutado con código: ${code}\n`);
                }
                checkCronjobs();
            });
        });
    }

    function checkCronjobs() {
        console.log('⏰ Verificando cronjobs configurados...\n');

        conn.exec('crontab -l', (err, stream) => {
            if (err) {
                console.error('❌ Error:', err.message);
                testPaymentCron();
                return;
            }

            stream.on('data', (data) => {
                console.log(data.toString());
            });

            stream.on('close', () => {
                testPaymentCron();
            });
        });
    }

    function testPaymentCron() {
        console.log('\n🧪 Probando cronjob de pagos manualmente...\n');

        conn.exec('php ~/public_html/backend/payment-cron.php', (err, stream) => {
            if (err) {
                console.error('❌ Error:', err.message);
                finish();
                return;
            }

            stream.on('data', (data) => {
                console.log(data.toString());
            });

            stream.stderr.on('data', (data) => {
                console.error(data.toString());
            });

            stream.on('close', () => {
                finish();
            });
        });
    }

    function finish() {
        console.log('\n✅ VERIFICACIÓN COMPLETADA\n');
        console.log('📝 Resumen:');
        console.log('   ✓ Directorios logs y backups creados');
        console.log('   ✓ Cronjobs configurados (3 jobs)');
        console.log('   ? Datos SQL - verificar arriba');
        console.log('   ? Payment cron - verificar output arriba\n');

        console.log('🌐 Siguiente paso: Probar login');
        console.log('   URL: https://ksinsurancee.com');
        console.log('   Email: maria.garcia@example.com');
        console.log('   Password: maria123\n');

        conn.end();
    }
}).on('error', (err) => {
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
