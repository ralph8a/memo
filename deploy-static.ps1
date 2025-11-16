# Script para build y despliegue estático en GitHub Pages
cd C:\react
npm run build
Copy-Item .\dist\* C:\memo-static -Recurse -Force
cd C:\memo-static
git add .
git commit -m "Update static build for GitHub Pages"
git push
