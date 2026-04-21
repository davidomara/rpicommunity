import type { Metadata } from "next";
import "./globals.css";
import { APP_FULL_NAME, APP_SUBTITLE } from "@/lib/settings";
import { withBasePath } from "@/lib/app-path";
import { IdleSessionGuard } from "@/components/layout/idle-session-guard";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: APP_FULL_NAME,
  description: `${APP_FULL_NAME} - ${APP_SUBTITLE}`
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const manifestHref = withBasePath("/meta.json");
  const faviconHref = withBasePath("/favicon.svg");
  const appleIconHref = withBasePath("/branding/rpic-logo.png");

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href={manifestHref} />
        <link rel="icon" href={faviconHref} type="image/svg+xml" />
        <link rel="shortcut icon" href={faviconHref} type="image/svg+xml" />
        <link rel="apple-touch-icon" href={appleIconHref} />
      </head>
      <body suppressHydrationWarning>
        <IdleSessionGuard />
        <Toaster />
        {children}
      </body>
    </html>
  );
}
