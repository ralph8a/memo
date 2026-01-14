#!/usr/bin/env node
/**
 * Test API Endpoints
 * Tests all backend endpoints with dummy data
 */

const https = require('https');
const http = require('http');

const API_BASE_URL = 'https://ksinsurancee.com/backend/index.php';

// Permitir certificados auto-firmados (solo para desarrollo)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Test credentials (all use password: Admin123!)
const TEST_USERS = {
    admin: { email: 'admin@ksinsurancee.com', password: 'Admin123!' },
    agent: { email: 'guillermo.krause@ksinsurancee.com', password: 'Admin123!' },
    client: { email: 'maria.garcia@example.com', password: 'Admin123!' }
};

let authTokens = {};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(endpoint, method = 'GET', data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE_URL);
        const params = new URLSearchParams();
        params.append('action', endpoint);

        if (method === 'GET' && data) {
            Object.keys(data).forEach(key => params.append(key, data[key]));
        }

        url.search = params.toString();

        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const protocol = url.protocol === 'https:' ? https : http;

        const req = protocol.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({ status: res.statusCode, data: response });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
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

async function testLogin(userType) {
    log(`\n📝 Testing Login - ${userType}...`, 'cyan');
    const user = TEST_USERS[userType];

    try {
        const result = await makeRequest('login', 'POST', user);

        // Debug: show what we got back
        log(`   DEBUG Status: ${result.status}`, 'yellow');
        log(`   DEBUG Data: ${JSON.stringify(result.data)}`, 'yellow');

        if (result.status === 200 && result.data.token) {
            authTokens[userType] = result.data.token;
            log(`✅ Login successful for ${userType}`, 'green');
            log(`   Token: ${result.data.token.substring(0, 30)}...`, 'yellow');
            return true;
        } else {
            log(`❌ Login failed for ${userType}: ${JSON.stringify(result.data)}`, 'red');
            return false;
        }
    } catch (error) {
        log(`❌ Login error for ${userType}: ${error.message}`, 'red');
        return false;
    }
}

async function testEndpoint(name, endpoint, userType = 'client', method = 'GET', data = null) {
    log(`\n🔍 Testing: ${name}`, 'blue');

    try {
        const token = authTokens[userType];
        if (!token) {
            log(`❌ No auth token for ${userType}`, 'red');
            return false;
        }

        const result = await makeRequest(endpoint, method, data, token);

        if (result.status === 200) {
            log(`✅ ${name} - Success`, 'green');
            if (result.data) {
                const preview = JSON.stringify(result.data).substring(0, 150);
                log(`   Response: ${preview}...`, 'yellow');
            }
            return true;
        } else {
            log(`❌ ${name} - Failed (${result.status})`, 'red');
            log(`   Error: ${JSON.stringify(result.data)}`, 'red');
            return false;
        }
    } catch (error) {
        log(`❌ ${name} - Error: ${error.message}`, 'red');
        return false;
    }
}

