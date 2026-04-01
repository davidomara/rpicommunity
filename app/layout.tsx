import type { Metadata } from "next";
import "./globals.css";
import { APP_FULL_NAME, APP_SUBTITLE } from "@/lib/settings";
import { SessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: APP_FULL_NAME,
  description: `${APP_FULL_NAME} - ${APP_SUBTITLE}`
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
