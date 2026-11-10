"use client";

import { useEffect, type RefObject } from "react";
import { finePointer, prefersReducedMotion } from "@/lib/site";

/** Subtle 3D tilt toward the pointer (max ±6°) plus a light spot, desktop pointers only. */
export function useTilt(ref: RefObject<HTMLElement | null>, max = 6) {
  useEffect(() => {
    const element = ref.current;
    if (!element || !finePointer() || prefersReducedMotion()) return;
    let frame = 0;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        element.style.setProperty("--rx", `${(0.5 - y) * max}deg`);
        element.style.setProperty("--ry", `${(x - 0.5) * max}deg`);
        element.style.setProperty("--px", `${x * 100}%`);
        element.style.setProperty("--py", `${y * 100}%`);
      });
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      element.style.setProperty("--rx", "0deg");
      element.style.setProperty("--ry", "0deg");
    };
    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
    };
  }, [ref, max]);
}
