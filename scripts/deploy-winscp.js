#!/usr/bin/env node
/**
 * Deploy usando WinSCP con .ppk
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('═══════════════════════════════════════════════════════');
console.log('  🚀 REBUILD & DEPLOY con WinSCP');
console.log('═══════════════════════════════════════════════════════');
console.log('');

try {
    // PASO 1: BUILD
    console.log('📦 PASO 1/2: Compilando proyecto...');
    console.log('─'.repeat(55));
    execSync('npm run build', { stdio: 'inherit' });
    console.log('');
    console.log('✅ Compilación exitosa');
    console.log('');

    // Verificar dist/
    const distPath = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(distPath)) {
        throw new Error('No se generó la carpeta dist/');
    }

    // Copiar backend a dist
    console.log('📁 Copiando archivos backend...');
    const backendSrc = path.join(__dirname, '..', 'backend');
    const backendDest = path.join(distPath, 'backend');

    if (fs.existsSync(backendSrc)) {
        if (!fs.existsSync(backendDest)) {
            fs.mkdirSync(backendDest, { recursive: true });
        }

        const backendFiles = fs.readdirSync(backendSrc);
        backendFiles.forEach(file => {
            const srcFile = path.join(backendSrc, file);
            const destFile = path.join(backendDest, file);
            if (fs.statSync(srcFile).isFile()) {
                fs.copyFileSync(srcFile, destFile);
            }
        });
        console.log('✅ Backend copiado');
    }
    console.log('');

    // Corregir .htaccess
    const htaccessPath = path.join(distPath, '.htaccess');
    const htaccessDirPath = path.join(distPath, '.htaccess', '.htaccess');

    if (fs.existsSync(htaccessDirPath)) {
        console.log('🔧 Corrigiendo .htaccess...');
        const content = fs.readFileSync(htaccessDirPath, 'utf8');
        fs.rmSync(path.join(distPath, '.htaccess'), { recursive: true, force: true });
        fs.writeFileSync(htaccessPath, content);
        console.log('✅ .htaccess corregido');
        console.log('');
    }

    // PASO 2: DEPLOY con WinSCP
    console.log('📤 PASO 2/2: Subiendo archivos via WinSCP/SFTP...');
    console.log('─'.repeat(55));

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
        console.log('❌ WinSCP no encontrado');
        console.log('');
        console.log('💡 Instala WinSCP:');
        console.log('   winget install WinSCP.WinSCP');
        console.log('');
        console.log('O usa el deploy manual con el archivo ZIP.');
        process.exit(1);
    }

    const ftpProtocol = process.env.FTP_PROTOCOL || 'sftp';
    const ftpHost = process.env.FTP_HOST || 'localhost';
    const ftpPort = process.env.FTP_PORT || '22';
    const ftpUser = process.env.FTP_USER || '';
    const ftpPass = process.env.FTP_PASSWORD || '';
    const ftpRemotePath = process.env.FTP_REMOTE_PATH || 'public_html';
    const sshKeyPathEnv = process.env.SSH_KEY_PATH || '';
    const sshKeyPassphrase = process.env.SSH_KEY_PASSPHRASE || '';

    if (!ftpUser) throw new Error('FTP_USER no definido');
    if (!ftpHost) throw new Error('FTP_HOST no definido');

    // Resolver ruta de la llave privada
    const projectRoot = path.join(__dirname, '..');
    const keyCandidates = [];
    if (sshKeyPathEnv) {
        const base = path.isAbsolute(sshKeyPathEnv) ? sshKeyPathEnv : path.join(projectRoot, sshKeyPathEnv);
        if (!path.extname(base)) {
            // Prioridad: .ppk > base (openssh) > .pem
            keyCandidates.push(`${base}.ppk`);
            keyCandidates.push(base);
            keyCandidates.push(`${base}.pem`);
        } else {
            keyCandidates.push(base);
        }
    }
    // Intentar con nombres conocidos si no se encontró aún (prioridad .ppk)
    keyCandidates.push(path.join(projectRoot, 'nhs13h5k0x0j.ppk'));
    keyCandidates.push(path.join(projectRoot, 'nhs13h5k0x0j_pem'));
    keyCandidates.push(path.join(projectRoot, 'nhs13h5k0x0j.pem'));

    const sshKeyPath = keyCandidates.find(p => fs.existsSync(p));
    if (!sshKeyPath) {
        throw new Error('No se encontró la llave SSH. Revisa SSH_KEY_PATH en .env');
    }

    // Construir script temporal de WinSCP usando llave SSH (password solo como respaldo)
    const remotePath = ftpRemotePath.startsWith('/') ? ftpRemotePath : `./${ftpRemotePath}`;

    const openParts = [
        `${ftpProtocol}://${ftpUser}@${ftpHost}:${ftpPort}/`,
        `-privatekey="${sshKeyPath}"`
    ];
    if (sshKeyPassphrase) {
        openParts.push(`-passphrase="${sshKeyPassphrase}"`);
    }
    if (ftpPass) {
        // Proveer contraseña siempre para evitar prompt interactivo si la llave falla
        openParts.push(`-password="${ftpPass}"`);
    }

    const scriptLines = [
        'option batch abort',
        'option confirm off',
        `open ${openParts.join(' ')}`,
        `cd ${remotePath}`,
        'put -delete dist\\*',
        'exit'
    ];

    const tmpScript = path.join(os.tmpdir(), `winscp-deploy-${Date.now()}.txt`);
    fs.writeFileSync(tmpScript, scriptLines.join('\n'));

    console.log(`Ejecutando WinSCP contra ${ftpHost}:${ftpPort} (usuario: ${ftpUser})...`);
    execSync(`"${winscpPath}" /script="${tmpScript}"`, { stdio: 'inherit' });

    fs.rmSync(tmpScript, { force: true });

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  ✅ DEPLOY COMPLETADO EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('🌐 Tu sitio debería estar disponible en:');
    console.log('   → http://ksinsurancee.com');
    console.log('');

} catch (err) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  ❌ ERROR EN EL DEPLOY');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('Error:', err.message);
    console.log('');
    process.exit(1);
}
