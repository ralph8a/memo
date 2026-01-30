#!/bin/bash
# Script para resetear passwords de usuarios existentes

cd /home/nhs13h5k0x0j/public_html/backend

echo "🔐 Reseteando passwords para usuarios de prueba"
echo ""

php << 'EOPHP'
<?php
require_once 'database.php';
require_once 'auth.php';

$db = getDB();

// Resetear password para María Elena (cliente)
$email1 = 'maria.garcia@example.com';
$password1 = 'demo123';
$passwordHash1 = Auth::hashPassword($password1);

$stmt = $db->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
$result1 = $stmt->execute([$passwordHash1, $email1]);

if ($result1) {
    echo "✅ Password actualizado para María Elena García\n";
    echo "   📧 Email: maria.garcia@example.com\n";
    echo "   🔑 Password: demo123\n";
    echo "   👤 Tipo: client\n";
    
    // Generar token de prueba
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email1]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        $token = Auth::generateToken($user['id'], $user['user_type'], $user['email']);
        echo "   🎟️  Token JWT: " . substr($token, 0, 50) . "...\n";
        
        // Verify token works
        $verified = Auth::verifyToken($token);
        if ($verified) {
            echo "   ✅ Token verificado correctamente\n";
        }
    }
}

echo "\n";

// Resetear password para Guillermo Krause (agente)
$email2 = 'guillermo.krause@ksinsurancee.com';
$password2 = 'agent123';
$passwordHash2 = Auth::hashPassword($password2);

$stmt = $db->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
$result2 = $stmt->execute([$passwordHash2, $email2]);

if ($result2) {
    echo "✅ Password actualizado para Guillermo Krause\n";
    echo "   📧 Email: guillermo.krause@ksinsurancee.com\n";
    echo "   🔑 Password: agent123\n";
    echo "   👤 Tipo: agent\n";
    
    // Generar token de prueba
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email2]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        $token = Auth::generateToken($user['id'], $user['user_type'], $user['email']);
        echo "   🎟️  Token JWT: " . substr($token, 0, 50) . "...\n";
        
        // Verify token works
        $verified = Auth::verifyToken($token);
        if ($verified) {
            echo "   ✅ Token verificado correctamente\n";
        }
    }
}

echo "\n";
echo "════════════════════════════════════════════════════\n";
echo "📋 CREDENCIALES DE ACCESO\n";
echo "════════════════════════════════════════════════════\n";
echo "\n";
echo "👥 CLIENTE:\n";
echo "   Email: maria.garcia@example.com\n";
echo "   Password: demo123\n";
echo "\n";
echo "🔧 AGENTE:\n";
echo "   Email: guillermo.krause@ksinsurancee.com\n";
echo "   Password: agent123\n";
echo "\n";
echo "🌐 URL: https://ksinsurancee.com\n";
echo "════════════════════════════════════════════════════\n";

EOPHP
