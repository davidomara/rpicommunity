import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-UG", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function getTodayISODate() {
  return new Date().toISOString().slice(0, 10);
}
