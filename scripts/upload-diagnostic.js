#!/usr/bin/env node
/**
 * Quick upload diagnostic.php to server
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('📤 Subiendo diagnostic.php al servidor...\n');

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

const ppkPath = path.join(__dirname, '..', 'nhs13h5k0x0j.ppk');
if (!fs.existsSync(ppkPath)) {
    console.log('❌ Archivo .ppk no encontrado en:', ppkPath);
    process.exit(1);
}

const diagnosticFile = path.join(__dirname, '..', 'backend', 'diagnostic.php');
if (!fs.existsSync(diagnosticFile)) {
    console.log('❌ diagnostic.php no encontrado');
    process.exit(1);
}

const ftpHost = process.env.FTP_HOST || 'ksinsurancee.com';
const ftpUser = process.env.FTP_USER || 'nhs13h5k';
const ftpRemotePath = process.env.FTP_REMOTE_PATH || '/home/nhs13h5k/public_html/backend';

const scriptContent = `
open sftp://${ftpUser}@${ftpHost}/ -privatekey="${ppkPath}" -hostkey=*
cd ${ftpRemotePath}
put "${diagnosticFile}"
exit
`;

const scriptPath = path.join(os.tmpdir(), 'winscp-diagnostic-upload.txt');
fs.writeFileSync(scriptPath, scriptContent, 'utf8');

try {
    execSync(`"${winscpPath}" /script="${scriptPath}"`, { stdio: 'inherit' });
    console.log('\n✅ diagnostic.php subido exitosamente');
    console.log(`\n🌐 Accede a: https://${ftpHost}/backend/diagnostic.php\n`);
} catch (error) {
    console.error('❌ Error al subir archivo:', error.message);
    process.exit(1);
} finally {
    fs.unlinkSync(scriptPath);
}
