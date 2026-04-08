"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const SCROLL_THRESHOLD = 280;

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = document.querySelector<HTMLElement>("[data-app-scroll-container='true']");
    if (!container) return;

    const updateVisibility = () => {
      setVisible(container.scrollTop > SCROLL_THRESHOLD);
    };

    updateVisibility();
    container.addEventListener("scroll", updateVisibility, { passive: true });

    return () => {
      container.removeEventListener("scroll", updateVisibility);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-30 sm:bottom-6 sm:right-6">
      <Button
        type="button"
        size="sm"
        className="pointer-events-auto h-11 rounded-full px-4 shadow-lg"
        onClick={() => {
          const container = document.querySelector<HTMLElement>("[data-app-scroll-container='true']");
          container?.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <ArrowUp className="mr-2 h-4 w-4" />
        Back to Top
      </Button>
    </div>
  );
}
