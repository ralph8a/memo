<?php
/**
 * Test Script para Dashboard Endpoint
 * Prueba directa con logging detallado
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "═══════════════════════════════════════════════════════\n";
echo "  TEST: DASHBOARD ENDPOINT CON AUTENTICACIÓN JWT\n";
echo "═══════════════════════════════════════════════════════\n\n";

// Paso 1: Login para obtener token
echo "PASO 1: LOGIN\n";
echo "─────────────────────────────────────────────────────────\n";

$loginUrl = 'http://localhost/backend/index.php?action=login';
$loginData = [
    'email' => 'guillermo@krause.com',
    'password' => 'Krause2024#'
];

echo "POST → $loginUrl\n";
echo "Body: " . json_encode($loginData, JSON_PRETTY_PRINT) . "\n\n";

$ch = curl_init($loginUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$loginResponse = curl_exec($ch);
$loginHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Response Code: $loginHttpCode\n";
echo "Response Body:\n";
print_r(json_decode($loginResponse, true));
echo "\n";

$loginResult = json_decode($loginResponse, true);

if (!isset($loginResult['token'])) {
    die("❌ ERROR: No se obtuvo token del login\n");
}

$token = $loginResult['token'];
echo "✅ Token obtenido: " . substr($token, 0, 30) . "...\n\n";

// Paso 2: Verificar token localmente
echo "PASO 2: VERIFICAR TOKEN LOCALMENTE\n";
echo "─────────────────────────────────────────────────────────\n";

require_once 'config.php';
require_once 'auth.php';

$tokenParts = explode('.', $token);
echo "Token parts: " . count($tokenParts) . "\n";

if (count($tokenParts) === 3) {
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1])), true);
    echo "Payload decoded:\n";
    print_r($payload);
    echo "\n";
    
    echo "Expiration: " . date('Y-m-d H:i:s', $payload['exp']) . "\n";
    echo "Current time: " . date('Y-m-d H:i:s', time()) . "\n";
    echo "Is expired? " . ($payload['exp'] < time() ? 'YES ❌' : 'NO ✅') . "\n\n";
    
    $verifiedUser = Auth::verifyToken($token);
    echo "Token verification result: " . ($verifiedUser ? '✅ VALID' : '❌ INVALID') . "\n";
    if ($verifiedUser) {
        print_r($verifiedUser);
    }
    echo "\n";
}

// Paso 3: Test Dashboard Endpoint
echo "PASO 3: LLAMAR DASHBOARD ENDPOINT\n";
echo "─────────────────────────────────────────────────────────\n";

$dashboardUrl = 'http://localhost/backend/index.php?action=agent_dashboard';
echo "GET → $dashboardUrl\n";
echo "Authorization: Bearer " . substr($token, 0, 30) . "...\n\n";

$ch = curl_init($dashboardUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_VERBOSE, true);

$dashboardResponse = curl_exec($ch);
$dashboardHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

echo "Response Code: $dashboardHttpCode\n";
if ($curlError) {
    echo "CURL Error: $curlError\n";
}
echo "Response Body:\n";
echo $dashboardResponse;
echo "\n\n";

// Paso 4: Simular llamada directa al index.php
echo "PASO 4: SIMULAR LLAMADA DIRECTA (sin HTTP)\n";
echo "─────────────────────────────────────────────────────────\n";

$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['action'] = 'agent_dashboard';
$_SERVER['HTTP_AUTHORIZATION'] = "Bearer $token";

echo "Simulando HTTP_AUTHORIZATION: Bearer " . substr($token, 0, 30) . "...\n";
echo "GET action=agent_dashboard\n\n";

ob_start();
try {
    include 'index.php';
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
$directResponse = ob_get_clean();

echo "Direct Response:\n";
echo $directResponse;
echo "\n\n";

echo "═══════════════════════════════════════════════════════\n";
echo "  TEST COMPLETADO\n";
echo "═══════════════════════════════════════════════════════\n";
