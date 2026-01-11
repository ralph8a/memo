#!/bin/bash
# Script para ejecutar desde cPanel Terminal
# Este script no requiere FTP, solo mueve archivos dentro del servidor

echo "======================================"
echo "  DEPLOY DESDE CPANEL"
echo "======================================"

# Directorio donde están los archivos subidos
SOURCE_DIR="/home/nhs13h5k0x0j/public_html/dist"

# Directorio destino (raíz web)
DEST_DIR="/home/nhs13h5k0x0j/public_html"

# Backup del sitio actual
BACKUP_DIR="/home/nhs13h5k0x0j/backups/backup_$(date +%Y%m%d_%H%M%S)"

echo "1. Creando backup en: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -r "$DEST_DIR"/* "$BACKUP_DIR/" 2>/dev/null || echo "   (Sin archivos previos para respaldar)"

echo ""
echo "2. Limpiando directorio destino..."
# Eliminar archivos antiguos pero mantener .htaccess y dist/
find "$DEST_DIR" -maxdepth 1 -type f ! -name '.htaccess' -delete 2>/dev/null
find "$DEST_DIR" -maxdepth 1 -type d ! -name 'dist' ! -name '.' ! -name '..' -exec rm -rf {} + 2>/dev/null

echo ""
echo "3. Copiando archivos desde $SOURCE_DIR..."
if [ -d "$SOURCE_DIR" ]; then
    cp -r "$SOURCE_DIR"/* "$DEST_DIR/"
    echo "   ✓ Archivos copiados exitosamente"
else
    echo "   ✗ Error: No existe el directorio $SOURCE_DIR"
    echo "   Asegúrate de haber subido los archivos de dist/ primero"
    exit 1
fi

echo ""
echo "4. Ajustando permisos..."
find "$DEST_DIR" -type d -exec chmod 755 {} \;
find "$DEST_DIR" -type f -exec chmod 644 {} \;

echo ""
echo "======================================"
echo "  ✓ DEPLOY COMPLETADO"
echo "======================================"
echo ""
echo "Tu sitio debería estar disponible en:"
echo "http://i6n.1db.mytemp.website"
echo ""
echo "Backup guardado en: $BACKUP_DIR"
