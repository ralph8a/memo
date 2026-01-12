<?php
/**
 * Database Diagnostic Script
 * Upload this to backend/diagnostic.php to test database connection
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$diagnostics = [
    'php_version' => phpversion(),
    'pdo_available' => extension_loaded('pdo'),
    'pdo_mysql_available' => extension_loaded('pdo_mysql'),
    'config_loaded' => false,
    'db_connection' => false,
    'db_name' => '',
    'db_user' => '',
    'tables_exist' => [],
    'error' => null
];

try {
    // Try to load config
    if (file_exists(__DIR__ . '/config.php')) {
        require_once __DIR__ . '/config.php';
        $diagnostics['config_loaded'] = true;
        $diagnostics['db_name'] = DB_NAME;
        $diagnostics['db_user'] = DB_USER;
        $diagnostics['db_host'] = DB_HOST;
    } else {
        $diagnostics['error'] = 'config.php not found';
        echo json_encode($diagnostics, JSON_PRETTY_PRINT);
        exit;
    }
    
    // Try database connection
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        
        $diagnostics['db_connection'] = true;
        
        // Check if tables exist
        $tables = [
            'users', 'clients', 'agents', 'policies', 'coverages', 
            'beneficiaries', 'claims', 'payments', 'commissions',
            'quotes', 'documents', 'notifications', 'questionnaires',
            'renewals', 'activity_logs'
        ];
        
        foreach ($tables as $table) {
            $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
            $exists = $stmt->rowCount() > 0;
            $diagnostics['tables_exist'][$table] = $exists;
        }
        
        // Count users
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $diagnostics['user_count'] = $result['count'];
        
        // Test if admin exists
        $stmt = $pdo->prepare("SELECT email FROM users WHERE email = 'admin@ksinsurancee.com'");
        $stmt->execute();
        $diagnostics['admin_exists'] = $stmt->rowCount() > 0;
        
    } catch (PDOException $e) {
        $diagnostics['db_connection'] = false;
        $diagnostics['db_error'] = $e->getMessage();
        $diagnostics['db_error_code'] = $e->getCode();
    }
    
} catch (Exception $e) {
    $diagnostics['error'] = $e->getMessage();
}

echo json_encode($diagnostics, JSON_PRETTY_PRINT);
