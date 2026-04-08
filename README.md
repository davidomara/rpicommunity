# RPIC Community App

A modern Next.js + TypeScript implementation of the existing community welfare and emergency savings platform, adapted for the Research Planning and Innovation Center Community under the Directorate of ICT.

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

## Getting started

1. Copy `.env.example` to `.env`
2. Set `DATABASE_URL` and `AUTH_SECRET`
3. Run `npm install`
4. Run `npx prisma migrate dev`
5. Run `npm run prisma:seed`
6. Run `npm run dev`

## Environment notes

- WSL setup and troubleshooting: [docs/wsl-setup.md](/mnt/d/.Nord%20APP/RPICCommunityApp/docs/wsl-setup.md)

## Demo users

- Admin: `admin` / `Admin@123`
- Member: `alice` / `Member@123`
- Temporary PIN for new or reset member accounts: `Member@123`

## WSL 

Then redeploy Railway.

If you want to verify locally first from the WSL repo:

cd /home/nord/projects/RPICCommunityApp
npm run build

## Railway deployment

- Create one Railway PostgreSQL service
- Create one Railway web service for this app
- Root directory: repo root. Leave it blank if this repository is deployed directly to Railway because `package.json` is already at the project root.
- Set `DATABASE_URL`, `AUTH_SECRET`, `APP_URL`, and `UPLOAD_ROOT`
- Recommended Railway variables:
  `DATABASE_URL`
  `AUTH_SECRET`
  `APP_URL`
  `UPLOAD_ROOT=./storage/private`
  `AUTH_TRUST_HOST=true`
- Recommended build command:
  `npm install && npx prisma generate && npm run build`
- Recommended start command:
  `npx prisma migrate deploy && npm run start`
- First deploy flow:
  1. Push this repo to GitHub
  2. In Railway, create a PostgreSQL service
  3. In Railway, create a web service from the GitHub repo
  4. Confirm the root directory is blank or `/`
  5. Add the environment variables listed above
  6. Set the build command to `npm install && npx prisma generate && npm run build`
  7. Set the start command to `npx prisma migrate deploy && npm run start`
  8. Deploy the service
  9. After the first successful deploy, open a Railway shell and run `npm run prisma:seed` once if you want the demo data
- Railway CLI example:
  `railway up`

## Storage

Protected files are stored under `storage/private` by default. This starter keeps file access behind authenticated routes. Move to object storage later if file volume grows.

## Notes

- Password reset token generation is implemented; delivery email is not wired in this starter.
- The architecture is intentionally monolithic for faster, cheaper, and simpler deployment on Railway.
