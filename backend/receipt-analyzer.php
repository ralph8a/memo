<?php
/**
 * Receipt Analysis Service
 * Analyzes payment receipts using OCR and pattern matching
 * Extracts: amount, date, reference, bank
 */

class ReceiptAnalyzer {
    private $uploadDir;
    
    public function __construct() {
        $this->uploadDir = __DIR__ . '/uploads/receipts/';
        if (!file_exists($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }
    
    /**
     * Process uploaded receipt
     */
    public function processReceipt($file, $policyId, $userId, $paymentDate, $reference = '') {
        try {
            // Validate file
            $validation = $this->validateFile($file);
            if (!$validation['valid']) {
                throw new Exception($validation['error']);
            }
            
            // Generate unique filename
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'receipt_' . $userId . '_' . time() . '_' . uniqid() . '.' . $extension;
            $filepath = $this->uploadDir . $filename;
            
            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                throw new Exception('Failed to save file');
            }
            
            // Extract information from receipt
            $extractedData = $this->analyzeReceipt($filepath, $file['type']);
            
            return [
                'success' => true,
                'file_path' => 'backend/uploads/receipts/' . $filename,
                'file_name' => $file['name'],
                'file_size' => $file['size'],
                'mime_type' => $file['type'],
                'extracted_data' => $extractedData
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Validate uploaded file
     */
    private function validateFile($file) {
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['valid' => false, 'error' => 'Upload error: ' . $file['error']];
        }
        
        // Check file size (5MB max)
        if ($file['size'] > 5 * 1024 * 1024) {
            return ['valid' => false, 'error' => 'File too large. Maximum 5MB'];
        }
        
        // Check file type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!in_array($file['type'], $allowedTypes)) {
            return ['valid' => false, 'error' => 'Invalid file type. Use JPG, PNG, or PDF'];
        }
        
        return ['valid' => true];
    }
    
    /**
     * Analyze receipt and extract information
     * Uses pattern matching for common Mexican bank formats
     */
    private function analyzeReceipt($filepath, $mimeType) {
        $extractedData = [
            'amount' => null,
            'date' => null,
            'reference' => null,
            'bank' => null,
            'confidence' => 'low'
        ];
        
        // For PDFs, try to extract text directly
        if ($mimeType === 'application/pdf') {
            $text = $this->extractTextFromPDF($filepath);
        } else {
            // For images, try basic OCR if available, otherwise use Tesseract
            $text = $this->extractTextFromImage($filepath);
        }
        
        if (!$text) {
            return $extractedData;
        }
        
        // Extract amount (Mexican pesos format)
        // Patterns: $1,234.56 | $1234.56 | 1,234.56 | 1234.56
        if (preg_match('/\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/u', $text, $matches)) {
            $amount = str_replace(',', '', $matches[1]);
            $extractedData['amount'] = floatval($amount);
            $extractedData['confidence'] = 'medium';
        }
        
        // Extract date (various formats)
        // DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
        if (preg_match('/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/u', $text, $matches)) {
            $extractedData['date'] = $matches[1];
            $extractedData['confidence'] = 'medium';
        }
        
        // Extract reference/folio number
        // Patterns: Referencia: 123456, Folio: 123456, Ref: 123456
        if (preg_match('/(?:Referencia|Folio|Ref\.?|Reference)[\s:]+([A-Z0-9]+)/iu', $text, $matches)) {
            $extractedData['reference'] = $matches[1];
            $extractedData['confidence'] = 'high';
        }
        
        // Detect bank
        $banks = [
            'BBVA' => ['BBVA', 'Bancomer'],
            'Banamex' => ['Banamex', 'Citibanamex'],
            'Santander' => ['Santander'],
            'HSBC' => ['HSBC'],
            'Banorte' => ['Banorte'],
            'Scotiabank' => ['Scotiabank'],
            'Inbursa' => ['Inbursa'],
            'Azteca' => ['Banco Azteca', 'Azteca']
        ];
        
        foreach ($banks as $bankName => $patterns) {
            foreach ($patterns as $pattern) {
                if (stripos($text, $pattern) !== false) {
                    $extractedData['bank'] = $bankName;
                    $extractedData['confidence'] = 'high';
                    break 2;
                }
            }
        }
        
        return $extractedData;
    }
    
    /**
     * Extract text from PDF using basic PHP
     */
    private function extractTextFromPDF($filepath) {
        // Simple PDF text extraction (works for text-based PDFs)
        $content = file_get_contents($filepath);
        
        // Remove binary junk
        $content = preg_replace('/[^\x20-\x7E\x0A\x0D]/u', ' ', $content);
        
        // Extract text between common PDF delimiters
        if (preg_match_all('/\(([^)]+)\)/u', $content, $matches)) {
            return implode(' ', $matches[1]);
        }
        
        return $content;
    }
    
    /**
     * Extract text from image using Tesseract OCR
     * Falls back to basic pattern matching if Tesseract not available
     */
    private function extractTextFromImage($filepath) {
        // Check if Tesseract is installed
        $tesseractPath = $this->findTesseract();
        
        if ($tesseractPath) {
            // Use Tesseract OCR
            $outputFile = $filepath . '_ocr';
            exec("$tesseractPath \"$filepath\" \"$outputFile\" -l spa 2>&1", $output, $return);
            
            if ($return === 0 && file_exists($outputFile . '.txt')) {
                $text = file_get_contents($outputFile . '.txt');
                unlink($outputFile . '.txt');
                return $text;
            }
        }
        
        // Fallback: Try to extract EXIF data or return empty
        // In production, you could use cloud OCR services like:
        // - Google Cloud Vision API
        // - AWS Textract
        // - Azure Computer Vision
        
        return '';
    }
    
    /**
     * Find Tesseract executable
     */
    private function findTesseract() {
        $paths = [
            '/usr/bin/tesseract',
            '/usr/local/bin/tesseract',
            'C:\\Program Files\\Tesseract-OCR\\tesseract.exe',
            'tesseract' // System PATH
        ];
        
        foreach ($paths as $path) {
            if (file_exists($path) || exec("which $path 2>/dev/null")) {
                return $path;
            }
        }
        
        return null;
    }
    
    /**
     * Get confidence level description
     */
    public function getConfidenceDescription($confidence) {
        $descriptions = [
            'high' => 'Alta - Datos extraídos con alta confiabilidad',
            'medium' => 'Media - Algunos datos detectados, requiere verificación',
            'low' => 'Baja - Análisis manual requerido'
        ];
        
        return $descriptions[$confidence] ?? 'Desconocida';
    }
}

/**
 * Alternative: Cloud OCR Services Integration
 * Uncomment and configure if you want to use cloud services
 */
class CloudOCRService {
    /**
     * Google Cloud Vision API
     */
    public static function analyzeWithGoogleVision($imagePath, $apiKey) {
        $imageData = base64_encode(file_get_contents($imagePath));
        
        $requestData = [
            'requests' => [
                [
                    'image' => ['content' => $imageData],
                    'features' => [
                        ['type' => 'TEXT_DETECTION', 'maxResults' => 1]
                    ]
                ]
            ]
        ];
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => "https://vision.googleapis.com/v1/images:annotate?key=$apiKey",
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($requestData),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json']
        ]);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        $result = json_decode($response, true);
        
        if (isset($result['responses'][0]['textAnnotations'][0]['description'])) {
            return $result['responses'][0]['textAnnotations'][0]['description'];
        }
        
        return null;
    }
    
    /**
     * Azure Computer Vision API
     */
    public static function analyzeWithAzure($imagePath, $endpoint, $apiKey) {
        $imageData = file_get_contents($imagePath);
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => "$endpoint/vision/v3.2/ocr?language=es",
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $imageData,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/octet-stream',
                "Ocp-Apim-Subscription-Key: $apiKey"
            ]
        ]);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        $result = json_decode($response, true);
        
        // Extract text from regions
        $text = '';
        if (isset($result['regions'])) {
            foreach ($result['regions'] as $region) {
                foreach ($region['lines'] as $line) {
                    foreach ($line['words'] as $word) {
                        $text .= $word['text'] . ' ';
                    }
                    $text .= "\n";
                }
            }
        }
        
        return $text;
    }
}
