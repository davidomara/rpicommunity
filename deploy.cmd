@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d C:\apps\rpic-community-app || exit /b 1

set LOG=C:\apps\rpic-community-app\deploy.log
set BRANCH=feature/sql_db
set PORT=3000
set START_TASK=RPIC WWW
set IIS_ROOT=C:\inetpub\wwwroot\rpicommunity

echo ==================================================>> "%LOG%"
echo Deploy check started %date% %time%>> "%LOG%"
echo Running as: %username%>> "%LOG%"

echo --- checkout branch %BRANCH% --- >> "%LOG%"
git checkout %BRANCH% >> "%LOG%" 2>&1
if errorlevel 1 (
  echo FAILED: git checkout %BRANCH% >> "%LOG%"
  exit /b 1
)

echo --- current branch --- >> "%LOG%"
git rev-parse --abbrev-ref HEAD >> "%LOG%" 2>&1
if errorlevel 1 (
  echo FAILED: git rev-parse >> "%LOG%"
  exit /b 1
)

for /f %%i in ('git rev-parse HEAD') do set LOCALHEAD=%%i
if not defined LOCALHEAD (
  echo FAILED: could not read local HEAD >> "%LOG%"
  exit /b 1
)

echo Local HEAD before fetch: !LOCALHEAD!>> "%LOG%"

echo --- current commit before fetch --- >> "%LOG%"
git log -1 --pretty=format:"Commit: %%H ^| Message: %%s" >> "%LOG%" 2>&1
echo.>> "%LOG%"
if errorlevel 1 (
  echo FAILED: git log before fetch >> "%LOG%"
  exit /b 1
)

echo --- git fetch origin %BRANCH% --- >> "%LOG%"
git fetch origin %BRANCH% >> "%LOG%" 2>&1
if errorlevel 1 (
  echo FAILED: git fetch origin %BRANCH% >> "%LOG%"
  exit /b 1
)

for /f %%i in ('git rev-parse origin/%BRANCH%') do set REMOTEHEAD=%%i
if not defined REMOTEHEAD (
  echo FAILED: could not read remote HEAD >> "%LOG%"
  exit /b 1
)

echo Remote HEAD after fetch: !REMOTEHEAD!>> "%LOG%"

if /I "!LOCALHEAD!"=="!REMOTEHEAD!" (
  echo No new commit detected. Nothing to deploy.>> "%LOG%"
  exit /b 0
)

echo --- commit before pull --- >> "%LOG%"
git log -1 --pretty=format:"Commit: %%H ^| Message: %%s" >> "%LOG%" 2>&1
echo.>> "%LOG%"

echo --- check existing app on port %PORT% before deploy --- >> "%LOG%"
set PORTPID=
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
  set PORTPID=%%p
)

if defined PORTPID (
  echo Port %PORT% is currently in use by PID !PORTPID!>> "%LOG%"
  echo NOTE: deploy will not attempt taskkill. App restart must be handled by the owned start task.>> "%LOG%"
) else (
  echo Port %PORT% is free.>> "%LOG%"
)

echo --- git pull origin %BRANCH% --- >> "%LOG%"
git pull origin %BRANCH% >> "%LOG%" 2>&1
if errorlevel 1 (
  echo FAILED: git pull origin %BRANCH% >> "%LOG%"
  exit /b 1
)

echo --- commit after pull --- >> "%LOG%"
git log -1 --pretty=format:"Commit: %%H ^| Message: %%s" >> "%LOG%" 2>&1
echo.>> "%LOG%"
if errorlevel 1 (
  echo FAILED: git log after pull >> "%LOG%"
  exit /b 1
)

echo --- npm install --- >> "%LOG%"
call "C:\Program Files\nodejs\npm.cmd" install >> "%LOG%" 2>&1
if errorlevel 1 (
  echo FAILED: npm install >> "%LOG%"
  exit /b 1
)

echo --- prisma migrate reset: WARNING DATA WILL BE LOST --- >> "%LOG%"
call "C:\Program Files\nodejs\npx.cmd" prisma migrate reset --force >> "%LOG%" 2>&1
if errorlevel 1 (
  echo FAILED: prisma migrate reset >> "%LOG%"
  exit /b 1
)

echo --- prisma generate --- >> "%LOG%"
call "C:\Program Files\nodejs\npx.cmd" prisma generate >> "%LOG%" 2>&1
if errorlevel 1 (
  echo FAILED: prisma generate >> "%LOG%"
  exit /b 1
)

echo --- prisma db seed --- >> "%LOG%"
call "C:\Program Files\nodejs\npx.cmd" prisma db seed >> "%LOG%" 2>&1
if errorlevel 1 (
  echo FAILED: prisma db seed >> "%LOG%"
  exit /b 1
)

echo --- build --- >> "%LOG%"
call "C:\Program Files\nodejs\npm.cmd" run build >> "%LOG%" 2>&1
if errorlevel 1 (
  echo FAILED: build >> "%LOG%"
  exit /b 1
)

if not exist ".next\standalone\server.js" (
  echo FAILED: standalone build output missing at .next\standalone\server.js >> "%LOG%"
  exit /b 1
)

echo --- copy standalone static --- >> "%LOG%"
robocopy .next\static .next\standalone\.next\static /E >> "%LOG%" 2>&1

