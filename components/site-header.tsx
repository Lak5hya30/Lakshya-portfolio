"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { content } from "@/content";
import { openPalette, sections } from "@/lib/site";
import { Magnetic } from "./magnetic";
import { SearchIcon } from "./icons";
import { BrandLogo } from "./brand-logo";

const subscribeScroll = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
};
const noopSubscribe = () => () => undefined;

export function SiteHeader() {
  const nav = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 24, () => false);
  const isMac = useSyncExternalStore(noopSubscribe, () => /Mac|iPhone|iPad/.test(navigator.platform), () => false);

  useEffect(() => {
    // The section whose body crosses the upper third of the viewport is "current".
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id;
          setActive(id);
          const link = nav.current?.querySelector<HTMLAnchorElement>(`a[href="#${id}"]`);
          setIndicator(link ? { left: link.offsetLeft, width: link.offsetWidth } : null);
        }
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    for (const id of ["top", ...sections.map((section) => section.id)]) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <a className="wordmark" href="#top" aria-label="Lakshya Gupta, back to top"><BrandLogo /></a>
      <nav ref={nav} aria-label="Primary navigation" className="primary-nav">
        {sections.map((section) => (
          <a key={section.id} href={`#${section.id}`} aria-current={active === section.id ? "true" : undefined}>
            {section.label}
          </a>
        ))}
        <span
          className="nav-indicator"
          aria-hidden="true"
          style={indicator ? { transform: `translateX(${indicator.left}px)`, width: indicator.width, opacity: 1 } : { opacity: 0 }}
        />
      </nav>
      <div className="header-actions">
        <button type="button" className="icon-button palette-trigger" onClick={openPalette} aria-label="Open command menu" aria-keyshortcuts="Control+K Meta+K">
          <SearchIcon />
          <span className="palette-hint" aria-hidden="true"><kbd>{isMac ? "⌘" : "Ctrl"}</kbd><kbd>K</kbd></span>
          <span className="menu-label" aria-hidden="true">Menu</span>
        </button>
        <Magnetic className="header-cta">
          <a className="header-contact" href={`mailto:${content.person.email}`}>Let&apos;s talk</a>
        </Magnetic>
      </div>
      <span className="scroll-progress" aria-hidden="true" />
    </header>
  );
}
