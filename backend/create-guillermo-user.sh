#!/bin/bash
# Script para crear usuario de prueba guillermo@demo.com

cd /home/nhs13h5k0x0j/public_html/backend

echo "🔐 Creando usuario de prueba: guillermo@demo.com"
echo ""

php << 'EOPHP'
<?php
require_once 'database.php';
require_once 'auth.php';

$db = getDB();

// Check if user exists
$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute(['guillermo@demo.com']);
$existing = $stmt->fetch();

if ($existing) {
    echo "⚠️  Usuario guillermo@demo.com ya existe (ID: " . $existing['id'] . ")\n";
    echo "Actualizando password a 'pass123'...\n";
    
    $passwordHash = Auth::hashPassword('pass123');
    $stmt = $db->prepare("UPDATE users SET password_hash = ?, status = 'active' WHERE email = ?");
    $stmt->execute([$passwordHash, 'guillermo@demo.com']);
    
    echo "✅ Password actualizado exitosamente\n";
} else {
    echo "📝 Creando nuevo usuario...\n";
    
    $passwordHash = Auth::hashPassword('pass123');
    
    $stmt = $db->prepare("
        INSERT INTO users (email, password_hash, first_name, last_name, user_type, phone, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $result = $stmt->execute([
        'guillermo@demo.com',
        $passwordHash,
        'Guillermo',
        'Demo',
        'client',
        '+1-555-0123',
        'active'
    ]);
    
    if ($result) {
        $userId = $db->lastInsertId();
        echo "✅ Usuario creado exitosamente!\n";
        echo "  - ID: $userId\n";
        echo "  - Email: guillermo@demo.com\n";
        echo "  - Password: pass123\n";
        echo "  - Tipo: client\n";
        echo "  - Estado: active\n";
    } else {
        echo "❌ Error al crear usuario\n";
    }
}

echo "\n";
echo "=== Verificando creación ===\n";

$stmt = $db->prepare("SELECT id, email, first_name, last_name, user_type, status, created_at FROM users WHERE email = ?");
$stmt->execute(['guillermo@demo.com']);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo "✅ Usuario verificado:\n";
    echo "  - ID: " . $user['id'] . "\n";
    echo "  - Nombre: " . $user['first_name'] . " " . $user['last_name'] . "\n";
    echo "  - Email: " . $user['email'] . "\n";
    echo "  - Tipo: " . $user['user_type'] . "\n";
    echo "  - Estado: " . $user['status'] . "\n";
    echo "  - Creado: " . $user['created_at'] . "\n";
    
    // Test authentication
    echo "\n=== Test de autenticación ===\n";
    $token = Auth::generateToken($user['id'], $user['user_type'], $user['email']);
    echo "Token JWT: " . substr($token, 0, 50) . "...\n";
    
    $verified = Auth::verifyToken($token);
    if ($verified) {
        echo "✅ Token válido y funcionando\n";
    } else {
        echo "❌ Error verificando token\n";
    }
}

EOPHP
