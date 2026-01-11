#!/usr/bin/env python3
"""
Script de VERIFICACIÓN de conexión FTP
Úsalo para probar diferentes combinaciones de usuario/contraseña
"""

import ftplib

print("=" * 60)
print("🔍 VERIFICADOR DE CONEXIÓN FTP")
print("=" * 60)

# Configuración desde el archivo .coreftp
configs = [
    {
        "name": "Config 1: Usuario completo con contraseña original",
        "host": "ftp.i6n.1db.mytemp.website",
        "port": 21,
        "user": "guillermo.krause@i6n.1db.mytemp.website",
        "password": "Inspiron1999#"
    },
    {
        "name": "Config 2: Usuario sin dominio",
        "host": "ftp.i6n.1db.mytemp.website",
        "port": 21,
        "user": "guillermo.krause",
        "password": "Inspiron1999#"
    },
    {
        "name": "Config 3: Solo dominio después de @",
        "host": "ftp.i6n.1db.mytemp.website",
        "port": 21,
        "user": "i6n.1db.mytemp.website",
        "password": "Inspiron1999#"
    }
]

for config in configs:
    print(f"\n🔧 Probando: {config['name']}")
    print(f"   Host: {config['host']}:{config['port']}")
    print(f"   User: {config['user']}")
    print(f"   Pass: {'*' * len(config['password'])}")
    
    try:
        ftp = ftplib.FTP()
        ftp.connect(config['host'], config['port'], timeout=10)
        print("   ✓ Conectado al servidor")
        
        try:
            ftp.login(config['user'], config['password'])
            print("   ✓✓✓ ¡LOGIN EXITOSO! ✓✓✓")
            print(f"   📂 Directorio actual: {ftp.pwd()}")
            
            # Listar archivos
            print("   📄 Archivos:")
            files = []
            ftp.retrlines('LIST', files.append)
            for f in files[:5]:  # Mostrar solo los primeros 5
                print(f"      {f}")
            if len(files) > 5:
                print(f"      ... y {len(files) - 5} más")
            
            ftp.quit()
            print("\n   ✅ Esta configuración FUNCIONA!\n")
            print("=" * 60)
            print("USAR ESTAS CREDENCIALES:")
            print(f"FTP_HOST = \"{config['host']}\"")
            print(f"FTP_USER = \"{config['user']}\"")
            print(f"FTP_PASSWORD = \"{config['password']}\"")
            print("=" * 60)
            break
            
        except ftplib.error_perm as e:
            print(f"   ✗ Error de login: {e}")
            ftp.close()
            
    except Exception as e:
        print(f"   ✗ Error de conexión: {e}")

print("\n" + "=" * 60)
print("💡 INSTRUCCIONES:")
print("=" * 60)
print("1. Si encontró credenciales que funcionan, cópialas arriba")
print("2. Si ninguna funcionó, intenta lo siguiente:")
print("   a) Accede a tu cPanel de GoDaddy")
print("   b) Ve a 'FTP Accounts' o 'Cuentas FTP'")
print("   c) Verifica o resetea la contraseña de la cuenta FTP")
print("   d) Asegúrate de que la cuenta tenga acceso a /public_html")
print("3. Si no tienes acceso a cPanel:")
print("   - Contacta a soporte de GoDaddy")
print("   - Pídeles que verifiquen tu cuenta FTP")
print("=" * 60)
