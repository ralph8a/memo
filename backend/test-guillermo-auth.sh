#!/bin/bash
# Script para verificar usuario guillermo@demo.com

cd /home/nhs13h5k0x0j/public_html/backend

echo "=== Verificando usuario guillermo@demo.com ==="
mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause << 'EOSQL'
SELECT id, email, user_type, status, created_at, last_login 
FROM users 
WHERE email = 'guillermo@demo.com';
EOSQL

echo ""
echo "=== Probando login con guillermo@demo.com ==="
echo "Email: guillermo@demo.com"
echo "Password: pass123"
echo ""
echo "Test de autenticación:"

php << 'EOPHP'
<?php
require_once 'database.php';
require_once 'auth.php';

$db = getDB();
$email = 'guillermo@demo.com';

$stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo "✅ Usuario encontrado:\n";
    echo "  - ID: " . $user['id'] . "\n";
    echo "  - Email: " . $user['email'] . "\n";
    echo "  - Tipo: " . $user['user_type'] . "\n";
    echo "  - Estado: " . $user['status'] . "\n";
    echo "  - Password hash existe: " . (isset($user['password_hash']) ? 'Sí' : 'No') . "\n";
    
    // Test password
    if (isset($user['password_hash'])) {
        $testPassword = 'pass123';
        $validPassword = password_verify($testPassword, $user['password_hash']);
        echo "  - Password 'pass123' válido: " . ($validPassword ? '✅ Sí' : '❌ No') . "\n";
    }
    
    // Generate test token
    echo "\n🔐 Generando token JWT de prueba...\n";
    $token = Auth::generateToken($user['id'], $user['user_type'], $user['email']);
    echo "Token generado: " . substr($token, 0, 50) . "...\n";
    
    // Verify token
    echo "\n🔍 Verificando token...\n";
    $verified = Auth::verifyToken($token);
    if ($verified) {
        echo "✅ Token verificado exitosamente\n";
        echo "  - User ID: " . $verified['user_id'] . "\n";
        echo "  - User Type: " . $verified['user_type'] . "\n";
        echo "  - Email: " . $verified['email'] . "\n";
    } else {
        echo "❌ Token verification failed\n";
    }
    
} else {
    echo "❌ Usuario NO encontrado con email: $email\n";
}
EOPHP
