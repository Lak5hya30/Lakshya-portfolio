# Lakshya Gupta — portfolio

Next.js 16 (App Router, Cache Components) · React 19 · GSAP + Lenis · TypeScript.

## Run it

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm run start
npm run review         # production build + Playwright screenshots + Lighthouse → review/iteration-N/
```

Copy `.env.example` to `.env.local` and fill in what you need:

| Variable | Needed for |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, Open Graph, sitemap, structured data |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` | Contact form delivery. Without them the form validates, then tells visitors to email directly. |
| `CONTACT_TO_EMAIL` | Optional inbox override |
| `GITHUB_TOKEN` | Optional: higher GitHub API limit for the activity panel |

## Where things live

- `content.ts`: every fact on the site (taken from the résumé and the project READMEs). Edit content here only.
- `components/`: one file per section (`hero`, `experience`, `projects`, `skills`, `terminal`, `contact`), plus the header, command palette (⌘/Ctrl+K) and the canvas dot portrait.
- `lib/github.ts`: server-side GitHub fetch, cached for an hour, with a graceful fallback.
- `app/actions.ts`: contact form server action (validation, honeypot, rate limit, Resend).
- `scripts/build-portrait.ts`: regenerates `public/portrait-dots.json` from `public/portrait-cutout.png`.

The site is dark-only; every animation respects `prefers-reduced-motion`.
