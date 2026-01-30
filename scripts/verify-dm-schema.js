// Verify and fix direct_messages schema
const fetch = require('node-fetch');

const API_BASE = 'https://ksinsurancee.com/backend';

async function verifySchema() {
    console.log('🔍 Verificando esquema de direct_messages...\n');

    try {
        // Login first
        const loginRes = await fetch(`${API_BASE}/index.php?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'memo@ksi.com',
                password: 'memo123'
            })
        });

        const loginData = await loginRes.json();
        if (!loginData.token) {
            console.error('❌ Login failed');
            return;
        }

        console.log('✅ Login exitoso\n');

        // Check schema via a diagnostic endpoint or query
        // We'll send a test message to see the actual error
        console.log('📤 Intentando enviar mensaje de prueba...\n');

        const testRes = await fetch(`${API_BASE}/index.php?action=dm_send_message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify({
                thread_id: 1,
                message: 'Test schema verification'
            })
        });

        const testData = await testRes.json();

        if (testRes.status === 500) {
            console.log('❌ Error 500 confirmado');
            console.log('Respuesta:', testData);
            console.log('\n📋 DIAGNÓSTICO:');
            console.log('El error 500 indica que la tabla direct_messages probablemente tiene columnas incorrectas.');
            console.log('\nNecesitas ejecutar en la base de datos:');
            console.log(`
ALTER TABLE direct_messages 
DROP COLUMN recipient_id,
ADD COLUMN agent_id INT NOT NULL AFTER thread_id,
ADD COLUMN client_id INT NOT NULL AFTER agent_id,
MODIFY COLUMN sender_type ENUM('agent','client') NOT NULL AFTER sender_id;
            `);
        } else if (testData.success) {
            console.log('✅ Mensaje enviado correctamente');
            console.log('El esquema está correcto');
        } else {
            console.log('⚠️ Respuesta inesperada:', testData);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

verifySchema();
