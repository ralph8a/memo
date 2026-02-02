<?php
/**
 * Script to verify database tables exist
 */

require_once 'config.php';
require_once 'database.php';

header('Content-Type: application/json');

try {
    $db = getDB();
    
    // Get all tables in database
    $stmt = $db->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo json_encode([
        'status' => 'success',
        'database' => DB_NAME,
        'tables' => $tables,
        'table_count' => count($tables),
        'expected_tables' => [
            'users',
            'policies', 
            'claims',
            'payments',
            'documents',
            'questionnaires',
            'notifications',
            'sessions'
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
