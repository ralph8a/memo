#!/usr/bin/env node
/**
 * Script de DIAGNÓSTICO FTP
 * Prueba diferentes configuraciones para encontrar el problema
 */

const ftp = require('basic-ftp');
const dns = require('dns').promises;
const net = require('net');
require('dotenv').config();

const {
    FTP_HOST,
    FTP_PORT = '21',
    FTP_USER,
    FTP_PASSWORD
} = process.env;

console.log('═══════════════════════════════════════════════════════');
console.log('  🔍 DIAGNÓSTICO FTP DETALLADO');
console.log('═══════════════════════════════════════════════════════');
console.log('');

async function testDNS() {
    console.log('🌐 PASO 1: Resolviendo DNS...');
    console.log('─'.repeat(55));
    try {
        const addresses = await dns.resolve4(FTP_HOST);
        console.log(`✅ DNS resuelto: ${FTP_HOST} → ${addresses.join(', ')}`);
        console.log('');
        return addresses[0];
    } catch (err) {
        console.log(`❌ Error DNS: ${err.message}`);
        console.log('');
        return null;
    }
}

async function testTCP(ip) {
    console.log('🔌 PASO 2: Probando conexión TCP...');
    console.log('─'.repeat(55));

    return new Promise((resolve) => {
        const socket = new net.Socket();
        const timeout = setTimeout(() => {
            socket.destroy();
            console.log(`❌ Timeout: No se pudo conectar en 10 segundos`);
            console.log('');
            resolve(false);
        }, 10000);

        socket.on('connect', () => {
            clearTimeout(timeout);
            console.log(`✅ Conexión TCP exitosa a ${ip}:${FTP_PORT}`);
            socket.destroy();
            console.log('');
            resolve(true);
        });

        socket.on('error', (err) => {
            clearTimeout(timeout);
            console.log(`❌ Error TCP: ${err.message}`);
            console.log(`   Código: ${err.code}`);
            console.log('');
            resolve(false);
        });

        socket.connect(Number(FTP_PORT), ip);
    });
}

async function testFTP(secure, secureMode) {
    const label = secure ? `TLS ${secureMode}` : 'Sin TLS';
    console.log(`📡 PASO 3${secure ? (secureMode === 'explicit' ? 'a' : 'b') : ''}: Probando FTP ${label}...`);
    console.log('─'.repeat(55));

    const client = new ftp.Client();
    client.ftp.verbose = true; // Ver todos los comandos

    try {
        const config = {
            host: FTP_HOST,
            port: Number(FTP_PORT),
            user: FTP_USER,
            password: FTP_PASSWORD,
            connTimeout: 15000,
            pasvTimeout: 15000
        };

        if (secure) {
            config.secure = secureMode;
            config.secureOptions = {
                rejectUnauthorized: false
            };
        }

        console.log(`Configuración:`);
        console.log(`  Host: ${config.host}:${config.port}`);
        console.log(`  User: ${config.user}`);
        console.log(`  Secure: ${config.secure || false}`);
        console.log('');

        await client.access(config);

        console.log(`✅ Conexión FTP ${label} exitosa!`);
        console.log('');

        // Probar comando PWD
        const pwd = await client.pwd();
        console.log(`📁 Directorio actual: ${pwd}`);
        console.log('');

        // Listar directorios
        const list = await client.list();
        console.log(`📂 Contenido del directorio:`);
        list.slice(0, 5).forEach(item => {
            const type = item.isDirectory ? '📁' : '📄';
            console.log(`   ${type} ${item.name}`);
        });
        if (list.length > 5) {
            console.log(`   ... y ${list.length - 5} más`);
        }
        console.log('');

        client.close();
        return true;

    } catch (err) {
        console.log(`❌ Error FTP ${label}:`);
        console.log(`   Tipo: ${err.name}`);
        console.log(`   Mensaje: ${err.message}`);
        if (err.code) console.log(`   Código: ${err.code}`);
        console.log('');
        client.close();
        return false;
    }
}

async function diagnose() {
    try {
        // Verificar credenciales
        if (!FTP_HOST || !FTP_USER || !FTP_PASSWORD) {
            console.log('❌ Faltan credenciales en .env');
            return;
        }

        // 1. DNS
        const ip = await testDNS();
        if (!ip) {
            console.log('💡 Solución: Verifica que el dominio sea correcto');
            return;
        }

        // 2. TCP
        const tcpOk = await testTCP(ip);
        if (!tcpOk) {
            console.log('💡 Posibles causas:');
            console.log('   - Firewall bloqueando puerto 21');
            console.log('   - IP bloqueada por GoDaddy');
            console.log('   - Servicio FTP deshabilitado');
            return;
        }

        // 3. FTP sin TLS
        const plainOk = await testFTP(false);

        // 4. FTP con TLS explícito
        const explicitOk = await testFTP(true, 'explicit');

        // 5. FTP con TLS implícito
        // const implicitOk = await testFTP(true, 'implicit');

        // Resumen
        console.log('═══════════════════════════════════════════════════════');
        console.log('  📊 RESUMEN DEL DIAGNÓSTICO');
        console.log('═══════════════════════════════════════════════════════');
        console.log('');
        console.log(`DNS:              ${ip ? '✅' : '❌'}`);
        console.log(`TCP (puerto 21):  ${tcpOk ? '✅' : '❌'}`);
        console.log(`FTP sin TLS:      ${plainOk ? '✅' : '❌'}`);
        console.log(`FTP TLS explicit: ${explicitOk ? '✅' : '❌'}`);
        console.log('');

        if (plainOk || explicitOk) {
            console.log('✅ ¡SOLUCIÓN ENCONTRADA!');
            console.log(`   Usar: ${plainOk ? 'FTP sin TLS' : 'FTP con TLS explicit'}`);
        } else if (tcpOk) {
            console.log('⚠️  El puerto responde pero FTP falla');
            console.log('   Posibles causas:');
            console.log('   - Credenciales incorrectas');
            console.log('   - Puerto 21 no es FTP (proxy/firewall)');
            console.log('   - Requiere configuración especial');
        } else {
            console.log('❌ No se puede conectar al servidor');
            console.log('   Verifica con GoDaddy soporte técnico');
        }
        console.log('');

    } catch (err) {
        console.log('❌ Error inesperado:', err.message);
    }
}

diagnose();
