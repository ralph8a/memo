<?php
// Main API Router
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');

// Set CORS headers FIRST
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://ksinsurancee.com',
    'https://ksinsurancee.com',
    'https://nhs13h5k0x0j.krause.app',
    'http://nhs13h5k0x0j.krause.app',
    'http://localhost:8080',
    'http://localhost:3000'
];

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: *"); // Permitir todos en testing
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';
require_once 'database.php';
require_once 'auth.php';
require_once 'email-service.php';
require_once 'api-endpoints.php';

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Get request body
$input = file_get_contents('php://input');
$data = json_decode($input, true) ?? [];

// Merge GET params with POST data
if ($method === 'POST') {
    $data = array_merge($_POST, $data);
}

// Response helper
function sendResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

// Error helper
function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

try {
    // Get database connection
    $db = getDB();
    
    // DEBUG ENDPOINT - Remove in production
    if ($action === 'debug_headers') {
        sendResponse([
            'method' => $_SERVER['REQUEST_METHOD'],
            'uri' => $_SERVER['REQUEST_URI'] ?? 'NOT SET',
            'http_authorization' => $_SERVER['HTTP_AUTHORIZATION'] ?? 'NOT SET',
            'redirect_http_authorization' => $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? 'NOT SET',
            'all_http_keys' => array_keys(array_filter($_SERVER, function($k) { return strpos($k, 'HTTP_') === 0; }, ARRAY_FILTER_USE_KEY)),
            'getallheaders_available' => function_exists('getallheaders'),
            'getallheaders_result' => function_exists('getallheaders') ? getallheaders() : null
        ]);
    }
    
    // ===== AUTHENTICATION ENDPOINTS =====
    
    // POST ?action=login
    if ($method === 'POST' && $action === 'login') {
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        
        if (!$email || !$password) {
            sendError('Email and password required', 400);
        }
        
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ? AND status = 'active'");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user || !Auth::verifyPassword($password, $user['password_hash'])) {
            sendError('Invalid credentials', 401);
        }
        
        // Update last login
        $stmt = $db->prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$user['id']]);
        
        // Generate token
        $token = Auth::generateToken($user['id'], $user['user_type'], $user['email']);
        
        sendResponse([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'user_type' => $user['user_type'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name']
            ]
        ]);
    }
    
    // GET ?action=verify_token
    if ($action === 'verify_token') {
        $user = Auth::requireAuth();
        sendResponse(['valid' => true, 'user' => $user]);
    }
    
    // ===== QUOTES ENDPOINTS =====
    
    // POST ?action=submit_quote
    if ($method === 'POST' && $action === 'submit_quote') {
        $email = $data['email'] ?? '';
        $firstName = $data['first_name'] ?? $data['firstName'] ?? '';
        $lastName = $data['last_name'] ?? $data['lastName'] ?? '';
        $phone = $data['phone'] ?? '';
        $quoteType = $data['quote_type'] ?? $data['quoteType'] ?? '';
        $coverageDetails = json_encode($data['coverage_details'] ?? $data['coverageDetails'] ?? []);
        
        if (!$email || !$quoteType) {
            sendError('Email and quote type required', 400);
        }
        
        $stmt = $db->prepare("
            INSERT INTO quotes (email, first_name, last_name, phone, quote_type, coverage_details)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$email, $firstName, $lastName, $phone, $quoteType, $coverageDetails]);
        
        // Send confirmation email
        EmailService::sendQuoteRequestConfirmation($email, $firstName, $quoteType);
        
        sendResponse(['success' => true, 'quote_id' => $db->lastInsertId()]);
    }
    
    // GET ?action=quotes (requires agent/admin auth)
    if ($action === 'quotes') {
        Auth::requireUserType(['agent', 'admin']);
        
        $stmt = $db->query("SELECT * FROM quotes ORDER BY requested_at DESC LIMIT 100");
        $quotes = $stmt->fetchAll();
        
        sendResponse($quotes);
    }
    
    // ===== CLAIMS ENDPOINTS =====
    
    // GET ?action=user_claims (client's own claims)
    if ($action === 'user_claims') {
        $user = Auth::requireAuth();
        
        $stmt = $db->prepare("SELECT * FROM claims WHERE client_id = ? ORDER BY submitted_at DESC");
        $stmt->execute([$user['user_id']]);
        $claims = $stmt->fetchAll();
        
        sendResponse($claims);
    }
    
    // GET ?action=claims (requires agent/admin auth - all claims)
    if ($action === 'claims') {
        $user = Auth::requireUserType(['agent', 'admin']);
        
        $stmt = $db->query("SELECT c.*, u.first_name, u.last_name 
            FROM claims c 
            JOIN users u ON c.client_id = u.id 
            ORDER BY c.submitted_at DESC 
            LIMIT 100");
        
        $claims = $stmt->fetchAll();
        sendResponse($claims);
    }
    
    // POST ?action=submit_claim
    if ($method === 'POST' && $action === 'submit_claim') {
        $user = Auth::requireAuth();
        
        $policyId = $data['policy_id'] ?? null;
        $claimType = $data['claim_type'] ?? '';
        $incidentDate = $data['incident_date'] ?? null;
        $description = $data['description'] ?? '';
        $claimAmount = $data['claim_amount'] ?? 0;
        
        if (!$policyId || !$claimType || !$description) {
            sendError('Policy ID, claim type, and description required', 400);
        }
        
        // Generate claim number
        $claimNumber = 'CLM-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        
        $stmt = $db->prepare("
            INSERT INTO claims (client_id, policy_id, claim_number, claim_type, incident_date, description, claim_amount, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted')
        ");
        $stmt->execute([$user['user_id'], $policyId, $claimNumber, $claimType, $incidentDate, $description, $claimAmount]);
        
        sendResponse(['success' => true, 'claim_id' => $db->lastInsertId(), 'claim_number' => $claimNumber]);
    }
    
    
    // ===== CLIENT DASHBOARD ENDPOINTS =====
    
    // GET ?action=client_dashboard
    if ($action === 'client_dashboard') {
        error_log("=== CLIENT_DASHBOARD ENDPOINT CALLED ===");
        error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
        error_log("All Headers: " . json_encode(function_exists('getallheaders') ? getallheaders() : array_filter($_SERVER, function($k) { return strpos($k, 'HTTP_') === 0 || $k === 'REDIRECT_HTTP_AUTHORIZATION'; }, ARRAY_FILTER_USE_KEY)));
        error_log("Authorization Header Attempts:");
        error_log("  - HTTP_AUTHORIZATION: " . ($_SERVER['HTTP_AUTHORIZATION'] ?? 'NOT SET'));
        error_log("  - REDIRECT_HTTP_AUTHORIZATION: " . ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? 'NOT SET'));
        
        $user = Auth::requireAuth();
        error_log("User authenticated: " . json_encode($user));
        
        sendResponse(getClientDashboard($db, $user['user_id']));
    }
    
    // GET ?action=user_policies
    if ($action === 'user_policies') {
        $user = Auth::requireAuth();
        sendResponse(getClientPolicies($db, $user['user_id']));
    }
    
    // GET ?action=payment_history
    if ($action === 'payment_history') {
        $user = Auth::requireAuth();
        sendResponse(getClientPayments($db, $user['user_id']));
    }
    
    // GET ?action=recent_documents
    if ($action === 'recent_documents') {
        $user = Auth::requireAuth();
        sendResponse(getClientDocuments($db, $user['user_id']));
    }
    
    // ===== AGENT DASHBOARD ENDPOINTS =====
    
    // GET ?action=agent_dashboard
    if ($action === 'agent_dashboard') {
        error_log("=== AGENT_DASHBOARD ENDPOINT CALLED ===");
        error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
        error_log("All Headers: " . json_encode(function_exists('getallheaders') ? getallheaders() : array_filter($_SERVER, function($k) { return strpos($k, 'HTTP_') === 0 || $k === 'REDIRECT_HTTP_AUTHORIZATION'; }, ARRAY_FILTER_USE_KEY)));
        error_log("Authorization Header Attempts:");
        error_log("  - HTTP_AUTHORIZATION: " . ($_SERVER['HTTP_AUTHORIZATION'] ?? 'NOT SET'));
        error_log("  - REDIRECT_HTTP_AUTHORIZATION: " . ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? 'NOT SET'));
        
        $user = Auth::requireUserType(['agent', 'admin']);
        error_log("User authenticated: " . json_encode($user));
        sendResponse(getAgentDashboard($db, $user['user_id']));
    }
    
    // GET ?action=agent_clients
    if ($action === 'agent_clients') {
        $user = Auth::requireUserType(['agent', 'admin']);
        
        $stmt = $db->query("
            SELECT id, email, first_name, last_name, phone, status, created_at
            FROM users 
            WHERE user_type = 'client'
            ORDER BY created_at DESC
        ");
        
        sendResponse($stmt->fetchAll());
    }
    
    // GET ?action=agent_stats
    if ($action === 'agent_stats') {
        $user = Auth::requireUserType(['agent', 'admin']);
        sendResponse(getAgentStats($db, $user['user_id']));
    }
    
    // GET ?action=agent_activity
    if ($action === 'agent_activity') {
        $user = Auth::requireUserType(['agent', 'admin']);
        
        $stmt = $db->prepare("
            SELECT * FROM activity_logs 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 50
        ");
        $stmt->execute([$user['user_id']]);
        sendResponse($stmt->fetchAll());
    }
    
    // GET ?action=agent_policies&status=active&client_id=123
    if ($action === 'agent_policies') {
        $user = Auth::requireUserType(['agent', 'admin']);
        
        $agentId = $user['user_id'];
        $status = $_GET['status'] ?? 'all';
        $clientId = $_GET['client_id'] ?? null;
        
        // Base query
        $query = "
            SELECT 
                p.policy_id,
                p.policy_number,
                p.policy_type,
                p.status,
                p.premium_amount,
                p.coverage_amount,
                p.start_date,
                p.end_date,
                p.renewal_date,
                p.client_id,
                CONCAT(c.first_name, ' ', c.last_name) AS client_name,
                c.email AS client_email,
                c.phone AS client_phone,
                p.insurer_name
            FROM policies p
            INNER JOIN clients c ON p.client_id = c.client_id
            WHERE p.agent_id = ?
        ";
        
        $params = [$agentId];
        
        // Filtrar por cliente
        if ($clientId) {
            $query .= " AND p.client_id = ?";
            $params[] = $clientId;
        }
        
        // Filtrar por estado
        if ($status !== 'all') {
            if ($status === 'expiring') {
                // Pólizas que vencen en los próximos 30 días
                $query .= " AND p.status = 'active' AND p.end_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)";
            } else {
                $query .= " AND p.status = ?";
                $params[] = $status;
            }
        }
        
        $query .= " ORDER BY p.end_date DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        
        $policies = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calcular estadísticas
        $stats = [
            'total' => count($policies),
            'active' => 0,
            'expiring' => 0,
            'expired' => 0
        ];
        
        $now = time();
        $thirtyDaysFromNow = strtotime('+30 days');
        
        foreach ($policies as $policy) {
            $endDate = strtotime($policy['end_date']);
            
            if ($policy['status'] === 'active') {
                $stats['active']++;
                if ($endDate > $now && $endDate <= $thirtyDaysFromNow) {
                    $stats['expiring']++;
                }
            } elseif ($policy['status'] === 'expired') {
                $stats['expired']++;
            }
        }
        
        sendResponse([
            'success' => true,
            'policies' => $policies,
            'stats' => $stats
        ]);
    }
    
    // GET ?action=clients (agent/admin)
    if ($action === 'clients') {
        $user = Auth::requireUserType(['agent', 'admin']);
        
        $stmt = $db->query("
            SELECT id, email, first_name, last_name, phone, status, created_at
            FROM users 
            WHERE user_type = 'client'
            ORDER BY created_at DESC
            LIMIT 100
        ");
        
        sendResponse($stmt->fetchAll());
    }
    
    // ===== ADMIN DASHBOARD ENDPOINTS =====
    
    // GET ?action=admin_dashboard
    if ($action === 'admin_dashboard') {
        $user = Auth::requireUserType(['admin']);
        sendResponse(getAdminDashboard($db));
    }
    
    // GET ?action=admin_stats
    if ($action === 'admin_stats') {
        $user = Auth::requireUserType(['admin']);
        sendResponse(getAdminStats($db));
    }
    
    // GET ?action=system_activity
    if ($action === 'system_activity') {
        $user = Auth::requireUserType(['admin']);
        sendResponse(getAdminActivity($db));
    }
    
    // ===== CALENDAR/MEETINGS ENDPOINTS =====
    
    // POST ?action=create_meeting
    if ($method === 'POST' && $action === 'create_meeting') {
        $user = Auth::requireAuth();
        
        require_once 'calendar-service.php';
        $calendar = new CalendarService($db);
        
        $meetingData = [
            'user_id' => $user['user_id'],
            'attendee_email' => $data['attendee_email'] ?? '',
            'title' => $data['title'] ?? 'Meeting',
            'description' => $data['description'] ?? '',
            'start_time' => $data['start_time'] ?? '',
            'end_time' => $data['end_time'] ?? '',
            'location' => $data['location'] ?? 'Virtual Meeting',
            'organizer_email' => $user['email'],
            'organizer_name' => $user['name'],
            'attendee_name' => $data['attendee_name'] ?? '',
            'created_by' => $user['user_id']
        ];
        
        $result = $calendar->createMeeting($meetingData);
        
        if ($result['success']) {
            sendResponse($result);
        } else {
            sendError($result['error'] ?? 'Failed to create meeting', 400);
        }
    }
    
    // GET ?action=list_meetings
    if ($action === 'list_meetings') {
        $user = Auth::requireAuth();
        
        require_once 'calendar-service.php';
        $calendar = new CalendarService($db);
        
        $startDate = $_GET['start'] ?? null;
        $endDate = $_GET['end'] ?? null;
        $status = $_GET['status'] ?? null;
        
        $meetings = $calendar->listMeetings($user['user_id'], $startDate, $endDate, $status);
        sendResponse($meetings);
    }
    
    // POST ?action=cancel_meeting
    if ($method === 'POST' && $action === 'cancel_meeting') {
        $user = Auth::requireAuth();
        
        require_once 'calendar-service.php';
        $calendar = new CalendarService($db);
        
        $meetingId = $data['meeting_id'] ?? $_GET['id'] ?? null;
        $reason = $data['reason'] ?? '';
        
        if (!$meetingId) {
            sendError('Meeting ID required', 400);
        }
        
        $result = $calendar->cancelMeeting($meetingId, $reason);
        
        if ($result['success']) {
            sendResponse($result);
        } else {
            sendError($result['error'] ?? 'Failed to cancel meeting', 400);
        }
    }
    
    // ===== PAYMENT RECEIPT ENDPOINTS =====
    
    // POST ?action=upload_payment_receipt
    if ($method === 'POST' && $action === 'upload_payment_receipt') {
        $user = Auth::requireAuth();
        
        require_once 'receipt-analyzer.php';
        $analyzer = new ReceiptAnalyzer();
        
        if (!isset($_FILES['receipt'])) {
            sendError('No file uploaded', 400);
        }
        
        $policyId = $_POST['policy_id'] ?? $data['policy_id'] ?? null;
        $paymentDate = $_POST['payment_date'] ?? $data['payment_date'] ?? null;
        $reference = $_POST['reference'] ?? $data['reference'] ?? '';
        
        if (!$policyId || !$paymentDate) {
            sendError('Policy ID and payment date required', 400);
        }
        
        // Process the receipt
        $result = $analyzer->processReceipt($_FILES['receipt'], $policyId, $user['user_id'], $paymentDate, $reference);
        
        if (!$result['success']) {
            sendError($result['error'], 400);
        }
        
        // Save to database
        $stmt = $db->prepare("
            INSERT INTO payment_receipts (
                policy_id, user_id, file_path, file_name, file_size, mime_type,
                extracted_amount, extracted_date, extracted_reference, extracted_bank,
                verification_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        ");
        
        $extracted = $result['extracted_data'];
        $stmt->execute([
            $policyId,
            $user['user_id'],
            $result['file_path'],
            $result['file_name'],
            $result['file_size'],
            $result['mime_type'],
            $extracted['amount'],
            $extracted['date'],
            $extracted['reference'] ?: $reference,
            $extracted['bank']
        ]);
        
        $receiptId = $db->lastInsertId();
        
        // Send notification to admin
        $emailService = new EmailService();
        $emailService->sendEmail(
            'admin@ksinsurancee.com',
            'Nuevo Comprobante de Pago Recibido',
            "Usuario: {$user['name']}<br>Póliza ID: $policyId<br>Monto detectado: \${$extracted['amount']}<br>Requiere verificación."
        );
        
        sendResponse([
            'success' => true,
            'receipt_id' => $receiptId,
            'extracted_data' => $extracted,
            'confidence' => $analyzer->getConfidenceDescription($extracted['confidence']),
            'message' => 'Receipt uploaded successfully. Verification pending.'
        ]);
    }
    
    // ===== GLOBAL SEARCH ENDPOINT =====
    
    // GET ?action=global_search&q=query
    if ($action === 'global_search') {
        $user = Auth::requireAuth();
        $query = $_GET['q'] ?? '';
        
        if (strlen($query) < 2) {
            sendResponse([
                'success' => true,
                'results' => [
                    'clients' => [],
                    'policies' => [],
                    'quotes' => []
                ]
            ]);
        }
        
        $searchTerm = '%' . $query . '%';
        $results = ['clients' => [], 'policies' => [], 'quotes' => []];
        
        try {
            // Buscar clientes (solo agentes/admin)
            if ($user['user_type'] === 'agent' || $user['user_type'] === 'admin') {
                $stmt = $db->prepare("
                    SELECT id, email, first_name, last_name, phone
                    FROM users 
                    WHERE user_type = 'client'
                    AND (
                        first_name LIKE ? OR 
                        last_name LIKE ? OR 
                        email LIKE ? OR 
                        phone LIKE ?
                    )
                    ORDER BY first_name, last_name
                    LIMIT 10
                ");
                $stmt->execute([$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
                $results['clients'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Buscar cotizaciones
                $stmt = $db->prepare("
                    SELECT id, email, first_name, last_name, quote_type, requested_at
                    FROM quotes 
                    WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?
                    ORDER BY requested_at DESC
                    LIMIT 10
                ");
                $stmt->execute([$searchTerm, $searchTerm, $searchTerm]);
                $results['quotes'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            // Buscar pólizas
            if ($user['user_type'] === 'client') {
                $stmt = $db->prepare("
                    SELECT 
                        p.policy_id, p.policy_number, p.policy_type, p.status
                    FROM policies p
                    WHERE p.client_id = ?
                    AND (
                        p.policy_number LIKE ? OR 
                        p.policy_type LIKE ?
                    )
                    LIMIT 10
                ");
                $stmt->execute([$user['user_id'], $searchTerm, $searchTerm]);
                $results['policies'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } else {
                $stmt = $db->prepare("
                    SELECT 
                        p.policy_id, 
                        p.policy_number, 
                        p.policy_type, 
                        p.status,
                        CONCAT(c.first_name, ' ', c.last_name) AS client_name
                    FROM policies p
                    INNER JOIN users c ON p.client_id = c.id
                    WHERE p.policy_number LIKE ? OR p.policy_type LIKE ?
                    LIMIT 10
                ");
                $stmt->execute([$searchTerm, $searchTerm]);
                $results['policies'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            sendResponse([
                'success' => true,
                'results' => $results
            ]);
            
        } catch (Exception $e) {
            error_log("Error en búsqueda: " . $e->getMessage());
            sendError('Error realizando búsqueda', 500);
        }
    }
    
    // ===== CLAIM COMMENTS ENDPOINTS =====
    
    // GET ?action=claim_details
    if ($action === 'claim_details') {
        $user = Auth::requireAuth();
        $claimId = $_GET['id'] ?? null;
        
        if (!$claimId) {
            sendError('Claim ID required', 400);
        }
        
        // Get claim details
        $stmt = $db->prepare("
            SELECT c.*, p.policy_number, p.policy_type,
                   u.name as client_name, u.email as client_email
            FROM claims c
            JOIN policies p ON c.policy_id = p.id
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        ");
        $stmt->execute([$claimId]);
        $claim = $stmt->fetch();
        
        if (!$claim) {
            sendError('Claim not found', 404);
        }
        
        // Get comments
        $stmt = $db->prepare("
            SELECT cc.*, u.name as from_name
            FROM claim_comments cc
            JOIN users u ON cc.user_id = u.id
            WHERE cc.claim_id = ?
            ORDER BY cc.created_at ASC
        ");
        $stmt->execute([$claimId]);
        $comments = $stmt->fetchAll();
        
        $claim['comments'] = $comments;
        sendResponse($claim);
    }
    
    // POST ?action=add_claim_comment
    if ($method === 'POST' && $action === 'add_claim_comment') {
        $user = Auth::requireAuth();
        
        $claimId = $data['id'] ?? $_GET['id'] ?? null;
        $message = $data['message'] ?? '';
        
        if (!$claimId || !$message) {
            sendError('Claim ID and message required', 400);
        }
        
        // Determine user type
        $userType = $user['user_type'] === 'agent' ? 'agent' : ($user['user_type'] === 'admin' ? 'admin' : 'client');
        
        // Insert comment
        $stmt = $db->prepare("
            INSERT INTO claim_comments (claim_id, user_id, user_type, message)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$claimId, $user['user_id'], $userType, $message]);
        
        // Get claim owner email for notification
        $stmt = $db->prepare("
            SELECT u.email, u.name, c.claim_number
            FROM claims c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        ");
        $stmt->execute([$claimId]);
        $claim = $stmt->fetch();
        
        if ($claim && $claim['email'] !== $user['email']) {
            $emailService = new EmailService();
            $emailService->sendEmail(
                $claim['email'],
                "Nuevo comentario en siniestro #{$claim['claim_number']}",
                "{$user['name']} ha agregado un comentario:<br><br>\"$message\"<br><br>Ingresa al dashboard para responder."
            );
        }
        
        sendResponse([
            'success' => true,
            'message' => 'Comment added and notification sent'
        ]);
    }
    
    // ===== DIRECT MESSAGES ENDPOINTS =====
    
    // POST ?action=dm_start_thread (Agente inicia thread con cliente)
    if ($method === 'POST' && $action === 'dm_start_thread') {
        $user = Auth::requireUserType(['agent']);
        
        $clientId = $data['client_id'] ?? null;
        $subject = $data['subject'] ?? 'Mensaje directo';
        $messageText = $data['message'] ?? null;
        
        if (!$clientId || !$messageText) {
            sendError('Client ID and message required', 400);
        }
        
        $agentId = $user['user_id'];
        
        // Verify client exists
        $stmt = $db->prepare("SELECT id FROM users WHERE id = ? AND user_type = 'client'");
        $stmt->execute([$clientId]);
        if (!$stmt->fetch()) {
            sendError('Client not found', 404);
        }
        
        // Check for existing active thread
        $stmt = $db->prepare("
            SELECT thread_id, expires_at 
            FROM direct_message_threads 
            WHERE agent_id = ? AND client_id = ? AND status = 'active'
        ");
        $stmt->execute([$agentId, $clientId]);
        $existingThread = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existingThread) {
            $threadId = $existingThread['thread_id'];
            $expiresAt = date('Y-m-d H:i:s', strtotime('+42 hours'));
            
            $stmt = $db->prepare("
                UPDATE direct_message_threads 
                SET last_message_at = NOW(), expires_at = ? 
                WHERE thread_id = ?
            ");
            $stmt->execute([$expiresAt, $threadId]);
            
        } else {
            $threadId = 'DM-' . time() . '-' . substr(md5($agentId . $clientId), 0, 8);
            $expiresAt = date('Y-m-d H:i:s', strtotime('+42 hours'));
            
            $stmt = $db->prepare("
                INSERT INTO direct_message_threads 
                (thread_id, agent_id, client_id, subject, status, expires_at, agent_name, client_name)
                VALUES (?, ?, ?, ?, 'active', ?, ?, ?)
            ");
            $stmt->execute([$threadId, $agentId, $clientId, $subject, $expiresAt, $user['name'], $data['client_name'] ?? 'Cliente']);
        }
        
        // Insert message
        $stmt = $db->prepare("
            INSERT INTO direct_messages 
            (thread_id, sender_id, recipient_id, message_text, expires_at)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$threadId, $agentId, $clientId, $messageText, $expiresAt]);
        
        sendResponse([
            'success' => true,
            'thread_id' => $threadId,
            'expires_at' => $expiresAt
        ]);
    }
    
    // GET ?action=dm_unread_count
    if ($action === 'dm_unread_count') {
        $user = Auth::requireAuth();
        $userId = $user['user_id'];
        
        $stmt = $db->prepare("
            SELECT COUNT(*) as unread_count
            FROM direct_message_threads
            WHERE (agent_id = ? OR client_id = ?) AND status = 'active'
        ");
        $stmt->execute([$userId, $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse([
            'success' => true,
            'unread_count' => (int)$result['unread_count']
        ]);
    }
    
    // GET ?action=dm_my_threads
    if ($action === 'dm_my_threads') {
        $user = Auth::requireAuth();
        $userId = $user['user_id'];
        
        $stmt = $db->prepare("
            SELECT thread_id, subject, created_at, expires_at, status,
                   agent_id, client_id, agent_name, client_name,
                   (SELECT COUNT(*) FROM direct_messages WHERE thread_id = t.thread_id AND is_read = 0) as unread_count
            FROM direct_message_threads t
            WHERE (agent_id = ? OR client_id = ?) AND status = 'active'
            ORDER BY created_at DESC
        ");
        $stmt->execute([$userId, $userId]);
        $threads = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $unreadTotal = array_sum(array_column($threads, 'unread_count'));
        
        sendResponse([
            'success' => true,
            'threads' => $threads,
            'total_unread' => $unreadTotal
        ]);
    }
    
    // GET ?action=dm_messages&thread_id=ID
    if ($action === 'dm_messages') {
        $user = Auth::requireAuth();
        $threadId = $_GET['thread_id'] ?? $data['thread_id'] ?? null;
        
        if (!$threadId) {
            sendError('Thread ID required', 400);
        }
        
        $stmt = $db->prepare("
            SELECT * FROM direct_messages
            WHERE thread_id = ?
            ORDER BY sent_at ASC
        ");
        $stmt->execute([$threadId]);
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Mark as read
        $stmt = $db->prepare("
            UPDATE direct_messages SET is_read = 1
            WHERE thread_id = ? AND recipient_id = ?
        ");
        $stmt->execute([$threadId, $user['user_id']]);
        
        sendResponse([
            'success' => true,
            'messages' => $messages
        ]);
    }
    
    // POST ?action=dm_send_message
    if ($method === 'POST' && $action === 'dm_send_message') {
        $user = Auth::requireAuth();
        $threadId = $data['thread_id'] ?? null;
        $messageText = $data['message'] ?? '';
        
        if (!$threadId || !$messageText) {
            sendError('Thread ID and message required', 400);
        }
        
        // Verify user is part of thread
        $stmt = $db->prepare("
            SELECT agent_id, client_id FROM direct_message_threads
            WHERE thread_id = ?
        ");
        $stmt->execute([$threadId]);
        $thread = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$thread || ($thread['agent_id'] !== $user['user_id'] && $thread['client_id'] !== $user['user_id'])) {
            sendError('Unauthorized', 403);
        }
        
        // Insert message
        $senderId = $user['user_id'];
        $recipientId = $senderId === $thread['agent_id'] ? $thread['client_id'] : $thread['agent_id'];
        
        $stmt = $db->prepare("
            INSERT INTO direct_messages (thread_id, sender_id, recipient_id, message_text, expires_at)
            VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 42 HOUR))
        ");
        $stmt->execute([$threadId, $senderId, $recipientId, $messageText]);
        
        sendResponse([
            'success' => true,
            'message_id' => $db->lastInsertId()
        ]);
    }
    
    // Default: Not found
    sendError('Endpoint not found', 404);
    
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    sendError('Internal server error', 500);
}
?>
