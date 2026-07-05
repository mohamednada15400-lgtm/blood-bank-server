@echo off
chcp 1256 >nul
title Blood Bank Server
cd /d "%~dp0"

:MENU
cls
echo ============================================
echo   Blood Bank Server Manager
echo ============================================
echo.
echo  1. Start Server
echo  2. Stop Server
echo  3. Restart Server
echo  4. Status
echo  5. Exit
echo.
set /p ch=Choice [1-5]:

if "%ch%"=="1" goto START
if "%ch%"=="2" goto STOP
if "%ch%"=="3" goto RESTART
if "%ch%"=="4" goto STATUS
if "%ch%"=="5" goto EXIT
goto MENU

:START
echo Starting server...
start /B /MIN "" node server.js
echo Server started on http://localhost:3001
timeout /t 3 /nobreak >nul
goto MENU

:STOP
echo Stopping server...
for /f "tokens=2 delims=," %%p in ('tasklist /fi "imagename eq node.exe" /fo csv /nh 2^>nul') do (
    taskkill /f /pid %%~p >nul 2>&1
)
echo Server stopped.
timeout /t 2 /nobreak >nul
goto MENU

:RESTART
echo Restarting...
for /f "tokens=2 delims=," %%p in ('tasklist /fi "imagename eq node.exe" /fo csv /nh 2^>nul') do (
    taskkill /f /pid %%~p >nul 2>&1
)
timeout /t 1 /nobreak >nul
start /B /MIN "" node server.js
echo Server restarted.
timeout /t 3 /nobreak >nul
goto MENU

:STATUS
netstat -ano 2>nul | findstr ":3001 " >nul
if %errorlevel% equ 0 (
    echo Server is running on port 3001
) else (
    echo Server is stopped
)
timeout /t 4 /nobreak >nul
goto MENU

:EXIT
exit /b
