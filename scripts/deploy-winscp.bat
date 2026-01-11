@echo off
REM Deploy usando WinSCP con archivo .ppk

echo ============================================================
echo   DEPLOY CON WINSCP (SSH .ppk)
echo ============================================================
echo.

REM Verificar WinSCP
where winscp.com >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: WinSCP no esta instalado
    echo.
    echo Descarga WinSCP desde: https://winscp.net/download/WinSCP-6.3.5-Portable.zip
    echo O usa: winget install WinSCP.WinSCP
    echo.
    pause
    exit /b 1
)

echo Compilando proyecto...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: La compilacion fallo
    pause
    exit /b 1
)

echo.
echo Subiendo archivos via SFTP con WinSCP...
echo.

winscp.com /command ^
    "open sftp://id_rsa:Inspiron1999#@secureserver.net:22 -privatekey=""C:\Users\rafae\Downloads\id_rsa.ppk""" ^
    "cd /public_html" ^
    "put dist\* ." ^
    "exit"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo   DEPLOY COMPLETADO EXITOSAMENTE
    echo ============================================================
    echo.
    echo Tu sitio deberia estar disponible en:
    echo    http://ksinsurancee.com
    echo.
) else (
    echo.
    echo ERROR: El deploy fallo
    echo.
)

pause
