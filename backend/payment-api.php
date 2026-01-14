<?php
/**
 * Payment API Endpoints
 * Optimizado para GoDaddy Shared Hosting
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/payment-service.php';

$paymentService = new PaymentService();

// Obtener acción de la URL
$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = dirname($_SERVER['SCRIPT_NAME']);
$path = str_replace($scriptName, '', $requestUri);
$path = trim($path, '/');
$pathParts = explode('/', $path);

// Formato: /payment-api.php/action/params
$action = $pathParts[1] ?? null;

try {
    switch ($action) {
        
        // ============================================
        // ENDPOINTS CLIENTE
        // ============================================
        
        case 'get-schedule':
            // GET /payment-api.php/get-schedule/{policy_id}
            requireAuth();
            $policyId = $pathParts[2] ?? null;
            
            if (!$policyId) {
                sendError('Policy ID requerido', 400);
            }
            
            // Validar que el cliente tenga acceso a esta póliza
            $userRole = $_SESSION['user_role'] ?? null;
            $userId = $_SESSION['user_id'] ?? null;
            
            if ($userRole === 'client') {
                // Verificar ownership
                $db = getDatabase();
                $stmt = $db->prepare("SELECT client_id FROM policies WHERE policy_id = ?");
                $stmt->execute([$policyId]);
                $clientId = $stmt->fetchColumn();
                
                if ($clientId != $userId) {
                    sendError('Acceso denegado', 403);
                }
            }
            
            $result = $paymentService->getPaymentSchedule($policyId);
            sendResponse($result);
            break;
            
        case 'upload-proof':
            // POST /payment-api.php/upload-proof
            requireAuth();
            
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendError('Método no permitido', 405);
            }
            
            $scheduleId = $_POST['schedule_id'] ?? null;
            $policyId = $_POST['policy_id'] ?? null;
            $clientId = $_SESSION['user_id'];
            
            if (!$scheduleId || !$policyId || !isset($_FILES['proof_file'])) {
                sendError('Datos incompletos', 400);
            }
            
            // Validar que el cliente sea dueño de la póliza
            $db = getDatabase();
            $stmt = $db->prepare("SELECT client_id FROM policies WHERE policy_id = ?");
            $stmt->execute([$policyId]);
            $ownerClientId = $stmt->fetchColumn();
            
            if ($ownerClientId != $clientId) {
                sendError('Acceso denegado', 403);
            }
            
            $result = $paymentService->uploadPaymentProof(
                $scheduleId,
                $policyId,
                $clientId,
                $_FILES['proof_file']
            );
            
            sendResponse($result);
            break;
            
        case 'get-notifications':
            // GET /payment-api.php/get-notifications
            requireAuth();
            
            $clientId = $_SESSION['user_id'];
            $limit = $_GET['limit'] ?? 20;
            
            $notifications = $paymentService->getClientNotifications($clientId, $limit);
            
            sendResponse([
                'success' => true,
                'notifications' => $notifications
            ]);
            break;
            
        case 'download-file':
            // GET /payment-api.php/download-file/{type}/{id}
            requireAuth();
            
            $fileType = $pathParts[2] ?? null; // 'proof' o 'invoice'
            $fileId = $pathParts[3] ?? null;
            $userId = $_SESSION['user_id'];
            $userType = $_SESSION['user_role'];
            
            if (!$fileType || !$fileId) {
                sendError('Parámetros inválidos', 400);
            }
            
            $result = $paymentService->downloadFile($fileType, $fileId, $userId, $userType);
            
            if (!$result['success']) {
                sendError($result['error'], 403);
            }
            
            // Enviar archivo
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename="' . $result['file_name'] . '"');
            header('Content-Length: ' . filesize($result['file_path']));
            readfile($result['file_path']);
            exit;
            break;
            
        // ============================================
        // ENDPOINTS AGENTE
        // ============================================
        
        case 'upload-policy':
            // POST /payment-api.php/upload-policy
            // Agente sube documento de póliza, se extrae info automáticamente
            requireAuth(['agent']);
            
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendError('Método no permitido', 405);
            }
            
            if (!isset($_FILES['policy_file'])) {
                sendError('Archivo de póliza requerido', 400);
            }
            
            $agentId = $_SESSION['user_id'];
            $clientId = $_POST['client_id'] ?? null;
            
            if (!$clientId) {
                sendError('ID de cliente requerido', 400);
            }
            
            require_once __DIR__ . '/policy-analyzer.php';
            $analyzer = new PolicyAnalyzer();
            
            // Analizar documento
            $file = $_FILES['policy_file'];
            $tempPath = $file['tmp_name'];
            
            $analysis = $analyzer->analyzePolicyDocument($tempPath);
            
            if (!$analysis['success']) {
                sendResponse([
                    'success' => false,
                    'manual_entry' => $analysis['manual_entry'] ?? false,
                    'error' => $analysis['error']
                ]);
                break;
            }
            
            // Datos extraídos
            $extractedData = $analysis['data'];
            $confidence = $analysis['confidence'];
            
            // Si confianza es baja, solicitar revisión manual
            if ($confidence === 'low') {
                sendResponse([
                    'success' => true,
                    'requires_review' => true,
                    'data' => $extractedData,
                    'confidence' => $confidence,
                    'message' => 'Datos extraídos con baja confianza. Por favor revisa y confirma.'
                ]);
                break;
            }
            
            // Guardar archivo de póliza
            $db = getDatabase();
            $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $fileName = sprintf(
                'policy_%s_%s.%s',
                $clientId,
                date('YmdHis'),
                $extension
            );
            
            $uploadDir = __DIR__ . '/../uploads/policies/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            $filePath = 'policies/' . $fileName;
            $fullPath = __DIR__ . '/../uploads/' . $filePath;
            
            if (!move_uploaded_file($tempPath, $fullPath)) {
                sendError('Error al guardar archivo', 500);
            }
            
            // Crear o actualizar póliza en BD
            try {
                $db->beginTransaction();
                
                // Verificar si la póliza ya existe
                $stmt = $db->prepare("SELECT policy_id FROM policies WHERE policy_number = ?");
                $stmt->execute([$extractedData['policy_number']]);
                $existingPolicy = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($existingPolicy) {
                    // Actualizar póliza existente
                    $policyId = $existingPolicy['policy_id'];
                    
                    $stmt = $db->prepare("
                        UPDATE policies SET
                            policy_document = ?,
                            insurer_name = ?,
                            start_date = ?,
                            end_date = ?,
                            total_premium = ?,
                            payment_frequency = ?,
                            updated_at = NOW()
                        WHERE policy_id = ?
                    ");
                    
                    $stmt->execute([
                        $filePath,
                        $extractedData['insurer_name'],
                        $extractedData['start_date'],
                        $extractedData['end_date'],
                        $extractedData['total_premium'],
                        $extractedData['payment_frequency'],
                        $policyId
                    ]);
                } else {
                    // Crear nueva póliza
                    $stmt = $db->prepare("
                        INSERT INTO policies (
                            client_id, agent_id, policy_number, insurer_name,
                            policy_document, start_date, end_date, 
                            total_premium, payment_frequency, status
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
                    ");
                    
                    $stmt->execute([
                        $clientId,
                        $agentId,
                        $extractedData['policy_number'],
                        $extractedData['insurer_name'],
                        $filePath,
                        $extractedData['start_date'],
                        $extractedData['end_date'],
                        $extractedData['total_premium'],
                        $extractedData['payment_frequency']
                    ]);
                    
                    $policyId = $db->lastInsertId();
                }
                
                // Generar calendario de pagos automáticamente
                $result = $paymentService->generatePaymentSchedule(
                    $policyId,
                    $extractedData['total_premium'],
                    $extractedData['payment_frequency'],
                    $extractedData['start_date']
                );
                
                $db->commit();
                
                sendResponse([
                    'success' => true,
                    'policy_id' => $policyId,
                    'data' => $extractedData,
                    'confidence' => $confidence,
                    'message' => 'Póliza procesada y calendario generado correctamente'
                ]);
                
            } catch (PDOException $e) {
                $db->rollBack();
                error_log("Error guardando póliza: " . $e->getMessage());
                sendError('Error al guardar póliza', 500);
            }
            
            break;
            
        case 'generate-schedule':
            // POST /payment-api.php/generate-schedule
            // Método manual (fallback si el análisis automático falla)
            requireAuth(['agent']);
            
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendError('Método no permitido', 405);
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            $policyId = $data['policy_id'] ?? null;
            $totalPremium = $data['total_premium'] ?? null;
            $paymentFrequency = $data['payment_frequency'] ?? null;
            $startDate = $data['start_date'] ?? null;
            
            if (!$policyId || !$totalPremium || !$paymentFrequency || !$startDate) {
                sendError('Datos incompletos', 400);
            }
            
            // Validar frecuencia
            if (!in_array($paymentFrequency, [1, 2, 4, 12])) {
                sendError('Frecuencia de pago inválida', 400);
            }
            
            $result = $paymentService->generatePaymentSchedule(
                $policyId,
                $totalPremium,
                $paymentFrequency,
                $startDate
            );
            
            sendResponse($result);
            break;
            
        case 'get-pending-reviews':
            // GET /payment-api.php/get-pending-reviews
            requireAuth(['agent']);
            
            $agentId = $_SESSION['user_id'];
            $result = $paymentService->getPendingProofReviews($agentId);
            
            sendResponse($result);
            break;
            
        case 'review-proof':
            // POST /payment-api.php/review-proof
            requireAuth(['agent']);
            
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendError('Método no permitido', 405);
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            $proofId = $data['proof_id'] ?? null;
            $approved = $data['approved'] ?? null;
            $notes = $data['notes'] ?? null;
            $agentId = $_SESSION['user_id'];
            
            if ($proofId === null || $approved === null) {
                sendError('Datos incompletos', 400);
            }
            
            $result = $paymentService->reviewPaymentProof(
                $proofId,
                $agentId,
                $approved,
                $notes
            );
            
            sendResponse($result);
            break;
            
        case 'upload-invoice':
            // POST /payment-api.php/upload-invoice
            requireAuth(['agent']);
            
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendError('Método no permitido', 405);
            }
            
            $scheduleId = $_POST['schedule_id'] ?? null;
            $policyId = $_POST['policy_id'] ?? null;
            $invoiceNumber = $_POST['invoice_number'] ?? null;
            $agentId = $_SESSION['user_id'];
            
            if (!$scheduleId || !$policyId || !$invoiceNumber || !isset($_FILES['invoice_file'])) {
                sendError('Datos incompletos', 400);
            }
            
            $result = $paymentService->uploadInsurerInvoice(
                $scheduleId,
                $policyId,
                $invoiceNumber,
                $agentId,
                $_FILES['invoice_file']
            );
            
            sendResponse($result);
            break;
            
        case 'update-status':
            // POST /payment-api.php/update-status
            requireAuth(['agent']);
            
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendError('Método no permitido', 405);
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            $scheduleId = $data['schedule_id'] ?? null;
            $newStatus = $data['status'] ?? null;
            $notes = $data['notes'] ?? null;
            $agentId = $_SESSION['user_id'];
            
            if (!$scheduleId || !$newStatus) {
                sendError('Datos incompletos', 400);
            }
            
            // Validar estado
            $validStatuses = ['pending', 'payment_attempted', 'payment_rejected', 
                            'awaiting_proof', 'in_review', 'paid', 'liquidated'];
            
            if (!in_array($newStatus, $validStatuses)) {
                sendError('Estado inválido', 400);
            }
            
            $result = $paymentService->updatePaymentStatus(
                $scheduleId,
                $newStatus,
                'agent',
                $agentId,
                $notes
            );
            
            if ($result) {
                sendResponse(['success' => true, 'message' => 'Estado actualizado']);
            } else {
                sendError('Error al actualizar estado', 500);
            }
            break;
            
        default:
            sendError('Endpoint no encontrado', 404);
            break;
    }
    
} catch (Exception $e) {
    error_log("Payment API Error: " . $e->getMessage());
    sendError('Error interno del servidor', 500);
}

/**
 * Helpers
 */
function sendResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $message
    ]);
    exit;
}
