<?php
/**
 * Debug Auth Headers
 * Diagnóstico para verificar headers de autorización
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$debug = [
    'php_version' => phpversion(),
    'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
    'all_headers' => [],
    'server_vars' => [],
    'authorization_found' => false,
    'token' => null
];

// Try getallheaders()
if (function_exists('getallheaders')) {
    $debug['all_headers']['getallheaders'] = getallheaders();
}

// Try apache_request_headers()
if (function_exists('apache_request_headers')) {
    $debug['all_headers']['apache_request_headers'] = apache_request_headers();
}

// Check $_SERVER
$serverKeys = array_filter(array_keys($_SERVER), function($key) {
    return strpos($key, 'HTTP_') === 0 || strpos($key, 'AUTH') !== false;
});

foreach ($serverKeys as $key) {
    $debug['server_vars'][$key] = $_SERVER[$key];
}

// Try to get authorization token
if (function_exists('getallheaders')) {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        $debug['authorization_found'] = true;
        $debug['token'] = $headers['Authorization'];
    }
}

if (!$debug['authorization_found'] && isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $debug['authorization_found'] = true;
    $debug['token'] = $_SERVER['HTTP_AUTHORIZATION'];
}

if (!$debug['authorization_found'] && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $debug['authorization_found'] = true;
    $debug['token'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
}

echo json_encode($debug, JSON_PRETTY_PRINT);
?>
