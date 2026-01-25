<?php
/**
 * Document Auto-Matching Service
 * Detecta automáticamente a qué cliente/póliza pertenece un documento
 * basándose en OCR, nombres, números de póliza, etc.
 */

require_once 'config.php';
require_once 'database.php';
require_once 'policy-analyzer.php';
require_once 'receipt-analyzer.php';

class DocumentMatcher {
    private $db;
    private $policyAnalyzer;
    private $receiptAnalyzer;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->policyAnalyzer = new PolicyAnalyzer();
        $this->receiptAnalyzer = new ReceiptAnalyzer();
    }
    
    /**
     * Procesar documento genérico y detectar tipo/asociación
     */
    public function processAndMatchDocument($file, $agentId) {
        try {
            // Guardar archivo temporalmente
            $tempPath = $this->saveTemporaryFile($file);
            
            // Analizar documento para extraer texto
            $extractedText = $this->extractTextFromDocument($tempPath);
            
            if (!$extractedText) {
                return [
                    'success' => false,
                    'error' => 'No se pudo extraer texto del documento'
                ];
            }
            
            // Detectar tipo de documento
            $documentType = $this->detectDocumentType($extractedText);
            
            // Intentar encontrar coincidencias
            $matches = $this->findMatches($extractedText, $documentType);
            
            if (empty($matches)) {
                // No se encontraron coincidencias automáticas
                return [
                    'success' => true,
                    'requires_manual_assignment' => true,
                    'document_type' => $documentType,
                    'temp_file_path' => $tempPath,
                    'extracted_text' => $extractedText,
                    'message' => 'No se pudo asociar automáticamente. Por favor asigna manualmente.'
                ];
            }
            
            // Si hay múltiples coincidencias, solicitar confirmación
            if (count($matches) > 1) {
                return [
                    'success' => true,
                    'requires_confirmation' => true,
                    'matches' => $matches,
                    'document_type' => $documentType,
                    'temp_file_path' => $tempPath,
                    'message' => 'Múltiples coincidencias encontradas. Por favor confirma.'
                ];
            }
            
            // Una sola coincidencia - asociar automáticamente
            $match = $matches[0];
            $result = $this->associateDocument(
                $tempPath, 
                $match['client_id'], 
                $match['policy_id'] ?? null,
                $documentType,
                $file['name']
            );
            
            return [
                'success' => true,
                'auto_matched' => true,
                'client_id' => $match['client_id'],
                'policy_id' => $match['policy_id'] ?? null,
                'document_type' => $documentType,
                'confidence' => $match['confidence'],
                'message' => 'Documento asociado automáticamente'
            ];
            
        } catch (Exception $e) {
            error_log("Error en matching de documento: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Extraer texto de documento
     */
    private function extractTextFromDocument($filePath) {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        
        if ($extension === 'pdf') {
            return $this->extractTextFromPDF($filePath);
        } else if (in_array($extension, ['jpg', 'jpeg', 'png'])) {
            return $this->extractTextFromImage($filePath);
        }
        
        return null;
    }
    
    /**
     * Extraer texto de PDF
     */
    private function extractTextFromPDF($filePath) {
        if ($this->commandExists('pdftotext')) {
            $outputFile = sys_get_temp_dir() . '/' . uniqid() . '.txt';
            exec("pdftotext " . escapeshellarg($filePath) . " " . escapeshellarg($outputFile), $output, $returnCode);
            
            if ($returnCode === 0 && file_exists($outputFile)) {
                $text = file_get_contents($outputFile);
                unlink($outputFile);
                return $text;
            }
        }
        
        return null;
    }
    
    /**
     * Extraer texto de imagen con OCR
     */
    private function extractTextFromImage($filePath) {
        if ($this->commandExists('tesseract')) {
            $outputFile = sys_get_temp_dir() . '/' . uniqid();
            exec("tesseract " . escapeshellarg($filePath) . " " . escapeshellarg($outputFile) . " -l spa", $output, $returnCode);
            
            if ($returnCode === 0 && file_exists($outputFile . '.txt')) {
                $text = file_get_contents($outputFile . '.txt');
                unlink($outputFile . '.txt');
                return $text;
            }
        }
        
        return null;
    }
    
    /**
     * Verificar si comando existe
     */
    private function commandExists($command) {
        $return = shell_exec(sprintf("which %s", escapeshellarg($command)));
        return !empty($return);
    }
    
    /**
     * Detectar tipo de documento
     */
    private function detectDocumentType($text) {
        $text = strtolower($text);
        
        // Póliza
        if (preg_match('/p[óo]liza|policy|coverage|cobertura/i', $text)) {
            return 'policy_doc';
        }
        
        // Comprobante de pago
        if (preg_match('/comprobante|recibo|pago|payment|receipt|transferencia/i', $text)) {
            return 'payment_receipt';
        }
        
        // Siniestro
        if (preg_match('/siniestro|claim|incidente|accidente/i', $text)) {
            return 'claim_doc';
        }
        
        // Identificación
        if (preg_match('/ine|identificaci[óo]n|licencia|pasaporte|id/i', $text)) {
            return 'id_proof';
        }
        
        return 'other';
    }
    
    /**
     * Buscar coincidencias en la base de datos
     */
    private function findMatches($text, $documentType) {
        $matches = [];
        
        // Buscar por número de póliza
        $policyMatches = $this->findByPolicyNumber($text);
        if ($policyMatches) {
            $matches = array_merge($matches, $policyMatches);
        }
        
        // Buscar por nombre de cliente
        $nameMatches = $this->findByClientName($text);
        if ($nameMatches) {
            $matches = array_merge($matches, $nameMatches);
        }
        
        // Buscar por email
        $emailMatches = $this->findByEmail($text);
        if ($emailMatches) {
            $matches = array_merge($matches, $emailMatches);
        }
        
        // Eliminar duplicados y ordenar por confianza
        $matches = $this->deduplicateMatches($matches);
        usort($matches, function($a, $b) {
            return $b['confidence'] - $a['confidence'];
        });
        
        return array_slice($matches, 0, 5); // Máximo 5 coincidencias
    }
    
    /**
     * Buscar por número de póliza
     */
    private function findByPolicyNumber($text) {
        // Extraer posibles números de póliza
        preg_match_all('/\b([A-Z]{2,4}[-\s]?\d{3,10})\b/i', $text, $policyNumbers);
        
        if (empty($policyNumbers[1])) {
            return [];
        }
        
        $matches = [];
        
        foreach ($policyNumbers[1] as $policyNum) {
            $policyNum = strtoupper(str_replace([' ', '-'], '', $policyNum));
            
            $stmt = $this->db->prepare("
                SELECT p.id as policy_id, p.client_id, p.policy_number,
                       u.first_name, u.last_name, u.email
                FROM policies p
                JOIN users u ON p.client_id = u.id
                WHERE REPLACE(REPLACE(UPPER(p.policy_number), ' ', ''), '-', '') = ?
            ");
            
            $stmt->execute([$policyNum]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                $matches[] = [
                    'client_id' => $result['client_id'],
                    'policy_id' => $result['policy_id'],
                    'client_name' => $result['first_name'] . ' ' . $result['last_name'],
                    'policy_number' => $result['policy_number'],
                    'confidence' => 95, // Alta confianza
                    'match_type' => 'policy_number'
                ];
            }
        }
        
        return $matches;
    }
    
    /**
     * Buscar por nombre de cliente
     */
    private function findByClientName($text) {
        // Extraer nombres propios (palabras que empiezan con mayúscula)
        preg_match_all('/\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,3})\b/', $text, $names);
        
        if (empty($names[1])) {
            return [];
        }
        
        $matches = [];
        
        foreach ($names[1] as $fullName) {
            $stmt = $this->db->prepare("
                SELECT id as client_id, first_name, last_name, email
                FROM users
                WHERE user_type = 'client'
                AND CONCAT(first_name, ' ', last_name) LIKE ?
            ");
            
            $stmt->execute(['%' . $fullName . '%']);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($results as $result) {
                $matches[] = [
                    'client_id' => $result['client_id'],
                    'policy_id' => null,
                    'client_name' => $result['first_name'] . ' ' . $result['last_name'],
                    'confidence' => 70, // Confianza media
                    'match_type' => 'client_name'
                ];
            }
        }
        
        return $matches;
    }
    
    /**
     * Buscar por email
     */
    private function findByEmail($text) {
        preg_match_all('/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/', $text, $emails);
        
        if (empty($emails[0])) {
            return [];
        }
        
        $matches = [];
        
        foreach ($emails[0] as $email) {
            $stmt = $this->db->prepare("
                SELECT id as client_id, first_name, last_name, email
                FROM users
                WHERE user_type = 'client' AND email = ?
            ");
            
            $stmt->execute([strtolower($email)]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                $matches[] = [
                    'client_id' => $result['client_id'],
                    'policy_id' => null,
                    'client_name' => $result['first_name'] . ' ' . $result['last_name'],
                    'confidence' => 90, // Alta confianza
                    'match_type' => 'email'
                ];
            }
        }
        
        return $matches;
    }
    
    /**
     * Eliminar duplicados
     */
    private function deduplicateMatches($matches) {
        $unique = [];
        $seen = [];
        
        foreach ($matches as $match) {
            $key = $match['client_id'] . '_' . ($match['policy_id'] ?? 'null');
            
            if (!isset($seen[$key])) {
                $unique[] = $match;
                $seen[$key] = true;
            } else {
                // Si ya existe, mantener el de mayor confianza
                $existingIndex = array_search($key, array_keys($seen));
                if ($match['confidence'] > $unique[$existingIndex]['confidence']) {
                    $unique[$existingIndex] = $match;
                }
            }
        }
        
        return $unique;
    }
    
    /**
     * Asociar documento a cliente/póliza
     */
    private function associateDocument($tempPath, $clientId, $policyId, $documentType, $originalFilename) {
        // Mover a almacenamiento permanente
        $uploadDir = __DIR__ . '/uploads/documents/' . $clientId . '/';
        
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $extension = pathinfo($tempPath, PATHINFO_EXTENSION);
        $filename = $documentType . '_' . time() . '_' . uniqid() . '.' . $extension;
        $permanentPath = $uploadDir . $filename;
        
        rename($tempPath, $permanentPath);
        
        // Registrar en base de datos
        $fileSize = filesize($permanentPath);
        $mimeType = mime_content_type($permanentPath);
        
        $stmt = $this->db->prepare("
            INSERT INTO documents 
            (user_id, policy_id, document_type, file_name, file_path, file_size, mime_type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $clientId,
            $policyId,
            $documentType,
            $originalFilename,
            'backend/uploads/documents/' . $clientId . '/' . $filename,
            $fileSize,
            $mimeType
        ]);
        
        return $this->db->lastInsertId();
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
        $tempFilename = 'doc_temp_' . uniqid() . '.' . $extension;
        $tempPath = $tempDir . $tempFilename;
        
        if (!move_uploaded_file($file['tmp_name'], $tempPath)) {
            throw new Exception('Error al guardar archivo');
        }
        
        return $tempPath;
    }
}

// API Endpoint
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['document'])) {
        echo json_encode(['error' => 'No se recibió archivo']);
        exit;
    }
    
    $agentId = $_POST['agent_id'] ?? 1; // TODO: Obtener del JWT
    
    $matcher = new DocumentMatcher();
    $result = $matcher->processAndMatchDocument($_FILES['document'], $agentId);
    
    echo json_encode($result);
}
