#!/usr/bin/env node
/**
 * Prueba puertos alternativos de GoDaddy
 */

const net = require('net');
const dns = require('dns').promises;
require('dotenv').config();

const FTP_HOST = process.env.FTP_HOST;
const PORTS_TO_TEST = [21, 22, 8021, 2121, 990, 989];

console.log('🔍 Probando puertos FTP en GoDaddy...\n');

async function testPort(ip, port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        const timeout = setTimeout(() => {
            socket.destroy();
            resolve({ port, status: 'timeout', time: 5000 });
        }, 5000);

        const startTime = Date.now();

        socket.on('connect', () => {
            clearTimeout(timeout);
            const time = Date.now() - startTime;
            socket.destroy();
            resolve({ port, status: 'open', time });
        });

        socket.on('error', (err) => {
            clearTimeout(timeout);
            const time = Date.now() - startTime;
            resolve({ port, status: err.code, time });
        });

        socket.connect(port, ip);
    });
}

async function scan() {
    try {
        const addresses = await dns.resolve4(FTP_HOST);
        const ip = addresses[0];

        console.log(`Host: ${FTP_HOST}`);
        console.log(`IP: ${ip}\n`);
        console.log('─'.repeat(60));
        console.log('Puerto    Estado         Tiempo    Servicio');
        console.log('─'.repeat(60));

        for (const port of PORTS_TO_TEST) {
            const result = await testPort(ip, port);
            const status = result.status === 'open' ? '✅ ABIERTO' :
                result.status === 'timeout' ? '❌ Timeout' :
                    `❌ ${result.status}`;
            const service = port === 21 ? 'FTP' :
                port === 22 ? 'SSH/SFTP' :
                    port === 990 ? 'FTPS implícito' :
                        port === 989 ? 'FTPS data' :
                            port === 8021 ? 'FTP alt' :
                                port === 2121 ? 'FTP alt' : '';

            console.log(`${String(port).padEnd(10)}${status.padEnd(15)}${String(result.time).padEnd(10)}${service}`);
        }

        console.log('─'.repeat(60));
        console.log('\n💡 Si ningún puerto está abierto, GoDaddy requiere:');
        console.log('   1. Habilitar FTP en el panel de control');
        console.log('   2. Usar File Manager para subir archivos');
        console.log('   3. Contactar soporte para activar FTP\n');

    } catch (err) {
        console.log('❌ Error:', err.message);
    }
}

scan();
