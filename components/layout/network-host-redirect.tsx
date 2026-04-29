"use client";

import { useEffect } from "react";

const POLICE_APP_URL = process.env.NEXT_PUBLIC_POLICE_APP_URL || "http://10.20.70.138/rpicommunity";
const PUBLIC_APP_URL = process.env.NEXT_PUBLIC_PUBLIC_APP_URL || "http://154.72.204.131:8087/rpicommunity";
const PROBE_TIMEOUT_MS = 1800;

type AppEndpoint = {
  appUrl: URL;
  basePath: string;
  origin: string;
};

function createEndpoint(value: string): AppEndpoint | null {
  try {
    const appUrl = new URL(value);
    return {
      appUrl,
      basePath: appUrl.pathname.replace(/\/$/, ""),
      origin: appUrl.origin.toLowerCase()
    };
  } catch {
    return null;
  }
}

function trimBasePath(pathname: string, endpoints: AppEndpoint[]) {
  for (const endpoint of endpoints) {
    if (!endpoint.basePath) continue;
    if (pathname === endpoint.basePath) return "/";
    if (pathname.startsWith(`${endpoint.basePath}/`)) {
      return pathname.slice(endpoint.basePath.length) || "/";
    }
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function buildDestination(endpoint: AppEndpoint, endpoints: AppEndpoint[]) {
  const destination = new URL(endpoint.appUrl.toString());
  const pagePath = trimBasePath(window.location.pathname, endpoints);
  const normalizedBasePath = endpoint.basePath === "/" ? "" : endpoint.basePath;

  destination.pathname = `${normalizedBasePath}${pagePath === "/" ? "" : pagePath}` || "/";
  destination.search = window.location.search;
  destination.hash = window.location.hash;

  return destination.toString();
}

function buildProbeUrl(endpoint: AppEndpoint) {
  const probeUrl = new URL(endpoint.appUrl.toString());
  const normalizedBasePath = endpoint.basePath === "/" ? "" : endpoint.basePath;

  probeUrl.pathname = `${normalizedBasePath}/favicon.svg`;
  probeUrl.searchParams.set("network-check", String(Date.now()));

  return probeUrl.toString();
}

function probeEndpoint(endpoint: AppEndpoint) {
  return new Promise<boolean>((resolve) => {
    let settled = false;
    const image = new Image();

    const finish = (reachable: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
      resolve(reachable);
    };

    const timeout = window.setTimeout(() => finish(false), PROBE_TIMEOUT_MS);
    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    image.referrerPolicy = "no-referrer";
    image.src = buildProbeUrl(endpoint);
  });
}

export function NetworkHostRedirect() {
  useEffect(() => {
    const policeEndpoint = createEndpoint(POLICE_APP_URL);
    const publicEndpoint = createEndpoint(PUBLIC_APP_URL);
    if (!policeEndpoint || !publicEndpoint) return;

    const currentOrigin = window.location.origin.toLowerCase();
    if (currentOrigin !== publicEndpoint.origin) return;

    let cancelled = false;
    probeEndpoint(policeEndpoint).then((reachable) => {
      if (cancelled || !reachable) return;

      const destination = buildDestination(policeEndpoint, [policeEndpoint, publicEndpoint]);
      if (destination !== window.location.href) {
        window.location.replace(destination);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
