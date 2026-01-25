<?php
/**
 * Payment Schedule Generator
 * Convierte datos de póliza extraídos del PDF en calendario de pagos
 */

class PaymentScheduleGenerator {
    
    /**
     * Generar calendario de pagos basado en datos de póliza
     * 
     * @param array $policyData Datos extraídos del PDF
     * @param int $policyId ID de la póliza en BD
     * @param PDO $pdo Conexión a base de datos
     * @return array Resultado de la generación
     */
    public function generateSchedule($policyData, $policyId, $pdo) {
        try {
            // Extraer datos necesarios
            $totalPremium = $policyData['total_premium'] ?? 0;
            $paymentFrequency = $policyData['payment_frequency'] ?? 1; // Default: anual
            $startDate = $policyData['start_date'] ?? date('Y-m-d');
            $paymentDueDay = $policyData['payment_due_day'] ?? null; // Día de vencimiento del PDF
            
            if ($totalPremium <= 0) {
                throw new Exception('Prima total inválida');
            }
            
            // Convertir frecuencia a número de cuotas
            $totalInstallments = $this->getInstallmentCount($paymentFrequency);
            
            // Calcular monto por cuota
            $amountPerInstallment = round($totalPremium / $totalInstallments, 2);
            
            // Generar fechas de vencimiento
            $dueDates = $this->calculateDueDates($startDate, $totalInstallments, $paymentFrequency, $paymentDueDay);
            
            // Insertar registros en payment_schedules
            $created = 0;
            $errors = [];
            
            $stmt = $pdo->prepare("
                INSERT INTO payment_schedules (
                    policy_id, 
                    installment_number, 
                    total_installments, 
                    due_date, 
                    amount_due, 
                    status, 
                    created_at
                ) VALUES (?, ?, ?, ?, ?, 'pending', NOW())
            ");
            
            foreach ($dueDates as $index => $dueDate) {
                try {
                    $installmentNumber = $index + 1;
                    
                    $stmt->execute([
                        $policyId,
                        $installmentNumber,
                        $totalInstallments,
                        $dueDate,
                        $amountPerInstallment
                    ]);
                    
                    $created++;
                } catch (Exception $e) {
                    $errors[] = "Error en cuota $installmentNumber: " . $e->getMessage();
                }
            }
            
            return [
                'success' => true,
                'created' => $created,
                'total_installments' => $totalInstallments,
                'amount_per_installment' => $amountPerInstallment,
                'errors' => $errors
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Convertir frecuencia de pago a número de cuotas
     */
    private function getInstallmentCount($frequency) {
        // Si es numérico, usar directamente
        if (is_numeric($frequency)) {
            return (int)$frequency;
        }
        
        // Si es texto, convertir
        $freq = strtolower($frequency);
        
        if (strpos($freq, 'anual') !== false) return 1;
        if (strpos($freq, 'semestral') !== false) return 2;
        if (strpos($freq, 'trimestral') !== false || strpos($freq, 'cuatrimestral') !== false) return 4;
        if (strpos($freq, 'bimestral') !== false) return 6;
        if (strpos($freq, 'mensual') !== false) return 12;
        
        // Default: anual
        return 1;
    }
    
    /**
     * Calcular fechas de vencimiento según frecuencia
     * 
     * @param string $startDate Fecha de inicio de la póliza
     * @param int $totalInstallments Número de cuotas
     * @param mixed $frequency Frecuencia de pago
     * @param int|null $paymentDueDay Día de vencimiento extraído del PDF (1-31)
     */
    private function calculateDueDates($startDate, $totalInstallments, $frequency, $paymentDueDay = null) {
        $dueDates = [];
        $date = new DateTime($startDate);
        
        // Si no se especificó día de vencimiento, usar el día de la fecha de inicio
        if ($paymentDueDay === null || $paymentDueDay < 1 || $paymentDueDay > 31) {
            $paymentDueDay = (int)$date->format('d');
        }
        
        // Determinar el intervalo según frecuencia
        $interval = $this->getDateInterval($totalInstallments);
        
        for ($i = 0; $i < $totalInstallments; $i++) {
            if ($i > 0) {
                $date->add($interval);
            }
            
            // Ajustar al día de vencimiento especificado
            $year = (int)$date->format('Y');
            $month = (int)$date->format('m');
            
            // Validar que el día existe en ese mes
            $lastDayOfMonth = (int)$date->format('t');
            $actualDay = min($paymentDueDay, $lastDayOfMonth);
            
            $date->setDate($year, $month, $actualDay);
            
            $dueDates[] = $date->format('Y-m-d');
        }
        
        return $dueDates;
    }
    
    /**
     * Obtener intervalo DateInterval según número de cuotas
     */
    private function getDateInterval($totalInstallments) {
        switch ($totalInstallments) {
            case 1:  // Anual
                return new DateInterval('P1Y');
            case 2:  // Semestral
                return new DateInterval('P6M');
            case 4:  // Trimestral
                return new DateInterval('P3M');
            case 6:  // Bimestral
                return new DateInterval('P2M');
            case 12: // Mensual
                return new DateInterval('P1M');
            default:
                // Calcular meses entre pagos
                $months = 12 / $totalInstallments;
                return new DateInterval('P' . round($months) . 'M');
        }
    }
    
    /**
     * Verificar si ya existe un calendario de pagos para la póliza
     */
    public function scheduleExists($policyId, $pdo) {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as count 
            FROM payment_schedules 
            WHERE policy_id = ?
        ");
        $stmt->execute([$policyId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result['count'] > 0;
    }
    
    /**
     * Eliminar calendario de pagos existente
     */
    public function deleteSchedule($policyId, $pdo) {
        $stmt = $pdo->prepare("DELETE FROM payment_schedules WHERE policy_id = ?");
        return $stmt->execute([$policyId]);
    }
    
    /**
     * Regenerar calendario de pagos completo
     */
    public function regenerateSchedule($policyData, $policyId, $pdo) {
        // Eliminar calendario anterior
        $this->deleteSchedule($policyId, $pdo);
        
        // Generar nuevo calendario
        return $this->generateSchedule($policyData, $policyId, $pdo);
    }
}

/**
 * Función helper para uso rápido
 */
function generatePaymentSchedule($policyData, $policyId, $pdo) {
    $generator = new PaymentScheduleGenerator();
    return $generator->generateSchedule($policyData, $policyId, $pdo);
}
