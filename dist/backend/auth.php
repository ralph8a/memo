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
        error_log("verifyToken() called with token: " . ($token ? substr($token, 0, 30) . "..." : "NULL"));
        
        if (!$token) {
            error_log("verifyToken: Token is null/empty");
            return false;
        }
        
        $tokenParts = explode('.', $token);
        error_log("verifyToken: Token parts count: " . count($tokenParts));
        
        if (count($tokenParts) !== 3) {
            error_log("verifyToken: Invalid token structure (expected 3 parts, got " . count($tokenParts) . ")");
            return false;
        }
        
        list($header, $payload, $signature) = $tokenParts;
        
        // Verify signature
        $signatureCheck = self::base64UrlEncode(
            hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true)
        );
        
        error_log("verifyToken: Signature check - Expected: " . substr($signatureCheck, 0, 30) . "..., Got: " . substr($signature, 0, 30) . "...");
        
        if ($signature !== $signatureCheck) {
            error_log("verifyToken: Signature mismatch");
            return false;
        }
        
        // Decode payload
        $payloadData = json_decode(self::base64UrlDecode($payload), true);
        error_log("verifyToken: Decoded payload: " . json_encode($payloadData));
        
        // Check expiration
        if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
            error_log("verifyToken: Token expired. Exp: " . $payloadData['exp'] . ", Now: " . time());
            return false;
        }
        
        error_log("verifyToken: Token valid!");
        return $payloadData;
    }
    
    // Get token from request headers
    public static function getTokenFromRequest() {
        // Try getallheaders() first
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            
            if (isset($headers['Authorization'])) {
                $authHeader = $headers['Authorization'];
                if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                    return $matches[1];
                }
            }
        }
        
        // Fallback: Try apache_request_headers()
        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            
            if (isset($headers['Authorization'])) {
                $authHeader = $headers['Authorization'];
                if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                    return $matches[1];
                }
            }
        }
        
        // Fallback: Try $_SERVER
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                return $matches[1];
            }
        }
        
        // Fallback: Check for redirect authorization header
        if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                return $matches[1];
            }
        }
        
        return null;
    }
    
    // Require authentication
    public static function requireAuth() {
        // Log ALL received data for debugging
        error_log("=== AUTH DEBUG ===");
        error_log("REQUEST METHOD: " . $_SERVER['REQUEST_METHOD']);
        error_log("REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'NOT SET'));
        error_log("ALL $_SERVER keys with HTTP_: " . json_encode(array_filter($_SERVER, function($k) { return strpos($k, 'HTTP_') === 0; }, ARRAY_FILTER_USE_KEY)));
        error_log("HTTP_AUTHORIZATION: " . ($_SERVER['HTTP_AUTHORIZATION'] ?? 'NOT SET'));
        error_log("REDIRECT_HTTP_AUTHORIZATION: " . ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? 'NOT SET'));
        
        if (function_exists('getallheaders')) {
            error_log("getallheaders() result: " . json_encode(getallheaders()));
        }
        
        $token = self::getTokenFromRequest();
        
        // Debug logging
        error_log("Auth Token Received: " . ($token ? substr($token, 0, 20) . "..." : "NONE"));
        error_log("=== END AUTH DEBUG ===");
        
        $user = self::verifyToken($token);
        
        if (!$user) {
            error_log("Auth Failed: Token verification failed");
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized - Invalid or missing token']);
            exit;
        }
        
        error_log("Auth Success: User ID " . $user['user_id']);
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
