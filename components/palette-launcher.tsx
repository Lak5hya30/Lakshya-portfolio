"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { OPEN_PALETTE } from "@/lib/site";

// The palette's code loads only the first time someone asks for it (Ctrl/Cmd+K or the Menu button).
const CommandPalette = dynamic(() => import("./command-palette").then((module) => module.CommandPalette), { ssr: false });

export function PaletteLauncher() {
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (requested) return;
    const request = () => setRequested(true);
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        request();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE, request);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE, request);
    };
  }, [requested]);

  return requested ? <CommandPalette openOnMount /> : null;
}
