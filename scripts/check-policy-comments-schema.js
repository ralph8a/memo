#!/usr/bin/env node
/**
 * Check Policy Comments Table Schema
 */

require('dotenv').config();
const https = require('https');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BASE_URL = 'https://ksinsurancee.com';

const testUser = {
    email: 'guillermo.krause@ksinsurancee.com',
    password: 'Admin123!'
};

let token = null;

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
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
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function test() {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║ 📊 CHECKING POLICY_COMMENTS TABLE SCHEMA           ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    try {
        // Login
        console.log('1️⃣  Logging in...');
        let res = await makeRequest('POST', '/backend/index.php?action=login', testUser);

        if (res.status !== 200) {
            console.log('❌ Login failed:', res.body);
            return;
        }

        token = res.body.token;
        console.log('✅ Login successful\n');

        // Request debug info endpoint
        console.log('2️⃣  Requesting debug schema info...');
        res = await makeRequest('GET', '/backend/index.php?action=debug_policy_comments_schema');

        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(res.body, null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
