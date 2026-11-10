"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** One delegated listener: any element with data-track="event_name" reports a click. */
export function AnalyticsListener() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (target) track(target.dataset.track ?? "click", target.getAttribute("href") ?? undefined);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}

/** Reports a view once when a page mounts (e.g. a case study). */
export function TrackView({ event, detail }: { event: string; detail?: string }) {
  useEffect(() => track(event, detail), [event, detail]);
  return null;
}