async function runTests() {
    log('═══════════════════════════════════════════════════════', 'cyan');
    log('  🧪 API ENDPOINTS TESTING', 'cyan');
    log('═══════════════════════════════════════════════════════', 'cyan');
    log(`\n🌐 Base URL: ${API_BASE_URL}\n`, 'yellow');

    const results = {
        passed: 0,
        failed: 0,
        total: 0
    };

    // Test Authentication
    log('\n📋 PHASE 1: AUTHENTICATION', 'cyan');
    log('─'.repeat(55), 'cyan');

    for (const userType of ['client', 'agent', 'admin']) {
        results.total++;
        if (await testLogin(userType)) {
            results.passed++;
        } else {
            results.failed++;
        }
    }

    // Test Client Endpoints
    log('\n\n📋 PHASE 2: CLIENT ENDPOINTS', 'cyan');
    log('─'.repeat(55), 'cyan');

    const clientTests = [
        ['Client Dashboard', 'client_dashboard', 'client'],
        ['User Policies', 'user_policies', 'client'],
        ['Payment History', 'payment_history', 'client'],
        ['User Claims', 'user_claims', 'client'],
        ['Recent Documents', 'recent_documents', 'client']
    ];

    for (const [name, endpoint, userType] of clientTests) {
        results.total++;
        if (await testEndpoint(name, endpoint, userType)) {
            results.passed++;
        } else {
            results.failed++;
        }
    }

    // Test Agent Endpoints
    log('\n\n📋 PHASE 3: AGENT ENDPOINTS', 'cyan');
    log('─'.repeat(55), 'cyan');

    const agentTests = [
        ['Agent Dashboard', 'agent_dashboard', 'agent'],
        ['Agent Clients', 'agent_clients', 'agent'],
        ['Agent Stats', 'agent_stats', 'agent'],
        ['Agent Activity', 'agent_activity', 'agent']
    ];

    for (const [name, endpoint, userType] of agentTests) {
        results.total++;
        if (await testEndpoint(name, endpoint, userType)) {
            results.passed++;
        } else {
            results.failed++;
        }
    }

    // Test Admin Endpoints
    log('\n\n📋 PHASE 4: ADMIN ENDPOINTS', 'cyan');
    log('─'.repeat(55), 'cyan');

    const adminTests = [
        ['Admin Dashboard', 'admin_dashboard', 'admin'],
        ['Admin Stats', 'admin_stats', 'admin'],
        ['System Activity', 'system_activity', 'admin']
    ];

    for (const [name, endpoint, userType] of adminTests) {
        results.total++;
        if (await testEndpoint(name, endpoint, userType)) {
            results.passed++;
        } else {
            results.failed++;
        }
    }

    // Test General Endpoints
    log('\n\n📋 PHASE 5: GENERAL ENDPOINTS', 'cyan');
    log('─'.repeat(55), 'cyan');

    const generalTests = [
        ['Get Quotes', 'quotes', 'agent'],
        ['Get Claims', 'claims', 'agent'],
        ['Get Clients', 'clients', 'agent']
    ];

    for (const [name, endpoint, userType] of generalTests) {
        results.total++;
        if (await testEndpoint(name, endpoint, userType)) {
            results.passed++;
        } else {
            results.failed++;
        }
    }

    // Test Submission Endpoints
    log('\n\n📋 PHASE 6: SUBMISSION ENDPOINTS', 'cyan');
    log('─'.repeat(55), 'cyan');

    // Test Quote Submission
    results.total++;
    if (await testEndpoint(
        'Submit Quote',
        'submit_quote',
        'client',
        'POST',
        {
            email: 'test.quote@example.com',
            first_name: 'Test',
            last_name: 'Quote',
            phone: '+52-555-000-0000',
            quote_type: 'auto',
            coverage_details: 'SUV 2024, uso familiar'
        }
    )) {
        results.passed++;
    } else {
        results.failed++;
    }

    // Print Results
    log('\n\n═══════════════════════════════════════════════════════', 'cyan');
    log('  📊 TEST RESULTS', 'cyan');
    log('═══════════════════════════════════════════════════════', 'cyan');
    log(`\nTotal Tests: ${results.total}`, 'blue');
    log(`✅ Passed: ${results.passed}`, 'green');
    log(`❌ Failed: ${results.failed}`, 'red');
    log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%\n`, 'yellow');

    if (results.failed === 0) {
        log('🎉 All tests passed!', 'green');
    } else {
        log('⚠️  Some tests failed. Check the logs above for details.', 'yellow');
    }

    log('\n💡 Next Steps:', 'cyan');
    log('   1. Check backend/config.php database credentials', 'yellow');
    log('   2. Execute database-schema.sql in phpMyAdmin', 'yellow');
    log('   3. Verify PHP error logs if tests fail', 'yellow');
    log('   4. Test in browser: http://ksinsurancee.com\n', 'yellow');
}

// Run tests
runTests().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
});
