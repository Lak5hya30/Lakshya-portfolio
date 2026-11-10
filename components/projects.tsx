"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { content, type ProjectCategory, type ProjectItem } from "@/content";
import { RevealText } from "./reveal-text";
import { ArrowUpRight, CloseIcon, GitHubIcon } from "./icons";
import { useTilt } from "./use-tilt";

const CATEGORIES: ProjectCategory[] = ["AI/ML", "Full Stack", "Backend", "Game", "Other"];

// A tiny top-down level for the game's cover: # wall, p player, z zombie, + pickup, . floor.
const TILE_MAP = [
  "##################",
  "#....#......z....#",
  "#.p..#..##.......#",
  "#....+..##...z...#",
  "#.......##.......#",
  "###..####....##..#",
  "#.z..........##+.#",
  "##################",
];
const TILE_KIND: Record<string, string> = { "#": "wall", p: "player", z: "zombie", "+": "item" };

/** Each cover is drawn from the project's own core idea, not a stock screenshot. */
function Cover({ slug }: { slug: string }) {
  if (slug === "adaptive-fraud-defense-arena") {
    return (
      <div className="cover cover-loop" aria-hidden="true">
        <span className="cover-label">closed loop</span>
        <ol className="loop-steps">
          {["Discover", "Simulate", "Attack", "Detect", "Adapt"].map((step, index) => (
            <li key={step} style={{ ["--i" as string]: index }}><span>0{index + 1}</span>{step}</li>
          ))}
        </ol>
      </div>
    );
  }
  if (slug === "bobs-world") {
    return (
      <div className="cover cover-tiles" aria-hidden="true">
        <span className="cover-label">level 1 · night</span>
        <span className="tile-map">
          {TILE_MAP.flatMap((row, y) => [...row].map((cell, x) => <i key={`${x}-${y}`} className={`tile tile-${TILE_KIND[cell] ?? "floor"}`} />))}
        </span>
      </div>
    );
  }
  return (
    <div className="cover cover-voice" aria-hidden="true">
      <span className="cover-label">voice / ready</span>
      <span className="wave">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ ["--i" as string]: i }} />)}</span>
      <span className="cover-quote">“open browser”</span>
    </div>
  );
}

function ProjectCard({ project, onOpen }: { project: ProjectItem; onOpen: (project: ProjectItem) => void }) {
  const ref = useRef<HTMLElement>(null);
  useTilt(ref);
  return (
    <article ref={ref} className={`project-card${project.featured ? " is-featured" : ""}`}>
      <Cover slug={project.slug} />
      <div className="project-body">
        <div className="project-meta">
          <span>{project.category}</span>
          {project.featured && <span className="badge-featured">Featured</span>}
        </div>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <ul className="tags" aria-label="Built with">{project.stack.map((item) => <li key={item}>{item}</li>)}</ul>
        <div className="project-links">
          <button type="button" className="text-link" onClick={() => onOpen(project)} aria-haspopup="dialog">
            Case study <span className="sr-only">for {project.title}</span>
          </button>
          {project.href && <a className="text-link" href={project.href} target="_blank" rel="noreferrer"><GitHubIcon /> Source</a>}
          {project.demo && <a className="text-link" href={project.demo} target="_blank" rel="noreferrer">Live demo <ArrowUpRight /></a>}
        </div>
      </div>
    </article>
  );
}

function CaseStudy({ project, onClose }: { project: ProjectItem | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  // Open/close the native modal dialog (focus trap, Esc, focus return) when the selection changes.
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (project && !element.open) element.showModal();
    if (!project && element.open) element.close();
  }, [project]);

  const story = project
    ? ([["The problem", project.problem], ["Architecture", project.architecture], ["Challenges", project.challenges], ["Outcome", project.outcome]] as const).filter(([, value]) => value)
    : [];

  return (
    <dialog ref={dialog} className="case-study" aria-labelledby="case-title" onClose={onClose} onClick={(event) => { if (event.target === dialog.current) onClose(); }}>
      {project && (
        <div className="case-panel">
          <button type="button" className="icon-button case-close" onClick={onClose} aria-label="Close case study"><CloseIcon /></button>
          <p className="section-kicker">{project.category} · Case study</p>
          <h3 id="case-title">{project.title}</h3>
          <p className="case-lede">{project.description}</p>
          <div className="case-grid">
            {story.map(([title, value]) => (
              <section key={title}><h4>{title}</h4><p>{value}</p></section>
            ))}
            <section>
              <h4>Implementation</h4>
              <ul>{project.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
            <section>
              <h4>Capabilities</h4>
              <ul className="tags">{project.capabilities.map((item) => <li key={item}>{item}</li>)}</ul>
              <h4>Stack</h4>
              <ul className="tags">{project.stack.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          </div>
          <div className="project-links">
            {project.href && <a className="button button-primary" href={project.href} target="_blank" rel="noreferrer"><GitHubIcon /> View source</a>}
            {project.demo && <a className="button" href={project.demo} target="_blank" rel="noreferrer">Live demo <ArrowUpRight /></a>}
          </div>
        </div>
      )}
    </dialog>
  );
}

export function Projects() {
  const projects = content.projects as readonly ProjectItem[];
  const [filter, setFilter] = useState<ProjectCategory | "All">("All");
  const [selected, setSelected] = useState<ProjectItem | null>(null);

  const counts = useMemo(() => {
    const map = new Map<ProjectCategory, number>();
    for (const project of projects) map.set(project.category, (map.get(project.category) ?? 0) + 1);
    return map;
  }, [projects]);
  // Only categories that actually have work show up as filters.
  const filters = CATEGORIES.filter((category) => counts.get(category));
  const visible = filter === "All" ? projects : projects.filter((project) => project.category === filter);

  return (
    <section className="projects section" id="work" aria-labelledby="work-title">
      <div className="section-kicker">03 / Selected work</div>
      <h2 id="work-title"><RevealText>Built to be useful, not ornamental.</RevealText></h2>
      {filters.length > 1 && (
        <div className="filters" role="group" aria-label="Filter projects by category">
          {(["All", ...filters] as const).map((category) => (
            <button key={category} type="button" className="chip" aria-pressed={filter === category} onClick={() => setFilter(category)}>
              {category}<span className="chip-count">{category === "All" ? projects.length : counts.get(category)}</span>
            </button>
          ))}
        </div>
      )}
      <p className="sr-only" aria-live="polite">{visible.length} projects shown</p>
      <div className="project-grid">
        {visible.map((project) => <ProjectCard key={project.slug} project={project} onOpen={setSelected} />)}
      </div>
      <CaseStudy project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
