"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { IDLE_TIMEOUT_MS } from "@/lib/settings";

export function IdleSessionGuard() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, IDLE_TIMEOUT_MS);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") reset();
    };

    ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach((event) => {
      window.addEventListener(event, reset, { passive: true });
    });
    document.addEventListener("visibilitychange", onVisibility);
    reset();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach((event) => {
        window.removeEventListener(event, reset);
      });
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
