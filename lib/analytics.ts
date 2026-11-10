// Minimal, privacy-friendly event layer. No third-party script is loaded here: events are pushed to
// window.dataLayer if an analytics tool is added later, and dispatched as a DOM event for anything else.
// Never include form contents or other personal data in event details.

export type TrackEvent =
  | "cta_view_work"
  | "case_study_open"
  | "case_study_view"
  | "resume_download"
  | "github_click"
  | "demo_click"
  | "linkedin_click"
  | "leetcode_click"
  | "email_click"
  | "email_copy"
  | "contact_start"
  | "generate_lead";

declare global {
  interface Window { dataLayer?: Record<string, unknown>[] }
}

export function track(event: TrackEvent | string, detail?: string) {
  if (typeof window === "undefined") return;
  window.dataLayer?.push({ event, detail });
  window.dispatchEvent(new CustomEvent("portfolio:track", { detail: { event, detail } }));
}
