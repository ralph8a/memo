/**
 * Insert test payment receipts for proof review testing
 */

const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const path = require('path');

const ssh = new NodeSSH();

const sshConfig = {
    host: '208.109.62.140',
    username: 'nhs13h5k0x0j',
    privateKeyPath: path.join(__dirname, '..', 'nhs13h5k0x0j_pem'),
    passphrase: '12345678',
    port: 22
};

const dbConfig = {
    host: 'localhost',
    user: 'nhs13h5k_krause',
    password: 'Inspiron1999#',
    database: 'nhs13h5k_krause'
};

console.log('═══════════════════════════════════════════════════════');
console.log('  📄 INSERTAR COMPROBANTES DE PRUEBA');
console.log('═══════════════════════════════════════════════════════\n');

async function insertReceipts() {
    try {
        console.log('📤 Conectando al servidor...');
        await ssh.connect(sshConfig);
        console.log('✅ Conectado al servidor\n');

        // First, create the payment_receipts table if it doesn't exist
        const createTableScript = `<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {
    $conn = new mysqli('${dbConfig.host}', '${dbConfig.user}', '${dbConfig.password}', '${dbConfig.database}');

    if ($conn->connect_error) {
        throw new Exception('Connection failed: ' . $conn->connect_error);
    }

    $conn->set_charset('utf8mb4');

    // Create payment_receipts table if it doesn't exist
    $createTableSQL = "CREATE TABLE IF NOT EXISTS payment_receipts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        payment_id INT,
        policy_id INT NOT NULL,
        user_id INT NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size INT,
        mime_type VARCHAR(100),
        extracted_amount DECIMAL(10,2),
        extracted_date DATE,
        extracted_reference VARCHAR(100),
        extracted_bank VARCHAR(100),
        verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
        verified_by INT,
        verified_at TIMESTAMP NULL,
        verification_notes TEXT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
        FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_payment_id (payment_id),
        INDEX idx_policy_id (policy_id),
        INDEX idx_user_id (user_id),
        INDEX idx_verification_status (verification_status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if ($conn->query($createTableSQL)) {
        echo json_encode(['success' => true, 'message' => 'Table created or already exists']);
    } else {
        throw new Exception('Create table failed: ' . $conn->error);
    }

    $conn->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>`;

        console.log('📝 Creando tabla payment_receipts...\n');

        // Create temporary file for table creation
        const createTableFile = path.join(__dirname, 'temp_create_table.php');
        fs.writeFileSync(createTableFile, createTableScript);

        // Upload to server
        await ssh.putFile(createTableFile, 'create_table_temp.php');

        // Execute PHP script
        const createResult = await ssh.execCommand('/usr/bin/php create_table_temp.php; rm -f create_table_temp.php', {
            cwd: '/home/nhs13h5k0x0j'
        });

        // Clean up local temp file
        fs.unlinkSync(createTableFile);

        if (createResult.code !== 0) {
            console.error('❌ Error creando tabla');
            console.error('STDOUT:', createResult.stdout);
            console.error('STDERR:', createResult.stderr);
            ssh.dispose();
            return;
        }

        // Create a simple PHP script to insert test data
        const phpScript = `<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {
    $conn = new mysqli('${dbConfig.host}', '${dbConfig.user}', '${dbConfig.password}', '${dbConfig.database}');

    if ($conn->connect_error) {
        throw new Exception('Connection failed: ' . $conn->connect_error);
    }

    $conn->set_charset('utf8mb4');

    // Get a sample client user
    $clientResult = $conn->query("SELECT id FROM users WHERE user_type = 'client' LIMIT 1");
    if ($clientResult->num_rows == 0) {
        throw new Exception('No client users found');
    }
    $clientId = $clientResult->fetch_assoc()['id'];

    // Get existing policies with their IDs
    $policiesResult = $conn->query("SELECT id FROM policies LIMIT 5");
    if ($policiesResult->num_rows == 0) {
        throw new Exception('No policies found');
    }
    $policyIds = [];
    while ($row = $policiesResult->fetch_assoc()) {
        $policyIds[] = $row['id'];
    }

    // Insert test receipts using real policy IDs
    $receipts = [
        ['comprobante_pago_enero_2026.pdf', 350.00, '2026-01-28', 'REF20260128001', 'Banco Nacional', '2026-01-28 10:30:00'],
        ['pago_poliza_auto.jpg', 475.50, '2026-01-29', 'TRANS2026012945', 'Banco Internacional', '2026-01-29 14:15:00'],
        ['transferencia_seguro_hogar.pdf', 620.00, '2026-01-30', 'TRF30012026789', 'Banco del Pacífico', '2026-01-30 09:45:00'],
        ['screenshot_pago_vida.png', 890.25, '2026-01-27', 'PAY270126XYZ', 'Banco Comercial', '2026-01-27 16:20:00'],
        ['pago_poliza_empresarial.pdf', 1250.00, '2026-01-29', 'EMP2901260045', 'Banco Empresarial', '2026-01-29 11:30:00']
    ];

    $inserted = 0;
    foreach ($receipts as $index => $receipt) {
        // Use real policy ID if available, otherwise skip
        if (!isset($policyIds[$index])) {
            break;
        }
        $policyId = $policyIds[$index];
        $fileName = $receipt[0];
        $amount = $receipt[1];
        $date = $receipt[2];
        $ref = $receipt[3];
        $bank = $receipt[4];
        $uploadedAt = $receipt[5];
        
        $stmt = $conn->prepare("
            INSERT INTO payment_receipts (
                policy_id, user_id, file_path, file_name, file_size, mime_type,
                extracted_amount, extracted_date, extracted_reference, extracted_bank,
                verification_status, uploaded_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
        ");
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $filePath = '/uploads/receipts/2026/01/receipt_' . str_pad($index + 1, 3, '0', STR_PAD_LEFT) . '.pdf';
        $fileSize = rand(180000, 900000);
        $mimeType = strpos($fileName, '.pdf') !== false ? 'application/pdf' : 
                    (strpos($fileName, '.jpg') !== false ? 'image/jpeg' : 'image/png');
        
        $stmt->bind_param("iissidsssss", 
            $policyId, $clientId, $filePath, $fileName, $fileSize, $mimeType,
            $amount, $date, $ref, $bank, $uploadedAt
        );
        
        if ($stmt->execute()) {
            $inserted++;
        } else {
            throw new Exception('Execute failed for receipt ' . ($index + 1) . ': ' . $stmt->error);
        }
    }

    // Get stats
    $result = $conn->query("
        SELECT COUNT(*) as count, SUM(extracted_amount) as total
        FROM payment_receipts 
        WHERE verification_status = 'pending'
    ");
    $stats = $result->fetch_assoc();

    echo json_encode([
        'success' => true,
        'inserted' => $inserted,
        'pending_count' => (int)$stats['count'],
        'total_amount' => (float)$stats['total']
    ]);

    $conn->close();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>`;

        console.log('📝 Ejecutando script de inserción...\n');

        // Create temporary file locally
        const tempFile = path.join(__dirname, 'temp_insert_receipts.php');
        fs.writeFileSync(tempFile, phpScript);

        // Upload to server
        await ssh.putFile(tempFile, 'insert_receipts_temp.php');

        // Execute PHP script with explicit path
        const result = await ssh.execCommand('/usr/bin/php insert_receipts_temp.php; rm -f insert_receipts_temp.php', {
            cwd: '/home/nhs13h5k0x0j'
        });

        // Clean up local temp file
        fs.unlinkSync(tempFile);

        if (result.code === 0) {
            try {
                const data = JSON.parse(result.stdout);

                if (data.success) {
                    console.log('✅ Comprobantes insertados exitosamente\n');
                    console.log('📊 Estadísticas:');
                    console.log(`   Comprobantes insertados: ${data.inserted}`);
                    console.log(`   Total pendientes: ${data.pending_count}`);
                    console.log(`   Monto total: $${parseFloat(data.total_amount).toFixed(2)}\n`);
                } else {
                    console.error('❌ Error:', data.error);
                }
            } catch (e) {
                console.log('Output:', result.stdout);
                if (result.stderr) console.error('Error:', result.stderr);
            }
        } else {
            console.error('❌ Error ejecutando script');
            console.error('STDOUT:', result.stdout);
            console.error('STDERR:', result.stderr);
        }

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  ✅ PROCESO COMPLETADO');
        console.log('═══════════════════════════════════════════════════════');

        ssh.dispose();

    } catch (error) {
        console.error('❌ Error:', error.message);
        ssh.dispose();
        process.exit(1);
    }
}

insertReceipts();
