<?php
require_once 'config.php';
require_once 'database.php';
require_once 'auth.php';

$db = getDB();

echo "=== TESTING CLIENT ENDPOINTS ===\n\n";

// Test user_policies
echo "1. Testing ?action=user_policies\n";
echo "-----------------------------------\n";
$token = Auth::generateToken(35, 'client', 'maria.garcia@example.com');
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;
$_GET['action'] = 'user_policies';

try {
    $user = Auth::requireAuth();
    echo "✅ Auth OK - User ID: {$user['user_id']}\n";
    
    $stmt = $db->prepare("
        SELECT id, policy_number, policy_type, status, 
               start_date, end_date, premium_amount,
               coverage_amount, renewal_date
        FROM policies 
        WHERE client_id = ?
        ORDER BY start_date DESC
    ");
    $stmt->execute([$user['user_id']]);
    $policies = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found " . count($policies) . " policies\n";
    echo json_encode($policies, JSON_PRETTY_PRINT) . "\n\n";
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n\n";
}

// Test payment_history
echo "2. Testing ?action=payment_history\n";
echo "-----------------------------------\n";
$_GET['action'] = 'payment_history';

try {
    $user = Auth::requireAuth();
    echo "✅ Auth OK - User ID: {$user['user_id']}\n";
    
    $stmt = $db->prepare("
        SELECT ph.id, ph.policy_id, ph.amount, ph.payment_date, 
               ph.status, ph.payment_method, ph.receipt_path,
               p.policy_number, p.policy_type
        FROM payment_history ph
        LEFT JOIN policies p ON ph.policy_id = p.id
        WHERE ph.client_id = ?
        ORDER BY ph.payment_date DESC
        LIMIT 20
    ");
    $stmt->execute([$user['user_id']]);
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found " . count($payments) . " payments\n";
    echo json_encode($payments, JSON_PRETTY_PRINT) . "\n\n";
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n\n";
}

// Test recent_documents
echo "3. Testing ?action=recent_documents\n";
echo "-----------------------------------\n";
$_GET['action'] = 'recent_documents';

try {
    $user = Auth::requireAuth();
    echo "✅ Auth OK - User ID: {$user['user_id']}\n";
    
    $stmt = $db->prepare("
        SELECT id, file_name, file_type, file_size, 
               upload_date, document_type, description
        FROM documents
        WHERE client_id = ?
        ORDER BY upload_date DESC
        LIMIT 10
    ");
    $stmt->execute([$user['user_id']]);
    $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found " . count($documents) . " documents\n";
    echo json_encode($documents, JSON_PRETTY_PRINT) . "\n\n";
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n\n";
}

echo "=== TESTING COMPLETE ===\n";
