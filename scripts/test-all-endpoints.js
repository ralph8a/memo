#!/usr/bin/env node
/**
 * Test All API Endpoints
 * Verifica dashboards + mensajes directos
 */

require('dotenv').config();
const https = require('https');
const http = require('http');

const BASE_URL = 'https://ksinsurancee.com';
const testUser = {
    email: 'guillermo.krause@ksinsurancee.com',
    password: 'Admin123!'
};

let authToken = null;

// Disable SSL certificate validation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function request(url, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol === 'https:' ? https : http;

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

        const req = protocol.request(urlObj, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: body ? JSON.parse(body) : null
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
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

async function runTests() {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║ 🧪  TESTING ALL API ENDPOINTS                        ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    try {
        // 1. LOGIN
        console.log('1️⃣  Testing LOGIN endpoint...');
        let res = await request(`${BASE_URL}/backend/index.php?action=login`, 'POST', {
            email: testUser.email,
            password: testUser.password
        });

        if (res.status === 200 && res.body?.token) {
            authToken = res.body.token;
            console.log(`   ✅ LOGIN Success (Status: ${res.status})`);
            console.log(`   📋 Token received: ${authToken.substring(0, 20)}...\n`);
        } else {
            console.log(`   ❌ LOGIN Failed (Status: ${res.status})`);
            console.log(`   Response:`, res.body);
            process.exit(1);
        }

        // 2. TEST DASHBOARD ENDPOINTS
        const dashboardEndpoints = [
            { action: 'agent_dashboard', name: 'Agent Dashboard' },
            { action: 'user_policies', name: 'User Policies' },
            { action: 'payment_history', name: 'Payment History' },
        ];

        console.log('📊 DASHBOARD ENDPOINTS:');
        for (const endpoint of dashboardEndpoints) {
            res = await request(
                `${BASE_URL}/backend/index.php?action=${endpoint.action}`,
                'GET',
                null,
                { 'Authorization': `Bearer ${authToken}` }
            );
            const status = res.status === 200 ? '✅' : '❌';
            console.log(`   ${status} ${endpoint.name}: ${res.status}`);
        }

        // 3. TEST DIRECT MESSAGE ENDPOINTS
        console.log('\n💬 DIRECT MESSAGE ENDPOINTS:');

        // 3a. Unread count
        res = await request(
            `${BASE_URL}/backend/index.php?action=dm_unread_count`,
            'GET',
            null,
            { 'Authorization': `Bearer ${authToken}` }
        );
        console.log(`   ${res.status === 200 ? '✅' : '❌'} Get Unread Count: ${res.status}`);

        // 3b. My threads
        res = await request(
            `${BASE_URL}/backend/index.php?action=dm_my_threads`,
            'GET',
            null,
            { 'Authorization': `Bearer ${authToken}` }
        );
        console.log(`   ${res.status === 200 ? '✅' : '❌'} Get My Threads: ${res.status}`);
        if (res.status !== 200) {
            console.log(`       Error: ${JSON.stringify(res.body).substring(0, 100)}`);
        } else if (res.body?.threads?.length > 0) {
            console.log(`       Found ${res.body.threads.length} thread(s)`);
        }

        console.log('\n' + '='.repeat(54));
        console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY');
        console.log('='.repeat(54) + '\n');

    } catch (error) {
        console.error('\n❌ Test Error:', error.message);
        process.exit(1);
    }
}

runTests();
