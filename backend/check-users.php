<?php
/**
 * MySQL User Checker
 * Lists MySQL users visible from this connection
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$info = [
    'php_version' => phpversion(),
    'testing_different_credentials' => []
];

// Try different common usernames
$possible_users = [
    'nhs13h5k_krauser',
    'nhs13h5k_admin', 
    'nhs13h5k_root',
    'nhs13h5k_krause', // sometimes username matches db name
    'root'
];

$password = 'Inspiron1999#';
$db_name = 'nhs13h5k_krause';

foreach ($possible_users as $user) {
    $result = [
        'user' => $user,
        'connected' => false,
        'error' => null
    ];
    
    try {
        $dsn = "mysql:host=localhost;dbname=$db_name;charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        
        $result['connected'] = true;
        $result['message'] = "✅ SUCCESS! Use this user in config.php";
        
        // Get table count
        $stmt = $pdo->query("SHOW TABLES");
        $result['table_count'] = $stmt->rowCount();
        
    } catch (PDOException $e) {
        $result['error'] = $e->getMessage();
        $result['error_code'] = $e->getCode();
    }
    
    $info['testing_different_credentials'][] = $result;
}

// Also try to list MySQL users (if we have permission)
try {
    $pdo = new PDO("mysql:host=localhost", 'root', $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    
    $stmt = $pdo->query("SELECT user, host FROM mysql.user WHERE user LIKE 'nhs13h5k%'");
    $info['mysql_users_found'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    $info['mysql_user_listing'] = 'No permission to list users';
}

echo json_encode($info, JSON_PRETTY_PRINT);
