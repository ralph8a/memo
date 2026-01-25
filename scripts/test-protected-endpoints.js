const https = require('https');

const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VyX3R5cGUiOiJhZ2VudCIsImVtYWlsIjoiZ3VpbGxlcm1vLmtyYXVzZUBrc2luc3VyYW5jZWUuY29tIiwiaWF0IjoxNzY4NDQwNDY2LCJleHAiOjE3Njg1MjY4NjZ9.Tq_n3Vo5PpKlPpeGKeH95Pjmq5vF3Wd83Vvxj4Mp8-Y';

const tests = [
    { name: 'Agent Dashboard', endpoint: 'agent_dashboard' },
    { name: 'Client Dashboard (with token)', endpoint: 'client_dashboard' },
    { name: 'User Policies', endpoint: 'user_policies' },
    { name: 'Payment History', endpoint: 'payment_history' }
];

async function testEndpoint(name, endpoint) {
    return new Promise((resolve) => {
        const url = new URL(`https://ksinsurancee.com/backend/index.php?action=${endpoint}`);
        const agent = new https.Agent({ rejectUnauthorized: false });

        const req = https.request(url, {
            method: 'GET',
            agent,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                console.log(`\n✓ ${name}`);
                console.log(`  Status: ${res.statusCode}`);
                if (res.statusCode === 200) {
                    try {
                        const data = JSON.parse(body);
                        console.log(`  ✅ Response: ${JSON.stringify(data).substring(0, 100)}...`);
                    } catch (e) {
                        console.log(`  Response: ${body.substring(0, 100)}`);
                    }
                } else {
                    console.log(`  ❌ Error: ${body.substring(0, 150)}`);
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.log(`\n✗ ${name}`);
            console.log(`  ❌ ${error.message}`);
            resolve();
        });

        req.end();
    });
}

async function runTests() {
    console.log('🧪 Testing Protected Endpoints with Guillermo Token\n');
    console.log('Token:', token.substring(0, 50) + '...\n');

    for (const test of tests) {
        await testEndpoint(test.name, test.endpoint);
    }

    console.log('\n✅ Tests complete');
}

runTests();
