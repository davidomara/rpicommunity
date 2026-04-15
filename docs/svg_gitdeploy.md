# SVG Git Deploy Notes

Windows Server deployment runbook for the RPIC Community App.

## App configuration reference

The app is currently built as a standalone Next.js server.

Relevant `next.config.mjs` settings:

```js
const nextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
      allowedOrigins: ["10.20.70.138:8080"]
    }
  }
};
```

Production environment values expected in `.env.production`:

```env
AUTH_TRUST_HOST=true
APP_URL=http://10.20.70.138:8080
UPLOAD_ROOT=./data/private
NEXTAUTH_URL=http://10.20.70.138:8080
```

Keep secrets such as `DATABASE_URL` and `AUTH_SECRET` in the real `.env.production` file, but avoid pasting live credentials into docs.

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
```

## Check local security policy

On the server:

1. Open `secpol.msc`.
2. Go to `Local Policies` -> `User Rights Assignment`.
3. Open `Log on as a batch job`.
4. Add `WIN-PBCMT0QQ9B9\svc_gitdeploy`.
5. Open `Deny log on as a batch job`.
6. Confirm `svc_gitdeploy` is not listed there directly and is not included through a denied group.

## One-time setup

### Verify standalone output is enabled

The app should use:

```js
output: "standalone"
```

### Prepare the live folders

```powershell
New-Item -ItemType Directory -Force -Path C:\sites\rpic-community-app | Out-Null
New-Item -ItemType Directory -Force -Path C:\sites\rpic-community-app\.next | Out-Null
```

### Create the startup script

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

Confirm it:

```powershell
Get-Content C:\sites\rpic-community-app\start-next.cmd
```

## Standard redeploy flow

### 1. Build in the source folder

```powershell
cd C:\apps\rpic-community-app
git log HEAD..origin/master --oneline
npm ci
npm run build
```

Verify the standalone server file exists:

```powershell
Test-Path C:\apps\rpic-community-app\.next\standalone\server.js
```

### 2. Stop the running Node app

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### 3. Copy fresh files to the live folder

```powershell
Copy-Item C:\apps\rpic-community-app\.next\standalone\* C:\sites\rpic-community-app -Recurse -Force
Copy-Item C:\apps\rpic-community-app\.next\static C:\sites\rpic-community-app\.next\static -Recurse -Force
Copy-Item C:\apps\rpic-community-app\public C:\sites\rpic-community-app\public -Recurse -Force
Copy-Item C:\apps\rpic-community-app\.env.production C:\sites\rpic-community-app\.env.production -Force
```

### 4. Verify the published files

```powershell
Get-ChildItem C:\sites\rpic-community-app
Test-Path C:\sites\rpic-community-app\server.js
Test-Path C:\sites\rpic-community-app\.env.production
Test-Path C:\sites\rpic-community-app\public
Test-Path C:\sites\rpic-community-app\.next\static
```

### 5. Start the app again

Manual start:

```powershell
cmd /c C:\sites\rpic-community-app\start-next.cmd
```

Scheduled task start:

```powershell
schtasks /run /tn "RPIC Next.js"
Start-Sleep -Seconds 5
Test-NetConnection 127.0.0.1 -Port 3000
schtasks /query /tn "RPIC Next.js" /fo list /v
```

## Validation checks

### Test the Node endpoint

```powershell
Invoke-WebRequest http://127.0.0.1:3000 -UseBasicParsing
```

### Test through IIS

```powershell
Invoke-WebRequest http://127.0.0.1:8080 -UseBasicParsing
```

### Restart IIS if needed

Use an admin PowerShell session:

```powershell
Restart-WebItem "IIS:\Sites\rpicommunity"
```

Then retest:

```powershell
Invoke-WebRequest http://127.0.0.1:8080 -UseBasicParsing
```

### Check site and app pool state

```powershell
Get-Website -Name "rpicommunity"
Get-WebAppPoolState -Name "RPICCommunityApp"
```

## Logs and troubleshooting

Clear and inspect the app log:

```powershell
Clear-Content C:\sites\rpic-community-app\logs\nextjs.log
Get-Content C:\sites\rpic-community-app\logs\nextjs.log -Tail 30
```

If troubleshooting, collect the output of:

```powershell
Invoke-WebRequest http://127.0.0.1:8080 -UseBasicParsing
Get-Website -Name "rpicommunity"
Get-WebAppPoolState -Name "RPICCommunityApp"
```
