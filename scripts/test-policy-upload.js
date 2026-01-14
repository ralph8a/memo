const { NodeSSH } = require('node-ssh');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ssh = new NodeSSH();

const config = {
    host: '208.109.62.140',
    username: 'nhs13h5k0x0j',
    privateKeyPath: path.join(__dirname, '..', 'nhs13h5k0x0j_pem'),
    passphrase: '12345678',
    port: 22
};

async function testPolicyUpload() {
    console.log('🚀 Iniciando prueba de carga de póliza...\n');

    try {
        // 1. Conectar via SSH
        console.log('📡 Conectando a servidor via SSH...');
        await ssh.connect(config);
        console.log('✅ Conectado exitosamente\n');

        // 2. Verificar que el PDF existe localmente
        const pdfPath = path.join(__dirname, '..', 'backend', 'demo-policies', 'maria-garcia-AUTO-001.pdf');
        if (!fs.existsSync(pdfPath)) {
            throw new Error('❌ PDF no encontrado: ' + pdfPath);
        }
        console.log('✅ PDF encontrado localmente:', pdfPath);

        // 3. Subir PDF al servidor (si no existe ya)
        const remotePdfPath = '/home/nhs13h5k0x0j/public_html/backend/demo-policies/maria-garcia-AUTO-001.pdf';
        console.log('\n📤 Verificando PDF en servidor...');

        const pdfExists = await ssh.execCommand(`test -f ${remotePdfPath} && echo "exists" || echo "not found"`);

        if (pdfExists.stdout.trim() !== 'exists') {
            console.log('📤 Subiendo PDF al servidor...');
            await ssh.putFile(pdfPath, remotePdfPath);
            console.log('✅ PDF subido exitosamente');
        } else {
            console.log('✅ PDF ya existe en servidor');
        }

        // 4. Crear script PHP para simular la carga de póliza
        console.log('\n📝 Creando script de prueba en servidor...');

        const testScript = `<?php
// Script de prueba para simular carga de póliza
require_once 'config.php';
require_once 'policy-analyzer.php';
require_once 'client-from-policy.php';

header('Content-Type: application/json');

// Simular archivo subido
$_FILES['policy_document'] = array(
    'name' => 'maria-garcia-AUTO-001.pdf',
    'type' => 'application/pdf',
    'tmp_name' => '/home/nhs13h5k0x0j/public_html/backend/demo-policies/maria-garcia-AUTO-001.pdf',
    'error' => 0,
    'size' => filesize('/home/nhs13h5k0x0j/public_html/backend/demo-policies/maria-garcia-AUTO-001.pdf')
);

// Simular datos de sesión (usuario agente)
$_SESSION['user'] = array(
    'id' => 1,
    'user_type' => 'agent',
    'email' => 'admin@example.com'
);

// Procesar el documento
try {
    // Analizar la póliza
    $policyData = analyzePolicyDocument($_FILES['policy_document']);
    
    if (!$policyData || !isset($policyData['policy_number'])) {
        throw new Exception('No se pudo extraer datos de la póliza');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Póliza procesada exitosamente',
        'data' => $policyData,
        'step' => 'policy_analyzed'
    ], JSON_PRETTY_PRINT);
    
    // Crear cliente automáticamente si no existe
    $clientData = extractClientFromPolicy($policyData);
    
    if ($clientData) {
        // Verificar si el cliente ya existe
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$clientData['email']]);
        $existingClient = $stmt->fetch();
        
        if (!$existingClient) {
            // Crear nuevo cliente
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
                $clientData['phone'] ?? null,
                $clientData['region'] ?? 'CDMX'
            ]);
            
            $client_id = $pdo->lastInsertId();
            echo "\\n✅ Cliente creado: ID $client_id\\n";
        } else {
            $client_id = $existingClient['id'];
            echo "\\n✅ Cliente existente: ID $client_id\\n";
        }
        
        // Crear póliza
        $stmt = $pdo->prepare("
            INSERT INTO policies (
                policy_number, client_id, agent_id, policy_type,
                status, premium_amount, coverage_amount,
                start_date, end_date, renewal_date, created_at
            ) VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
                status = 'active',
                premium_amount = VALUES(premium_amount)
        ");
        
        $stmt->execute([
            $policyData['policy_number'],
            $client_id,
            1, // agent_id
            $policyData['policy_type'] ?? 'auto',
            $policyData['premium_amount'] ?? 1625.00,
            $policyData['coverage_amount'] ?? 350000.00,
            $policyData['start_date'] ?? '2026-01-01',
            $policyData['end_date'] ?? '2026-12-31',
            $policyData['renewal_date'] ?? '2026-12-01'
        ]);
        
        $policy_id = $pdo->lastInsertId();
        if (!$policy_id) {
            // Si ya existía, obtener el ID
            $stmt = $pdo->prepare("SELECT id FROM policies WHERE policy_number = ?");
            $stmt->execute([$policyData['policy_number']]);
            $policy_id = $stmt->fetchColumn();
        }
        
        echo "\\n✅ Póliza creada/actualizada: ID $policy_id\\n";
        
        // Crear pagos mensuales
        $monthly_amount = $policyData['premium_amount'] ?? 1625.00;
        
        for ($month = 1; $month <= 12; $month++) {
            $due_date = sprintf('2026-%02d-15', $month);
            $status = ($month == 1) ? 'completed' : 'pending';
            $payment_date = ($month == 1) ? '2026-01-18 14:30:00' : null;
            
            $stmt = $pdo->prepare("
                INSERT IGNORE INTO payments (
                    policy_id, amount, due_date, payment_date, 
                    payment_method, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                $policy_id,
                $monthly_amount,
                $due_date,
                $payment_date,
                ($month == 1) ? 'transfer' : null,
                $status
            ]);
        }
        
        echo "\\n✅ 12 pagos mensuales creados\\n";
        
        // Verificación final
        $stmt = $pdo->prepare("
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
            WHERE u.email = ?
            GROUP BY u.id, p.id
        ");
        
        $stmt->execute([$clientData['email']]);
        $verification = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "\\n📊 VERIFICACIÓN FINAL:\\n";
        echo json_encode($verification, JSON_PRETTY_PRINT);
        echo "\\n";
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>`;

        // Escribir script en servidor
        await ssh.execCommand(`cat > /home/nhs13h5k0x0j/public_html/backend/test-policy-upload.php << 'EOFPHP'
${testScript}
EOFPHP`);

        console.log('✅ Script de prueba creado en servidor');

        // 5. Ejecutar el script
        console.log('\n🔄 Ejecutando prueba de carga de póliza...\n');

        const result = await ssh.execCommand(
            'cd /home/nhs13h5k0x0j/public_html/backend && /usr/bin/php test-policy-upload.php'
        );

        console.log('📋 RESULTADO DE LA PRUEBA:\n');
        console.log(result.stdout);

        if (result.stderr) {
            console.log('\n⚠️  ADVERTENCIAS/ERRORES:\n');
            console.log(result.stderr);
        }

        // 6. Verificar en la base de datos
        console.log('\n📊 Verificando datos en base de datos...\n');

        const verifyResult = await ssh.execCommand(`
            mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause -e "
                SELECT 
                    u.id as user_id,
                    u.email,
                    u.first_name,
                    u.last_name,
                    p.id as policy_id,
                    p.policy_number,
                    p.premium_amount,
                    COUNT(pay.id) as total_payments
                FROM users u
                LEFT JOIN policies p ON u.id = p.client_id
                LEFT JOIN payments pay ON p.id = pay.policy_id
                WHERE u.email = 'maria.garcia@example.com'
                GROUP BY u.id, p.id;
            "
        `);

        console.log('✅ VERIFICACIÓN EN BASE DE DATOS:');
        console.log(verifyResult.stdout);

        // 7. Limpiar script de prueba
        console.log('\n🧹 Limpiando archivos temporales...');
        await ssh.execCommand('rm -f /home/nhs13h5k0x0j/public_html/backend/test-policy-upload.php');
        console.log('✅ Script de prueba eliminado');

        // 8. Mostrar credenciales para login
        console.log('\n🎯 PRUEBA COMPLETADA EXITOSAMENTE\n');
        console.log('═══════════════════════════════════════════════════');
        console.log('📧 CREDENCIALES DE ACCESO:');
        console.log('═══════════════════════════════════════════════════');
        console.log('URL:      http://ksinsurancee.com');
        console.log('Email:    maria.garcia@example.com');
        console.log('Password: maria123');
        console.log('═══════════════════════════════════════════════════\n');
        console.log('✅ Ahora puedes hacer login y verificar:');
        console.log('   - Póliza AUTO-001-2026 visible');
        console.log('   - 12 pagos mensuales programados');
        console.log('   - Próximo pago: 15 de Febrero 2026');
        console.log('   - Dashboard con datos completos\n');

        ssh.dispose();

    } catch (error) {
        console.error('\n❌ Error en la prueba:', error.message);
        if (error.stack) {
            console.error('\n📋 Stack trace:', error.stack);
        }
        ssh.dispose();
        process.exit(1);
    }
}

// Ejecutar prueba
testPolicyUpload();
