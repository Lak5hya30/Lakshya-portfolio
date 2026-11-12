"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { content } from "@/content";
import { RevealText } from "./reveal-text";
import { SiteHeader } from "./site-header";
import { PaletteLauncher } from "./palette-launcher";
import { Hero } from "./hero";
import { Experience } from "./experience";
import { Projects } from "./projects";
import { Skills } from "./skills";
import { Terminal } from "./terminal";
import { Contact } from "./contact";
import { SiteFooter } from "./site-footer";

gsap.registerPlugin(ScrollTrigger, useGSAP);

declare global {
  interface Window { __lenis?: Lenis }
}

export function Portfolio({ github }: { github: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const timelineLine = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // `anchors` routes in-page links through Lenis so they glide instead of jumping; offset clears the fixed header.
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: { offset: -72 } });
    window.__lenis = lenis;
    const update = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  // Section labels "decode" like a terminal readout the first time they scroll into view.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#*<>";
    const frames: number[] = [];
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const element = entry.target as HTMLElement;
        const text = element.dataset.text ?? element.textContent ?? "";
        element.dataset.text = text;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min(1, (now - start) / 700);
          const revealed = Math.floor(progress * text.length);
          element.textContent = [...text].map((char, index) =>
            index < revealed || char === " " ? char : glyphs[Math.floor(Math.random() * glyphs.length)]).join("");
          if (progress < 1) frames.push(requestAnimationFrame(step));
          else element.textContent = text;
        };
        frames.push(requestAnimationFrame(step));
      }
    }, { rootMargin: "0px 0px -15% 0px" });
    root.current?.querySelectorAll<HTMLElement>(".section-kicker").forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      frames.forEach(cancelAnimationFrame);
    };
  }, []);

  useGSAP(
    () => {
      // The hero entrance is CSS-only (globals.css) so the name paints before hydration.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      if (timelineLine.current) {
        gsap.fromTo(timelineLine.current, { scaleY: 0 }, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 70%", scrub: 0.5 },
        });
      }

      // One staggered rise for every card-like block as it enters; elements below the fold only.
      const targets = gsap.utils.toArray<HTMLElement>("[data-reveal], .timeline-entry, .project-card, .skill-group, .achievement-card, .github-activity, .terminal, .contact-grid");
      const pending = targets.filter((element) => element.getBoundingClientRect().top > window.innerHeight);
      gsap.set(pending, { opacity: 0, y: 28 });
      ScrollTrigger.batch(pending, {
        start: "top 90%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out", overwrite: true }),
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader />
      <PaletteLauncher />

      <main id="main" tabIndex={-1}>
        <Hero />

        <Projects />
        <div className="github-band">{github}</div>
        <Experience ref={timelineLine} />
        <Skills />
        <section className="about section" id="about" aria-labelledby="about-title">
          <h2 id="about-title"><RevealText>Engineering with clarity, from interface to system.</RevealText></h2>
          <p className="about-intro">{content.person.intro}</p>
          <div className="about-grid">
            <p className="about-summary">{content.person.summary}</p>
            <div className="education-block">
              <span>Education</span>
              <strong>{content.education.school}</strong>
              <p>{content.education.degree}<br />{content.education.period}</p>
            </div>
            <div className="achievement">
              <span>{content.achievement.value}{content.achievement.suffix}</span>
              <p>{content.achievement.label}</p>
            </div>
          </div>
        </section>

        <Contact />
        {/* Optional personality layer: everything here is also reachable through the normal page. */}
        <Terminal />
      </main>

      <SiteFooter />
    </div>
  );
}
