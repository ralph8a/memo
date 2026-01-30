<?php
require_once 'config.php';
require_once 'database.php';

$db = getDB();

echo "=== CHECKING DATABASE SCHEMA ===\n\n";

// List all tables
echo "Tables in database:\n";
echo "-----------------------------------\n";
$tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
foreach ($tables as $table) {
    echo "  - $table\n";
}
echo "\n";

// Check payment-related tables
echo "Payment-related tables structure:\n";
echo "-----------------------------------\n";
$paymentTables = array_filter($tables, function($t) {
    return stripos($t, 'payment') !== false;
});

foreach ($paymentTables as $table) {
    echo "\n$table:\n";
    $columns = $db->query("DESCRIBE $table")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $col) {
        echo "  - {$col['Field']} ({$col['Type']})\n";
    }
}

// Check documents table
echo "\n\ndocuments table:\n";
echo "-----------------------------------\n";
if (in_array('documents', $tables)) {
    $columns = $db->query("DESCRIBE documents")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $col) {
        echo "  - {$col['Field']} ({$col['Type']})\n";
    }
} else {
    echo "❌ Table 'documents' does not exist\n";
}
