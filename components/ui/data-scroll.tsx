"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function DataScroll({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-white to-transparent" />
      <div
        ref={viewportRef}
        className={cn(
          "scroll-x cursor-grab touch-pan-x active:cursor-grabbing",
          dragging && "select-none",
          className
        )}
        onPointerDown={(event) => {
          if (!viewportRef.current) return;
          const target = event.target as HTMLElement | null;
          if (target?.closest("button, a, input, select, textarea, label")) {
            return;
          }
          pointerIdRef.current = event.pointerId;
          startXRef.current = event.clientX;
          startScrollLeftRef.current = viewportRef.current.scrollLeft;
          viewportRef.current.setPointerCapture(event.pointerId);
          setDragging(true);
        }}
        onPointerMove={(event) => {
          if (!viewportRef.current || pointerIdRef.current !== event.pointerId || !dragging) return;
          const delta = event.clientX - startXRef.current;
          viewportRef.current.scrollLeft = startScrollLeftRef.current - delta;
        }}
        onPointerUp={(event) => {
          if (!viewportRef.current || pointerIdRef.current !== event.pointerId) return;
          viewportRef.current.releasePointerCapture(event.pointerId);
          pointerIdRef.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          pointerIdRef.current = null;
          setDragging(false);
        }}
      >
        {children}
      </div>
    </div>
  );
}
