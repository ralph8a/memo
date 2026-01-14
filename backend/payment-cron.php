<?php
/**
 * Cron Job - Notificaciones de pagos
 * Configurar en cPanel para ejecutar diariamente a las 9:00 AM
 * 
 * Comando cron: /usr/bin/php /home/username/public_html/backend/payment-cron.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/payment-service.php';
require_once __DIR__ . '/email-service.php';

// Evitar ejecución desde navegador
if (php_sapi_name() !== 'cli' && !isset($_GET['cron_key'])) {
    die('Acceso denegado');
}

// Validar cron key si se ejecuta desde web
if (php_sapi_name() !== 'cli') {
    $cronKey = $_GET['cron_key'] ?? '';
    $validKey = getenv('CRON_SECRET_KEY') ?: 'change_this_in_production';
    
    if ($cronKey !== $validKey) {
        die('Clave inválida');
    }
}

$db = getDatabase();
$paymentService = new PaymentService();

echo "[" . date('Y-m-d H:i:s') . "] Iniciando cron de pagos...\n";

try {
    // ============================================
    // 1. NOTIFICAR PAGOS PRÓXIMOS (7 días)
    // ============================================
    
    echo "- Buscando pagos próximos a vencer...\n";
    
    $stmt = $db->prepare("CALL sp_get_upcoming_due_payments(7)");
    $stmt->execute();
    $upcomingPayments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt->closeCursor();
    
    echo "  Encontrados: " . count($upcomingPayments) . "\n";
    
    foreach ($upcomingPayments as $payment) {
        // Solo notificar si es pago manual (no domiciliación)
        if ($payment['payment_method'] !== 'domiciliación' && 
            $payment['payment_method'] !== 'tarjeta') {
            
            // Verificar si ya se envió notificación
            $stmt = $db->prepare("
                SELECT notification_id 
                FROM payment_notifications
                WHERE schedule_id = ? 
                AND notification_type = 'due_date_reminder'
                AND sent_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
            ");
            $stmt->execute([$payment['schedule_id']]);
            
            if ($stmt->rowCount() == 0) {
                // Enviar notificación
                sendDueDateReminder($payment);
                echo "  ✓ Notificación enviada: Póliza {$payment['policy_number']}\n";
            }
        }
    }
    
    // ============================================
    // 2. PROCESAR PAGOS VENCIDOS
    // ============================================
    
    echo "- Buscando pagos vencidos...\n";
    
    $stmt = $db->prepare("CALL sp_get_overdue_payments()");
    $stmt->execute();
    $overduePayments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt->closeCursor();
    
    echo "  Encontrados: " . count($overduePayments) . "\n";
    
    foreach ($overduePayments as $payment) {
        // Calcular días de atraso
        $dueDate = new DateTime($payment['due_date']);
        $today = new DateTime();
        $daysOverdue = $today->diff($dueDate)->days;
        
        // Notificar según días de atraso
        if ($daysOverdue == 1) {
            sendOverdueNotification($payment, '1 día');
        } else if ($daysOverdue == 3) {
            sendOverdueNotification($payment, '3 días');
        } else if ($daysOverdue == 7) {
            sendOverdueNotification($payment, '7 días');
        } else if ($daysOverdue == 15) {
            sendOverdueNotification($payment, '15 días - URGENTE');
        }
    }
    
    // ============================================
    // 3. PROCESAR PAGOS AUTOMÁTICOS (Domiciliación)
    // ============================================
    
    echo "- Procesando pagos automáticos...\n";
    
    $stmt = $db->prepare("
        SELECT ps.*, p.policy_number, c.client_id, c.email, c.first_name, c.last_name
        FROM payment_schedules ps
        INNER JOIN policies p ON ps.policy_id = p.policy_id
        INNER JOIN clients c ON p.client_id = c.client_id
        WHERE ps.status = 'pending'
        AND ps.payment_method IN ('domiciliación', 'tarjeta')
        AND DATE(ps.due_date) = CURDATE()
    ");
    $stmt->execute();
    $automaticPayments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "  Encontrados: " . count($automaticPayments) . "\n";
    
    foreach ($automaticPayments as $payment) {
        // Cambiar estado a "payment_attempted"
        // El agente debe verificar manualmente y actualizar el estado
        
        $stmt = $db->prepare("
            UPDATE payment_schedules
            SET status = 'payment_attempted', updated_at = NOW()
            WHERE schedule_id = ?
        ");
        $stmt->execute([$payment['schedule_id']]);
        
        // Registrar auditoría
        $stmt = $db->prepare("
            INSERT INTO payment_audit_log (
                schedule_id, action_type, old_value, new_value,
                performed_by_type, performed_by_id, notes
            ) VALUES (?, 'status_change', 'pending', 'payment_attempted', 'system', 0, 'Intento automático programado')
        ");
        $stmt->execute([$payment['schedule_id']]);
        
        // Notificar al agente para verificar
        notifyAgentForVerification($payment);
        
        echo "  ✓ Estado actualizado: Póliza {$payment['policy_number']}\n";
    }
    
    // ============================================
    // 4. RECORDATORIOS DE COMPROBANTES PENDIENTES
    // ============================================
    
    echo "- Revisando comprobantes sin enviar...\n";
    
    $stmt = $db->prepare("
        SELECT ps.*, p.policy_number, c.client_id, c.email, c.first_name
        FROM payment_schedules ps
        INNER JOIN policies p ON ps.policy_id = p.policy_id
        INNER JOIN clients c ON p.client_id = c.client_id
        WHERE ps.status = 'awaiting_proof'
        AND ps.due_date < DATE_SUB(NOW(), INTERVAL 3 DAY)
        AND NOT EXISTS (
            SELECT 1 FROM payment_notifications pn
            WHERE pn.schedule_id = ps.schedule_id
            AND pn.notification_type = 'proof_reminder'
            AND pn.sent_at > DATE_SUB(NOW(), INTERVAL 3 DAY)
        )
    ");
    $stmt->execute();
    $proofReminders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "  Encontrados: " . count($proofReminders) . "\n";
    
    foreach ($proofReminders as $payment) {
        sendProofReminder($payment);
        echo "  ✓ Recordatorio enviado: Póliza {$payment['policy_number']}\n";
    }
    
    echo "\n[" . date('Y-m-d H:i:s') . "] Cron finalizado exitosamente\n";
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    error_log("Payment Cron Error: " . $e->getMessage());
}

/**
 * Funciones auxiliares
 */

