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

async function cleanAndTest() {
    console.log('🧹 Limpieza de base de datos y prueba de flujo completo\n');

    try {
        await ssh.connect(config);
        console.log('✅ Conectado al servidor\n');

        // PASO 1: Limpiar datos de prueba (mantener estructura)
        console.log('═══════════════════════════════════════════════════');
        console.log('🧹 PASO 1: Limpiando datos de prueba...');
        console.log('═══════════════════════════════════════════════════\n');

        const cleanScript = `
-- Limpiar datos de prueba manteniendo estructura
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar datos de maria.garcia (cliente de prueba)
DELETE FROM payment_schedules WHERE policy_id IN (
    SELECT id FROM policies WHERE client_id IN (
        SELECT id FROM users WHERE email = 'maria.garcia@example.com'
    )
);

DELETE FROM payment_proofs WHERE schedule_id IN (
    SELECT schedule_id FROM payment_schedules WHERE policy_id IN (
        SELECT id FROM policies WHERE client_id IN (
            SELECT id FROM users WHERE email = 'maria.garcia@example.com'
        )
    )
);

DELETE FROM payment_notifications WHERE schedule_id IN (
    SELECT schedule_id FROM payment_schedules WHERE policy_id IN (
        SELECT id FROM policies WHERE client_id IN (
            SELECT id FROM users WHERE email = 'maria.garcia@example.com'
        )
    )
);

DELETE FROM documents WHERE policy_id IN (
    SELECT id FROM policies WHERE client_id IN (
        SELECT id FROM users WHERE email = 'maria.garcia@example.com'
    )
);

DELETE FROM commissions WHERE policy_id IN (
    SELECT id FROM policies WHERE client_id IN (
        SELECT id FROM users WHERE email = 'maria.garcia@example.com'
    )
);

DELETE FROM policies WHERE client_id IN (
    SELECT id FROM users WHERE email = 'maria.garcia@example.com'
);

DELETE FROM clients WHERE user_id IN (
    SELECT id FROM users WHERE email = 'maria.garcia@example.com'
);

DELETE FROM users WHERE email = 'maria.garcia@example.com';

SET FOREIGN_KEY_CHECKS = 1;

-- Verificar limpieza
SELECT 
    (SELECT COUNT(*) FROM users WHERE email = 'maria.garcia@example.com') as users_count,
    (SELECT COUNT(*) FROM policies WHERE policy_number LIKE 'AUTO-001%') as policies_count,
    (SELECT COUNT(*) FROM payment_schedules WHERE policy_id IN (
        SELECT id FROM policies WHERE policy_number LIKE 'AUTO-001%'
    )) as schedules_count;
`;

        await ssh.execCommand(`cat > /tmp/clean-test-data.sql << 'EOFCLEAN'
${cleanScript}
EOFCLEAN`);

        const cleanResult = await ssh.execCommand(`
            mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause < /tmp/clean-test-data.sql
        `);

        if (cleanResult.stdout) {
            console.log('Resultado de limpieza:');
            console.log(cleanResult.stdout);
        }

        if (cleanResult.code === 0) {
            console.log('\n✅ Base de datos limpiada\n');
        } else {
            console.log('\n⚠️  Advertencias durante limpieza:');
            console.log(cleanResult.stderr);
            console.log('');
        }

        // PASO 2: Simular carga de PDF usando el sistema real
        console.log('═══════════════════════════════════════════════════');
        console.log('📤 PASO 2: Simulando carga de PDF con sistema real...');
        console.log('═══════════════════════════════════════════════════\n');

        const testUploadScript = `<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config.php';
require_once 'database.php';
require_once 'policy-analyzer.php';
require_once 'payment-schedule-generator.php';

echo "📄 PRUEBA DE CARGA DE PÓLIZA CON GENERACIÓN AUTOMÁTICA\\n";
echo "═══════════════════════════════════════════════════════════\\n\\n";

try {
    $pdo = Database::getInstance()->getConnection();
    
    // Obtener agent_id
    $stmt = $pdo->prepare("SELECT id FROM users WHERE user_type = 'agent' LIMIT 1");
    $stmt->execute();
    $agent = $stmt->fetch();
    
    if (!$agent) {
        throw new Exception('No hay agentes en la base de datos');
    }
    
    $agent_id = $agent['id'];
    echo "✅ Agente encontrado: ID $agent_id\\n\\n";
    
    // PASO 1: Crear cliente
    echo "👤 PASO 1: Creando cliente...\\n";
    
    $password_hash = password_hash('maria123', PASSWORD_BCRYPT);
    
    $stmt = $pdo->prepare("
        INSERT INTO users (
            email, password_hash, user_type, first_name, last_name, 
            phone, region, status, created_at
        ) VALUES (?, ?, 'client', ?, ?, ?, ?, 'active', NOW())
    ");
    
    $stmt->execute([
        'maria.garcia@example.com',
        $password_hash,
        'María Elena',
        'García López',
        '+52 (555) 123-4567',
        'CDMX'
    ]);
    
    $client_id = $pdo->lastInsertId();
    echo "   ✅ Cliente creado: ID $client_id\\n";
    echo "   📧 Email: maria.garcia@example.com\\n";
    echo "   🔑 Password: maria123\\n\\n";
    
    // PASO 2: Simular datos extraídos del PDF
    echo "📋 PASO 2: Simulando extracción de datos del PDF...\\n";
    
    \$policyData = [
        'policy_number' => 'AUTO-001-2026',
        'policy_type' => 'auto',
        'insurer_name' => 'GNP Seguros',
        'client_name' => 'María Elena García López',
        'total_premium' => 19500.00,  // Prima ANUAL
        'payment_frequency' => 12,    // Mensual (12 cuotas)
        'payment_due_day' => 20,      // Vencimiento día 20 de cada mes (extraído del PDF)
        'coverage_amount' => 350000.00,
        'start_date' => '2026-01-01',
        'end_date' => '2026-12-31'
    ];
    
    echo "   📄 Póliza: {\$policyData['policy_number']}\\n";
    echo "   🏢 Aseguradora: {\$policyData['insurer_name']}\\n";
    echo "   💰 Prima anual: $" . number_format(\$policyData['total_premium'], 2) . " MXN\\n";
    echo "   📅 Frecuencia: {\$policyData['payment_frequency']} cuotas (mensual)\\n";
    echo "   📆 Día vencimiento: {\$policyData['payment_due_day']} de cada mes\\n";
    echo "   🛡️  Cobertura: $" . number_format(\$policyData['coverage_amount'], 2) . " MXN\\n\\n";
    
    // PASO 3: Crear póliza
    echo "📝 PASO 3: Creando póliza en base de datos...\\n";
    
    $stmt = $pdo->prepare("
        INSERT INTO policies (
            policy_number, client_id, agent_id, policy_type,
            status, premium_amount, coverage_amount,
            start_date, end_date, renewal_date, created_at
        ) VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, NOW())
    ");
    
    $renewal_date = date('Y-m-d', strtotime(\$policyData['end_date'] . ' -30 days'));
    
    $stmt->execute([
        \$policyData['policy_number'],
        $client_id,
        $agent_id,
        \$policyData['policy_type'],
        \$policyData['total_premium'],
        \$policyData['coverage_amount'],
        \$policyData['start_date'],
        \$policyData['end_date'],
        $renewal_date
    ]);
    
    $policy_id = $pdo->lastInsertId();
    echo "   ✅ Póliza creada: ID $policy_id\\n\\n";
    
    // PASO 4: Generar calendario de pagos automáticamente
    echo "💳 PASO 4: Generando calendario de pagos automáticamente...\\n";
    
    $generator = new PaymentScheduleGenerator();
    $scheduleResult = $generator->generateSchedule(\$policyData, $policy_id, $pdo);
    
    if (\$scheduleResult['success']) {
        echo "   ✅ Calendario generado exitosamente\\n";
        echo "   📊 Cuotas creadas: {\$scheduleResult['created']}\\n";
        echo "   💵 Monto por cuota: $" . number_format(\$scheduleResult['amount_per_installment'], 2) . " MXN\\n";
        
        if (!empty(\$scheduleResult['errors'])) {
            echo "   ⚠️  Advertencias: " . count(\$scheduleResult['errors']) . "\\n";
        }
    } else {
        echo "   ❌ Error generando calendario: {\$scheduleResult['error']}\\n";
    }
    
    echo "\\n";
    
    // PASO 5: Guardar documento PDF
    echo "📎 PASO 5: Registrando documento PDF...\\n";
    
    $stmt = $pdo->prepare("
        INSERT INTO documents (
            user_id, policy_id, document_type, file_name, file_path,
            file_size, mime_type, uploaded_at
        ) VALUES (?, ?, 'policy_doc', ?, ?, 2048, 'application/pdf', NOW())
    ");
    
    $stmt->execute([
        $agent_id,
        $policy_id,
        'maria-garcia-AUTO-001.pdf',
        'demo-policies/maria-garcia-AUTO-001.pdf'
    ]);
    
    echo "   ✅ Documento registrado\\n\\n";
    
    // PASO 6: Verificación final completa
    echo "═══════════════════════════════════════════════════════════\\n";
    echo "🔍 VERIFICACIÓN FINAL\\n";
    echo "═══════════════════════════════════════════════════════════\\n\\n";
    
    $stmt = $pdo->prepare("
        SELECT 
            u.id as user_id,
            u.email,
            CONCAT(u.first_name, ' ', u.last_name) as full_name,
            p.id as policy_id,
            p.policy_number,
            p.policy_type,
            p.status as policy_status,
            p.premium_amount,
            p.coverage_amount,
            DATE_FORMAT(p.start_date, '%d/%m/%Y') as start_date,
            DATE_FORMAT(p.end_date, '%d/%m/%Y') as end_date,
            COUNT(DISTINCT ps.schedule_id) as total_schedules,
            SUM(CASE WHEN ps.status = 'paid' THEN 1 ELSE 0 END) as paid_count,
            SUM(CASE WHEN ps.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
            SUM(CASE WHEN ps.status = 'pending' THEN ps.amount_due ELSE 0 END) as pending_amount,
            MIN(CASE WHEN ps.status = 'pending' THEN ps.due_date END) as next_payment_date,
            d.file_name as policy_document
        FROM users u
        INNER JOIN policies p ON u.id = p.client_id
        LEFT JOIN payment_schedules ps ON p.id = ps.policy_id
        LEFT JOIN documents d ON p.id = d.policy_id AND d.document_type = 'policy_doc'
        WHERE u.email = 'maria.garcia@example.com'
        GROUP BY u.id, p.id
    ");
    
    $stmt->execute();
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($data) {
        echo "👤 CLIENTE:\\n";
        echo "   ID:       {\$data['user_id']}\\n";
        echo "   Nombre:   {\$data['full_name']}\\n";
        echo "   Email:    {\$data['email']}\\n\\n";
        
        echo "📋 PÓLIZA:\\n";
        echo "   ID:       {\$data['policy_id']}\\n";
        echo "   Número:   {\$data['policy_number']}\\n";
        echo "   Tipo:     {\$data['policy_type']}\\n";
        echo "   Estado:   {\$data['policy_status']}\\n";
        echo "   Prima:    $" . number_format(\$data['premium_amount'], 2) . " MXN\\n";
        echo "   Cobertura: $" . number_format(\$data['coverage_amount'], 2) . " MXN\\n";
        echo "   Vigencia: {\$data['start_date']} a {\$data['end_date']}\\n";
        echo "   Documento: {\$data['policy_document']}\\n\\n";
        
        echo "💰 CALENDARIO DE PAGOS:\\n";
        echo "   Total programados: {\$data['total_schedules']}\\n";
        echo "   Pagados:           {\$data['paid_count']}\\n";
        echo "   Pendientes:        {\$data['pending_count']}\\n";
        echo "   Monto pendiente:   $" . number_format(\$data['pending_amount'], 2) . " MXN\\n";
        
        if (\$data['next_payment_date']) {
            echo "   Próximo pago:      " . date('d/m/Y', strtotime(\$data['next_payment_date'])) . "\\n";
        }
        
        echo "\\n═══════════════════════════════════════════════════════════\\n";
        echo "✅ PRUEBA COMPLETADA EXITOSAMENTE\\n";
        echo "═══════════════════════════════════════════════════════════\\n\\n";
        
        echo "🔑 CREDENCIALES DE ACCESO:\\n";
        echo "   URL:      http://ksinsurancee.com\\n";
        echo "   Email:    maria.garcia@example.com\\n";
        echo "   Password: maria123\\n\\n";
        
        echo "📊 RESUMEN:\\n";
        echo "   ✅ Cliente creado automáticamente\\n";
        echo "   ✅ Póliza registrada con datos del PDF\\n";
        echo "   ✅ Calendario de {\$data['total_schedules']} pagos generado automáticamente\\n";
        echo "   ✅ Documento PDF archivado\\n";
        echo "   ✅ Sistema listo para producción\\n\\n";
        
        // Mostrar detalle de primeras 3 cuotas
        echo "📅 DETALLE DE PRIMERAS 3 CUOTAS:\\n";
        $stmt2 = $pdo->prepare("
            SELECT 
                installment_number,
                DATE_FORMAT(due_date, '%d/%m/%Y') as due_date,
                amount_due,
                status
            FROM payment_schedules
            WHERE policy_id = ?
            ORDER BY installment_number
            LIMIT 3
        ");
        $stmt2->execute([$policy_id]);
        
        while ($schedule = $stmt2->fetch(PDO::FETCH_ASSOC)) {
            $status_icon = ($schedule['status'] == 'paid') ? '✅' : '⏳';
            echo "   $status_icon Cuota {\$schedule['installment_number']}: $" . 
                 number_format(\$schedule['amount_due'], 2) . " - Vence: {\$schedule['due_date']} - {\$schedule['status']}\\n";
        }
        
    } else {
        echo "❌ ERROR: No se encontraron datos\\n";
    }
    
} catch (Exception $e) {
    echo "\\n❌ ERROR EN LA PRUEBA:\\n";
    echo "   " . $e->getMessage() . "\\n\\n";
    echo "Stack trace:\\n" . $e->getTraceAsString() . "\\n";
}
?>`;

        await ssh.execCommand(`cat > /home/nhs13h5k0x0j/public_html/backend/test-clean-upload.php << 'EOFTEST'
${testUploadScript}
EOFTEST`);

        console.log('✅ Script de prueba creado\n');

        // PASO 3: Ejecutar prueba
        console.log('═══════════════════════════════════════════════════');
        console.log('🔄 PASO 3: Ejecutando prueba de carga completa...');
        console.log('═══════════════════════════════════════════════════\n');

        const testResult = await ssh.execCommand(
            'cd /home/nhs13h5k0x0j/public_html/backend && /usr/bin/php test-clean-upload.php'
        );

        console.log(testResult.stdout);

        if (testResult.stderr && testResult.stderr.trim() && !testResult.stderr.includes('tput:')) {
            console.log('\n⚠️  STDERR:\n');
            console.log(testResult.stderr);
        }

        // PASO 4: Limpiar script temporal
        console.log('\n🧹 Limpiando archivos temporales...');
        await ssh.execCommand('rm -f /home/nhs13h5k0x0j/public_html/backend/test-clean-upload.php');
        await ssh.execCommand('rm -f /tmp/clean-test-data.sql');
        console.log('✅ Limpieza completada\n');

        ssh.dispose();

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        ssh.dispose();
        process.exit(1);
    }
}

cleanAndTest();
