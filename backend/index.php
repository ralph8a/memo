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
        $agent_id = $user['user_id'];
        
        // Get all clients with assignment info
        $stmt = $db->prepare("
            SELECT 
                u.id, 
                u.email, 
                u.first_name, 
                u.last_name, 
                u.phone, 
                u.status, 
                u.created_at,
                COUNT(DISTINCT p.id) as policy_count,
                SUM(CASE WHEN p.agent_id = ? THEN 1 ELSE 0 END) as assigned_policies,
                MAX(p.updated_at) as last_activity
            FROM users u
            LEFT JOIN policies p ON u.id = p.client_id
            WHERE u.user_type = 'client'
            GROUP BY u.id
            ORDER BY assigned_policies DESC, last_activity DESC, u.created_at DESC
        ");
        $stmt->execute([$agent_id]);
        
        $clients = $stmt->fetchAll();
        
        // Add is_assigned flag for frontend
        foreach ($clients as &$client) {
            $client['is_assigned'] = (int)$client['assigned_policies'] > 0;
        }
        
        sendResponse($clients);
        // sendResponse() hace exit, pero por claridad agregamos return
        return;
    }

    // GET ?action=client_details&id=123
    else if ($action === 'client_details') {
        try {
            $user = Auth::requireUserType(['agent', 'admin']);
            $client_id = $_GET['id'] ?? null;
            
            if (!$client_id) {
                http_response_code(400);
                sendResponse(['error' => 'Client ID required'], false);
                return;
            }
            
            // Get client info
            $stmt = $db->prepare("
                SELECT id, email, first_name, last_name, phone, status, created_at, updated_at
                FROM users 
                WHERE id = ? AND user_type = 'client'
            ");
            $stmt->execute([$client_id]);
            $client = $stmt->fetch();
            
            if (!$client) {
                http_response_code(404);
                sendResponse(['error' => 'Client not found'], false);
                return;
            }
            
            // Get client's policies
            $stmt = $db->prepare("
                SELECT id, policy_number, policy_type, status, premium_amount, 
                       coverage_amount, start_date, end_date, created_at
                FROM policies 
                WHERE client_id = ?
                ORDER BY created_at DESC
            ");
            $stmt->execute([$client_id]);
            $policies = $stmt->fetchAll();
            
            // Get client's claims (with error handling if table doesn't exist)
            $claims = [];
            try {
                $stmt = $db->prepare("
                    SELECT c.id, c.claim_number, c.status, c.amount, c.incident_date, 
                           c.created_at, p.policy_number, p.policy_type
                    FROM claims c
                    LEFT JOIN policies p ON c.policy_id = p.id
                    WHERE c.client_id = ?
                    ORDER BY c.created_at DESC
                    LIMIT 10
                ");
                $stmt->execute([$client_id]);
                $claims = $stmt->fetchAll();
            } catch (PDOException $e) {
                // Claims table might not exist yet
                error_log("Claims query failed: " . $e->getMessage());
                $claims = [];
            }
            
            sendResponse([
                'client' => $client,
                'policies' => $policies,
                'claims' => $claims
            ]);
            return;
        } catch (Exception $e) {
            error_log("client_details error: " . $e->getMessage());
            http_response_code(500);
            sendResponse(['error' => 'Internal server error: ' . $e->getMessage()], false);
            return;
        }
    }

    // GET ?action=client_contacts
    // Obtiene contactos frecuentes para un cliente (agentes asignados a sus pólizas)
    else if ($action === 'client_contacts') {
        $user = Auth::requireAuth();
        $client_id = $user['user_id'];
        
        // Si es agente/admin, puede ver contactos de cualquier cliente
        if (in_array($user['user_type'], ['agent', 'admin']) && isset($_GET['client_id'])) {
            $client_id = $_GET['client_id'];
        }
        
        // Get agents assigned to client's policies
        $stmt = $db->prepare("
            SELECT DISTINCT 
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                u.phone,
                GROUP_CONCAT(DISTINCT p.policy_type ORDER BY p.policy_type SEPARATOR ', ') as policy_types,
                COUNT(DISTINCT p.id) as policy_count,
                MAX(p.updated_at) as last_interaction
            FROM users u
            INNER JOIN policies p ON u.id = p.agent_id
            WHERE p.client_id = ? AND u.user_type = 'agent'
            GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone
            ORDER BY last_interaction DESC
            LIMIT 4
        ");
        $stmt->execute([$client_id]);
        $contacts = $stmt->fetchAll();
        
        // Enriquecer con roles
        foreach ($contacts as &$contact) {
            $contact['role'] = $contact['policy_count'] > 1 ? 'Agente asignado' : 'Especialista';
            $contact['full_name'] = $contact['first_name'] . ' ' . $contact['last_name'];
        }
        
        sendResponse($contacts);
        return;
    }

    // GET ?action=agent_list
    // Obtiene lista de todos los agentes disponibles
    else if ($action === 'agent_list') {
        // Endpoint público - no requiere autenticación estricta
        
        $stmt = $db->prepare("
            SELECT 
                id,
                first_name,
                last_name,
                email,
                phone,
                status,
                created_at
            FROM users 
            WHERE user_type = 'agent' AND status = 'active'
            ORDER BY first_name, last_name
        ");
        $stmt->execute();
        $agents = $stmt->fetchAll();
        
        // Agregar información adicional
        foreach ($agents as &$agent) {
            $agent['full_name'] = $agent['first_name'] . ' ' . $agent['last_name'];
            
            // Contar clientes del agente
            $stmt2 = $db->prepare("
                SELECT COUNT(DISTINCT client_id) as client_count
                FROM policies WHERE agent_id = ?
            ");
            $stmt2->execute([$agent['id']]);
            $count = $stmt2->fetch();
            $agent['clients_served'] = (int)$count['client_count'];
            
            // Obtener especialidades (tipos de póliza que maneja)
            $stmt3 = $db->prepare("
                SELECT DISTINCT policy_type
                FROM policies WHERE agent_id = ?
                ORDER BY policy_type
            ");
            $stmt3->execute([$agent['id']]);
            $specialties = $stmt3->fetchAll(PDO::FETCH_COLUMN);
            $agent['specialties'] = $specialties;
        }
        
        sendResponse($agents);
        return;
    }
    
    // GET ?action=agent_stats
    else if ($action === 'agent_stats') {
        $user = Auth::requireUserType(['agent', 'admin']);
        sendResponse(getAgentStats($db, $user['user_id']));
    }
    
    // GET ?action=agent_activity
    else if ($action === 'agent_activity') {
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
        
        try {
            // Base query
            $query = "
                SELECT 
                    p.id as policy_id,
                    p.policy_number,
                    p.policy_type,
                    p.status,
                    p.premium_amount,
                    p.coverage_amount,
                    p.start_date,
                    p.end_date,
                    p.renewal_date,
                    p.client_id,
                    CONCAT(u.first_name, ' ', u.last_name) AS client_name,
                    u.email AS client_email,
                    u.phone AS client_phone
                FROM policies p
                INNER JOIN users u ON p.client_id = u.id
                WHERE p.agent_id = ?
            ";
            
            $params = [$agentId];
            
            // Filter by client
            if ($clientId) {
                $query .= " AND p.client_id = ?";
                $params[] = $clientId;
            }
            
            // Filter by status
            if ($status !== 'all') {
                if ($status === 'expiring') {
                    // Policies expiring in next 30 days
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
            
            // Calculate stats
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
        } catch (Exception $e) {
            error_log('Agent Policies Error: ' . $e->getMessage());
            sendError('Error fetching policies: ' . $e->getMessage(), 500);
        }
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
                   CONCAT(u.first_name, ' ', u.last_name) as client_name, u.email as client_email
            FROM claims c
            JOIN policies p ON c.policy_id = p.id
            JOIN users u ON c.client_id = u.id
            WHERE c.id = ?
        ");
        $stmt->execute([$claimId]);
        $claim = $stmt->fetch();
        
        if (!$claim) {
            sendError('Claim not found', 404);
        }
        
        // Get comments
        $stmt = $db->prepare("
            SELECT cc.*, CONCAT(u.first_name, ' ', u.last_name) as from_name
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
            SELECT u.email, CONCAT(u.first_name, ' ', u.last_name) as name, c.claim_number
            FROM claims c
            JOIN users u ON c.client_id = u.id
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
    
    // POST ?action=add_policy_comment
    if ($method === 'POST' && $action === 'add_policy_comment') {
        $user = Auth::requireAuth();
        
        $policyId = $data['policy_id'] ?? $_GET['policy_id'] ?? null;
        $message = $data['message'] ?? '';
        
        if (!$policyId || !$message) {
            sendError('Policy ID and message required', 400);
        }
        
        try {
            // Verify policy exists and user has access
            $stmt = $db->prepare("
                SELECT p.id, p.policy_number, p.client_id, p.agent_id, c.email as client_email, c.first_name, c.last_name
                FROM policies p
                JOIN users c ON p.client_id = c.id
                WHERE p.id = ?
            ");
            $stmt->execute([$policyId]);
            $policy = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$policy) {
                sendError('Policy not found', 404);
            }
            
            // Verify user is agent of this policy or is client
            if ($user['user_type'] !== 'admin' && 
                $user['user_id'] !== $policy['agent_id'] && 
                $user['user_id'] !== $policy['client_id']) {
                sendError('Unauthorized', 403);
            }
            
            // Determine author type
            $authorType = $user['user_type'] === 'agent' ? 'agent' : ($user['user_type'] === 'admin' ? 'agent' : 'client');
            
            // Insert comment using actual schema: author_type, author_id, is_read
            $stmt = $db->prepare("
                INSERT INTO policy_comments 
                (policy_id, author_type, author_id, comment_text, is_internal, is_read)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $isInternal = 0; // Public comments by default
            $isRead = ($authorType === 'client') ? 1 : 0; // Mark as read for the reader
            $stmt->execute([$policyId, $authorType, $user['user_id'], $message, $isInternal, $isRead]);
            
            $commentId = $db->lastInsertId();
            
            // Send email notification to the other party
            $emailService = new EmailService();
            
            if ($authorType === 'agent') {
                // Agent commented, notify client
                $emailService->sendEmail(
                    $policy['client_email'],
                    "Nuevo comentario en póliza #{$policy['policy_number']}",
                    "Tu agente ha agregado un comentario en tu póliza:<br><br>\"" . htmlspecialchars($message) . "\"<br><br>Ingresa al dashboard para ver más detalles."
                );
            } else {
                // Client commented, notify agent
                $stmt = $db->prepare("SELECT email, first_name, last_name FROM users WHERE id = ?");
                $stmt->execute([$policy['agent_id']]);
                $agent = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($agent) {
                    $clientName = $policy['first_name'] . ' ' . $policy['last_name'];
                    $emailService->sendEmail(
                        $agent['email'],
                        "Nuevo comentario en póliza #{$policy['policy_number']}",
                        "$clientName ha agregado un comentario en su póliza:<br><br>\"" . htmlspecialchars($message) . "\"<br><br>Ingresa al dashboard para responder."
                    );
                }
            }
            
            error_log('Successfully added comment with ID: ' . $commentId);
            
            sendResponse([
                'success' => true,
                'message' => 'Comment added and notification sent',
                'comment_id' => (int)$commentId
            ]);
        } catch (Exception $e) {
            error_log('Policy Comment Error: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            sendError('Error adding comment: ' . $e->getMessage(), 500);
        }
    }
    
    // DEBUG: Check policy_comments table schema
    if ($action === 'debug_policy_comments_schema') {
        try {
            // Get table structure
            $stmt = $db->prepare("DESCRIBE policy_comments");
            $stmt->execute();
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Try to get first few rows
            $rows = [];
            try {
                $stmt = $db->prepare("SELECT * FROM policy_comments LIMIT 5");
                $stmt->execute();
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (Exception $e) {
                // Table might not exist or be empty
            }
            
            sendResponse([
                'success' => true,
                'table_columns' => $columns,
                'sample_rows' => $rows,
                'column_count' => count($columns),
                'row_count' => count($rows)
            ]);
        } catch (Exception $e) {
            sendResponse([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'policy_comments table might not exist or is inaccessible'
            ]);
        }
    }
    
    // GET ?action=policy_comments&policy_id=ID
    if ($action === 'policy_comments') {
        $user = Auth::requireAuth();
        $policyId = $_GET['policy_id'] ?? $data['policy_id'] ?? null;
        
        if (!$policyId) {
            sendError('Policy ID required', 400);
        }
        
        try {
            // Verify user has access to this policy
            $stmt = $db->prepare("
                SELECT id, client_id, agent_id FROM policies WHERE id = ?
            ");
            $stmt->execute([$policyId]);
            $policy = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$policy) {
                sendError('Policy not found', 404);
            }
            
            if ($user['user_type'] !== 'admin' && 
                $user['user_id'] !== $policy['agent_id'] && 
                $user['user_id'] !== $policy['client_id']) {
                sendError('Unauthorized', 403);
            }
            
            // Get comments using actual schema columns
            $stmt = $db->prepare("
                SELECT pc.comment_id, pc.comment_text, pc.author_type, pc.author_id,
                       pc.is_internal, pc.is_read, pc.created_at,
                       u.first_name, u.last_name, u.email
                FROM policy_comments pc
                JOIN users u ON pc.author_id = u.id
                WHERE pc.policy_id = ?
                ORDER BY pc.created_at DESC
            ");
            $stmt->execute([$policyId]);
            $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Mark comments as read for current user
            // For clients: mark all as read
            // For agents: only mark agent comments as unread initially
            if ($user['user_type'] === 'client') {
                $stmt = $db->prepare("
                    UPDATE policy_comments SET is_read = 1
                    WHERE policy_id = ? AND is_read = 0
                ");
                $stmt->execute([$policyId]);
            }
            
            sendResponse([
                'success' => true,
                'comments' => $comments ?: []
            ]);
        } catch (Exception $e) {
            error_log('Get Policy Comments Error: ' . $e->getMessage());
            sendError('Error fetching comments: ' . $e->getMessage(), 500);
        }
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
                SET expires_at = ? 
                WHERE thread_id = ?
            ");
            $stmt->execute([$expiresAt, $threadId]);
            
        } else {
            $threadId = 'DM-' . time() . '-' . substr(md5($agentId . $clientId), 0, 8);
            $expiresAt = date('Y-m-d H:i:s', strtotime('+42 hours'));
            
            $stmt = $db->prepare("
                INSERT INTO direct_message_threads 
                (thread_id, agent_id, client_id, subject, status, expires_at)
                VALUES (?, ?, ?, ?, 'active', ?)
            ");
            $stmt->execute([$threadId, $agentId, $clientId, $subject, $expiresAt]);
        }
        
        // Insert initial message
        $stmt = $db->prepare("
            INSERT INTO direct_messages 
            (thread_id, agent_id, client_id, sender_id, sender_type, message_text, expires_at)
            VALUES (?, ?, ?, ?, 'agent', ?, ?)
        ");
        $stmt->execute([$threadId, $agentId, $clientId, $agentId, $messageText, $expiresAt]);
        
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
        
        try {
            // Get threads for this user
            $stmt = $db->prepare("
                SELECT DISTINCT
                    t.thread_id, 
                    t.subject, 
                    t.created_at, 
                    t.expires_at, 
                    t.status,
                    t.agent_id, 
                    t.client_id,
                    CONCAT(COALESCE(a.first_name, ''), ' ', COALESCE(a.last_name, '')) as agent_name,
                    CONCAT(COALESCE(c.first_name, ''), ' ', COALESCE(c.last_name, '')) as client_name
                FROM direct_message_threads t
                LEFT JOIN users a ON t.agent_id = a.id
                LEFT JOIN users c ON t.client_id = c.id
                WHERE (t.agent_id = ? OR t.client_id = ?) AND t.status = 'active'
                ORDER BY t.created_at DESC
            ");
            $stmt->execute([$userId, $userId]);
            $threads = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Calculate unread for each thread
            $unreadTotal = 0;
            if ($threads) {
                foreach ($threads as &$thread) {
                    $unreadStmt = $db->prepare("
                        SELECT COUNT(*) as unread_count
                        FROM direct_messages
                        WHERE thread_id = ? AND sender_id != ? AND is_read = 0
                    ");
                    $unreadStmt->execute([$thread['thread_id'], $userId]);
                    $unread = $unreadStmt->fetch(PDO::FETCH_ASSOC);
                    $thread['unread_count'] = (int)($unread['unread_count'] ?? 0);
                    $unreadTotal += $thread['unread_count'];
                }
            }
            
            sendResponse([
                'success' => true,
                'threads' => $threads ?: [],
                'total_unread' => $unreadTotal
            ]);
        } catch (Exception $e) {
            error_log('DM Threads Error: ' . $e->getMessage());
            sendError('Error fetching threads: ' . $e->getMessage(), 500);
        }
    }
    
    // GET ?action=dm_messages&thread_id=ID
    if ($action === 'dm_messages') {
        $user = Auth::requireAuth();
        $threadId = $_GET['thread_id'] ?? $data['thread_id'] ?? null;
        
        if (!$threadId) {
            sendError('Thread ID required', 400);
        }
        
        $stmt = $db->prepare("
            SELECT 
                dm.dm_id, 
                dm.thread_id, 
                dm.sender_id, 
                dm.sender_type, 
                dm.message_text, 
                dm.created_at, 
                dm.is_read,
                CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) as sender_name
            FROM direct_messages dm
            LEFT JOIN users u ON dm.sender_id = u.id
            WHERE dm.thread_id = ?
            ORDER BY dm.created_at ASC
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
        error_log("=== DM SEND MESSAGE DEBUG ===");
        error_log("Raw input: " . $input);
        error_log("Decoded data: " . json_encode($data));
        
        $user = Auth::requireAuth();
        $threadId = $data['thread_id'] ?? null;
        $messageText = $data['message'] ?? '';
        
        error_log("Thread ID: " . ($threadId ?? 'NULL'));
        error_log("Message: " . $messageText);
        error_log("User ID: " . $user['user_id']);
        
        if (!$threadId || !$messageText) {
            error_log("Missing thread_id or message");
            sendError('Thread ID and message required', 400);
        }
        
        // Verify user is part of thread
        $stmt = $db->prepare("
            SELECT agent_id, client_id FROM direct_message_threads
            WHERE thread_id = ?
        ");
        $stmt->execute([$threadId]);
        $thread = $stmt->fetch(PDO::FETCH_ASSOC);
        
        error_log("Thread found: " . json_encode($thread));
        
        if (!$thread || ($thread['agent_id'] != $user['user_id'] && $thread['client_id'] != $user['user_id'])) {
            error_log("Unauthorized: User not in thread or thread not found");
            sendError('Unauthorized', 403);
        }
        
        // Insert message
        $senderId = $user['user_id'];
        $senderType = $senderId == $thread['agent_id'] ? 'agent' : 'client';
        $agentId = $thread['agent_id'];
        $clientId = $thread['client_id'];
        
        error_log("Inserting message - Sender: $senderId, Type: $senderType, Agent: $agentId, Client: $clientId");
        
        $stmt = $db->prepare("
            INSERT INTO direct_messages (thread_id, agent_id, client_id, sender_id, sender_type, message_text, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 42 HOUR))
        ");
        $result = $stmt->execute([$threadId, $agentId, $clientId, $senderId, $senderType, $messageText]);
        
        if (!$result) {
            error_log("Insert failed: " . json_encode($stmt->errorInfo()));
            sendError('Failed to insert message', 500);
        }
        
        $messageId = $db->lastInsertId();
        error_log("Message inserted successfully. ID: " . $messageId);
        
        sendResponse([
            'success' => true,
            'message_id' => $messageId
        ]);
    }
    
    // ===== DASHBOARD ANALYTICS ENDPOINTS =====
    
    // GET ?action=policy_health_stats - Statistics for policy health monitor
    if ($action === 'policy_health_stats') {
        $user = Auth::requireAuth();
        $userId = $user['user_id'];
        $userType = $user['user_type'];
        
        try {
            if ($userType === 'client') {
                // Client view - their policies only
                $stmt = $db->prepare("
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
                        SUM(CASE WHEN status = 'pending_renewal' OR DATEDIFF(renewal_date, NOW()) <= 30 THEN 1 ELSE 0 END) as renewal_count,
                        SUM(CASE WHEN status = 'expired' OR status = 'cancelled' THEN 1 ELSE 0 END) as risk_count
                    FROM policies
                    WHERE client_id = ?
                ");
                $stmt->execute([$userId]);
            } else {
                // Agent view - all their clients' policies
                $stmt = $db->prepare("
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
                        SUM(CASE WHEN status = 'pending_renewal' OR DATEDIFF(renewal_date, NOW()) <= 30 THEN 1 ELSE 0 END) as renewal_count,
                        SUM(CASE WHEN status = 'expired' OR status = 'cancelled' THEN 1 ELSE 0 END) as risk_count
                    FROM policies
                    WHERE agent_id = ?
                ");
                $stmt->execute([$userId]);
            }
            
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
            $total = $stats['total'] ?: 1; // Avoid division by zero
            
            sendResponse([
                'success' => true,
                'stats' => [
                    'total' => (int)$stats['total'],
                    'active' => (int)$stats['active_count'],
                    'renewal' => (int)$stats['renewal_count'],
                    'risk' => (int)$stats['risk_count'],
                    'active_percent' => round(($stats['active_count'] / $total) * 100, 1),
                    'renewal_percent' => round(($stats['renewal_count'] / $total) * 100, 1),
                    'risk_percent' => round(($stats['risk_count'] / $total) * 100, 1)
                ]
            ]);
        } catch (Exception $e) {
            error_log("Policy health stats error: " . $e->getMessage());
            sendError('Error fetching policy stats', 500);
        }
    }
    
    // GET ?action=pending_actions - Get pending tasks based on policy dates
    if ($action === 'pending_actions') {
        $user = Auth::requireAuth();
        $userId = $user['user_id'];
        $userType = $user['user_type'];
        
        try {
            $actions = [];
            
            if ($userType === 'client') {
                // Renewal reminders (within 30 days)
                $stmt = $db->prepare("
                    SELECT 
                        'Renovación próxima' as action,
                        policy_number,
                        renewal_date as due_date,
                        DATEDIFF(renewal_date, NOW()) as days_until
                    FROM policies
                    WHERE client_id = ? 
                        AND status = 'active'
                        AND DATEDIFF(renewal_date, NOW()) BETWEEN 0 AND 30
                    ORDER BY renewal_date ASC
                    LIMIT 5
                ");
                $stmt->execute([$userId]);
                $renewals = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Payment reminders
                $stmt = $db->prepare("
                    SELECT 
                        'Pago pendiente' as action,
                        p.policy_number,
                        ps.due_date,
                        DATEDIFF(ps.due_date, NOW()) as days_until
                    FROM payment_schedules ps
                    JOIN policies p ON ps.policy_id = p.id
                    WHERE p.client_id = ? 
                        AND ps.status = 'pending'
                        AND DATEDIFF(ps.due_date, NOW()) BETWEEN -7 AND 7
                    ORDER BY ps.due_date ASC
                    LIMIT 5
                ");
                $stmt->execute([$userId]);
                $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $actions = array_merge($renewals, $payments);
                
            } else {
                // Agent view - broader scope
                $stmt = $db->prepare("
                    SELECT 
                        'Renovación próxima' as action,
                        CONCAT(p.policy_number, ' - ', CONCAT(u.first_name, ' ', u.last_name)) as policy_number,
                        p.renewal_date as due_date,
                        DATEDIFF(p.renewal_date, NOW()) as days_until
                    FROM policies p
                    JOIN users u ON p.client_id = u.id
                    WHERE p.agent_id = ? 
                        AND p.status = 'active'
                        AND DATEDIFF(p.renewal_date, NOW()) BETWEEN 0 AND 30
                    ORDER BY p.renewal_date ASC
                    LIMIT 10
                ");
                $stmt->execute([$userId]);
                $actions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            sendResponse([
                'success' => true,
                'actions' => $actions,
                'count' => count($actions)
            ]);
        } catch (Exception $e) {
            error_log("Pending actions error: " . $e->getMessage());
            sendError('Error fetching pending actions', 500);
        }
    }
    
    // GET ?action=notifications - Get user notifications from comments, payments, policies, and system
    if ($action === 'notifications') {
        $user = Auth::requireAuth();
        $userId = $user['user_id'];
        $userType = $user['user_type'];
        
        try {
            $notifications = [];
            
            // Helper function to calculate time ago
            $getTimeAgo = function($timestamp) {
                $diff = time() - strtotime($timestamp);
                if ($diff < 60) return 'hace ' . $diff . ' segundos';
                if ($diff < 3600) return 'hace ' . floor($diff / 60) . ' minutos';
                if ($diff < 86400) return 'hace ' . floor($diff / 3600) . ' horas';
                return 'hace ' . floor($diff / 86400) . ' días';
            };
            
            // 1. PAYMENT NOTIFICATIONS - Pagos próximos a vencer
            if ($userType === 'client') {
                $stmt = $db->prepare("
                    SELECT 
                        ps.schedule_id,
                        ps.policy_id,
                        ps.due_date,
                        ps.amount_due as amount,
                        p.policy_number,
                        p.policy_type,
                        DATEDIFF(ps.due_date, CURDATE()) as days_until
                    FROM payment_schedules ps
                    INNER JOIN policies p ON ps.policy_id = p.id
                    WHERE p.client_id = ?
                      AND ps.status = 'pending'
                      AND ps.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 15 DAY)
                    ORDER BY ps.due_date ASC
                    LIMIT 10
                ");
                $stmt->execute([$userId]);
                $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($payments as $payment) {
                    $priority = $payment['days_until'] <= 3 ? 'high' : ($payment['days_until'] <= 7 ? 'normal' : 'low');
                    $notifications[] = [
                        'id' => 'payment_' . $payment['schedule_id'],
                        'type' => 'payment',
                        'title' => 'Pago próximo a vencer',
                        'message' => "Tu pago de póliza {$payment['policy_number']} vence en {$payment['days_until']} día(s). Monto: $" . number_format($payment['amount'], 2),
                        'time' => $getTimeAgo($payment['due_date']),
                        'read' => false,
                        'priority' => $priority,
                        'data' => [
                            'policy_id' => (int)$payment['policy_id'],
                            'schedule_id' => (int)$payment['schedule_id'],
                            'amount' => (float)$payment['amount'],
                            'due_date' => $payment['due_date']
                        ],
                        'actions' => [
                            ['label' => 'Realizar pago', 'action' => 'makePayment', 'policyId' => (int)$payment['policy_id']],
                            ['label' => 'Ver póliza', 'action' => 'viewPolicy', 'policyId' => (int)$payment['policy_id']]
                        ]
                    ];
                }
            } else {
                // Para agentes: pagos atrasados de sus clientes
                $stmt = $db->prepare("
                    SELECT 
                        ps.schedule_id,
                        ps.policy_id,
                        ps.due_date,
                        ps.amount_due as amount,
                        p.policy_number,
                        CONCAT(u.first_name, ' ', u.last_name) as client_name,
                        DATEDIFF(CURDATE(), ps.due_date) as days_overdue
                    FROM payment_schedules ps
                    INNER JOIN policies p ON ps.policy_id = p.id
                    INNER JOIN users u ON p.client_id = u.id
                    WHERE p.agent_id = ?
                      AND ps.status = 'pending'
                      AND ps.due_date < CURDATE()
                    ORDER BY ps.due_date ASC
                    LIMIT 10
                ");
                $stmt->execute([$userId]);
                $overduePayments = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($overduePayments as $payment) {
                    $notifications[] = [
                        'id' => 'payment_overdue_' . $payment['schedule_id'],
                        'type' => 'payment',
                        'title' => 'Pago atrasado',
                        'message' => "Cliente {$payment['client_name']} - Póliza {$payment['policy_number']} tiene un pago vencido hace {$payment['days_overdue']} día(s)",
                        'time' => $getTimeAgo($payment['due_date']),
                        'read' => false,
                        'priority' => 'high',
                        'data' => [
                            'policy_id' => (int)$payment['policy_id'],
                            'schedule_id' => (int)$payment['schedule_id']
                        ],
                        'actions' => [
                            ['label' => 'Ver póliza', 'action' => 'viewPolicy', 'policyId' => (int)$payment['policy_id']]
                        ]
                    ];
                }
            }
            
            // 2. POLICY NOTIFICATIONS - Renovaciones próximas
            if ($userType === 'client') {
                $stmt = $db->prepare("
                    SELECT 
                        id as policy_id,
                        policy_number,
                        policy_type,
                        renewal_date,
                        premium_amount,
                        DATEDIFF(renewal_date, CURDATE()) as days_until
                    FROM policies
                    WHERE client_id = ?
                      AND status = 'active'
                      AND renewal_date IS NOT NULL
                      AND renewal_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 60 DAY)
                    ORDER BY renewal_date ASC
                    LIMIT 10
                ");
                $stmt->execute([$userId]);
            } else {
                $stmt = $db->prepare("
                    SELECT 
                        p.id as policy_id,
                        p.policy_number,
                        p.policy_type,
                        p.renewal_date,
                        p.premium_amount,
                        CONCAT(u.first_name, ' ', u.last_name) as client_name,
                        DATEDIFF(p.renewal_date, CURDATE()) as days_until
                    FROM policies p
                    INNER JOIN users u ON p.client_id = u.id
                    WHERE p.agent_id = ?
                      AND p.status = 'active'
                      AND p.renewal_date IS NOT NULL
                      AND p.renewal_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 60 DAY)
                    ORDER BY p.renewal_date ASC
                    LIMIT 10
                ");
                $stmt->execute([$userId]);
            }
            
            $renewals = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($renewals as $renewal) {
                $priority = $renewal['days_until'] <= 15 ? 'high' : 'normal';
                $clientInfo = isset($renewal['client_name']) ? " - Cliente: {$renewal['client_name']}" : "";
                
                $notifications[] = [
                    'id' => 'renewal_' . $renewal['policy_id'],
                    'type' => 'policy',
                    'title' => 'Renovación próxima',
                    'message' => "Póliza {$renewal['policy_number']} vence en {$renewal['days_until']} día(s){$clientInfo}",
                    'time' => $getTimeAgo($renewal['renewal_date']),
                    'read' => false,
                    'priority' => $priority,
                    'data' => [
                        'policy_id' => (int)$renewal['policy_id'],
                        'renewal_date' => $renewal['renewal_date']
                    ],
                    'actions' => [
                        ['label' => 'Renovar póliza', 'action' => 'viewPolicy', 'policyId' => (int)$renewal['policy_id']],
                        ['label' => 'Ver detalles', 'action' => 'viewPolicy', 'policyId' => (int)$renewal['policy_id']]
                    ]
                ];
            }
            
            // 3. COMMENT NOTIFICATIONS - Comentarios sin leer
            if ($userType === 'client') {
                $stmt = $db->prepare("
                    SELECT 
                        pc.comment_id,
                        pc.policy_id,
                        pc.comment_text,
                        pc.created_at,
                        p.policy_number,
                        CONCAT(u.first_name, ' ', u.last_name) as author_name
                    FROM policy_comments pc
                    INNER JOIN policies p ON pc.policy_id = p.id
                    LEFT JOIN users u ON pc.author_id = u.id
                    WHERE p.client_id = ?
                      AND pc.author_type = 'agent'
                      AND pc.is_read = 0
                      AND pc.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                    ORDER BY pc.created_at DESC
                    LIMIT 15
                ");
                $stmt->execute([$userId]);
            } else {
                $stmt = $db->prepare("
                    SELECT 
                        pc.comment_id,
                        pc.policy_id,
                        pc.comment_text,
                        pc.created_at,
                        p.policy_number,
                        CONCAT(u.first_name, ' ', u.last_name) as author_name
                    FROM policy_comments pc
                    INNER JOIN policies p ON pc.policy_id = p.id
                    LEFT JOIN users u ON pc.author_id = u.id
                    WHERE p.agent_id = ?
                      AND pc.author_type = 'client'
                      AND pc.is_read = 0
                      AND pc.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                    ORDER BY pc.created_at DESC
                    LIMIT 15
                ");
                $stmt->execute([$userId]);
            }
            
            $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($comments as $comment) {
                $notifications[] = [
                    'id' => 'comment_' . $comment['comment_id'],
                    'type' => 'comment',
                    'title' => 'Nuevo comentario en póliza ' . $comment['policy_number'],
                    'message' => $comment['author_name'] . ': "' . substr($comment['comment_text'], 0, 80) . (strlen($comment['comment_text']) > 80 ? '..."' : '"'),
                    'time' => $getTimeAgo($comment['created_at']),
                    'read' => false,
                    'priority' => 'normal',
                    'data' => [
                        'policy_id' => (int)$comment['policy_id'],
                        'comment_id' => (int)$comment['comment_id']
                    ],
                    'actions' => [
                        ['label' => 'Ver comentario', 'action' => 'viewPolicy', 'policyId' => (int)$comment['policy_id']]
                    ]
                ];
            }
            
            // 4. SYSTEM NOTIFICATIONS - Notificaciones del sistema
            // Pólizas recientemente aprobadas
            if ($userType === 'client') {
                $stmt = $db->prepare("
                    SELECT 
                        id as policy_id,
                        policy_number,
                        policy_type,
                        created_at,
                        status
                    FROM policies
                    WHERE client_id = ?
                      AND status = 'active'
                      AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                    ORDER BY created_at DESC
                    LIMIT 5
                ");
                $stmt->execute([$userId]);
                $newPolicies = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($newPolicies as $policy) {
                    $notifications[] = [
                        'id' => 'system_new_policy_' . $policy['policy_id'],
                        'type' => 'system',
                        'title' => 'Póliza activada',
                        'message' => "Tu póliza {$policy['policy_number']} ha sido activada y está en vigencia",
                        'time' => $getTimeAgo($policy['created_at']),
                        'read' => false,
                        'priority' => 'normal',
                        'data' => [
                            'policy_id' => (int)$policy['policy_id']
                        ],
                        'actions' => [
                            ['label' => 'Ver póliza', 'action' => 'viewPolicy', 'policyId' => (int)$policy['policy_id']]
                        ]
                    ];
                }
            }
            
            // Mensaje del sistema para todos
            if (date('H') < 12) {
                $notifications[] = [
                    'id' => 'system_welcome_' . date('Ymd'),
                    'type' => 'system',
                    'title' => 'Bienvenido al Dashboard',
                    'message' => 'Tienes ' . count($notifications) . ' notificaciones pendientes. Revisa tus pólizas y pagos.',
                    'time' => 'hoy',
                    'read' => false,
                    'priority' => 'low',
                    'data' => [],
                    'actions' => []
                ];
            }
            
            // Ordenar por prioridad y fecha
            usort($notifications, function($a, $b) {
                $priorityOrder = ['high' => 0, 'normal' => 1, 'low' => 2];
                $aPriority = $priorityOrder[$a['priority']] ?? 1;
                $bPriority = $priorityOrder[$b['priority']] ?? 1;
                return $aPriority - $bPriority;
            });
            
            sendResponse([
                'success' => true,
                'notifications' => $notifications,
                'unread_count' => count($notifications)
            ]);
        } catch (Exception $e) {
            error_log("Notifications error: " . $e->getMessage());
            sendError('Error fetching notifications', 500);
        }
    }
    
    // GET ?action=payment_trends - Historical payment data for charts
    if ($action === 'payment_trends') {
        $user = Auth::requireAuth();
        $userId = $user['user_id'];
        $userType = $user['user_type'];
        
        try {
            if ($userType === 'client') {
                $stmt = $db->prepare("
                    SELECT 
                        DATE_FORMAT(p.payment_date, '%Y-%m') as month,
                        COUNT(*) as payment_count,
                        SUM(p.amount) as total_amount,
                        SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) as on_time_count,
                        SUM(CASE WHEN p.status = 'failed' THEN 1 ELSE 0 END) as late_count
                    FROM payments p
                    WHERE p.client_id = ? 
                        AND p.payment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                    GROUP BY DATE_FORMAT(p.payment_date, '%Y-%m')
                    ORDER BY month ASC
                ");
                $stmt->execute([$userId]);
            } else {
                // For agents, join with policies to get agent_id
                $stmt = $db->prepare("
                    SELECT 
                        DATE_FORMAT(p.payment_date, '%Y-%m') as month,
                        COUNT(*) as payment_count,
                        SUM(p.amount) as total_amount,
                        SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) as on_time_count,
                        SUM(CASE WHEN p.status = 'failed' THEN 1 ELSE 0 END) as late_count
                    FROM payments p
                    JOIN policies pol ON p.policy_id = pol.id
                    WHERE pol.agent_id = ? 
                        AND p.payment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                    GROUP BY DATE_FORMAT(p.payment_date, '%Y-%m')
                    ORDER BY month ASC
                ");
                $stmt->execute([$userId]);
            }
            
            $trends = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Calculate summary stats
            $totalPayments = array_sum(array_column($trends, 'payment_count'));
            $totalOnTime = array_sum(array_column($trends, 'on_time_count'));
            $totalLate = array_sum(array_column($trends, 'late_count'));
            
            sendResponse([
                'success' => true,
                'trends' => $trends,
                'summary' => [
                    'total_payments' => (int)$totalPayments,
                    'on_time' => (int)$totalOnTime,
                    'late' => (int)$totalLate,
                    'on_time_rate' => $totalPayments > 0 ? round(($totalOnTime / $totalPayments) * 100, 1) : 100
                ]
            ]);
        } catch (Exception $e) {
            error_log("Payment trends error: " . $e->getMessage());
            sendError('Error fetching payment trends', 500);
        }
    }
    
    // Default: Not found
    sendError('Endpoint not found', 404);
    
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    sendError('Internal server error', 500);
}
?>
