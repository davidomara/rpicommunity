# SVG Git Deploy Notes

This document reorganizes the current Windows Server deployment notes for the RPIC Community App.

## Run as the deployment user

Open PowerShell as the deployment account:

```powershell
Start-Process powershell.exe -Credential "svc_gitdeploy"
```

Set the user environment if needed:

```powershell
$env:USERPROFILE = "C:\Users\svc_gitdeploy"
$env:HOME = "C:\Users\svc_gitdeploy"
$env:HOMEDRIVE = "C:"
$env:HOMEPATH = "\Users\svc_gitdeploy"
New-Item -ItemType Directory -Force -Path C:\Users\svc_gitdeploy
runas /user:.\svc_gitdeploy powershell
```

## Check local security policy

On the server:

1. Open `secpol.msc`.
2. Go to `Local Policies` -> `User Rights Assignment`.
3. Open `Log on as a batch job`.
4. Add `WIN-PBCMT0QQ9B9\svc_gitdeploy`.
5. Open `Deny log on as a batch job`.
6. Confirm `svc_gitdeploy` is not listed directly and is not part of a denied group.

## Build the app

From the app source folder:

```powershell
cd C:\apps\rpic-community-app
git log HEAD..origin/master --oneline
npm ci
npm run build
```

## Publish the standalone build

Verify the standalone server output exists:

```powershell
Test-Path C:\apps\rpic-community-app\.next\standalone\server.js
```

Prepare the target folders:

```powershell
New-Item -ItemType Directory -Force -Path C:\sites\rpic-community-app | Out-Null
New-Item -ItemType Directory -Force -Path C:\sites\rpic-community-app\.next | Out-Null
```

Copy the built app into the live folder:

```powershell
Copy-Item C:\apps\rpic-community-app\.next\standalone\* C:\sites\rpic-community-app -Recurse -Force
Copy-Item C:\apps\rpic-community-app\.next\static C:\sites\rpic-community-app\.next\static -Recurse -Force
Copy-Item C:\apps\rpic-community-app\public C:\sites\rpic-community-app\public -Recurse -Force
Copy-Item C:\apps\rpic-community-app\.env.production C:\sites\rpic-community-app\.env.production -Force
```

## Verify the published files

```powershell
Get-ChildItem C:\sites\rpic-community-app
Test-Path C:\sites\rpic-community-app\server.js
Test-Path C:\sites\rpic-community-app\.env.production
Test-Path C:\sites\rpic-community-app\public
Test-Path C:\sites\rpic-community-app\.next\static
```

## Create the startup script

Create this once:

```powershell
@'
@echo off
setlocal
cd /d C:\sites\rpic-community-app
if not exist logs mkdir logs
set NODE_ENV=production
set HOSTNAME=127.0.0.1
set PORT=3000
node server.js >> logs\nextjs.log 2>&1
'@ | Set-Content C:\sites\rpic-community-app\start-next.cmd -Encoding ASCII
```

Confirm the script contents:

```powershell
Get-Content C:\sites\rpic-community-app\start-next.cmd
```

## Start the app manually

```powershell
cmd /c C:\sites\rpic-community-app\start-next.cmd
```

## Start via scheduled task

```powershell
schtasks /run /tn "RPIC Next.js"
Start-Sleep -Seconds 5
Test-NetConnection 127.0.0.1 -Port 3000
schtasks /query /tn "RPIC Next.js" /fo list /v
```

## Test the app

Check both the Node process and IIS endpoint:

```powershell
Invoke-WebRequest http://127.0.0.1:3000 -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:8080 -UseBasicParsing
```

Review logs if needed:

```powershell
Clear-Content C:\sites\rpic-community-app\logs\nextjs.log
Get-Content C:\sites\rpic-community-app\logs\nextjs.log -Tail 30
```

## Restart the IIS site

Use an admin PowerShell session:

```powershell
Restart-WebItem "IIS:\Sites\rpicommunity"
```

Test IIS again:

```powershell
Invoke-WebRequest http://127.0.0.1:8080 -UseBasicParsing
```

Check site and app pool state:

```powershell
Get-Website -Name "rpicommunity"
Get-WebAppPoolState -Name "RPICCommunityApp"
```

## Useful output to collect

If troubleshooting, collect the output of these commands:

```powershell
Invoke-WebRequest http://127.0.0.1:8080 -UseBasicParsing
Get-Website -Name "rpicommunity"
Get-WebAppPoolState -Name "RPICCommunityApp"
```
