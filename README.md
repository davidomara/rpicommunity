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
- Railway PostgreSQL
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
2. Set `DATABASE_URL` and `AUTH_SECRET`
3. Run `npm install`
4. Run `npx prisma migrate dev`
5. Run `npm run prisma:seed`
6. Run `npm run dev`

## Environment notes

- WSL setup and troubleshooting: [docs/wsl-setup.md](/mnt/d/.Nord%20APP/RPICCommunityApp/docs/wsl-setup.md)

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

## WSL New 

Then redeploy Railway.

If you want to verify locally first from the WSL repo:

cd /home/nord/projects/RPICCommunityApp
npm run build

Windows to WSL is already synced for the contribution-notification changes.

Run this in WSL:

```bash
cd /home/nord/projects/RPICCommunityApp
npx prisma generate
npm run build
```

If you also want the local DB aligned first:

```bash
cd /home/nord/projects/RPICCommunityApp
npx prisma migrate dev
npx prisma generate
npm run build
```

Manual Windows -> WSL sync commands :

```bash

-- Manual command to do the same offline:

rsync -a --delete --exclude '.git/' --exclude 'node_modules/' --exclude '.next/' --exclude 'storage/' '/mnt/d/.Nord APP/RPICCommunityApp/' '/home/nord/projects/RPICCommunityApp/'

-- Manual verification command:

rsync -ani --delete --exclude '.git/' --exclude 'node_modules/' --exclude '.next/' --exclude 'storage/' '/mnt/d/.Nord APP/RPICCommunityApp/' '/home/nord/projects/RPICCommunityApp/'


If `npm run build` fails again after `npx prisma generate`, paste the next error block.

## Railway deployment

- Create one Railway PostgreSQL service
- Create one Railway web service for this app
- Root directory: repo root. Leave it blank if this repository is deployed directly to Railway because `package.json` is already at the project root.
- Set `DATABASE_URL`, `AUTH_SECRET`, `APP_URL`, and `UPLOAD_ROOT`
- Recommended Railway variables:
  `DATABASE_URL`
  `AUTH_SECRET`
  `APP_URL`
  `UPLOAD_ROOT=/data/private`
  `AUTH_TRUST_HOST=true`
- Recommended build command:
  `npm run build`
- Recommended start command:
  `npm run start`
- Recommended migration flow:
  Run `npx prisma migrate deploy` manually from a Railway shell or CI job when you intentionally want to apply pending production migrations.
- cd /home/nord/projects/RPICCommunityApp wsl
- Example production migration commands from your own terminal:
  `DATABASE_URL='postgresql://...production...?sslmode=require' npx prisma migrate deploy`
  `DATABASE_URL='postgresql://...production...?sslmode=require' npx prisma migrate status`
- Why:
  Running `prisma migrate deploy` inside the Railway start command can put the service into a restart loop if a migration fails. Keeping migrations as a manual deployment step is safer for production.
- First deploy flow:
  1. Push this repo to GitHub
  2. In Railway, create a PostgreSQL service
  3. In Railway, create a web service from the GitHub repo
  4. Confirm the root directory is blank or `/`
  5. Add the environment variables listed above
  6. Set the build command to `npm run build`
  7. Set the start command to `npm run start`
  8. Deploy the service
  9. If you have pending schema changes, open a Railway shell and run `npx prisma migrate deploy`
  10. After the first successful deploy, open a Railway shell and run `npm run prisma:seed` once if you want the onboarding user accounts
  11. If Prisma reports a failed production migration record but the schema changes are already present, resolve it before future deploys with:
     `npx prisma migrate resolve --applied <migration_name>`
  12. If you only need to add a Treasurer user in production, do not reseed the whole database. Run a one-off create command instead:
     `DATABASE_URL='postgresql://...production...?sslmode=require' node -e "const bcrypt=require('bcryptjs'); const {PrismaClient,Role,MemberStatus}=require('@prisma/client'); const prisma=new PrismaClient(); (async()=>{ await prisma.user.create({ data:{ name:'RPIC Community Treasurer', username:'treasurer', email:'treasurer@rpic.local', passwordHash:await bcrypt.hash('Admin@123',12), role:Role.TREASURER, status:MemberStatus.ACTIVE } }); console.log('Treasurer created: treasurer / Admin@123'); })().finally(()=>prisma.$disconnect());"`
  13. If a Treasurer account may already exist, use an upsert instead:
     `DATABASE_URL='postgresql://...production...?sslmode=require' node -e "const bcrypt=require('bcryptjs'); const {PrismaClient,Role,MemberStatus}=require('@prisma/client'); const prisma=new PrismaClient(); (async()=>{ await prisma.user.upsert({ where:{ username:'treasurer' }, update:{ email:'treasurer@rpic.local', role:Role.TREASURER, status:MemberStatus.ACTIVE }, create:{ name:'RPIC Community Treasurer', username:'treasurer', email:'treasurer@rpic.local', passwordHash:await bcrypt.hash('Admin@123',12), role:Role.TREASURER, status:MemberStatus.ACTIVE } }); console.log('Treasurer upserted'); })().finally(()=>prisma.$disconnect());"`
- Railway CLI example:
  `railway up`

## Windows Server deployment

For a Windows Server deployment, use standalone output in Next.js. This repo uses `next.config.mjs`, so set:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone"
}
```

Production environment example:

```env
NEXTAUTH_URL=http://10.20.70.138
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

For Railway production, do not use app-local disk for protected uploads. Mount a persistent volume and point:

`UPLOAD_ROOT=/data/private`

This app now stores logical relative file keys in the database for new uploads, and resolves them against `UPLOAD_ROOT` at runtime. Existing older rows that stored absolute disk paths still work if those files still exist, but files previously written to ephemeral Railway local disk must be re-uploaded after you switch to a mounted volume.

This keeps file access behind authenticated routes while making uploads survive redeploys and restarts. Move to object storage later if file volume or retention requirements grow.

## Notes

- Password reset token generation is implemented; delivery email is not wired in this starter.
- The architecture is intentionally monolithic for faster, cheaper, and simpler deployment on Railway.
