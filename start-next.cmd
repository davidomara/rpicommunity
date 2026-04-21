@echo off
setlocal
cd /d C:\inetpub\wwwroot\rpicommunity || exit /b 1
set PATH=C:\Program Files\nodejs;%PATH%
set PORT=3000
echo Starting app at %date% %time%>> C:\apps\rpic-community-app\next-start.log
"C:\Program Files\nodejs\node.exe" server.js >> C:\apps\rpic-community-app\next-start.log 2>&1