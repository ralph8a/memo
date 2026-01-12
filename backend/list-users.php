<?php
header('Content-Type: application/json');
require_once 'config.php';
require_once 'database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->query("SELECT id, CONCAT(first_name, ' ', last_name) as name, email, user_type FROM users ORDER BY id");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'total_users' => count($users),
        'users' => $users
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
}
?>
