<?php
require_once 'config.php';
require_once 'database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    echo "🔍 Buscando usuario guillermo@demo.com...\n\n";
    
    $stmt = $db->prepare("SELECT id, email, user_type, status, created_at FROM users WHERE email = ?");
    $stmt->execute(['guillermo@demo.com']);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "✅ Usuario encontrado:\n";
        echo "   ID: {$user['id']}\n";
        echo "   Email: {$user['email']}\n";
        echo "   Tipo: {$user['user_type']}\n";
        echo "   Estado: {$user['status']}\n";
        echo "   Creado: {$user['created_at']}\n\n";
        
        // Verificar password
        $stmt = $db->prepare("SELECT password_hash FROM users WHERE email = ?");
        $stmt->execute(['guillermo@demo.com']);
        $passData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "📝 Verificando password 'pass123'...\n";
        if (password_verify('pass123', $passData['password_hash'])) {
            echo "✅ Password correcto\n\n";
        } else {
            echo "❌ Password incorrecto\n";
            echo "   Hash actual: {$passData['password_hash']}\n\n";
            
            // Crear nuevo password
            echo "🔧 Creando nuevo hash para 'pass123'...\n";
            $newHash = password_hash('pass123', PASSWORD_DEFAULT);
            
            $stmt = $db->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
            $stmt->execute([$newHash, 'guillermo@demo.com']);
            echo "✅ Password actualizado\n\n";
        }
        
    } else {
        echo "❌ Usuario NO encontrado\n\n";
        echo "📋 Usuarios existentes:\n";
        
        $stmt = $db->query("SELECT id, email, user_type FROM users LIMIT 10");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($users as $u) {
            echo "   - {$u['email']} ({$u['user_type']})\n";
        }
        
        echo "\n🔧 Creando usuario guillermo@demo.com...\n";
        
        $passwordHash = password_hash('pass123', PASSWORD_DEFAULT);
        
        $stmt = $db->prepare("
            INSERT INTO users (email, password_hash, user_type, first_name, last_name, status)
            VALUES (?, ?, 'client', 'Guillermo', 'Krause', 'active')
        ");
        $stmt->execute(['guillermo@demo.com', $passwordHash]);
        
        echo "✅ Usuario creado con ID: " . $db->lastInsertId() . "\n";
        echo "   Email: guillermo@demo.com\n";
        echo "   Password: pass123\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
