"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function RevealText({ children, className = "" }: { children: string; className?: string }) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const words = root.current?.querySelectorAll("span");
      if (!words) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set(words, { yPercent: 0, opacity: 1 });
        return;
      }
      gsap.fromTo(
        words,
        { yPercent: 115, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.045,
          ease: "power4.out",
          scrollTrigger: { trigger: root.current, start: "top 88%", once: true },
        },
      );
    },
    { scope: root },
  );

  return (
    <span ref={root} className={`reveal-text ${className}`}>
      {children.split(" ").map((word, index) => (
        <span aria-hidden="true" key={`${word}-${index}`}>
          {word}&nbsp;
        </span>
      ))}
      <span className="sr-only">{children}</span>
    </span>
  );
}

