const { NodeSSH } = require('node-ssh');
const path = require('path');

const ssh = new NodeSSH();

const config = {
    host: '208.109.62.140',
    username: 'nhs13h5k0x0j',
    privateKeyPath: path.join(__dirname, '..', 'nhs13h5k0x0j_pem'),
    passphrase: '12345678',
    port: 22
};

async function executeCorrectedSQL() {
    console.log('🚀 Ejecutando SQL corregido en el servidor...\n');

    try {
        await ssh.connect(config);
        console.log('✅ Conectado via SSH\n');

        // Ejecutar el SQL corregido
        console.log('📊 Ejecutando demo-data-maria-garcia-CORRECTED.sql...\n');

        const result = await ssh.execCommand(`
            cd /home/nhs13h5k0x0j/public_html/backend && \
            mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause < demo-data-maria-garcia-CORRECTED.sql
        `);

        if (result.stdout) {
            console.log('✅ RESULTADO:\n');
            console.log(result.stdout);
        }

        if (result.stderr && result.stderr.trim()) {
            console.log('\n⚠️  Errores/Advertencias:\n');
            console.log(result.stderr);
        }

        if (result.code === 0) {
            console.log('\n═══════════════════════════════════════════════════');
            console.log('✅ SQL EJECUTADO EXITOSAMENTE');
            console.log('═══════════════════════════════════════════════════\n');

            console.log('🔑 CREDENCIALES DE ACCESO:');
            console.log('   URL:      http://ksinsurancee.com');
            console.log('   Email:    maria.garcia@example.com');
            console.log('   Password: maria123\n');

            console.log('📊 DATOS CREADOS:');
            console.log('   ✅ Cliente: María Elena García López');
            console.log('   ✅ Póliza: AUTO-001-2026');
            console.log('   ✅ 12 pagos mensuales programados');
            console.log('   ✅ 1 pago completado (Enero 2026)');
            console.log('   ✅ 11 pagos pendientes (Feb-Dic 2026)\n');
        } else {
            console.log('\n❌ Error al ejecutar SQL (código:', result.code, ')\n');
        }

        ssh.dispose();

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        ssh.dispose();
        process.exit(1);
    }
}

executeCorrectedSQL();
