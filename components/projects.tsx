"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { content, type ProjectCategory, type ProjectItem } from "@/content";
import { RevealText } from "./reveal-text";
import { ArrowUpRight, GitHubIcon } from "./icons";
import { Cover } from "./project-cover";
import { useTilt } from "./use-tilt";

const CATEGORIES: ProjectCategory[] = ["AI/ML", "Full Stack", "Backend", "Game", "Other"];

function ProjectCard({ project, number }: { project: ProjectItem; number: number }) {
  const ref = useRef<HTMLElement>(null);
  useTilt(ref);
  return (
    <article ref={ref} className={`project-card${project.featured ? " is-featured" : ""}`}>
      <Cover slug={project.slug} />
      <div className="project-body">
        <div className="project-meta">
          <span className="project-number">{String(number).padStart(2, "0")}</span>
          <span>{project.category}</span>
          {project.featured && <span className="badge-featured">Featured</span>}
        </div>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <ul className="project-highlights">{project.highlights.slice(0, 2).map((item) => <li key={item}>{item}</li>)}</ul>
        <ul className="tags" aria-label="Built with">{project.stack.map((item) => <li key={item}>{item}</li>)}</ul>
        <div className="project-links">
          <Link className="text-link" href={`/work/${project.slug}`} data-track="case_study_open">
            Read case study <span className="sr-only">: {project.title}</span><ArrowUpRight />
          </Link>
          {project.href && <a className="text-link" href={project.href} target="_blank" rel="noreferrer" data-track="github_click"><GitHubIcon /> View source<span className="sr-only"> of {project.title}</span></a>}
          {project.demo && <a className="text-link" href={project.demo} target="_blank" rel="noreferrer" data-track="demo_click">Open live demo<span className="sr-only"> of {project.title}</span> <ArrowUpRight /></a>}
        </div>
      </div>
    </article>
  );
}

export function Projects() {
  const projects = content.projects as readonly ProjectItem[];
  const [filter, setFilter] = useState<ProjectCategory | "All">("All");

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
        {visible.map((project) => <ProjectCard key={project.slug} project={project} number={projects.indexOf(project) + 1} />)}
      </div>
    </section>
  );
}
