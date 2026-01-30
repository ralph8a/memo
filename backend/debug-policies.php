<?php
require_once 'config.php';
require_once 'database.php';

$db = getDB();

echo "=== TESTING POLICIES FOR CLIENT 35 ===\n";

$stmt = $db->prepare("SELECT id, policy_number, policy_type, status FROM policies WHERE client_id = 35 LIMIT 3");
$stmt->execute();
$policies = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Found " . count($policies) . " policies:\n";
print_r($policies);

echo "\n=== TESTING AGENT POLICIES ===\n";
$stmt = $db->prepare("SELECT id, policy_number, policy_type, status, client_id FROM policies WHERE agent_id = 2 LIMIT 3");
$stmt->execute();
$agentPolicies = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Found " . count($agentPolicies) . " policies for agent:\n";
print_r($agentPolicies);
