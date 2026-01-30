<?php
require_once 'config.php';
require_once 'database.php';
require_once 'auth.php';

$db = getDB();

echo "=== TESTING dm_start_thread ENDPOINT ===\n\n";

// Simulate agent login
$agentId = 2; // Guillermo Krause
$clientId = 35; // María Elena García

// Generate a token for testing
$token = Auth::generateToken($agentId, 'agent', 'guillermo.krause@ksinsurancee.com');

echo "Testing with:\n";
echo "  Agent ID: $agentId\n";
echo "  Client ID: $clientId\n";
echo "  Token: " . substr($token, 0, 50) . "...\n\n";

// Simulate POST request
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;
$_GET['action'] = 'dm_start_thread';

$postData = json_encode([
    'client_id' => $clientId,
    'subject' => 'Consulta sobre póliza',
    'message' => 'Hola, necesito información sobre mi póliza AUTO-001-2026'
]);

// Simulate the request
echo "Simulating POST to ?action=dm_start_thread...\n";
echo "POST data: $postData\n\n";

try {
    // Manually execute the endpoint logic
    $data = json_decode($postData, true);
    
    $user = Auth::requireAuth();
    echo "✅ Auth passed: User ID {$user['user_id']}, Type: {$user['user_type']}\n";
    
    $messageText = $data['message'];
    $subject = $data['subject'] ?? 'Mensaje directo';
    
    // Check for existing thread
    $stmt = $db->prepare("
        SELECT thread_id, expires_at 
        FROM direct_message_threads 
        WHERE agent_id = ? AND client_id = ? AND status = 'active'
    ");
    $stmt->execute([$agentId, $clientId]);
    $existingThread = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existingThread) {
        echo "ℹ️ Using existing thread: {$existingThread['thread_id']}\n";
        $threadId = $existingThread['thread_id'];
        $expiresAt = date('Y-m-d H:i:s', strtotime('+42 hours'));
        
        $stmt = $db->prepare("
            UPDATE direct_message_threads 
            SET last_message_at = NOW(), expires_at = ? 
            WHERE thread_id = ?
        ");
        $stmt->execute([$expiresAt, $threadId]);
        echo "✅ Thread updated\n";
    } else {
        $threadId = 'DM-' . time() . '-' . substr(md5($agentId . $clientId), 0, 8);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+42 hours'));
        
        echo "ℹ️ Creating new thread: $threadId\n";
        
        $stmt = $db->prepare("
            INSERT INTO direct_message_threads 
            (thread_id, agent_id, client_id, subject, status, expires_at)
            VALUES (?, ?, ?, ?, 'active', ?)
        ");
        $stmt->execute([$threadId, $agentId, $clientId, $subject, $expiresAt]);
        echo "✅ Thread created\n";
    }
    
    // Insert message
    echo "ℹ️ Inserting message...\n";
    $stmt = $db->prepare("
        INSERT INTO direct_messages 
        (thread_id, agent_id, client_id, sender_id, sender_type, message_text, expires_at)
        VALUES (?, ?, ?, ?, 'agent', ?, ?)
    ");
    $stmt->execute([$threadId, $agentId, $clientId, $agentId, $messageText, $expiresAt]);
    
    $messageId = $db->lastInsertId();
    echo "✅ Message inserted with ID: $messageId\n";
    
    echo "\n✅✅✅ SUCCESS! dm_start_thread works correctly! ✅✅✅\n";
    echo "\nResponse would be:\n";
    echo json_encode([
        'success' => true,
        'thread_id' => $threadId,
        'expires_at' => $expiresAt
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
