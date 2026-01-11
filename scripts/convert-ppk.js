#!/usr/bin/env node
/**
 * Convertir .ppk a OpenSSH sin passphrase usando puttygen
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ppkPath = path.join('C:', 'Users', 'rafae', 'Downloads', 'id_rsa.ppk');
const outputPath = path.join(__dirname, '..', 'priv', 'id_rsa_deploy');
const puttygenPath = path.join('C:', 'Program Files', 'PuTTY', 'puttygen.exe');

console.log('🔑 Convirtiendo .ppk a OpenSSH sin passphrase...\n');

try {
    // Convertir con puttygen removiendo passphrase
    const cmd = `"${puttygenPath}" "${ppkPath}" -O private-openssh -o "${outputPath}" --old-passphrase "Inspiron1999#" --new-passphrase ""`;

    console.log('Ejecutando conversión...');
    execSync(cmd, { stdio: 'inherit' });

    if (fs.existsSync(outputPath)) {
        console.log('\n✅ Conversión exitosa!');
        console.log(`   Archivo: ${outputPath}`);

        // Reemplazar clave anterior
        const finalPath = path.join(__dirname, '..', 'priv', 'id_rsa');
        fs.copyFileSync(outputPath, finalPath);
        fs.unlinkSync(outputPath);

        console.log(`✅ Clave actualizada: ${finalPath}`);
        console.log('\n🚀 Ahora ejecuta: npm run rebuild:sftp\n');

    } else {
        console.log('\n❌ Error: Archivo no creado');
    }

} catch (err) {
    console.log('\n❌ Error:', err.message);
}
