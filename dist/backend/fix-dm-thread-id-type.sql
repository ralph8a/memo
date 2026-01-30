-- Fix direct_messages schema: thread_id should be VARCHAR to match direct_message_threads

ALTER TABLE direct_messages 
MODIFY COLUMN thread_id VARCHAR(50) NOT NULL;

-- Verify the change
DESCRIBE direct_messages;
