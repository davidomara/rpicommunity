@echo off
setlocal
cd /d C:\inetpub\wwwroot\rpicommunity || exit /b 1
set PATH=C:\Program Files\nodejs;%PATH%
set NODE_ENV=production
set PORT=3000
set HOSTNAME=127.0.0.1
echo Starting app at %date% %time%>> C:\apps\rpic-community-app\next-start.log
"C:\Program Files\nodejs\node.exe" server.js >> C:\apps\rpic-community-app\next-start.log 2>&1
set EXITCODE=%ERRORLEVEL%
echo App exited at %date% %time% with code %EXITCODE%>> C:\apps\rpic-community-app\next-start.log
exit /b %EXITCODE%


@rem schtasks /create /tn "RPIC WWW" /sc onstart /ru "WIN-PBCMT0QQ9B9\svc_gitdeploy" /rp * /rl highest /tr "C:\apps\rpic-community-app\start.cmd" /f
@rem schtasks /run /tn "RPIC WWW"
@rem schtasks /query /tn "RPIC WWW" /fo list /v
