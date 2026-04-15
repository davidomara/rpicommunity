# SVG Deploy on Port 80

Windows Server deployment notes for hosting the RPIC Community App through IIS on port `80` under the subpath `/rpicommunity`.

## Current app path configuration

The repo is currently configured to run under:

```txt
/rpicommunity
```

This matches the current `next.config.mjs` and `.env.production` values.

## Step 1: Create the IIS folder and permissions

Run PowerShell as Administrator:

```powershell
New-Item -ItemType Directory -Force -Path C:\inetpub\wwwroot\rpicommunity
icacls C:\inetpub\wwwroot\rpicommunity /grant "WIN-PBCMT0QQ9B9\svc_gitdeploy:(OI)(CI)M" /T
icacls C:\inetpub\wwwroot\rpicommunity
```

This creates the site folder and grants modify access to the deployment user.

## Step 2: Configure Next.js for the subpath

Open the source config file, not the live copy:

```powershell
notepad C:\apps\rpic-community-app\next.config.mjs
```

Use this structure:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  basePath: "/rpicommunity",
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
      allowedOrigins: ["10.20.70.138"]
    }
  },
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/favicon.svg",
        permanent: false
      }
    ];
  }
};

export default nextConfig;
```

## Step 3: Update production environment values

Open the source environment file:

```powershell
notepad C:\apps\rpic-community-app\.env.production
```

Set the app URLs to the IIS subpath:

```env
AUTH_TRUST_HOST=true
APP_URL=http://10.20.70.138/rpicommunity
UPLOAD_ROOT=./data/private
NEXTAUTH_URL=http://10.20.70.138/rpicommunity
```

Keep sensitive values such as `DATABASE_URL` and `AUTH_SECRET` in the real file, but do not document live credentials in notes.

## Step 4: Build the app

From the source folder:

```powershell
cd C:\apps\rpic-community-app
npm ci
npm run build
```

## Step 5: Publish the standalone output

Copy the built app into the live IIS folder:

```powershell
Copy-Item C:\apps\rpic-community-app\.next\standalone\* C:\inetpub\wwwroot\rpicommunity -Recurse -Force
Copy-Item C:\apps\rpic-community-app\.next\static C:\inetpub\wwwroot\rpicommunity\.next\static -Recurse -Force
Copy-Item C:\apps\rpic-community-app\public C:\inetpub\wwwroot\rpicommunity\public -Recurse -Force
Copy-Item C:\apps\rpic-community-app\.env.production C:\inetpub\wwwroot\rpicommunity\.env.production -Force
```

If the `.next` folder does not exist yet in the live path, create it first:

```powershell
New-Item -ItemType Directory -Force -Path C:\inetpub\wwwroot\rpicommunity\.next | Out-Null
```

## Step 6: Verify the published files

```powershell
Get-ChildItem C:\inetpub\wwwroot\rpicommunity
Test-Path C:\inetpub\wwwroot\rpicommunity\server.js
Test-Path C:\inetpub\wwwroot\rpicommunity\.env.production
Test-Path C:\inetpub\wwwroot\rpicommunity\public
Test-Path C:\inetpub\wwwroot\rpicommunity\.next\static
```

## Notes

- The old scratch note referenced `/community`, but the repo is currently set to `/rpicommunity`.
- If you change the subpath later, update both `basePath` in `next.config.mjs` and the URL values in `.env.production`.
