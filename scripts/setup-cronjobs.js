const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

console.log('═══════════════════════════════════════════════════════');
console.log('  ⏰ CONFIGURANDO CRONJOBS EN GODADDY');
console.log('═══════════════════════════════════════════════════════\n');

// Crear archivo de instrucciones para cPanel
const cronInstructions = `
# ═══════════════════════════════════════════════════════
# CRONJOBS PARA NOTIFICACIONES - KS Insurance
# ═══════════════════════════════════════════════════════

## INSTRUCCIONES PARA CONFIGURAR EN cPanel:

1. Acceder a cPanel: https://ksinsurancee.com:2083
   Usuario: nhs13h5k0x0j
   Password: Inspiron1999#

2. Buscar y abrir "Cron Jobs" (en sección Advanced)

3. Configurar los siguientes cronjobs:

---

### CRONJOB 1: Notificaciones de Pagos (Diario 9:00 AM)
**Descripción:** Envía recordatorios de pagos próximos y vencidos

Minuto: 0
Hora: 9
Día: *
Mes: *
Día de semana: *

Comando:
/usr/bin/php /home/nhs13h5k0x0j/public_html/backend/payment-cron.php >> /home/nhs13h5k0x0j/logs/payment-cron.log 2>&1

---

### CRONJOB 2: Recordatorios de Comprobantes (Diario 10:00 AM)
**Descripción:** Recuerda a clientes subir comprobantes de pago

Minuto: 0
Hora: 10
Día: *
Mes: *
Día de semana: *

Comando:
/usr/bin/php /home/nhs13h5k0x0j/public_html/backend/payment-cron.php >> /home/nhs13h5k0x0j/logs/payment-cron.log 2>&1

(Nota: El mismo script maneja ambas funciones)

---

### CRONJOB 3: Limpieza de Archivos Temporales (Diario 2:00 AM)
**Descripción:** Elimina archivos temporales mayores a 24 horas

Minuto: 0
Hora: 2
Día: *
Mes: *
Día de semana: *

Comando:
/usr/bin/php /home/nhs13h5k0x0j/public_html/backend/cleanup-temp-files.php >> /home/nhs13h5k0x0j/logs/cleanup-cron.log 2>&1

---

### CRONJOB 4: Backup de Base de Datos (Semanal - Domingo 3:00 AM)
**Descripción:** Crea backup semanal de la base de datos

Minuto: 0
Hora: 3
Día: *
Mes: *
Día de semana: 0

Comando:
/usr/bin/mysqldump -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause > /home/nhs13h5k0x0j/backups/db-backup-$(date +\\%Y\\%m\\%d).sql 2>&1

---

## VERIFICACIÓN DE CRONJOBS:

Para verificar que los cronjobs están ejecutándose correctamente:

1. Via SSH:
   ssh nhs13h5k0x0j@208.109.62.140
   tail -f /home/nhs13h5k0x0j/logs/payment-cron.log

2. Via cPanel:
   - Ir a "File Manager"
   - Navegar a /logs/
   - Ver archivos: payment-cron.log, cleanup-cron.log

3. Ejecución manual para pruebas:
   php /home/nhs13h5k0x0j/public_html/backend/payment-cron.php

---

## CREAR DIRECTORIOS DE LOGS (via SSH):

mkdir -p /home/nhs13h5k0x0j/logs
mkdir -p /home/nhs13h5k0x0j/backups
chmod 755 /home/nhs13h5k0x0j/logs
chmod 755 /home/nhs13h5k0x0j/backups

---

## FORMATO RESUMIDO PARA COPIAR/PEGAR:

CRON 1 - Notificaciones Pagos (9:00 AM):
0 9 * * * /usr/bin/php /home/nhs13h5k0x0j/public_html/backend/payment-cron.php >> /home/nhs13h5k0x0j/logs/payment-cron.log 2>&1

CRON 2 - Limpieza Temporal (2:00 AM):
0 2 * * * /usr/bin/php /home/nhs13h5k0x0j/public_html/backend/cleanup-temp-files.php >> /home/nhs13h5k0x0j/logs/cleanup-cron.log 2>&1

CRON 3 - Backup Semanal (Domingo 3:00 AM):
0 3 * * 0 /usr/bin/mysqldump -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause > /home/nhs13h5k0x0j/backups/db-backup-$(date +\\%Y\\%m\\%d).sql 2>&1

---

## ALTERNATIVA: Ejecutar via URL (si SSH no disponible)

Los scripts también pueden ejecutarse desde el navegador con clave de seguridad:

http://ksinsurancee.com/backend/payment-cron.php?cron_key=your_secret_key_here

(Configurar CRON_SECRET_KEY en .env)

---

## MONITOREO Y ALERTAS:

1. Los cronjobs envían notificaciones por email en caso de errores
2. Los logs se guardan en /home/nhs13h5k0x0j/logs/
3. Revisar logs semanalmente para verificar ejecución correcta

---

FECHA DE CREACIÓN: ${new Date().toISOString()}
`;

