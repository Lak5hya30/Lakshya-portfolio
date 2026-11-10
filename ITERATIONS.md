# Portfolio refinement log

## Setup

- Baseline commit: `605b740 baseline` (already present; nothing new to commit).
- Branch: the work happens on this worktree's branch `claude/portfolio-polish-loop-497cb6`.
  **Decision:** a `polish` branch already exists and is checked out by the main checkout
  (`D:\portfolio\portfolio`), which has someone's uncommitted, half-finished setup on it. Git
  won't check out the same branch in two worktrees, and I did not want to overwrite that work.
  The branch can be renamed or merged into `polish` afterwards.
- `npm run review [-- N]` (`scripts/review.mjs`):
  1. `next build`, then `next start -p 3417` (set `REVIEW_SKIP_BUILD=1` to reuse a build).
  2. Playwright (system Chrome via `playwright-core`) at 375×812, 768×1024 and 1440×900.
     It saves a full-page image per width, stitched from viewport-sized captures.
     **Decision:** Playwright's own `fullPage` resizes the viewport, which inflated the
     `100svh` hero to about 2,700px and made the screenshot lie about the layout.
  3. Load frames at 0.3s, 1s and 2.5s, plus a 4s "settled" frame. Then 8 frames, each taken
     260ms after a jump while scrolling from top to bottom.
  4. Console errors and warnings, page errors, failed requests and hydration messages go to
     `console.json`.
  5. Lighthouse (mobile) runs 3 times and keeps the median by performance score
     (`lighthouse.json`). **Decision:** one run swung between 66 and 84 on this machine.
  6. Extras that help judge the rules: a keyboard-focus frame, an opened project row, and a
     reduced-motion load plus full page at 1440.
- Evidence: `review/iteration-0` is the baseline. `review/iteration-N` is the state after
  iteration N's fixes, which is also the "before" for iteration N+1.
- Review/dev tooling added as devDependencies: `playwright-core`, `lighthouse`. Neither ships
  to the site.

## Baseline (iteration 0) — `review/iteration-0`

Lighthouse mobile (median of 3; runs 66/73/81): **performance 73, accessibility 95**,
best-practices 100, SEO 100. LCP 3.1s, TBT 790ms, CLS 0.005. Console: 0 errors. Lint: pass.

| Area | Score | Why |
|---|---|---|
| First impression | 3 | At 1440 the name is still below the fold at 4s and the portrait box is empty. The first 1.9s are a solid green preloader. |
| Typography | 6 | The serif/grotesk pairing is good. Timeline h3s have loose default leading. Labels are 0.68–0.72rem; secondary copy is 0.78–0.85rem grey. |
| Spacing & alignment | 4 | "Let's talk" collides with "Work" in the centred nav. The 768 portrait is letterboxed with dead space above and below. The footer is about 900px of empty black with a clipped name. |
| Minimalism | 5 | Preloader, custom cursor, a floating project preview card that covers content, a marquee that repeats the skills grid, scroll cue, portrait caption strip. |
| Motion | 4 | Content is blocked for about 2.4s by the preloader. The hero line "mask" moves with the line, so letters slide in unmasked. The portrait never settles. |
| Dot portrait | 2 | Empty at desktop (canvas resize loop, see flaw 1). On mobile the face is mostly dark small dots, and the shirt outshines the face. |
| Mobile layout | 6 | 375 reads well: portrait, then name, then copy. The positioning line is 0.82rem; the contact links are a cramped 2-column grid. |
| Performance | 5 | Lighthouse 73 (LCP 3.1s held back by the preloader, TBT 790ms). |
| Accessibility | 7 | Lighthouse 95: `aria-prohibited-attr` (aria-label on a role-less marquee div) and `label-content-name-mismatch` ("LG" vs "Lakshya Gupta, back to top"). The focus ring is visible. |

### Flaws seen at baseline

