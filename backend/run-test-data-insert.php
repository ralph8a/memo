<?php
/**
 * One-time script to insert test data into the database
 * Run this once via browser: https://ksinsurancee.com/backend/run-test-data-insert.php
 * DELETE THIS FILE after running for security
 */

require_once 'config.php';
require_once 'database.php';

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html><html><head><title>Insert Test Data</title>";
echo "<style>body{font-family:monospace;padding:20px;background:#1e1e1e;color:#d4d4d4;}";
echo ".success{color:#4ec9b0;} .error{color:#f48771;} .info{color:#569cd6;}</style></head><body>";

echo "<h1>Krause Insurance - Insert Test Data</h1>";
echo "<p class='info'>Starting database insertion...</p>";

try {
    $db = getDB();
    
    // Read SQL file
    $sqlFile = __DIR__ . '/insert-test-data.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("SQL file not found: $sqlFile");
    }
    
    $sql = file_get_contents($sqlFile);
    
    // Split by semicolons and execute each statement
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            return !empty($stmt) && 
                   !preg_match('/^--/', $stmt) && 
                   !preg_match('/^\/\*/', $stmt);
        }
    );
    
    $success = 0;
    $errors = 0;
    
    echo "<ul>";
    
    foreach ($statements as $statement) {
        // Skip comments and empty lines
        $statement = trim($statement);
        if (empty($statement)) continue;
        
        try {
            // Extract first word for display
            preg_match('/^(\w+)/', $statement, $matches);
            $action = $matches[1] ?? 'QUERY';
            
            $db->exec($statement);
            $success++;
            echo "<li class='success'>✓ $action executed successfully</li>";
        } catch (PDOException $e) {
            // Some errors are OK (like duplicate key on INSERT ... ON DUPLICATE KEY)
            if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                echo "<li class='info'>→ Skipped duplicate entry (already exists)</li>";
            } else {
                $errors++;
                echo "<li class='error'>✗ Error: " . htmlspecialchars($e->getMessage()) . "</li>";
            }
        }
    }
    
    echo "</ul>";
    
    echo "<h2>Summary</h2>";
    echo "<p class='success'>✓ Success: $success queries</p>";
    if ($errors > 0) {
        echo "<p class='error'>✗ Errors: $errors queries</p>";
    }
    
    // Verify data was inserted
    echo "<h2>Verification</h2>";
    
    // Check policies
    $stmt = $db->query("SELECT COUNT(*) as count FROM policies WHERE client_id = 9");
    $policies = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Policies for client ID 9: <strong>{$policies['count']}</strong></p>";
    
    // Check claims
    $stmt = $db->query("SELECT COUNT(*) as count FROM claims WHERE client_id = 9");
    $claims = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Claims for client ID 9: <strong>{$claims['count']}</strong></p>";
    
    // Check payments
    $stmt = $db->query("SELECT COUNT(*) as count FROM payments WHERE client_id = 9");
    $payments = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Payments for client ID 9: <strong>{$payments['count']}</strong></p>";
    
    // Check total users
    $stmt = $db->query("SELECT COUNT(*) as count FROM users WHERE user_type = 'client'");
    $clients = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Total clients in database: <strong>{$clients['count']}</strong></p>";
    
    echo "<hr>";
    echo "<p class='success' style='font-size:18px;'>✅ Test data insertion completed!</p>";
    echo "<p class='error' style='font-size:14px;'>⚠️ IMPORTANT: DELETE this file (run-test-data-insert.php) for security!</p>";
    
} catch (Exception $e) {
    echo "<p class='error'>Fatal Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

echo "</body></html>";
?>
