<?php
/**
 * Execute meetings and payment receipts schema
 * IMPORTANT: Delete this file after execution
 */

require_once 'config.php';
require_once 'database.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Execute Schema - Krause Insurance</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 900px;
            margin: 40px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
        }
        .container {
            background: rgba(255,255,255,0.95);
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            color: #333;
        }
        h1 { color: #667eea; margin-top: 0; }
        h2 { color: #764ba2; border-bottom: 2px solid #764ba2; padding-bottom: 10px; }
        .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 10px 0; border-radius: 4px; }
        .error { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 10px 0; border-radius: 4px; }
        .info { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 10px 0; border-radius: 4px; }
        .query { background: #f8f9fa; border: 1px solid #dee2e6; padding: 12px; margin: 10px 0; border-radius: 4px; font-family: monospace; font-size: 12px; overflow-x: auto; }
        code { background: #e9ecef; padding: 2px 6px; border-radius: 3px; font-size: 13px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
<div class="container">
    <h1>📊 Execute Database Schema</h1>
    <p>Installing: <strong>Meetings</strong>, <strong>Payment Receipts</strong>, and <strong>Claim Comments</strong> tables</p>
    
    <?php
    try {
        $db = getDB();
        
        // Read SQL file
        $sqlFile = __DIR__ . '/meetings-schema.sql';
        if (!file_exists($sqlFile)) {
            throw new Exception("Schema file not found: $sqlFile");
        }
        
        $sql = file_get_contents($sqlFile);
        
        // Split into individual statements
        $statements = array_filter(
            array_map('trim', explode(';', $sql)),
            function($stmt) {
                return !empty($stmt) && !preg_match('/^\s*--/', $stmt);
            }
        );
        
        echo "<h2>Execution Results</h2>";
        
        $successCount = 0;
        $errorCount = 0;
        
        foreach ($statements as $index => $statement) {
            if (empty(trim($statement))) continue;
            
            try {
                $db->exec($statement);
                $successCount++;
                
                // Extract table name
                preg_match('/CREATE TABLE.*?`?(\w+)`?/i', $statement, $matches);
                $tableName = $matches[1] ?? 'Unknown';
                
                echo "<div class='success'>";
                echo "✅ <strong>Success:</strong> Created table <code>$tableName</code>";
                echo "</div>";
                
            } catch (PDOException $e) {
                $errorCount++;
                echo "<div class='error'>";
                echo "❌ <strong>Error:</strong> " . htmlspecialchars($e->getMessage());
                echo "<div class='query'>" . htmlspecialchars(substr($statement, 0, 200)) . "...</div>";
                echo "</div>";
            }
        }
        
        echo "<h2>Summary</h2>";
        echo "<div class='info'>";
        echo "📊 <strong>Total statements:</strong> " . count($statements) . "<br>";
        echo "✅ <strong>Successful:</strong> $successCount<br>";
        echo "❌ <strong>Errors:</strong> $errorCount";
        echo "</div>";
        
        // Verification
        echo "<h2>Verification</h2>";
        
        $tables = ['meetings', 'payment_receipts', 'claim_comments'];
        foreach ($tables as $table) {
            $stmt = $db->query("SHOW TABLES LIKE '$table'");
            $exists = $stmt->fetch();
            
            if ($exists) {
                $stmt = $db->query("SELECT COUNT(*) as count FROM $table");
                $count = $stmt->fetch()['count'];
                
                echo "<div class='success'>";
                echo "✅ Table <code>$table</code> exists with <strong>$count</strong> records";
                echo "</div>";
            } else {
                echo "<div class='error'>";
                echo "❌ Table <code>$table</code> does NOT exist";
                echo "</div>";
            }
        }
        
        echo "<div class='info' style='margin-top: 30px;'>";
        echo "<strong>⚠️ IMPORTANT:</strong> Delete this file (<code>run-schema-update.php</code>) after execution for security.";
        echo "</div>";
        
    } catch (Exception $e) {
        echo "<div class='error'>";
        echo "<strong>Fatal Error:</strong> " . htmlspecialchars($e->getMessage());
        echo "</div>";
    }
    ?>
    
    <div class="footer">
        <p><strong>Krause Insurance</strong> - Database Schema Installer<br>
        Protection Beyond The Limits</p>
    </div>
    
    <script>
        // Auto-close after 30 seconds
        setTimeout(() => {
            if (confirm('Schema execution completed. Close this window?')) {
                window.close();
            }
        }, 30000);
    </script>
</div>
</body>
</html>
