<?php
// Simple login test without dependencies
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';

$result = [
    'step' => 1,
    'config_loaded' => false,
    'db_connected' => false,
    'user_found' => false,
    'password_verified' => false,
    'jwt_available' => false,
    'error' => null
];

try {
    $result['config_loaded'] = true;
    $result['step'] = 2;
    
    // Test DB connection
    require_once 'database.php';
    $db = getDB();
    $result['db_connected'] = true;
    $result['step'] = 3;
    
    // Get POST data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true) ?? [];
    
    $email = $data['email'] ?? 'admin@ksinsurancee.com';
    $password = $data['password'] ?? 'Admin123!';
    
    $result['test_email'] = $email;
    $result['step'] = 4;
    
    // Find user
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ? AND status = 'active'");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user) {
        $result['user_found'] = true;
        $result['user_id'] = $user['id'];
        $result['user_type'] = $user['user_type'];
        $result['step'] = 5;
        
        // Check password
        if (password_verify($password, $user['password_hash'])) {
            $result['password_verified'] = true;
            $result['step'] = 6;
            
            // Check if JWT library is available
            if (file_exists(__DIR__ . '/vendor/autoload.php')) {
                require_once __DIR__ . '/vendor/autoload.php';
                $result['jwt_available'] = true;
                $result['jwt_source'] = 'vendor';
            } elseif (class_exists('\\Firebase\\JWT\\JWT')) {
                $result['jwt_available'] = true;
                $result['jwt_source'] = 'global';
            } else {
                $result['jwt_available'] = false;
                $result['jwt_error'] = 'Firebase JWT library not found';
            }
            
            $result['step'] = 7;
            $result['success'] = true;
            
        } else {
            $result['password_error'] = 'Password does not match';
        }
    } else {
        $result['user_error'] = 'User not found or inactive';
    }
    
} catch (Exception $e) {
    $result['error'] = $e->getMessage();
    $result['error_trace'] = $e->getTraceAsString();
}

echo json_encode($result, JSON_PRETTY_PRINT);
