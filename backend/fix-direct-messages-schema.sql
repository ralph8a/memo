-- Fix direct_messages table schema
-- Run this if you're getting error 500 when sending messages

-- Check current structure
DESCRIBE direct_messages;

-- Option 1: Add missing columns if recipient_id exists
-- (Use this if the table has recipient_id instead of agent_id/client_id)
ALTER TABLE direct_messages 
ADD COLUMN agent_id INT NOT NULL AFTER thread_id,
ADD COLUMN client_id INT NOT NULL AFTER agent_id;

-- Option 2: Drop and recreate (if structure is too different)
-- WARNING: This will delete all existing messages
/*
DROP TABLE IF EXISTS direct_messages;

CREATE TABLE direct_messages (
    dm_id INT AUTO_INCREMENT PRIMARY KEY,
    thread_id INT NOT NULL,
    agent_id INT NOT NULL,
    client_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_type ENUM('agent', 'client') NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (thread_id) REFERENCES direct_message_threads(thread_id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_thread (thread_id),
    INDEX idx_expires (expires_at)
);
*/

-- Verify the fix
DESCRIBE direct_messages;

-- Test query that the backend uses
SELECT dm.*, 
       s.first_name AS sender_first, 
       s.last_name AS sender_last,
       CONCAT(s.first_name, ' ', s.last_name) AS sender_name
FROM direct_messages dm
LEFT JOIN users s ON dm.sender_id = s.user_id
WHERE dm.thread_id = 1
ORDER BY dm.created_at DESC
LIMIT 1;
