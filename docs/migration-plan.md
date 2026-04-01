# Migration Plan

## Preserve exactly
- Admin vs Member role model
- contribution, withdrawal, and emergency request business workflows
- member status tracking (Active, Warning, Closed)
- dashboard summary expectations
- protected bank statement and constitution views
- account settings and password reset flow

## Improve
- modern Next.js app-router architecture
- Prisma data access and schema management
- Auth.js database sessions
- stronger server-side validation with Zod
- cleaner UI, spacing, hierarchy, and mobile responsiveness
- protected document route handling with local private storage

## Deferred or intentionally simplified
- email delivery for reset tokens is deferred; token generation is implemented for internal starter use
- object storage is deferred; local private storage is used first with a clean upgrade path
- websocket-style live updates are deferred in favor of server-rendered refresh and revalidation
