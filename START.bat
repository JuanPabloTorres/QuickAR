@echo off
echo.
echo ========================================
echo    QuickAR - Inicio Rapido
echo ========================================
echo.
echo Iniciando servidores...
echo.

cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "start-all.ps1"

pause
