<?php
/**
 * Client Creation from Policy Upload
 * Procesa póliza subida, extrae datos, crea cliente automáticamente
 * y genera credenciales de acceso
 */

require_once 'config.php';
require_once 'database.php';
require_once 'policy-analyzer.php';
require_once 'email-service.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

class ClientFromPolicyService {
    private $db;
    private $analyzer;
    private $emailService;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->analyzer = new PolicyAnalyzer();
        $this->emailService = new EmailService();
    }
    
    /**
     * Procesar subida de póliza y crear cliente
     */
    public function processPolicy($file, $agentId) {
        try {
            // Validar archivo
            $validation = $this->validateFile($file);
            if (!$validation['valid']) {
                throw new Exception($validation['error']);
            }
            
            // Guardar archivo temporalmente
            $tempPath = $this->saveTemporaryFile($file);
            
            // Analizar póliza y extraer datos
            $analysisResult = $this->analyzer->analyzePolicyDocument($tempPath);
            
            if (!$analysisResult['success']) {
                // Si no se puede analizar automáticamente, ofrecer entrada manual
                if (isset($analysisResult['manual_entry']) && $analysisResult['manual_entry']) {
                    return $this->handleManualEntry($tempPath, $agentId);
                }
                throw new Exception($analysisResult['error']);
            }
            
            $extractedData = $analysisResult['data'];
            $confidence = $analysisResult['confidence'];
            
            // Si confianza es baja, solicitar confirmación
            if ($confidence === 'low') {
                return [
                    'success' => true,
                    'requires_confirmation' => true,
                    'extracted_data' => $extractedData,
                    'temp_file_path' => $tempPath,
                    'raw_text' => $analysisResult['raw_text'] ?? null,
                    'message' => 'Datos extraídos con baja confianza. Por favor revisa y confirma.'
                ];
            }
            
            // Procesar y crear cliente/póliza
            $result = $this->createClientAndPolicy($extractedData, $tempPath, $agentId);
            
            return $result;
            
        } catch (Exception $e) {
            error_log("Error procesando póliza: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Crear cliente y póliza desde datos extraídos
     */
    public function createClientAndPolicy($data, $policyFilePath, $agentId) {
        $this->db->beginTransaction();
        
        try {
            // Extraer nombre y apellido del nombre completo
            $nameParts = $this->parseFullName($data['client_name']);
            
            // Verificar si el cliente ya existe
            $existingClient = $this->findExistingClient($nameParts['first_name'], $nameParts['last_name']);
            
            if ($existingClient) {
                // Cliente existe, solo agregar nueva póliza
                $clientId = $existingClient['id'];
                $newClient = false;
            } else {
                // Crear nuevo cliente
                $credentials = $this->generateCredentials($nameParts['first_name'], $nameParts['last_name']);
                $clientId = $this->createClient($nameParts, $credentials);
                $newClient = true;
            }
            
            // Crear póliza
            $policyId = $this->createPolicy($clientId, $agentId, $data);
            
            // Mover archivo de póliza a ubicación permanente
            $permanentPath = $this->moveToPermamentStorage($policyFilePath, $clientId, $policyId);
            
            // Registrar documento en la base de datos
            $this->registerDocument($clientId, $policyId, $permanentPath, basename($policyFilePath));
            
            // Si es cliente nuevo, enviar email con credenciales
            if ($newClient) {
                $this->sendWelcomeEmail($clientId, $credentials);
            } else {
                // Notificar nueva póliza agregada
                $this->sendNewPolicyNotification($clientId, $policyId);
            }
            
            $this->db->commit();
            
            return [
                'success' => true,
                'client_id' => $clientId,
                'policy_id' => $policyId,
                'new_client' => $newClient,
                'email_sent' => true,
                'message' => $newClient 
                    ? 'Cliente creado y póliza registrada. Credenciales enviadas por email.' 
                    : 'Póliza agregada al cliente existente.'
            ];
            
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
    
    /**
     * Separar nombre completo en nombre y apellido
     */
    private function parseFullName($fullName) {
        $parts = explode(' ', trim($fullName));
        $count = count($parts);
        
        if ($count >= 2) {
            $firstName = $parts[0];
            $lastName = implode(' ', array_slice($parts, 1));
        } else {
            $firstName = $fullName;
            $lastName = '';
        }
        
        return [
            'first_name' => $firstName,
            'last_name' => $lastName
        ];
    }
    
    /**
     * Buscar cliente existente
     */
    private function findExistingClient($firstName, $lastName) {
        $stmt = $this->db->prepare("
            SELECT id, email 
            FROM users 
            WHERE user_type = 'client' 
            AND first_name = ? 
            AND last_name = ?
            LIMIT 1
        ");
        
        $stmt->execute([$firstName, $lastName]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Generar credenciales automáticas
     */
    private function generateCredentials($firstName, $lastName) {
        // Generar email basado en nombre
        $baseEmail = strtolower(preg_replace('/[^a-z0-9]/', '', $firstName . $lastName));
        $email = $baseEmail . '@cliente.krause.com';
        
        // Verificar si email ya existe y agregar número si es necesario
        $counter = 1;
        while ($this->emailExists($email)) {
            $email = $baseEmail . $counter . '@cliente.krause.com';
            $counter++;
        }
        
        // Generar password aleatorio
        $password = $this->generateRandomPassword();
        
        return [
            'email' => $email,
            'password' => $password,
            'password_hash' => password_hash($password, PASSWORD_BCRYPT)
        ];
    }
    
    /**
     * Verificar si email existe
     */
    private function emailExists($email) {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch() !== false;
    }
    
    /**
     * Generar password aleatorio seguro
     */
    private function generateRandomPassword($length = 12) {
        $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $lowercase = 'abcdefghijklmnopqrstuvwxyz';
        $numbers = '0123456789';
        $special = '!@#$%&*';
        
        $all = $uppercase . $lowercase . $numbers . $special;
        
        $password = '';
        $password .= $uppercase[rand(0, strlen($uppercase) - 1)];
        $password .= $lowercase[rand(0, strlen($lowercase) - 1)];
        $password .= $numbers[rand(0, strlen($numbers) - 1)];
        $password .= $special[rand(0, strlen($special) - 1)];
        
        for ($i = 4; $i < $length; $i++) {
            $password .= $all[rand(0, strlen($all) - 1)];
        }
        
        return str_shuffle($password);
    }
    
    /**
     * Crear cliente en la base de datos
     */
    private function createClient($nameParts, $credentials) {
        $stmt = $this->db->prepare("
            INSERT INTO users (email, password_hash, user_type, first_name, last_name, status)
            VALUES (?, ?, 'client', ?, ?, 'active')
        ");
        
        $stmt->execute([
            $credentials['email'],
            $credentials['password_hash'],
            $nameParts['first_name'],
            $nameParts['last_name']
        ]);
        
        return $this->db->lastInsertId();
    }
    
    /**
     * Crear póliza en la base de datos
     */
    private function createPolicy($clientId, $agentId, $data) {
        // Determinar tipo de póliza basado en contenido
        $policyType = $this->detectPolicyType($data);
        
        // Calcular frecuencia de pago mensual
        $monthlyPremium = $this->calculateMonthlyPremium(
            $data['total_premium'], 
            $data['payment_frequency'] ?? 12
        );
        
        $stmt = $this->db->prepare("
            INSERT INTO policies 
            (policy_number, client_id, agent_id, policy_type, status, 
             premium_amount, start_date, end_date, renewal_date)
            VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?)
        ");
        
        $startDate = $this->normalizeDate($data['start_date']);
        $endDate = $this->normalizeDate($data['end_date']);
        $renewalDate = $endDate; // La renovación es en la fecha de vencimiento
        
        $stmt->execute([
            $data['policy_number'],
            $clientId,
            $agentId,
            $policyType,
            $monthlyPremium,
            $startDate,
            $endDate,
            $renewalDate
        ]);
        
        return $this->db->lastInsertId();
    }
    
    /**
     * Detectar tipo de póliza
     */
    private function detectPolicyType($data) {
        $insurerName = strtolower($data['insurer_name'] ?? '');
        $policyNumber = strtolower($data['policy_number'] ?? '');
        
        // Patrones comunes
        if (strpos($insurerName, 'auto') !== false || strpos($policyNumber, 'auto') !== false) {
            return 'auto';
        }
        if (strpos($insurerName, 'hogar') !== false || strpos($insurerName, 'casa') !== false) {
            return 'home';
        }
        if (strpos($insurerName, 'vida') !== false) {
            return 'life';
        }
        if (strpos($insurerName, 'salud') !== false) {
            return 'health';
        }
        
        return 'other';
    }
    
    /**
     * Calcular prima mensual
     */
    private function calculateMonthlyPremium($totalPremium, $frequency) {
        if (!$frequency) return $totalPremium / 12;
        
        // frequency = número de pagos por año
        return $totalPremium / $frequency;
    }
    
    /**
     * Normalizar fecha
     */
    private function normalizeDate($dateString) {
        if (!$dateString) return null;
        
        // Intentar varios formatos
        $formats = ['d/m/Y', 'd-m-Y', 'Y-m-d', 'm/d/Y'];
        
        foreach ($formats as $format) {
            $date = DateTime::createFromFormat($format, $dateString);
            if ($date) {
                return $date->format('Y-m-d');
            }
        }
        
        return null;
    }
    
    /**
     * Registrar documento
     */
    private function registerDocument($clientId, $policyId, $filePath, $fileName) {
        $fileSize = filesize($filePath);
        $mimeType = mime_content_type($filePath);
        
        $stmt = $this->db->prepare("
            INSERT INTO documents 
            (user_id, policy_id, document_type, file_name, file_path, file_size, mime_type)
            VALUES (?, ?, 'policy_doc', ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $clientId,
            $policyId,
            $fileName,
            $filePath,
            $fileSize,
            $mimeType
        ]);
    }
    
    /**
     * Mover archivo a almacenamiento permanente
     */
    private function moveToPermamentStorage($tempPath, $clientId, $policyId) {
        $uploadDir = __DIR__ . '/uploads/policies/' . $clientId . '/';
        
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $extension = pathinfo($tempPath, PATHINFO_EXTENSION);
        $filename = 'policy_' . $policyId . '_' . time() . '.' . $extension;
        $permanentPath = $uploadDir . $filename;
        
        rename($tempPath, $permanentPath);
        
        return 'backend/uploads/policies/' . $clientId . '/' . $filename;
    }
    
    /**
     * Enviar email de bienvenida con credenciales
     */
    private function sendWelcomeEmail($clientId, $credentials) {
        $stmt = $this->db->prepare("SELECT first_name, last_name FROM users WHERE id = ?");
        $stmt->execute([$clientId]);
        $client = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $subject = "Bienvenido a Krause Insurance - Tus credenciales de acceso";
        $message = "
            <h2>Bienvenido/a {$client['first_name']} {$client['last_name']}</h2>
            <p>Tu agente ha registrado una nueva póliza a tu nombre.</p>
            <p>Hemos creado una cuenta para que puedas acceder al portal de clientes:</p>
            <div style='background: #f5f5f5; padding: 20px; margin: 20px 0;'>
                <p><strong>Email:</strong> {$credentials['email']}</p>
                <p><strong>Contraseña temporal:</strong> {$credentials['password']}</p>
            </div>
            <p>Por favor cambia tu contraseña al primer inicio de sesión.</p>
            <p><a href='http://ksinsurancee.com'>Iniciar sesión ahora</a></p>
        ";
        
        $this->emailService->send($credentials['email'], $subject, $message);
    }
    
    /**
     * Enviar notificación de nueva póliza
     */
    private function sendNewPolicyNotification($clientId, $policyId) {
        $stmt = $this->db->prepare("
            SELECT u.email, u.first_name, p.policy_number 
            FROM users u
            JOIN policies p ON p.id = ?
            WHERE u.id = ?
        ");
        $stmt->execute([$policyId, $clientId]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $subject = "Nueva póliza agregada a tu cuenta";
        $message = "
            <h2>Hola {$data['first_name']}</h2>
            <p>Se ha agregado una nueva póliza a tu cuenta:</p>
            <p><strong>Número de póliza:</strong> {$data['policy_number']}</p>
            <p><a href='http://ksinsurancee.com'>Ver detalles en tu portal</a></p>
        ";
        
        $this->emailService->send($data['email'], $subject, $message);
    }
    
    /**
     * Validar archivo subido
     */
    private function validateFile($file) {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['valid' => false, 'error' => 'Error al subir archivo'];
        }
        
        if ($file['size'] > 10 * 1024 * 1024) { // 10MB max
            return ['valid' => false, 'error' => 'Archivo demasiado grande (máx 10MB)'];
        }
        
        $allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!in_array($file['type'], $allowedTypes)) {
            return ['valid' => false, 'error' => 'Tipo de archivo no permitido. Use PDF, JPG o PNG'];
        }
        
        return ['valid' => true];
    }
    
    /**
     * Guardar archivo temporalmente
     */
    private function saveTemporaryFile($file) {
        $tempDir = __DIR__ . '/uploads/temp/';
        
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }
        
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $tempFilename = 'policy_temp_' . uniqid() . '.' . $extension;
        $tempPath = $tempDir . $tempFilename;
        
        if (!move_uploaded_file($file['tmp_name'], $tempPath)) {
            throw new Exception('Error al guardar archivo');
        }
        
        return $tempPath;
    }
    
    /**
     * Manejar entrada manual cuando falla análisis automático
     */
    private function handleManualEntry($filePath, $agentId) {
        return [
            'success' => true,
            'requires_manual_entry' => true,
            'temp_file_path' => $filePath,
            'message' => 'No se pudo extraer datos automáticamente. Por favor ingresa los datos manualmente.'
        ];
    }
}

// Procesar request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verificar autenticación
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (!$authHeader || !verifyToken($authHeader)) {
        http_response_code(401);
        echo json_encode(['error' => 'No autorizado']);
        exit;
    }
    
    // Obtener agent_id del token
    $agentId = getAgentIdFromToken($authHeader);
    
    if (!isset($_FILES['policy_file'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No se recibió archivo de póliza']);
        exit;
    }
    
    $service = new ClientFromPolicyService();
    $result = $service->processPolicy($_FILES['policy_file'], $agentId);
    
    echo json_encode($result);
}

function verifyToken($authHeader) {
    // Implementar verificación JWT
    return true; // Placeholder
}

function getAgentIdFromToken($authHeader) {
    // Extraer agent_id del JWT
    return 1; // Placeholder
}
