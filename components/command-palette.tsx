"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { content } from "@/content";
import { OPEN_PALETTE, scrollToSection, sections } from "@/lib/site";
import { ArrowUpRight, DocIcon, MailIcon, SearchIcon, TerminalIcon, socialIcon } from "./icons";

type Command = { id: string; group: "Go to" | "Actions" | "Elsewhere"; label: string; hint?: string; icon?: ReactNode; run: () => void };

function downloadResume() {
  const link = document.createElement("a");
  link.href = content.person.resume;
  link.download = "Lakshya-Gupta-Resume.pdf";
  link.click();
}

export function CommandPalette({ openOnMount = false }: { openOnMount?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const listId = useId();

  const close = useCallback(() => dialog.current?.close(), []);

  const commands = useMemo<Command[]>(() => [
    ...sections.map((section) => ({ id: `go-${section.id}`, group: "Go to" as const, label: section.label, icon: <span className="cmd-hash">#</span>, run: () => scrollToSection(section.id) })),
    { id: "terminal", group: "Go to", label: "Terminal", hint: "Explore with commands", icon: <TerminalIcon />, run: () => { scrollToSection("terminal"); document.getElementById("terminal-input")?.focus({ preventScroll: true }); } },
    { id: "resume", group: "Actions", label: "Download résumé", hint: "PDF", icon: <DocIcon />, run: downloadResume },
    {
      id: "copy-email", group: "Actions", label: "Copy email address", hint: content.person.email, icon: <MailIcon />,
      run: () => { navigator.clipboard?.writeText(content.person.email).then(() => setCopied(true)).catch(() => undefined); },
    },
    ...content.links.map((link) => ({ id: `link-${link.label}`, group: "Elsewhere" as const, label: link.label, hint: "Opens in a new tab", icon: socialIcon(link.label), run: () => window.open(link.href, "_blank", "noopener,noreferrer") })),
    ...content.projects.filter((project) => project.href).map((project) => ({ id: `src-${project.slug}`, group: "Elsewhere" as const, label: `${project.title} source`, icon: <ArrowUpRight />, run: () => window.open(project.href, "_blank", "noopener,noreferrer") })),
  ], []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? commands.filter((command) => `${command.label} ${command.hint ?? ""} ${command.group}`.toLowerCase().includes(needle)) : commands;
  }, [commands, query]);

  const open = useCallback(() => {
    if (!dialog.current || dialog.current.open) return;
    setQuery("");
    setIndex(0);
    setCopied(false);
    dialog.current.showModal();
    input.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog.current?.open) close();
        else open();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE, open);
    if (openOnMount) open();
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE, open);
    };
  }, [close, open, openOnMount]);

  function execute(command: Command | undefined) {
    if (!command) return;
    if (command.id === "copy-email") {
      command.run();
      return; // Stay open so the "Copied" confirmation is visible.
    }
    close();
    command.run();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndex((value) => (value + 1) % Math.max(results.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndex((value) => (value - 1 + results.length) % Math.max(results.length, 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      execute(results[index]);
    }
  }

  const activeId = results[index] ? `${listId}-${results[index].id}` : undefined;
  let lastGroup = "";

  return (
    <dialog ref={dialog} className="palette" aria-label="Command menu" onClick={(event) => { if (event.target === dialog.current) close(); }}>
      <div className="palette-panel">
        <div className="palette-search">
          <SearchIcon />
          <input
            ref={input}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            placeholder="Search sections and actions…"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setIndex(0); }}
            onKeyDown={onKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd>Esc</kbd>
        </div>
        <ul id={listId} role="listbox" aria-label="Commands" className="palette-list">
          {results.length === 0 && <li className="palette-empty" role="presentation">No matches. Try “resume” or “projects”.</li>}
          {results.map((command, position) => {
            const heading = command.group !== lastGroup ? command.group : null;
            lastGroup = command.group;
            return (
              <li key={command.id} role="presentation">
                {heading && <span className="palette-group" role="presentation">{heading}</span>}
                <div
                  id={`${listId}-${command.id}`}
                  role="option"
                  aria-selected={position === index}
                  className="palette-item"
                  onMouseMove={() => setIndex(position)}
                  onClick={() => execute(command)}
                >
                  <span className="palette-icon">{command.icon}</span>
                  <span>{command.label}</span>
                  <span className="palette-hint-text">{command.id === "copy-email" && copied ? "Copied" : command.hint}</span>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="palette-footer" aria-hidden="true"><kbd>↑</kbd><kbd>↓</kbd> to move · <kbd>Enter</kbd> to run</p>
      </div>
    </dialog>
  );
}
