<?php
/**
 * Direct Messages API
 * Sistema de mensajería temporal (42 horas)
 * Solo agentes pueden iniciar, clientes solo responder
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/database.php';

function sendResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function sendError($message, $code = 400) {
    sendResponse(['success' => false, 'error' => $message], $code);
}

// Limpiar mensajes expirados automáticamente
function cleanupExpiredMessages($db) {
    try {
        // Marcar threads como expirados
        $db->exec("
            UPDATE direct_message_threads 
            SET status = 'expired' 
            WHERE expires_at < NOW() AND status = 'active'
        ");
        
        // Eliminar mensajes expirados
        $db->exec("DELETE FROM direct_messages WHERE expires_at < NOW()");
        
    } catch (PDOException $e) {
        error_log("Error limpiando mensajes directos: " . $e->getMessage());
    }
}

$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = dirname($_SERVER['SCRIPT_NAME']);
$path = str_replace($scriptName, '', $requestUri);
$path = trim($path, '/');
$pathParts = explode('/', $path);

$action = $pathParts[1] ?? null;

try {
    $db = getDatabase();
    
    // Limpiar mensajes expirados al inicio
    cleanupExpiredMessages($db);
    
    switch ($action) {
        
        // ============================================
        // INICIAR THREAD (Solo Agente)
        // ============================================
        case 'start-thread':
            // POST /direct-messages-api.php/start-thread
            $user = Auth::requireUserType(['agent']);
            
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendError('Método no permitido', 405);
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            $clientId = $data['client_id'] ?? null;
            $subject = $data['subject'] ?? 'Mensaje directo';
            $messageText = $data['message'] ?? null;
            
            if (!$clientId || !$messageText) {
                sendError('Client ID y mensaje requeridos', 400);
            }
            
            $agentId = $user['user_id'];
            
            // Verificar si existe thread activo
            $stmt = $db->prepare("
                SELECT thread_id, expires_at 
                FROM direct_message_threads 
                WHERE agent_id = ? AND client_id = ? AND status = 'active'
            ");
            $stmt->execute([$agentId, $clientId]);
            $existingThread = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($existingThread) {
                // Usar thread existente y extender expiración
                $threadId = $existingThread['thread_id'];
                
                // Extender expiración a 42 horas desde ahora
                $expiresAt = date('Y-m-d H:i:s', strtotime('+42 hours'));
                $stmt = $db->prepare("
                    UPDATE direct_message_threads 
                    SET last_message_at = NOW(), expires_at = ? 
                    WHERE thread_id = ?
                ");
                $stmt->execute([$expiresAt, $threadId]);
                
            } else {
                // Crear nuevo thread
                $threadId = 'DM-' . time() . '-' . substr(md5($agentId . $clientId), 0, 8);
                $expiresAt = date('Y-m-d H:i:s', strtotime('+42 hours'));
                
                $stmt = $db->prepare("
                    INSERT INTO direct_message_threads 
                    (thread_id, agent_id, client_id, subject, expires_at)
                    VALUES (?, ?, ?, ?, ?)
                ");
                $stmt->execute([$threadId, $agentId, $clientId, $subject, $expiresAt]);
            }
            
            // Insertar mensaje
            $stmt = $db->prepare("
                INSERT INTO direct_messages 
                (thread_id, agent_id, client_id, sender_id, sender_type, message_text, expires_at)
                VALUES (?, ?, ?, ?, 'agent', ?, ?)
            ");
            $stmt->execute([$threadId, $agentId, $clientId, $agentId, $messageText, $expiresAt]);
            
            sendResponse([
                'success' => true,
                'thread_id' => $threadId,
                'expires_at' => $expiresAt,
                'message' => 'Thread iniciado exitosamente'
            ]);
            break;
            
        // ============================================
        // RESPONDER A THREAD (Agente o Cliente del thread)
        // ============================================
        case 'reply':
            // POST /direct-messages-api.php/reply
            $user = Auth::requireAuth();
            
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendError('Método no permitido', 405);
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            $threadId = $data['thread_id'] ?? null;
            $messageText = $data['message'] ?? null;
            
            if (!$threadId || !$messageText) {
                sendError('Thread ID y mensaje requeridos', 400);
            }
            
            // Verificar que el thread existe y está activo
            $stmt = $db->prepare("
                SELECT agent_id, client_id, expires_at 
                FROM direct_message_threads 
                WHERE thread_id = ? AND status = 'active'
            ");
            $stmt->execute([$threadId]);
            $thread = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$thread) {
                sendError('Thread no encontrado o expirado', 404);
            }
            
            // Verificar permisos
            $userId = $user['user_id'];
            $userType = $user['user_type'];
            
            if ($userType === 'client' && $userId != $thread['client_id']) {
                sendError('No tienes permiso para responder a este thread', 403);
            }
            
            if ($userType === 'agent' && $userId != $thread['agent_id']) {
                sendError('No tienes permiso para responder a este thread', 403);
            }
            
            // Extender expiración
            $expiresAt = date('Y-m-d H:i:s', strtotime('+42 hours'));
            $stmt = $db->prepare("
                UPDATE direct_message_threads 
                SET last_message_at = NOW(), expires_at = ? 
                WHERE thread_id = ?
            ");
            $stmt->execute([$expiresAt, $threadId]);
            
            // Insertar respuesta
            $senderType = ($userType === 'agent') ? 'agent' : 'client';
            $stmt = $db->prepare("
                INSERT INTO direct_messages 
                (thread_id, agent_id, client_id, sender_id, sender_type, message_text, expires_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $threadId, 
                $thread['agent_id'], 
                $thread['client_id'], 
                $userId, 
                $senderType, 
                $messageText, 
                $expiresAt
            ]);
            
            sendResponse([
                'success' => true,
                'message' => 'Respuesta enviada',
                'expires_at' => $expiresAt
            ]);
            break;
            
        // ============================================
        // OBTENER THREADS DEL USUARIO
        // ============================================
        case 'my-threads':
            // GET /direct-messages-api.php/my-threads
            $user = Auth::requireAuth();
            
            $userId = $user['user_id'];
            $userType = $user['user_type'];
            
            if ($userType === 'agent') {
                $stmt = $db->prepare("
                    SELECT 
                        t.thread_id,
                        t.subject,
                        t.created_at,
                        t.last_message_at,
                        t.expires_at,
                        CONCAT(c.first_name, ' ', c.last_name) AS client_name,
                        c.email AS client_email,
                        (SELECT COUNT(*) FROM direct_messages 
                         WHERE thread_id = t.thread_id 
                         AND sender_type = 'client' 
                         AND is_read = FALSE) AS unread_count,
                        (SELECT message_text FROM direct_messages 
                         WHERE thread_id = t.thread_id 
                         ORDER BY created_at DESC LIMIT 1) AS last_message
                    FROM direct_message_threads t
                    INNER JOIN users c ON t.client_id = c.id
                    WHERE t.agent_id = ? AND t.status = 'active'
                    ORDER BY t.last_message_at DESC
                ");
                $stmt->execute([$userId]);
                
            } else {
                // Cliente
                $stmt = $db->prepare("
                    SELECT 
                        t.thread_id,
                        t.subject,
                        t.created_at,
                        t.last_message_at,
                        t.expires_at,
                        CONCAT(a.first_name, ' ', a.last_name) AS agent_name,
                        a.email AS agent_email,
                        (SELECT COUNT(*) FROM direct_messages 
                         WHERE thread_id = t.thread_id 
                         AND sender_type = 'agent' 
                         AND is_read = FALSE) AS unread_count,
                        (SELECT message_text FROM direct_messages 
                         WHERE thread_id = t.thread_id 
                         ORDER BY created_at DESC LIMIT 1) AS last_message
                    FROM direct_message_threads t
                    INNER JOIN users a ON t.agent_id = a.id
                    WHERE t.client_id = ? AND t.status = 'active'
                    ORDER BY t.last_message_at DESC
                ");
                $stmt->execute([$userId]);
            }
            
            $threads = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Calcular total de mensajes no leídos
            $totalUnread = array_sum(array_column($threads, 'unread_count'));
            
            sendResponse([
                'success' => true,
                'threads' => $threads,
                'total_unread' => $totalUnread
            ]);
            break;
            
        // ============================================
        // OBTENER MENSAJES DE UN THREAD
        // ============================================
        case 'messages':
            // GET /direct-messages-api.php/messages/{thread_id}
            $user = Auth::requireAuth();
            
            $threadId = $pathParts[2] ?? null;
            
            if (!$threadId) {
                sendError('Thread ID requerido', 400);
            }
            
            // Verificar acceso al thread
            $stmt = $db->prepare("
                SELECT agent_id, client_id, subject, expires_at 
                FROM direct_message_threads 
                WHERE thread_id = ? AND status = 'active'
            ");
            $stmt->execute([$threadId]);
            $thread = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$thread) {
                sendError('Thread no encontrado', 404);
            }
            
            $userId = $user['user_id'];
            $userType = $user['user_type'];
            
            if ($userType === 'client' && $userId != $thread['client_id']) {
                sendError('Acceso denegado', 403);
            }
            
            if ($userType === 'agent' && $userId != $thread['agent_id']) {
                sendError('Acceso denegado', 403);
            }
            
            // Obtener mensajes
            $stmt = $db->prepare("
                SELECT 
                    dm_id,
                    sender_id,
                    sender_type,
                    message_text,
                    created_at,
                    is_read,
                    CONCAT(u.first_name, ' ', u.last_name) AS sender_name
                FROM direct_messages dm
                INNER JOIN users u ON dm.sender_id = u.id
                WHERE dm.thread_id = ?
                ORDER BY dm.created_at ASC
            ");
            $stmt->execute([$threadId]);
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Marcar mensajes como leídos
            $senderTypeToMarkRead = ($userType === 'agent') ? 'client' : 'agent';
            $stmt = $db->prepare("
                UPDATE direct_messages 
                SET is_read = TRUE 
                WHERE thread_id = ? AND sender_type = ? AND is_read = FALSE
            ");
            $stmt->execute([$threadId, $senderTypeToMarkRead]);
            
            sendResponse([
                'success' => true,
                'thread' => $thread,
                'messages' => $messages,
                'expires_at' => $thread['expires_at']
            ]);
            break;
            
        // ============================================
        // OBTENER TOTAL DE MENSAJES NO LEÍDOS
        // ============================================
        case 'unread-count':
            // GET /direct-messages-api.php/unread-count
            $user = Auth::requireAuth();
            
            $userId = $user['user_id'];
            $userType = $user['user_type'];
            
            if ($userType === 'agent') {
                $stmt = $db->prepare("
                    SELECT COUNT(*) AS total
                    FROM direct_messages dm
                    INNER JOIN direct_message_threads t ON dm.thread_id = t.thread_id
                    WHERE t.agent_id = ? 
                    AND dm.sender_type = 'client' 
                    AND dm.is_read = FALSE
                    AND t.status = 'active'
                ");
            } else {
                $stmt = $db->prepare("
                    SELECT COUNT(*) AS total
                    FROM direct_messages dm
                    INNER JOIN direct_message_threads t ON dm.thread_id = t.thread_id
                    WHERE t.client_id = ? 
                    AND dm.sender_type = 'agent' 
                    AND dm.is_read = FALSE
                    AND t.status = 'active'
                ");
            }
            
            $stmt->execute([$userId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            sendResponse([
                'success' => true,
                'unread_count' => (int)$result['total']
            ]);
            break;
            
        default:
            sendError('Endpoint no encontrado', 404);
    }
    
} catch (Exception $e) {
    error_log("Error en Direct Messages API: " . $e->getMessage());
    sendError('Error interno del servidor', 500);
}
