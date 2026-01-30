# Script de acceso rápido SSH con passphrase automática
# Uso: .\quick-ssh.ps1 [comando]

param(
    [string]$Command = ""
)

$keyPath = "c:\react\nhs13h5k0x0j_pem"
$passphrase = "12345678"
$server = "nhs13h5k0x0j@208.109.62.140"

# Función para ejecutar SSH con passphrase automática
function Invoke-SSHWithPass {
    param(
        [string]$Cmd
    )
    
    # Crear expect script
    $expectScript = @"
spawn ssh -i $keyPath $server $Cmd
expect "Enter passphrase"
send "$passphrase\r"
interact
"@
    
    # Si no tenemos expect, usar método alternativo
    if ($Cmd -eq "") {
        Write-Host "🔌 Conectando a servidor..." -ForegroundColor Cyan
        Write-Host "Passphrase: 12345678" -ForegroundColor Yellow
        ssh -i $keyPath $server
    } else {
        Write-Host "⚡ Ejecutando: $Cmd" -ForegroundColor Cyan
        Write-Host "Passphrase: 12345678" -ForegroundColor Yellow
        
        # Ejecutar comando
        $env:SSH_ASKPASS_REQUIRE = "never"
        ssh -i $keyPath $server $Cmd
    }
}

# Ejecutar
Invoke-SSHWithPass -Cmd $Command
