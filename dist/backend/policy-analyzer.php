<?php
/**
 * Policy Document Analyzer
 * Extrae datos de pólizas PDF subidas por agentes broker
 */

class PolicyAnalyzer {
    
    /**
     * Analizar documento de póliza y extraer datos
     */
    public function analyzePolicyDocument($filePath) {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        
        if ($extension === 'pdf') {
            return $this->extractFromPDF($filePath);
        } else if (in_array($extension, ['jpg', 'jpeg', 'png'])) {
            return $this->extractFromImage($filePath);
        }
        
        return [
            'success' => false,
            'error' => 'Formato de archivo no soportado'
        ];
    }
    
    /**
     * Extraer datos de PDF usando parser de texto
     */
    private function extractFromPDF($filePath) {
        try {
            // Extraer texto del PDF
            $text = $this->pdfToText($filePath);
            
            if (!$text) {
                return [
                    'success' => false,
                    'error' => 'No se pudo extraer texto del PDF. Por favor ingresa los datos manualmente.',
                    'manual_entry' => true
                ];
            }
            
            // Extraer datos usando patrones
            $data = $this->extractPolicyData($text);
            
            return [
                'success' => true,
                'data' => $data,
                'raw_text' => $text,
                'confidence' => $this->calculateConfidence($data)
            ];
            
        } catch (Exception $e) {
            error_log("Error analizando PDF: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error al analizar el documento',
                'manual_entry' => true
            ];
        }
    }
    
    /**
     * Convertir PDF a texto
     */
    private function pdfToText($filePath) {
        // Opción 1: Usar pdftotext si está disponible en GoDaddy
        if ($this->commandExists('pdftotext')) {
            $outputFile = sys_get_temp_dir() . '/' . uniqid() . '.txt';
            exec("pdftotext " . escapeshellarg($filePath) . " " . escapeshellarg($outputFile), $output, $returnCode);
            
            if ($returnCode === 0 && file_exists($outputFile)) {
                $text = file_get_contents($outputFile);
                unlink($outputFile);
                return $text;
            }
        }
        
        // Opción 2: Usar biblioteca PHP si está disponible
        // Nota: En GoDaddy shared hosting, puede que no esté disponible
        // En ese caso, se ofrecerá entrada manual
        
        return null;
    }
    
    /**
     * Verificar si un comando está disponible
     */
    private function commandExists($command) {
        $return = shell_exec(sprintf("which %s", escapeshellarg($command)));
        return !empty($return);
    }
    
    /**
     * Extraer datos de la póliza usando patrones de texto
     */
    private function extractPolicyData($text) {
        $data = [
            'policy_number' => null,
            'insurer_name' => null,
            'client_name' => null,
            'start_date' => null,
            'end_date' => null,
            'total_premium' => null,
            'payment_frequency' => null,
            'payment_due_day' => null,
            'coverage_type' => null
        ];
        
        // Patrones comunes para pólizas en español
        $patterns = [
            'policy_number' => [
                '/N[úu]mero de P[óo]liza:?\s*([A-Z0-9\-]+)/i',
                '/P[óo]liza:?\s*([A-Z0-9\-]+)/i',
                '/No\.\s*P[óo]liza:?\s*([A-Z0-9\-]+)/i'
            ],
            'total_premium' => [
                '/Prima Total:?\s*\$?\s*([\d,]+\.?\d*)/i',
                '/Suma Asegurada:?\s*\$?\s*([\d,]+\.?\d*)/i',
                '/Prima Anual:?\s*\$?\s*([\d,]+\.?\d*)/i',
                '/Total:?\s*\$?\s*([\d,]+\.?\d*)/i'
            ],
            'client_name' => [
                '/Asegurado:?\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+)/i',
                '/Contratante:?\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+)/i',
                '/Nombre:?\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+)/i'
            ],
            'start_date' => [
                '/Fecha de Inicio:?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i',
                '/Vigencia desde:?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i',
                '/Inicio:?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i'
            ],
            'end_date' => [
                '/Fecha de Vencimiento:?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i',
                '/Vigencia hasta:?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i',
                '/Vencimiento:?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i'
            ],
            'payment_frequency' => [
                '/Forma de Pago:?\s*(Anual|Semestral|Trimestral|Mensual)/i',
                '/Periodicidad:?\s*(Anual|Semestral|Trimestral|Mensual)/i'
            ],
            'payment_due_day' => [
                '/Vencimiento:?\s*d[íi]a\s*(\d{1,2})/i',
                '/Pago el d[íi]a:?\s*(\d{1,2})/i',
                '/Cuota mensual:?\s*d[íi]a\s*(\d{1,2})/i',
                '/Vence:?\s*d[íi]a\s*(\d{1,2})\s*de\s*cada\s*mes/i',
                '/Fecha de pago:?\s*(\d{1,2})\s*de\s*cada\s*mes/i'
            ]
        ];
        
        // Intentar extraer cada campo
        foreach ($patterns as $field => $fieldPatterns) {
            foreach ($fieldPatterns as $pattern) {
                if (preg_match($pattern, $text, $matches)) {
                    $value = trim($matches[1]);
                    
                    // Limpiar y normalizar
                    if ($field === 'total_premium') {
                        $value = str_replace(',', '', $value);
                        $value = floatval($value);
                    } else if ($field === 'payment_frequency') {
                        $value = $this->normalizeFrequency($value);
                    } else if ($field === 'payment_due_day') {
                        $value = intval($value);
                        // Validar día válido (1-31)
                        if ($value < 1 || $value > 31) {
                            $value = null;
                        }
                    }
                    
                    $data[$field] = $value;
                    break;
                }
            }
        }
        
        // Intentar detectar aseguradora
        $insurers = [
            'AXA', 'GNP', 'Mapfre', 'Seguros Monterrey', 'Qualitas', 
            'BBVA Seguros', 'Metlife', 'Allianz', 'Inbursa', 'Banorte',
            'HDI Seguros', 'Chubb', 'Zurich', 'ANA Seguros'
        ];
        
        foreach ($insurers as $insurer) {
            if (stripos($text, $insurer) !== false) {
                $data['insurer_name'] = $insurer;
                break;
            }
        }
        
        return $data;
    }
    
