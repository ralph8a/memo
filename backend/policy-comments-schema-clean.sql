-- =====================================================
-- SCHEMA: Comentarios de pólizas y comprobantes de pago
-- Para sistema de notificaciones contextual
-- =====================================================

-- Tabla de comentarios en pólizas (bidireccional cliente-agente)
CREATE TABLE IF NOT EXISTS policy_comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    created_by VARCHAR(100) NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read_by_client BOOLEAN DEFAULT FALSE,
    is_read_by_agent BOOLEAN DEFAULT FALSE,
    INDEX idx_policy_id (policy_id),
    INDEX idx_created_by (created_by),
    INDEX idx_client_read (is_read_by_client),
    INDEX idx_agent_read (is_read_by_agent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de comprobantes de pago
CREATE TABLE IF NOT EXISTS payment_proofs (
    proof_id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    schedule_id INT NULL,
    uploaded_by INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    reference_number VARCHAR(100) NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    review_notes TEXT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_notified BOOLEAN DEFAULT FALSE,
    INDEX idx_policy_id (policy_id),
    INDEX idx_schedule_id (schedule_id),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_status (status),
    INDEX idx_notified (is_notified),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar si payment_schedules necesita columna status
-- (Solo agregar si no existe)
SET @sql = CONCAT('
    ALTER TABLE payment_schedules 
    ADD COLUMN status ENUM(''pending'', ''paid'', ''overdue'', ''cancelled'') DEFAULT ''pending'' AFTER amount
');

SET @has_column = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'payment_schedules'
    AND COLUMN_NAME = 'status'
);

-- Solo ejecutar si no existe la columna
SET @sql = IF(@has_column > 0, 'SELECT "Column status already exists"', @sql);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar índice si no existe
CREATE INDEX IF NOT EXISTS idx_status ON payment_schedules(status);
