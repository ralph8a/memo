<?php
// Main API Router
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
if (in_array($origin, ALLOWED_ORIGINS)) {
    header("Access-Control-Allow-Origin: $origin");
}

require_once 'config.php';
require_once 'database.php';
require_once 'auth.php';
require_once 'email-service.php';

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api', '', $path); // Remove /api prefix
$path = trim($path, '/');
$segments = explode('/', $path);

// Get request body
$input = file_get_contents('php://input');
$data = json_decode($input, true) ?? [];

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
    
    // POST /auth/login
    if ($method === 'POST' && $segments[0] === 'auth' && $segments[1] === 'login') {
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
    
    // POST /auth/verify
    if ($method === 'POST' && $segments[0] === 'auth' && $segments[1] === 'verify') {
        $user = Auth::requireAuth();
        sendResponse(['valid' => true, 'user' => $user]);
    }
    
    // ===== QUOTES ENDPOINTS =====
    
    // POST /quotes/request
    if ($method === 'POST' && $segments[0] === 'quotes' && $segments[1] === 'request') {
        $email = $data['email'] ?? '';
        $firstName = $data['firstName'] ?? '';
        $lastName = $data['lastName'] ?? '';
        $phone = $data['phone'] ?? '';
        $quoteType = $data['quoteType'] ?? '';
        $coverageDetails = json_encode($data['coverageDetails'] ?? []);
        
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
    
    // GET /quotes (requires agent/admin auth)
    if ($method === 'GET' && $segments[0] === 'quotes') {
        Auth::requireUserType(['agent', 'admin']);
        
        $stmt = $db->query("SELECT * FROM quotes ORDER BY requested_at DESC LIMIT 100");
        $quotes = $stmt->fetchAll();
        
        sendResponse($quotes);
    }
    
    // ===== CLAIMS ENDPOINTS =====
    
    // POST /claims/:id/assign (requires agent/admin)
    if ($method === 'POST' && $segments[0] === 'claims' && $segments[2] === 'assign') {
        $user = Auth::requireUserType(['agent', 'admin']);
        $claimId = $segments[1];
        $agentId = $data['agentId'] ?? $user['user_id'];
        
        // Get claim details
        $stmt = $db->prepare("
            SELECT c.*, u.email as client_email, u.first_name as client_name
            FROM claims c
            JOIN users u ON c.client_id = u.id
            WHERE c.id = ?
        ");
        $stmt->execute([$claimId]);
        $claim = $stmt->fetch();
        
        if (!$claim) {
            sendError('Claim not found', 404);
        }
        
        // Assign claim
        $stmt = $db->prepare("UPDATE claims SET assigned_agent_id = ?, status = 'under_review' WHERE id = ?");
        $stmt->execute([$agentId, $claimId]);
        
        // Get agent email
        $stmt = $db->prepare("SELECT email FROM users WHERE id = ?");
        $stmt->execute([$agentId]);
        $agent = $stmt->fetch();
        
        // Send notification
        if ($agent) {
            EmailService::sendClaimAssignmentNotification(
                $agent['email'],
                $claim['client_name'],
                $claim['claim_number']
            );
        }
        
        sendResponse(['success' => true]);
    }
    
    // GET /claims (requires auth)
    if ($method === 'GET' && $segments[0] === 'claims' && !isset($segments[1])) {
        $user = Auth::requireAuth();
        
        if ($user['user_type'] === 'client') {
            // Clients see only their claims
            $stmt = $db->prepare("SELECT * FROM claims WHERE client_id = ? ORDER BY submitted_at DESC");
            $stmt->execute([$user['user_id']]);
        } else {
            // Agents/admin see all or assigned claims
            $stmt = $db->query("SELECT c.*, u.first_name, u.last_name 
                FROM claims c 
                JOIN users u ON c.client_id = u.id 
                ORDER BY c.submitted_at DESC 
                LIMIT 100");
        }
        
        $claims = $stmt->fetchAll();
        sendResponse($claims);
    }
    
    // ===== QUESTIONNAIRES ENDPOINTS =====
    
    // POST /questionnaires/send (requires agent/admin)
    if ($method === 'POST' && $segments[0] === 'questionnaires' && $segments[1] === 'send') {
        $user = Auth::requireUserType(['agent', 'admin']);
        
        $clientId = $data['clientId'] ?? null;
        $title = $data['title'] ?? '';
        $description = $data['description'] ?? '';
        
        if (!$clientId || !$title) {
            sendError('Client ID and title required', 400);
        }
        
        // Create questionnaire
        $stmt = $db->prepare("
            INSERT INTO questionnaires (client_id, agent_id, title, description, status, sent_at)
            VALUES (?, ?, ?, ?, 'sent', CURRENT_TIMESTAMP)
        ");
        $stmt->execute([$clientId, $user['user_id'], $title, $description]);
        
        // Get client email
        $stmt = $db->prepare("SELECT email, first_name, last_name FROM users WHERE id = ?");
        $stmt->execute([$clientId]);
        $client = $stmt->fetch();
        
        // Send notification
        if ($client) {
            EmailService::sendQuestionnaireNotification(
                $client['email'],
                $client['first_name'] . ' ' . $client['last_name'],
                $title
            );
        }
        
        sendResponse(['success' => true, 'questionnaire_id' => $db->lastInsertId()]);
    }
    
    // ===== NOTIFICATIONS ENDPOINT =====
    
    // POST /notifications/email
    if ($method === 'POST' && $segments[0] === 'notifications' && $segments[1] === 'email') {
        Auth::requireAuth();
        
        $to = $data['to'] ?? '';
        $subject = $data['subject'] ?? '';
        $message = $data['message'] ?? '';
        
        if (!$to || !$subject || !$message) {
            sendError('To, subject, and message required', 400);
        }
        
        $sent = EmailService::send($to, $subject, $message);
        
        sendResponse(['success' => $sent]);
    }
    
    // ===== AGENTS ENDPOINTS =====
    
    // GET /agents/clients (requires agent/admin)
    if ($method === 'GET' && $segments[0] === 'agents' && $segments[1] === 'clients') {
        Auth::requireUserType(['agent', 'admin']);
        
        $stmt = $db->query("
            SELECT id, email, first_name, last_name, phone, status, created_at
            FROM users 
            WHERE user_type = 'client'
            ORDER BY created_at DESC
        ");
        
        $clients = $stmt->fetchAll();
        sendResponse($clients);
    }
    
    // GET /agents/clients/:id (requires agent/admin)
    if ($method === 'GET' && $segments[0] === 'agents' && $segments[1] === 'clients' && isset($segments[2])) {
        Auth::requireUserType(['agent', 'admin']);
        $clientId = $segments[2];
        
        $stmt = $db->prepare("SELECT * FROM users WHERE id = ? AND user_type = 'client'");
        $stmt->execute([$clientId]);
        $client = $stmt->fetch();
        
        if (!$client) {
            sendError('Client not found', 404);
        }
        
        // Get client policies
        $stmt = $db->prepare("SELECT * FROM policies WHERE client_id = ?");
        $stmt->execute([$clientId]);
        $policies = $stmt->fetchAll();
        
        // Get client claims
        $stmt = $db->prepare("SELECT * FROM claims WHERE client_id = ? ORDER BY submitted_at DESC LIMIT 10");
        $stmt->execute([$clientId]);
        $claims = $stmt->fetchAll();
        
        sendResponse([
            'client' => $client,
            'policies' => $policies,
            'claims' => $claims
        ]);
    }
    
    // ===== ANALYTICS ENDPOINTS =====
    
    // GET /analytics/dashboard (requires auth)
    if ($method === 'GET' && $segments[0] === 'analytics' && $segments[1] === 'dashboard') {
        $user = Auth::requireAuth();
        
        $stats = [];
        
        if ($user['user_type'] === 'admin') {
            // Total users
            $stmt = $db->query("SELECT COUNT(*) as total FROM users WHERE user_type = 'client'");
            $stats['total_clients'] = $stmt->fetch()['total'];
            
            // Total policies
            $stmt = $db->query("SELECT COUNT(*) as total FROM policies WHERE status = 'active'");
            $stats['active_policies'] = $stmt->fetch()['total'];
            
            // Pending claims
            $stmt = $db->query("SELECT COUNT(*) as total FROM claims WHERE status IN ('submitted', 'under_review')");
            $stats['pending_claims'] = $stmt->fetch()['total'];
            
            // New quotes
            $stmt = $db->query("SELECT COUNT(*) as total FROM quotes WHERE status = 'new'");
            $stats['new_quotes'] = $stmt->fetch()['total'];
        }
        
        sendResponse($stats);
    }
    
    // Default: Not found
    sendError('Endpoint not found', 404);
    
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    sendError('Internal server error', 500);
}
?>
