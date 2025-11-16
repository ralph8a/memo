# PowerShell script to compare files between build and static deploy folders
$buildPath = "C:\react\dist"
$deployPath = "C:\memo-static"

# Get all files in build folder
$buildFiles = Get-ChildItem -Path $buildPath -Recurse | Where-Object { -not $_.PSIsContainer }

# Get all files in deploy folder (excluding .git)
$deployFiles = Get-ChildItem -Path $deployPath -Recurse | Where-Object { -not $_.PSIsContainer -and $_.FullName -notmatch "\\\.git(\\|$)" }

# Compare file lists
$buildRelative = $buildFiles | ForEach-Object { $_.FullName.Replace($buildPath, "") }
$deployRelative = $deployFiles | ForEach-Object { $_.FullName.Replace($deployPath, "") }

$missingInDeploy = $buildRelative | Where-Object { $_ -notin $deployRelative }
$extraInDeploy = $deployRelative | Where-Object { $_ -notin $buildRelative }

Write-Host "Missing in deploy:" -ForegroundColor Yellow
$missingInDeploy | ForEach-Object { Write-Host $_ }

Write-Host "Extra in deploy:" -ForegroundColor Red
$extraInDeploy | ForEach-Object { Write-Host $_ }

# Compare file contents for matching files
$commonFiles = $buildRelative | Where-Object { $_ -in $deployRelative }
foreach ($file in $commonFiles) {
    $buildFile = Join-Path $buildPath $file
    $deployFile = Join-Path $deployPath $file
    if ((Get-FileHash $buildFile).Hash -ne (Get-FileHash $deployFile).Hash) {
        Write-Host "DIFFERENT: $file" -ForegroundColor Magenta
    }
}
Write-Host "Comparison complete."
