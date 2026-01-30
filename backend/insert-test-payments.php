<?php
require_once 'config.php';
require_once 'database.php';

$db = getDB();

echo "=== INSERTING TEST PAYMENT DATA ===\n\n";

$clientId = 35; // María García
$policyId = 20; // AUTO-001-2026

// Insert payments
$testPayments = [
    ['2026-02-15', 1625.00, 'pending', 'Pago mensual febrero 2026'],
    ['2026-01-15', 1625.00, 'completed', 'Pago mensual enero 2026'],
    ['2025-12-15', 1625.00, 'completed', 'Pago mensual diciembre 2025'],
    ['2025-11-15', 1625.00, 'completed', 'Pago mensual noviembre 2025'],
    ['2025-10-15', 1625.00, 'completed', 'Pago mensual octubre 2025'],
];

$inserted = 0;
foreach ($testPayments as $payment) {
    [$date, $amount, $status, $notes] = $payment;
    
    $stmt = $db->prepare("
        INSERT INTO payments 
        (policy_id, client_id, amount, payment_method, status, payment_date, notes)
        VALUES (?, ?, ?, 'bank_transfer', ?, ?, ?)
    ");
    
    $stmt->execute([$policyId, $clientId, $amount, $status, $date, $notes]);
    $inserted++;
    
    echo "✅ Payment inserted: $date - \$$amount - $status\n";
}

echo "\n📊 Total: $inserted payments inserted\n\n";

// Verify
echo "Verifying payments:\n";
echo "-----------------------------------\n";
$stmt = $db->prepare("SELECT * FROM payments WHERE client_id = ? ORDER BY payment_date DESC");
$stmt->execute([$clientId]);
$payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Found " . count($payments) . " payments:\n";
foreach ($payments as $p) {
    echo "  - {$p['payment_date']}: \${$p['amount']} ({$p['status']})\n";
}

echo "\n✅ Done!\n";
