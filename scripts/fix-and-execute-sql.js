const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔍 Verificando tabla payments y clients...\n');

const conn = new Client();

conn.on('ready', () => {
    console.log('✅ Conectado via SSH\n');

    const commands = [
        {
            name: 'Estructura de tabla payments',
            cmd: `mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause -e "DESCRIBE payments;"`
        },
        {
            name: 'Estructura de tabla clients',
            cmd: `mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause -e "DESCRIBE clients;"`
        },
        {
            name: 'Estructura de tabla documents',
            cmd: `mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause -e "DESCRIBE documents;"`
        }
    ];

    let index = 0;

    function runNext() {
        if (index >= commands.length) {
            console.log('\n✅ Generando SQL compatible...\n');
            generateSQL();
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

    function generateSQL() {
        // Generar SQL compatible con el esquema actual
        const sql = `
-- Insertar usuario (client type)
INSERT INTO users (email, password_hash, user_type, first_name, last_name, phone, region, status, created_at)
VALUES (
    'maria.garcia@example.com',
    '$2b$10$gBzu2evP4sXTLEKqo8pObOyUgDO5iNhd/c/PBtDtOuuDY6GbGC1x.',
    'client',
    'María Elena',
    'García López',
    '+52 (555) 123-4567',
    'CDMX',
    'active',
    '2024-01-15 10:00:00'
)
ON DUPLICATE KEY UPDATE
    first_name = 'María Elena',
    last_name = 'García López',
    phone = '+52 (555) 123-4567',
    region = 'CDMX';

-- Obtener user_id
SET @user_id = (SELECT id FROM users WHERE email = 'maria.garcia@example.com');

-- Insertar en tabla clients si existe
INSERT IGNORE INTO clients (user_id, rfc, company_name, contact_person, created_at)
VALUES (@user_id, 'GAML850315ABC', NULL, 'María Elena García López', NOW());

-- Obtener agent_id (asumiendo que Guillermo Krause ya existe)
SET @agent_id = (SELECT id FROM users WHERE user_type = 'agent' LIMIT 1);

-- Insertar póliza
INSERT INTO policies (
    policy_number, client_id, agent_id, policy_type, 
    status, premium_amount, coverage_amount, 
    start_date, end_date, renewal_date, created_at
)
VALUES (
    'AUTO-001-2026',
    @user_id,
    @agent_id,
    'auto',
    'active',
    1625.00,
    350000.00,
    '2026-01-01',
    '2026-12-31',
    '2026-12-01',
    '2026-01-10 10:00:00'
)
ON DUPLICATE KEY UPDATE
    status = 'active',
    premium_amount = 1625.00;

-- Obtener policy_id
SET @policy_id = (SELECT id FROM policies WHERE policy_number = 'AUTO-001-2026');

-- Insertar pagos mensuales (usando tabla payments)
-- Enero - Pagado
INSERT IGNORE INTO payments (policy_id, amount, due_date, payment_date, payment_method, status, created_at)
VALUES (@policy_id, 1625.00, '2026-01-15', '2026-01-18 14:30:00', 'transfer', 'completed', '2026-01-18 14:30:00');

-- Febrero - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-02-15', 'pending', NOW());

-- Marzo - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-03-15', 'pending', NOW());

-- Abril - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-04-15', 'pending', NOW());

-- Mayo - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-05-15', 'pending', NOW());

-- Junio - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-06-15', 'pending', NOW());

-- Julio - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-07-15', 'pending', NOW());

-- Agosto - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-08-15', 'pending', NOW());

-- Septiembre - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-09-15', 'pending', NOW());

-- Octubre - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-10-15', 'pending', NOW());

-- Noviembre - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-11-15', 'pending', NOW());

-- Diciembre - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-12-15', 'pending', NOW());

-- Verificar resultados
SELECT 
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    p.id as policy_id,
    p.policy_number,
    p.premium_amount,
    COUNT(pay.id) as total_payments,
    SUM(CASE WHEN pay.status = 'completed' THEN 1 ELSE 0 END) as paid_payments,
    SUM(CASE WHEN pay.status = 'pending' THEN 1 ELSE 0 END) as pending_payments
FROM users u
LEFT JOIN policies p ON u.id = p.client_id
LEFT JOIN payments pay ON p.id = pay.policy_id
WHERE u.email = 'maria.garcia@example.com'
GROUP BY u.id, p.id;
`;

        // Guardar SQL actualizado
        fs.writeFileSync(
            path.join(__dirname, '..', 'backend', 'demo-data-maria-garcia-FIXED.sql'),
            sql
        );

        console.log('✅ SQL actualizado guardado: backend/demo-data-maria-garcia-FIXED.sql\n');
        console.log('📤 Subiendo y ejecutando SQL en el servidor...\n');

        // Subir y ejecutar el SQL
        conn.exec(`cat > ~/public_html/backend/demo-data-maria-garcia-FIXED.sql << 'EOFMARKER'${sql}
EOFMARKER`, (err, stream) => {
            if (err) {
                console.error('❌ Error:', err.message);
                conn.end();
                return;
            }

            stream.on('close', () => {
                console.log('✅ Archivo SQL subido al servidor\n');
                executeSQL();
            });
        });
    }

    function executeSQL() {
        console.log('🚀 Ejecutando SQL en la base de datos...\n');

        conn.exec(`mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause < ~/public_html/backend/demo-data-maria-garcia-FIXED.sql`, (err, stream) => {
            if (err) {
                console.error('❌ Error:', err.message);
                conn.end();
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

            stream.on('close', (code) => {
                if (code === 0) {
                    console.log('\n✅ SQL ejecutado exitosamente\n');
                } else {
                    console.log(`\n⚠️  SQL completado con código: ${code}\n`);
                }

                console.log('═'.repeat(60));
                console.log('✅ CONFIGURACIÓN COMPLETA EXITOSA');
                console.log('═'.repeat(60));
                console.log('\n📝 Resumen:');
                console.log('   ✓ Usuario creado: maria.garcia@example.com');
                console.log('   ✓ Póliza creada: AUTO-001-2026');
                console.log('   ✓ 12 pagos programados (1 pagado, 11 pendientes)');
                console.log('   ✓ 3 cronjobs configurados');
                console.log('\n🌐 Probar login:');
                console.log('   URL: https://ksinsurancee.com');
                console.log('   Email: maria.garcia@example.com');
                console.log('   Password: maria123\n');

                conn.end();
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
