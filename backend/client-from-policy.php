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
require_once 'payment-schedule-generator.php';

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
    private $scheduleGenerator;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->analyzer = new PolicyAnalyzer();
        $this->emailService = new EmailService();
        $this->scheduleGenerator = new PaymentScheduleGenerator();
    }
    
    /**
     * Procesar subida de póliza y crear cliente
     */
    public function processPolicy($file, $agentId, $clientEmail) {
        try {
            // Validar email
            if (!$this->validateEmail($clientEmail)) {
                throw new Exception('Email inválido');
            }
            
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
            $result = $this->createClientAndPolicy($extractedData, $tempPath, $agentId, $clientEmail);
            
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
    public function createClientAndPolicy($data, $policyFilePath, $agentId, $clientEmail) {
        $this->db->beginTransaction();
        
        try {
            // Extraer nombre y apellido del nombre completo
            $nameParts = $this->parseFullName($data['client_name']);
            
            // Verificar si el cliente ya existe POR EMAIL
            $existingClient = $this->findExistingClientByEmail($clientEmail);
            
            if ($existingClient) {
                // Cliente existe, solo agregar nueva póliza
                $clientId = $existingClient['id'];
                $newClient = false;
            } else {
                // Crear nuevo cliente con email real
                $password = $this->generateRandomPassword();
                $clientId = $this->createClient($nameParts, $clientEmail, $password);
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
                $this->sendWelcomeEmail($clientId, $clientEmail, $password);
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
                'client_email' => $clientEmail,
                'message' => $newClient 
                    ? 'Cliente creado y póliza registrada. Credenciales enviadas a ' . $clientEmail 
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
    
    /** por email
     */
    private function findExistingClientByEmail($email) {
        $stmt = $this->db->prepare("
            SELECT id, email, first_name, last_name 
            FROM users 
            WHERE user_type = 'client' 
            AND LOWER(email) = LOWER(?)
            LIMIT 1
        ");
        
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Buscar cliente existente por nombre (backup)
     */ - AHORA SOLO PASSWORD
     */
    private function generateCredentials($firstName, $lastName) {
        // DEPRECATED - Ya no se usa, se mantiene por compatibilidad
        $password = $this->generateRandomPassword();
        
        return [
            'email' => null,
            'password' => $password,
            'password_hash' => password_hash($password, PASSWORD_BCRYPT)
        ];
    }
    
    /**
     * Verificar si email existe
     */
    private function emailExists($email) {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)me . $lastName));
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
        $password .= $special[rand(0, strlen($semail, $password) {
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        
        $stmt = $this->db->prepare("
            INSERT INTO users (email, password_hash, user_type, first_name, last_name, status)
            VALUES (?, ?, 'client', ?, ?, 'active')
        ");
        
        $stmt->execute([
            $email,
            $passwordHash
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
        
        $policyId = $this->db->lastInsertId();
        
        // GENERAR CALENDARIO DE PAGOS AUTOMÁTICAMENTE
        $scheduleResult = $this->scheduleGenerator->generateSchedule([
            'total_premium' => $data['total_premium'],
            'payment_frequency' => $data['payment_frequency'] ?? 12,
            'start_date' => $startDate
        ], $policyId, $this->db);
        
        if (!$scheduleResult['success']) {
            error_log("Error generando calendario de pagos para póliza $policyId: " . $scheduleResult['error']);
        }
        
        return $policyId;
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
            <p>Hemos creado una cuenta para que puemail, $password) {
        $stmt = $this->db->prepare("SELECT first_name, last_name FROM users WHERE id = ?");
        $stmt->execute([$clientId]);
        $client = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $subject = "Bienvenido a Krause Insurance - Tus credenciales de acceso";
        $message = "
            <h2>Bienvenido/a {$client['first_name']} {$client['last_name']}</h2>
            <p>Tu agente ha registrado una nueva póliza a tu nombre.</p>
            <p>Hemos creado una cuenta para que puedas acceder al portal de clientes:</p>
            <div style='background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;'>
                <p style='margin: 5px 0;'><strong>Email de acceso:</strong> {$email}</p>
                <p style='margin: 5px 0;'><strong>Contraseña temporal:</strong> <code style='background: #fff; padding: 5px 10px; border-radius: 4px; font-size: 16px;'>{$password}</code></p>
            </div>
            <p style='color: #dc3545;'><strong>⚠️ Importante:</strong></p>
            <ul>
                <li>Usa el email <strong>{$email}</strong> para iniciar sesión</li>
                <li>Cambia tu contraseña al primer inicio de sesión</li>
                <li>Este email se usará para todas las notificaciones</li>
            </ul>
            <p><a href='http://ksinsurancee.com' style='display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 10px;'>Iniciar sesión ahora</a></p>
        ";
        
        $this->emailService->send($email
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
    // Verificar si es FormData (upload inicial) o JSON (confirmación)
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    
    if (strpos($contentType, 'application/json') !== false) {
        // Confirmación de datos
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        if (!isset($data['confirmed_data'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Datos confirmados no recibidos']);
            exit;
        }
        
        $confirmedData = $data['confirmed_data'];
        $tempFilePath = $data['temp_file_path'] ?? null;
        
        if (!isset($confirmedData['client_email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email del cliente es obligatorio']);
            exit;
        }
        
        $service = new ClientFromPolicyService();
        $result = $service->createClientAndPolicy(
            $confirmedData, 
            $tempFilePath, 
            $agentId,
            $confirmedData['client_email']
        );
        
        echo json_encode($result);
        
    } else {
        // Upload inicial de póliza
        if (!isset($_FILES['policy_file'])) {
            http_response_code(400);
            echo json_encode(['error' => 'No se recibió archivo de póliza']);
            exit;
        }
        
        if (!isset($_POST['client_email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email del cliente es obligatorio']);
            exit;
        }
        
        $clientEmail = trim($_POST['client_email']);
        
        $service = new ClientFromPolicyService();
        $result = $service->processPolicy($_FILES['policy_file'], $agentId, $clientEmail);
        
        echo json_encode($result);
    }n JWT
    return true; // Placeholder
}

function getAgentIdFromToken($authHeader) {
    // Extraer agent_id del JWT
    return 1; // Placeholder
}