1. **The canvas grows without limit.** The canvas size attribute feeds back through a
   ResizeObserver: height goes 759 → 975 → 1201 → 1497 → 1813px over 9s. The hero grows, the
   name drops below the fold, and the dots never settle, so nothing is drawn.
   (`1440-load-2.5s`, `1440-load-4s-settled`, `1440-focus`, `768-load-4s-settled` letterbox)
2. The header CTA "Let's talk" sits flush against "Work" in the middle of the header. The
   Magnetic `<span>` wrapper is the grid item, so `justify-self: end` on the inner link does
   nothing. (`1440-load-2.5s`, `1440-focus`)
3. The footer is about 990px tall with only two meta labels in view at 1440. The big name sits
   below the fold and is clipped on the right ("LAKSHYA GUPT"). (`1440-scroll-8`, `768-full`)
4. The preloader shows a full-screen green counter for about 1.9s before any content, which
   delays LCP to 3.1s. (`1440-load-0.3s`, `1440-load-1s`)
5. The hero line mask doesn't work: `overflow: hidden` is on the line that moves, so glyphs
   slide in below the copy. (`1440-load-2.5s`, `1440-load-4s-settled`)
6. Timeline h3s ("Software / Developer Intern") wrap with a big default line gap.
   (`1440-scroll-3`)
7. The floating "How can I help?" preview card covers the project's capability list.
   (`1440-project-open`)
8. The marquee repeats the skills grid directly above it, and it carries a prohibited
   aria-label. (`1440-full`, `768-full`)
9. The portrait reads as a dark mask: face dots are small and dim, and the shirt is the
   brightest region. (`375-load-4s-settled`, `1440-reduced-motion-load`)
