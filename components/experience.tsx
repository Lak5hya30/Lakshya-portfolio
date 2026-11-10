"use client";

import { forwardRef, useState } from "react";
import { content } from "@/content";
import { RevealText } from "./reveal-text";
import { ArrowUpRight, ChevronIcon } from "./icons";

export const Experience = forwardRef<HTMLSpanElement>(function Experience(_props, timelineLine) {
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));
  const toggle = (index: number) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  return (
    <section className="experience section" id="experience" aria-labelledby="experience-title">
      <div className="section-kicker">02 / Experience</div>
      <h2 id="experience-title"><RevealText>Work shaped by real systems.</RevealText></h2>
      <div className="timeline">
        <span ref={timelineLine} className="timeline-line" aria-hidden="true" />
        {content.experience.map((item, index) => {
          const expanded = open.has(index);
          const panelId = `experience-${index}`;
          return (
            <article className={`timeline-entry${expanded ? " is-open" : ""}`} key={`${item.company}-${item.role}`}>
              <span className="timeline-number">0{index + 1}</span>
              <div className="timeline-head">
                <p className="timeline-period">{item.period.toLowerCase().includes(item.kind.toLowerCase()) ? item.period : `${item.period} · ${item.kind}`}</p>
                <h3>{item.role}</h3>
                <p className="timeline-company">
                  {item.href ? <a href={item.href} target="_blank" rel="noreferrer">{item.company} <ArrowUpRight /></a> : item.company}
                </p>
                <ul className="tags" aria-label="Stack">{item.stack.map((tool) => <li key={tool}>{tool}</li>)}</ul>
              </div>
              <div className="timeline-body">
                <button type="button" className="timeline-toggle" aria-expanded={expanded} aria-controls={panelId} onClick={() => toggle(index)}>
                  {expanded ? "Hide contributions" : `Show ${item.points.length} contributions`}
                  <ChevronIcon />
                </button>
                <div id={panelId} className="timeline-panel" hidden={!expanded}>
                  <ul>{item.points.map((point) => <li key={point}>{point}</li>)}</ul>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="achievements" aria-label="Achievements">
        <h3 className="achievements-title">Achievements</h3>
        <ul>
          {content.achievements.map((item) => (
            <li key={item.label} className="achievement-card">
              <span className="achievement-value">{item.value}</span>
              <p>{item.label}</p>
              <a className="text-link" href={item.href} target="_blank" rel="noreferrer">View <ArrowUpRight /><span className="sr-only"> for {item.label}</span></a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
});
