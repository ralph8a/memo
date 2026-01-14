#!/usr/bin/env node
const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function makeRequest(url, token) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: parsedUrl.pathname,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function main() {
    console.log('🔍 Probando headers de Authorization...\n');

    // Login primero
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

    console.log('✅ Login exitoso');
    console.log('Token:', loginResponse.token.substring(0, 50) + '...\n');

    // Probar debug-headers
    const debugUrl = 'https://ksinsurancee.com/backend/debug-headers.php';
    const debugResponse = await makeRequest(debugUrl, loginResponse.token);

    console.log('📋 Resultado del diagnóstico:');
    console.log(JSON.stringify(debugResponse, null, 2));
}

main().catch(console.error);
