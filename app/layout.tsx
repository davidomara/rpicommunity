import type { Metadata } from "next";
import "./globals.css";
import { APP_FULL_NAME, APP_SUBTITLE } from "@/lib/settings";

export const metadata: Metadata = {
  title: APP_FULL_NAME,
  description: `${APP_FULL_NAME} - ${APP_SUBTITLE}`,
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
