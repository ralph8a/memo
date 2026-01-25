<?php
/**
 * Test Local Simple - Verificar Auth y Token
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config.php';
require_once 'auth.php';

echo "══════════════════════════════════════════\n";
echo "  TEST LOCAL: AUTH Y TOKEN\n";
echo "══════════════════════════════════════════\n\n";

// Test 1: Generar token
echo "TEST 1: Generar Token\n";
echo "──────────────────────────────────────────\n";
$token = Auth::generateToken(1, 'agent', 'guillermo@krause.com');
echo "Token generado: " . substr($token, 0, 50) . "...\n";
echo "Longitud: " . strlen($token) . " caracteres\n\n";

// Test 2: Decodificar token
echo "TEST 2: Decodificar Token\n";
echo "──────────────────────────────────────────\n";
$parts = explode('.', $token);
echo "Partes del token: " . count($parts) . "\n";

$payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
echo "Payload:\n";
print_r($payload);
echo "\n";

// Test 3: Verificar token
echo "TEST 3: Verificar Token\n";
echo "──────────────────────────────────────────\n";
$verified = Auth::verifyToken($token);
echo "Resultado: " . ($verified ? "✅ VÁLIDO" : "❌ INVÁLIDO") . "\n";
if ($verified) {
    print_r($verified);
}
echo "\n";

// Test 4: Simular header Authorization
echo "TEST 4: Simular HTTP Authorization Header\n";
echo "──────────────────────────────────────────\n";
$_SERVER['HTTP_AUTHORIZATION'] = "Bearer $token";
echo "HTTP_AUTHORIZATION seteado\n";

$extractedToken = Auth::getTokenFromRequest();
echo "Token extraído: " . ($extractedToken ? substr($extractedToken, 0, 50) . "..." : "NULL") . "\n";
echo "¿Coincide? " . ($extractedToken === $token ? "✅ SÍ" : "❌ NO") . "\n\n";

// Test 5: Verificar token extraído
echo "TEST 5: Verificar Token Extraído\n";
echo "──────────────────────────────────────────\n";
$verifiedExtracted = Auth::verifyToken($extractedToken);
echo "Resultado: " . ($verifiedExtracted ? "✅ VÁLIDO" : "❌ INVÁLIDO") . "\n";
if ($verifiedExtracted) {
    print_r($verifiedExtracted);
}
echo "\n";

echo "══════════════════════════════════════════\n";
echo "  TESTS COMPLETADOS\n";
echo "══════════════════════════════════════════\n";
