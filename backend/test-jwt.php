<?php
/**
 * Test JWT Verification
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';
require_once 'auth.php';

$debug = [
    'step' => 1,
    'message' => 'Starting test',
    'jwt_secret' => defined('JWT_SECRET') ? 'Defined (' . strlen(JWT_SECRET) . ' chars)' : 'NOT DEFINED',
    'jwt_expiration' => defined('JWT_EXPIRATION') ? JWT_EXPIRATION : 'NOT DEFINED'
];

// Get token from request
$token = Auth::getTokenFromRequest();
$debug['step'] = 2;
$debug['token_received'] = $token ? substr($token, 0, 50) . '...' : 'NO TOKEN';

if ($token) {
    $debug['step'] = 3;
    
    // Try to verify
    $result = Auth::verifyToken($token);
    $debug['verification_result'] = $result;
    
    if ($result === false) {
        $debug['error'] = 'Verification failed - token invalid or expired';
        
        // Try to decode manually
        $parts = explode('.', $token);
        if (count($parts) === 3) {
            list($header, $payload, $signature) = $parts;
            
            $payloadData = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
            $debug['decoded_payload'] = $payloadData;
            
            if (isset($payloadData['exp'])) {
                $now = time();
                $debug['token_expiration'] = date('Y-m-d H:i:s', $payloadData['exp']);
                $debug['current_time'] = date('Y-m-d H:i:s', $now);
                $debug['is_expired'] = $payloadData['exp'] < $now;
                $debug['time_diff'] = $payloadData['exp'] - $now . ' seconds';
            }
        }
    } else {
        $debug['step'] = 4;
        $debug['success'] = true;
        $debug['user_data'] = $result;
    }
}

echo json_encode($debug, JSON_PRETTY_PRINT);
?>
