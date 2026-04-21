import type { Metadata } from "next";
import "./globals.css";
import { APP_FULL_NAME, APP_SUBTITLE } from "@/lib/settings";
import { withAppUrl } from "@/lib/app-path";
import { IdleSessionGuard } from "@/components/layout/idle-session-guard";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: APP_FULL_NAME,
  description: `${APP_FULL_NAME} - ${APP_SUBTITLE}`,
  manifest: withAppUrl("/meta.json"),
  icons: {
    icon: [{ url: withAppUrl("/favicon.svg"), type: "image/svg+xml" }],
    shortcut: [{ url: withAppUrl("/favicon.svg"), type: "image/svg+xml" }],
    apple: [{ url: withAppUrl("/branding/rpic-logo.png"), type: "image/png" }]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <IdleSessionGuard />
        <Toaster />
        {children}
      </body>
    </html>
  );
}
