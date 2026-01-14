-- Script SQL para BROKER - Solo registro de pólizas, SIN sistema de pagos
-- Como intermediario, solo guardamos la póliza y datos del cliente

-- 1. CREAR CLIENTE (si no existe)
INSERT INTO users (email, password_hash, user_type, first_name, last_name, phone, region, status, created_at)
VALUES (
    'maria.garcia@example.com',
    '$2b$10$gBzu2evP4sXTLEKqo8pObOyUgDO5iNhd/c/PBtDtOuuDY6GbGC1x.',
    'client',
    'María Elena',
    'García López',
    '+52 (555) 123-4567',
    'CDMX',
    'active',
    NOW()
)
ON DUPLICATE KEY UPDATE
    first_name = 'María Elena',
    last_name = 'García López',
    phone = '+52 (555) 123-4567',
    region = 'CDMX';

SET @user_id = (SELECT id FROM users WHERE email = 'maria.garcia@example.com');
SET @agent_id = (SELECT id FROM users WHERE user_type = 'agent' LIMIT 1);

-- 2. CREAR PÓLIZA (datos del PDF emitido por la aseguradora)
INSERT INTO policies (
    policy_number,     -- Del PDF: "AUTO-001-2026"
    client_id,         
    agent_id,          -- Broker que gestionó la póliza
    policy_type,       -- Del PDF: "auto", "vida", "casa"
    status,            -- "active" cuando se carga
    premium_amount,    -- Del PDF: Prima anual total ($19,500)
    coverage_amount,   -- Del PDF: Suma asegurada ($350,000)
    start_date,        -- Del PDF: Fecha inicio vigencia
    end_date,          -- Del PDF: Fecha fin vigencia
    renewal_date,      -- Calculado: ~30 días antes de end_date
    created_at
)
VALUES (
    'AUTO-001-2026',
    @user_id,
    @agent_id,
    'auto',
    'active',
    19500.00,  -- Prima ANUAL que el cliente paga a la aseguradora
    350000.00, -- Cobertura
    '2026-01-01',
    '2026-12-31',
    '2026-12-01',
    NOW()
)
ON DUPLICATE KEY UPDATE
    status = 'active',
    premium_amount = 19500.00,
    coverage_amount = 350000.00,
    start_date = '2026-01-01',
    end_date = '2026-12-31';

SET @policy_id = (SELECT id FROM policies WHERE policy_number = 'AUTO-001-2026');

-- 3. GUARDAR DOCUMENTO PDF (el que emitió la aseguradora)
INSERT INTO documents (
    policy_id,
    document_type,
    file_name,
    file_path,
    upload_date,
    uploaded_by
)
VALUES (
    @policy_id,
    'policy',
    'maria-garcia-AUTO-001.pdf',
    'demo-policies/maria-garcia-AUTO-001.pdf',
    NOW(),
    @agent_id
)
ON DUPLICATE KEY UPDATE
    file_path = 'demo-policies/maria-garcia-AUTO-001.pdf',
    upload_date = NOW();

-- 4. COMISIÓN DEL BROKER (opcional - si registran comisiones)
-- Esto es lo ÚNICO de "dinero" que manejan: la comisión que reciben
INSERT IGNORE INTO commissions (
    agent_id,
    policy_id,
    commission_amount,  -- Ej: 10% de $19,500 = $1,950
    commission_rate,
    status,
    created_at
)
VALUES (
    @agent_id,
    @policy_id,
    1950.00,  -- Comisión del broker
    10.00,    -- 10% de la prima
    'pending',
    NOW()
);

-- 5. VERIFICACIÓN FINAL
SELECT 
    u.id as user_id,
    u.email,
    CONCAT(u.first_name, ' ', u.last_name) as client_name,
    p.id as policy_id,
    p.policy_number,
    p.policy_type,
    p.status,
    p.premium_amount as annual_premium,
    p.coverage_amount,
    DATE_FORMAT(p.start_date, '%d/%m/%Y') as start_date,
    DATE_FORMAT(p.end_date, '%d/%m/%Y') as end_date,
    DATE_FORMAT(p.renewal_date, '%d/%m/%Y') as renewal_reminder,
    DATEDIFF(p.end_date, CURDATE()) as days_until_expiry,
    d.file_name as policy_document,
    c.commission_amount as broker_commission
FROM users u
INNER JOIN policies p ON u.id = p.client_id
LEFT JOIN documents d ON p.id = d.policy_id AND d.document_type = 'policy'
LEFT JOIN commissions c ON p.id = c.policy_id
WHERE u.email = 'maria.garcia@example.com'
ORDER BY p.created_at DESC
LIMIT 1;
