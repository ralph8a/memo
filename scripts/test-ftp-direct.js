#!/usr/bin/env node
/**
 * Test FTP directo al servidor de cPanel
 */

const ftp = require('basic-ftp');
require('dotenv').config();

const {
    FTP_HOST,
    FTP_USER,
    FTP_PASSWORD
} = process.env;

console.log('🔍 Probando FTP directo a cPanel...\n');
console.log(`Host: ${FTP_HOST}`);
console.log(`User: ${FTP_USER}\n`);

async function test() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        console.log('🔌 Conectando FTP sin TLS (puerto 21)...');
        await client.access({
            host: FTP_HOST,
            port: 21,
            user: FTP_USER,
            password: FTP_PASSWORD,
            secure: false
        });

        console.log('\n✅ ¡CONEXIÓN FTP EXITOSA!\n');

        const pwd = await client.pwd();
        console.log(`📁 Directorio: ${pwd}`);

        const list = await client.list();
        console.log(`📂 Contenido (${list.length} items):`);
        list.slice(0, 10).forEach(item => {
            const type = item.isDirectory ? '📁' : '📄';
            console.log(`   ${type} ${item.name}`);
        });

        client.close();
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  ✅ FTP FUNCIONA - USAR ESTE MÉTODO');
        console.log('═══════════════════════════════════════════════════════\n');

    } catch (err) {
        console.log(`\n❌ Error: ${err.message}\n`);
        client.close();
    }
}

test();
