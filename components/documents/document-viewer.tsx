"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ViewerStatus = "loading" | "ready" | "error";

export function DocumentViewer({ src, mimeType, title }: { src: string; mimeType: string; title: string }) {
  const [status, setStatus] = useState<ViewerStatus>("loading");
  const isImage = mimeType.startsWith("image/");

  useEffect(() => {
    setStatus("loading");
  }, [src, mimeType]);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg border bg-white">
        {status !== "ready" ? (
          <div
            className={cn(
              "absolute inset-0 z-10 flex items-center justify-center bg-white/90 px-6 text-center",
              status === "error" ? "text-slate-600" : "text-slate-500"
            )}
          >
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">
                {status === "error" ? "Preview unavailable." : "Loading document preview..."}
              </p>
              <p className="text-sm">
                {status === "error" ? "Open the file in a new tab to view it directly." : "The selected file is being prepared."}
              </p>
              {status === "error" ? (
                <a
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-sm font-medium text-cyan-700 hover:text-cyan-800"
                >
                  Open document
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        {isImage ? (
          <div className="scroll-x">
            <img
              src={src}
              alt={title}
              className="min-w-[640px] w-full rounded-lg bg-white object-contain sm:min-w-0"
              onLoad={() => setStatus("ready")}
              onError={() => setStatus("error")}
            />
          </div>
        ) : (
          <iframe
            src={src}
            title={title}
            className="h-[72vh] w-full rounded-lg border-0 bg-white sm:h-[78vh]"
            onLoad={() => setStatus("ready")}
            onError={() => setStatus("error")}
          />
        )}
      </div>
      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className="inline-flex text-sm font-medium text-cyan-700 hover:text-cyan-800"
      >
        {isImage ? "Open full image" : "Open document in a new tab"}
      </a>
    </div>
  );
}