function sendDueDateReminder($payment) {
    global $db;
    
    $message = sprintf(
        "Tu pago de póliza %s vence el %s. Monto: $%s",
        $payment['policy_number'],
        date('d/m/Y', strtotime($payment['due_date'])),
        number_format($payment['amount_due'], 2)
    );
    
    // Notificación in-app
    $stmt = $db->prepare("
        INSERT INTO payment_notifications (
            schedule_id, policy_id, client_id, notification_type,
            notification_channel, sent_at, notification_data
        ) VALUES (?, ?, ?, 'due_date_reminder', 'in_app', NOW(), ?)
    ");
    $stmt->execute([
        $payment['schedule_id'],
        $payment['policy_id'],
        $payment['client_id'],
        json_encode(['message' => $message])
    ]);
    
    // Email (opcional)
    // sendEmail($payment['email'], 'Recordatorio de Pago', $message);
}

function sendOverdueNotification($payment, $overdueMessage) {
    global $db;
    
    // Verificar si ya se envió para este nivel de atraso
    $stmt = $db->prepare("
        SELECT notification_id FROM payment_notifications
        WHERE schedule_id = ?
        AND notification_type = 'overdue_payment'
        AND notification_data LIKE ?
        AND sent_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
    ");
    $stmt->execute([$payment['schedule_id'], '%' . $overdueMessage . '%']);
    
    if ($stmt->rowCount() > 0) {
        return; // Ya se envió
    }
    
    $message = sprintf(
        "PAGO VENCIDO: Póliza %s - Atraso de %s. Por favor, sube tu comprobante de pago.",
        $payment['policy_number'],
        $overdueMessage
    );
    
    $stmt = $db->prepare("
        INSERT INTO payment_notifications (
            schedule_id, policy_id, client_id, notification_type,
            notification_channel, sent_at, notification_data
        ) VALUES (?, ?, ?, 'overdue_payment', 'in_app', NOW(), ?)
    ");
    $stmt->execute([
        $payment['schedule_id'],
        $payment['policy_id'],
        $payment['client_id'],
        json_encode(['message' => $message, 'overdue' => $overdueMessage])
    ]);
}

function notifyAgentForVerification($payment) {
    global $db;
    
    // Obtener agente
    $stmt = $db->prepare("
        SELECT a.agent_id, a.email
        FROM policies p
        INNER JOIN agents a ON p.agent_id = a.agent_id
        WHERE p.policy_id = ?
    ");
    $stmt->execute([$payment['policy_id']]);
    $agent = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$agent) return;
    
    $message = sprintf(
        "Verificar cargo automático: Póliza %s - Cliente: %s %s",
        $payment['policy_number'],
        $payment['first_name'],
        $payment['last_name']
    );
    
    $stmt = $db->prepare("
        INSERT INTO payment_notifications (
            schedule_id, policy_id, client_id, notification_type,
            notification_channel, sent_at, notification_data
        ) VALUES (?, ?, ?, 'verification_required', 'in_app', NOW(), ?)
    ");
    $stmt->execute([
        $payment['schedule_id'],
        $payment['policy_id'],
        $agent['agent_id'],
        json_encode(['message' => $message])
    ]);
}

function sendProofReminder($payment) {
    global $db;
    
    $message = sprintf(
        "Recordatorio: Aún no has subido el comprobante de pago para la póliza %s (vencido hace 3 días)",
        $payment['policy_number']
    );
    
    $stmt = $db->prepare("
        INSERT INTO payment_notifications (
            schedule_id, policy_id, client_id, notification_type,
            notification_channel, sent_at, notification_data
        ) VALUES (?, ?, ?, 'proof_reminder', 'in_app', NOW(), ?)
    ");
    $stmt->execute([
        $payment['schedule_id'],
        $payment['policy_id'],
        $payment['client_id'],
        json_encode(['message' => $message])
    ]);
}
