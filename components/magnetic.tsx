"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

// Pulls its child gently toward the pointer on fine-pointer devices; springs back on leave.
export function Magnetic({ children, className = "" }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const xTo = gsap.quickTo(element, "x", { duration: 0.45, ease: "elastic.out(1, 0.55)" });
    const yTo = gsap.quickTo(element, "y", { duration: 0.45, ease: "elastic.out(1, 0.55)" });
    const move = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      xTo((event.clientX - rect.left - rect.width / 2) * 0.22);
      yTo((event.clientY - rect.top - rect.height / 2) * 0.22);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    element.addEventListener("mousemove", move);
    element.addEventListener("mouseleave", leave);
    return () => {
      element.removeEventListener("mousemove", move);
      element.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <span ref={root} className={`magnetic ${className}`}>
      {children}
    </span>
  );
}
