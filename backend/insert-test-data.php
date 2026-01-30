<?php
/**
 * Script para insertar datos de prueba en policy_comments
 * Ejecutar: php insert-test-data.php
 */

require_once 'config.php';
require_once 'database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    echo "🚀 Insertando datos de prueba...\n\n";
    
    // Comentarios del agente (memo - user_id 1) en pólizas de Guillermo
    $testComments = [
        [1, 'agent', 1, 'Hola Guillermo, revisé tu documentación y todo está en orden. La póliza está activa y al día.', 0, 0, 'DATE_SUB(NOW(), INTERVAL 2 HOUR)'],
        [1, 'client', 2, 'Gracias por la confirmación. Tengo una pregunta sobre la cobertura de daños por inundación.', 0, 0, 'DATE_SUB(NOW(), INTERVAL 1 HOUR)'],
        [1, 'agent', 1, 'Claro, tu póliza de hogar incluye cobertura contra inundaciones hasta $50,000. ¿Necesitas aumentarla?', 0, 0, 'DATE_SUB(NOW(), INTERVAL 30 MINUTE)'],
        [2, 'agent', 1, 'Tu pago de este mes está programado para el 5 de febrero. No olvides tener fondos disponibles.', 0, 0, 'DATE_SUB(NOW(), INTERVAL 3 HOUR)'],
        [2, 'client', 2, 'Perfecto, ya actualicé mi método de pago a transferencia automática.', 0, 0, 'DATE_SUB(NOW(), INTERVAL 2 HOUR)'],
        [3, 'agent', 1, 'IMPORTANTE: Tu póliza de vida vence en 30 días. Necesito confirmar si deseas renovar.', 0, 0, 'DATE_SUB(NOW(), INTERVAL 5 HOUR)'],
        [3, 'client', 2, 'Sí, quiero renovar. ¿Hay algún descuento por renovación anticipada?', 0, 0, 'DATE_SUB(NOW(), INTERVAL 4 HOUR)'],
        [3, 'agent', 1, 'Excelente. Te ofrezco un 10% de descuento si renuevas esta semana. Te envío la cotización por email.', 0, 0, 'DATE_SUB(NOW(), INTERVAL 3 HOUR)']
    ];
    
    $insertedCount = 0;
    
    foreach ($testComments as $comment) {
        [$policyId, $authorType, $authorId, $commentText, $isInternal, $isRead, $createdAt] = $comment;
        
        $stmt = $db->prepare("
            INSERT INTO policy_comments 
            (policy_id, author_type, author_id, comment_text, is_internal, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, $createdAt)
        ");
        
        $stmt->execute([$policyId, $authorType, $authorId, $commentText, $isInternal, $isRead]);
        $insertedCount++;
        
        echo "✅ Comentario insertado en póliza $policyId: \"" . substr($commentText, 0, 50) . "...\"\n";
    }
    
    echo "\n📊 Total: $insertedCount comentarios insertados\n\n";
    
    // Verificar los comentarios
    echo "🔍 Verificando comentarios en la base de datos:\n\n";
    
    $stmt = $db->prepare("
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
        LIMIT 15
    ");
    
    $stmt->execute();
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($comments as $comment) {
        $readStatus = $comment['is_read'] ? '✓' : '✗';
        echo "[$readStatus] ID:{$comment['comment_id']} | Póliza:{$comment['policy_id']} | {$comment['author_type']} - {$comment['author_name']}\n";
        echo "    \"{$comment['comment_preview']}...\"\n";
        echo "    Fecha: {$comment['created_at']}\n\n";
    }
    
    // Contar por póliza
    echo "📈 Resumen por póliza:\n\n";
    
    $stmt = $db->prepare("
        SELECT 
            policy_id,
            COUNT(*) as comment_count,
            SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_count
        FROM policy_comments
        GROUP BY policy_id
        ORDER BY policy_id
    ");
    
    $stmt->execute();
    $summary = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($summary as $row) {
        echo "Póliza {$row['policy_id']}: {$row['comment_count']} comentarios ({$row['unread_count']} sin leer)\n";
    }
    
    echo "\n✅ Datos de prueba insertados correctamente!\n";
    echo "\n💡 Próximos pasos:\n";
    echo "   1. Login al dashboard como guillermo@demo.com\n";
    echo "   2. Abre el ícono de la campana (notificaciones)\n";
    echo "   3. Verifica que aparezcan los comentarios\n";
    echo "   4. Navega a una póliza y revisa la sección de comentarios\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
