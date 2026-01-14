-- Script SQL para demo usando SOLO tablas base que coinciden con datos de PDF
-- Este script usa la estructura mínima que policy-analyzer.php puede llenar automáticamente

-- 1. CREAR CLIENTE
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

-- 2. CREAR PÓLIZA (con campos que policy-analyzer.php puede extraer)
INSERT INTO policies (
    policy_number, 
    client_id, 
    agent_id, 
    policy_type, 
    status, 
    premium_amount,  -- Prima total anual
    coverage_amount, 
    start_date, 
    end_date, 
    renewal_date,
    created_at
)
VALUES (
    'AUTO-001-2026',
    @user_id,
    @agent_id,
    'auto',
    'active',
    19500.00,  -- Prima ANUAL (12 x $1,625)
    350000.00,
    '2026-01-01',
    '2026-12-31',
    '2026-12-01',
    NOW()
)
ON DUPLICATE KEY UPDATE
    status = 'active',
    premium_amount = 19500.00,
    coverage_amount = 350000.00;

SET @policy_id = (SELECT id FROM policies WHERE policy_number = 'AUTO-001-2026');

-- 3. CREAR DOCUMENTO DE PÓLIZA (referencia al PDF)
INSERT IGNORE INTO documents (
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
);

-- 4. VERIFICACIÓN SIMPLE
SELECT 
    u.id as user_id,
    u.email,
    CONCAT(u.first_name, ' ', u.last_name) as full_name,
    p.id as policy_id,
    p.policy_number,
    p.policy_type,
    p.status,
    p.premium_amount as annual_premium,
    p.coverage_amount,
    p.start_date,
    p.end_date,
    d.file_name as policy_document
FROM users u
LEFT JOIN policies p ON u.id = p.client_id
LEFT JOIN documents d ON p.id = d.policy_id AND d.document_type = 'policy'
WHERE u.email = 'maria.garcia@example.com'
ORDER BY p.id DESC
LIMIT 1;
