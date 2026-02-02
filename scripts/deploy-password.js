#!/usr/bin/env node
/**
 * Deploy usando WinSCP con PASSWORD (sin SSH key)
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('═══════════════════════════════════════════════════════');
console.log('  🚀 DEPLOY con WinSCP (Password Auth)');
console.log('═══════════════════════════════════════════════════════');
console.log('');

// PASO 1: Verificar dist existe
const distPath = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distPath)) {
    console.log('❌ Carpeta dist/ no existe. Ejecuta npm run build primero.');
    process.exit(1);
}

// Verificar WinSCP
const winscpPaths = [
    'C:\\Program Files (x86)\\WinSCP\\WinSCP.com',
    'C:\\Program Files\\WinSCP\\WinSCP.com',
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'WinSCP', 'WinSCP.com')
];

let winscpPath = null;
for (const p of winscpPaths) {
    if (fs.existsSync(p)) {
        winscpPath = p;
        break;
    }
}

if (!winscpPath) {
    console.log('❌ WinSCP no encontrado. Instala con: winget install WinSCP.WinSCP\n');
    process.exit(1);
}

const ftpHost = process.env.FTP_HOST || '208.109.62.140';
const ftpUser = process.env.FTP_USER || 'nhs13h5k0x0j';
const ftpPassword = process.env.FTP_PASSWORD || '';
const ftpRemotePath = process.env.FTP_REMOTE_PATH || 'public_html';

if (!ftpPassword) {
    console.log('❌ FTP_PASSWORD no configurado en .env\n');
    process.exit(1);
}

console.log(`📤 Subiendo a ${ftpUser}@${ftpHost}:${ftpRemotePath}\n`);

// Crear script WinSCP
const scriptContent = `
option batch abort
option confirm off
open sftp://${ftpUser}:${ftpPassword}@${ftpHost}/
lcd "${distPath}"
cd ${ftpRemotePath}
synchronize remote -delete -criteria=time
exit
`;

const scriptPath = path.join(os.tmpdir(), `winscp-deploy-password-${Date.now()}.txt`);
fs.writeFileSync(scriptPath, scriptContent, 'utf8');

try {
    console.log('Ejecutando WinSCP...\n');
    execSync(`"${winscpPath}" /script="${scriptPath}"`, { stdio: 'inherit' });
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  ✅ DEPLOY EXITOSO');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n🌐 Sitio: https://ksinsurancee.com\n`);
} catch (error) {
    console.error('\n❌ Error en deploy:', error.message);
    process.exit(1);
} finally {
    if (fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
    }
}
