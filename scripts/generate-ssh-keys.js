#!/usr/bin/env node
/**
 * Generar nuevas claves SSH sin passphrase
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const privDir = path.join(__dirname, '..', 'priv');
const keyPath = path.join(privDir, 'id_rsa_new');
const pubKeyPath = path.join(privDir, 'id_rsa_new.pub');

console.log('═══════════════════════════════════════════════════════');
console.log('  🔑 GENERAR NUEVAS CLAVES SSH');
console.log('═══════════════════════════════════════════════════════');
console.log('');

try {
    // Crear directorio si no existe
    if (!fs.existsSync(privDir)) {
        fs.mkdirSync(privDir, { recursive: true });
    }

    console.log('📝 Generando nuevo par de claves SSH...');
    console.log('   (sin passphrase para deploy automático)');
    console.log('');

    // Generar clave SSH sin passphrase
    execSync(`ssh-keygen -t rsa -b 4096 -f "${keyPath}" -N "" -C "deploy@ksinsurancee.com"`, {
        stdio: 'inherit'
    });

    console.log('');
    console.log('✅ Claves generadas exitosamente:');
    console.log(`   Privada: ${keyPath}`);
    console.log(`   Pública: ${pubKeyPath}`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  📋 SIGUIENTE PASO: CONFIGURAR EN GODADDY');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('1. Copia el contenido de la clave pública:');
    console.log('');

    const pubKey = fs.readFileSync(pubKeyPath, 'utf8');
    console.log(pubKey);

    console.log('');
    console.log('2. Ve a cPanel → SSH Access → Manage SSH Keys');
    console.log('3. Click en "Import Key"');
    console.log('4. Pega la clave pública arriba');
    console.log('5. Click en "Import"');
    console.log('6. Autoriza la clave haciendo click en "Manage" → "Authorize"');
    console.log('');
    console.log('7. Actualiza .env:');
    console.log(`   SSH_KEY_PATH=priv/id_rsa_new`);
    console.log('');
    console.log('8. Ejecuta: npm run rebuild:sftp');
    console.log('');

} catch (err) {
    console.log('❌ Error:', err.message);
    console.log('');
    console.log('💡 Asegúrate de tener OpenSSH instalado:');
    console.log('   Windows: ssh-keygen debe estar en PATH');
    console.log('');
    process.exit(1);
}
