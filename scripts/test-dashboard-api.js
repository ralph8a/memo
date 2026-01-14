#!/usr/bin/env node
/**
 * Test Dashboard API Endpoints
 * Verifica que los endpoints de dashboard funcionen correctamente
 */

const https = require('https');

// Permitir certificados auto-firmados (solo para desarrollo)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_BASE_URL = 'https://ksinsurancee.com/backend/index.php';

// Test credentials
const TEST_USERS = {
    client: { email: 'maria.garcia@example.com', password: 'Admin123!' },
    agent: { email: 'guillermo.krause@ksinsurancee.com', password: 'Admin123!' },
    admin: { email: 'admin@ksinsurancee.com', password: 'Admin123!' }
};

let tokens = {};

// Colors
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, method = 'GET', data = null, token = null) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: parsedUrl.pathname + parsedUrl.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = https.request(options, (res) => {
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

        req.on('error', (error) => {
            reject(error);
        });

        if (method === 'POST' && data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function login(userType) {
    const user = TEST_USERS[userType];
    const url = `${API_BASE_URL}?action=login`;

    try {
        const result = await makeRequest(url, 'POST', user);

        if (result.status === 200 && result.data.token) {
            tokens[userType] = result.data.token;
            log(`✅ Login exitoso: ${userType}`, 'green');
            return true;
        } else {
            log(`❌ Login falló: ${userType} - ${result.status}`, 'red');
            return false;
        }
    } catch (error) {
        log(`❌ Error en login ${userType}: ${error.message}`, 'red');
        return false;
    }
}

async function testEndpoint(name, url, token, expectedKeys = []) {
    try {
        const result = await makeRequest(url, 'GET', null, token);

        if (result.status === 200) {
            log(`✅ ${name} - OK`, 'green');

            // Verificar estructura de datos
            if (expectedKeys.length > 0 && result.data) {
                const hasKeys = expectedKeys.every(key => key in result.data);
                if (hasKeys) {
                    log(`   Estructura: ${expectedKeys.join(', ')}`, 'cyan');
                } else {
                    log(`   ⚠️ Estructura incompleta`, 'yellow');
                }
            }

            // Mostrar muestra de datos
            log(`   Datos: ${JSON.stringify(result.data).substring(0, 100)}...`, 'cyan');
            return true;
        } else {
            log(`❌ ${name} - ${result.status}`, 'red');
            log(`   Error: ${JSON.stringify(result.data)}`, 'yellow');
            return false;
        }
    } catch (error) {
        log(`❌ ${name} - ${error.message}`, 'red');
        return false;
    }
}

async function main() {
    log('\n═══════════════════════════════════════════════════════', 'blue');
    log('  🧪 TEST DE ENDPOINTS DE DASHBOARD', 'blue');
    log('═══════════════════════════════════════════════════════\n', 'blue');

    // PASO 1: Login
    log('📋 PASO 1: AUTENTICACIÓN', 'cyan');
    log('───────────────────────────────────────────────────────\n', 'cyan');

    await login('client');
    await login('agent');
    await login('admin');

    log('\n📋 PASO 2: ENDPOINTS DE CLIENTE', 'cyan');
    log('───────────────────────────────────────────────────────\n', 'cyan');

    if (tokens.client) {
        await testEndpoint(
            'Client Dashboard',
            `${API_BASE_URL}?action=client_dashboard`,
            tokens.client,
            ['policies', 'claims', 'payments']
        );

        await testEndpoint(
            'Client Policies',
            `${API_BASE_URL}?action=user_policies`,
            tokens.client
        );

        await testEndpoint(
            'Payment History',
            `${API_BASE_URL}?action=payment_history`,
            tokens.client
        );

        await testEndpoint(
            'User Claims',
            `${API_BASE_URL}?action=user_claims`,
            tokens.client
        );

        await testEndpoint(
            'Recent Documents',
            `${API_BASE_URL}?action=recent_documents`,
            tokens.client
        );
    } else {
        log('⚠️ Sin token de cliente, saltando tests', 'yellow');
    }

    log('\n📋 PASO 3: ENDPOINTS DE AGENTE', 'cyan');
    log('───────────────────────────────────────────────────────\n', 'cyan');

    if (tokens.agent) {
        await testEndpoint(
            'Agent Dashboard',
            `${API_BASE_URL}?action=agent_dashboard`,
            tokens.agent,
            ['clients', 'policies', 'commissions']
        );

        await testEndpoint(
            'Agent Clients',
            `${API_BASE_URL}?action=agent_clients`,
            tokens.agent
        );

        await testEndpoint(
            'Agent Stats',
            `${API_BASE_URL}?action=agent_stats`,
            tokens.agent
        );
    } else {
        log('⚠️ Sin token de agente, saltando tests', 'yellow');
    }

    log('\n📋 PASO 4: ENDPOINTS DE ADMIN', 'cyan');
    log('───────────────────────────────────────────────────────\n', 'cyan');

    if (tokens.admin) {
        await testEndpoint(
            'Admin Dashboard',
            `${API_BASE_URL}?action=admin_dashboard`,
            tokens.admin,
            ['users', 'policies', 'revenue']
        );

        await testEndpoint(
            'Admin Stats',
            `${API_BASE_URL}?action=admin_stats`,
            tokens.admin
        );

        await testEndpoint(
            'System Activity',
            `${API_BASE_URL}?action=system_activity`,
            tokens.admin
        );
    } else {
        log('⚠️ Sin token de admin, saltando tests', 'yellow');
    }

    log('\n═══════════════════════════════════════════════════════', 'blue');
    log('  ✅ TESTS COMPLETADOS', 'blue');
    log('═══════════════════════════════════════════════════════\n', 'blue');
}

main().catch(error => {
    log(`\n❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
});
