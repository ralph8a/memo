#!/usr/bin/env python3
"""
Script INTERACTIVO para probar y encontrar las credenciales FTP correctas
"""

import ftplib
import getpass

print("=" * 60)
print("🔐 ASISTENTE DE CONEXIÓN FTP INTERACTIVO")
print("=" * 60)
print()

# Valores por defecto
default_host = "ftp.i6n.1db.mytemp.website"
default_port = "21"
default_user = "guillermo.krause@i6n.1db.mytemp.website"

print("Configuración actual:")
print(f"Host: {default_host}")
print(f"Puerto: {default_port}")
print(f"Usuario: {default_user}")
print()

# Preguntar si quiere usar valores por defecto
use_defaults = input("¿Usar esta configuración? (s/n) [s]: ").lower() or "s"

if use_defaults == "s":
    host = default_host
    port = int(default_port)
    user = default_user
else:
    host = input(f"Host [{default_host}]: ") or default_host
    port = int(input(f"Puerto [{default_port}]: ") or default_port)
    user = input(f"Usuario [{default_user}]: ") or default_user

# Pedir contraseña de forma segura
print()
print("Ingresa tu contraseña FTP:")
print("(Si tienes problemas, intenta resetearla en cPanel > FTP Accounts)")
password = getpass.getpass("Password: ")

if not password:
    print("❌ No ingresaste contraseña")
    exit(1)

print()
print("=" * 60)
print("🔄 Probando conexión...")
print("=" * 60)

try:
    # Conectar
    print(f"📡 Conectando a {host}:{port}...")
    ftp = ftplib.FTP()
    ftp.connect(host, port, timeout=30)
    print("✓ Conectado al servidor")
    
    # Login
    print(f"🔑 Autenticando como {user}...")
    ftp.login(user, password)
    print("✓ Login exitoso!")
    
    # Información del servidor
    print(f"📂 Directorio actual: {ftp.pwd()}")
    
    # Listar archivos
    print()
    print("📄 Archivos y directorios:")
    print("-" * 60)
    files = []
    ftp.retrlines('LIST', files.append)
    for f in files[:10]:
        print(f"   {f}")
    if len(files) > 10:
        print(f"   ... y {len(files) - 10} más")
    
    # Verificar acceso a public_html
    print()
    print("🔍 Verificando acceso a /public_html...")
    try:
        ftp.cwd('/public_html')
        print("✓ Acceso a /public_html confirmado")
        pub_files = []
        ftp.retrlines('LIST', pub_files.append)
        print(f"   Contiene {len(pub_files)} archivos/directorios")
    except Exception as e:
        print(f"⚠️  No se pudo acceder a /public_html: {e}")
    
    ftp.quit()
    
    print()
    print("=" * 60)
    print("✅ ¡CONEXIÓN EXITOSA!")
    print("=" * 60)
    print()
    print("Copia esta configuración en tus scripts:")
    print()
    print("Para .env:")
    print(f'FTP_HOST="{host}"')
    print(f'FTP_PORT={port}')
    print(f'FTP_USER="{user}"')
    print(f'FTP_PASSWORD="{password}"')
    print(f'FTP_REMOTE_PATH="/public_html"')
    print()
    print("Para Python (deploy-cpanel-simple.py):")
    print(f'FTP_HOST = "{host}"')
    print(f'FTP_USER = "{user}"')
    print(f'FTP_PASSWORD = "{password}"')
    print()
    
except ftplib.error_perm as e:
    print()
    print("=" * 60)
    print("❌ ERROR DE AUTENTICACIÓN")
    print("=" * 60)
    print(f"Detalles: {e}")
    print()
    print("💡 Soluciones:")
    print("1. Verifica que la contraseña sea correcta")
    print("2. Accede a cPanel > 'FTP Accounts'")
    print("3. Resetea la contraseña de la cuenta FTP")
    print("4. Algunos hostings requieren crear una cuenta FTP separada")
    print("5. Verifica que el usuario tenga permisos en /public_html")
    
except Exception as e:
    print()
    print("=" * 60)
    print("❌ ERROR DE CONEXIÓN")
    print("=" * 60)
    print(f"Detalles: {e}")
    print()
    print("💡 Soluciones:")
    print("1. Verifica que el host sea correcto")
    print("2. Asegúrate de estar conectado a internet")
    print("3. Verifica que el firewall no bloquee el puerto 21")
    print("4. Contacta a soporte de GoDaddy")