echo --- copy standalone server --- >> "%LOG%"
powershell -NoProfile -Command "New-Item -ItemType Directory -Force -Path '.next\standalone\.next\server' | Out-Null; Copy-Item '.next\server\*' '.next\standalone\.next\server' -Recurse -Force" >> "%LOG%" 2>&1
if errorlevel 1 (
  echo FAILED: copy standalone server >> "%LOG%"
  exit /b 1
)

echo --- copy standalone public --- >> "%LOG%"
robocopy public .next\standalone\public /E >> "%LOG%" 2>&1

echo --- copy standalone env --- >> "%LOG%"
powershell -NoProfile -Command "Copy-Item '.env.production' '.next\standalone\.env.production' -Force" >> "%LOG%" 2>&1
if errorlevel 1 (
  echo FAILED: copy standalone env >> "%LOG%"
  exit /b 1
)

echo --- prepare IIS runtime folders --- >> "%LOG%"
powershell -NoProfile -Command "New-Item -ItemType Directory -Force -Path '%IIS_ROOT%' | Out-Null; New-Item -ItemType Directory -Force -Path '%IIS_ROOT%\.next' | Out-Null; New-Item -ItemType Directory -Force -Path '%IIS_ROOT%\.next\static' | Out-Null" >> "%LOG%" 2>&1
if errorlevel 1 (
  echo FAILED: create IIS runtime folders >> "%LOG%"
  exit /b 1
)

echo --- stop existing app on port %PORT% before runtime copy --- >> "%LOG%"
set PORTPID=
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
  set PORTPID=%%p
)

if defined PORTPID (
  echo Stopping PID !PORTPID! on port %PORT%>> "%LOG%"
  taskkill /PID !PORTPID! /T /F >> "%LOG%" 2>&1
  if errorlevel 1 (
    echo FAILED: could not stop PID !PORTPID! on port %PORT% >> "%LOG%"
    exit /b 1
  )
  timeout /t 2 /nobreak >nul
)

set PORTPID=
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
  set PORTPID=%%p
)

if defined PORTPID (
  echo FAILED: port %PORT% still in use by PID !PORTPID! after stop attempt >> "%LOG%"
  exit /b 1
) else (
  echo Port %PORT% is free for copy/restart.>> "%LOG%"
)

echo --- copy standalone server to IIS runtime --- >> "%LOG%"
powershell -NoProfile -Command "Copy-Item 'C:\apps\rpic-community-app\.next\standalone\*' '%IIS_ROOT%' -Recurse -Force" >> "%LOG%" 2>&1
if errorlevel 1 (
  echo FAILED: copy standalone server to IIS runtime >> "%LOG%"
  exit /b 1
)

echo --- copy server to IIS runtime --- >> "%LOG%"
powershell -NoProfile -Command "New-Item -ItemType Directory -Force -Path '%IIS_ROOT%\.next\server' | Out-Null; Copy-Item 'C:\apps\rpic-community-app\.next\server\*' '%IIS_ROOT%\.next\server' -Recurse -Force" >> "%LOG%" 2>&1
if errorlevel 1 (
  echo FAILED: copy server to IIS runtime >> "%LOG%"
  exit /b 1
)

echo --- copy static to IIS runtime --- >> "%LOG%"
powershell -NoProfile -Command "Copy-Item 'C:\apps\rpic-community-app\.next\static\*' '%IIS_ROOT%\.next\static' -Recurse -Force" >> "%LOG%" 2>&1
if errorlevel 1 (
  echo FAILED: copy static to IIS runtime >> "%LOG%"
  exit /b 1
)

echo --- copy public to IIS runtime --- >> "%LOG%"
powershell -NoProfile -Command "Copy-Item 'C:\apps\rpic-community-app\public\*' '%IIS_ROOT%' -Recurse -Force" >> "%LOG%" 2>&1
if errorlevel 1 (
  echo FAILED: copy public to IIS runtime >> "%LOG%"
  exit /b 1
)

echo --- copy env to IIS runtime --- >> "%LOG%"
powershell -NoProfile -Command "Copy-Item 'C:\apps\rpic-community-app\.env.production' '%IIS_ROOT%\.env.production' -Force" >> "%LOG%" 2>&1
if errorlevel 1 (
  echo FAILED: copy env to IIS runtime >> "%LOG%"
  exit /b 1
)

echo --- start app task %START_TASK% --- >> "%LOG%"
schtasks /run /tn "%START_TASK%" >> "%LOG%" 2>&1
if errorlevel 1 (
  echo FAILED: could not start task %START_TASK% >> "%LOG%"
  exit /b 1
)

echo {"time":"%date% %time%","commit":"!REMOTEHEAD!","status":"ok"} > C:\inetpub\wwwroot\rpicommunity\deploy-status.json
echo SUCCESS: deploy completed %date% %time%>> "%LOG%"
exit /b 0

@REM Create task from Administrator PowerShell:
@REM schtasks /create /tn "RPIC WWW Deploy" /sc minute /mo 5 /ru "WIN-PBCMT0QQ9B9\svc_gitdeploy" /rp * /tr "cmd.exe /c C:\apps\rpic-community-app\deploy.cmd" /f

@REM Run task:
@REM schtasks /run /tn "RPIC WWW Deploy"

@REM Show task details:
@REM schtasks /query /tn "RPIC WWW Deploy" /fo list /v

@REM Delete task:
@REM schtasks /delete /tn "RPIC WWW Deploy" /f

@REM Show deploy log:
@REM Get-Content C:\apps\rpic-community-app\deploy.log -Tail 100

@REM Show latest deployed commit:
@REM git -C C:\apps\rpic-community-app log -1 --oneline
