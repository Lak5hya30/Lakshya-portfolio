"use client";

import { Fragment, useSyncExternalStore } from "react";
import { content } from "@/content";
import { scrollToSection } from "@/lib/site";
import { ArrowDown } from "./icons";

const timeFormat = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });

// Re-render once a minute, on the minute.
function subscribeMinute(onChange: () => void) {
  let timer = window.setTimeout(function tick() {
    onChange();
    timer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000));
  }, 60_000 - (Date.now() % 60_000));
  return () => window.clearTimeout(timer);
}

function LocalTime() {
  const time = useSyncExternalStore(subscribeMinute, () => timeFormat.format(new Date()), () => null);
  return time ? <span>{time} IST · {content.person.location}</span> : <span>{content.person.location}</span>;
}

export function SiteFooter() {
  const words = "LAKSHYA GUPTA".split(" ");
  let letterIndex = 0;
  return (
    <footer className="site-footer">
      <div className="footer-meta">
        <span>{content.person.role} · {content.person.status}</span>
        <LocalTime />
        <button
          type="button"
          className="back-to-top"
          onClick={() => (document.getElementById("top") ? scrollToSection("top") : window.scrollTo({ top: 0 }))}
        >
          Back to top <ArrowDown />
        </button>
      </div>
      {/* Each letter rises in turn as the footer scrolls into view (CSS view timeline). */}
      <div className="footer-name" aria-hidden="true">
        {words.map((word, wordIndex) => (
          <Fragment key={word}>
            {wordIndex > 0 && " "}
            <span className="footer-word">
              {[...word].map((letter) => {
                const index = letterIndex++;
                return <span key={index} className="footer-letter" style={{ ["--i" as string]: index }}>{letter}</span>;
              })}
            </span>
          </Fragment>
        ))}
      </div>
    </footer>
  );
}
