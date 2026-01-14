const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Configuración de conexión SSH + MySQL (GoDaddy usa localhost desde el servidor)
const dbConfig = {
    host: 'localhost', // Desde el servidor es localhost
    user: 'nhs13h5k_krause',
    password: 'Inspiron1999#',
    database: 'nhs13h5k_krause',
    multipleStatements: true
};

async function executeSQLScript() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  📊 EJECUTANDO SCRIPT SQL EN SERVIDOR REMOTO');
    console.log('═══════════════════════════════════════════════════════\n');

    try {
        // Leer el script SQL
        const sqlFilePath = path.join(__dirname, '..', 'backend', 'demo-data-maria-garcia.sql');
        console.log('📄 Leyendo script:', sqlFilePath);

        const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

        // Generar hash de password para Maria Garcia
        console.log('\n🔐 Generando hash de password...');
        const bcrypt = require('bcryptjs');
        const passwordHash = bcrypt.hashSync('maria123', 10);

        // Reemplazar placeholder con hash real
        const sqlWithHash = sqlScript.replace(
            '$2y$10$YourHashedPasswordHere',
            passwordHash
        );

        console.log('✅ Hash generado exitosamente\n');

        // Nota: Para ejecutar remotamente necesitamos SSH tunnel o ejecutar desde el servidor
        console.log('⚠️  IMPORTANTE: Este script debe ejecutarse DESDE el servidor de GoDaddy');
        console.log('    debido a restricciones de MySQL remoto.\n');

        console.log('📝 OPCIONES PARA EJECUTAR:\n');

        console.log('OPCIÓN 1: Via SSH desde terminal');
        console.log('─────────────────────────────────────────');
        console.log('ssh nhs13h5k0x0j@208.109.62.140');
        console.log('cd public_html/backend');
        console.log('mysql -u nhs13h5k_krause -p nhs13h5k_krause < demo-data-maria-garcia.sql');
        console.log('(Password: Inspiron1999#)\n');

        console.log('OPCIÓN 2: Via cPanel phpMyAdmin');
        console.log('─────────────────────────────────────────');
        console.log('1. Ir a https://ksinsurancee.com:2083/cpsess.../phpMyAdmin');
        console.log('2. Seleccionar base de datos: nhs13h5k_krause');
        console.log('3. Ir a pestaña "SQL"');
        console.log('4. Pegar el contenido de demo-data-maria-garcia.sql');
        console.log('5. Click en "Ejecutar"\n');

        console.log('OPCIÓN 3: Via PHP script en servidor');
        console.log('─────────────────────────────────────────');
        console.log('Se creará un script PHP para ejecutarlo desde el navegador...\n');

        // Crear script PHP para ejecutar SQL
        const phpScript = `<?php
/**
 * Script para ejecutar demo-data-maria-garcia.sql
 * Ejecutar desde: http://ksinsurancee.com/backend/execute-demo-data.php
 * 
 * ELIMINAR ESTE ARCHIVO DESPUÉS DE USARLO
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

// Seguridad básica
$executionKey = $_GET['key'] ?? '';
if ($executionKey !== 'demo2026') {
    die('❌ Acceso denegado. Usa: ?key=demo2026');
}

echo "<h1>Ejecutando Script SQL de Datos Demo</h1>";
echo "<pre>";

try {
    $db = getDatabase();
    
    // Generar hash de password
    echo "🔐 Generando hash de password...\\n";
    $passwordHash = password_hash('maria123', PASSWORD_BCRYPT);
    echo "✅ Hash generado: " . substr($passwordHash, 0, 20) . "...\\n\\n";
    
    // 1. Crear/Actualizar usuario
    echo "👤 Creando usuario maria.garcia@example.com...\\n";
    $stmt = $db->prepare("
        INSERT INTO users (email, password_hash, first_name, last_name, role, phone, address, created_at)
        VALUES (
            'maria.garcia@example.com',
            ?,
            'María Elena',
            'García López',
            'client',
            '+52 (555) 123-4567',
            'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX 03100',
            '2024-01-15 10:00:00'
        )
        ON DUPLICATE KEY UPDATE
            password_hash = VALUES(password_hash),
            first_name = 'María Elena',
            last_name = 'García López',
            phone = '+52 (555) 123-4567',
            address = 'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX 03100'
    ");
    $stmt->execute([$passwordHash]);
    echo "✅ Usuario creado/actualizado\\n\\n";
    
    // Obtener user_id
    $userId = $db->query("SELECT user_id FROM users WHERE email = 'maria.garcia@example.com'")->fetchColumn();
    echo "📋 User ID: $userId\\n\\n";
    
    // 2. Crear póliza
    echo "📄 Creando póliza AUTO-001-2026...\\n";
    $stmt = $db->prepare("
        INSERT INTO policies (
            user_id, policy_number, policy_type, coverage_amount, premium_amount,
            start_date, end_date, status, insurer_name, payment_frequency, created_at
        )
        VALUES (?, 'AUTO-001-2026', 'Auto', 2000000.00, 1625.00, '2026-01-15', '2027-01-15',
                'active', 'GNP Seguros', 12, '2026-01-15 09:00:00')
        ON DUPLICATE KEY UPDATE
            user_id = VALUES(user_id),
            status = 'active'
    ");
    $stmt->execute([$userId]);
    $policyId = $db->lastInsertId();
    if (!$policyId) {
        $policyId = $db->query("SELECT policy_id FROM policies WHERE policy_number = 'AUTO-001-2026'")->fetchColumn();
    }
    echo "✅ Póliza creada - ID: $policyId\\n\\n";
    
    // 3. Crear calendario de pagos (solo si no existen)
    echo "📅 Creando calendario de pagos (12 meses)...\\n";
    $existingSchedules = $db->query("SELECT COUNT(*) FROM payment_schedule WHERE policy_id = $policyId")->fetchColumn();
    
    if ($existingSchedules == 0) {
        $months = ['01-20', '02-20', '03-20', '04-20', '05-20', '06-20', 
                   '07-20', '08-20', '09-20', '10-20', '11-20', '12-20'];
        foreach ($months as $month) {
            $date = "2026-$month";
            $db->exec("INSERT INTO payment_schedule (policy_id, schedule_date, amount, status) 
                      VALUES ($policyId, '$date', 1625.00, 'pending')");
        }
        echo "✅ 12 pagos programados\\n";
    } else {
        echo "ℹ️  Ya existen $existingSchedules pagos programados\\n";
    }
    
    echo "\\n";
    echo "═══════════════════════════════════════════════════════\\n";
    echo "  ✅ SCRIPT EJECUTADO EXITOSAMENTE\\n";
    echo "═══════════════════════════════════════════════════════\\n\\n";
    
    echo "📊 CREDENCIALES DE ACCESO:\\n";
    echo "   Email: maria.garcia@example.com\\n";
    echo "   Password: maria123\\n\\n";
    
    echo "🔗 ACCESO AL PORTAL:\\n";
    echo "   http://ksinsurancee.com\\n\\n";
    
    // Verificación
    $verification = $db->query("
        SELECT 
            u.user_id,
            u.email,
            u.first_name,
            u.last_name,
            p.policy_id,
            p.policy_number,
            p.policy_type,
            p.premium_amount,
            p.status,
            (SELECT COUNT(*) FROM payment_schedule WHERE policy_id = p.policy_id) as total_payments
        FROM users u
        LEFT JOIN policies p ON u.user_id = p.user_id
        WHERE u.email = 'maria.garcia@example.com'
    ")->fetch(PDO::FETCH_ASSOC);
    
    echo "📋 VERIFICACIÓN:\\n";
    echo "   User ID: " . $verification['user_id'] . "\\n";
    echo "   Email: " . $verification['email'] . "\\n";
    echo "   Nombre: " . $verification['first_name'] . " " . $verification['last_name'] . "\\n";
    echo "   Policy ID: " . $verification['policy_id'] . "\\n";
    echo "   Número Póliza: " . $verification['policy_number'] . "\\n";
    echo "   Prima Mensual: $" . $verification['premium_amount'] . "\\n";
    echo "   Total Pagos: " . $verification['total_payments'] . "\\n";
    
    echo "\\n⚠️  IMPORTANTE: ELIMINA ESTE ARCHIVO execute-demo-data.php POR SEGURIDAD\\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\\n";
    echo "Trace: " . $e->getTraceAsString();
}

echo "</pre>";
?>`;

        // Guardar script PHP
        const phpFilePath = path.join(__dirname, '..', 'backend', 'execute-demo-data.php');
        fs.writeFileSync(phpFilePath, phpScript);
        console.log('✅ Script PHP creado: backend/execute-demo-data.php\n');

        console.log('═══════════════════════════════════════════════════════');
        console.log('  ✅ PREPARACIÓN COMPLETADA');
        console.log('═══════════════════════════════════════════════════════\n');

        console.log('🚀 SIGUIENTE PASO:');
        console.log('   1. El script PHP se subirá en el próximo deploy');
        console.log('   2. Ejecutarlo desde: http://ksinsurancee.com/backend/execute-demo-data.php?key=demo2026');
        console.log('   3. Eliminar el archivo después de usarlo\n');

        // Guardar SQL con hash actualizado
        const sqlWithHashPath = path.join(__dirname, '..', 'backend', 'demo-data-maria-garcia-ready.sql');
        fs.writeFileSync(sqlWithHashPath, sqlWithHash);
        console.log('📄 SQL con hash guardado: backend/demo-data-maria-garcia-ready.sql\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Ejecutar
executeSQLScript();
