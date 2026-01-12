-- Fix password hashes for all test users
-- Password for all users: Admin123!
-- New hash generated: $2y$10$YD6gW7w4hRCx7QeRrE1R0uHbuXjoxGaG.w2aTYLeemWtUsJyIohBS

UPDATE users SET password_hash = '$2y$10$YD6gW7w4hRCx7QeRrE1R0uHbuXjoxGaG.w2aTYLeemWtUsJyIohBS' 
WHERE email IN (
    'admin@ksinsurancee.com',
    'guillermo.krause@ksinsurancee.com',
    'agent.one@ksinsurancee.com',
    'client.test@example.com',
    'maria.garcia@example.com',
    'juan.martinez@example.com',
    'ana.lopez@example.com',
    'carlos.rodriguez@example.com',
    'laura.hernandez@example.com',
    'sofia.torres@ksinsurancee.com',
    'ricardo.gomez@ksinsurancee.com'
);

-- Verify the update
SELECT email, user_type, LEFT(password_hash, 30) as hash_prefix FROM users ORDER BY user_type, email;
