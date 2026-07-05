@echo off
chcp 1256 >nul
title Blood Bank Server - Stop
cd /d "%~dp0"
echo Stopping Blood Bank Server...
for /f "tokens=2 delims=," %%p in ('tasklist /fi "imagename eq node.exe" /fo csv /nh 2^>nul') do (
    taskkill /f /pid %%~p >nul 2>&1
)
echo Server stopped.
timeout /t 2 /nobreak >nul
exit /b
