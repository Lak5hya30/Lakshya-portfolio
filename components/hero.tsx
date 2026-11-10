"use client";

import { Fragment, useEffect, useRef } from "react";
import { content } from "@/content";
import { finePointer, prefersReducedMotion } from "@/lib/site";
import { DotPortrait } from "./dot-portrait";
import { Magnetic } from "./magnetic";
import { ArrowDown, ArrowUpRight, DocIcon, socialIcon } from "./icons";

const { person } = content;

/** CSS-only rotation: every phrase is rendered once and crossfaded by keyframes, so nothing re-renders or reflows. */
function RotatingSpecialty() {
  const count = person.specialties.length;
  return (
    <>
      <span className="specialty-slot" aria-hidden="true" style={{ ["--count" as string]: count }}>
        {person.specialties.map((specialty, index) => (
          <span key={specialty} className="specialty" style={{ ["--i" as string]: index }}>{specialty}</span>
        ))}
      </span>
      <span className="sr-only">{person.specialties.join(", ")}</span>
    </>
  );
}

export function Hero() {
  const grid = useRef<HTMLDivElement>(null);

  // A soft light follows the pointer across the grid; skipped for touch and reduced motion.
  useEffect(() => {
    const element = grid.current?.parentElement;
    if (!element || !finePointer() || prefersReducedMotion()) return;
    let frame = 0;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        grid.current?.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        grid.current?.style.setProperty("--my", `${event.clientY - rect.top}px`);
      });
    };
    element.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div ref={grid} className="hero-grid" aria-hidden="true" />
      <div className="hero-copy">
        <div className="hero-intro status"><span />{person.status}</div>
        <div className="hero-heading">
          <h1 id="hero-title" aria-label={person.name}>
            {person.name.split(" ").map((word, line) => (
              <Fragment key={word}>
                {line > 0 && " "}
                <span className="hero-line" aria-hidden="true">
                  {[...word].map((letter, index) => <span key={index} className="hero-letter">{letter}</span>)}
                </span>
              </Fragment>
            ))}
          </h1>
          <p className="hero-intro hero-role">
            {person.role} building <RotatingSpecialty />
          </p>
        </div>
        <p className="hero-intro hero-position">{person.positioning}</p>
        {/* One primary action; résumé secondary; email as a quiet text link. */}
        <div className="hero-intro hero-actions">
          <Magnetic><a className="button button-primary" href="#work" data-track="cta_view_work">View selected work <ArrowDown /></a></Magnetic>
          <a className="button" href={person.resume} download data-track="resume_download">Download résumé <DocIcon /></a>
          <a className="text-link hero-email" href={`mailto:${person.email}`} data-track="email_click">Email me <ArrowUpRight /></a>
        </div>
        <ul className="hero-intro hero-socials" aria-label="Profiles">
          {content.links.map((link) => (
            <li key={link.label}>
              <a href={link.href} target="_blank" rel="noreferrer" aria-label={`${link.label} (opens in a new tab)`} data-track={`${link.label.toLowerCase()}_click`}>
                {socialIcon(link.label)}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="hero-portrait hero-intro">
        <DotPortrait active />
        <div className="portrait-index"><span>Based in {person.location}</span><span>2026</span></div>
      </div>
      <ul className="evidence-strip hero-intro" aria-label="At a glance">
        {content.evidence.map((item) => (
          <li key={item.label}><span>{item.label}</span>{item.value}</li>
        ))}
      </ul>
    </section>
  );
}
