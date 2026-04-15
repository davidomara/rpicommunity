function normalizeBasePath(value: string | undefined): string {
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

const ENV_BASE_PATH =
  normalizeBasePath(process.env.NEXT_PUBLIC_APP_URL) ||
  normalizeBasePath(process.env.APP_URL) ||
  normalizeBasePath(process.env.NEXTAUTH_URL) ||
  normalizeBasePath(process.env.AUTH_URL);

export const APP_BASE_PATH = ENV_BASE_PATH;

export function withBasePath(path: string): string {
  if (!path) return APP_BASE_PATH || "/";
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(path) || path.startsWith("//")) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!APP_BASE_PATH || normalizedPath === APP_BASE_PATH || normalizedPath.startsWith(`${APP_BASE_PATH}/`)) {
    return normalizedPath;
  }

  return normalizedPath === "/" ? APP_BASE_PATH : `${APP_BASE_PATH}${normalizedPath}`;
}
