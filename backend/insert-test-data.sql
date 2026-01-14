-- Insert test data for Krause Insurance Dashboard
-- Run this after database-schema.sql

-- Ensure we have users (client id=9, agent id=2)
-- These should already exist from previous scripts

-- Insert sample policies for client maria.garcia@example.com (id=9)
INSERT INTO policies (policy_number, client_id, agent_id, policy_type, status, premium_amount, coverage_amount, start_date, end_date, renewal_date) VALUES
('POL-2024-001', 9, 2, 'auto', 'active', 125.50, 50000.00, '2024-01-15', '2025-01-15', '2025-01-15'),
('POL-2024-002', 9, 2, 'home', 'active', 89.99, 250000.00, '2024-03-01', '2025-03-01', '2025-03-01'),
('POL-2024-003', 9, 2, 'life', 'active', 75.00, 100000.00, '2024-06-10', '2025-06-10', '2025-06-10')
ON DUPLICATE KEY UPDATE policy_number=policy_number;

-- Insert sample claims for the client
INSERT INTO claims (claim_number, policy_id, client_id, claim_type, status, claim_amount, incident_date, description, submitted_at) VALUES
('CLM-2024-001', (SELECT id FROM policies WHERE policy_number='POL-2024-001' LIMIT 1), 9, 'Auto Accident', 'under_review', 3500.00, '2024-12-15', 'Minor collision in parking lot', '2024-12-16 10:30:00'),
('CLM-2024-002', (SELECT id FROM policies WHERE policy_number='POL-2024-002' LIMIT 1), 9, 'Home Damage', 'approved', 1200.00, '2024-11-20', 'Water damage from pipe leak', '2024-11-21 14:20:00')
ON DUPLICATE KEY UPDATE claim_number=claim_number;

-- Insert payment history for the client
INSERT INTO payments (policy_id, client_id, amount, payment_method, status, payment_date, transaction_id) VALUES
((SELECT id FROM policies WHERE policy_number='POL-2024-001' LIMIT 1), 9, 125.50, 'card', 'completed', '2024-12-01 09:15:00', 'TXN-20241201-001'),
((SELECT id FROM policies WHERE policy_number='POL-2024-002' LIMIT 1), 9, 89.99, 'card', 'completed', '2024-12-01 09:15:00', 'TXN-20241201-002'),
((SELECT id FROM policies WHERE policy_number='POL-2024-003' LIMIT 1), 9, 75.00, 'bank_transfer', 'completed', '2024-12-05 15:30:00', 'TXN-20241205-001'),
((SELECT id FROM policies WHERE policy_number='POL-2024-001' LIMIT 1), 9, 125.50, 'card', 'completed', '2025-01-01 08:45:00', 'TXN-20250101-001'),
((SELECT id FROM policies WHERE policy_number='POL-2024-002' LIMIT 1), 9, 89.99, 'card', 'pending', '2025-01-14 00:00:00', NULL)
ON DUPLICATE KEY UPDATE transaction_id=transaction_id;

-- Insert some additional clients for the agent dashboard
INSERT INTO users (email, password_hash, user_type, first_name, last_name, phone, status) VALUES
('john.smith@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'John', 'Smith', '+1-555-100-0001', 'active'),
('sarah.jones@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'Sarah', 'Jones', '+1-555-100-0002', 'active'),
('michael.brown@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'Michael', 'Brown', '+1-555-100-0003', 'active')
ON DUPLICATE KEY UPDATE email=email;

-- Insert policies for other clients (managed by agent id=2)
INSERT INTO policies (policy_number, client_id, agent_id, policy_type, status, premium_amount, coverage_amount, start_date, end_date, renewal_date) VALUES
('POL-2024-004', (SELECT id FROM users WHERE email='john.smith@example.com' LIMIT 1), 2, 'auto', 'active', 145.00, 75000.00, '2024-02-01', '2025-02-01', '2025-02-01'),
('POL-2024-005', (SELECT id FROM users WHERE email='sarah.jones@example.com' LIMIT 1), 2, 'home', 'active', 110.00, 300000.00, '2024-04-15', '2025-04-15', '2025-04-15'),
('POL-2024-006', (SELECT id FROM users WHERE email='michael.brown@example.com' LIMIT 1), 2, 'business', 'active', 250.00, 500000.00, '2024-05-01', '2025-05-01', '2025-05-01')
ON DUPLICATE KEY UPDATE policy_number=policy_number;

-- Insert some recent quotes for agent dashboard
INSERT INTO quotes (email, first_name, last_name, phone, quote_type, status, requested_at) VALUES
('potential.client1@example.com', 'Robert', 'Wilson', '+1-555-200-0001', 'auto', 'new', '2025-01-10 14:30:00'),
('potential.client2@example.com', 'Lisa', 'Anderson', '+1-555-200-0002', 'home', 'contacted', '2025-01-12 09:15:00'),
('potential.client3@example.com', 'David', 'Martinez', '+1-555-200-0003', 'life', 'new', '2025-01-13 16:45:00')
ON DUPLICATE KEY UPDATE email=email;

-- Add some documents for client
INSERT INTO documents (user_id, policy_id, document_type, file_name, file_path, file_size, uploaded_at) VALUES
(9, (SELECT id FROM policies WHERE policy_number='POL-2024-001' LIMIT 1), 'policy_doc', 'Auto_Insurance_Policy.pdf', '/documents/9/Auto_Insurance_Policy.pdf', 245632, '2024-01-15 10:00:00'),
(9, (SELECT id FROM policies WHERE policy_number='POL-2024-002' LIMIT 1), 'policy_doc', 'Home_Insurance_Policy.pdf', '/documents/9/Home_Insurance_Policy.pdf', 198456, '2024-03-01 11:30:00')
ON DUPLICATE KEY UPDATE file_name=file_name;

-- Update user to have full_name field (if your schema supports it)
-- UPDATE users SET full_name = CONCAT(first_name, ' ', last_name) WHERE full_name IS NULL OR full_name = '';

SELECT '✅ Test data inserted successfully!' as status;
