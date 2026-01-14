-- Script SQL corregido para maria.garcia@example.com
-- Usa la estructura correcta de tablas: payment_schedules en lugar de payments

-- Insertar usuario (client type)
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
    '2024-01-15 10:00:00'
)
ON DUPLICATE KEY UPDATE
    first_name = 'María Elena',
    last_name = 'García López',
    phone = '+52 (555) 123-4567',
    region = 'CDMX';

-- Obtener user_id
SET @user_id = (SELECT id FROM users WHERE email = 'maria.garcia@example.com');

-- Obtener agent_id (asumiendo que Guillermo Krause ya existe)
SET @agent_id = (SELECT id FROM users WHERE user_type = 'agent' LIMIT 1);

-- Insertar póliza
INSERT INTO policies (
    policy_number, client_id, agent_id, policy_type, 
    status, premium_amount, coverage_amount, 
    start_date, end_date, renewal_date, created_at
)
VALUES (
    'AUTO-001-2026',
    @user_id,
    @agent_id,
    'auto',
    'active',
    1625.00,
    350000.00,
    '2026-01-01',
    '2026-12-31',
    '2026-12-01',
    '2026-01-10 10:00:00'
)
ON DUPLICATE KEY UPDATE
    status = 'active',
    premium_amount = 1625.00;

-- Obtener policy_id
SET @policy_id = (SELECT id FROM policies WHERE policy_number = 'AUTO-001-2026');

-- Insertar calendario de pagos mensuales (12 cuotas)
-- Enero - Pagado
INSERT IGNORE INTO payment_schedules (
    policy_id, installment_number, total_installments, 
    due_date, amount_due, status, created_at
)
VALUES 
(@policy_id, 1, 12, '2026-01-15', 1625.00, 'paid', NOW());

-- Febrero a Diciembre - Pendientes
INSERT IGNORE INTO payment_schedules (
    policy_id, installment_number, total_installments, 
    due_date, amount_due, status, created_at
)
VALUES 
(@policy_id, 2, 12, '2026-02-15', 1625.00, 'pending', NOW()),
(@policy_id, 3, 12, '2026-03-15', 1625.00, 'pending', NOW()),
(@policy_id, 4, 12, '2026-04-15', 1625.00, 'pending', NOW()),
(@policy_id, 5, 12, '2026-05-15', 1625.00, 'pending', NOW()),
(@policy_id, 6, 12, '2026-06-15', 1625.00, 'pending', NOW()),
(@policy_id, 7, 12, '2026-07-15', 1625.00, 'pending', NOW()),
(@policy_id, 8, 12, '2026-08-15', 1625.00, 'pending', NOW()),
(@policy_id, 9, 12, '2026-09-15', 1625.00, 'pending', NOW()),
(@policy_id, 10, 12, '2026-10-15', 1625.00, 'pending', NOW()),
(@policy_id, 11, 12, '2026-11-15', 1625.00, 'pending', NOW()),
(@policy_id, 12, 12, '2026-12-15', 1625.00, 'pending', NOW());

-- Verificar resultados
SELECT 
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    p.id as policy_id,
    p.policy_number,
    p.premium_amount,
    COUNT(ps.schedule_id) as total_schedules,
    SUM(CASE WHEN ps.status = 'paid' THEN 1 ELSE 0 END) as paid_schedules,
    SUM(CASE WHEN ps.status = 'pending' THEN 1 ELSE 0 END) as pending_schedules
FROM users u
LEFT JOIN policies p ON u.id = p.client_id
LEFT JOIN payment_schedules ps ON p.id = ps.policy_id
WHERE u.email = 'maria.garcia@example.com'
GROUP BY u.id, p.id;
