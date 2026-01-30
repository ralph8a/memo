@echo off
REM Script para agregar la clave SSH con passphrase automática (Windows)
echo Configurando SSH key...

REM Iniciar ssh-agent si no está corriendo
sc query ssh-agent | find "RUNNING" > nul
if errorlevel 1 (
    echo Iniciando ssh-agent...
    net start ssh-agent
)

REM Crear script expect temporal
set SCRIPT_FILE=%TEMP%\ssh_add_script.txt
echo 12345678 > %SCRIPT_FILE%

REM Agregar la clave
echo Agregando clave SSH...
type %SCRIPT_FILE% | ssh-add c:\react\nhs13h5k0x0j_pem

REM Limpiar
del %SCRIPT_FILE%

echo.
echo Listo! Ahora puedes usar SSH sin passphrase.
pause
