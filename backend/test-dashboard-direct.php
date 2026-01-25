<?php
// Test directo del dashboard endpoint
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/plain');

echo "=== TEST DIRECTO DE DASHBOARD ENDPOINT ===\n\n";

// Simular token válido
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMiIsInVzZXJfdHlwZSI6ImFnZW50IiwiZW1haWwiOiJndWlsbGVybW9Aa3JhdXNlci5jb20iLCJpYXQiOjE3MzY5MDAwMDAsImV4cCI6MTczNzUwNDgwMH0.test';

// Include files
require_once 'config.php';
require_once 'auth.php';

echo "1. Config loaded\n";
echo "   JWT_SECRET defined: " . (defined('JWT_SECRET') ? 'YES' : 'NO') . "\n\n";

echo "2. Testing getTokenFromRequest():\n";
$token = Auth::getTokenFromRequest();
echo "   Token found: " . ($token ? "YES - " . substr($token, 0, 40) . "..." : "NO") . "\n\n";

echo "3. Available headers:\n";
if (function_exists('getallheaders')) {
    $headers = getallheaders();
    foreach ($headers as $key => $value) {
        echo "   $key: $value\n";
    }
} else {
    echo "   getallheaders() not available\n";
    echo "   Checking \$_SERVER:\n";
    foreach ($_SERVER as $key => $value) {
        if (strpos($key, 'HTTP_') === 0 || $key === 'REDIRECT_HTTP_AUTHORIZATION') {
            echo "   $key: $value\n";
        }
    }
}

echo "\n4. Creating test token:\n";
$testToken = Auth::generateToken(2, 'agent', 'guillermo@krauser.com');
echo "   Generated token: " . substr($testToken, 0, 60) . "...\n\n";

echo "5. Verifying test token:\n";
$verified = Auth::verifyToken($testToken);
if ($verified) {
    echo "   ✅ Token verified successfully\n";
    echo "   User ID: " . $verified['user_id'] . "\n";
    echo "   User Type: " . $verified['user_type'] . "\n";
    echo "   Email: " . $verified['email'] . "\n";
} else {
    echo "   ❌ Token verification failed\n";
}

echo "\n6. Testing with actual Authorization header:\n";
$_SERVER['HTTP_AUTHORIZATION'] = "Bearer $testToken";
$receivedToken = Auth::getTokenFromRequest();
echo "   Token received: " . ($receivedToken ? "YES" : "NO") . "\n";
if ($receivedToken) {
    $verified2 = Auth::verifyToken($receivedToken);
    echo "   Verified: " . ($verified2 ? "YES" : "NO") . "\n";
}

echo "\n=== TEST COMPLETADO ===\n";
?>
