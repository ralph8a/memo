<?php
// Simple test to check if backend is working
header('Content-Type: application/json');

echo json_encode([
    'status' => 'working',
    'message' => 'Backend is accessible',
    'php_version' => phpversion(),
    'time' => date('Y-m-d H:i:s')
]);
