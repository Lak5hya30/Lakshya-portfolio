// Contact form: validation and delivery through Netlify Forms.
// Netlify stores each submission and emails it to the address set in the site's form notifications.

export type ContactField = "name" | "email" | "message";
export type ContactValues = Record<ContactField, string>;
export type ContactStatus = "idle" | "sending" | "success" | "error" | "invalid";

/** The Netlify form name; must match the hidden form in public/__forms.html. */
export const FORM_NAME = "contact";
/** Netlify only accepts form posts to a static file, not to a Next.js page route. */
export const FORM_ENDPOINT = "/__forms.html";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact({ name, email, message }: ContactValues) {
  const errors: Partial<Record<ContactField, string>> = {};
  if (name.trim().length < 2 || name.trim().length > 80) errors.name = "Enter your name (2–80 characters).";
  if (!EMAIL.test(email.trim()) || email.length > 120) errors.email = "Enter a valid email address so I can reply.";
  if (message.trim().length < 10 || message.length > 2000) errors.message = "Write a message between 10 and 2,000 characters.";
  return errors;
}

export async function submitContact(values: ContactValues & { company: string }) {
  const body = new URLSearchParams({ "form-name": FORM_NAME, ...values });
  const response = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!response.ok) throw new Error(`Form endpoint responded ${response.status}`);
}
