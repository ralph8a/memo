#!/usr/bin/env node
const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testJWT() {
    // Login
    const loginUrl = 'https://ksinsurancee.com/backend/index.php?action=login';
    const loginData = JSON.stringify({
        email: 'maria.garcia@example.com',
        password: 'Admin123!'
    });

    const loginResponse = await new Promise((resolve, reject) => {
        const url = new URL(loginUrl);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(loginData)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });

        req.on('error', reject);
        req.write(loginData);
        req.end();
    });

    if (!loginResponse.token) {
        console.log('❌ Login falló');
        return;
    }

    console.log('✅ Login exitoso\n');

    // Test verify_token endpoint
    const verifyUrl = 'https://ksinsurancee.com/backend/index.php?action=verify_token';

    const verifyResponse = await new Promise((resolve, reject) => {
        const url = new URL(verifyUrl);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${loginResponse.token}`
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });

    console.log('📋 Test Verify Token:');
    console.log('Status:', verifyResponse.status);
    console.log('Respuesta:', JSON.stringify(verifyResponse.data, null, 2));
}

testJWT().catch(console.error);
