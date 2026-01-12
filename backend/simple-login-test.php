<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo json_encode([
    'step' => 1,
    'message' => 'Starting login test',
    'config_exists' => file_exists(__DIR__ . '/config.php'),
    'auth_exists' => file_exists(__DIR__ . '/auth.php'),
    'db_exists' => file_exists(__DIR__ . '/database.php')
]);

require_once 'config.php';
echo json_encode(['step' => 2, 'message' => 'Config loaded']);

require_once 'database.php';
echo json_encode(['step' => 3, 'message' => 'Database loaded']);

require_once 'auth.php';
echo json_encode(['step' => 4, 'message' => 'Auth loaded']);

try {
    $db = Database::getInstance()->getConnection();
    echo json_encode(['step' => 5, 'message' => 'DB connected', 'pdo' => ($db !== null)]);
    
    // Test login directly
    $email = 'admin@ksinsurancee.com';
    $password = 'Admin123!';
    
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'step' => 6,
        'message' => 'User query executed',
        'user_found' => ($user !== false),
        'user_id' => $user['id'] ?? null,
        'user_type' => $user['user_type'] ?? null
    ]);
    
    if ($user && Auth::verifyPassword($password, $user['password_hash'])) {
        echo json_encode([
            'step' => 7,
            'message' => 'Password verified',
            'password_ok' => true
        ]);
        
        // Try to generate token
        $token = Auth::generateToken($user['id'], $user['user_type'], $user['email']);
        echo json_encode([
            'step' => 8,
            'message' => 'Token generated',
            'token_length' => strlen($token),
            'token_preview' => substr($token, 0, 50) . '...'
        ]);
        
        echo json_encode([
            'step' => 9,
            'message' => 'SUCCESS',
            'final' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'user_type' => $user['user_type']
            ]
        ]);
    } else {
        echo json_encode([
            'step' => 7,
            'message' => 'Password FAILED',
            'password_ok' => false
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
