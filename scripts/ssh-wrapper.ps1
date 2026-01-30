# SSH Wrapper para automatizar conexión
# Passphrase: 12345678

param(
    [string]$Command = ""
)

$keyPath = "c:\react\nhs13h5k0x0j_pem"
$sshUser = "nhs13h5k0x0j@208.109.62.140"

Write-Host "🔑 Conectando a servidor SSH..." -ForegroundColor Cyan
Write-Host "💡 Passphrase si se solicita: 12345678" -ForegroundColor Yellow
Write-Host ""

if ($Command) {
    ssh -i $keyPath $sshUser $Command
} else {
    ssh -i $keyPath $sshUser
}
