-- Insertar usuario demo completo para maria.garcia@example.com
-- Este script crea todos los datos necesarios para probar el sistema

-- 1. Crear/Actualizar usuario
INSERT INTO users (email, password_hash, first_name, last_name, role, phone, address, created_at)
VALUES (
    'maria.garcia@example.com',
    '$2b$10$gBzu2evP4sXTLEKqo8pObOyUgDO5iNhd/c/PBtDtOuuDY6GbGC1x.', -- Cambiar por hash real
    'María Elena',
    'García López',
    'client',
    '+52 (555) 123-4567',
    'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX 03100',
    '2024-01-15 10:00:00'
)
ON DUPLICATE KEY UPDATE
    first_name = 'María Elena',
    last_name = 'García López',
    phone = '+52 (555) 123-4567',
    address = 'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX 03100';

-- 2. Obtener user_id (necesitaremos ejecutar esto después de insert)
SET @user_id = (SELECT user_id FROM users WHERE email = 'maria.garcia@example.com');

-- 3. Crear póliza de auto
INSERT INTO policies (
    user_id,
    policy_number,
    policy_type,
    coverage_amount,
    premium_amount,
    start_date,
    end_date,
    status,
    insurer_name,
    payment_frequency,
    created_at
)
VALUES (
    @user_id,
    'AUTO-001-2026',
    'Auto',
    2000000.00,
    1625.00, -- Prima mensual
    '2026-01-15',
    '2027-01-15',
    'active',
    'GNP Seguros',
    12, -- Mensual
    '2026-01-15 09:00:00'
);

SET @policy_id = LAST_INSERT_ID();

-- 4. Crear detalles de la póliza
INSERT INTO policy_details (policy_id, detail_key, detail_value)
VALUES
    (@policy_id, 'vehicle_brand', 'Honda'),
    (@policy_id, 'vehicle_model', 'Civic'),
    (@policy_id, 'vehicle_year', '2022'),
    (@policy_id, 'vehicle_version', 'EX Sedan'),
    (@policy_id, 'vehicle_plates', 'ABC-123-XY'),
    (@policy_id, 'vehicle_vin', '1HGBH41JXMN109186'),
    (@policy_id, 'vehicle_color', 'Gris Plata'),
    (@policy_id, 'vehicle_use', 'Particular'),
    (@policy_id, 'coverage_civil_liability', '$2,000,000.00 MXN'),
    (@policy_id, 'coverage_material_damage', '$350,000.00 MXN'),
    (@policy_id, 'coverage_theft', 'Valor Comercial'),
    (@policy_id, 'coverage_medical', '$150,000.00 MXN por persona'),
    (@policy_id, 'coverage_assistance', 'Asistencia Vial 24/7'),
    (@policy_id, 'coverage_replacement_car', 'Hasta 15 días'),
    (@policy_id, 'coverage_glass', 'Sin Deducible'),
    (@policy_id, 'annual_premium', '$18,500.00 MXN'),
    (@policy_id, 'payment_method', 'Transferencia Bancaria / Tarjeta'),
    (@policy_id, 'agent_name', 'Guillermo Krause S.'),
    (@policy_id, 'agent_email', 'krause@ksinsurance.com'),
    (@policy_id, 'agent_phone', '+52 (555) 999-8888');

-- 5. Crear calendario de pagos (12 pagos mensuales)
INSERT INTO payment_schedule (policy_id, schedule_date, amount, status)
VALUES
    (@policy_id, '2026-01-20', 1625.00, 'pending'),
    (@policy_id, '2026-02-20', 1625.00, 'pending'),
    (@policy_id, '2026-03-20', 1625.00, 'pending'),
    (@policy_id, '2026-04-20', 1625.00, 'pending'),
    (@policy_id, '2026-05-20', 1625.00, 'pending'),
    (@policy_id, '2026-06-20', 1625.00, 'pending'),
    (@policy_id, '2026-07-20', 1625.00, 'pending'),
    (@policy_id, '2026-08-20', 1625.00, 'pending'),
    (@policy_id, '2026-09-20', 1625.00, 'pending'),
    (@policy_id, '2026-10-20', 1625.00, 'pending'),
    (@policy_id, '2026-11-20', 1625.00, 'pending'),
    (@policy_id, '2026-12-20', 1625.00, 'pending');

-- 6. Crear algunos pagos históricos ya realizados
SET @schedule_id_1 = (SELECT schedule_id FROM payment_schedule WHERE policy_id = @policy_id ORDER BY schedule_date LIMIT 1);

INSERT INTO payments (
    policy_id,
    schedule_id,
    amount,
    payment_date,
    payment_method,
    status,
    confirmation_number,
    created_at
)
VALUES
    (
        @policy_id,
        @schedule_id_1,
        1625.00,
        '2026-01-18 14:30:00',
        'Transferencia Bancaria',
        'approved',
        'CONF-2026-001-ABC',
        '2026-01-18 14:30:00'
    );

-- Actualizar el schedule como pagado
UPDATE payment_schedule 
SET status = 'paid', paid_date = '2026-01-18 14:30:00'
WHERE schedule_id = @schedule_id_1;

-- 7. Crear algunas citas programadas
INSERT INTO meetings (
    user_id,
    agent_id,
    meeting_type,
    meeting_date,
    status,
    notes,
    created_at
)
VALUES
    (
        @user_id,
        1, -- ID del agente (ajustar según tu DB)
        'policy_review',
        '2026-01-25 10:00:00',
        'scheduled',
        'Revisión anual de póliza de auto',
        NOW()
    ),
    (
        @user_id,
        1,
        'quote',
        '2026-02-10 15:00:00',
        'scheduled',
        'Cotización para seguro de hogar',
        NOW()
    );

-- 8. Crear documentos asociados
INSERT INTO policy_documents (
    policy_id,
    document_type,
    file_path,
    uploaded_at,
    uploaded_by
)
VALUES
    (
        @policy_id,
        'policy',
        '/backend/demo-policies/maria-garcia-AUTO-001.pdf',
        '2026-01-15 09:00:00',
        1 -- ID del agente
    );

-- 9. Verificación final
SELECT 
    u.user_id,
    u.email,
    u.first_name,
    u.last_name,
    p.policy_id,
    p.policy_number,
    p.policy_type,
    p.premium_amount,
    p.status,
    COUNT(ps.schedule_id) as total_payments_scheduled,
    SUM(CASE WHEN ps.status = 'paid' THEN 1 ELSE 0 END) as payments_completed
FROM users u
LEFT JOIN policies p ON u.user_id = p.user_id
LEFT JOIN payment_schedule ps ON p.policy_id = ps.policy_id
WHERE u.email = 'maria.garcia@example.com'
GROUP BY u.user_id, p.policy_id;
