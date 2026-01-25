-- =====================================================
-- SCHEMA: Direct Messages (Mensajes Directos Temporales)
-- Solo agentes pueden iniciar, clientes solo responder
-- Expiran automáticamente después de 42 horas
-- =====================================================

CREATE TABLE IF NOT EXISTS direct_messages (
    dm_id INT AUTO_INCREMENT PRIMARY KEY,
    thread_id VARCHAR(50) NOT NULL,
    agent_id INT NOT NULL,
    client_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_type ENUM('agent', 'client') NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    
    INDEX idx_thread_id (thread_id),
    INDEX idx_agent_id (agent_id),
    INDEX idx_client_id (client_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_created_at (created_at),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para rastrear threads activos
CREATE TABLE IF NOT EXISTS direct_message_threads (
    thread_id VARCHAR(50) PRIMARY KEY,
    agent_id INT NOT NULL,
    client_id INT NOT NULL,
    subject VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    status ENUM('active', 'expired') DEFAULT 'active',
    
    INDEX idx_agent_id (agent_id),
    INDEX idx_client_id (client_id),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at),
    UNIQUE KEY unique_agent_client (agent_id, client_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
