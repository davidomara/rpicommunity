# RPIC Community App

A modern Next.js + TypeScript implementation of the existing community welfare and emergency savings platform, adapted for the Research Planning and Innovation Center Community.

## Source reference

This repo is a migration and modernization of the original Lango Community application. The source system's financial workflows, protected document handling, dashboard behaviors, and role model were preserved.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- Prisma ORM
- SQL Server
- Auth.js with database sessions
- Zod validation
- Recharts

## Modules

- login, password reset, protected pages
- dashboard summaries and contribution status chart
- member directory
- contributions
- withdrawals
- emergency requests with approve/reject flow
- protected bank statements
- protected constitution/guidelines document
- account settings
- automatic member status rules based on arrears thresholds
- admin-requested member status changes with Admin and Treasurer approval

## Getting started

1. Copy `.env.example` to `.env`
2. Set `DATABASE_URL` to your SQL Server connection string, and set `AUTH_SECRET`
3. Run `npm install`
4. Run `npx prisma migrate dev`
5. Run `npm run prisma:seed`
6. Run `npm run dev`

Example `DATABASE_URL` for SQL Server:

```env
DATABASE_URL="sqlserver://HOST:PORT;database=DB_NAME;user=USERNAME;password=PASSWORD;encrypt=true;trustServerCertificate=true;"
```

## Default users

- Admin: `admin` / `Admin@123`
- Treasurer: `treasurer` / `Admin@123`
- All onboarded members: default temporary PIN `Member@123`
- `npm run prisma:seed` now creates the onboarding user list only. It does not insert demo contributions, withdrawals, transactions, or emergency requests.
- Member status is now derived automatically from arrears months instead of manual selection.
- Default automation rule:
  `3` months in arrears => `WARNING`
  `6` months in arrears => `CLOSED`
- Admins can change these thresholds from `Account Settings` under `Member Status Automation`.
- In `Members`, Admins can use the edit icon to request a manual member status change.
- A requested member status change is only applied after both Admin and Treasurer approve it.
- Once a manual status change is fully approved, that member is treated as a manual override until changed again.
- Community member ordering in views, selectors, and search results follows rank order:
  `CP`, `SSP`, `SP`, `ASP`, `AIP`, `CPL`, `PC`
- Within the same rank, names are sorted alphabetically.

## Windows Server deployment

This branch targets Windows Server with SQL Server.

Use standalone output in Next.js. This repo already uses `next.config.mjs` with standalone output enabled.

Server working directory:

```powershell
cd C:\apps\rpic-community-app
```

Stop any currently running Node process before rebuilding:

```powershell
taskkill /f /im node.exe
```

Run this on the server after pulling:

```powershell
npx prisma migrate deploy
npx prisma generate
cd C:\apps\rpic-community-app
& "C:\Program Files\nodejs\npm.cmd" run build
robocopy .next\static .next\standalone\.next\static /E
robocopy public .next\standalone\public /E
Copy-Item .env.production .next\standalone\.env.production -Force
taskkill /f /im node.exe
schtasks /run /tn "RPIC WWW"
```

If you only need to add a Treasurer user in production, do not reseed the whole database. Use a one-off command instead:

```bash
DATABASE_URL="sqlserver://HOST:PORT;database=DB_NAME;user=USERNAME;password=PASSWORD;encrypt=true;trustServerCertificate=true;" node -e "const bcrypt=require('bcryptjs'); const {PrismaClient,Role,MemberStatus}=require('@prisma/client'); const prisma=new PrismaClient(); (async()=>{ await prisma.user.create({ data:{ name:'RPIC Community Treasurer', username:'treasurer', email:'treasurer@rpic.local', passwordHash:await bcrypt.hash('Admin@123',12), role:Role.TREASURER, status:MemberStatus.ACTIVE } }); console.log('Treasurer created: treasurer / Admin@123'); })().finally(()=>prisma.$disconnect());"
```

If a Treasurer account may already exist, use an upsert instead:

```bash
DATABASE_URL="sqlserver://HOST:PORT;database=DB_NAME;user=USERNAME;password=PASSWORD;encrypt=true;trustServerCertificate=true;" node -e "const bcrypt=require('bcryptjs'); const {PrismaClient,Role,MemberStatus}=require('@prisma/client'); const prisma=new PrismaClient(); (async()=>{ await prisma.user.upsert({ where:{ username:'treasurer' }, update:{ email:'treasurer@rpic.local', role:Role.TREASURER, status:MemberStatus.ACTIVE }, create:{ name:'RPIC Community Treasurer', username:'treasurer', email:'treasurer@rpic.local', passwordHash:await bcrypt.hash('Admin@123',12), role:Role.TREASURER, status:MemberStatus.ACTIVE } }); console.log('Treasurer upserted'); })().finally(()=>prisma.$disconnect());"
```

Production environment example:

```env
APP_URL=http://10.20.70.138/rpicommunity
NEXT_PUBLIC_APP_URL=http://10.20.70.138/rpicommunity
AUTH_URL=http://10.20.70.138/rpicommunity/api/auth
NEXTAUTH_URL=http://10.20.70.138/rpicommunity/api/auth
NEXT_PUBLIC_POLICE_APP_URL=http://10.20.70.138/rpicommunity
NEXT_PUBLIC_PUBLIC_APP_URL=http://154.72.204.131:8087/rpicommunity
```

If you are deploying behind IIS with URL Rewrite and Application Request Routing, create the reverse-proxy rule in IIS.

After you create the reverse-proxy rule, IIS may write the rule for you. If you want to place it manually, save this as:

`C:\sites\rpic-community-app\web.config`

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ReverseProxyInboundRule" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://127.0.0.1:3000/{R:1}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## Storage

Protected files are stored under `storage/private` by default for local development.

For Windows Server production, point `UPLOAD_ROOT` to a persistent folder on disk, for example:

`UPLOAD_ROOT=C:\sites\rpic-community-app\data\private`

This app stores logical relative file keys in the database for new uploads and resolves them against `UPLOAD_ROOT` at runtime. Existing older rows that stored absolute disk paths still work if those files still exist.

This keeps file access behind authenticated routes while making uploads survive restarts and redeploys.

## Notes

- Password reset sends email links when `RESEND_API_KEY` and `RESET_EMAIL_FROM` are configured.
