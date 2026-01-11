<?php
// JWT Authentication Helper
require_once 'config.php';

class Auth {
    
    // Generate JWT Token
    public static function generateToken($userId, $userType, $email) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'user_id' => $userId,
            'user_type' => $userType,
            'email' => $email,
            'iat' => time(),
            'exp' => time() + JWT_EXPIRATION
        ]);
        
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
        $base64UrlSignature = self::base64UrlEncode($signature);
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }
    
    // Verify JWT Token
    public static function verifyToken($token) {
        if (!$token) {
            return false;
        }
        
        $tokenParts = explode('.', $token);
        if (count($tokenParts) !== 3) {
            return false;
        }
        
        list($header, $payload, $signature) = $tokenParts;
        
        // Verify signature
        $signatureCheck = self::base64UrlEncode(
            hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true)
        );
        
        if ($signature !== $signatureCheck) {
            return false;
        }
        
        // Decode payload
        $payloadData = json_decode(self::base64UrlDecode($payload), true);
        
        // Check expiration
        if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
            return false;
        }
        
        return $payloadData;
    }
    
    // Get token from request headers
    public static function getTokenFromRequest() {
        $headers = getallheaders();
        
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                return $matches[1];
            }
        }
        
        return null;
    }
    
    // Require authentication
    public static function requireAuth() {
        $token = self::getTokenFromRequest();
        $user = self::verifyToken($token);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
        
        return $user;
    }
    
    // Require specific user type
    public static function requireUserType($allowedTypes) {
        $user = self::requireAuth();
        
        if (!in_array($user['user_type'], (array)$allowedTypes)) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            exit;
        }
        
        return $user;
    }
    
    // Hash password
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT);
    }
    
    // Verify password
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    // Base64 URL Encode
    private static function base64UrlEncode($text) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($text));
    }
    
    // Base64 URL Decode
    private static function base64UrlDecode($text) {
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $text));
    }
}
?>
