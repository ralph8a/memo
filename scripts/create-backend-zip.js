#!/usr/bin/env node
/**
 * Crear ZIP del backend para subida manual
 */

const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

console.log('📦 Creando ZIP del backend para subida manual...\n');

const output = fs.createWriteStream(path.join(__dirname, '..', 'backend-update.zip'));
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', function () {
    console.log('✅ ZIP creado: backend-update.zip');
    console.log(`📏 Tamaño: ${(archive.pointer() / 1024).toFixed(2)} KB\n`);
    console.log('📋 INSTRUCCIONES:');
    console.log('1. Ve a cPanel File Manager');
    console.log('2. Navega a public_html/backend');
    console.log('3. Sube backend-update.zip');
    console.log('4. Extrae el archivo');
    console.log('5. Elimina api-endpoints.php viejo');
    console.log('6. Renombra api-endpoints.php del ZIP\n');
});

archive.on('error', function (err) {
    throw err;
});

archive.pipe(output);

// Agregar solo el archivo api-endpoints.php
const backendPath = path.join(__dirname, '..', 'backend');
archive.file(path.join(backendPath, 'api-endpoints.php'), { name: 'api-endpoints.php' });

archive.finalize();
