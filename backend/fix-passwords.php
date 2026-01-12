<?php
/**
 * Auto-fix passwords for all test users
 * Run this once: http://ksinsurancee.com/backend/fix-passwords.php
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';
require_once 'database.php';

$result = [
    'success' => false,
    'message' => '',
    'updated_count' => 0
];

try {
    $db = getDB();
    
    // New correct hash for "Admin123!"
    $correctHash = '$2y$10$YD6gW7w4hRCx7QeRrE1R0uHbuXjoxGaG.w2aTYLeemWtUsJyIohBS';
    
    $emails = [
        'admin@ksinsurancee.com',
        'guillermo.krause@ksinsurancee.com',
        'agent.one@ksinsurancee.com',
        'client.test@example.com',
        'maria.garcia@example.com',
        'juan.martinez@example.com',
        'ana.lopez@example.com',
        'carlos.rodriguez@example.com',
        'laura.hernandez@example.com',
        'sofia.torres@ksinsurancee.com',
        'ricardo.gomez@ksinsurancee.com'
    ];
    
    $placeholders = implode(',', array_fill(0, count($emails), '?'));
    
    $sql = "UPDATE users SET password_hash = ? WHERE email IN ($placeholders)";
    $stmt = $db->prepare($sql);
    
    $params = array_merge([$correctHash], $emails);
    $stmt->execute($params);
    
    $result['updated_count'] = $stmt->rowCount();
    $result['success'] = true;
    $result['message'] = "✅ Updated {$result['updated_count']} user passwords";
    
    // Verify
    $stmt = $db->query("SELECT email, user_type FROM users ORDER BY user_type, email");
    $result['users'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
} catch (Exception $e) {
    $result['error'] = $e->getMessage();
    $result['message'] = '❌ Error: ' . $e->getMessage();
}

echo json_encode($result, JSON_PRETTY_PRINT);
