const https = require('https');
const querystring = require('querystring');

function httpsRequest(url, options = {}, body = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                ...options.headers
            },
            rejectUnauthorized: false
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: { error: data } });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function testDashboardFlow() {
    console.log('🧪 Testing Complete Dashboard Flow\n');

    // Step 1: Login
    console.log('Step 1️⃣: Logging in as Guillermo...');
    const loginResult = await httpsRequest('https://ksinsurancee.com/backend/index.php?action=login', {
        method: 'POST'
    }, 'email=guillermo.krause@ksinsurancee.com&password=Admin123!');

    if (!loginResult.data.token) {
        console.log('❌ Login failed');
        console.log(loginResult.data);
        return;
    }

    const token = loginResult.data.token;
    console.log(`✅ Login success. Token: ${token.substring(0, 50)}...\n`);

    // Step 2: Get Agent Dashboard
    console.log('Step 2️⃣: Fetching agent dashboard...');
    const dashboardResult = await httpsRequest('https://ksinsurancee.com/backend/index.php?action=agent_dashboard', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`Status: ${dashboardResult.status}`);

    if (dashboardResult.status === 200) {
        console.log('✅ Dashboard loaded successfully');
        console.log(`\nStats:`);
        console.log(`  Total Clients: ${dashboardResult.data.stats.total_clients}`);
        console.log(`  Active Policies: ${dashboardResult.data.stats.active_policies}`);
        console.log(`  Pending Claims: ${dashboardResult.data.stats.pending_claims}`);
        console.log(`  Monthly Revenue: $${dashboardResult.data.stats.monthly_revenue}`);
        console.log(`\nClients: ${dashboardResult.data.clients.length} found`);
        if (dashboardResult.data.clients.length > 0) {
            console.log(`  - ${dashboardResult.data.clients[0].name}`);
        }
        console.log(`Claims: ${dashboardResult.data.claims.length} found`);
    } else {
        console.log('❌ Dashboard failed');
        console.log(dashboardResult.data);
    }
}

testDashboardFlow().catch(err => console.error('❌ Error:', err.message));
