-- Schema para sistema de comentarios en pólizas y notificaciones contextuales

-- Tabla de comentarios en pólizas
CREATE TABLE IF NOT EXISTS policy_comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    created_by VARCHAR(50) NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read_by_client BOOLEAN DEFAULT FALSE,
    is_read_by_agent BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    INDEX idx_policy (policy_id),
    INDEX idx_created_at (created_at),
    INDEX idx_unread_client (is_read_by_client),
    INDEX idx_unread_agent (is_read_by_agent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de comprobantes de pago
CREATE TABLE IF NOT EXISTS payment_proofs (
    proof_id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    schedule_id INT,
    uploaded_by VARCHAR(50) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2),
    payment_date DATE,
    reference_number VARCHAR(100),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by VARCHAR(50),
    review_notes TEXT,
    is_notified BOOLEAN DEFAULT FALSE,
    extracted_data JSON,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES payment_schedules(schedule_id) ON DELETE SET NULL,
    INDEX idx_policy (policy_id),
    INDEX idx_status (status),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar columnas a payment_schedules si no existen
ALTER TABLE payment_schedules 
ADD COLUMN IF NOT EXISTS status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
ADD INDEX IF NOT EXISTS idx_status (status);

-- Insertar datos de ejemplo para pruebas
-- Comentario del agente en póliza de María García
INSERT INTO policy_comments (policy_id, created_by, comment_text, is_read_by_client)
SELECT 
    p.id,
    'agent-001',
    'Hola María, he revisado tu póliza y todo está en orden. La renovación se procesará automáticamente el próximo mes. Si tienes alguna pregunta, no dudes en contactarme.',
    FALSE
FROM policies p
INNER JOIN clients c ON p.client_id = c.id
WHERE c.email = 'maria.garcia@example.com'
LIMIT 1;

-- Comentario del cliente en respuesta
INSERT INTO policy_comments (policy_id, created_by, comment_text, is_read_by_agent)
SELECT 
    p.id,
    c.id,
    'Gracias por la información. ¿Podría cambiar la fecha de pago mensual del día 15 al día 5?',
    FALSE
FROM policies p
INNER JOIN clients c ON p.client_id = c.id
WHERE c.email = 'maria.garcia@example.com'
LIMIT 1;

-- Comprobante de pago pendiente de revisión
INSERT INTO payment_proofs (policy_id, schedule_id, uploaded_by, file_path, amount, payment_date, reference_number, status)
SELECT 
    p.id,
    ps.schedule_id,
    c.id,
    '/uploads/proofs/proof_20260114_001.pdf',
    ps.amount,
    CURDATE(),
    'REF123456',
    'pending'
FROM policies p
INNER JOIN clients c ON p.client_id = c.id
INNER JOIN payment_schedules ps ON p.id = ps.policy_id
WHERE c.email = 'maria.garcia@example.com'
AND ps.status = 'pending'
LIMIT 1;