// Guardar instrucciones
const instructionsPath = path.join(__dirname, '..', 'CRONJOB-SETUP-INSTRUCTIONS.txt');
fs.writeFileSync(instructionsPath, cronInstructions);

console.log('✅ Instrucciones de cronjobs creadas: CRONJOB-SETUP-INSTRUCTIONS.txt\n');

// Crear script SSH para configuración automática
const sshScript = `#!/bin/bash
# Script para configurar cronjobs automáticamente via SSH

echo "Conectando a servidor GoDaddy..."

ssh nhs13h5k0x0j@208.109.62.140 << 'ENDSSH'
    # Crear directorios
    echo "Creando directorios de logs y backups..."
    mkdir -p ~/logs
    mkdir -p ~/backups
    chmod 755 ~/logs
    chmod 755 ~/backups
    
    # Crear archivo temporal con cronjobs
    cat > /tmp/cronjobs.txt << 'EOF'
# KS Insurance - Notificaciones de Pagos (Diario 9:00 AM)
0 9 * * * /usr/bin/php ~/public_html/backend/payment-cron.php >> ~/logs/payment-cron.log 2>&1

# KS Insurance - Limpieza Temporal (Diario 2:00 AM)  
0 2 * * * /usr/bin/php ~/public_html/backend/cleanup-temp-files.php >> ~/logs/cleanup-cron.log 2>&1

# KS Insurance - Backup Semanal (Domingo 3:00 AM)
0 3 * * 0 /usr/bin/mysqldump -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause > ~/backups/db-backup-$(date +\\%Y\\%m\\%d).sql 2>&1
EOF

    # Instalar cronjobs
    echo "Instalando cronjobs..."
    crontab /tmp/cronjobs.txt
    
    # Verificar instalación
    echo "Cronjobs instalados:"
    crontab -l
    
    # Limpiar
    rm /tmp/cronjobs.txt
    
    echo "✅ Configuración completada"
ENDSSH
`;

const sshScriptPath = path.join(__dirname, 'setup-cronjobs.sh');
fs.writeFileSync(sshScriptPath, sshScript);
fs.chmodSync(sshScriptPath, '755');

console.log('✅ Script SSH creado: scripts/setup-cronjobs.sh\n');

// Crear script alternativo para Windows (WinSCP)
const winscpScript = `# WinSCP Script para configurar cronjobs
# Ejecutar: winscp.com /script=setup-cronjobs-winscp.txt

option batch on
option confirm off

open sftp://nhs13h5k0x0j:Inspiron1999%23@208.109.62.140:22 -privatekey="${path.join(__dirname, '..', 'nhs13h5k0x0j.ppk')}"

# Ejecutar comandos remotos
call mkdir -p /home/nhs13h5k0x0j/logs
call mkdir -p /home/nhs13h5k0x0j/backups

close
exit
`;

const winscpScriptPath = path.join(__dirname, 'setup-cronjobs-winscp.txt');
fs.writeFileSync(winscpScriptPath, winscpScript);

console.log('✅ Script WinSCP creado: scripts/setup-cronjobs-winscp.txt\n');

console.log('═══════════════════════════════════════════════════════');
console.log('  ✅ ARCHIVOS DE CONFIGURACIÓN CREADOS');
console.log('═══════════════════════════════════════════════════════\n');

console.log('📋 OPCIONES PARA CONFIGURAR CRONJOBS:\n');

console.log('OPCIÓN 1: Via cPanel (Recomendado)');
console.log('─────────────────────────────────────────');
console.log('1. Ir a https://ksinsurancee.com:2083');
console.log('2. Buscar "Cron Jobs"');
console.log('3. Seguir instrucciones en: CRONJOB-SETUP-INSTRUCTIONS.txt\n');

console.log('OPCIÓN 2: Via SSH (Linux/Mac)');
console.log('─────────────────────────────────────────');
console.log('chmod +x scripts/setup-cronjobs.sh');
console.log('./scripts/setup-cronjobs.sh\n');

console.log('OPCIÓN 3: Manual via SSH');
console.log('─────────────────────────────────────────');
console.log('ssh nhs13h5k0x0j@208.109.62.140');
console.log('crontab -e');
console.log('(Copiar contenido de CRONJOB-SETUP-INSTRUCTIONS.txt)\n');

console.log('📊 CRONJOBS A CONFIGURAR:');
console.log('   1. ⏰ Notificaciones de Pagos - Diario 9:00 AM');
console.log('   2. 🧹 Limpieza Temporal - Diario 2:00 AM');
console.log('   3. 💾 Backup DB - Domingo 3:00 AM\n');

console.log('🔍 VERIFICACIÓN:');
console.log('   Via SSH: crontab -l');
console.log('   Via cPanel: Cron Jobs > Current Cron Jobs\n');
