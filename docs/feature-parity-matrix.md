# Feature Parity Matrix

| Source Feature | Keep As-Is | Improve | Defer | Notes |
| --- | --- | --- | --- | --- |
| Login + protected routes | Yes | Yes | No | Moved to Auth.js with database sessions |
| Dashboard summary cards | Yes | Yes | No | Cleaner layout and typed data access |
| Contribution capture | Yes | Yes | No | Server actions + Zod validation |
| Withdrawal capture | Yes | Yes | No | Server actions + audit transaction records |
| Emergency requests | Yes | Yes | No | Server-side approval/rejection flow |
| Member directory | Yes | Yes | No | Searchable summary table |
| Bank statement protected view | Yes | Yes | No | Local private storage + protected file route |
| Constitution protected view | Yes | Yes | No | Local private storage + protected file route |
| Account settings | Yes | Yes | No | Email/password actions preserved |
| Password reset | Yes | Partial | No | Token flow implemented; email sending deferred |
| Real-time websocket updates | No | No | Yes | Replaced with cache revalidation in starter |
