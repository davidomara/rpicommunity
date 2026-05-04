import { NextResponse } from "next/server";
import { APP_FULL_NAME } from "@/lib/settings";
import { withBasePath } from "@/lib/app-path";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(
    {
      name: APP_FULL_NAME,
      short_name: "RPIC",
      description: "Research Planning and Innovation Center Community platform.",
      theme_color: "#0f172a",
      background_color: "#f8fafc",
      display: "standalone",
      start_url: withBasePath("/"),
      scope: withBasePath("/"),
      icons: [
        {
          src: withBasePath("/favicon.svg"),
          sizes: "64x64",
          type: "image/svg+xml",
          purpose: "any"
        },
        {
          src: withBasePath("/branding/rpic-logo.png"),
          sizes: "760x760",
          type: "image/png",
          purpose: "any"
        }
      ]
    },
    {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate"
      }
    }
  );
}
