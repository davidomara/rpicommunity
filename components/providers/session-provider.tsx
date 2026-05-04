"use client";

import { SessionProvider as AuthSessionProvider } from "next-auth/react";

export function SessionProvider({
  basePath,
  children
}: {
  basePath?: string;
  children: React.ReactNode;
}) {
  return <AuthSessionProvider basePath={basePath}>{children}</AuthSessionProvider>;
}
