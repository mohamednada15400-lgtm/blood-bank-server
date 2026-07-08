@echo off
chcp 1256 > nul
echo تشغيل Cloudflare Tunnel...
start /B "" "%TEMP%\cloudflared.exe" tunnel --url http://localhost:3001 --no-autoupdate
timeout /t 8 > nul
echo.
echo =====================================
findstr "https://.*trycloudflare.com" "%TEMP%\cf-tunnel.err"
echo =====================================
echo.
pause
