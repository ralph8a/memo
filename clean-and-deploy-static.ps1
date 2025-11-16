# Script para limpiar y desplegar build estático en GitHub Pages
cd C:\memo-static
Get-ChildItem -Exclude '.git' | Remove-Item -Recurse -Force
Copy-Item C:\react\dist\* . -Recurse -Force
git add .
git commit -m "Clean old files and update static build for GitHub Pages"
git push
