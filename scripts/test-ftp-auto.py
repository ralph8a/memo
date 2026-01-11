#!/usr/bin/env python3
"""
Script automático para probar diferentes combinaciones de credenciales FTP
"""

import ftplib
import os
from dotenv import load_dotenv

# Cargar .env
load_dotenv()

# Configuración desde .env
password = os.getenv('FTP_PASSWORD', '').strip('"').strip("'")
host = "ftp.i6n.1db.mytemp.website"
port = 21

# Diferentes variaciones de usuario para probar
users_to_test = [
    "guillermo.krause@i6n.1db.mytemp.website",  # Con dominio completo
    "guillermo.krause",                          # Sin dominio
    "nhs13h5k0x0j",                             # Usuario del archivo .coreftp (Id del sistema)
]

print("=" * 70)
print("🔍 PROBANDO DIFERENTES USUARIOS FTP")
print("=" * 70)
print(f"Host: {host}:{port}")
print(f"Password: {'*' * len(password)}")
print()

success = False

for user in users_to_test:
    print(f"\n🔧 Probando usuario: {user}")
    print("-" * 70)
    
    try:
        ftp = ftplib.FTP()
        ftp.connect(host, port, timeout=15)
        print("   ✓ Conectado al servidor")
        
        ftp.login(user, password)
        print("   ✓✓✓ ¡LOGIN EXITOSO! ✓✓✓")
        
        # Obtener info
        current_dir = ftp.pwd()
        print(f"   📂 Directorio: {current_dir}")
        
        # Listar archivos
        files = []
        ftp.retrlines('LIST', files.append)
        print(f"   📄 Archivos encontrados: {len(files)}")
        
        # Mostrar primeros archivos
        for f in files[:3]:
            print(f"      {f}")
        
        ftp.quit()
        
        print()
        print("=" * 70)
        print("✅ ¡CREDENCIALES CORRECTAS ENCONTRADAS!")
        print("=" * 70)
        print()
        print("Actualiza tu archivo .env con:")
        print()
        print(f'FTP_USER="{user}"')
        print(f'FTP_PASSWORD="{password}"')
        print()
        print("O actualiza los scripts Python con:")
        print(f'FTP_USER = "{user}"')
        print(f'FTP_PASSWORD = "{password}"')
        print("=" * 70)
        
        success = True
        break
        
    except ftplib.error_perm as e:
        print(f"   ✗ Error de login: {e}")
    except Exception as e:
        print(f"   ✗ Error: {e}")

if not success:
    print()
    print("=" * 70)
    print("❌ NINGÚN USUARIO FUNCIONÓ")
    print("=" * 70)
    print()
    print("💡 Posibles soluciones:")
    print("1. Verifica la contraseña en cPanel > FTP Accounts")
    print("2. Resetea la contraseña FTP")
    print("3. Verifica que la cuenta FTP no esté suspendida")
    print("4. Contacta a soporte de GoDaddy")
    print()
    print("El archivo .coreftp indica que el usuario del sistema es: nhs13h5k0x0j")
    print("Intenta crear una cuenta FTP con ese usuario en cPanel")
    print("=" * 70)
