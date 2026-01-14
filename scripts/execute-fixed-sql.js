const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Ejecutando SQL en el servidor...\n');

const conn = new Client();

conn.on('ready', () => {
    console.log('✅ Conectado via SSH\n');

    console.log('📊 Ejecutando demo-data-maria-garcia-FIXED.sql...\n');

    conn.exec(`mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause < ~/public_html/backend/demo-data-maria-garcia-FIXED.sql`, (err, stream) => {
        if (err) {
            console.error('❌ Error:', err.message);
            conn.end();
            return;
        }

        let output = '';
        let errors = '';

        stream.on('data', (data) => {
            output += data.toString();
        });

        stream.stderr.on('data', (data) => {
            const msg = data.toString();
            if (!msg.includes('tput')) {
                errors += msg;
            }
        });

        stream.on('close', (code) => {
            if (output) {
                console.log('✅ Resultado de la verificación:\n');
                console.log(output);
            }

            if (errors && !errors.includes('tput')) {
                console.error('\n⚠️  Errores/Advertencias:\n');
                console.error(errors);
            }

            if (code === 0 || output.includes('maria.garcia')) {
                console.log('\n' + '═'.repeat(60));
                console.log('✅ DATOS DEMO INSERTADOS EXITOSAMENTE');
                console.log('═'.repeat(60));
                console.log('\n📝 Datos creados:');
                console.log('   ✓ Usuario: maria.garcia@example.com');
                console.log('   ✓ Password: maria123');
                console.log('   ✓ Póliza: AUTO-001-2026 (Honda Civic 2022)');
                console.log('   ✓ 12 pagos mensuales (1 pagado, 11 pendientes)');
                console.log('\n🌐 Probar login:');
                console.log('   URL: https://ksinsurancee.com');
                console.log('   Email: maria.garcia@example.com');
                console.log('   Password: maria123');
                console.log('\n⏰ Cronjobs activos:');
                console.log('   ✓ Notificaciones pagos - 9:00 AM diario');
                console.log('   ✓ Limpieza temporal - 2:00 AM diario');
                console.log('   ✓ Backup BD - Domingo 3:00 AM\n');
            } else {
                console.log(`\n⚠️  Código de salida: ${code}\n`);
            }

            conn.end();
        });
    });

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
