#!/usr/bin/env python3
"""
Script SIMPLE de deploy para cPanel
Version minimalista - solo sube archivos sin eliminar nada
"""

import ftplib
import os
from pathlib import Path

# CONFIGURACIÓN
FTP_HOST = "ftp.i6n.1db.mytemp.website"
FTP_USER = "guillermo.krause@i6n.1db.mytemp.website"
FTP_PASSWORD = "Inspiron1999#"
REMOTE_PATH = "/public_html"
LOCAL_DIR = "dist"

def subir_archivo(ftp, archivo_local, nombre_remoto):
    """Sube un archivo"""
    with open(archivo_local, 'rb') as f:
        ftp.storbinary(f'STOR {nombre_remoto}', f)
    print(f"✓ {nombre_remoto}")

def subir_directorio(ftp, dir_local, dir_remoto):
    """Sube todos los archivos recursivamente"""
    # Crear directorio si no existe
    try:
        ftp.cwd(dir_remoto)
    except:
        ftp.mkd(dir_remoto)
        ftp.cwd(dir_remoto)
    
    # Subir archivos
    for item in Path(dir_local).iterdir():
        if item.is_file():
            subir_archivo(ftp, str(item), item.name)
        elif item.is_dir():
            dir_actual = ftp.pwd()
            subir_directorio(ftp, str(item), f"{dir_remoto}/{item.name}")
            ftp.cwd(dir_actual)

# MAIN
print("🚀 Iniciando deploy...")

# Conectar
ftp = ftplib.FTP(FTP_HOST)
ftp.login(FTP_USER, FTP_PASSWORD)
print(f"✓ Conectado a {FTP_HOST}")

# Subir archivos
print(f"📤 Subiendo desde {LOCAL_DIR} a {REMOTE_PATH}...")
subir_directorio(ftp, LOCAL_DIR, REMOTE_PATH)

# Cerrar
ftp.quit()
print("✅ ¡Completado!")
