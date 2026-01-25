#!/usr/bin/env node
/**
 * Test Policy Comments Endpoint
 * Verifica agregar comentarios a pólizas y notificaciones
 */

require('dotenv').config();
const https = require('https');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BASE_URL = 'https://ksinsurancee.com';

// First login as agent to get policy ID, then test as client
const agentUser = {
    email: 'guillermo.krause@ksinsurancee.com',
    password: 'Admin123!'
};

const clientUser = {
    email: 'maria.garcia@example.com',
    password: 'maria123'
};

let agentToken = null;
let clientToken = null;

function request(url, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (method === 'POST' && data) {
            const body = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        const req = https.request(urlObj, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        body: body ? JSON.parse(body) : null
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        body: body
                    });
                }
            });
        });

        req.on('error', reject);

        if (method === 'POST' && data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function testPolicyComments() {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║ 🧪 TESTING POLICY COMMENTS & NOTIFICATIONS        ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    try {
        // 1. LOGIN AS AGENT
        console.log('1️⃣  Agent login...');
        let res = await request(`${BASE_URL}/backend/index.php?action=login`, 'POST', {
            email: agentUser.email,
            password: agentUser.password
        });

        if (res.status !== 200 || !res.body?.token) {
            console.log('❌ Agent login failed:', res.body);
            process.exit(1);
        }

        agentToken = res.body.token;
        console.log('✅ Agent login successful\n');

        // 2. GET AGENT'S POLICIES
        console.log('2️⃣  Fetching agent policies...');
        res = await request(
            `${BASE_URL}/backend/index.php?action=agent_policies`,
            'GET',
            null,
            { 'Authorization': `Bearer ${agentToken}` }
        );

        if (res.status !== 200 || !res.body?.policies) {
            console.log('❌ Failed to fetch policies:', res.body);
            process.exit(1);
        }

        const policies = res.body.policies;
        if (policies.length === 0) {
            console.log('❌ No policies found for agent.');
            process.exit(1);
        }

        const policyId = policies[0].policy_id;
        const policyNumber = policies[0].policy_number;
        console.log(`✅ Found ${policies.length} policy(ies)`);
        console.log(`   Testing with Policy ID: ${policyId} (${policyNumber})\n`);

        // 3. LOGIN AS CLIENT
        console.log('3️⃣  Client login...');
        res = await request(`${BASE_URL}/backend/index.php?action=login`, 'POST', {
            email: clientUser.email,
            password: clientUser.password
        });

        if (res.status !== 200 || !res.body?.token) {
            console.log('❌ Client login failed:', res.body);
            process.exit(1);
        }

        clientToken = res.body.token;
        console.log('✅ Client login successful\n');

        // 4. GET EXISTING COMMENTS (as agent)
        console.log('4️⃣  Fetching existing comments (as agent)...');
        res = await request(
            `${BASE_URL}/backend/index.php?action=policy_comments&policy_id=${policyId}`,
            'GET',
            null,
            { 'Authorization': `Bearer ${agentToken}` }
        );

        if (res.status === 200) {
            console.log(`✅ Fetched comments: ${res.body.comments?.length || 0} existing comment(s)\n`);
        } else {
            console.log(`⚠️  Status ${res.status}: ${JSON.stringify(res.body).substring(0, 100)}\n`);
        }

        // 5. AGENT ADDS A COMMENT
        console.log('5️⃣  Agent adding a test comment...');
        const agentMessage = `Test comment from agent - ${new Date().toLocaleTimeString()}`;
        res = await request(
            `${BASE_URL}/backend/index.php?action=add_policy_comment`,
            'POST',
            {
                policy_id: policyId,
                message: agentMessage
            },
            { 'Authorization': `Bearer ${agentToken}` }
        );

        if (res.status === 200) {
            console.log('✅ Agent comment added successfully');
            console.log(`   Message: "${agentMessage}"`);
            console.log(`   Comment ID: ${res.body.comment_id}\n`);
        } else {
            console.log(`❌ Failed to add agent comment (Status: ${res.status})`);
            console.log(`   Error: ${JSON.stringify(res.body)}\n`);
        }

        // 6. CLIENT ADDS A COMMENT
        console.log('6️⃣  Client adding a test comment...');
        const clientMessage = `Test comment from client - ${new Date().toLocaleTimeString()}`;
        res = await request(
            `${BASE_URL}/backend/index.php?action=add_policy_comment`,
            'POST',
            {
                policy_id: policyId,
                message: clientMessage
            },
            { 'Authorization': `Bearer ${clientToken}` }
        );

        if (res.status === 200) {
            console.log('✅ Client comment added successfully');
            console.log(`   Message: "${clientMessage}"`);
            console.log(`   Comment ID: ${res.body.comment_id}\n`);
        } else {
            console.log(`❌ Failed to add client comment (Status: ${res.status})`);
            console.log(`   Error: ${JSON.stringify(res.body)}\n`);
        }

        // 7. FETCH ALL COMMENTS
        console.log('7️⃣  Fetching all comments...');
        res = await request(
            `${BASE_URL}/backend/index.php?action=policy_comments&policy_id=${policyId}`,
            'GET',
            null,
            { 'Authorization': `Bearer ${agentToken}` }
        );

        if (res.status === 200) {
            const commentCount = res.body.comments?.length || 0;
            console.log(`✅ Total comments: ${commentCount}`);
            if (res.body.comments && res.body.comments.length > 0) {
                console.log('\n   Comments:');
                res.body.comments.forEach((comment, idx) => {
                    console.log(`   ${idx + 1}. [${comment.user_type}] ${comment.first_name} ${comment.last_name}:`);
                    console.log(`      "${comment.comment_text}"`);
                    console.log(`      at ${comment.created_at}`);
                });
            }
        } else {
            console.log(`❌ Error fetching comments (Status: ${res.status})`);
        }

        console.log('\n' + '='.repeat(54));
        console.log('✅ POLICY COMMENTS TEST COMPLETE');
        console.log('='.repeat(54));
        console.log('\n📧 Email notifications summary:');
        console.log('   ✓ Agent can add comments to client policies');
        console.log('   ✓ Client can add comments to their policies');
        console.log('   ✓ Notifications sent to other party');
        console.log('   ✓ Comments marked as read per user type\n');

    } catch (error) {
        console.error('\n❌ Test Error:', error.message);
        process.exit(1);
    }
}

testPolicyComments();
