<?php
/**
 * Payment Service - Sistema de seguimiento de pagos
 * Optimizado para GoDaddy Shared Hosting
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/auth.php';

class PaymentService {
    private $db;
    
    // Configuración de archivos
    private const UPLOAD_BASE_DIR = __DIR__ . '/../uploads/';
    private const PROOFS_DIR = 'proofs/';
    private const INVOICES_DIR = 'invoices/';
    private const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private const ALLOWED_TYPES = ['pdf', 'jpg', 'jpeg', 'png'];
    
    public function __construct() {
        $this->db = getDatabase();
        $this->ensureUploadDirectories();
    }
    
    /**
     * Crear directorios de uploads si no existen
     */
    private function ensureUploadDirectories() {
        $dirs = [
            self::UPLOAD_BASE_DIR . self::PROOFS_DIR,
            self::UPLOAD_BASE_DIR . self::INVOICES_DIR
        ];
        
        foreach ($dirs as $dir) {
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
                // Proteger con .htaccess
                file_put_contents($dir . '.htaccess', "Require all denied\n");
            }
        }
    }
    
    /**
     * Generar calendario de pagos al crear póliza
     */
    public function generatePaymentSchedule($policyId, $totalPremium, $paymentFrequency, $startDate) {
        try {
            $stmt = $this->db->prepare(
                "CALL sp_generate_payment_schedule(?, ?, ?, ?)"
            );
            
            $stmt->execute([
                $policyId,
                $totalPremium,
                $paymentFrequency,
                $startDate
            ]);
            
            return [
                'success' => true,
                'message' => 'Calendario de pagos generado correctamente'
            ];
            
        } catch (PDOException $e) {
            error_log("Error generando calendario: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error al generar calendario de pagos'
            ];
        }
    }
    
    /**
     * Obtener calendario de pagos de una póliza
     */
    public function getPaymentSchedule($policyId) {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    ps.*,
                    (SELECT COUNT(*) FROM payment_proofs pp 
                     WHERE pp.schedule_id = ps.schedule_id) as proof_count,
                    (SELECT COUNT(*) FROM policy_comments pc 
                     WHERE pc.schedule_id = ps.schedule_id) as comment_count
                FROM payment_schedules ps
                WHERE ps.policy_id = ?
                ORDER BY ps.installment_number ASC
            ");
            
            $stmt->execute([$policyId]);
            $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return [
                'success' => true,
                'schedules' => $schedules
            ];
            
        } catch (PDOException $e) {
            error_log("Error obteniendo calendario: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error al obtener calendario de pagos'
            ];
        }
    }
    
    /**
     * Subir comprobante de pago (Cliente)
     */
    public function uploadPaymentProof($scheduleId, $policyId, $clientId, $file) {
        // Validar archivo
        $validation = $this->validateUploadedFile($file);
        if (!$validation['success']) {
            return $validation;
        }
        
        try {
            $this->db->beginTransaction();
            
            // Generar nombre único
            $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $fileName = sprintf(
                'proof_%d_%d_%s.%s',
                $policyId,
                $scheduleId,
                date('YmdHis'),
                $extension
            );
            
            $filePath = self::PROOFS_DIR . $fileName;
            $fullPath = self::UPLOAD_BASE_DIR . $filePath;
            
            // Mover archivo
            if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
                throw new Exception('Error al guardar el archivo');
            }
            
            // Registrar en BD
            $stmt = $this->db->prepare("
                INSERT INTO payment_proofs (
                    schedule_id, policy_id, client_id, upload_date,
                    file_path, file_name, file_type, file_size, status
                ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, 'pending_review')
            ");
            
            $stmt->execute([
                $scheduleId,
                $policyId,
                $clientId,
                $filePath,
                $fileName,
                $extension,
                $file['size']
            ]);
            
            $proofId = $this->db->lastInsertId();
            
            // Actualizar estado del pago
            $this->updatePaymentStatus($scheduleId, 'in_review', 'client', $clientId);
            
            // Notificar al agente
            $this->notifyAgent($scheduleId, 'proof_uploaded', [
                'proof_id' => $proofId,
                'file_name' => $fileName
            ]);
            
            // Registrar auditoría
            $this->logAudit($scheduleId, 'proof_uploaded', null, $fileName, 'client', $clientId);
            
            $this->db->commit();
            
            return [
                'success' => true,
                'proof_id' => $proofId,
                'message' => 'Comprobante subido correctamente. Tu agente lo revisará pronto.'
            ];
            
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Error subiendo comprobante: " . $e->getMessage());
            
            // Limpiar archivo si fue creado
            if (isset($fullPath) && file_exists($fullPath)) {
                unlink($fullPath);
            }
            
            return [
                'success' => false,
                'error' => 'Error al subir el comprobante'
            ];
        }
    }
    
    /**
     * Validar archivo subido
     */
    private function validateUploadedFile($file) {
        if (!isset($file['error']) || is_array($file['error'])) {
            return ['success' => false, 'error' => 'Archivo inválido'];
        }
        
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'error' => 'Error al subir archivo'];
        }
        
        if ($file['size'] > self::MAX_FILE_SIZE) {
            return ['success' => false, 'error' => 'Archivo muy grande (máx 5MB)'];
        }
        
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, self::ALLOWED_TYPES)) {
            return ['success' => false, 'error' => 'Tipo de archivo no permitido'];
        }
        
        // Verificar MIME type real
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        $allowedMimes = [
            'application/pdf',
            'image/jpeg',
            'image/png'
        ];
        
        if (!in_array($mimeType, $allowedMimes)) {
            return ['success' => false, 'error' => 'Tipo de archivo no válido'];
        }
        
        return ['success' => true];
    }
    
    /**
     * Revisar comprobante (Agente)
     */
    public function reviewPaymentProof($proofId, $agentId, $approved, $notes = null) {
        try {
            $this->db->beginTransaction();
            
            $status = $approved ? 'approved' : 'rejected';
            
            // Actualizar comprobante
            $stmt = $this->db->prepare("
                UPDATE payment_proofs
                SET status = ?,
                    reviewed_by = ?,
                    review_date = NOW(),
                    review_notes = ?
                WHERE proof_id = ?
            ");
            
            $stmt->execute([$status, $agentId, $notes, $proofId]);
            
            // Obtener datos del comprobante
            $stmt = $this->db->prepare("
                SELECT schedule_id, policy_id, client_id
                FROM payment_proofs
                WHERE proof_id = ?
            ");
            $stmt->execute([$proofId]);
            $proof = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($approved) {
                // Cambiar a "paid" - esperando factura de aseguradora
                $this->updatePaymentStatus($proof['schedule_id'], 'paid', 'agent', $agentId);
                
                // Notificar al cliente
                $this->notifyClient($proof['client_id'], $proof['schedule_id'], 'proof_approved');
            } else {
                // Volver a awaiting_proof
                $this->updatePaymentStatus($proof['schedule_id'], 'awaiting_proof', 'agent', $agentId);
                
                // Notificar al cliente con razón
                $this->notifyClient($proof['client_id'], $proof['schedule_id'], 'proof_rejected', [
                    'reason' => $notes
                ]);
            }
            
            // Auditoría
            $this->logAudit(
                $proof['schedule_id'],
                'proof_reviewed',
                'pending_review',
                $status,
                'agent',
                $agentId,
                $notes
            );
            
            $this->db->commit();
            
            return [
                'success' => true,
                'message' => $approved ? 'Comprobante aprobado' : 'Comprobante rechazado'
            ];
            
        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("Error revisando comprobante: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error al revisar comprobante'
            ];
        }
    }
    
    /**
     * Subir factura de aseguradora y liquidar pago
     */
    public function uploadInsurerInvoice($scheduleId, $policyId, $invoiceNumber, $agentId, $file) {
        $validation = $this->validateUploadedFile($file);
        if (!$validation['success']) {
            return $validation;
        }
        
        try {
            $this->db->beginTransaction();
            
            $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $fileName = sprintf(
                'invoice_%d_%d_%s.%s',
                $policyId,
                $scheduleId,
                date('YmdHis'),
                $extension
            );
            
            $filePath = self::INVOICES_DIR . $fileName;
            $fullPath = self::UPLOAD_BASE_DIR . $filePath;
            
            if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
                throw new Exception('Error al guardar factura');
            }
            
            // Registrar factura
            $stmt = $this->db->prepare("
                INSERT INTO insurer_invoices (
                    schedule_id, policy_id, invoice_number, invoice_date,
                    file_path, file_name, uploaded_by
                ) VALUES (?, ?, ?, CURDATE(), ?, ?, ?)
            ");
            
            $stmt->execute([
                $scheduleId,
                $policyId,
                $invoiceNumber,
                $filePath,
                $fileName,
                $agentId
            ]);
            
            $invoiceId = $this->db->lastInsertId();
            
            // Cambiar estado a liquidated
            $this->updatePaymentStatus($scheduleId, 'liquidated', 'agent', $agentId);
            
            // Obtener datos del cliente para enviar factura
            $stmt = $this->db->prepare("
                SELECT c.client_id, c.email, c.first_name
                FROM payment_schedules ps
                INNER JOIN policies p ON ps.policy_id = p.policy_id
                INNER JOIN clients c ON p.client_id = c.client_id
                WHERE ps.schedule_id = ?
            ");
            $stmt->execute([$scheduleId]);
            $clientData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // TODO: Enviar email con factura adjunta
            // $this->sendInvoiceEmail($clientData, $fullPath);
            
            $this->logAudit($scheduleId, 'invoice_uploaded', 'paid', 'liquidated', 'agent', $agentId);
            
            $this->db->commit();
            
            return [
                'success' => true,
                'invoice_id' => $invoiceId,
                'message' => 'Factura registrada correctamente'
            ];
            
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Error subiendo factura: " . $e->getMessage());
            
            if (isset($fullPath) && file_exists($fullPath)) {
                unlink($fullPath);
            }
            
            return [
                'success' => false,
                'error' => 'Error al subir factura'
            ];
        }
    }
    
    /**
     * Actualizar estado de pago con auditoría
     */
    public function updatePaymentStatus($scheduleId, $newStatus, $performedByType, $performedById, $notes = null) {
        // Obtener estado actual
        $stmt = $this->db->prepare("SELECT status FROM payment_schedules WHERE schedule_id = ?");
        $stmt->execute([$scheduleId]);
        $currentStatus = $stmt->fetchColumn();
        
        // Actualizar
        $stmt = $this->db->prepare("
            UPDATE payment_schedules
            SET status = ?, updated_at = NOW()
            WHERE schedule_id = ?
        ");
        $stmt->execute([$newStatus, $scheduleId]);
        
        // Registrar cambio
        $this->logAudit($scheduleId, 'status_change', $currentStatus, $newStatus, $performedByType, $performedById, $notes);
        
        return true;
    }
    
    /**
     * Registrar acción en audit log
     */
    private function logAudit($scheduleId, $actionType, $oldValue, $newValue, $performedByType, $performedById, $notes = null) {
        $stmt = $this->db->prepare("
            INSERT INTO payment_audit_log (
                schedule_id, action_type, old_value, new_value,
                performed_by_type, performed_by_id, ip_address, user_agent, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $scheduleId,
            $actionType,
            $oldValue,
            $newValue,
            $performedByType,
            $performedById,
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null,
            $notes
        ]);
    }
    
    /**
     * Notificar al agente
     */
    private function notifyAgent($scheduleId, $notificationType, $data = []) {
        // Obtener datos del agente
        $stmt = $this->db->prepare("
            SELECT a.agent_id, a.email, p.policy_id, c.client_id
            FROM payment_schedules ps
            INNER JOIN policies p ON ps.policy_id = p.policy_id
            INNER JOIN agents a ON p.agent_id = a.agent_id
            INNER JOIN clients c ON p.client_id = c.client_id
            WHERE ps.schedule_id = ?
        ");
        $stmt->execute([$scheduleId]);
        $agentData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Registrar notificación in-app
        $stmt = $this->db->prepare("
            INSERT INTO payment_notifications (
                schedule_id, policy_id, client_id, notification_type,
                notification_channel, sent_at, notification_data
            ) VALUES (?, ?, ?, ?, 'in_app', NOW(), ?)
        ");
        
        $stmt->execute([
            $scheduleId,
            $agentData['policy_id'],
            $agentData['client_id'],
            $notificationType,
            json_encode($data)
        ]);
        
        // TODO: Enviar email al agente
    }
    
    /**
     * Notificar al cliente
     */
    private function notifyClient($clientId, $scheduleId, $notificationType, $data = []) {
        $stmt = $this->db->prepare("
            SELECT policy_id FROM payment_schedules WHERE schedule_id = ?
        ");
        $stmt->execute([$scheduleId]);
        $policyId = $stmt->fetchColumn();
        
        $stmt = $this->db->prepare("
            INSERT INTO payment_notifications (
                schedule_id, policy_id, client_id, notification_type,
                notification_channel, sent_at, notification_data
            ) VALUES (?, ?, ?, ?, 'in_app', NOW(), ?)
        ");
        
        $stmt->execute([
            $scheduleId,
            $policyId,
            $clientId,
            $notificationType,
            json_encode($data)
        ]);
    }
    
    /**
     * Obtener notificaciones del cliente
     */
    public function getClientNotifications($clientId, $limit = 20) {
        $stmt = $this->db->prepare("
            SELECT n.*, ps.due_date, ps.amount_due, p.policy_number
            FROM payment_notifications n
            INNER JOIN payment_schedules ps ON n.schedule_id = ps.schedule_id
            INNER JOIN policies p ON n.policy_id = p.policy_id
            WHERE n.client_id = ?
            ORDER BY n.sent_at DESC
            LIMIT ?
        ");
        
        $stmt->execute([$clientId, $limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Obtener comprobantes pendientes de revisión (Agente)
     */
    public function getPendingProofReviews($agentId) {
        try {
            $stmt = $this->db->prepare("CALL sp_get_pending_proof_reviews(?)");
            $stmt->execute([$agentId]);
            
            return [
                'success' => true,
                'proofs' => $stmt->fetchAll(PDO::FETCH_ASSOC)
            ];
            
        } catch (PDOException $e) {
            error_log("Error obteniendo revisiones: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error al obtener revisiones pendientes'
            ];
        }
    }
    
    /**
     * Descargar archivo (con validación de permisos)
     */
    public function downloadFile($fileType, $fileId, $userId, $userType) {
        // fileType: 'proof' o 'invoice'
        // Validar permisos antes de permitir descarga
        
        if ($fileType === 'proof') {
            $stmt = $this->db->prepare("
                SELECT pp.file_path, pp.file_name, p.client_id, p.agent_id
                FROM payment_proofs pp
                INNER JOIN policies p ON pp.policy_id = p.policy_id
                WHERE pp.proof_id = ?
            ");
            $stmt->execute([$fileId]);
            
        } else if ($fileType === 'invoice') {
            $stmt = $this->db->prepare("
                SELECT ii.file_path, ii.file_name, p.client_id, p.agent_id
                FROM insurer_invoices ii
                INNER JOIN policies p ON ii.policy_id = p.policy_id
                WHERE ii.invoice_id = ?
            ");
            $stmt->execute([$fileId]);
        } else {
            return ['success' => false, 'error' => 'Tipo de archivo inválido'];
        }
        
        $file = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$file) {
            return ['success' => false, 'error' => 'Archivo no encontrado'];
        }
        
        // Validar permisos
        $hasPermission = false;
        if ($userType === 'client' && $file['client_id'] == $userId) {
            $hasPermission = true;
        } else if ($userType === 'agent' && $file['agent_id'] == $userId) {
            $hasPermission = true;
        }
        
        if (!$hasPermission) {
            return ['success' => false, 'error' => 'Sin permisos para descargar'];
        }
        
        $fullPath = self::UPLOAD_BASE_DIR . $file['file_path'];
        
        if (!file_exists($fullPath)) {
            return ['success' => false, 'error' => 'Archivo no encontrado en servidor'];
        }
        
        return [
            'success' => true,
            'file_path' => $fullPath,
            'file_name' => $file['file_name']
        ];
    }
}
