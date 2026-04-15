"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { withBasePath } from "@/lib/app-path";
import { BROWSER_SESSION_KEY, IDLE_TIMEOUT_MS, LAST_ACTIVITY_KEY } from "@/lib/settings";

export function IdleSessionGuard() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pathname = usePathname();
  const loginPath = withBasePath("/login");

  useEffect(() => {
    if (pathname === "/login" || pathname === loginPath || pathname.endsWith("/login")) return;

    const appScrollContainer = document.querySelector<HTMLElement>("[data-app-scroll-container='true']");

    const markActivity = () => {
      try {
        sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
      } catch {}
    };

    const forceLogout = () => {
      if (timer.current) clearTimeout(timer.current);
      try {
        sessionStorage.removeItem(LAST_ACTIVITY_KEY);
      } catch {}
      signOut({ callbackUrl: withBasePath("/login") });
    };

    const hasBrowserSession = () => {
      try {
        return sessionStorage.getItem(BROWSER_SESSION_KEY) === "1";
      } catch {
        return false;
      }
    };

    const hasExpired = () => {
      try {
        const raw = sessionStorage.getItem(LAST_ACTIVITY_KEY);
        if (!raw) return false;
        const last = Number(raw);
        if (!Number.isFinite(last)) return false;
        return Date.now() - last >= IDLE_TIMEOUT_MS;
      } catch {
        return false;
      }
    };

    const reset = () => {
      if (!hasBrowserSession()) {
        forceLogout();
        return;
      }

      markActivity();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        forceLogout();
      }, IDLE_TIMEOUT_MS);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        markActivity();
        return;
      }

      if (document.visibilityState === "visible") {
        if (!hasBrowserSession() || hasExpired()) {
          forceLogout();
          return;
        }
        reset();
      }
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (!hasBrowserSession() || (event.persisted && hasExpired())) {
        forceLogout();
        return;
      }
      reset();
    };

    const onPageHide = () => {
      markActivity();
    };

    if (!hasBrowserSession()) {
      forceLogout();
      return () => {};
    }

    ["mousemove", "keydown", "click", "touchstart"].forEach((event) => {
      window.addEventListener(event, reset, { passive: true });
    });
    appScrollContainer?.addEventListener("scroll", reset, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow, { passive: true });
    window.addEventListener("pagehide", onPageHide, { passive: true });

    if (hasExpired()) {
      forceLogout();
      return () => {};
    }

    reset();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      ["mousemove", "keydown", "click", "touchstart"].forEach((event) => {
        window.removeEventListener(event, reset);
      });
      appScrollContainer?.removeEventListener("scroll", reset);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [loginPath, pathname]);

  return null;
}
