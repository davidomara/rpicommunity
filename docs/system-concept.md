# RPIC Community App — System Concept

## Purpose
The RPIC Community App is a modern migration of a community welfare, emergency savings, and financial administration platform for the Research Planning and Innovation Center Community. It preserves the source system's member, contribution, withdrawal, emergency request, and protected document workflows while modernizing the stack with Next.js, TypeScript, Prisma, and Tailwind.

## Primary Goals
- Enable secure role-based access for members, administrators, and treasurers
- Provide a centralized dashboard for financial oversight and member status
- Manage contributions, withdrawals, and emergency requests with audit-friendly records
- Protect sensitive documents such as bank statements and governing constitution files
- Keep deployment simple and maintainable on Railway or similar cloud hosting

## Tech Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM with PostgreSQL
- Auth.js for authentication and database-backed sessions
- Zod for server-side validation
- Recharts for dashboard charting
- shadcn-style UI primitives

## Core User Roles
- `ADMIN`: Full access to member management, contributions, withdrawals, emergency approvals, and document uploads.
- `TREASURER`: Financial approval authority for emergency requests and restricted financial workflows.
- `MEMBER`: Access to own account, contribution history, submit emergency requests, and view protected documents.

## Key Modules
- Authentication
  - Login
  - Password reset token flow
  - Protected routes
- Dashboard
  - Totals, balances, pending requests summaries
  - Contribution and withdrawal charts
- Member Directory
  - Searchable member listing
  - Member status indicators
- Contributions
  - Create member contributions
  - Track contribution history
- Withdrawals
  - Create withdrawals with reason capture
  - Maintain withdrawal audit records
- Emergency Requests
  - Member request submission
  - Pending approval workflow
  - Admin/treasurer approval and rejection tracking
- Documents
  - Protected bank statement uploads and view route
  - Constitution / governing document view route
- Account Settings
  - Email and password management

## Data Model Overview
### User / Member
- `User` represents a person in the system
- Fields: name, username, email, passwordHash, role, status, timestamps
- Relations to contributions, withdrawals, emergency requests, transactions, sessions, accounts, and reset tokens

### Financial Records
- `Contribution`: member contribution amount, date, creator, timestamps
- `Withdrawal`: member withdrawal request, amount, reason, dates, creator
- `Transaction`: audit event for actual money movement, type, member, actor

### Emergency Workflow
- `EmergencyRequest`: requested amount, approved amount, status, decision date
- Multi-step approval fields for admin and treasurer review
- Tracks rejection and disbursement actors and timestamps

### Protected Documents
- `BankStatement`: stored file metadata, secure storage path, file type
- `GoverningDocument`: constitution/guideline file metadata and active flag

### Authentication Support

- `Session`: persisted Auth.js session tokens
- `Account`: external or provider-linked account metadata
- `PasswordResetToken`: password reset workflow with expiration and usage state

## Architecture & Deployment

- Monolithic Next.js application with server actions and API routes
- Local private storage for protected files under `storage/private`
- PostgreSQL database managed by Prisma migrations
- Recommended deployment on Railway with environment variables:
  - `DATABASE_URL`
  - `AUTH_SECRET`
  - `APP_URL`
  - `NEXT_PUBLIC_APP_URL`
  - `AUTH_URL`
  - `NEXTAUTH_URL`
  - `UPLOAD_ROOT=./storage/private`
  - `AUTH_TRUST_HOST=true`
- When deploying under an IIS subpath such as `/rpicommunity`, keep `APP_URL` and `NEXT_PUBLIC_APP_URL` on the app root, and point `AUTH_URL` and `NEXTAUTH_URL` to `/api/auth` under that same base path.
- Production migration workflow prefers `npx prisma migrate deploy` run manually

## Protected File Handling

- Protected document routes guard access behind authentication
- Files are stored locally in `storage/private` and served via authenticated endpoints
- The architecture is designed to allow later migration to object storage if needed

## Design Principles

- Preserve core financial and administrative workflows from the source application
- Favor typed, server-driven validation and data access through Prisma
- Keep the user interface clean and responsive using Tailwind and component primitives
- Avoid unnecessary real-time websocket complexity; use cache revalidation and server-side updates instead

## Notes and Limitations

- Password reset email delivery is supported when `RESEND_API_KEY` and `RESET_EMAIL_FROM` are configured
- Real-time websocket updates are deferred in favor of simpler cache-revalidate behavior

## Recommended Files and Areas

- `app/` — UI routes and page structure
- `components/` — reusable UI components, forms, and page-specific clients
- `lib/` — database, RBAC, settings, storage, utilities, and server logic
- `prisma/schema.prisma` — full data model and database schema
- `docs/` — project discovery, migration notes, and feature documentation
