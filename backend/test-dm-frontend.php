<?php
require_once 'config.php';
require_once 'database.php';
require_once 'auth.php';

// Enable error display
error_reporting(E_ALL);
ini_set('display_errors', 1);

$db = getDB();

echo "=== TESTING dm_start_thread AS FRONTEND WOULD CALL IT ===\n\n";

// Simulate the exact request from frontend
$_SERVER['REQUEST_METHOD'] = 'POST';
$_GET['action'] = 'dm_start_thread';

// Simulate the JWT token
$token = Auth::generateToken(2, 'agent', 'guillermo.krause@ksinsurancee.com');
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;

// Simulate the exact POST body from frontend
$postData = [
    'client_id' => 35,
    'subject' => 'Mensaje de tu agente',
    'message' => 'Test message from frontend simulation'
];

echo "POST Body:\n";
echo json_encode($postData, JSON_PRETTY_PRINT) . "\n\n";

// Read from php://input simulation
$tempFile = tmpfile();
fwrite($tempFile, json_encode($postData));
rewind($tempFile);

// Now execute the actual endpoint code
try {
    $user = Auth::requireAuth();
    echo "✅ Auth passed: User ID {$user['user_id']}, Type {$user['user_type']}\n";
    
    // Read POST data
    $rawInput = file_get_contents('php://input');
    echo "Raw php://input: $rawInput\n";
    
    $data = json_decode($rawInput, true);
    echo "Decoded data: " . json_encode($data) . "\n";
    
    if (!$data) {
        echo "❌ ERROR: json_decode returned null!\n";
        echo "JSON last error: " . json_last_error_msg() . "\n";
        exit;
    }
    
    $clientId = $data['client_id'] ?? null;
    $messageText = $data['message'] ?? null;
    $subject = $data['subject'] ?? 'Mensaje directo';
    
    echo "Extracted values:\n";
    echo "  client_id: $clientId\n";
    echo "  message: $messageText\n";
    echo "  subject: $subject\n";
    
    if (!$clientId || !$messageText) {
        echo "❌ ERROR: Missing required fields\n";
        exit;
    }
    
    echo "\n✅ All validation passed! Endpoint would work correctly.\n";
    
} catch (Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
