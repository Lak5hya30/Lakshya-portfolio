"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { content } from "@/content";
import { submitContact, validateContact, type ContactField, type ContactStatus } from "@/lib/contact";
import { Magnetic } from "./magnetic";
import { RevealText } from "./reveal-text";
import { ArrowUpRight, DocIcon, socialIcon } from "./icons";

type FormState = { status: ContactStatus; message: string; errors: Partial<Record<ContactField, string>> };
const initial: FormState = { status: "idle", message: "", errors: {} };

export function Contact() {
  const [state, setState] = useState<FormState>(initial);
  const form = useRef<HTMLFormElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const [copied, setCopied] = useState(false);
  const pending = state.status === "sending";

  // Move focus to the result so keyboard and screen-reader users hear it.
  useEffect(() => {
    if (state.status !== "idle" && state.status !== "sending") status.current?.focus();
  }, [state.status]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values = { name: String(data.get("name") ?? ""), email: String(data.get("email") ?? ""), message: String(data.get("message") ?? "") };
    const errors = validateContact(values);
    if (Object.keys(errors).length) {
      setState({ status: "invalid", message: "Check the highlighted fields.", errors });
      return;
    }
    setState({ status: "sending", message: "", errors: {} });
    try {
      await submitContact({ ...values, company: String(data.get("company") ?? "") });
      form.current?.reset();
      setState({ status: "success", message: "Thanks — your message was sent. I'll reply by email.", errors: {} });
    } catch {
      setState({ status: "error", message: `Your message couldn't be sent. Please email me at ${content.person.email}.`, errors: {} });
    }
  }

  const error = (field: ContactField) => state.errors[field];

  return (
    <section className="contact section" id="contact" aria-labelledby="contact-title">
      <div className="section-kicker">06 / Contact</div>
      <p className="contact-intro">Have an internship, a hard problem, or an open-source idea?</p>
      <h2 id="contact-title"><RevealText>Let&apos;s build something exact.</RevealText></h2>
      <div className="contact-grid">
        <div className="contact-direct">
          <Magnetic className="email-wrap"><a className="email-link" href={`mailto:${content.person.email}`}>{content.person.email}</a></Magnetic>
          <button
            type="button"
            className="text-link copy-email"
            onClick={() => navigator.clipboard?.writeText(content.person.email).then(() => setCopied(true)).catch(() => undefined)}
          >
            {copied ? "Copied to clipboard" : "Copy email"}
          </button>
          <div className="contact-links">
            {content.links.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer">{socialIcon(link.label)}{link.label}<ArrowUpRight /></a>
            ))}
            <a href={content.person.resume} download><DocIcon />Download résumé</a>
          </div>
        </div>
        <form ref={form} className="contact-form" name="contact" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="contact-name">Name</label>
            <input id="contact-name" name="name" autoComplete="name" required minLength={2} maxLength={80} aria-invalid={Boolean(error("name"))} aria-describedby={error("name") ? "contact-name-error" : undefined} />
            {error("name") && <span id="contact-name-error" className="field-error">{error("name")}</span>}
          </div>
          <div className="field">
            <label htmlFor="contact-email">Email</label>
            <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={120} aria-invalid={Boolean(error("email"))} aria-describedby={error("email") ? "contact-email-error" : undefined} />
            {error("email") && <span id="contact-email-error" className="field-error">{error("email")}</span>}
          </div>
          <div className="field">
            <label htmlFor="contact-message">Message</label>
            <textarea id="contact-message" name="message" rows={5} required minLength={10} maxLength={2000} aria-invalid={Boolean(error("message"))} aria-describedby={error("message") ? "contact-message-error" : undefined} />
            {error("message") && <span id="contact-message-error" className="field-error">{error("message")}</span>}
          </div>
          {/* Honeypot for bots; hidden from people and assistive tech. */}
          <div className="honeypot" aria-hidden="true">
            <label htmlFor="contact-company">Company</label>
            <input id="contact-company" name="company" tabIndex={-1} autoComplete="off" />
          </div>
          <div className="form-footer">
            <button type="submit" className="button button-primary" disabled={pending}>
              {pending ? "Sending…" : "Send message"}
            </button>
            <p ref={status} tabIndex={-1} role="status" className={`form-status is-${state.status}`}>{state.message}</p>
          </div>
        </form>
      </div>
    </section>
  );
}
