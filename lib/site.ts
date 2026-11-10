export const sections = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const;

export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const lenis = (window as Window & { __lenis?: { scrollTo: (target: HTMLElement, options?: { offset?: number }) => void } }).__lenis;
  if (lenis) lenis.scrollTo(target, { offset: -72 });
  else target.scrollIntoView({ behavior: "auto", block: "start" });
  // Move focus for keyboard and screen-reader users without a second scroll jump.
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}

export const OPEN_PALETTE = "palette:open";
export const openPalette = () => window.dispatchEvent(new Event(OPEN_PALETTE));

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function finePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
