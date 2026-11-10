"use server";

import { headers } from "next/headers";
import { content } from "@/content";

export type ContactState = {
  status: "idle" | "success" | "error" | "invalid" | "unconfigured" | "limited";
  message: string;
  fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
  /** Echoed back on failure so the fields keep what the visitor typed (React resets forms after an action). */
  values?: { name: string; email: string; message: string };
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
// Best-effort per-instance limit; pair with a provider-side limit in production.
const recent = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) return true;
  recent.set(key, [...hits, now]);
  return false;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

export async function sendContact(_previous: ContactState, form: FormData): Promise<ContactState> {
  // Honeypot: real visitors never see or fill this field.
  if (String(form.get("company") ?? "").trim()) return { status: "success", message: "Thanks — your message is on its way." };

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();

  const fieldErrors: ContactState["fieldErrors"] = {};
  if (name.length < 2 || name.length > 80) fieldErrors.name = "Enter your name (2–80 characters).";
  if (!EMAIL.test(email) || email.length > 120) fieldErrors.email = "Enter a valid email address so I can reply.";
  if (message.length < 10 || message.length > 2000) fieldErrors.message = "Write a message between 10 and 2,000 characters.";
  const values = { name, email, message };
  if (Object.keys(fieldErrors).length) return { status: "invalid", message: "Check the highlighted fields.", fieldErrors, values };

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !from) {
    return { status: "unconfigured", message: `The form isn't connected yet. Email me directly at ${content.person.email}.`, values };
  }

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) return { status: "limited", message: "Too many messages in a short time. Try again in a few minutes.", values };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [process.env.CONTACT_TO_EMAIL || content.person.email],
        reply_to: email,
        subject: `Portfolio message from ${name}`,
        text: `${message}\n\n— ${name} <${email}>`,
        html: `<p>${escapeHtml(message).replace(/\n/g, "<br>")}</p><p>— ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>`,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Resend responded ${response.status}`);
    return { status: "success", message: "Thanks — your message was sent. I'll reply by email." };
  } catch {
    return { status: "error", message: `Your message couldn't be sent. Please email me at ${content.person.email}.`, values };
  }
}
