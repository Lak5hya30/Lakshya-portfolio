"use client";

import { useMemo, useState } from "react";
import { content } from "@/content";
import { RevealText } from "./reveal-text";

const MONOGRAMS: Record<string, string> = {
  "C++": "C++", Python: "Py", JavaScript: "JS", TypeScript: "TS", "React.js": "Re", "Next.js": "Nx", HTML: "<>", CSS: "{}",
  "Node.js": "No", MongoDB: "Mg", MySQL: "My", GraphQL: "Gq", Git: "Gt", Docker: "Dk", Linux: "Lx",
  "Data Structures & Algorithms": "DS", OOP: "OO",
};

const SKILL_NOTES: Record<string, string> = {
  "C++": "Core language practice for data structures, algorithms, and object-oriented problem solving.",
  Python: "My main language for AI experiments, automation, backend logic, and data-heavy prototypes.",
  JavaScript: "Browser and server-side application logic, interactive interfaces, and API integration.",
  TypeScript: "Typed React and Next.js work with clearer contracts and safer refactoring.",
  "React.js": "Component-driven interfaces with accessible interactions, reusable state, and responsive layouts.",
  "Next.js": "App Router projects using server rendering, metadata, caching, and production deployment.",
  HTML: "Semantic document structure built for accessibility, search, and resilient progressive enhancement.",
  CSS: "Responsive layouts, design tokens, interaction states, and motion with reduced-motion support.",
  "Node.js": "Server-side JavaScript for APIs, developer tooling, and application services.",
  MongoDB: "Document data modeling and application-level create, read, update, and delete workflows.",
  MySQL: "Relational schema design, joins, constraints, and query-driven application data.",
  GraphQL: "Schema-first API querying and typed client-server data contracts.",
  Git: "Branching, reviewable commits, and collaborative source-control workflows.",
  Docker: "Containerized development and reproducible project environments.",
  Linux: "Command-line development, process inspection, and server-oriented workflows.",
  "Data Structures & Algorithms": "Problem solving across arrays, trees, graphs, dynamic programming, and complexity analysis.",
  OOP: "Classes, composition, encapsulation, and maintainable object models.",
};

type Usage = { label: string; href: string };

/** Where a skill is evidenced on the site: experience stacks/points and project stacks. Nothing is inferred beyond text matches. */
function usageFor(skill: string): Usage[] {
  const needle = skill.replace(/\.js$/, "").toLowerCase();
  const matches = (text: string) => text.toLowerCase().includes(needle);
  const usage: Usage[] = [];
  for (const item of content.experience) {
    if (item.stack.some(matches) || item.points.some(matches)) usage.push({ label: `${item.company} · ${item.kind.toLowerCase()}`, href: "#experience" });
  }
  for (const project of content.projects) {
    if (project.stack.some(matches) || project.highlights.some(matches)) usage.push({ label: project.title, href: "#work" });
  }
  return usage;
}

export function Skills() {
  const all = useMemo(() => content.skills.flatMap((group) => group.values as readonly string[]), []);
  const [selected, setSelected] = useState<string>("Python");
  const usage = useMemo(() => usageFor(selected), [selected]);

  return (
    <section className="skills section" id="skills" aria-labelledby="skills-title">
      <h2 id="skills-title"><RevealText>A practical stack for complete products.</RevealText></h2>
      {/* One wrapper so the sticky "used in" panel only sticks while the cards are on screen. */}
      <div className="skill-board">
      <div className="skill-groups">
        {content.skills.map((group) => (
          <div className="skill-group" key={group.label}>
            <h3>{group.label}</h3>
            <ul className="skill-list">
              {group.values.map((skill) => (
                <li key={skill}>
                  <button
                    type="button"
                    className="skill"
                    aria-pressed={selected === skill}
                    onClick={() => setSelected(skill)}
                    onMouseEnter={() => setSelected(skill)}
                  >
                    <span className="skill-mono" aria-hidden="true">{MONOGRAMS[skill] ?? skill.slice(0, 2)}</span>
                    {skill}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="skill-usage" aria-live="polite">
        <div className="skill-usage-copy">
          <span className="skill-usage-name">{selected}</span>
          <p>{SKILL_NOTES[selected]}</p>
        </div>
        {usage.length > 0 && (
          <div className="skill-usage-evidence">
            <span className="skill-usage-label">Used in</span>
            <ul>{usage.map((item) => <li key={item.label}><a href={item.href}>{item.label}</a></li>)}</ul>
          </div>
        )}
      </div>
      </div>
      <p className="sr-only">{all.length} skills listed.</p>
    </section>
  );
}
