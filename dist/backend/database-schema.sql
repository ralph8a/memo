-- Krause Insurance - Database Schema
-- Execute this in cPanel phpMyAdmin

-- Create database (if not exists)
-- CREATE DATABASE IF NOT EXISTS krause_insurance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE krause_insurance;

-- Users Table (agents and clients)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('admin', 'agent', 'client') NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    region VARCHAR(100),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Policies Table
CREATE TABLE IF NOT EXISTS policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_number VARCHAR(50) UNIQUE NOT NULL,
    client_id INT NOT NULL,
    agent_id INT,
    policy_type ENUM('auto', 'home', 'life', 'business', 'health', 'other') NOT NULL,
    status ENUM('active', 'pending', 'expired', 'cancelled') DEFAULT 'pending',
    premium_amount DECIMAL(10, 2) NOT NULL,
    coverage_amount DECIMAL(12, 2),
    start_date DATE NOT NULL,
    end_date DATE,
    renewal_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_policy_number (policy_number),
    INDEX idx_client_id (client_id),
    INDEX idx_agent_id (agent_id),
    INDEX idx_status (status),
    INDEX idx_policy_type (policy_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Claims Table
CREATE TABLE IF NOT EXISTS claims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    policy_id INT NOT NULL,
    client_id INT NOT NULL,
    assigned_agent_id INT,
    claim_type VARCHAR(100) NOT NULL,
    status ENUM('submitted', 'under_review', 'approved', 'rejected', 'paid') DEFAULT 'submitted',
    claim_amount DECIMAL(10, 2) NOT NULL,
    approved_amount DECIMAL(10, 2),
    incident_date DATE NOT NULL,
    description TEXT,
    resolution_notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_agent_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_claim_number (claim_number),
    INDEX idx_policy_id (policy_id),
    INDEX idx_client_id (client_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Questionnaires/Roadmap Table
CREATE TABLE IF NOT EXISTS questionnaires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    agent_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'sent', 'completed', 'expired') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_client_id (client_id),
    INDEX idx_agent_id (agent_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    policy_id INT,
    claim_id INT,
    document_type ENUM('policy_doc', 'claim_doc', 'payment_receipt', 'id_proof', 'other') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_policy_id (policy_id),
    INDEX idx_claim_id (claim_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    client_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('card', 'bank_transfer', 'check', 'cash', 'other') NOT NULL,
    transaction_id VARCHAR(100),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_policy_id (policy_id),
    INDEX idx_client_id (client_id),
    INDEX idx_status (status),
    INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Log Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_type ENUM('email', 'sms', 'push', 'in_app') NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('pending', 'sent', 'failed', 'read') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_notification_type (notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quotes Table
CREATE TABLE IF NOT EXISTS quotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    quote_type VARCHAR(100) NOT NULL,
    coverage_details TEXT,
    status ENUM('new', 'contacted', 'converted', 'declined') DEFAULT 'new',
    assigned_agent_id INT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    contacted_at TIMESTAMP NULL,
    FOREIGN KEY (assigned_agent_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: Admin123!)
-- Password hash generated using PHP password_hash('Admin123!', PASSWORD_DEFAULT)
INSERT INTO users (email, password_hash, user_type, first_name, last_name, phone, region, status) VALUES
('admin@ksinsurancee.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Admin', 'System', '+1-555-000-0000', 'HQ', 'active'),
('guillermo.krause@ksinsurancee.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', 'Guillermo', 'Krause', '+1-555-123-4567', 'North', 'active')
ON DUPLICATE KEY UPDATE email=email;

-- Insert sample agent
INSERT INTO users (email, password_hash, user_type, first_name, last_name, phone, region, status) VALUES
('agent.one@ksinsurancee.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', 'Agent', 'One', '+1-555-000-0001', 'South', 'active')
ON DUPLICATE KEY UPDATE email=email;

-- Insert sample client
INSERT INTO users (email, password_hash, user_type, first_name, last_name, phone, status) VALUES
('client.test@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'Test', 'Client', '+1-555-999-8888', 'active')
ON DUPLICATE KEY UPDATE email=email;

-- ============================================
-- TABLAS COMPLEMENTARIAS
-- ============================================

-- Clients Extended Info Table
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    tax_id VARCHAR(50),
    client_segment ENUM('premium', 'standard', 'basic') DEFAULT 'standard',
    risk_score INT DEFAULT 50,
    preferred_language VARCHAR(10) DEFAULT 'es',
    marketing_consent BOOLEAN DEFAULT FALSE,
    referral_source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_client_segment (client_segment)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agents Extended Info Table
CREATE TABLE IF NOT EXISTS agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    license_number VARCHAR(50),
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    specialization TEXT,
    territory VARCHAR(100),
    active_clients_count INT DEFAULT 0,
    total_policies_sold INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Coverages Table
CREATE TABLE IF NOT EXISTS coverages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    coverage_type VARCHAR(100) NOT NULL,
    coverage_amount DECIMAL(12,2) NOT NULL,
    deductible DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    INDEX idx_policy_id (policy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Beneficiaries Table
CREATE TABLE IF NOT EXISTS beneficiaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(50),
    percentage DECIMAL(5,2) DEFAULT 100.00,
    date_of_birth DATE,
    identification VARCHAR(50),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    INDEX idx_policy_id (policy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Commissions Table
CREATE TABLE IF NOT EXISTS commissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT NOT NULL,
    policy_id INT NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    payment_status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    INDEX idx_agent_id (agent_id),
    INDEX idx_policy_id (policy_id),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Renewals Table
CREATE TABLE IF NOT EXISTS renewals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    previous_policy_number VARCHAR(50),
    renewal_date DATE NOT NULL,
    new_premium DECIMAL(10,2),
    status ENUM('pending', 'completed', 'declined') DEFAULT 'pending',
    notes TEXT,
    processed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_policy_id (policy_id),
    INDEX idx_status (status),
    INDEX idx_renewal_date (renewal_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS DUMMY PARA TESTING
-- ============================================

-- Insert dummy clients
INSERT INTO users (email, password_hash, user_type, first_name, last_name, phone, region, status) VALUES
('maria.garcia@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'María', 'García', '+52-555-1234-567', 'CDMX', 'active'),
('juan.martinez@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'Juan', 'Martínez', '+52-555-2345-678', 'Monterrey', 'active'),
('ana.lopez@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'Ana', 'López', '+52-555-3456-789', 'Guadalajara', 'active'),
('carlos.rodriguez@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'Carlos', 'Rodríguez', '+52-555-4567-890', 'CDMX', 'active'),
('laura.hernandez@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'Laura', 'Hernández', '+52-555-5678-901', 'Puebla', 'active')
ON DUPLICATE KEY UPDATE email=email;

-- Insert dummy agents
INSERT INTO users (email, password_hash, user_type, first_name, last_name, phone, region, status) VALUES
('sofia.torres@ksinsurancee.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', 'Sofía', 'Torres', '+52-555-111-2222', 'CDMX', 'active'),
('ricardo.gomez@ksinsurancee.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', 'Ricardo', 'Gómez', '+52-555-333-4444', 'Monterrey', 'active')
ON DUPLICATE KEY UPDATE email=email;

-- Insert extended client info
INSERT INTO clients (user_id, date_of_birth, address, city, state, zip_code, tax_id, client_segment, risk_score, referral_source) VALUES
((SELECT id FROM users WHERE email = 'maria.garcia@example.com'), '1985-03-15', 'Av. Insurgentes Sur 1234', 'Ciudad de México', 'CDMX', '03100', 'GARM850315XXX', 'premium', 75, 'Referido'),
((SELECT id FROM users WHERE email = 'juan.martinez@example.com'), '1990-07-22', 'Calle Morelos 567', 'Monterrey', 'Nuevo León', '64000', 'MAJO900722XXX', 'standard', 60, 'Google Ads'),
((SELECT id FROM users WHERE email = 'ana.lopez@example.com'), '1988-11-30', 'Av. Vallarta 890', 'Guadalajara', 'Jalisco', '44100', 'LOAN881130XXX', 'premium', 80, 'Referido'),
((SELECT id FROM users WHERE email = 'carlos.rodriguez@example.com'), '1992-05-10', 'Paseo de la Reforma 2345', 'Ciudad de México', 'CDMX', '06600', 'ROCA920510XXX', 'basic', 45, 'Facebook'),
((SELECT id FROM users WHERE email = 'laura.hernandez@example.com'), '1987-09-18', 'Calle 16 de Septiembre 123', 'Puebla', 'Puebla', '72000', 'HELO870918XXX', 'standard', 55, 'Web Orgánico')
ON DUPLICATE KEY UPDATE user_id=user_id;

-- Insert extended agent info
INSERT INTO agents (user_id, license_number, commission_rate, specialization, territory, active_clients_count, total_policies_sold) VALUES
((SELECT id FROM users WHERE email = 'guillermo.krause@ksinsurancee.com'), 'AG-2024-001', 12.50, 'Seguros corporativos, Vida', 'Nacional', 15, 45),
((SELECT id FROM users WHERE email = 'agent.one@ksinsurancee.com'), 'AG-2024-002', 10.00, 'Seguros de auto, Hogar', 'Sur', 8, 22),
((SELECT id FROM users WHERE email = 'sofia.torres@ksinsurancee.com'), 'AG-2024-003', 11.00, 'Seguros de salud, Vida', 'CDMX', 12, 35),
((SELECT id FROM users WHERE email = 'ricardo.gomez@ksinsurancee.com'), 'AG-2024-004', 10.50, 'Seguros de auto, Comercial', 'Norte', 10, 28)
ON DUPLICATE KEY UPDATE user_id=user_id;

-- Insert dummy policies
INSERT INTO policies (policy_number, client_id, agent_id, policy_type, status, premium_amount, coverage_amount, start_date, end_date, renewal_date) VALUES
('POL-2024-001', (SELECT id FROM users WHERE email = 'maria.garcia@example.com'), (SELECT id FROM users WHERE email = 'guillermo.krause@ksinsurancee.com'), 'auto', 'active', 450.00, 50000.00, '2024-01-15', '2025-01-15', '2024-12-15'),
('POL-2024-002', (SELECT id FROM users WHERE email = 'maria.garcia@example.com'), (SELECT id FROM users WHERE email = 'guillermo.krause@ksinsurancee.com'), 'home', 'active', 280.00, 150000.00, '2024-02-01', '2025-02-01', '2025-01-01'),
('POL-2024-003', (SELECT id FROM users WHERE email = 'juan.martinez@example.com'), (SELECT id FROM users WHERE email = 'sofia.torres@ksinsurancee.com'), 'life', 'active', 180.00, 500000.00, '2024-03-10', '2025-03-10', '2025-02-10'),
('POL-2024-004', (SELECT id FROM users WHERE email = 'ana.lopez@example.com'), (SELECT id FROM users WHERE email = 'sofia.torres@ksinsurancee.com'), 'health', 'active', 520.00, 100000.00, '2024-01-20', '2025-01-20', '2024-12-20'),
('POL-2024-005', (SELECT id FROM users WHERE email = 'carlos.rodriguez@example.com'), (SELECT id FROM users WHERE email = 'ricardo.gomez@ksinsurancee.com'), 'auto', 'active', 380.00, 40000.00, '2024-04-05', '2025-04-05', '2025-03-05'),
('POL-2024-006', (SELECT id FROM users WHERE email = 'laura.hernandez@example.com'), (SELECT id FROM users WHERE email = 'agent.one@ksinsurancee.com'), 'home', 'pending', 310.00, 120000.00, '2024-06-01', '2025-06-01', '2025-05-01')
ON DUPLICATE KEY UPDATE policy_number=policy_number;

-- Insert dummy payments
INSERT INTO payments (policy_id, client_id, amount, payment_method, transaction_id, status, payment_date, notes) VALUES
((SELECT id FROM policies WHERE policy_number = 'POL-2024-001'), (SELECT id FROM users WHERE email = 'maria.garcia@example.com'), 450.00, 'card', 'TXN-2024-0001', 'completed', '2024-01-15 10:30:00', 'Pago mensual'),
((SELECT id FROM policies WHERE policy_number = 'POL-2024-001'), (SELECT id FROM users WHERE email = 'maria.garcia@example.com'), 450.00, 'card', 'TXN-2024-0045', 'completed', '2024-02-15 11:20:00', 'Pago mensual'),
((SELECT id FROM policies WHERE policy_number = 'POL-2024-002'), (SELECT id FROM users WHERE email = 'maria.garcia@example.com'), 280.00, 'bank_transfer', 'TXN-2024-0002', 'completed', '2024-02-01 09:15:00', 'Pago mensual'),
((SELECT id FROM policies WHERE policy_number = 'POL-2024-003'), (SELECT id FROM users WHERE email = 'juan.martinez@example.com'), 180.00, 'card', 'TXN-2024-0003', 'completed', '2024-03-10 14:45:00', 'Pago mensual'),
((SELECT id FROM policies WHERE policy_number = 'POL-2024-004'), (SELECT id FROM users WHERE email = 'ana.lopez@example.com'), 520.00, 'bank_transfer', 'TXN-2024-0004', 'completed', '2024-01-20 16:30:00', 'Pago mensual'),
((SELECT id FROM policies WHERE policy_number = 'POL-2024-005'), (SELECT id FROM users WHERE email = 'carlos.rodriguez@example.com'), 380.00, 'card', 'TXN-2024-0005', 'pending', '2024-04-05 12:00:00', 'Pago pendiente')
ON DUPLICATE KEY UPDATE transaction_id=transaction_id;

-- Insert dummy claims
INSERT INTO claims (claim_number, policy_id, client_id, assigned_agent_id, claim_type, status, claim_amount, approved_amount, incident_date, description) VALUES
('CLM-2024-001', (SELECT id FROM policies WHERE policy_number = 'POL-2024-001'), (SELECT id FROM users WHERE email = 'maria.garcia@example.com'), (SELECT id FROM users WHERE email = 'guillermo.krause@ksinsurancee.com'), 'Accidente vehicular', 'approved', 15000.00, 14500.00, '2024-05-15', 'Colisión en intersección, daños en parte frontal del vehículo'),
('CLM-2024-002', (SELECT id FROM policies WHERE policy_number = 'POL-2024-002'), (SELECT id FROM users WHERE email = 'maria.garcia@example.com'), (SELECT id FROM users WHERE email = 'guillermo.krause@ksinsurancee.com'), 'Daño por agua', 'under_review', 8000.00, NULL, '2024-06-20', 'Fuga de tubería en segundo piso'),
('CLM-2024-003', (SELECT id FROM policies WHERE policy_number = 'POL-2024-004'), (SELECT id FROM users WHERE email = 'ana.lopez@example.com'), (SELECT id FROM users WHERE email = 'sofia.torres@ksinsurancee.com'), 'Gastos médicos', 'paid', 3500.00, 3500.00, '2024-04-10', 'Cirugía de emergencia')
ON DUPLICATE KEY UPDATE claim_number=claim_number;

-- Insert dummy quotes
INSERT INTO quotes (email, first_name, last_name, phone, quote_type, coverage_details, status, assigned_agent_id) VALUES
('nuevo.cliente1@example.com', 'Pedro', 'Sánchez', '+52-555-777-8888', 'auto', 'Sedán 2022, uso particular', 'new', NULL),
('nuevo.cliente2@example.com', 'Isabel', 'Fernández', '+52-555-888-9999', 'home', 'Casa 120m2, zona residencial', 'contacted', (SELECT id FROM users WHERE email = 'sofia.torres@ksinsurancee.com')),
('nuevo.cliente3@example.com', 'Roberto', 'Díaz', '+52-555-999-0000', 'life', 'Cobertura familiar, 3 dependientes', 'new', NULL)
ON DUPLICATE KEY UPDATE email=email;

-- Insert dummy coverages
INSERT INTO coverages (policy_id, coverage_type, coverage_amount, deductible, description, is_active) VALUES
((SELECT id FROM policies WHERE policy_number = 'POL-2024-001'), 'Responsabilidad Civil', 30000.00, 1000.00, 'Cobertura de daños a terceros', TRUE),
((SELECT id FROM policies WHERE policy_number = 'POL-2024-001'), 'Daños Materiales', 20000.00, 2000.00, 'Cobertura de daños al vehículo asegurado', TRUE),
((SELECT id FROM policies WHERE policy_number = 'POL-2024-002'), 'Daños Estructurales', 100000.00, 5000.00, 'Cobertura de daños a la estructura del inmueble', TRUE),
((SELECT id FROM policies WHERE policy_number = 'POL-2024-002'), 'Robo', 50000.00, 2500.00, 'Cobertura por robo de contenidos', TRUE)
ON DUPLICATE KEY UPDATE policy_id=policy_id;

-- Insert dummy beneficiaries
INSERT INTO beneficiaries (policy_id, full_name, relationship, percentage, date_of_birth, identification) VALUES
((SELECT id FROM policies WHERE policy_number = 'POL-2024-003'), 'Rosa Martínez Pérez', 'Esposa', 50.00, '1992-08-15', 'MAPR920815XXX'),
((SELECT id FROM policies WHERE policy_number = 'POL-2024-003'), 'Luis Martínez Pérez', 'Hijo', 25.00, '2015-03-20', NULL),
((SELECT id FROM policies WHERE policy_number = 'POL-2024-003'), 'Carmen Martínez Pérez', 'Hija', 25.00, '2017-11-10', NULL)
ON DUPLICATE KEY UPDATE policy_id=policy_id;

-- Insert dummy commissions
INSERT INTO commissions (agent_id, policy_id, commission_amount, commission_rate, period_start, period_end, payment_status) VALUES
((SELECT id FROM users WHERE email = 'guillermo.krause@ksinsurancee.com'), (SELECT id FROM policies WHERE policy_number = 'POL-2024-001'), 56.25, 12.50, '2024-01-01', '2024-01-31', 'paid'),
((SELECT id FROM users WHERE email = 'guillermo.krause@ksinsurancee.com'), (SELECT id FROM policies WHERE policy_number = 'POL-2024-002'), 35.00, 12.50, '2024-02-01', '2024-02-29', 'paid'),
((SELECT id FROM users WHERE email = 'sofia.torres@ksinsurancee.com'), (SELECT id FROM policies WHERE policy_number = 'POL-2024-003'), 19.80, 11.00, '2024-03-01', '2024-03-31', 'pending')
ON DUPLICATE KEY UPDATE agent_id=agent_id;

-- Insert dummy documents
INSERT INTO documents (user_id, policy_id, document_type, file_name, file_path, file_size, mime_type) VALUES
((SELECT id FROM users WHERE email = 'maria.garcia@example.com'), (SELECT id FROM policies WHERE policy_number = 'POL-2024-001'), 'policy_doc', 'poliza_auto_2024.pdf', '/uploads/policies/poliza_auto_2024.pdf', 524288, 'application/pdf'),
((SELECT id FROM users WHERE email = 'maria.garcia@example.com'), (SELECT id FROM policies WHERE policy_number = 'POL-2024-002'), 'policy_doc', 'poliza_hogar_2024.pdf', '/uploads/policies/poliza_hogar_2024.pdf', 612345, 'application/pdf')
ON DUPLICATE KEY UPDATE user_id=user_id;

-- Insert activity logs
INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, ip_address) VALUES
((SELECT id FROM users WHERE email = 'maria.garcia@example.com'), 'login', 'user', (SELECT id FROM users WHERE email = 'maria.garcia@example.com'), 'Usuario inició sesión', '192.168.1.100'),
((SELECT id FROM users WHERE email = 'guillermo.krause@ksinsurancee.com'), 'claim_approved', 'claim', (SELECT id FROM claims WHERE claim_number = 'CLM-2024-001'), 'Reclamación aprobada por agente', '192.168.1.50'),
((SELECT id FROM users WHERE email = 'admin@ksinsurancee.com'), 'policy_created', 'policy', (SELECT id FROM policies WHERE policy_number = 'POL-2024-001'), 'Nueva póliza creada', '192.168.1.10')
ON DUPLICATE KEY UPDATE user_id=user_id;
