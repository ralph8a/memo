#!/bin/bash
# Script para listar usuarios existentes

cd /home/nhs13h5k0x0j/public_html/backend

echo "=== Usuarios existentes en la base de datos ==="
echo ""

mysql -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause << 'EOSQL'
SELECT 
    id, 
    email, 
    CONCAT(first_name, ' ', last_name) as nombre_completo,
    user_type as tipo,
    status,
    created_at
FROM users 
ORDER BY user_type, created_at;
EOSQL

echo ""
echo "=== Probando acceso con guillermo.krause@ksinsurancee.com ==="

php << 'EOPHP'
<?php
require_once 'database.php';
require_once 'auth.php';

$db = getDB();
$email = 'guillermo.krause@ksinsurancee.com';

$stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo "✅ Usuario encontrado:\n";
    echo "  - ID: " . $user['id'] . "\n";
    echo "  - Nombre: " . $user['first_name'] . " " . $user['last_name'] . "\n";
    echo "  - Email: " . $user['email'] . "\n";
    echo "  - Tipo: " . $user['user_type'] . "\n";
    echo "  - Estado: " . $user['status'] . "\n";
    
    // Test passwords comunes
    $testPasswords = ['password123', 'Password123', 'pass123', 'admin123', 'demo123'];
    
    echo "\n🔐 Probando passwords comunes:\n";
    foreach ($testPasswords as $testPass) {
        if (password_verify($testPass, $user['password_hash'])) {
            echo "  ✅ Password correcto: '$testPass'\n";
            
            // Generate token
            echo "\n🎟️  Generando token JWT...\n";
            $token = Auth::generateToken($user['id'], $user['user_type'], $user['email']);
            echo "Token: " . substr($token, 0, 60) . "...\n";
            
            // Verify token
            $verified = Auth::verifyToken($token);
            if ($verified) {
                echo "✅ Token verificado correctamente\n";
                echo "\nCredenciales para login:\n";
                echo "  Email: " . $user['email'] . "\n";
                echo "  Password: $testPass\n";
            }
            break;
        }
    }
} else {
    echo "❌ Usuario NO encontrado: $email\n";
}

echo "\n=== Verificando usuario Maria Elena ===\n";

$stmt = $db->prepare("SELECT * FROM users WHERE first_name LIKE '%maria%' OR first_name LIKE '%Maria%'");
$stmt->execute();
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

if ($users) {
    foreach ($users as $user) {
        echo "\n📧 " . $user['email'] . "\n";
        echo "   Nombre: " . $user['first_name'] . " " . $user['last_name'] . "\n";
        echo "   Tipo: " . $user['user_type'] . "\n";
        echo "   Estado: " . $user['status'] . "\n";
    }
}

EOPHP
