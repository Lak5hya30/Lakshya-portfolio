# Lakshya Gupta — portfolio

Next.js 16 (App Router, Cache Components) · React 19 · GSAP + Lenis · TypeScript.

## Run it

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm run start
npm run review         # production build + Playwright screenshots + Lighthouse → review/iteration-N/
npm run a11y -- <url>  # axe-core WCAG 2.1 AA check of every page at 1440px and 375px
npm run qa -- <url>    # overflow at 320–1920px, 200% text, console errors, touch targets, link status
```

## Routes

| Route | What it is |
| --- | --- |
| `/` | Home: hero, credibility strip, selected work, experience, toolkit, about, contact (terminal is an optional extra at the end) |
| `/work` | Project index |
| `/work/ai-defense-lab`, `/work/bobs-world`, `/work/ai-virtual-assistant` | Case studies, statically generated from `content.ts` |

Copy `.env.example` to `.env.local` and fill in what you need:

| Variable | Needed for |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, Open Graph, sitemap, structured data |
| `GITHUB_TOKEN` | Optional: higher GitHub API limit for the activity panel |

## Where things live

- `content.ts`: every fact on the site (taken from the résumé and the project READMEs). Edit content here only.
- `components/`: one file per section (`hero`, `experience`, `projects`, `skills`, `terminal`, `contact`), plus the header, command palette (⌘/Ctrl+K) and the canvas dot portrait.
- `lib/github.ts`: server-side GitHub fetch, cached for an hour, with a graceful fallback.
- `lib/contact.ts` + `public/__forms.html`: contact form via Netlify Forms (validation, honeypot). Submissions are emailed through the site's Netlify form notifications.
- `scripts/build-portrait.ts`: regenerates `public/portrait-dots.json` from `public/portrait-cutout.png`.

The site is dark-only; every animation respects `prefers-reduced-motion`.

## Deployment (Netlify)

- `netlify.toml` builds with `npm run build`, pins `@netlify/plugin-nextjs` (without it Netlify published the raw `.next` folder) and sets `NEXT_PUBLIC_SITE_URL`.
- Security headers (CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) are in `next.config.ts`; netlify.toml headers only reach static files.
- Pushes to `main` deploy to production; `netlify deploy --build` creates a private draft URL (sent with `noindex`).

## Content still to verify or supply

Case studies only show sections backed by evidence. Adding any of these to `content.ts` makes the matching section appear:

- Your role/contribution and timeframe for each project (solo or team, dates).
- Real screenshots (the covers are illustrations of each project's core idea, not screenshots).
- Measured results for the Techlomedia internship (dataset size, model accuracy, latency) and links to specific Dynamo pull requests. The Dynamo repository linked from the résumé now returns 404, so the site links to the organization.
- Testing details for BOB's World and the AI Virtual Assistant.
