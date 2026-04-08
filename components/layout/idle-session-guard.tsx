"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { IDLE_TIMEOUT_MS } from "@/lib/settings";

export function IdleSessionGuard() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const appScrollContainer = document.querySelector<HTMLElement>("[data-app-scroll-container='true']");

    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, IDLE_TIMEOUT_MS);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") reset();
    };

    ["mousemove", "keydown", "click", "touchstart"].forEach((event) => {
      window.addEventListener(event, reset, { passive: true });
    });
    appScrollContainer?.addEventListener("scroll", reset, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reset();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      ["mousemove", "keydown", "click", "touchstart"].forEach((event) => {
        window.removeEventListener(event, reset);
      });
      appScrollContainer?.removeEventListener("scroll", reset);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
