#!/bin/bash
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
0 3 * * 0 /usr/bin/mysqldump -u nhs13h5k_krause -p'Inspiron1999#' nhs13h5k_krause > ~/backups/db-backup-$(date +\%Y\%m\%d).sql 2>&1
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
