
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

-- Insertar en tabla clients si existe
INSERT INTO clients (user_id, date_of_birth, address, city, state, zip_code, tax_id, client_segment, created_at)
VALUES (
    @user_id,
    '1985-03-15',
    'Av. Insurgentes Sur 1234, Col. Del Valle',
    'Ciudad de México',
    'CDMX',
    '03100',
    'GAML850315ABC',
    'premium',
    '2024-01-15 10:00:00'
)
ON DUPLICATE KEY UPDATE
    address = 'Av. Insurgentes Sur 1234, Col. Del Valle',
    city = 'Ciudad de México',
    state = 'CDMX',
    tax_id = 'GAML850315ABC';

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

-- Insertar pagos mensuales (usando tabla payments)
-- Enero - Pagado
INSERT IGNORE INTO payments (policy_id, amount, due_date, payment_date, payment_method, status, created_at)
VALUES (@policy_id, 1625.00, '2026-01-15', '2026-01-18 14:30:00', 'transfer', 'completed', '2026-01-18 14:30:00');

-- Febrero - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-02-15', 'pending', NOW());

-- Marzo - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-03-15', 'pending', NOW());

-- Abril - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-04-15', 'pending', NOW());

-- Mayo - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-05-15', 'pending', NOW());

-- Junio - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-06-15', 'pending', NOW());

-- Julio - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-07-15', 'pending', NOW());

-- Agosto - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-08-15', 'pending', NOW());

-- Septiembre - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-09-15', 'pending', NOW());

-- Octubre - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-10-15', 'pending', NOW());

-- Noviembre - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-11-15', 'pending', NOW());

-- Diciembre - Pendiente
INSERT IGNORE INTO payments (policy_id, amount, due_date, status, created_at)
VALUES (@policy_id, 1625.00, '2026-12-15', 'pending', NOW());

-- Verificar resultados
SELECT 
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    p.id as policy_id,
    p.policy_number,
    p.premium_amount,
    COUNT(pay.id) as total_payments,
    SUM(CASE WHEN pay.status = 'completed' THEN 1 ELSE 0 END) as paid_payments,
    SUM(CASE WHEN pay.status = 'pending' THEN 1 ELSE 0 END) as pending_payments
FROM users u
LEFT JOIN policies p ON u.id = p.client_id
LEFT JOIN payments pay ON p.id = pay.policy_id
WHERE u.email = 'maria.garcia@example.com'
GROUP BY u.id, p.id;
