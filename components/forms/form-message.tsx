"use client";

import { cn } from "@/lib/utils";

export function FormMessage({
  type,
  message,
  className
}: {
  type: "error" | "success";
  message?: string;
  className?: string;
}) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        type === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700",
        className
      )}
    >
      {message}
    </div>
  );
}
