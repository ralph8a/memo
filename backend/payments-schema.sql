-- ============================================
-- SISTEMA DE SEGUIMIENTO DE PAGOS DE PÓLIZAS
-- Optimizado para GoDaddy Shared Hosting
-- ============================================

-- Tabla: payment_schedules
-- Calendario de pagos fraccionados por póliza
CREATE TABLE IF NOT EXISTS payment_schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    installment_number TINYINT NOT NULL COMMENT '1-12 según fraccionamiento',
    total_installments TINYINT NOT NULL COMMENT '1=anual, 2=semestral, 4=trimestral, 12=mensual',
    due_date DATE NOT NULL,
    amount_due DECIMAL(10, 2) NOT NULL,
    status ENUM(
        'pending',
        'payment_attempted',
        'payment_rejected',
        'awaiting_proof',
        'in_review',
        'paid',
        'liquidated'
    ) DEFAULT 'pending',
    grace_period_end DATE NULL COMMENT 'Fecha límite con gracia',
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_policy (policy_id),
    INDEX idx_due_date (due_date),
    INDEX idx_status (status),
    INDEX idx_notification (notification_sent, due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: payment_proofs
-- Comprobantes de pago subidos por clientes
CREATE TABLE IF NOT EXISTS payment_proofs (
    proof_id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    policy_id INT NOT NULL,
    client_id INT NOT NULL,
    upload_date DATETIME NOT NULL,
    file_path VARCHAR(255) NOT NULL COMMENT 'Ruta relativa desde /uploads/proofs/',
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(10) NOT NULL COMMENT 'pdf, jpg, png',
    file_size INT NOT NULL COMMENT 'En bytes',
    status ENUM('pending_review', 'approved', 'rejected') DEFAULT 'pending_review',
    reviewed_by INT NULL COMMENT 'agent_id que revisó',
    review_date DATETIME NULL,
    review_notes TEXT NULL,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_schedule (schedule_id),
    INDEX idx_policy (policy_id),
    INDEX idx_client (client_id),
    INDEX idx_status (status),
    INDEX idx_review (reviewed_by, review_date),
    
    FOREIGN KEY (schedule_id) REFERENCES payment_schedules(schedule_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: policy_comments
-- Sistema de comunicación cliente-agente por póliza
CREATE TABLE IF NOT EXISTS policy_comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    schedule_id INT NULL COMMENT 'NULL = comentario general de póliza',
    author_type ENUM('client', 'agent', 'system') NOT NULL,
    author_id INT NOT NULL COMMENT 'client_id o agent_id',
    comment_text TEXT NOT NULL,
    attachments JSON NULL COMMENT 'Array de URLs de archivos adjuntos',
    is_internal BOOLEAN DEFAULT FALSE COMMENT 'Solo visible para agentes',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_policy (policy_id),
    INDEX idx_schedule (schedule_id),
    INDEX idx_author (author_type, author_id),
    INDEX idx_unread (is_read, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: payment_notifications
-- Historial de notificaciones enviadas
CREATE TABLE IF NOT EXISTS payment_notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    policy_id INT NOT NULL,
    client_id INT NOT NULL,
    notification_type ENUM(
        'upcoming_due',
        'payment_rejected',
        'proof_uploaded',
        'proof_approved',
        'proof_rejected',
        'payment_confirmed',
        'payment_overdue'
    ) NOT NULL,
    notification_channel ENUM('in_app', 'email', 'whatsapp') NOT NULL,
    sent_at DATETIME NOT NULL,
    read_at DATETIME NULL,
    clicked_at DATETIME NULL,
    notification_data JSON NULL COMMENT 'Metadata adicional',
    
    INDEX idx_schedule (schedule_id),
    INDEX idx_client (client_id),
    INDEX idx_type (notification_type),
    INDEX idx_unread (client_id, read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: insurer_invoices
-- Facturas generadas por la aseguradora
CREATE TABLE IF NOT EXISTS insurer_invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    policy_id INT NOT NULL,
    invoice_number VARCHAR(100) NOT NULL COMMENT 'Folio de la aseguradora',
    invoice_date DATE NOT NULL,
    file_path VARCHAR(255) NOT NULL COMMENT 'Ruta desde /uploads/invoices/',
    file_name VARCHAR(255) NOT NULL,
    sent_to_client BOOLEAN DEFAULT FALSE,
    sent_date DATETIME NULL,
    uploaded_by INT NOT NULL COMMENT 'agent_id',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_schedule (schedule_id),
    INDEX idx_policy (policy_id),
    INDEX idx_invoice_number (invoice_number),
    
    FOREIGN KEY (schedule_id) REFERENCES payment_schedules(schedule_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: payment_audit_log
-- Registro de todos los cambios de estado para auditoría
CREATE TABLE IF NOT EXISTS payment_audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL COMMENT 'status_change, proof_uploaded, invoice_sent, etc',
    old_value VARCHAR(100) NULL,
    new_value VARCHAR(100) NULL,
    performed_by_type ENUM('client', 'agent', 'system') NOT NULL,
    performed_by_id INT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_schedule (schedule_id),
    INDEX idx_action (action_type),
    INDEX idx_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PROCEDIMIENTOS ALMACENADOS (Optimización)
-- ============================================

DELIMITER //

-- Generar calendario de pagos al crear póliza
CREATE PROCEDURE IF NOT EXISTS sp_generate_payment_schedule(
    IN p_policy_id INT,
    IN p_total_premium DECIMAL(10,2),
    IN p_payment_frequency ENUM('annual', 'semiannual', 'quarterly', 'monthly'),
    IN p_start_date DATE
)
BEGIN
    DECLARE v_installments INT;
    DECLARE v_amount_per_installment DECIMAL(10,2);
    DECLARE v_months_per_installment INT;
    DECLARE v_counter INT DEFAULT 1;
    DECLARE v_due_date DATE;
    
    -- Determinar número de cuotas
    CASE p_payment_frequency
        WHEN 'annual' THEN SET v_installments = 1, v_months_per_installment = 12;
        WHEN 'semiannual' THEN SET v_installments = 2, v_months_per_installment = 6;
        WHEN 'quarterly' THEN SET v_installments = 4, v_months_per_installment = 3;
        WHEN 'monthly' THEN SET v_installments = 12, v_months_per_installment = 1;
    END CASE;
    
    SET v_amount_per_installment = p_total_premium / v_installments;
    
    -- Generar cuotas
    WHILE v_counter <= v_installments DO
        SET v_due_date = DATE_ADD(p_start_date, INTERVAL (v_counter - 1) * v_months_per_installment MONTH);
        
        INSERT INTO payment_schedules (
            policy_id,
            installment_number,
            total_installments,
            due_date,
            amount_due,
            grace_period_end,
            status
        ) VALUES (
            p_policy_id,
            v_counter,
            v_installments,
            v_due_date,
            v_amount_per_installment,
            DATE_ADD(v_due_date, INTERVAL 5 DAY), -- 5 días de gracia
            'pending'
        );
        
        SET v_counter = v_counter + 1;
    END WHILE;
END//

-- Obtener pagos próximos a vencer (para cron job)
CREATE PROCEDURE IF NOT EXISTS sp_get_upcoming_due_payments(
    IN p_days_ahead INT
)
BEGIN
    SELECT 
        ps.*,
        p.policy_number,
        p.policy_type,
        p.payment_frequency,
        c.client_id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        a.agent_id,
        a.first_name AS agent_first_name,
        a.last_name AS agent_last_name,
        a.email AS agent_email,
        DATEDIFF(ps.due_date, CURDATE()) AS days_until_due
    FROM payment_schedules ps
    INNER JOIN policies p ON ps.policy_id = p.policy_id
    INNER JOIN clients c ON p.client_id = c.client_id
    INNER JOIN agents a ON p.agent_id = a.agent_id
    WHERE ps.status = 'pending'
        AND ps.notification_sent = FALSE
        AND ps.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL p_days_ahead DAY)
    ORDER BY ps.due_date ASC;
END//

-- Obtener pagos vencidos
CREATE PROCEDURE IF NOT EXISTS sp_get_overdue_payments()
BEGIN
    SELECT 
        ps.*,
        p.policy_number,
        c.client_id,
        c.first_name,
        c.last_name,
        c.email,
        DATEDIFF(CURDATE(), ps.due_date) AS days_overdue
    FROM payment_schedules ps
    INNER JOIN policies p ON ps.policy_id = p.policy_id
    INNER JOIN clients c ON p.client_id = c.client_id
    WHERE ps.status IN ('pending', 'awaiting_proof')
        AND ps.due_date < CURDATE()
    ORDER BY ps.due_date ASC;
END//

-- Obtener comprobantes pendientes de revisión (para agentes)
CREATE PROCEDURE IF NOT EXISTS sp_get_pending_proof_reviews(
    IN p_agent_id INT
)
BEGIN
    SELECT 
        pp.*,
        ps.due_date,
        ps.amount_due,
        ps.installment_number,
        ps.total_installments,
        p.policy_number,
        p.policy_type,
        p.payment_frequency,
        c.client_id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        COUNT(pc.comment_id) AS comment_count
    FROM payment_proofs pp
    INNER JOIN payment_schedules ps ON pp.schedule_id = ps.schedule_id
    INNER JOIN policies p ON pp.policy_id = p.policy_id
    INNER JOIN clients c ON p.client_id = c.client_id
    LEFT JOIN policy_comments pc ON p.policy_id = pc.policy_id AND pc.schedule_id = ps.schedule_id
    WHERE pp.status = 'pending_review'
        AND p.agent_id = p_agent_id
    GROUP BY pp.proof_id
    ORDER BY pp.upload_date ASC;
END//

DELIMITER ;

-- ============================================
-- DATOS DE EJEMPLO / TESTING
-- ============================================

-- Insertar calendario de pagos de ejemplo para póliza mensual
-- CALL sp_generate_payment_schedule(1, 5400.00, 'monthly', '2026-01-01');

-- Insertar calendario de pagos de ejemplo para póliza trimestral
-- CALL sp_generate_payment_schedule(2, 3600.00, 'quarterly', '2026-01-01');
