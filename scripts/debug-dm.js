#!/usr/bin/env node
/**
 * Check if direct_message_threads table exists
 */
require('dotenv').config();
const https = require('https');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BASE_URL = 'https://ksinsurancee.com';

async function checkTable() {
    return new Promise((resolve) => {
        const url = new URL(`${BASE_URL}/backend/index.php?action=dm_unread_count`);

        const req = https.request(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJuYW1lIjoiR3VpbGxlcm1vIiwi dXNlcl90eXBlIjoiYWRtaW4iLCJlbWFpbCI6Imd1aWxsZXJtby5rcmF1c2VAa3NpbnN1cmFuY2VlLmNvbSIsImlhdCI6MTczNjkwMzMyNH0.N4vJ1g9n4gJ6H6zL8k5qZvN3mQ2pR8sT9uV3wX1yZ2a'
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                console.log('Status:', res.statusCode);
                try {
                    console.log('Response:', JSON.parse(body));
                } catch {
                    console.log('Response:', body);
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error('Error:', e.message);
            resolve();
        });

        req.end();
    });
}

checkTable();
