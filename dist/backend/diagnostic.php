<?php
/**
 * Database Diagnostic Script
 * Run this to verify database connection and tables
 */

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/plain');

echo "=== KRAUSE INSURANCE DATABASE DIAGNOSTIC ===\n\n";

// Check if config exists
if (!file_exists('config.php')) {
    die("ERROR: config.php not found\n");
}

require_once 'config.php';

echo "1. Configuration Check:\n";
echo "   DB_HOST: " . DB_HOST . "\n";
echo "   DB_NAME: " . DB_NAME . "\n";
echo "   DB_USER: " . DB_USER . "\n";
echo "   DB_PASS: " . (DB_PASS ? '[SET]' : '[NOT SET]') . "\n\n";

// Try to connect
echo "2. Testing Database Connection:\n";
try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    echo "   ✅ Connection successful!\n\n";
} catch (PDOException $e) {
    die("   ❌ Connection failed: " . $e->getMessage() . "\n");
}

// List all tables
echo "3. Available Tables:\n";
try {
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($tables)) {
        echo "   ⚠️  No tables found in database!\n\n";
    } else {
        foreach ($tables as $table) {
            echo "   ✓ $table\n";
        }
        echo "\n   Total tables: " . count($tables) . "\n\n";
    }
} catch (PDOException $e) {
    echo "   ❌ Error listing tables: " . $e->getMessage() . "\n\n";
}

// Check required tables
echo "4. Required Tables Check:\n";
$requiredTables = ['users', 'policies', 'claims', 'payments', 'documents'];
$missingTables = [];

foreach ($requiredTables as $table) {
    if (in_array($table, $tables)) {
        // Count rows
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM `$table`");
            $count = $stmt->fetch()['count'];
            echo "   ✓ $table ($count rows)\n";
        } catch (PDOException $e) {
            echo "   ⚠️  $table (error counting: {$e->getMessage()})\n";
        }
    } else {
        $missingTables[] = $table;
        echo "   ❌ $table (MISSING)\n";
    }
}
echo "\n";

// Summary
echo "5. Summary:\n";
if (empty($missingTables)) {
    echo "   ✅ All required tables exist\n";
} else {
    echo "   ❌ Missing tables: " . implode(', ', $missingTables) . "\n";
    echo "   ⚠️  Run database-schema.sql to create missing tables\n";
}

// Test query
echo "\n6. Sample Query Test:\n";
try {
    $stmt = $pdo->query("SELECT id, email, user_type, first_name, last_name FROM users LIMIT 5");
    $users = $stmt->fetchAll();
    
    if (empty($users)) {
        echo "   ⚠️  No users found in database\n";
    } else {
        echo "   Found " . count($users) . " users:\n";
        foreach ($users as $user) {
            echo "   - {$user['first_name']} {$user['last_name']} ({$user['email']}) - {$user['user_type']}\n";
        }
    }
} catch (PDOException $e) {
    echo "   ❌ Query failed: " . $e->getMessage() . "\n";
}

echo "\n=== DIAGNOSTIC COMPLETE ===\n";
