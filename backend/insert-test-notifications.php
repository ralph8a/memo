<?php
/**
 * Script para insertar datos de prueba para notificaciones
 * - Payment schedules (pagos próximos)
 * - Renewal dates (renovaciones)
 */

require_once 'config.php';
require_once 'database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    echo "🚀 Insertando datos de prueba para notificaciones...\n\n";
    
    // 1. CREAR PAYMENT SCHEDULES PARA GUILLERMO (cliente ID 2)
    echo "💰 Creando payment schedules...\n";
    
    // Verificar si existe la tabla payment_schedules
    try {
        $stmt = $db->prepare("DESCRIBE payment_schedules");
        $stmt->execute();
        echo "✅ Tabla payment_schedules existe\n";
    } catch (Exception $e) {
        echo "⚠️ Tabla payment_schedules no existe. Creándola...\n";
        
        $db->exec("
            CREATE TABLE IF NOT EXISTS payment_schedules (
                schedule_id INT AUTO_INCREMENT PRIMARY KEY,
                policy_id INT NOT NULL,
                due_date DATE NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                paid_at TIMESTAMP NULL,
                FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
                INDEX idx_due_date (due_date),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        
        echo "✅ Tabla payment_schedules creada\n";
    }
    
    // Limpiar schedules anteriores de prueba
    $stmt = $db->prepare("DELETE FROM payment_schedules WHERE policy_id IN (1, 2, 3)");
    $stmt->execute();
    
    // Insertar payment schedules para las próximas 2 semanas
    $paymentSchedules = [
        // Póliza 1 - Pago urgente (3 días)
        [1, 1, 12, 'DATE_ADD(CURDATE(), INTERVAL 3 DAY)', 150.00, 'pending'],
        // Póliza 2 - Pago próximo (7 días)
        [2, 1, 12, 'DATE_ADD(CURDATE(), INTERVAL 7 DAY)', 200.00, 'pending'],
        // Póliza 3 - Pago futuro (12 días)
        [3, 1, 12, 'DATE_ADD(CURDATE(), INTERVAL 12 DAY)', 100.00, 'pending'],
        // Póliza 1 - Pago futuro (15 días)
        [1, 2, 12, 'DATE_ADD(CURDATE(), INTERVAL 15 DAY)', 150.00, 'pending'],
    ];
    
    $insertedPayments = 0;
    
    foreach ($paymentSchedules as $schedule) {
        [$policyId, $installment, $totalInstallments, $dueDate, $amountDue, $status] = $schedule;
        
        $stmt = $db->prepare("
            INSERT INTO payment_schedules (policy_id, installment_number, total_installments, due_date, amount_due, status)
            VALUES (?, ?, ?, $dueDate, ?, ?)
        ");
        $stmt->execute([$policyId, $installment, $totalInstallments, $amountDue, $status]);
        $insertedPayments++;
        
        echo "✅ Payment schedule creado: Póliza $policyId - $$amountDue - $dueDate\n";
    }
    
    echo "\n📊 Total: $insertedPayments payment schedules creados\n\n";
    
    // 2. ACTUALIZAR RENEWAL DATES EN PÓLIZAS
    echo "📅 Actualizando fechas de renovación...\n";
    
    $renewalUpdates = [
        // Póliza 1 - Renovación urgente (15 días)
        [1, 'DATE_ADD(CURDATE(), INTERVAL 15 DAY)'],
        // Póliza 2 - Renovación próxima (30 días)
        [2, 'DATE_ADD(CURDATE(), INTERVAL 30 DAY)'],
        // Póliza 3 - Renovación futura (45 días)
        [3, 'DATE_ADD(CURDATE(), INTERVAL 45 DAY)'],
    ];
    
    $updatedPolicies = 0;
    
    foreach ($renewalUpdates as $renewal) {
        [$policyId, $renewalDate] = $renewal;
        
        $stmt = $db->prepare("
            UPDATE policies 
            SET renewal_date = $renewalDate,
                end_date = DATE_ADD($renewalDate, INTERVAL 1 YEAR)
            WHERE id = ?
        ");
        $stmt->execute([$policyId]);
        $updatedPolicies++;
        
        echo "✅ Póliza $policyId actualizada con renewal_date = $renewalDate\n";
    }
    
    echo "\n📊 Total: $updatedPolicies pólizas actualizadas\n\n";
    
    // 3. VERIFICAR DATOS
    echo "🔍 Verificando datos insertados:\n\n";
    
    echo "--- Payment Schedules ---\n";
    $stmt = $db->prepare("
        SELECT 
            ps.schedule_id,
            ps.policy_id,
            p.policy_number,
            ps.due_date,
            ps.amount_due,
            ps.status,
            DATEDIFF(ps.due_date, CURDATE()) as days_until
        FROM payment_schedules ps
        INNER JOIN policies p ON ps.policy_id = p.id
        WHERE ps.policy_id IN (1, 2, 3)
        ORDER BY ps.due_date ASC
    ");
    $stmt->execute();
    $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($schedules as $schedule) {
        $urgency = $schedule['days_until'] <= 3 ? '🔴' : ($schedule['days_until'] <= 7 ? '🟡' : '🟢');
        echo "$urgency ID:{$schedule['schedule_id']} | Póliza:{$schedule['policy_number']} | ";
        echo "Vence en: {$schedule['days_until']} días | Monto: $" . number_format($schedule['amount_due'], 2) . "\n";
    }
    
    echo "\n--- Renewal Dates ---\n";
    $stmt = $db->prepare("
        SELECT 
            id,
            policy_number,
            renewal_date,
            end_date,
            DATEDIFF(renewal_date, CURDATE()) as days_until
        FROM policies
        WHERE id IN (1, 2, 3)
        ORDER BY renewal_date ASC
    ");
    $stmt->execute();
    $renewals = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($renewals as $renewal) {
        $urgency = $renewal['days_until'] <= 15 ? '🔴' : ($renewal['days_until'] <= 30 ? '🟡' : '🟢');
        echo "$urgency Póliza:{$renewal['policy_number']} | Renovación en: {$renewal['days_until']} días\n";
        echo "   Fecha renovación: {$renewal['renewal_date']} | Fin vigencia: {$renewal['end_date']}\n";
    }
    
    echo "\n✅ Datos de prueba insertados correctamente!\n";
    echo "\n💡 Próximos pasos:\n";
    echo "   1. Login al dashboard como guillermo@demo.com\n";
    echo "   2. Abre el ícono de la campana (🔔)\n";
    echo "   3. Deberías ver notificaciones de:\n";
    echo "      - 📅 Pagos próximos a vencer\n";
    echo "      - 📄 Renovaciones de pólizas\n";
    echo "      - 💬 Comentarios sin leer\n";
    echo "      - ⚙️ Notificaciones del sistema\n";
    echo "   4. Usa los filtros para ver cada tipo\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
