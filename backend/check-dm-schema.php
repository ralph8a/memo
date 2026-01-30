<?php
require_once 'config.php';
require_once 'database.php';

$db = getDB();

echo "=== CHECKING direct_message_threads SCHEMA ===\n";

try {
    $stmt = $db->query("DESCRIBE direct_message_threads");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Columns found:\n";
    foreach ($columns as $col) {
        echo "  - {$col['Field']} ({$col['Type']})\n";
    }
    
    echo "\n=== CHECKING direct_messages SCHEMA ===\n";
    $stmt = $db->query("DESCRIBE direct_messages");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Columns found:\n";
    foreach ($columns as $col) {
        echo "  - {$col['Field']} ({$col['Type']})\n";
    }
    
    echo "\n=== TESTING INSERT ===\n";
    
    // Test insert
    $threadId = 'TEST-' . time();
    $agentId = 2;
    $clientId = 35;
    $subject = 'Test';
    $expiresAt = date('Y-m-d H:i:s', strtotime('+42 hours'));
    
    echo "Attempting INSERT with:\n";
    echo "  thread_id: $threadId\n";
    echo "  agent_id: $agentId\n";
    echo "  client_id: $clientId\n";
    echo "  subject: $subject\n";
    echo "  expires_at: $expiresAt\n";
    
    $stmt = $db->prepare("
        INSERT INTO direct_message_threads 
        (thread_id, agent_id, client_id, subject, status, expires_at)
        VALUES (?, ?, ?, ?, 'active', ?)
    ");
    
    if ($stmt->execute([$threadId, $agentId, $clientId, $subject, $expiresAt])) {
        echo "✅ INSERT successful!\n";
        
        // Clean up test
        $db->exec("DELETE FROM direct_message_threads WHERE thread_id = '$threadId'");
        echo "✅ Test data cleaned up\n";
    } else {
        echo "❌ INSERT failed!\n";
        print_r($stmt->errorInfo());
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
