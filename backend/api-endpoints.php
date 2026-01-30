<?php
/**
 * Extended API Endpoints for Krause Insurance
 * Priority endpoints for dashboard components
 */

// ===== CLIENT DASHBOARD ENDPOINTS =====

/**
 * GET /api/client/payments/{client_id}
 * Returns payment history for a client
 */
function getClientPayments($db, $client_id) {
    $stmt = $db->prepare("
        SELECT 
            p.id,
            p.payment_date,
            p.amount,
            p.payment_method,
            p.status,
            p.transaction_id,
            pol.policy_number,
            pol.policy_type
        FROM payments p
        LEFT JOIN policies pol ON p.policy_id = pol.id
        WHERE p.client_id = ?
        ORDER BY p.payment_date DESC
        LIMIT 50
    ");
    $stmt->execute([$client_id]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * GET /api/client/policies/{client_id}
 * Returns active policies for a client
 */
function getClientPolicies($db, $client_id) {
    $stmt = $db->prepare("
        SELECT 
            p.id,
            p.policy_number,
            p.policy_type as type,
            p.status,
            p.premium_amount as premium,
            p.coverage_amount as coverage,
            p.start_date,
            p.end_date,
            p.renewal_date,
            CONCAT(a.first_name, ' ', a.last_name) as agent_name,
            a.email as agent_email,
            a.phone as agent_phone
        FROM policies p
        LEFT JOIN users a ON p.agent_id = a.id
        WHERE p.client_id = ?
        ORDER BY 
            CASE p.status
                WHEN 'active' THEN 1
                WHEN 'pending' THEN 2
                WHEN 'expired' THEN 3
                ELSE 4
            END,
            p.renewal_date DESC
    ");
    $stmt->execute([$client_id]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * GET /api/client/claims/{client_id}
 * Returns claims for a client
 */
function getClientClaims($db, $client_id) {
    $stmt = $db->prepare("
        SELECT 
            c.id,
            c.claim_number,
            c.claim_type as type,
            c.status,
            c.claim_amount as amount,
            c.submitted_at,
            c.resolved_at,
            c.description,
            p.policy_number,
            p.policy_type
        FROM claims c
        JOIN policies p ON c.policy_id = p.id
        WHERE p.client_id = ?
        ORDER BY c.submitted_at DESC
        LIMIT 20
    ");
    $stmt->execute([$client_id]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * GET /api/client/documents/{client_id}
 * Returns recent documents for a client
 */
function getClientDocuments($db, $client_id) {
    $stmt = $db->prepare("
        SELECT 
            d.id,
            d.document_type as type,
            d.file_name as title,
            d.uploaded_at as date,
            d.file_path as href,
            p.policy_number
        FROM documents d
        LEFT JOIN policies p ON d.policy_id = p.id
        WHERE d.user_id = ?
        ORDER BY d.uploaded_at DESC
        LIMIT 10
    ");
    $stmt->execute([$client_id]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * GET /api/client/dashboard/{client_id}
 * Returns consolidated dashboard data
 */
function getClientDashboard($db, $client_id) {
    try {
        // Get user info
        $stmt = $db->prepare("SELECT first_name, last_name, email, phone FROM users WHERE id = ?");
        $stmt->execute([$client_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            return [
                'user' => null,
                'stats' => [
                    'active_policies' => 0,
                    'total_policies' => 0,
                    'total_monthly' => 0,
                    'payment_status' => 'current',
                    'next_payment_date' => null
                ],
                'recentDocs' => []
            ];
        }
        
        // Get stats
        $stmt = $db->prepare("
            SELECT 
                COUNT(*) as total_policies,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_policies,
                SUM(CASE WHEN status = 'active' THEN premium_amount ELSE 0 END) as total_monthly
            FROM policies
            WHERE client_id = ?
        ");
        $stmt->execute([$client_id]);
        $stats = $stmt->fetch(PDO::FETCH_ASSOC) ?? ['total_policies' => 0, 'active_policies' => 0, 'total_monthly' => 0];
        
        // Get next payment
        $stmt = $db->prepare("
            SELECT MIN(renewal_date) as next_payment_date
            FROM policies
            WHERE client_id = ? AND status = 'active' AND renewal_date > CURDATE()
        ");
        $stmt->execute([$client_id]);
        $nextPayment = $stmt->fetch(PDO::FETCH_ASSOC) ?? ['next_payment_date' => null];
        
        // Get payment status
        $stmt = $db->prepare("
            SELECT 
                CASE 
                    WHEN COUNT(CASE WHEN status = 'pending' OR status = 'failed' THEN 1 END) > 0 THEN 'pending'
                    ELSE 'current'
                END as payment_status
            FROM payments p
            JOIN policies pol ON p.policy_id = pol.id
            WHERE pol.client_id = ?
            AND p.payment_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
        ");
        $stmt->execute([$client_id]);
        $paymentStatus = $stmt->fetch(PDO::FETCH_ASSOC) ?? ['payment_status' => 'current'];
        
        return [
            'user' => $user,
            'stats' => [
                'active_policies' => (int)($stats['active_policies'] ?? 0),
                'total_policies' => (int)($stats['total_policies'] ?? 0),
                'total_monthly' => (float)($stats['total_monthly'] ?? 0),
                'payment_status' => $paymentStatus['payment_status'] ?? 'current',
                'next_payment_date' => $nextPayment['next_payment_date']
            ],
            'recentDocs' => getClientDocuments($db, $client_id)
        ];
    } catch (Exception $e) {
        error_log("getClientDashboard Error: " . $e->getMessage());
        return [
            'user' => null,
            'stats' => [
                'active_policies' => 0,
                'total_policies' => 0,
                'total_monthly' => 0,
                'payment_status' => 'current',
                'next_payment_date' => null
            ],
            'recentDocs' => []
        ];
    }
}

// ===== AGENT DASHBOARD ENDPOINTS =====

/**
 * GET /api/agent/clients/{agent_id}
 * Returns clients assigned to agent
 */
function getAgentClients($db, $agent_id) {
    $stmt = $db->prepare("
        SELECT DISTINCT
            u.id,
            CONCAT(u.first_name, ' ', u.last_name) as name,
            u.email,
            u.phone,
            u.region,
            COUNT(DISTINCT p.id) as policy_count,
            SUM(p.premium_amount) as total_premium,
            MAX(p.updated_at) as last_activity
        FROM users u
        JOIN policies p ON u.id = p.client_id
        WHERE p.agent_id = ?
        GROUP BY u.id
        ORDER BY last_activity DESC
    ");
    $stmt->execute([$agent_id]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * GET /api/agent/claims/{agent_id}
 * Returns claims for agent's clients
 */
function getAgentClaims($db, $agent_id) {
    $stmt = $db->prepare("
        SELECT 
            c.id,
            c.claim_number,
            c.claim_type as type,
            c.status,
            c.claim_amount as amount,
            c.submitted_at,
            CONCAT(u.first_name, ' ', u.last_name) as client_name,
            p.policy_number
        FROM claims c
        JOIN policies p ON c.policy_id = p.id
        JOIN users u ON p.client_id = u.id
        WHERE p.agent_id = ?
        ORDER BY c.submitted_at DESC
        LIMIT 50
    ");
    $stmt->execute([$agent_id]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * GET /api/agent/stats/{agent_id}
 * Returns agent statistics
 */
function getAgentStats($db, $agent_id) {
    // Total clients
    $stmt = $db->prepare("
        SELECT COUNT(DISTINCT client_id) as total_clients
        FROM policies
        WHERE agent_id = ?
    ");
    $stmt->execute([$agent_id]);
    $totalClients = $stmt->fetch(PDO::FETCH_ASSOC)['total_clients'];
    
    // Active policies
    $stmt = $db->prepare("
        SELECT COUNT(*) as active_policies
        FROM policies
        WHERE agent_id = ? AND status = 'active'
    ");
    $stmt->execute([$agent_id]);
    $activePolicies = $stmt->fetch(PDO::FETCH_ASSOC)['active_policies'];
    
    // Pending claims
    $stmt = $db->prepare("
        SELECT COUNT(*) as pending_claims
        FROM claims c
        JOIN policies p ON c.policy_id = p.id
        WHERE p.agent_id = ? AND c.status IN ('pending', 'under_review')
    ");
    $stmt->execute([$agent_id]);
    $pendingClaims = $stmt->fetch(PDO::FETCH_ASSOC)['pending_claims'];
    
    // This month revenue
    $stmt = $db->prepare("
        SELECT SUM(p.premium_amount) as monthly_revenue
        FROM policies p
        WHERE p.agent_id = ? AND p.status = 'active'
    ");
    $stmt->execute([$agent_id]);
    $monthlyRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['monthly_revenue'];
    
    return [
        'total_clients' => (int)$totalClients,
        'active_policies' => (int)$activePolicies,
        'pending_claims' => (int)$pendingClaims,
        'monthly_revenue' => (float)$monthlyRevenue
    ];
}

/**
 * GET /api/agent/dashboard/{agent_id}
 * Returns consolidated agent dashboard data
 */
function getAgentDashboard($db, $agent_id) {
    return [
        'stats' => getAgentStats($db, $agent_id),
        'clients' => getAgentClients($db, $agent_id),
        'claims' => getAgentClaims($db, $agent_id)
    ];
}

// ===== ADMIN DASHBOARD ENDPOINTS =====

/**
 * GET /api/admin/stats
 * Returns system-wide statistics
 */
function getAdminStats($db) {
    $stats = [];
    
    // Total users by type
    $stmt = $db->query("
        SELECT user_type, COUNT(*) as count
        FROM users
        WHERE status = 'active'
        GROUP BY user_type
    ");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $stats['users_' . $row['user_type']] = (int)$row['count'];
    }
    
    // Total policies by status
    $stmt = $db->query("
        SELECT status, COUNT(*) as count
        FROM policies
        GROUP BY status
    ");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $stats['policies_' . $row['status']] = (int)$row['count'];
    }
    
    // Claims statistics
    $stmt = $db->query("
        SELECT 
            COUNT(*) as total_claims,
            SUM(CASE WHEN status = 'approved' THEN claim_amount ELSE 0 END) as total_paid,
            SUM(CASE WHEN status IN ('pending', 'under_review') THEN 1 ELSE 0 END) as pending_claims
        FROM claims
    ");
    $claimsStats = $stmt->fetch(PDO::FETCH_ASSOC);
    $stats = array_merge($stats, [
        'total_claims' => (int)$claimsStats['total_claims'],
        'total_paid' => (float)$claimsStats['total_paid'],
        'pending_claims' => (int)$claimsStats['pending_claims']
    ]);
    
    // Monthly revenue
    $stmt = $db->query("
        SELECT SUM(premium_amount) as monthly_revenue
        FROM policies
        WHERE status = 'active'
    ");
    $stats['monthly_revenue'] = (float)$stmt->fetch(PDO::FETCH_ASSOC)['monthly_revenue'];
    
    return $stats;
}

/**
 * GET /api/admin/activity
 * Returns recent system activity
 */
function getAdminActivity($db) {
    $activities = [];
    
    // Recent policies
    $stmt = $db->query("
        SELECT 
            'policy' as type,
            CONCAT(u.first_name, ' ', u.last_name) as user_name,
            p.policy_type,
            p.status,
            p.created_at as timestamp
        FROM policies p
        JOIN users u ON p.client_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 10
    ");
    $activities = array_merge($activities, $stmt->fetchAll(PDO::FETCH_ASSOC));
    
    // Recent claims
    $stmt = $db->query("
        SELECT 
            'claim' as type,
            CONCAT(u.first_name, ' ', u.last_name) as user_name,
            c.claim_type,
            c.status,
            c.submitted_at as timestamp
        FROM claims c
        JOIN policies p ON c.policy_id = p.id
        JOIN users u ON p.client_id = u.id
        ORDER BY c.submitted_at DESC
        LIMIT 10
    ");
    $activities = array_merge($activities, $stmt->fetchAll(PDO::FETCH_ASSOC));
    
    // Sort by timestamp
    usort($activities, function($a, $b) {
        return strtotime($b['timestamp']) - strtotime($a['timestamp']);
    });
    
    return array_slice($activities, 0, 20);
}

/**
 * GET /api/admin/dashboard
 * Returns consolidated admin dashboard data
 */
function getAdminDashboard($db) {
    return [
        'stats' => getAdminStats($db),
        'activity' => getAdminActivity($db)
    ];
}

// ===== COMMON HELPER FUNCTIONS =====

/**
 * Format currency
 */
function formatCurrency($amount) {
    return '$' . number_format($amount, 2);
}

/**
 * Format date
 */
function formatDate($date) {
    return date('M d, Y', strtotime($date));
}

/**
 * Calculate days until date
 */
function daysUntil($date) {
    $now = new DateTime();
    $target = new DateTime($date);
    $interval = $now->diff($target);
    return $interval->days;
}
