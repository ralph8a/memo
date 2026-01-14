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

async function setupAndExecute() {
    console.log('🚀 Setup completo de base de datos + datos demo\n');

    try {
        await ssh.connect(config);
        console.log('✅ Conectado via SSH\n');

        // 1. Verificar tablas existentes
        console.log('📊 Verificando tablas existentes...\n');

        const showTables = await ssh.execCommand(`
            mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause -e "SHOW TABLES;"
        `);

        console.log('Tablas actuales:');
        console.log(showTables.stdout);
        console.log('');

        // 2. Crear schema de pagos si no existe
        console.log('📝 Ejecutando payments-schema.sql...\n');

        const createSchema = await ssh.execCommand(`
            cd /home/nhs13h5k0x0j/public_html/backend && \
            mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause < payments-schema.sql
        `);

        if (createSchema.code === 0) {
            console.log('✅ Schema de pagos creado exitosamente\n');
        } else {
            console.log('⚠️  Advertencias al crear schema:');
            console.log(createSchema.stderr);
            console.log('');
        }

        // 3. Ejecutar datos demo
        console.log('📊 Ejecutando demo-data-maria-garcia-CORRECTED.sql...\n');

        const insertData = await ssh.execCommand(`
            cd /home/nhs13h5k0x0j/public_html/backend && \
            mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause < demo-data-maria-garcia-CORRECTED.sql 2>&1
        `);

        console.log('Resultado de inserción de datos:');
        console.log(insertData.stdout);

        if (insertData.stderr && insertData.stderr.trim() && !insertData.stderr.includes('tput:')) {
            console.log('\n⚠️  Errores:');
            console.log(insertData.stderr);
        }

        // 4. Verificación final
        console.log('\n📊 Verificación final de datos...\n');

        const verification = await ssh.execCommand(`
            mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause -e "
                SELECT 
                    u.id as user_id,
                    u.email,
                    CONCAT(u.first_name, ' ', u.last_name) as full_name,
                    p.id as policy_id,
                    p.policy_number,
                    p.premium_amount,
                    COUNT(ps.schedule_id) as total_schedules,
                    SUM(CASE WHEN ps.status = 'paid' THEN 1 ELSE 0 END) as paid,
                    SUM(CASE WHEN ps.status = 'pending' THEN 1 ELSE 0 END) as pending
                FROM users u
                LEFT JOIN policies p ON u.id = p.client_id
                LEFT JOIN payment_schedules ps ON p.id = ps.policy_id
                WHERE u.email = 'maria.garcia@example.com'
                GROUP BY u.id, p.id;
            "
        `);

        console.log('═══════════════════════════════════════════════════');
        console.log('✅ VERIFICACIÓN FINAL');
        console.log('═══════════════════════════════════════════════════\n');
        console.log(verification.stdout);

        console.log('\n═══════════════════════════════════════════════════');
        console.log('🎯 SETUP COMPLETADO');
        console.log('═══════════════════════════════════════════════════\n');

        console.log('🔑 CREDENCIALES DE ACCESO:');
        console.log('   URL:      http://ksinsurancee.com');
        console.log('   Email:    maria.garcia@example.com');
        console.log('   Password: maria123\n');

        ssh.dispose();

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        ssh.dispose();
        process.exit(1);
    }
}

setupAndExecute();
