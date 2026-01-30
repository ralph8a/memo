#!/usr/bin/env node
/**
 * Deploy usando node-ssh (soporta llaves OpenSSH modernas)
 */

const { NodeSSH } = require('node-ssh');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ssh = new NodeSSH();

console.log('═══════════════════════════════════════════════════════');
console.log('  🚀 REBUILD & DEPLOY con SSH');
console.log('═══════════════════════════════════════════════════════');
console.log('');

const config = {
    host: '208.109.62.140',
    username: 'nhs13h5k0x0j',
    privateKeyPath: path.join(__dirname, '..', 'nhs13h5k0x0j_pem'),
    passphrase: '12345678',
    port: 22
};

async function deploy() {
    try {
        // PASO 1: BUILD
        console.log('📦 PASO 1/3: Compilando proyecto...');
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

        // PASO 2: CONECTAR SSH
        console.log('📤 PASO 2/3: Conectando al servidor...');
        console.log('─'.repeat(55));
        await ssh.connect(config);
        console.log('✅ Conectado a ' + config.host);
        console.log('');

        // PASO 3: SUBIR ARCHIVOS
        console.log('📤 PASO 3/3: Subiendo archivos...');
        console.log('─'.repeat(55));

        // Limpiar directorio remoto primero (excepto .htaccess si existe)
        console.log('🧹 Limpiando archivos antiguos...');
        await ssh.execCommand('cd public_html && find . -maxdepth 1 -type f ! -name ".htaccess" -delete && find . -maxdepth 1 -type d ! -name "." ! -name ".." -exec rm -rf {} + 2>/dev/null || true');

        console.log('📦 Subiendo archivos nuevos...');

        // Subir todo el contenido de dist/
        const failed = [];
        const successful = [];

        await ssh.putDirectory(distPath, '/home/nhs13h5k0x0j/public_html', {
            recursive: true,
            concurrency: 10,
            validate: (itemPath) => {
                const baseName = path.basename(itemPath);
                return baseName !== '.git' && baseName !== 'node_modules';
            },
            tick: (localPath, remotePath, error) => {
                if (error) {
                    failed.push({ local: localPath, error: error.message });
                    console.log(`❌ ${path.relative(distPath, localPath)}`);
                } else {
                    successful.push(localPath);
                    console.log(`✅ ${path.relative(distPath, localPath)}`);
                }
            }
        });

        ssh.dispose();
        console.log('');

        if (failed.length > 0) {
            console.log('⚠️  Algunos archivos fallaron:');
            failed.forEach(f => console.log(`   ${f.local}: ${f.error}`));
            console.log('');
        }

        console.log('═══════════════════════════════════════════════════════');
        console.log('  ✅ DEPLOY COMPLETADO');
        console.log('═══════════════════════════════════════════════════════');
        console.log('');
        console.log(`📊 Archivos subidos: ${successful.length}`);
        console.log(`❌ Archivos fallidos: ${failed.length}`);
        console.log('');
        console.log('🌐 Tu sitio debería estar disponible en:');
        console.log('   → http://ksinsurancee.com');
        console.log('   → https://ksinsurancee.com');
        console.log('');

    } catch (err) {
        ssh.dispose();
        console.log('');
        console.log('═══════════════════════════════════════════════════════');
        console.log('  ❌ ERROR EN EL DEPLOY');
        console.log('═══════════════════════════════════════════════════════');
        console.log('');
        console.log('Error:', err.message);
        console.log('');
        if (err.stack) {
            console.log('Stack:');
            console.log(err.stack);
        }
        console.log('');
        process.exit(1);
    }
}

deploy();
