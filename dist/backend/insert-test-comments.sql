-- Script SQL para insertar datos de prueba de comentarios en pólizas y notificaciones

-- Insertar comentarios del agente (memo - user_id 1) en pólizas de Guillermo
INSERT INTO policy_comments (policy_id, author_type, author_id, comment_text, is_internal, is_read, created_at)
VALUES
  (1, 'agent', 1, 'Hola Guillermo, revisé tu documentación y todo está en orden. La póliza está activa y al día.', 0, 0, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
  (1, 'client', 2, 'Gracias por la confirmación. Tengo una pregunta sobre la cobertura de daños por inundación.', 0, 0, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
  (1, 'agent', 1, 'Claro, tu póliza de hogar incluye cobertura contra inundaciones hasta $50,000. ¿Necesitas aumentarla?', 0, 0, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
  (2, 'agent', 1, 'Tu pago de este mes está programado para el 5 de febrero. No olvides tener fondos disponibles.', 0, 0, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
  (2, 'client', 2, 'Perfecto, ya actualicé mi método de pago a transferencia automática.', 0, 0, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
  (3, 'agent', 1, 'IMPORTANTE: Tu póliza de vida vence en 30 días. Necesito confirmar si deseas renovar.', 0, 0, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
  (3, 'client', 2, 'Sí, quiero renovar. ¿Hay algún descuento por renovación anticipada?', 0, 0, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
  (3, 'agent', 1, 'Excelente. Te ofrezco un 10% de descuento si renuevas esta semana. Te envío la cotización por email.', 0, 0, DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- Insertar comentarios en pólizas de otros clientes para el agente
INSERT INTO policy_comments (policy_id, author_type, author_id, comment_text, is_internal, is_read, created_at)
VALUES
  (4, 'client', 3, '¿Cuándo puedo esperar el reembolso de mi reclamo?', 0, 0, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
  (5, 'client', 4, 'Necesito actualizar mi dirección. ¿Cómo lo hago?', 0, 0, DATE_SUB(NOW(), INTERVAL 8 HOUR)),
  (6, 'client', 5, 'Mi comprobante de pago fue rechazado. ¿Puedes revisar?', 0, 0, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Verificar los comentarios insertados
SELECT 
  pc.comment_id,
  pc.policy_id,
  pc.author_type,
  CONCAT(u.first_name, ' ', u.last_name) as author_name,
  LEFT(pc.comment_text, 60) as comment_preview,
  pc.is_read,
  pc.created_at
FROM policy_comments pc
LEFT JOIN users u ON pc.author_id = u.id
ORDER BY pc.created_at DESC
LIMIT 15;

-- Contar comentarios por póliza
SELECT 
  policy_id,
  COUNT(*) as comment_count,
  SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_count
FROM policy_comments
GROUP BY policy_id
ORDER BY policy_id;
