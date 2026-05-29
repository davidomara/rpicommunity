# WSL Setup And Troubleshooting

This note captures the WSL environment work done for this project so it can be reused later without repeating trial and error.

## Why WSL

For Next.js development, WSL is the better option than running the repo from a Windows-mounted drive with Windows Node tooling.

Benefits:
- faster file watching and rebuilds
- cleaner Node/npm behavior
- better fit for Prisma and PostgreSQL development

## Recommended Repo Location

Keep the active development copy inside the Linux filesystem, not under `/mnt/d` or `/mnt/c`.

Recommended path:

```bash
/home/nord/projects/RPICCommunityApp
```

## Shell Differences

Use the right shell for the right path.

### WSL shell

Prompt example:

```bash
nord@DESKTOP-DTFMR9I:~/projects/RPICCommunityApp$
```

Use Linux paths:

```bash
cd /home/nord/projects/RPICCommunityApp
```

### PowerShell

PowerShell does not understand WSL Linux paths directly as local Windows paths.

Use:

```powershell
wsl
cd /home/nord/projects/RPICCommunityApp
```

Or open the WSL filesystem from Windows with:

```powershell
cd \\wsl$\Ubuntu\home\nord\projects\RPICCommunityApp
```

If the distro name is different, check it with:

```powershell
wsl -l -v
```

### Git Bash

Git Bash is not WSL. In Git Bash, `~` points to the Windows home directory, so this can fail:

```bash
cd ~/projects/RPICCommunityApp
```

If the prompt contains `MINGW64`, switch back to WSL:

```bash
wsl
cd /home/nord/projects/RPICCommunityApp
```

## WSL Node Setup

Initial problem:
- `npm` resolved to `/mnt/c/nvm4w/nodejs/npm`
- `node` was missing in WSL
- `npm install` failed with `exec: node: not found`

The fix was to install WSL-native Node with `nvm`.

### Install nvm

```bash
sudo apt update
sudo apt install -y curl build-essential
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
```

If `nvm` is still not available, add this to `~/.bashrc`:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
```

Then reload:

```bash
source ~/.bashrc
```

### Install Node

```bash
nvm install 22
nvm alias default 22
hash -r
```

### Verify Node And npm

```bash
which node
node -v
which npm
npm -v
```

Expected pattern:
- `node` points to `~/.nvm/versions/node/...`
- `npm` points to `~/.nvm/versions/node/...`

## Turbopack

The project dev script was changed to use Turbopack:

```json
"dev": "next dev --turbo"
```

Run development server with:

```bash
npm run dev
```

## PostgreSQL From WSL

The project datasource is PostgreSQL through Prisma's `postgresql` provider. WSL does not need a database service running inside Linux when PostgreSQL is already available on Windows, a managed host, or another reachable server.

### PostgreSQL connection checks

Confirm the PostgreSQL host and TCP port are reachable from WSL:

```bash
nc -vz HOST 5432
```

If `nc` is not installed:

```bash
sudo apt update
sudo apt install -y netcat-openbsd
```

Use `HOST:PORT` in `DATABASE_URL`. Prisma is most predictable with an explicit TCP port.

## Database URL Options

### Option 1: Local or network PostgreSQL

Use this in `.env` when PostgreSQL is reachable on a fixed TCP port:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:5432/rpic_community?schema=public"
```

### Option 2: Production PostgreSQL

Use the production PostgreSQL host, database, and credentials:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:5432/DB_NAME?schema=public"
```

Notes:
- keep the URL scheme as `postgresql://` because the Prisma datasource provider is `postgresql`

## Project Startup Flow In WSL

After Node and PostgreSQL are ready:

```bash
cd /home/nord/projects/RPICCommunityApp
npm install
npx prisma migrate dev --name add_performance_indexes
npm run prisma:seed
npm run dev
```

## Prisma Notes

This repo now includes added indexes in the Prisma schema for the main query patterns used by:
- members
- contributions
- withdrawals
- emergency requests
- transactions
- sessions and reset tokens

If schema changes exist but the database has not been updated yet, run:

```bash
npx prisma migrate dev --name add_performance_indexes
```

## Admin Page Refactor Notes

The finance admin pages were shifted toward a lighter server-shell plus client-driven interaction model.

Main change:
- server pages handle auth and initial data fetch
- client components handle selected-member state and local table filtering

Affected areas:
- contributions
- withdrawals

This reduces server round trips for member filtering and keeps the page interaction faster.

## Common Mistakes

### Mistake 1: Running WSL paths in PowerShell

Wrong:

```powershell
cd /home/nord/projects/RPICCommunityApp
```

Fix:

```powershell
wsl
cd /home/nord/projects/RPICCommunityApp
```

### Mistake 2: Running from Git Bash instead of WSL

If the prompt shows `MINGW64`, you are not in WSL.

Fix:

```bash
wsl
```

### Mistake 3: Windows npm leaking into WSL

Symptom:

```bash
/mnt/c/nvm4w/nodejs/npm: exec: node: not found
```

Fix:
- install WSL-native Node with `nvm`
- confirm `which node` and `which npm` both point into `~/.nvm`

### Mistake 4: Database URL does not match PostgreSQL

Symptom:
- Prisma reports a datasource provider mismatch
- `npx prisma migrate dev` refuses to use the migration history

Fix:
- confirm `prisma/schema.prisma` uses `provider = "postgresql"`
- confirm `prisma/migrations/migration_lock.toml` uses `provider = "postgresql"`
- confirm `.env` starts `DATABASE_URL` with `postgresql://`

## Quick Verification Checklist

```bash
which node
which npm
node -v
npm -v
cd /home/nord/projects/RPICCommunityApp
npm install
npx prisma validate
npx prisma migrate status
npx prisma migrate dev --name add_performance_indexes
npm run prisma:seed
npm run dev
```

