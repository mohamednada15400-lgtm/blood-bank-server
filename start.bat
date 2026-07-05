@echo off
chcp 1256 >nul
title Blood Bank Server
cd /d "%~dp0"
echo.
echo ============================================
echo    🩸 نظام إدارة بنوك الدم
echo    Blood Bank Management System
echo ============================================
echo.
echo جاري تشغيل السيرفر...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" /c:"IPv4 Address"') do set "ip=%%a"
set "ip=%ip: =%"
if "%ip%"=="" set "ip=127.0.0.1"
echo.
echo ============================================
echo    تم التشغيل بنجاح ✅
echo ============================================
echo.
echo    على هذا الجهاز:
echo    http://localhost:3001
echo.
echo    🌐 على الأجهزة الأخرى (موبايل/تابلت):
echo    http://%ip%:3001
echo.
echo    افتح الرابط في أي متصفح على نفس الشبكة
echo.
echo ============================================
start /B /MIN "" node server.js
timeout /t 4 /nobreak >nul
start http://localhost:3001
echo.
echo السيرفر شغال — اضغط أي زر للإغلاق
pause >nul
exit /b
