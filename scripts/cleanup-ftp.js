/**
 * FTP Cleanup Script
 * Elimina archivos de prueba y testing del servidor de producción
 * Mantiene solo archivos necesarios y actuales
 */

const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

// Archivos a ELIMINAR del directorio raíz
const ROOT_FILES_TO_DELETE = [
    'tmp_krause.app.js',
    'nhs13h5k0x0j',
    'nhs13h5k0x0j.ppk',
    'nhs13h5k0x0j.pub',
    'server.log',
    'PRODUCCION RISKMEDIA MEXICO .xlsx',
    // Archivos markdown de documentación (no necesarios en producción)
    'AGENT-DASHBOARD-DESIGN.md',
    'ANALISIS_COMPLETO_SISTEMA.md',
    'AUTH-TROUBLESHOOTING.md',
    'BACKEND-DEPLOYMENT.md',
    'BACKEND-IMPLEMENTATION.md',
    'BACKEND-INTEGRATION-STATUS.md',
    'CALENDAR-INTEGRATION-GUIDE.md',
    'CALENDAR-PAYMENTS-IMPLEMENTATION.md',
    'CLIENT-AUTO-CREATION.md',
    'CONVERT_PPK.md',
    'CORRECCIONES-DASHBOARD-AGENTE.md',
    'CRONJOB-SETUP-INSTRUCTIONS.txt',
    'DASHBOARD-ACTIONS-IMPLEMENTATION.md',
    'DATABASE-FIX-REQUIRED.md',
    'FIXES-APPLIED.md',
    'JS-CLEANUP-SUMMARY.md',
    'LOGIN-DATABASE-ANALYSIS.md',
    'SCHEDULING_GUIDE.md',
    'SCROLL-COLLAPSE-APPROACH.md',
    'SCROLL-FIX-SUMMARY.md',
    'SCROLL-STRATEGY.md',
    'SCROLL-UNIVERSAL-IMPLEMENTATION.md',
    'SETUP-GUIDE.md',
    'SQL-CRONJOBS-SETUP-GUIDE.md',
    'SSL-SETUP-GUIDE.md',
    'UI-IMPROVEMENTS-IMPLEMENTATION.md'
];

// Archivos a ELIMINAR del directorio backend/
const BACKEND_FILES_TO_DELETE = [
    'backend/demo-data-broker.sql',
    'backend/demo-data-maria-garcia.sql',
    'backend/demo-data-maria-garcia-CORRECTED.sql',
    'backend/demo-data-maria-garcia-FIXED.sql',
    'backend/demo-data-maria-garcia-ready.sql',
    'backend/demo-data-simple.sql',
    'backend/execute-demo-data.php',
    'backend/insert-test-data.sql',
    'backend/run-test-data-insert.php',
    'backend/fix-passwords.php',
    'backend/fix-passwords.sql',
    'backend/generate-hash.php',
    'backend/check-users.php',
    'backend/list-users.php',
    'backend/simple-login-test.php',
    'backend/test-jwt.php',
    'backend/test-login.php',
    'backend/debug-headers.php',
    'backend/diagnostic.php',
    'backend/cleanup-temp-files.php',
    'backend/run-schema-update.php',
    'backend/database-schema.sql',
    'backend/meetings-schema.sql',
    'backend/payments-schema.sql',
    // Archivos markdown en backend
    'backend/DEPLOYMENT-CHECKLIST.md',
    'backend/IMPLEMENTATION-SUMMARY.md',
    'backend/PAYMENT-SYSTEM-README.md',
    'backend/POLICY-ANALYSIS-GUIDE.md',
    'backend/README.md'
];

// Archivos ESENCIALES que deben mantenerse
const ESSENTIAL_FILES = {
    root: [
        'index.html',
        'loading.html',
        'admin.html',
        'payment-demo.html',
        'diagnostic.html',
        'krause.app.js',
        'manifest.json',
        '.htaccess',
        'favicon.ico'
    ],
    backend: [
        'api-endpoints.php',
        'auth.php',
        'calendar-service.php',
        'client-from-policy.php',
        'config.php',
        'database.php',
        'document-matcher.php',
        'email-service.php',
        'index.php',
        'payment-api.php',
        'payment-cron.php',
        'payment-schedule-generator.php',
        'payment-service.php',
        'policy-analyzer.php',
        'receipt-analyzer.php'
    ]
};

