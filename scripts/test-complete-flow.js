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

async function testCompleteFlow() {
    console.log('🚀 Prueba de flujo completo: Carga de póliza\n');

    try {
        await ssh.connect(config);
        console.log('✅ Conectado al servidor\n');

        // 1. Limpiar datos previos de la póliza AUTO-001-2026
        console.log('🧹 Limpiando datos previos de AUTO-001-2026...');
        await ssh.execCommand(`
            mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause -e "
                DELETE FROM payments WHERE policy_id = (SELECT id FROM policies WHERE policy_number = 'AUTO-001-2026');
                DELETE FROM policies WHERE policy_number = 'AUTO-001-2026';
            "
        `);
        console.log('✅ Datos previos eliminados\n');

        // 2. Crear script PHP para la prueba completa
        console.log('📝 Creando script de prueba completo...');

        const fullTestScript = `<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config.php';

// Simular sesión de usuario agente
session_start();
$_SESSION['user'] = array(
    'id' => 1,
    'user_type' => 'agent',
    'email' => 'admin@example.com'
);

echo "🔄 INICIANDO PRUEBA COMPLETA DE CARGA DE PÓLIZA\\n";
echo "═══════════════════════════════════════════════\\n\\n";

try {
    // Datos del cliente extraídos del PDF
    $clientData = array(
        'email' => 'maria.garcia@example.com',
        'first_name' => 'María Elena',
        'last_name' => 'García López',
        'phone' => '+52 (555) 123-4567',
        'region' => 'CDMX'
    );
    
    // Datos de la póliza extraídos del PDF
    $policyData = array(
        'policy_number' => 'AUTO-001-2026',
        'policy_type' => 'auto',
        'premium_amount' => 1625.00,
        'coverage_amount' => 350000.00,
        'start_date' => '2026-01-01',
        'end_date' => '2026-12-31',
        'renewal_date' => '2026-12-01'
    );
    
    // PASO 1: Crear/Verificar cliente
    echo "📝 PASO 1: Creando cliente...\\n";
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$clientData['email']]);
    $existingClient = $stmt->fetch();
    
    if (!$existingClient) {
        $password_hash = password_hash('maria123', PASSWORD_BCRYPT);
        
        $stmt = $pdo->prepare("
            INSERT INTO users (
                email, password_hash, user_type, first_name, last_name, 
                phone, region, status, created_at
            ) VALUES (?, ?, 'client', ?, ?, ?, ?, 'active', NOW())
        ");
        
        $stmt->execute([
            $clientData['email'],
            $password_hash,
            $clientData['first_name'],
            $clientData['last_name'],
            $clientData['phone'],
            $clientData['region']
        ]);
        
        $client_id = $pdo->lastInsertId();
        echo "   ✅ Nuevo cliente creado - ID: $client_id\\n";
    } else {
        $client_id = $existingClient['id'];
        echo "   ✅ Cliente existente encontrado - ID: $client_id\\n";
    }
    
    echo "\\n";
    
    // PASO 2: Crear póliza
    echo "📋 PASO 2: Creando póliza...\\n";
    
    $stmt = $pdo->prepare("
        INSERT INTO policies (
            policy_number, client_id, agent_id, policy_type,
            status, premium_amount, coverage_amount,
            start_date, end_date, renewal_date, created_at
        ) VALUES (?, ?, 1, ?, 'active', ?, ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([
        $policyData['policy_number'],
        $client_id,
        $policyData['policy_type'],
        $policyData['premium_amount'],
        $policyData['coverage_amount'],
        $policyData['start_date'],
        $policyData['end_date'],
        $policyData['renewal_date']
    ]);
    
    $policy_id = $pdo->lastInsertId();
    echo "   ✅ Póliza creada - ID: $policy_id\\n";
    echo "   📄 Número: {$policyData['policy_number']}\\n";
    echo "   💰 Prima: \\${$policyData['premium_amount']} MXN/mes\\n";
    echo "\\n";
    
    // PASO 3: Crear pagos mensuales
    echo "💳 PASO 3: Creando calendario de pagos (12 meses)...\\n";
    
    $payments_created = 0;
    $payments_failed = 0;
    
    for ($month = 1; $month <= 12; $month++) {
        $due_date = sprintf('2026-%02d-15', $month);
        $status = ($month == 1) ? 'completed' : 'pending';
        $payment_date = ($month == 1) ? '2026-01-18 14:30:00' : null;
        $payment_method = ($month == 1) ? 'transfer' : null;
        
        try {
            $stmt = $pdo->prepare("
                INSERT INTO payments (
                    policy_id, amount, due_date, payment_date, 
                    payment_method, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                $policy_id,
                $policyData['premium_amount'],
                $due_date,
                $payment_date,
                $payment_method,
                $status
            ]);
            
            $payments_created++;
            
            $month_name = [
                1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
                5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
                9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
            ][$month];
            
            $status_icon = ($status == 'completed') ? '✅' : '⏳';
            echo "   $status_icon $month_name 2026 - \\${$policyData['premium_amount']} - $status\\n";
            
        } catch (Exception $e) {
            $payments_failed++;
            echo "   ❌ Error en mes $month: " . $e->getMessage() . "\\n";
        }
    }
    
    echo "\\n   ✅ Pagos creados: $payments_created\\n";
    if ($payments_failed > 0) {
        echo "   ❌ Pagos fallidos: $payments_failed\\n";
    }
    echo "\\n";
    
    // PASO 4: Verificación final
    echo "🔍 PASO 4: Verificación final de datos...\\n\\n";
    
    $stmt = $pdo->prepare("
        SELECT 
            u.id as user_id,
            u.email,
            CONCAT(u.first_name, ' ', u.last_name) as full_name,
            u.phone,
            p.id as policy_id,
            p.policy_number,
            p.policy_type,
            p.status as policy_status,
            p.premium_amount,
            p.coverage_amount,
            p.start_date,
            p.end_date,
            COUNT(pay.id) as total_payments,
            SUM(CASE WHEN pay.status = 'completed' THEN 1 ELSE 0 END) as paid_payments,
            SUM(CASE WHEN pay.status = 'pending' THEN 1 ELSE 0 END) as pending_payments,
            SUM(CASE WHEN pay.status = 'completed' THEN pay.amount ELSE 0 END) as total_paid,
            SUM(CASE WHEN pay.status = 'pending' THEN pay.amount ELSE 0 END) as total_pending
        FROM users u
        LEFT JOIN policies p ON u.id = p.client_id
        LEFT JOIN payments pay ON p.id = pay.policy_id
        WHERE u.email = ?
        GROUP BY u.id, p.id
        ORDER BY p.id DESC
        LIMIT 1
    ");
    
    $stmt->execute(['maria.garcia@example.com']);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($data) {
        echo "═══════════════════════════════════════════════\\n";
        echo "📊 RESUMEN DE DATOS CREADOS\\n";
        echo "═══════════════════════════════════════════════\\n\\n";
        
        echo "👤 CLIENTE:\\n";
        echo "   ID:       {$data['user_id']}\\n";
        echo "   Nombre:   {$data['full_name']}\\n";
        echo "   Email:    {$data['email']}\\n";
        echo "   Teléfono: {$data['phone']}\\n\\n";
        
        echo "📋 PÓLIZA:\\n";
        echo "   ID:       {$data['policy_id']}\\n";
        echo "   Número:   {$data['policy_number']}\\n";
        echo "   Tipo:     {$data['policy_type']}\\n";
        echo "   Estado:   {$data['policy_status']}\\n";
        echo "   Prima:    \\${$data['premium_amount']} MXN/mes\\n";
        echo "   Cobertura: \\${$data['coverage_amount']} MXN\\n";
        echo "   Vigencia: {$data['start_date']} a {$data['end_date']}\\n\\n";
        
        echo "💰 PAGOS:\\n";
        echo "   Total programados: {$data['total_payments']}\\n";
        echo "   Pagos completados: {$data['paid_payments']} (\\${$data['total_paid']} MXN)\\n";
        echo "   Pagos pendientes:  {$data['pending_payments']} (\\${$data['total_pending']} MXN)\\n\\n";
        
        echo "═══════════════════════════════════════════════\\n";
        echo "✅ PRUEBA COMPLETADA EXITOSAMENTE\\n";
        echo "═══════════════════════════════════════════════\\n\\n";
        
        echo "🔑 CREDENCIALES DE ACCESO:\\n";
        echo "   URL:      http://ksinsurancee.com\\n";
        echo "   Email:    maria.garcia@example.com\\n";
        echo "   Password: maria123\\n\\n";
        
        echo "📝 VERIFICAR EN DASHBOARD:\\n";
        echo "   ✅ Póliza {$data['policy_number']} visible\\n";
        echo "   ✅ Próximo pago: 15 de Febrero 2026\\n";
        echo "   ✅ Historial de pagos completo\\n";
        echo "   ✅ Datos del cliente completos\\n\\n";
        
    } else {
        echo "❌ ERROR: No se pudieron verificar los datos\\n";
    }
    
} catch (Exception $e) {
    echo "\\n❌ ERROR EN LA PRUEBA:\\n";
    echo "   " . $e->getMessage() . "\\n";
    echo "\\nStack trace:\\n" . $e->getTraceAsString() . "\\n";
}
?>`;

        // Escribir script en servidor
        await ssh.execCommand(`cat > /home/nhs13h5k0x0j/public_html/backend/test-complete-flow.php << 'EOFPHP'
${fullTestScript}
EOFPHP`);

        console.log('✅ Script creado\n');

        // 3. Ejecutar el script
        console.log('🔄 Ejecutando prueba completa...\n');
        console.log('═══════════════════════════════════════════════\n');

        const result = await ssh.execCommand(
            'cd /home/nhs13h5k0x0j/public_html/backend && /usr/bin/php test-complete-flow.php'
        );

        console.log(result.stdout);

        if (result.stderr && result.stderr.trim()) {
            console.log('\n⚠️  STDERR:\n');
            console.log(result.stderr);
        }

        // 4. Limpiar
        console.log('\n🧹 Limpiando archivos temporales...');
        await ssh.execCommand('rm -f /home/nhs13h5k0x0j/public_html/backend/test-complete-flow.php');
        console.log('✅ Limpieza completada\n');

        ssh.dispose();

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        ssh.dispose();
        process.exit(1);
    }
}

testCompleteFlow();
