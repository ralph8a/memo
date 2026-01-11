<?php
// Database Configuration for GoDaddy cPanel
// Update these values with your cPanel MySQL credentials

define('DB_HOST', 'localhost'); // Usually 'localhost' in cPanel
define('DB_NAME', 'nhs13h5k_krause'); // Format: cPanel_username_dbname
define('DB_USER', 'nhs13h5k_krauser'); // Format: cPanel_username_dbuser
define('DB_PASS', 'Inspiron1999#'); // Set your MySQL password here
define('DB_CHARSET', 'utf8mb4');

// API Settings
define('API_SECRET_KEY', 'change-this-to-random-string-' . bin2hex(random_bytes(16)));
define('JWT_SECRET', 'change-this-jwt-secret-' . bin2hex(random_bytes(16)));
define('JWT_EXPIRATION', 86400); // 24 hours

// Email Settings (GoDaddy SMTP)
define('SMTP_HOST', 'localhost'); // or smtpout.secureserver.net for GoDaddy
define('SMTP_PORT', 587);
define('SMTP_USER', 'notifications@ksinsurancee.com'); // Create this email in cPanel
define('SMTP_PASS', 'Inspiron1999#'); // Email password
define('SMTP_FROM_EMAIL', 'notifications@ksinsurancee.com');
define('SMTP_FROM_NAME', 'Krause Insurance');

// File Upload Settings
define('UPLOAD_MAX_SIZE', 5 * 1024 * 1024); // 5MB
define('UPLOAD_ALLOWED_TYPES', ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']);
define('UPLOAD_DIR', __DIR__ . '/uploads/');

// Environment
define('ENVIRONMENT', 'production'); // or 'development'
define('DEBUG_MODE', false);

// CORS Settings
define('ALLOWED_ORIGINS', [
    'https://ksinsurancee.com',
    'http://ksinsurancee.com',
    'http://localhost:3000',
    'http://localhost:8080'
]);

// Timezone
date_default_timezone_set('America/New_York');

// Error Reporting
if (ENVIRONMENT === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/logs/php-errors.log');
}
?>
