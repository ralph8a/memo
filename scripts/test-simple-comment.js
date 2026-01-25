#!/usr/bin/env node
/**
 * Simple Policy Comments Add Test
 */

require('dotenv').config();
const https = require('https');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BASE_URL = 'https://ksinsurancee.com';

const agentUser = {
    email: 'guillermo.krause@ksinsurancee.com',
    password: 'Admin123!'
};

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

async function test() {
    try {
        // Login
        console.log('1. Logging in...');
        let res = await request(
            `${BASE_URL}/backend/index.php?action=login`,
            'POST',
            agentUser
        );

        if (res.status !== 200) {
            console.log('Login failed:', res.status, res.body);
            return;
        }

        const token = res.body.token;
        console.log('✅ Login OK');

        // Get policies
        console.log('\n2. Getting policies...');
        res = await request(
            `${BASE_URL}/backend/index.php?action=agent_policies`,
            'GET',
            null,
            { 'Authorization': `Bearer ${token}` }
        );

        console.log('Status:', res.status);
        const policyId = res.body.policies[0].policy_id;
        console.log('Found policy ID:', policyId);

        // Try to add comment
        console.log('\n3. Adding comment...');
        res = await request(
            `${BASE_URL}/backend/index.php?action=add_policy_comment`,
            'POST',
            {
                policy_id: policyId,
                message: 'Test comment'
            },
            { 'Authorization': `Bearer ${token}` }
        );

        console.log('Status:', res.status);
        console.log('Body:', JSON.stringify(res.body, null, 2));

        if (res.status === 200) {
            console.log('✅ SUCCESS!');
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
