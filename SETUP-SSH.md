# Configuración SSH sin Passphrase Manual

## Passphrase de la clave PEM
```
12345678
```

## Métodos de configuración

### Opción 1: Configurar ssh-agent (Recomendado)

Ejecuta esto **una sola vez** al abrir PowerShell:

```powershell
# Iniciar ssh-agent
Start-Service ssh-agent
Set-Service ssh-agent -StartupType Automatic

# Agregar la clave (te pedirá passphrase: 12345678)
ssh-add c:\react\nhs13h5k0x0j_pem

# Verificar que se agregó
ssh-add -l
```

Después de esto, todos los comandos SSH funcionarán sin pedir passphrase.

### Opción 2: Usar script automático

```powershell
# Ejecutar una vez por sesión
.\scripts\setup-ssh-key.ps1
```

### Opción 3: Configurar en tu perfil de PowerShell

Agregar a `$PROFILE` (usualmente en `Documents\PowerShell\Microsoft.PowerShell_profile.ps1`):

```powershell
# Auto-start ssh-agent y agregar clave
if ((Get-Service ssh-agent).Status -ne 'Running') {
    Start-Service ssh-agent
}

# Verificar si la clave ya está cargada
$keyLoaded = ssh-add -l 2>&1 | Select-String "nhs13h5k0x0j_pem"
if (-not $keyLoaded) {
    Write-Host "💡 Tip: Ejecuta 'ssh-add c:\react\nhs13h5k0x0j_pem' (passphrase: 12345678)" -ForegroundColor Yellow
}
```

## Comandos útiles

```powershell
# Ver claves cargadas
ssh-add -l

# Remover una clave específica
ssh-add -d c:\react\nhs13h5k0x0j_pem

# Remover todas las claves
ssh-add -D

# Conectar al servidor (sin passphrase si la clave está en el agente)
ssh -i nhs13h5k0x0j_pem nhs13h5k0x0j@208.109.62.140

# Copiar archivos (sin passphrase)
scp -i nhs13h5k0x0j_pem archivo.txt nhs13h5k0x0j@208.109.62.140:~/
```

## Solución de problemas

### Si ssh-agent no está corriendo:
```powershell
Get-Service ssh-agent
Start-Service ssh-agent
```

### Si la clave no se queda en el agente:
```powershell
# Reiniciar el agente
Stop-Service ssh-agent
Start-Service ssh-agent
ssh-add c:\react\nhs13h5k0x0j_pem
```

### Si olvidaste la passphrase:
La passphrase es: **12345678**

## Scripts disponibles

- `scripts\setup-ssh-key.ps1` - Configuración automática de SSH
- `scripts\ssh-add-key.bat` - Versión batch para Windows
- `scripts\quick-ssh.ps1` - Acceso rápido SSH con passphrase incluida
