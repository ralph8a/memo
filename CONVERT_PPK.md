# CONVERTIR .PPK A OPENSSH

## El archivo id_rsa.ppk está en formato PuTTY v3 que Node.js no puede leer.

## OPCIÓN 1: Usar PuTTYgen (Recomendado - 2 minutos)

1. **Descargar PuTTY/PuTTYgen:**
   - https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html
   - O ejecutar: `winget install PuTTY.PuTTY`

2. **Convertir con PuTTYgen:**
   ```
   - Abrir PuTTYgen
   - Click "Load" → Seleccionar "C:\Users\rafae\Downloads\id_rsa.ppk"
   - Ingresar passphrase: Inspiron1999#
   - Click "Conversions" → "Export OpenSSH key"
   - Guardar como: C:\react\priv\id_rsa
   - ¡Listo! Ejecutar: npm run rebuild:sftp
   ```

## OPCIÓN 2: Usar WinSCP (GUI - 5 minutos)

1. **Descargar WinSCP:**
   - https://winscp.net/eng/download.php
   - O ejecutar: `winget install WinSCP.WinSCP`

2. **Conectar y subir:**
   ```
   - Abrir WinSCP
   - Protocol: SFTP
   - Host: secureserver.net
   - User: id_rsa
   - Password: Inspiron1999#
   - Private key: C:\Users\rafae\Downloads\id_rsa.ppk
   - Click "Login"
   - Navegar a /public_html
   - Arrastrar archivos de C:\react\dist
   ```

## OPCIÓN 3: Convertir vía Comando (PowerShell)

```powershell
# Instalar PuTTY si no lo tienes
winget install PuTTY.PuTTY

# Convertir .ppk a OpenSSH
puttygen "C:\Users\rafae\Downloads\id_rsa.ppk" -O private-openssh -o "C:\react\priv\id_rsa"
# Cuando pida passphrase, ingresar: Inspiron1999#

# Ejecutar deploy
npm run rebuild:sftp
```

## OPCIÓN 4: Deploy Manual con ZIP (Más rápido - 3 minutos)

El archivo `ksinsurance-deploy.zip` ya está listo en `C:\react\`

1. Ve a: https://secureserver.net o tu cPanel
2. File Manager → /public_html
3. Upload → ksinsurance-deploy.zip
4. Extract
5. ¡Listo! → http://ksinsurance.com
