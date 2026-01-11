@echo off
REM Script para desencriptar clave SSH en Windows

echo ========================================================
echo   DESENCRIPTAR CLAVE SSH
echo ========================================================
echo.
echo Vamos a convertir la clave encriptada a una sin passphrase
echo.

cd /d "%~dp0..\priv"

echo Archivo actual: id_rsa (encriptado)
echo.
echo Ingresa la passphrase de la clave SSH cuando se te solicite.
echo Si no sabes la passphrase, contacta al administrador.
echo.

ssh-keygen -p -f id_rsa -N "" -m PEM

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   EXITO: Clave desencriptada
    echo ========================================================
    echo.
    echo La clave ahora está en formato PEM sin passphrase
    echo Puedes usar: npm run rebuild:sftp
    echo.
) else (
    echo.
    echo ========================================================
    echo   ERROR: No se pudo desencriptar
    echo ========================================================
    echo.
    echo Verifica que:
    echo 1. OpenSSH este instalado
    echo 2. La passphrase sea correcta
    echo.
)

pause
