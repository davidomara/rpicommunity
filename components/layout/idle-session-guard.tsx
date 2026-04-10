"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { IDLE_TIMEOUT_MS } from "@/lib/settings";

export function IdleSessionGuard() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const storageKey = "rpic:last-activity-at";
    const appScrollContainer = document.querySelector<HTMLElement>("[data-app-scroll-container='true']");

    const markActivity = () => {
      try {
        localStorage.setItem(storageKey, String(Date.now()));
      } catch {}
    };

    const forceLogout = () => {
      if (timer.current) clearTimeout(timer.current);
      signOut({ callbackUrl: "/login" });
    };

    const hasExpired = () => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return false;
        const last = Number(raw);
        if (!Number.isFinite(last)) return false;
        return Date.now() - last >= IDLE_TIMEOUT_MS;
      } catch {
        return false;
      }
    };

    const reset = () => {
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
        if (hasExpired()) {
          forceLogout();
          return;
        }
        reset();
      }
    };

    const onPageHide = () => {
      markActivity();
    };

    ["mousemove", "keydown", "click", "touchstart"].forEach((event) => {
      window.addEventListener(event, reset, { passive: true });
    });
    appScrollContainer?.addEventListener("scroll", reset, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
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
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  return null;
}
