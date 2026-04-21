@echo off
cd /d C:\apps\rpic-community-app || exit /b 1
robocopy .next\static .next\standalone\.next\static /E >nul
robocopy public .next\standalone\public /E >nul
set PATH=C:\Program Files\nodejs;%PATH%
set PORT=3000
"C:\Program Files\nodejs\node.exe" .next\standalone\server.js >> C:\apps\rpic-community-app\next-start.log 2>&1