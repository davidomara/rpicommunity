"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
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

  function dismissToast(id: number) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

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
            "pointer-events-auto flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-sm",
            toast.type === "error"
              ? "border-red-200 bg-red-50/95 text-red-700"
              : "border-emerald-200 bg-emerald-50/95 text-emerald-700"
          )}
        >
          <span className="min-w-0 flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Close notification"
            className="shrink-0 rounded-md p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
