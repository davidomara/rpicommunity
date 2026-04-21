cd C:\apps\rpic-community-app
& "C:\Program Files\nodejs\npm.cmd" run build
robocopy .next\static .next\standalone\.next\static /E
robocopy public .next\standalone\public /E
Copy-Item .env.production .next\standalone\.env.production -Force
schtasks /run /tn "RPIC WWW"