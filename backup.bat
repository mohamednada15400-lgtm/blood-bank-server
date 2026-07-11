@echo off
REM Blood Bank Backup Script - Run after any project changes
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "backup.ps1"
pause