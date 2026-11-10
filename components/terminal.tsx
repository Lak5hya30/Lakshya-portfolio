"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { content } from "@/content";
import { scrollToSection, sections } from "@/lib/site";

type Line = { id: number; kind: "input" | "output" | "error"; body: ReactNode };

const COMMANDS: Record<string, string> = {
  help: "List available commands",
  about: "Who I am",
  skills: "Languages, frameworks and tools",
  projects: "Things I've built",
  experience: "Internship and open-source work",
  education: "Where I study",
  resume: "Download my résumé (PDF)",
  contact: "How to reach me",
  social: "GitHub, LinkedIn, LeetCode",
  goto: "Jump to a section: goto work",
  clear: "Clear the screen",
};

const external = (href: string, label: string) => <a href={href} target="_blank" rel="noreferrer">{label}</a>;

function run(raw: string): { body?: ReactNode; error?: boolean; clear?: boolean } {
  const [command = "", ...args] = raw.trim().split(/\s+/);
  const name = command.toLowerCase();
  const { person } = content;
  switch (name) {
    case "":
      return {};
    case "help":
    case "ls":
      return {
        body: (
          <dl className="term-help">
            {Object.entries(COMMANDS).map(([key, description]) => (
              <div key={key}><dt>{key}</dt><dd>{description}</dd></div>
            ))}
          </dl>
        ),
      };
    case "about":
    case "whoami":
      return { body: <p>{person.name} — {person.role}. {person.summary}</p> };
    case "skills":
      return { body: <ul>{content.skills.map((group) => <li key={group.label}><b>{group.label}:</b> {group.values.join(", ")}</li>)}</ul> };
    case "projects":
      return {
        body: (
          <ul>
            {content.projects.map((project) => (
              <li key={project.slug}><b>{project.title}</b> — {project.description} {project.href && external(project.href, "[source]")}</li>
            ))}
            <li>More on {external(content.links[0].href, "GitHub")}. Type <code>goto work</code> to see the showcase.</li>
          </ul>
        ),
      };
    case "experience":
      return { body: <ul>{content.experience.map((item) => <li key={item.company}><b>{item.role}</b> · {item.company} · {item.period}</li>)}</ul> };
    case "education":
      return { body: <p>{content.education.degree}, {content.education.school} ({content.education.period}).</p> };
    case "resume":
    case "cv": {
      const link = document.createElement("a");
      link.href = person.resume;
      link.download = "Lakshya-Gupta-Resume.pdf";
      link.click();
      return { body: <p>Downloading résumé… If nothing happens, <a href={person.resume} download>download it here</a>.</p> };
    }
    case "contact":
    case "email":
      return { body: <p>Email <a href={`mailto:${person.email}`}>{person.email}</a> or type <code>goto contact</code> for the form.</p> };
    case "social":
    case "github":
      return { body: <ul>{content.links.map((link) => <li key={link.label}>{external(link.href, link.label)}</li>)}</ul> };
    case "goto":
    case "cd": {
      const target = sections.find((section) => section.id === args[0]?.toLowerCase() || section.label.toLowerCase() === args[0]?.toLowerCase());
      if (!target) return { error: true, body: <p>Unknown section. Try one of: {sections.map((section) => section.id).join(", ")}.</p> };
      scrollToSection(target.id);
      return { body: <p>Jumping to {target.label}…</p> };
    }
    case "clear":
    case "cls":
      return { clear: true };
    case "sudo":
      return { error: true, body: <p>Nice try. Permission denied.</p> };
    default:
      return { error: true, body: <p>Command not found: {name}. Type <code>help</code> for the list.</p> };
  }
}

export function Terminal() {
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);
  const counter = useRef(0);
  const screen = useRef<HTMLDivElement>(null);

  useEffect(() => {
    screen.current?.scrollTo({ top: screen.current.scrollHeight });
  }, [lines]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const input = value;
    setValue("");
    cursor.current = -1;
    if (input.trim()) history.current.unshift(input);
    const result = run(input);
    if (result.clear) {
      setLines([]);
      return;
    }
    const next: Line[] = [{ id: counter.current++, kind: "input", body: input }];
    if (result.body) next.push({ id: counter.current++, kind: result.error ? "error" : "output", body: result.body });
    setLines((current) => [...current, ...next].slice(-40));
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp" && history.current.length) {
      event.preventDefault();
      cursor.current = Math.min(cursor.current + 1, history.current.length - 1);
      setValue(history.current[cursor.current]);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      cursor.current = Math.max(cursor.current - 1, -1);
      setValue(cursor.current === -1 ? "" : history.current[cursor.current]);
    } else if (event.key === "Tab" && value.trim()) {
      const match = Object.keys(COMMANDS).find((command) => command.startsWith(value.trim().toLowerCase()));
      if (match) {
        event.preventDefault();
        setValue(`${match} `);
      }
    }
  }

  const suggestions = ["help", "projects", "skills", "resume", "contact"];

  return (
    <section className="terminal-section section" id="terminal" aria-labelledby="terminal-title">
      <div className="section-kicker">05 / Terminal</div>
      <div className="terminal-intro">
        <h2 id="terminal-title" className="terminal-heading">Prefer a shell?</h2>
        <p>Everything on this page, one command away. Type <code>help</code> to start.</p>
      </div>
      <div className="terminal" onClick={() => document.getElementById("terminal-input")?.focus()}>
        <div className="terminal-bar" aria-hidden="true">
          <i /><i /><i /><span>lakshya@portfolio: ~</span>
        </div>
        <div ref={screen} className="terminal-screen" role="log" aria-live="polite" aria-label="Terminal output">
          <p className="term-muted">Welcome. Type <code>help</code> to see what you can ask.</p>
          {lines.map((line) => (
            <div key={line.id} className={`term-line term-${line.kind}`}>
              {line.kind === "input" ? <><span className="term-prompt" aria-hidden="true">❯</span> {line.body}</> : line.body}
            </div>
          ))}
        </div>
        <form className="terminal-form" onSubmit={submit}>
          <span className="term-prompt" aria-hidden="true">❯</span>
          <label htmlFor="terminal-input" className="sr-only">Terminal command</label>
          <input
            id="terminal-input"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="type a command…"
            enterKeyHint="send"
          />
        </form>
      </div>
      <div className="term-suggestions" aria-label="Try a command">
        {suggestions.map((command) => (
          <button
            key={command}
            type="button"
            className="chip"
            onClick={() => {
              const result = run(command);
              setLines((current) => [
                ...current,
                { id: counter.current++, kind: "input" as const, body: command },
                ...(result.body ? [{ id: counter.current++, kind: (result.error ? "error" : "output") as Line["kind"], body: result.body }] : []),
              ].slice(-40));
            }}
          >
            {command}
          </button>
        ))}
      </div>
    </section>
  );
}
