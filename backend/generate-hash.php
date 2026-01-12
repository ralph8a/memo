<?php
/**
 * Generate Password Hash for Admin123!
 */

$password = 'Admin123!';
$hash = password_hash($password, PASSWORD_DEFAULT);

echo "Password: $password\n";
echo "Hash: $hash\n";
echo "\nSQL to update admin user:\n";
echo "UPDATE users SET password_hash = '$hash' WHERE email = 'admin@ksinsurancee.com';\n";
echo "\nSQL to update all test users:\n";
echo "UPDATE users SET password_hash = '$hash' WHERE email LIKE '%@ksinsurancee.com' OR email LIKE '%@example.com';\n";