async function cleanupFTP() {
    console.log('🧹 Iniciando limpieza de archivos FTP...\n');

    try {
        // Conectar a SSH
        console.log('🔐 Conectando a servidor...');
        await ssh.connect({
            host: '208.109.62.140',
            username: 'nhs13h5k0x0j',
            privateKeyPath: 'nhs13h5k0x0j_pem',
            passphrase: '12345678'
        });
        console.log('✅ Conectado exitosamente\n');

        // PASO 1: Limpiar archivos del directorio raíz
        console.log('📁 PASO 1: Limpiando archivos de la raíz...');
        let deletedCount = 0;

        for (const file of ROOT_FILES_TO_DELETE) {
            try {
                const result = await ssh.execCommand(`rm -f ~/public_html/${file}`);
                if (result.code === 0) {
                    console.log(`  ✅ Eliminado: ${file}`);
                    deletedCount++;
                } else if (result.stderr && !result.stderr.includes('No such file')) {
                    console.log(`  ⚠️  No se pudo eliminar ${file}: ${result.stderr}`);
                }
            } catch (error) {
                console.log(`  ⚠️  Error eliminando ${file}: ${error.message}`);
            }
        }

        console.log(`\n✅ Archivos eliminados de raíz: ${deletedCount}\n`);

        // PASO 2: Limpiar archivos del directorio backend/
        console.log('📁 PASO 2: Limpiando archivos de backend/...');
        deletedCount = 0;

        for (const file of BACKEND_FILES_TO_DELETE) {
            try {
                const result = await ssh.execCommand(`rm -f ~/public_html/${file}`);
                if (result.code === 0) {
                    console.log(`  ✅ Eliminado: ${file}`);
                    deletedCount++;
                } else if (result.stderr && !result.stderr.includes('No such file')) {
                    console.log(`  ⚠️  No se pudo eliminar ${file}: ${result.stderr}`);
                }
            } catch (error) {
                console.log(`  ⚠️  Error eliminando ${file}: ${error.message}`);
            }
        }

        console.log(`\n✅ Archivos eliminados de backend/: ${deletedCount}\n`);

        // PASO 3: Limpiar directorio demo-policies/
        console.log('📁 PASO 3: Limpiando demo-policies/...');
        const demoPoliciesResult = await ssh.execCommand('rm -rf ~/public_html/backend/demo-policies/*');
        if (demoPoliciesResult.code === 0) {
            console.log('  ✅ Directorio demo-policies/ limpiado\n');
        }

        // PASO 4: Verificar archivos restantes
        console.log('📋 PASO 4: Verificando archivos esenciales...\n');

        console.log('🔍 Archivos en raíz:');
        const rootFiles = await ssh.execCommand('ls -lh ~/public_html/*.{html,js,json,ico} 2>/dev/null | awk \'{print $9}\'');
        if (rootFiles.stdout) {
            const files = rootFiles.stdout.split('\n').filter(f => f.trim());
            files.forEach(file => {
                const basename = file.split('/').pop();
                const isEssential = ESSENTIAL_FILES.root.includes(basename);
                console.log(`  ${isEssential ? '✅' : '⚠️ '} ${basename}`);
            });
        }

        console.log('\n🔍 Archivos en backend/:');
        const backendFiles = await ssh.execCommand('ls -1 ~/public_html/backend/*.php 2>/dev/null');
        if (backendFiles.stdout) {
            const files = backendFiles.stdout.split('\n').filter(f => f.trim());
            files.forEach(file => {
                const basename = file.split('/').pop();
                const isEssential = ESSENTIAL_FILES.backend.includes(basename);
                console.log(`  ${isEssential ? '✅' : '⚠️ '} ${basename}`);
            });
        }

        // PASO 5: Resumen final
        console.log('\n' + '='.repeat(60));
        console.log('🎉 LIMPIEZA COMPLETADA');
        console.log('='.repeat(60));
        console.log('\n📊 Resumen:');
        console.log('  • Archivos de documentación eliminados de raíz');
        console.log('  • Archivos de prueba/testing eliminados de backend/');
        console.log('  • Datos demo eliminados');
        console.log('  • Solo archivos esenciales mantenidos');
        console.log('\n✅ Sitio limpio y listo para producción\n');

        ssh.dispose();

    } catch (error) {
        console.error('\n❌ Error durante la limpieza:', error.message);
        ssh.dispose();
        process.exit(1);
    }
}

// Ejecutar limpieza
cleanupFTP();
