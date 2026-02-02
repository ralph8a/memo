#!/usr/bin/env node
/**
 * Convert OpenSSH PEM key to PuTTY PPK format
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔑 Convirtiendo clave SSH a formato .ppk\n');

const pemPath = path.join(__dirname, '..', 'nhs13h5k0x0j_pem');
const ppkPath = path.join(__dirname, '..', 'nhs13h5k0x0j.ppk');

if (!fs.existsSync(pemPath)) {
    console.log('❌ Archivo PEM no encontrado:', pemPath);
    process.exit(1);
}

// Buscar PuTTYgen
const puttygenPaths = [
    'C:\\Program Files\\PuTTY\\puttygen.exe',
    'C:\\Program Files (x86)\\PuTTY\\puttygen.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'PuTTY', 'puttygen.exe')
];

let puttygenPath = null;
for (const p of puttygenPaths) {
    if (fs.existsSync(p)) {
        puttygenPath = p;
        break;
    }
}

if (!puttygenPath) {
    console.log('❌ PuTTYgen no encontrado.\n');
    console.log('Instala PuTTY con:');
    console.log('  winget install PuTTY.PuTTY\n');
    console.log('O descarga desde: https://www.putty.org/\n');
    process.exit(1);
}

try {
    console.log('Ejecutando PuTTYgen...');

    // Convertir PEM a PPK
    execSync(`"${puttygenPath}" "${pemPath}" -O private -o "${ppkPath}"`, {
        stdio: 'inherit'
    });

    console.log('\n✅ Clave convertida exitosamente');
    console.log('📁 Archivo PPK:', ppkPath);
    console.log('\nAhora puedes usar deploy-winscp.js con la clave .ppk\n');
} catch (error) {
    console.error('\n❌ Error al convertir clave:', error.message);
    process.exit(1);
}
