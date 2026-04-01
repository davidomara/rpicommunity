# Source Repo Discovery Summary

## Source system purpose
The source repository implements a community welfare, emergency savings, and financial administration system. It is not a general research management tool.

## Core modules discovered
- authentication with username/email + password
- protected member/admin pages
- dashboard with totals, balance, member statuses, pending emergency requests, and a contribution/missing/withdrawal chart
- member directory and summary table
- admin contribution capture
- admin withdrawal capture
- member emergency request submission with admin approval/rejection
- protected bank statement upload and viewing
- protected constitution/document viewing
- account settings for email and password changes
- audit-style transaction tracking for money movements

## Roles discovered
- Admin
- Member

## Route/page structure discovered
- login, forgot password, reset password
- dashboard
- members
- contribute
- withdraw
- emergency
- bank-statement
- constitution
- account

## Financial workflow patterns discovered
- contributions and withdrawals are admin-controlled
- recent per-member financial history is shown near the form
- dashboard aggregates totals and balance
- emergency approvals act as a privileged financial workflow

## Document handling discovered
- protected PDF/image bank statement preview
- protected constitution/document view
- file access is intended to stay behind authentication

## Main migration direction
The RPIC repo preserves the same product DNA and workflows while moving to Next.js, TypeScript, Prisma, Auth.js, Tailwind, and Railway deployment.
