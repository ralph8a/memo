# Script para build y despliegue en GitHub Pages
cd C:\react
npm run build
Copy-Item .\dist\* C:\memo -Recurse -Force
cd C:\memo
git add .
git commit -m "Update build for GitHub Pages"
git push
