"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ToastItem = {
  id: number;
  type: "success" | "error";
  message: string;
};

type ToastDetail = {
  type: "success" | "error";
  message: string;
};

const TOAST_EVENT = "app-toast";

export function showToast(detail: ToastDetail) {
  window.dispatchEvent(new CustomEvent<ToastDetail>(TOAST_EVENT, { detail }));
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function handleToast(event: Event) {
      const customEvent = event as CustomEvent<ToastDetail>;
      const detail = customEvent.detail;
      if (!detail?.message) return;

      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, ...detail }]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 4200);
    }

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-sm",
            toast.type === "error"
              ? "border-red-200 bg-red-50/95 text-red-700"
              : "border-emerald-200 bg-emerald-50/95 text-emerald-700"
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
