<?php
/**
 * Self-destructing cleanup script
 * Removes temporary/sensitive files from the server
 * This file will delete itself after execution
 */

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html><html><head><title>Cleanup</title>";
echo "<style>body{font-family:monospace;padding:20px;background:#1e1e1e;color:#d4d4d4;}";
echo ".success{color:#4ec9b0;} .error{color:#f48771;}</style></head><body>";

echo "<h1>🧹 Cleanup Temporary Files</h1>";

$filesToDelete = [
    'run-test-data-insert.php',
    'cleanup-temp-files.php' // Self-destruct
];

$deleted = [];
$errors = [];

foreach ($filesToDelete as $file) {
    $path = __DIR__ . '/' . $file;
    if (file_exists($path)) {
        if (unlink($path)) {
            $deleted[] = $file;
            echo "<p class='success'>✓ Deleted: $file</p>";
        } else {
            $errors[] = $file;
            echo "<p class='error'>✗ Failed to delete: $file</p>";
        }
    } else {
        echo "<p>ℹ File not found: $file</p>";
    }
}

echo "<hr>";
if (count($deleted) > 0) {
    echo "<p class='success'>✅ Successfully deleted " . count($deleted) . " file(s)</p>";
}
if (count($errors) > 0) {
    echo "<p class='error'>⚠️ Failed to delete " . count($errors) . " file(s)</p>";
}

echo "<p>This page will self-destruct in 3 seconds...</p>";
echo "<script>setTimeout(() => window.close(), 3000);</script>";
echo "</body></html>";
?>
