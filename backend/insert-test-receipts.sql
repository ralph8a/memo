-- Insert test payment receipts for proof review
-- This creates pending payment receipts for the agent to review

-- Insert test receipts (assuming we have policies with IDs 1-10 and payments)
INSERT INTO payment_receipts (
    payment_id,
    policy_id,
    user_id,
    file_path,
    file_name,
    file_size,
    mime_type,
    extracted_amount,
    extracted_date,
    extracted_reference,
    extracted_bank,
    verification_status,
    uploaded_at
) VALUES
-- Receipt 1: Recent upload, pending verification
(
    1,
    1,
    (SELECT id FROM users WHERE user_type = 'client' LIMIT 1),
    '/uploads/receipts/2026/01/receipt_001.pdf',
    'comprobante_pago_enero_2026.pdf',
    245678,
    'application/pdf',
    350.00,
    '2026-01-28',
    'REF20260128001',
    'Banco Nacional',
    'pending',
    '2026-01-28 10:30:00'
),
-- Receipt 2: Yesterday's upload
(
    2,
    2,
    (SELECT id FROM users WHERE user_type = 'client' LIMIT 1 OFFSET 1),
    '/uploads/receipts/2026/01/receipt_002.jpg',
    'pago_poliza_auto.jpg',
    512340,
    'image/jpeg',
    475.50,
    '2026-01-29',
    'TRANS2026012945',
    'Banco Internacional',
    'pending',
    '2026-01-29 14:15:00'
),
-- Receipt 3: Today's upload
(
    3,
    3,
    (SELECT id FROM users WHERE user_type = 'client' LIMIT 1 OFFSET 2),
    '/uploads/receipts/2026/01/receipt_003.pdf',
    'transferencia_seguro_hogar.pdf',
    189234,
    'application/pdf',
    620.00,
    '2026-01-30',
    'TRF30012026789',
    'Banco del Pacífico',
    'pending',
    '2026-01-30 09:45:00'
),
-- Receipt 4: Older pending receipt
(
    4,
    4,
    (SELECT id FROM users WHERE user_type = 'client' LIMIT 1 OFFSET 3),
    '/uploads/receipts/2026/01/receipt_004.png',
    'screenshot_pago_vida.png',
    876543,
    'image/png',
    890.25,
    '2026-01-27',
    'PAY270126XYZ',
    'Banco Comercial',
    'pending',
    '2026-01-27 16:20:00'
),
-- Receipt 5: High amount pending
(
    5,
    5,
    (SELECT id FROM users WHERE user_type = 'client' LIMIT 1 OFFSET 4),
    '/uploads/receipts/2026/01/receipt_005.pdf',
    'pago_poliza_empresarial.pdf',
    324567,
    'application/pdf',
    1250.00,
    '2026-01-29',
    'EMP2901260045',
    'Banco Empresarial',
    'pending',
    '2026-01-29 11:30:00'
);

-- Verify the inserted receipts
SELECT 
    pr.id,
    pr.file_name,
    pr.extracted_amount,
    pr.extracted_date,
    pr.verification_status,
    p.policy_number,
    CONCAT(u.first_name, ' ', u.last_name) as client_name,
    pr.uploaded_at
FROM payment_receipts pr
JOIN policies p ON pr.policy_id = p.id
JOIN users u ON pr.user_id = u.id
WHERE pr.verification_status = 'pending'
ORDER BY pr.uploaded_at DESC;