    /**
     * Normalizar frecuencia de pago a número
     */
    private function normalizeFrequency($frequency) {
        $freq = strtolower($frequency);
        
        if (strpos($freq, 'anual') !== false) return 1;
        if (strpos($freq, 'semestral') !== false) return 2;
        if (strpos($freq, 'trimestral') !== false) return 4;
        if (strpos($freq, 'mensual') !== false) return 12;
        
        return null;
    }
    
    /**
     * Calcular nivel de confianza de la extracción
     */
    private function calculateConfidence($data) {
        $requiredFields = ['policy_number', 'total_premium', 'start_date', 'payment_frequency'];
        $foundFields = 0;
        
        foreach ($requiredFields as $field) {
            if (!empty($data[$field])) {
                $foundFields++;
            }
        }
        
        $confidence = ($foundFields / count($requiredFields)) * 100;
        
        if ($confidence >= 75) return 'high';
        if ($confidence >= 50) return 'medium';
        return 'low';
    }
    
    /**
     * Extraer datos de imagen usando OCR (si disponible)
     */
    private function extractFromImage($filePath) {
        // Opción 1: Tesseract OCR si está disponible
        if ($this->commandExists('tesseract')) {
            $outputFile = sys_get_temp_dir() . '/' . uniqid();
            exec("tesseract " . escapeshellarg($filePath) . " " . escapeshellarg($outputFile) . " -l spa", $output, $returnCode);
            
            if ($returnCode === 0 && file_exists($outputFile . '.txt')) {
                $text = file_get_contents($outputFile . '.txt');
                unlink($outputFile . '.txt');
                
                $data = $this->extractPolicyData($text);
                
                return [
                    'success' => true,
                    'data' => $data,
                    'raw_text' => $text,
                    'confidence' => $this->calculateConfidence($data)
                ];
            }
        }
        
        // Si no hay OCR disponible, solicitar entrada manual
        return [
            'success' => false,
            'error' => 'OCR no disponible. Por favor sube un PDF o ingresa los datos manualmente.',
            'manual_entry' => true
        ];
    }
    
    /**
     * Validar datos extraídos
     */
    public function validateExtractedData($data) {
        $errors = [];
        
        if (empty($data['policy_number'])) {
            $errors[] = 'Número de póliza no encontrado';
        }
        
        if (empty($data['total_premium']) || $data['total_premium'] <= 0) {
            $errors[] = 'Prima total no encontrada o inválida';
        }
        
        if (empty($data['payment_frequency'])) {
            $errors[] = 'Frecuencia de pago no encontrada';
        }
        
        if (empty($data['start_date'])) {
            $errors[] = 'Fecha de inicio no encontrada';
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
}
