# Script para remover passphrase del archivo PEM
# Passphrase actual: 12345678

$keyPath = "c:\react\nhs13h5k0x0j_pem"
$backupPath = "c:\react\nhs13h5k0x0j_pem.backup"

Write-Host "🔐 Removiendo passphrase del archivo PEM..." -ForegroundColor Cyan
Write-Host ""

# 1. Crear backup
Write-Host "📦 Creando backup..." -ForegroundColor Yellow
Copy-Item $keyPath $backupPath -Force
Write-Host "✅ Backup creado: $backupPath" -ForegroundColor Green
Write-Host ""

# 2. Crear archivo temporal con las respuestas
$tempFile = [System.IO.Path]::GetTempFileName()
@"
12345678


"@ | Out-File -FilePath $tempFile -Encoding ASCII -NoNewline

Write-Host "🔧 Ejecutando ssh-keygen..." -ForegroundColor Yellow
Write-Host "   - Passphrase actual: 12345678" -ForegroundColor Gray
Write-Host "   - Nueva passphrase: (vacía)" -ForegroundColor Gray
Write-Host ""

# 3. Ejecutar ssh-keygen con input del archivo
try {
    $output = Get-Content $tempFile | ssh-keygen -p -f $keyPath 2>&1
    Write-Host $output
    Write-Host ""
    Write-Host "✅ ¡Passphrase removida exitosamente!" -ForegroundColor Green
    Write-Host "🎉 Ahora puedes usar SSH sin ingresar passphrase" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prueba la conexión:" -ForegroundColor Cyan
    Write-Host "ssh -i $keyPath nhs13h5k0x0j@208.109.62.140" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Restaurando backup..." -ForegroundColor Yellow
    Copy-Item $backupPath $keyPath -Force
    Write-Host "✅ Backup restaurado" -ForegroundColor Green
} finally {
    # 4. Limpiar archivo temporal
    Remove-Item $tempFile -ErrorAction SilentlyContinue
}
