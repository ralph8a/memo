<?php
require_once 'config.php';
require_once 'database.php';

$db = getDB();

echo "=== FIXING direct_messages thread_id TYPE ===\n";

try {
    // First, check current type
    $stmt = $db->query("DESCRIBE direct_messages");
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $threadIdCol = array_filter($cols, fn($c) => $c['Field'] === 'thread_id');
    $currentType = reset($threadIdCol)['Type'];
    
    echo "Current thread_id type: $currentType\n";
    
    if ($currentType !== 'varchar(50)') {
        echo "Changing to VARCHAR(50)...\n";
        
        $db->exec("ALTER TABLE direct_messages MODIFY COLUMN thread_id VARCHAR(50) NOT NULL");
        
        echo "✅ Column type changed successfully!\n";
        
        // Verify
        $stmt = $db->query("DESCRIBE direct_messages");
        $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $threadIdCol = array_filter($cols, fn($c) => $c['Field'] === 'thread_id');
        $newType = reset($threadIdCol)['Type'];
        
        echo "New thread_id type: $newType\n";
    } else {
        echo "✅ Already VARCHAR(50)\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