10. Secondary text is small and low contrast (0.68–0.78rem in #a6a6a0).
    (`1440-scroll-3`, `1440-scroll-2`)
11. The custom cursor ring floats in the middle of every frame. (`1440-scroll-*`)
12. The wordmark's accessible name doesn't match its visible "LG" (Lighthouse).
13. The contact link row on 375 is a two-column grid with uneven widths. (`375-full`)
14. The about stat "300+" animates from 0, so mid-scroll it reads "204+". (`1440-scroll-2`)

## Iteration 1 — layout and spacing

Fixed the 3 biggest flaws (baseline flaws 1–3):

1. **Canvas resize loop.** `.dot-portrait` is now `position: absolute; inset: 0` inside
   `.hero-portrait`, so the canvas's pixel size can no longer change the layout it measures.
   The duplicate `min-height` rules on the canvas and mobile portrait are gone (simplification).
   Result: the hero is exactly one viewport, the name sits above the fold, and the portrait
   draws and settles. (`iteration-1/1440-load-4s-settled`)
2. **Header CTA.** The grid item is now the Magnetic wrapper (`.header-cta`, `justify-self: end`),
   so "Let's talk" sits at the right edge. (`iteration-1/1440-load-4s-settled`, `768-load-4s-settled`)
3. **Footer.** Removed the fixed `height: min(72vw, 62rem)` / `82svh` and the scroll-scrubbed
   footer parallax (removal). The name is now sized so it spans exactly the content width:
   `(100vw − 2·gutter) / 7.05`, measured from the rendered em-width. The footer is now compact
   and nothing is clipped. (`iteration-1/1440-scroll-8`)

Checks: nothing regressed at 375 (`iteration-1/375-load-4s-settled` matches baseline). Console:
0 errors. Lint: pass. Build: pass.

| Area | Before | After |
|---|---|---|
| First impression | 3 | 6 |
| Typography | 6 | 6 |
| Spacing & alignment | 4 | 6 |
| Minimalism | 5 | 5 |
| Motion | 4 | 5 |
| Dot portrait | 2 | 5 |
| Mobile layout | 6 | 6 |
| Performance | 5 (73) | 8 (92; runs 90/92/92) |
| Accessibility | 7 (95) | 7 (95) |

The large performance gain is a side effect of fix 1: the resize loop had been rebuilding the
dot field on every frame.

**Next:** typography. Timeline h3 leading, tiny low-contrast labels and secondary copy, and the
hero line mask. After that: the preloader, the 768 portrait letterbox, and the dark face.

## Iteration 2 — typography

Fixed:

1. **Timeline titles.** The h3s had the browser's default ~1.4 leading, which split "Software /
   Developer Intern" into two loose lines. Set `line-height: 1.05`. (`iteration-2/1440-scroll-3`)
2. **One text scale (simplification).** There were 6 small sizes (0.68, 0.7, 0.72, 0.75, 0.78,
   0.85rem) and 4 label trackings (0.04, 0.08, 0.09, 0.11em). They collapse into
   `--text-label` (0.72rem caps), `--text-small` (0.875rem), `--text-body` (1rem) and one
   `--tracking-label` (0.08em). Nav, header CTA, company names, education and contact links
   move from 0.78 to 0.875rem.
3. **Reading copy.** Timeline bullets and project detail go from 0.85rem/1.65 grey to
   1rem/1.6. The mobile hero positioning line goes from 0.82rem to 0.95rem. The 300+ label
   moves from label size to small text, since it is a sentence, not a tag.

Checks: console 0 errors; lint and build pass. Lighthouse performance 88 (runs 83/88/88), down
from 92. **Decision:** not reverted. The change is CSS-only, with no JS, assets or layout
shift; TBT varies 220–340ms between runs on this machine, and the 83–92 spread overlaps.
The score band stays at 8.

| Area | Before | After |
|---|---|---|
| First impression | 6 | 6 |
| Typography | 6 | 7 |
| Spacing & alignment | 6 | 6 |
| Minimalism | 5 | 5 |
| Motion | 5 | 5 |
| Dot portrait | 5 | 5 |
| Mobile layout | 6 | 6 |
| Performance | 8 (92) | 8 (88) |
| Accessibility | 7 (95) | 7 (95) |

**Next:** motion. The preloader holds back all content for about 2.4s. The hero lines slide in
unmasked. The "300+" count-up reads as wrong numbers mid-scroll.

## Iteration 3 — motion timing and easing

Fixed:

1. **Removed the preloader (removal).** The full-screen green 000→100 counter blocked content
   for about 2.4s. The hero now starts animating at 0.1s: name lines at 0.9s with a 0.08s
   stagger (power4.out), intro elements at 0.7s with a 0.06s stagger (power3.out). To avoid a
   flash before hydration, the hero starts at `opacity: 0` in CSS, but only under
   `prefers-reduced-motion: no-preference`. A `<noscript>` style keeps it visible without JS.
   Speed Index went from 3.4s to 1.5s. (`iteration-3/1440-load-1s` versus `iteration-2/1440-load-1s`)
2. **Hero line entrance.** The overflow "mask" was on the moving line itself, so glyphs slid in
   below the subtitle. The lines now rise 45% with a fade, which reads as intentional without
   needing a mask. A mask would clip the descenders of "y" and "p" at this tight leading.
   Removed the dead `.hero h1 > div` rule. The h1 leading is now explicit (0.85, mobile 0.87)
   instead of relying on padding added to SplitText lines, so animated and reduced-motion
   renders match and "Gupta"'s descender no longer touches the subtitle.
3. **Removed the 0→300 count-up (removal).** Mid-scroll it showed wrong-looking numbers such as
   "204+" (`iteration-0/1440-scroll-2`). It is now the static fact from `content.ts`.

The portrait's gather animation now starts when the dot data arrives, not at mount, so a slow
fetch can't skip it (`iteration-3/768-load-1s` shows it mid-gather).

Checks: reduced motion renders the full hero immediately (`iteration-3/1440-reduced-motion-load`).
Console 0 errors; lint, typecheck and build pass. Lighthouse performance 89 (runs 89/89/89);
LCP is still 3.0s.

| Area | Before | After |
|---|---|---|
| First impression | 6 | 7 |
| Typography | 7 | 7 |
| Spacing & alignment | 6 | 6 |
| Minimalism | 5 | 6 |
| Motion | 5 | 7 |
| Dot portrait | 5 | 5 |
| Mobile layout | 6 | 6 |
| Performance | 8 (88) | 8 (89) |
| Accessibility | 7 (95) | 7 (95) |

**Next:** mobile and tablet. The 768 portrait is a tall letterboxed column with dead space, the
375 contact links are uneven, and the face is dark on every size.

## Iteration 4 — mobile and tablet

Fixed:

1. **Tablet hero.** At 681–900px the hero kept two columns, which squeezed the portrait into a
   304px-wide column about 780px tall with dead space above and below
   (`iteration-3/768-load-4s-settled`). Tablets now use the phone's stacked layout: portrait
   row `minmax(16rem, 42svh)`, then the copy. The phone block only overrides padding, row
   size and type size, which removes 3 duplicate hero declarations (simplification). The
   tablet portrait now uses the dense desktop dot set at a wide aspect, and the face is
   clearly recognisable. (`iteration-4/768-load-4s-settled`)
2. **Portrait anchoring.** The dots were centred vertically and partly hidden behind the cream
   caption, which overlaid the canvas. The caption now has an explicit `--caption-height`, the
   canvas ends above it, and the dots are bottom-anchored so the shoulders rest on the
   caption at every width. (`iteration-4/1440-load-4s-settled`, `375-load-4s-settled`)
3. **375 contact and toolkit.** Contact links were an uneven 2×2 grid. They are now one
   wrapping row (gap 1rem 2rem, padding-top 3rem). Skill groups drop from about 140px to
   about 90px each (value text 0.75rem under its label instead of 2rem).
   (`iteration-4/375-scroll-8`, `375-scroll-6`)

Checks: 1440 unchanged apart from the anchored dots. Reduced motion is fine. Console 0
errors; lint and build pass. Lighthouse performance 89 (86/89/90); LCP 2.9s.

| Area | Before | After |
|---|---|---|
| First impression | 7 | 7 |
| Typography | 7 | 7 |
| Spacing & alignment | 6 | 7 |
| Minimalism | 6 | 6 |
| Motion | 7 | 7 |
| Dot portrait | 5 | 6 |
| Mobile layout | 6 | 7 |
| Performance | 8 (89) | 8 (89) |
| Accessibility | 7 (95) | 7 (95) |

**Next:** performance and accessibility. LCP is 2.9s and TBT about 290ms. Fix the two
Lighthouse a11y failures (prohibited aria-label on the marquee, wordmark name mismatch).

## Iteration 5 — performance and accessibility

Investigation: LCP had 85% render delay. At first the LCP element was the hero line, which
stayed hidden until hydration plus GSAP. After moving the entrance to CSS, Lighthouse picked
the tiny "Let's talk" link instead. **Experiment:** with the hero animation removed entirely,
LCP was still 2.7s on the h1. So LCP is bound by font and JS timing in Lighthouse's simulated
slow 4G, not by the animation. (`npm run review` gained `REVIEW_LIGHTHOUSE_ONLY=1` and now logs
the LCP element.)

Fixed:

1. **Hero entrance in CSS (simplification).** Removed `SplitText` and the hero GSAP code. The
   two name lines are plain `<span class="hero-line">`s that animate with one `rise` keyframe
   (same motion as before: 45% rise and fade, 0.9s, `cubic-bezier(0.16,1,0.3,1)`, 80ms
   stagger). Intro items use the same keyframe at 0.7s with 60ms steps. It runs from first
   paint, needs no JS, and the `<noscript>` workaround from iteration 3 is gone. The reduced
   motion block already forces the final state. (`iteration-5/1440-load-1s`, `375-load-0.3s`,
   `1440-reduced-motion-load`)
2. **Dropped the `motion` library (removal).** It was only used by `Magnetic`, which now uses
   `gsap.quickTo` (GSAP is already loaded) with the same 0.22 pull and an elastic return.
   Magnetic is also skipped under reduced motion now. TBT went from about 290ms to 200ms; perf
   median 92 (runs above).
3. **Lighthouse accessibility failures.** The marquee had an `aria-label` on a role-less div;
   it is now `aria-hidden`, since the same skills are listed as text directly above. The
   wordmark's accessible name didn't contain its visible "LG"; it now uses visible "LG" plus
   sr-only " Lakshya Gupta, back to top".

Checks: console 0 errors; lint, typecheck and build pass. **Accessibility 95 → 100.**
Performance 92; LCP 2.9s is still the one failing metric (font and JS bound, see above).

| Area | Before | After |
|---|---|---|
| First impression | 7 | 7 |
| Typography | 7 | 7 |
| Spacing & alignment | 7 | 7 |
| Minimalism | 6 | 6 |
| Motion | 7 | 7 |
| Dot portrait | 6 | 6 |
| Mobile layout | 7 | 7 |
| Performance | 8 (89) | 8 (92) |
| Accessibility | 7 (95) | 8 (100; visible focus ring, reduced motion works, but no skip link and the custom cursor still overlays focus) |

**Next:** small details. The floating project preview card covers content, the custom cursor
ring floats over every frame, the OG image uses a generic sans, and the default Next
public/ SVGs are unused.

## Iteration 6 — small details (hover, focus, cursor, assets)

Fixed:

1. **Removed the floating project preview card (removal).** The cream "How can I help?" card
   followed the pointer over the project row and covered the capability list
   (`iteration-0/1440-project-open`). It is removed along with its pointer handlers and about
   15 CSS rules. The row now gets a plain opacity hover through the existing transition.
   (`iteration-6/1440-project-open`)
2. **Removed the custom cursor ring (removal).** It duplicated the native cursor, lagged behind
   it, and sat over focused elements. Hover feedback already comes from link underlines and
   the magnetic CTA. This drops a global pointermove listener and two GSAP quickTo tweens.
3. **Focus ring on light sections.** The signal-green outline is about 1.1:1 against paper, so
   keyboard focus was effectively invisible in About and Contact. Those sections now use an ink
   outline. (`iteration-6/1440-focus-light-section`)

Also removed: the unused create-next-app SVGs (`next`, `vercel`, `file`, `globe`, `window`),
the duplicate `portrait.jpg`, and two unused `portrait-alt*` PNGs (about 2.8MB) from `public/`.
`lakshya-gupta.jpg` stays (referenced by `content.ts`); `portrait-cutout`/`portrait-source`
stay (portrait build script).

Checks: console 0 errors; lint, typecheck and build pass. Lighthouse perf 92, a11y 100.

| Area | Before | After |
|---|---|---|
| First impression | 7 | 7 |
| Typography | 7 | 7 |
| Spacing & alignment | 7 | 7 |
| Minimalism | 6 | 7 |
| Motion | 7 | 7 |
| Dot portrait | 6 | 6 |
| Mobile layout | 7 | 7 |
| Performance | 8 (92) | 8 (92) |
| Accessibility | 8 (100) | 8 (100; focus now visible everywhere, but no skip link) |

**Next (repeat from layout, targeting the weakest area):** the dot portrait is now the lowest
score (6). On desktop and phone the face reads as a dark void while the shirt is the brightest
area, which also caps First impression.

## Iteration 7 — layout, round 2 (weakest area: dot portrait)

Fixed:

1. **Portrait build bug.** `scripts/build-portrait.ts` read alpha as `data[index + 3]`, but sharp
   returns one premultiplied grey channel here. "Alpha" was really the grey value of the pixel
   3px to the right, and brightness was multiplied by it, which roughly squared every tone.
   That crushed the mid-dark face into tiny dots while the white shirt stayed at full size. It
   now reads alpha only when an alpha channel exists. The shirt also fades by up to 55% below
   the chin (`SHIRT_START = 0.73`) so the face is the focal area. **Decision:** I tried a CLAHE
   pass and a midtone gamma of 0.72/0.5/0.4 first (previews compared side by side); once the bug
   was fixed none of them helped, so both were removed again. The hair, glasses, smile and jaw
   now read at every width. (`iteration-7/375-load-4s-settled`, `1440-load-4s-settled`)
2. **Contact section rhythm (simplification).** Contact was the only section that was a
   92svh/100svh flex column with `margin: auto` spacers. That jammed "05 / Contact" against
   the intro line and left about 200px of empty paper under the links
   (`iteration-6/1440-scroll-7`). It now uses the same block flow and kicker spacing as every
   other section. Side effect: the Magnetic `<span>` lost its blockification, which collapsed
   the email's top margin onto "exact.". `.magnetic` is now `inline-block` and `.email-wrap`
   is `block`. (`iteration-7/1440-scroll-8`, `375-full`)
3. **Removed the "Scroll to explore" cue (removal).** It was already hidden on phones, and on
   desktop it repeated what the fold already implies. The positioning line now closes the
   hero copy.

Tooling: the review now deletes `.next` before building. Turbopack's persistent cache served a
stale `globals.css` (contact still `display: flex`) to the first iteration-7 run. Earlier
iterations' CSS changes are confirmed in their frames, so their evidence stands.

Checks: console 0 errors; lint and clean build pass. Lighthouse perf 92 (LCP 2.6s), a11y 100.

| Area | Before | After |
|---|---|---|
| First impression | 7 | 8 |
| Typography | 7 | 7 |
| Spacing & alignment | 7 | 8 |
| Minimalism | 7 | 7 |
| Motion | 7 | 7 |
| Dot portrait | 6 | 7 |
| Mobile layout | 7 | 7 |
| Performance | 8 (92) | 8 (92) |
| Accessibility | 8 (100) | 8 (100) |

**Next:** typography. Section h2s are all the same huge 8.5rem block (about 3 lines each),
the about summary sets 2rem text at a 30ch measure, and the marquee repeats the skills grid.

## Iteration 8 — typography, round 2 (and minimalism)

Fixed:

1. **Removed the skills marquee (removal).** It scrolled the exact list printed in the 4-column
   skills grid directly above it, and it was the only infinite animation besides the status dot.
   The component, its scroll-velocity listener, 7 CSS rules and the reduced-motion overrides are
   gone. The Toolkit section now ends on the grid. (`iteration-8/1440-full`, `375-full`)
2. **Balanced headings, no orphans.** `text-wrap: balance` on h1–h3 and `pretty` on `p`/`li`.
   Section titles no longer leave a dangling word ("Work shaped / by real systems.",
   "Engineering / with clarity, from / interface to system."). Timeline and project copy no
   longer end on one-word lines such as "feedback." or "in mind.". (`iteration-8/1440-scroll-3`)
3. **One display weight.** Cormorant 500 was loaded only for the "LG" wordmark; it now uses 400.
   That is one fewer font file on the critical path. LCP went from 2.6s to 2.5s and
   performance from 92 to 94 (median of 3).

Checks: console 0 errors; lint passes; clean build passes; reduced motion OK
(`iteration-8/1440-reduced-motion-full`). Lighthouse mobile: **performance 94, accessibility
100**, best-practices 100, SEO 100.

| Area | Before | After |
|---|---|---|
| First impression | 8 | 8 |
| Typography | 7 | 8 |
| Spacing & alignment | 8 | 8 |
| Minimalism | 7 | 8 |
| Motion | 7 | 7 |
| Dot portrait | 7 | 7 |
| Mobile layout | 7 | 7 |
| Performance | 8 (92) | 8 (94) |
| Accessibility | 8 (100) | 8 (100) |

---

## Final summary

**Stopped because:** 8 iterations are done. Not every score reached 9, so the "all 9+" stop
condition was not met.

| Area | Start (iteration 0) | Final (iteration 8) |
|---|---|---|
| First impression | 3 | 8 |
| Typography | 6 | 8 |
| Spacing & alignment | 4 | 8 |
| Minimalism | 5 | 8 |
| Motion | 4 | 7 |
| Dot portrait | 2 | 7 |
| Mobile layout | 6 | 7 |
| Performance | 5 (Lighthouse 73) | 8 (Lighthouse 94) |
| Accessibility | 7 (Lighthouse 95) | 8 (Lighthouse 100) |

Build, lint and typecheck pass. There are zero console errors or hydration warnings at all
three widths and in reduced motion.

### Biggest changes

- **Two real bugs, not polish.** (1) A canvas/ResizeObserver feedback loop grew the hero
  without limit, so on desktop the name sat below the fold and the portrait never drew. Fixing
  it also took performance from 73 to 92. (2) The portrait build script read a neighbouring
  pixel as alpha, squaring every tone; that is why the face was a dark mask.
- **About 2.4s faster to content.** Removed the preloader; the hero entrance is now pure CSS
  from first paint (no SplitText, no hydration wait). Speed Index went from 3.9s to about 1.5s.
- **Removed:** preloader, count-up, footer parallax, scroll cue, floating project preview
  card, custom cursor, skills marquee, the `motion` dependency, SplitText, about 3.8MB of
  unused public assets, and 6 font sizes collapsed into a 3-step text scale.
- **Layout:** header CTA alignment, a compact footer whose name spans the content width
  exactly, a stacked tablet hero, the portrait anchored to its caption, and contact on the
  shared section rhythm.
- **Accessibility:** both Lighthouse failures fixed, plus an ink focus ring on the cream
  sections (the green ring was about 1.1:1 there).

### Not fixed / why nothing is a 9

- **Performance 94, not 95+.** LCP is 2.5s under Lighthouse's simulated slow 4G. I showed
  that it does not depend on the hero animation (LCP stays 2.7s with the animation removed).
  What's left is web-font and JS timing; GSAP, ScrollTrigger and Lenis account for most of the
  remaining about 2s of script evaluation. Getting to 95+ likely means self-subsetting the
  display font or dropping Lenis, which is a product decision.
- **Motion 7.** The same word-by-word RevealText runs on all five section titles, which gets
  predictable by the third. Lenis smooth scroll adds latency to wheel input. I didn't change
  either, because both are core to the stated motion thesis in `DESIGN.md`.
- **Dot portrait 7.** Recognisable on phone and tablet. On desktop the dots are spaced widely
  enough that the hair and eyes read only at a distance. A denser desktop set (about 9–10k
  dots) would help, but costs canvas time per frame.
- **Mobile 7.** The 375 hero shows the portrait, name and line but nothing else above the
  fold. The project row ("AI Virtual / Assistant") wraps to two lines next to a small "+"
  target.
- **Accessibility 8.** No skip link (the nav has 3 items, so impact is small). The project
  row's details/summary has no visible "expanded" text state beyond the rotated "+".
- **Content gaps (not editable under the rules):** `content.ts` has one project and TODOs
  for two more, and the open-source entry has no URL. The "Selected work" section therefore
  feels thin no matter how it's styled.

---

# Round 2: freeform improvement iterations (dark-only site)

Rules for this round (your request): new animations and features are allowed. Each iteration still
gets a full `npm run review`, a check for regressions and its own commit.
Baseline `review/iteration-v2-0`: Lighthouse perf 93 · a11y 100 · console 0.

## Iteration A — motion and delight (`review/iteration-v2-a`)

Weaknesses found: no signature motion between hero and footer; all sections enter the same way;
project covers static; no sense of position on a long page; duplicate "OPEN-SOURCE WORK · OPEN
SOURCE" label (`v2-0/1440-scroll-2`); empty bands closing Skills and Terminal (`v2-0/1440-scroll-6/7`).

Changes:
1. **Reading progress hairline** under the header. A pure CSS scroll timeline (`animation-timeline: scroll(root)`),
   so no JS runs on scroll; hidden where unsupported. (`v2-a/1440-scroll-3`)
2. **Decoding section kickers.** Labels scramble and resolve left to right in 0.7s the first time they
   enter, like a terminal readout. One shared IntersectionObserver; skipped for reduced motion;
   tabular numerals keep the width steady. (`v2-a/1440-scroll-3` shows "03 / SEDM4#BB M*1U" mid-decode)
3. **Live project covers.** The fraud lab's pipeline "runs": a pulse walks Discover → Adapt on a loop.
   In BOB's World the player patrols the tile map and the zombies shamble. All compositor-only
   transforms. (`v2-a/1440-scroll-4`)
4. Fixes: de-duplicated the experience label; tightened the bottom of the Skills and Terminal sections.

Result: perf 92 (runs 91–93) · a11y 100 · console 0. No regressions.

## Iteration B — section transitions and the footer (`review/iteration-v2-b`)

Changes:
1. **Paper bands open up.** About and Contact start as an inset rounded card and widen to full bleed
   over the first half-screen of their entry: a CSS view timeline on `clip-path`, no JS. Disabled for
   reduced motion and where view timelines aren't supported.
2. **Footer.** Extracted into `site-footer.tsx`:
   - The giant name now rises letter by letter as the footer scrolls in; each letter carries the gradient so the transforms don't break `background-clip: text`.
   - A live local-time readout ("18:39 IST · India") re-renders once a minute on the minute through `useSyncExternalStore`.
   - A Back to top button returns keyboard focus to the hero. (`v2-b/1440-scroll-8`)
3. **Hero name responds to the pointer.** Each letter lifts and tints with the accent on hover
   (fine pointers only). The h1 keeps a single accessible name via `aria-label`. (`v2-b/1440-load-4s-settled`)

Result: perf 94 (runs 91–94) · a11y 100 · console 0. No regressions.

## Iteration C — mobile (`review/iteration-v2-c`)

Weaknesses found on 375px:
- The Toolkit stacked five tall cards (about 1,000px of scrolling).
- Tapping a skill updated a "used in" panel that sat below all the cards, off-screen.
- The GitHub panel said "No public activity in the last 90 days", a negative signal shown to recruiters for no benefit.

Changes:
1. **Phone Toolkit uses wrapping chips** (monogram plus name). The section is roughly half as tall.
2. **The "used in" panel sticks to the bottom of the screen on phones**, but only while the skill cards are in
   view: the cards and panel share one wrapper, so the panel never covers the section heading.
   Checked in headless Chrome: off-screen while the heading is visible, pinned while the cards scroll.
   Its uses sit on one swipeable row with a fade, so the panel stays 90px tall instead of 237px.
3. **GitHub panel:** shows the activity list only when there is activity. The stats otherwise spread
   into one row across the panel on desktop.

Result: perf 93 (runs 91–94) · a11y 100 · best practices 100 · SEO 100 · console 0. No horizontal overflow at 375.

## Round 2 summary

| | v2-0 baseline | after A–C |
|---|---|---|
| Lighthouse perf (median of 3) | 93 | 93 |
| Accessibility / Best practices / SEO | 100 / 100 / 100 | 100 / 100 / 100 |
| Console errors | 0 | 0 |

Added: reading-progress hairline, decoding section labels, live project covers (running pipeline,
moving game sprites), paper bands that open to full bleed, a letter-by-letter footer name with a live
IST clock and back-to-top, hover-reactive hero letters, a compact phone toolkit with a sticky
"used in" panel. Every new motion is disabled under `prefers-reduced-motion`, and the scroll-linked
effects use CSS scroll and view timelines, so they cost no JavaScript per frame.

Still open:
- Resend keys are needed for the contact form to send.
- The AI portfolio assistant remains a possible follow-up.
- The Selected Work section would benefit from real screenshots once the projects have hosted demos.
