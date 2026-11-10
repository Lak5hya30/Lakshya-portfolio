"use client";

import { useMemo, useState } from "react";
import { content } from "@/content";
import { RevealText } from "./reveal-text";

const MONOGRAMS: Record<string, string> = {
  "C++": "C++", Python: "Py", JavaScript: "JS", TypeScript: "TS", "React.js": "Re", "Next.js": "Nx", HTML: "<>", CSS: "{}",
  "Node.js": "No", MongoDB: "Mg", MySQL: "My", GraphQL: "Gq", Git: "Gt", Docker: "Dk", Linux: "Lx",
  "Data Structures & Algorithms": "DS", OOP: "OO",
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
      <div className="section-kicker">03 / Toolkit</div>
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
        <span className="skill-usage-name">{selected}</span>
        {usage.length ? (
          <>
            <span className="skill-usage-label">Used in</span>
            <ul>{usage.map((item) => <li key={item.label}><a href={item.href}>{item.label}</a></li>)}</ul>
          </>
        ) : (
          <span className="skill-usage-label">On my résumé — no write-up on this site yet.</span>
        )}
      </div>
      </div>
      <p className="sr-only">{all.length} skills listed.</p>
    </section>
  );
}
