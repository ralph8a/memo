# ========================================
# GUÍA RÁPIDA: SSH AUTOMÁTICO
# ========================================

## Passphrase del PEM:
**12345678**

## Método 1: Usar script wrapper

```powershell
# SSH directo
.\scripts\ssh-wrapper.ps1

# Con comando
.\scripts\ssh-wrapper.ps1 -Command "cd public_html/backend && php -v"
```

## Método 2: Configurar SSH sin passphrase (Recomendado)

### Opción A: Crear clave sin passphrase
```powershell
# 1. Convertir PEM a clave sin passphrase
ssh-keygen -p -f c:\react\nhs13h5k0x0j_pem -N ""
# Cuando pida passphrase actual: 12345678
# Cuando pida nueva passphrase: (dejar vacío, presionar Enter)
```

### Opción B: Usar SSH config con IdentityFile
```powershell
# 1. Crear archivo de configuración SSH
$sshConfigPath = "$env:USERPROFILE\.ssh\config"

# 2. Agregar configuración
@"
Host ksinsurance
    HostName 208.109.62.140
    User nhs13h5k0x0j
    IdentityFile c:\react\nhs13h5k0x0j_pem
    AddKeysToAgent yes
"@ | Out-File -FilePath $sshConfigPath -Encoding UTF8 -Append

# 3. Usar alias simple
ssh ksinsurance
```

## Método 3: Usar Pageant (PuTTY)

1. Descargar Pageant desde https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html
2. Convertir PEM a PPK con PuTTYgen
3. Cargar PPK en Pageant con passphrase
4. SSH usará automáticamente las claves de Pageant

## Método 4: Variables de entorno para scripts

```powershell
# En PowerShell profile ($PROFILE)
$env:SSH_KEY_PATH = "c:\react\nhs13h5k0x0j_pem"
$env:SSH_USER = "nhs13h5k0x0j@208.109.62.140"

# Función helper
function Connect-KSI {
    param([string]$Cmd = "")
    
    Write-Host "🔑 SSH Passphrase: 12345678" -ForegroundColor Yellow
    
    if ($Cmd) {
        ssh -i $env:SSH_KEY_PATH $env:SSH_USER $Cmd
    } else {
        ssh -i $env:SSH_KEY_PATH $env:SSH_USER
    }
}

# Usar
Connect-KSI
Connect-KSI "cd public_html && ls -la"
```

## Verificar conexión

```powershell
ssh -i c:\react\nhs13h5k0x0j_pem nhs13h5k0x0j@208.109.62.140 "echo 'Conexión exitosa'"
```

## Troubleshooting

### Error "Bad permissions"
```powershell
# Arreglar permisos en Windows
icacls c:\react\nhs13h5k0x0j_pem /inheritance:r
icacls c:\react\nhs13h5k0x0j_pem /grant:r "$($env:USERNAME):(R)"
```

### SSH Agent no disponible en Windows
PowerShell en Windows no siempre tiene ssh-agent activo. Usa Pageant o remueve passphrase.

## Recomendación

La forma MÁS SIMPLE es remover la passphrase del archivo PEM:

```powershell
# Backup primero
Copy-Item c:\react\nhs13h5k0x0j_pem c:\react\nhs13h5k0x0j_pem.backup

# Remover passphrase (ingresa 12345678 cuando lo pida, luego Enter 2 veces)
ssh-keygen -p -f c:\react\nhs13h5k0x0j_pem

# Ahora SSH no pedirá passphrase
ssh -i c:\react\nhs13h5k0x0j_pem nhs13h5k0x0j@208.109.62.140
```

**IMPORTANTE**: Solo haz esto si estás seguro de la seguridad de tu máquina local.
