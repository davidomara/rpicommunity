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

## Demo users
- Admin: `admin` / `Admin@123`
- Member: `alice` / `Member@123`

## Railway deployment
- Create one Railway PostgreSQL service
- Create one Railway web service for this app
- Set `DATABASE_URL`, `AUTH_SECRET`, `APP_URL`, and `UPLOAD_ROOT`
- Run Prisma migrations on deploy before first production launch

## Storage
Protected files are stored under `storage/private` by default. This starter keeps file access behind authenticated routes. Move to object storage later if file volume grows.

## Notes
- Password reset token generation is implemented; delivery email is not wired in this starter.
- The architecture is intentionally monolithic for faster, cheaper, and simpler deployment on Railway.
