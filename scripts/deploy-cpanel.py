#!/usr/bin/env python3
"""
Script de deploy para cPanel/GoDaddy
Ejecuta este script desde cPanel para automatizar la publicación
"""

import ftplib
import os
import sys
from pathlib import Path
from datetime import datetime

# ==================== CONFIGURACIÓN ====================
FTP_HOST = "ftp.i6n.1db.mytemp.website"
FTP_PORT = 21
FTP_USER = "guillermo.krause@i6n.1db.mytemp.website"
FTP_PASSWORD = "Inspiron1999#"
FTP_REMOTE_PATH = "/public_html"

# Directorio local de archivos a subir
LOCAL_DIR = "dist"

# ==================== FUNCIONES ====================

def log(message):
    """Imprime mensaje con timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

def upload_file(ftp, local_path, remote_path):
    """Sube un archivo al servidor FTP"""
    try:
        with open(local_path, 'rb') as file:
            ftp.storbinary(f'STOR {remote_path}', file)
        log(f"✓ Subido: {remote_path}")
        return True
    except Exception as e:
        log(f"✗ Error subiendo {remote_path}: {str(e)}")
        return False

def upload_directory(ftp, local_dir, remote_dir):
    """Sube recursivamente un directorio completo"""
    local_path = Path(local_dir)
    
    if not local_path.exists():
        log(f"✗ Error: El directorio {local_dir} no existe")
        return False
    
    # Crear directorio remoto si no existe
    try:
        ftp.cwd(remote_dir)
    except:
        try:
            ftp.mkd(remote_dir)
            ftp.cwd(remote_dir)
            log(f"✓ Creado directorio: {remote_dir}")
        except Exception as e:
            log(f"✗ Error creando directorio {remote_dir}: {str(e)}")
            return False
    
    # Recorrer archivos y subdirectorios
    for item in local_path.iterdir():
        local_item = str(item)
        remote_item = f"{remote_dir}/{item.name}"
        
        if item.is_file():
            # Es un archivo
            upload_file(ftp, local_item, item.name)
        elif item.is_dir():
            # Es un directorio
            current_dir = ftp.pwd()
            upload_directory(ftp, local_item, remote_item)
            ftp.cwd(current_dir)
    
    return True

def clean_remote_directory(ftp, path="/public_html"):
    """Limpia el directorio remoto (CUIDADO: elimina todo)"""
    try:
        ftp.cwd(path)
        items = []
        ftp.retrlines('LIST', items.append)
        
        for item in items:
            parts = item.split()
            if len(parts) < 9:
                continue
            
            name = ' '.join(parts[8:])
            if name in ['.', '..']:
                continue
            
            # Si es directorio (empieza con 'd')
            if item.startswith('d'):
                try:
                    clean_remote_directory(ftp, f"{path}/{name}")
                    ftp.rmd(f"{path}/{name}")
                    log(f"✓ Eliminado directorio: {name}")
                except Exception as e:
                    log(f"✗ Error eliminando directorio {name}: {str(e)}")
            else:
                # Es un archivo
                try:
                    ftp.delete(name)
                    log(f"✓ Eliminado archivo: {name}")
                except Exception as e:
                    log(f"✗ Error eliminando archivo {name}: {str(e)}")
        
        ftp.cwd('/')
    except Exception as e:
        log(f"✗ Error limpiando directorio: {str(e)}")

def main():
    """Función principal de deploy"""
    log("=" * 60)
    log("🚀 Iniciando deploy a cPanel/GoDaddy")
    log("=" * 60)
    
    # Verificar que existe el directorio local
    if not os.path.exists(LOCAL_DIR):
        log(f"✗ Error: El directorio '{LOCAL_DIR}' no existe")
        log(f"💡 Asegúrate de compilar el proyecto primero")
        return 1
    
    # Conectar al servidor FTP
    log(f"📡 Conectando a {FTP_HOST}:{FTP_PORT}...")
    log(f"👤 Usuario: {FTP_USER}")
    
    try:
        ftp = ftplib.FTP()
        ftp.connect(FTP_HOST, FTP_PORT)
        ftp.login(FTP_USER, FTP_PASSWORD)
        log("✓ Conectado exitosamente al servidor FTP")
        
        # Mostrar directorio actual
        current_dir = ftp.pwd()
        log(f"📂 Directorio actual: {current_dir}")
        
        # Opcional: Limpiar directorio remoto
        # DESCOMENTAR SOLO SI QUIERES ELIMINAR TODO ANTES DE SUBIR
        # log("🧹 Limpiando directorio remoto...")
        # clean_remote_directory(ftp, FTP_REMOTE_PATH)
        
        # Navegar al directorio de destino
        log(f"📂 Navegando a {FTP_REMOTE_PATH}...")
        try:
            ftp.cwd(FTP_REMOTE_PATH)
        except:
            ftp.mkd(FTP_REMOTE_PATH)
            ftp.cwd(FTP_REMOTE_PATH)
        
        # Subir archivos
        log(f"📤 Subiendo archivos desde '{LOCAL_DIR}'...")
        log("-" * 60)
        
        success = upload_directory(ftp, LOCAL_DIR, FTP_REMOTE_PATH)
        
        log("-" * 60)
        
        if success:
            log("✅ ¡Deploy completado exitosamente!")
            log(f"🌐 Tu sitio debería estar disponible en http://i6n.1db.mytemp.website")
        else:
            log("⚠️  Deploy completado con algunos errores")
        
        # Cerrar conexión
        ftp.quit()
        log("👋 Conexión FTP cerrada")
        
        return 0
        
    except ftplib.error_perm as e:
        log(f"✗ Error de permisos FTP: {str(e)}")
        log("💡 Verifica tu usuario y contraseña")
        return 1
    except Exception as e:
        log(f"✗ Error durante el deploy: {str(e)}")
        log(f"💡 Detalles: {type(e).__name__}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
