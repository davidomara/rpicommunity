"use client";

import { useEffect } from "react";
import { BROWSER_SESSION_KEY } from "@/lib/settings";

export function BrowserSessionMarker() {
  useEffect(() => {
    try {
      sessionStorage.setItem(BROWSER_SESSION_KEY, "1");
    } catch {}
  }, []);

  return null;
}
