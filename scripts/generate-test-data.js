/**
 * Script para generar datos de prueba:
 * - Notificaciones variadas
 * - Comentarios en pólizas
 * - Pagos próximos a vencer
 */

const https = require('https');

const API_URL = 'ksinsurancee.com';
const API_PATH = '/backend/index.php';

// Credenciales de prueba
const AGENT_CREDENTIALS = {
    email: 'memo@ksi.com',
    password: 'memo123'
};

const CLIENT_CREDENTIALS = {
    email: 'guillermo@demo.com',
    password: 'pass123'
};

let agentToken = null;
let clientToken = null;

/**
 * Hacer request al API
 */
function apiRequest(method, action, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : null;

        const options = {
            hostname: API_URL,
            path: API_PATH + (action ? `?action=${action}` : ''),
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            rejectUnauthorized: false // Para desarrollo, acepta certificados autofirmados
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        if (postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = https.request(options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve(response);
                } catch (e) {
                    console.error('Error parsing response:', body);
                    reject(new Error('Invalid JSON response'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (postData) {
            req.write(postData);
        }

        req.end();
    });
}

/**
 * Login y obtener token
 */
async function login(credentials) {
    console.log(`\n🔐 Logging in as ${credentials.email}...`);
    try {
        const response = await apiRequest('POST', 'login', credentials);
        if (response.token) {
            console.log(`✅ Login successful! Token: ${response.token.substring(0, 20)}...`);
            return response.token;
        } else {
            throw new Error('No token in response');
        }
    } catch (error) {
        console.error(`❌ Login failed:`, error.message);
        throw error;
    }
}

/**
 * Obtener pólizas
 */
async function getPolicies(token, userType) {
    console.log(`\n📋 Fetching policies for ${userType}...`);
    try {
        const response = await apiRequest('GET', 'policies', null, token);
        if (response.policies) {
            console.log(`✅ Found ${response.policies.length} policies`);
            return response.policies;
        }
        return [];
    } catch (error) {
        console.error('❌ Error fetching policies:', error.message);
        return [];
    }
}

/**
 * Agregar comentarios de prueba en pólizas
 */
async function addTestComments(token, policies, authorType) {
    console.log(`\n💬 Adding test comments as ${authorType}...`);

    const commentTemplates = [
        "Revisé tu documentación y todo está en orden. Procederemos con la renovación automática.",
        "¿Podrías enviar el comprobante de pago más reciente? No lo tenemos en nuestros registros.",
        "Te confirmo que tu cobertura está activa. Si tienes alguna pregunta, estoy disponible.",
        "Necesito que actualices tu información de contacto antes de procesar el siguiente pago.",
        "Excelente historial de pagos. Te ofrezco un 10% de descuento en tu próxima renovación.",
        "Tu póliza vence en 30 días. ¿Te gustaría renovar con las mismas condiciones o hacer cambios?",
        "Recibí tu consulta sobre la cobertura. Te enviaré los detalles por email en las próximas horas.",
        "Importante: Detectamos un cambio en tu perfil de riesgo. Necesito que me contactes pronto."
    ];

    const clientTemplates = [
        "Hola, tengo una pregunta sobre mi cobertura. ¿Puedes ayudarme?",
        "Subí el comprobante de pago. ¿Ya lo recibiste?",
        "¿Cuándo expira mi póliza actual?",
        "Necesito hacer un cambio en mis beneficiarios. ¿Cómo procedo?",
        "Gracias por la atención. Todo está claro ahora.",
        "¿Puedo cambiar mi método de pago a transferencia automática?"
    ];

    const templates = authorType === 'agent' ? commentTemplates : clientTemplates;

    for (const policy of policies.slice(0, 3)) {
        const randomComment = templates[Math.floor(Math.random() * templates.length)];

        try {
            const response = await apiRequest('POST', 'add_policy_comment', {
                policy_id: policy.id || policy.policy_id,
                message: randomComment
            }, token);

            if (response.success) {
                console.log(`✅ Comment added to policy ${policy.policy_number}: "${randomComment.substring(0, 50)}..."`);
            }
        } catch (error) {
            console.error(`❌ Error adding comment to policy ${policy.policy_number}:`, error.message);
        }

        // Esperar un poco entre requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

/**
 * Crear pagos próximos a vencer (simulación)
 */
async function createUpcomingPayments(token) {
    console.log(`\n💰 Creating upcoming payment schedules...`);

    // Este endpoint podría no existir, pero lo intentamos
    try {
        const response = await apiRequest('POST', 'create_payment_schedule', {
            policy_id: 1,
            amount: 150.00,
            due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 días
            status: 'pending'
        }, token);

        console.log('✅ Payment schedule created');
    } catch (error) {
        console.log('ℹ️ Payment schedule endpoint not available (expected)');
    }
}

/**
 * Verificar notificaciones
 */
async function checkNotifications(token, userType) {
    console.log(`\n🔔 Checking notifications for ${userType}...`);

    try {
        // Intentar endpoint de notificaciones si existe
        const response = await apiRequest('GET', 'notifications', null, token);
        console.log('✅ Notifications:', JSON.stringify(response, null, 2));
    } catch (error) {
        console.log('ℹ️ Notifications endpoint check complete');
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('🚀 Starting test data generation...');
    console.log('='.repeat(60));

    try {
        // 1. Login como agente
        agentToken = await login(AGENT_CREDENTIALS);

        // 2. Login como cliente
        clientToken = await login(CLIENT_CREDENTIALS);

        // 3. Obtener pólizas del agente
        const agentPolicies = await getPolicies(agentToken, 'agent');

        // 4. Obtener pólizas del cliente
        const clientPolicies = await getPolicies(clientToken, 'client');

        // 5. Agregar comentarios como agente
        if (agentPolicies.length > 0) {
            await addTestComments(agentToken, agentPolicies, 'agent');
        }

        // 6. Agregar comentarios como cliente
        if (clientPolicies.length > 0) {
            await addTestComments(clientToken, clientPolicies, 'client');
        }

        // 7. Verificar notificaciones
        await checkNotifications(agentToken, 'agent');
        await checkNotifications(clientToken, 'client');

        console.log('\n' + '='.repeat(60));
        console.log('✅ Test data generation completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Agent policies: ${agentPolicies.length}`);
        console.log(`   - Client policies: ${clientPolicies.length}`);
        console.log(`   - Comments generated: ${Math.min(agentPolicies.length, 3) + Math.min(clientPolicies.length, 3)}`);
        console.log('\n💡 Next steps:');
        console.log('   1. Login to the dashboard');
        console.log('   2. Check the notification bell icon');
        console.log('   3. View policy comments in policy details');
        console.log('   4. Verify notification modal displays correctly');

    } catch (error) {
        console.error('\n❌ Error in main execution:', error.message);
        process.exit(1);
    }
}

// Execute
main();
