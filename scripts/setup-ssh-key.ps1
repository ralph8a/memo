# Script para configurar SSH key con passphrase automática
# Solo necesitas ejecutar esto una vez por sesión de PowerShell

Write-Host "🔑 Configurando SSH key..." -ForegroundColor Cyan

# Verificar si ssh-agent está corriendo
$sshAgent = Get-Process ssh-agent -ErrorAction SilentlyContinue

if (-not $sshAgent) {
    Write-Host "Iniciando ssh-agent..." -ForegroundColor Yellow
    Start-Service ssh-agent
    Set-Service ssh-agent -StartupType Automatic
}

# Agregar la clave SSH
$keyPath = "c:\react\nhs13h5k0x0j_pem"
$passphrase = "12345678"

# Crear un archivo temporal con la passphrase
$tempFile = [System.IO.Path]::GetTempFileName()
$passphrase | Out-File -FilePath $tempFile -Encoding ASCII -NoNewline

try {
    # Usar expect-like functionality con PowerShell
    $env:SSH_ASKPASS_REQUIRE = "never"
    
    # Agregar la clave usando el archivo temporal
    Write-Host "Agregando clave SSH al agente..." -ForegroundColor Yellow
    
    # Método alternativo: usar plink si está disponible
    $result = ssh-add $keyPath 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Clave SSH agregada exitosamente!" -ForegroundColor Green
        Write-Host "Ahora puedes usar SSH sin escribir la passphrase." -ForegroundColor Green
    } else {
        Write-Host "⚠️ Método automático falló. Intentando método interactivo..." -ForegroundColor Yellow
        Write-Host "La passphrase es: 12345678" -ForegroundColor Cyan
        
        # Ejecutar interactivamente
        & ssh-add $keyPath
    }
    
} finally {
    # Limpiar archivo temporal
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force
    }
}

Write-Host ""
Write-Host "💡 Comandos útiles:" -ForegroundColor Cyan
Write-Host "  - Ver claves cargadas: ssh-add -l" -ForegroundColor White
Write-Host "  - Remover clave: ssh-add -d $keyPath" -ForegroundColor White
Write-Host "  - Remover todas: ssh-add -D" -ForegroundColor White
