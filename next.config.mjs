function normalizeBasePath(value) {
  if (!value) return "";

  try {
    let pathname = new URL(value, "http://localhost").pathname.trim();
    if (!pathname || pathname === "/") return "";
    if (pathname.endsWith("/api/auth")) {
      pathname = pathname.slice(0, -"/api/auth".length) || "/";
    }
    return pathname === "/" ? "" : pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  } catch {
    return "";
  }
}

const appBasePath =
  normalizeBasePath(process.env.NEXT_PUBLIC_APP_BASE_PATH) ||
  normalizeBasePath(process.env.APP_BASE_PATH) ||
  normalizeBasePath(process.env.NEXT_PUBLIC_APP_URL) ||
  normalizeBasePath(process.env.APP_URL) ||
  normalizeBasePath(process.env.NEXTAUTH_URL) ||
  normalizeBasePath(process.env.AUTH_URL);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb"
    }
  },
  async redirects() {
    const redirects = [
      {
        source: "/favicon.ico",
        destination: "/favicon.svg",
        permanent: false
      }
    ];

    if (appBasePath !== "/rpicommunity") {
      redirects.push(
        {
          source: "/rpicommunity",
          destination: "/",
          permanent: false
        },
        {
          source: "/rpicommunity/:path*",
          destination: "/:path*",
          permanent: false
        }
      );
    }

    return redirects;
  }
};

export default nextConfig;
