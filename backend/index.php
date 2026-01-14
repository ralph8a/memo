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
        $user = Auth::requireAuth();
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
        $user = Auth::requireUserType(['agent', 'admin']);
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
    
    // Default: Not found
    sendError('Endpoint not found', 404);
    
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    sendError('Internal server error', 500);
}
?>
