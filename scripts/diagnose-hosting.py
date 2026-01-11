#!/usr/bin/env python3
"""
Script de Diagnóstico del Hosting
Verifica la configuración actual y sugiere correcciones
"""

import os
import sys
from pathlib import Path

print("=" * 70)
print("  DIAGNÓSTICO DE HOSTING")
print("=" * 70)
print()

# Configuración
public_html = Path("/home/nhs13h5k0x0j/public_html")
domain = "i6n.1db.mytemp.website"

# Si ejecutamos desde local, usar ruta relativa
if not public_html.exists():
    print("⚠️  Ejecutando desde local, no desde servidor")
    public_html = Path("dist")
    if not public_html.exists():
        print("❌ No se encuentra ni public_html ni dist/")
        sys.exit(1)

print(f"📂 Directorio: {public_html}")
print(f"🌐 Dominio: {domain}")
print()

# 1. VERIFICAR ARCHIVOS ESENCIALES
print("1. VERIFICACIÓN DE ARCHIVOS ESENCIALES")
print("-" * 70)

files_to_check = {
    "index.html": "Archivo principal HTML",
    ".htaccess": "Configuración Apache",
    "manifest.json": "Web App Manifest",
    "service-worker.js": "Service Worker",
    "favicon.ico": "Favicon"
}

missing_files = []
for file, description in files_to_check.items():
    file_path = public_html / file
    if file_path.exists():
        size = file_path.stat().st_size
        print(f"✓ {file:<20} {description:<30} ({size} bytes)")
    else:
        print(f"✗ {file:<20} {description:<30} FALTANTE")
        missing_files.append(file)

print()

# 2. VERIFICAR DIRECTORIOS
print("2. VERIFICACIÓN DE DIRECTORIOS")
print("-" * 70)

dirs_to_check = ["assets", "styles"]
missing_dirs = []

for dir_name in dirs_to_check:
    dir_path = public_html / dir_name
    if dir_path.exists() and dir_path.is_dir():
        file_count = len(list(dir_path.rglob("*")))
        print(f"✓ {dir_name}/ ({file_count} archivos)")
    else:
        print(f"✗ {dir_name}/ NO ENCONTRADO")
        missing_dirs.append(dir_name)

print()

# 3. VERIFICAR PERMISOS (solo en servidor)
if str(public_html).startswith("/home/"):
    print("3. VERIFICACIÓN DE PERMISOS")
    print("-" * 70)
    
    # Verificar permisos de archivos importantes
    for file in ["index.html", ".htaccess"]:
        file_path = public_html / file
        if file_path.exists():
            perms = oct(file_path.stat().st_mode)[-3:]
            status = "✓" if perms == "644" else "⚠"
            print(f"{status} {file:<20} Permisos: {perms} {'(OK)' if perms == '644' else '(Debería ser 644)'}")
    
    print()

# 4. VERIFICAR CONTENIDO DE INDEX.HTML
print("4. VERIFICACIÓN DE INDEX.HTML")
print("-" * 70)

index_path = public_html / "index.html"
if index_path.exists():
    content = index_path.read_text()
    
    checks = {
        '<script': 'Tiene script tags',
        '<link': 'Tiene link tags (CSS)',
        'manifest.json': 'Referencia a manifest',
        'assets/': 'Usa carpeta assets',
    }
    
    for pattern, description in checks.items():
        if pattern in content:
            print(f"✓ {description}")
        else:
            print(f"⚠ {description} - NO ENCONTRADO")
    
    # Verificar rutas
    if 'src="/' in content or 'href="/' in content:
        print("⚠ Usa rutas absolutas (/) - pueden causar problemas")
        print("  Recomendación: Usar rutas relativas (./ o sin /)")
    else:
        print("✓ Usa rutas relativas")
else:
    print("✗ index.html no encontrado")

print()

# 5. VERIFICAR .HTACCESS
print("5. VERIFICACIÓN DE .HTACCESS")
print("-" * 70)

htaccess_path = public_html / ".htaccess"
if htaccess_path.exists():
    content = htaccess_path.read_text()
    
    checks = {
        'RewriteEngine On': 'Rewrite habilitado',
        'RewriteRule': 'Reglas de reescritura',
        'index.html': 'Redirige a index.html',
    }
    
    for pattern, description in checks.items():
        if pattern in content:
            print(f"✓ {description}")
        else:
            print(f"✗ {description} - FALTANTE")
else:
    print("✗ .htaccess no encontrado - CRÍTICO")
    print("  El sitio SPA necesita .htaccess para funcionar")

print()

# 6. ESTRUCTURA DE ARCHIVOS
print("6. ESTRUCTURA DE ARCHIVOS")
print("-" * 70)

all_files = list(public_html.rglob("*"))
file_types = {}

for file in all_files:
    if file.is_file():
        ext = file.suffix or "sin extensión"
        file_types[ext] = file_types.get(ext, 0) + 1

for ext, count in sorted(file_types.items(), key=lambda x: x[1], reverse=True):
    print(f"  {ext:<15} {count:>3} archivos")

print()

# 7. RESUMEN Y RECOMENDACIONES
print("=" * 70)
print("  RESUMEN Y RECOMENDACIONES")
print("=" * 70)
print()

issues = []

if missing_files:
    issues.append(f"Archivos faltantes: {', '.join(missing_files)}")

if missing_dirs:
    issues.append(f"Directorios faltantes: {', '.join(missing_dirs)}")

if not htaccess_path.exists():
    issues.append(".htaccess faltante - CRÍTICO para SPA")

if issues:
    print("❌ PROBLEMAS ENCONTRADOS:")
    for i, issue in enumerate(issues, 1):
        print(f"  {i}. {issue}")
    print()
    print("💡 SOLUCIONES:")
    print("  1. Ejecuta: bash setup-hosting.sh")
    print("  2. O copia manualmente .htaccess desde public/.htaccess")
    print("  3. Verifica que todos los archivos de dist/ estén en public_html/")
else:
    print("✅ No se encontraron problemas críticos")
    print()
    print("Si el sitio aún no carga:")
    print("  1. Limpia caché del navegador (Ctrl+Shift+R)")
    print(f"  2. Verifica DNS: http://{domain}")
    print("  3. Revisa error_log en cPanel")
    print("  4. Verifica que el dominio apunte al servidor correcto")

print()
