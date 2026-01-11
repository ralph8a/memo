#!/usr/bin/env node
/**
 * Deploy usando WinSCP con .ppk
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

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

    const scriptPath = path.join(__dirname, 'winscp-deploy.txt');

    console.log(`Ejecutando WinSCP...`);
    execSync(`"${winscpPath}" /script="${scriptPath}"`, { stdio: 'inherit' });

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
