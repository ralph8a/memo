<?php
// Main API Router
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Set CORS headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = $GLOBALS['ALLOWED_ORIGINS'] ?? [];
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
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
    
    // Default: Not found
    sendError('Endpoint not found', 404);
    
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    sendError('Internal server error', 500);
}
?>
