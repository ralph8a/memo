<?php
/**
 * API de Notificaciones Contextuales
 * Maneja notificaciones específicas por tipo de usuario (cliente/agente)
 */

require_once 'config.php';
require_once 'database.php';
require_once 'auth.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

class NotificationService {
    private $conn;
    
    public function __construct($dbConnection) {
        $this->conn = $dbConnection;
    }
    
    /**
     * Obtener notificaciones específicas para un usuario
     */
    public function getUserNotifications($userId, $userType, $limit = 20) {
        try {
            // Obtener notificaciones según el tipo de usuario
            if ($userType === 'agent') {
                return $this->getAgentNotifications($userId, $limit);
            } else {
                return $this->getClientNotifications($userId, $limit);
            }
        } catch (Exception $e) {
            error_log("Error getting notifications: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Notificaciones específicas para clientes
     */
    private function getClientNotifications($clientId, $limit) {
        $notifications = [];
        
        // 1. Pagos próximos a vencer
        $stmt = $this->conn->prepare("
            SELECT 
                ps.schedule_id,
                ps.policy_id,
                ps.due_date,
                ps.amount,
                p.policy_number,
                p.policy_type,
                DATEDIFF(ps.due_date, CURDATE()) as days_until_due
            FROM payment_schedules ps
            INNER JOIN policies p ON ps.policy_id = p.id
            WHERE p.client_id = ?
            AND ps.status = 'pending'
            AND ps.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            ORDER BY ps.due_date ASC
            LIMIT ?
        ");
        
        $stmt->bind_param("si", $clientId, $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $notifications[] = [
                'id' => 'payment_due_' . $row['schedule_id'],
                'type' => 'payment',
                'title' => 'Pago próximo a vencer',
                'message' => "Tu pago de póliza {$row['policy_number']} vence en {$row['days_until_due']} día(s)",
                'time' => $this->getRelativeTime($row['due_date']),
                'read' => false,
                'priority' => $row['days_until_due'] <= 3 ? 'high' : 'normal',
                'data' => [
                    'policy_id' => $row['policy_id'],
                    'schedule_id' => $row['schedule_id'],
                    'amount' => $row['amount'],
                    'due_date' => $row['due_date']
                ],
                'actions' => [
                    ['label' => 'Realizar pago', 'action' => 'payment', 'policyId' => $row['policy_id']],
                    ['label' => 'Ver póliza', 'action' => 'viewPolicy', 'policyId' => $row['policy_id']]
                ]
            ];
        }
        
        // 2. Comentarios nuevos del agente en pólizas
        $stmt = $this->conn->prepare("
            SELECT 
                pc.comment_id,
                pc.policy_id,
                pc.comment_text,
                pc.created_at,
                p.policy_number,
                u.name as agent_name
            FROM policy_comments pc
            INNER JOIN policies p ON pc.policy_id = p.id
            LEFT JOIN users u ON pc.created_by = u.id
            WHERE p.client_id = ?
            AND pc.created_by != ?
            AND pc.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
            AND pc.is_read_by_client = FALSE
            ORDER BY pc.created_at DESC
            LIMIT ?
        ");
        
        $stmt->bind_param("ssi", $clientId, $clientId, $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $notifications[] = [
                'id' => 'comment_' . $row['comment_id'],
                'type' => 'comment',
                'title' => 'Nuevo comentario del agente',
                'message' => "{$row['agent_name']} ha dejado un comentario en tu póliza {$row['policy_number']}",
                'time' => $this->getRelativeTime($row['created_at']),
                'read' => false,
                'priority' => 'normal',
                'data' => [
                    'policy_id' => $row['policy_id'],
                    'comment_id' => $row['comment_id']
                ],
                'actions' => [
                    ['label' => 'Ver comentario', 'action' => 'viewComments', 'policyId' => $row['policy_id']]
                ]
            ];
        }
        
        // 3. Comprobantes revisados
        $stmt = $this->conn->prepare("
            SELECT 
                pp.proof_id,
                pp.policy_id,
                pp.status,
                pp.reviewed_at,
                pp.review_notes,
                p.policy_number
            FROM payment_proofs pp
            INNER JOIN policies p ON pp.policy_id = p.id
            WHERE p.client_id = ?
            AND pp.status IN ('approved', 'rejected')
            AND pp.reviewed_at > DATE_SUB(NOW(), INTERVAL 3 DAY)
            AND pp.is_notified = FALSE
            ORDER BY pp.reviewed_at DESC
            LIMIT ?
        ");
        
        $stmt->bind_param("si", $clientId, $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $isApproved = $row['status'] === 'approved';
            $notifications[] = [
                'id' => 'proof_reviewed_' . $row['proof_id'],
                'type' => 'payment',
                'title' => $isApproved ? 'Pago aprobado' : 'Pago rechazado',
                'message' => $isApproved 
                    ? "Tu comprobante de pago para la póliza {$row['policy_number']} ha sido aprobado"
                    : "Tu comprobante de pago para la póliza {$row['policy_number']} requiere revisión: {$row['review_notes']}",
                'time' => $this->getRelativeTime($row['reviewed_at']),
                'read' => false,
                'priority' => $isApproved ? 'normal' : 'high',
                'data' => [
                    'policy_id' => $row['policy_id'],
                    'proof_id' => $row['proof_id'],
                    'status' => $row['status']
                ],
                'actions' => [
                    ['label' => 'Ver detalles', 'action' => 'viewPolicy', 'policyId' => $row['policy_id']]
                ]
            ];
        }
        
        return $notifications;
    }
    
    /**
     * Notificaciones específicas para agentes
     */
    private function getAgentNotifications($agentId, $limit) {
        $notifications = [];
        
        // 1. Nuevos comprobantes de pago pendientes de revisión
        $stmt = $this->conn->prepare("
            SELECT 
                pp.proof_id,
                pp.policy_id,
                pp.uploaded_at,
                pp.amount,
                p.policy_number,
                c.name as client_name,
                c.id as client_id
            FROM payment_proofs pp
            INNER JOIN policies p ON pp.policy_id = p.id
            INNER JOIN clients c ON p.client_id = c.id
            WHERE p.agent_id = ?
            AND pp.status = 'pending'
            ORDER BY pp.uploaded_at DESC
            LIMIT ?
        ");
        
        $stmt->bind_param("si", $agentId, $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $notifications[] = [
                'id' => 'proof_pending_' . $row['proof_id'],
                'type' => 'payment',
                'title' => 'Comprobante de pago pendiente',
                'message' => "{$row['client_name']} ha subido un comprobante de pago para revisión (Póliza {$row['policy_number']})",
                'time' => $this->getRelativeTime($row['uploaded_at']),
                'read' => false,
                'priority' => 'high',
                'data' => [
                    'policy_id' => $row['policy_id'],
                    'proof_id' => $row['proof_id'],
                    'client_id' => $row['client_id']
                ],
                'actions' => [
                    ['label' => 'Revisar comprobante', 'action' => 'reviewProof', 'proofId' => $row['proof_id']],
                    ['label' => 'Ver detalles', 'action' => 'viewClient', 'clientId' => $row['client_id']]
                ]
            ];
        }
        
        // 2. Nuevos comentarios de clientes en pólizas
        $stmt = $this->conn->prepare("
            SELECT 
                pc.comment_id,
                pc.policy_id,
                pc.comment_text,
                pc.created_at,
                p.policy_number,
                c.name as client_name,
                c.id as client_id
            FROM policy_comments pc
            INNER JOIN policies p ON pc.policy_id = p.id
            INNER JOIN clients c ON p.client_id = c.id
            WHERE p.agent_id = ?
            AND pc.created_by = c.id
            AND pc.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
            AND pc.is_read_by_agent = FALSE
            ORDER BY pc.created_at DESC
            LIMIT ?
        ");
        
        $stmt->bind_param("si", $agentId, $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $notifications[] = [
                'id' => 'client_comment_' . $row['comment_id'],
                'type' => 'comment',
                'title' => 'Nuevo comentario de cliente',
                'message' => "{$row['client_name']} tiene una pregunta sobre la póliza {$row['policy_number']}",
                'time' => $this->getRelativeTime($row['created_at']),
                'read' => false,
                'priority' => 'normal',
                'data' => [
                    'policy_id' => $row['policy_id'],
                    'comment_id' => $row['comment_id'],
                    'client_id' => $row['client_id']
                ],
                'actions' => [
                    ['label' => 'Responder', 'action' => 'reply', 'commentId' => $row['comment_id']],
                    ['label' => 'Ver póliza', 'action' => 'viewPolicy', 'policyId' => $row['policy_id']]
                ]
            ];
        }
        
        // 3. Pagos atrasados de clientes
        $stmt = $this->conn->prepare("
            SELECT 
                ps.schedule_id,
                ps.policy_id,
                ps.due_date,
                ps.amount,
                p.policy_number,
                c.name as client_name,
                c.id as client_id,
                DATEDIFF(CURDATE(), ps.due_date) as days_overdue
            FROM payment_schedules ps
            INNER JOIN policies p ON ps.policy_id = p.id
            INNER JOIN clients c ON p.client_id = c.id
            WHERE p.agent_id = ?
            AND ps.status = 'overdue'
            AND ps.due_date < CURDATE()
            ORDER BY ps.due_date ASC
            LIMIT ?
        ");
        
        $stmt->bind_param("si", $agentId, $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $notifications[] = [
                'id' => 'payment_overdue_' . $row['schedule_id'],
                'type' => 'payment',
                'title' => 'Pago atrasado',
                'message' => "{$row['client_name']} tiene un pago atrasado ({$row['days_overdue']} día(s)) - Póliza {$row['policy_number']}",
                'time' => $this->getRelativeTime($row['due_date']),
                'read' => false,
                'priority' => $row['days_overdue'] > 7 ? 'high' : 'normal',
                'data' => [
                    'policy_id' => $row['policy_id'],
                    'schedule_id' => $row['schedule_id'],
                    'client_id' => $row['client_id']
                ],
                'actions' => [
                    ['label' => 'Contactar cliente', 'action' => 'contactClient', 'clientId' => $row['client_id']],
                    ['label' => 'Ver detalles', 'action' => 'viewPolicy', 'policyId' => $row['policy_id']]
                ]
            ];
        }
        
        return $notifications;
    }
    
    /**
     * Marcar notificación como leída
     */
    public function markAsRead($notificationId, $userId, $userType) {
        // Extraer tipo de notificación del ID
        if (strpos($notificationId, 'comment_') === 0) {
            $commentId = str_replace(['comment_', 'client_comment_'], '', $notificationId);
            $field = $userType === 'agent' ? 'is_read_by_agent' : 'is_read_by_client';
            
            $stmt = $this->conn->prepare("
                UPDATE policy_comments 
                SET $field = TRUE 
                WHERE comment_id = ?
            ");
            $stmt->bind_param("i", $commentId);
            return $stmt->execute();
        }
        
        if (strpos($notificationId, 'proof_reviewed_') === 0) {
            $proofId = str_replace('proof_reviewed_', '', $notificationId);
            
            $stmt = $this->conn->prepare("
                UPDATE payment_proofs 
                SET is_notified = TRUE 
                WHERE proof_id = ?
            ");
            $stmt->bind_param("i", $proofId);
            return $stmt->execute();
        }
        
        return true;
    }
    
    /**
     * Obtener tiempo relativo (ej: "Hace 2 horas")
     */
    private function getRelativeTime($datetime) {
        $timestamp = strtotime($datetime);
        $diff = time() - $timestamp;
        
        if ($diff < 60) return 'Hace un momento';
        if ($diff < 3600) return 'Hace ' . floor($diff / 60) . ' minutos';
        if ($diff < 86400) return 'Hace ' . floor($diff / 3600) . ' horas';
        if ($diff < 604800) return 'Hace ' . floor($diff / 86400) . ' días';
        
        return date('d/m/Y', $timestamp);
    }
}

// Procesar solicitud
try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    $notificationService = new NotificationService($conn);
    
    // Obtener token y validar usuario
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    $token = str_replace('Bearer ', '', $authHeader);
    
    if (empty($token)) {
        throw new Exception('Token no proporcionado');
    }
    
    // Validar token y obtener datos de usuario
    $userData = Auth::validateToken($token);
    if (!$userData) {
        throw new Exception('Token inválido');
    }
    
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    
    // GET /notification-api.php/notifications
    if ($method === 'GET' && end($pathParts) === 'notifications') {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        
        $notifications = $notificationService->getUserNotifications(
            $userData['id'],
            $userData['role'],
            $limit
        );
        
        echo json_encode([
            'success' => true,
            'notifications' => $notifications,
            'count' => count($notifications),
            'user_type' => $userData['role']
        ]);
    }
    
    // PUT /notification-api.php/notifications/{id}/read
    elseif ($method === 'PUT' && strpos($path, '/read') !== false) {
        $data = json_decode(file_get_contents('php://input'), true);
        $notificationId = $data['notification_id'] ?? '';
        
        if (empty($notificationId)) {
            throw new Exception('ID de notificación no proporcionado');
        }
        
        $notificationService->markAsRead(
            $notificationId,
            $userData['id'],
            $userData['role']
        );
        
        echo json_encode([
            'success' => true,
            'message' => 'Notificación marcada como leída'
        ]);
    }
    
    else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint no encontrado']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
