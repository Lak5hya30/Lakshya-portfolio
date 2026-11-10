// QA sweep: every route at 320–1920px (overflow, console errors, small touch targets), 200% text resize,
// and a status check of every link on the site. Usage: npm run qa [-- http://localhost:3000]
import { existsSync } from "node:fs";
import { chromium } from "playwright-core";
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const chrome = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find((p) => existsSync(p));
const b = await chromium.launch({ executablePath: chrome });
const paths = ["/", "/work", "/work/ai-defense-lab", "/work/bobs-world", "/work/ai-virtual-assistant"];
const widths = [320, 375, 390, 768, 1024, 1440, 1920];
const problems = [];
const links = new Set();
for (const path of paths) {
  for (const w of widths) {
    const p = await b.newPage({ viewport: { width: w, height: 900 }, isMobile: w < 768, hasTouch: w < 768 });
    p.on("pageerror", (e) => problems.push(`${path}@${w} pageerror ${String(e).slice(0, 90)}`));
    p.on("console", (m) => m.type() === "error" && problems.push(`${path}@${w} console ${m.text().slice(0, 90)}`));
    await p.goto(base + path, { waitUntil: "load" }); await p.waitForTimeout(1200);
    const r = await p.evaluate(() => {
      const over = document.documentElement.scrollWidth - innerWidth;
      const wide = [...document.querySelectorAll("body *")].filter((e) => { const b = e.getBoundingClientRect(); return b.right > innerWidth + 1 && getComputedStyle(e).position !== "fixed" && b.width > 0; }).slice(0, 3).map((e) => e.className || e.tagName);
      const small = [...document.querySelectorAll("a, button, input, textarea")].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && (b.height < 24 || b.width < 24); }).length;
      return { over, wide, small, hrefs: [...document.querySelectorAll("a[href]")].map((a) => a.href) };
    });
    if (r.over > 0) problems.push(`${path}@${w} horizontal overflow ${r.over}px ${r.wide.join(",")}`);
    if (w === 375 && r.small) problems.push(`${path}@${w} ${r.small} targets under 24px`);
    r.hrefs.forEach((h) => links.add(h.split("#")[0]));
    if (w === 1440) {
      await p.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
      await p.waitForTimeout(400);
      const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (over > 0) problems.push(`${path}@1440 200% text: overflow ${over}px`);
    }
    await p.close();
  }
}
await b.close();
const results = [];
for (const url of links) {
  if (url.startsWith("mailto:")) continue;
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 portfolio-link-check" }, signal: AbortSignal.timeout(15000) });
    results.push(`${res.status} ${url}`);
    // LinkedIn (999) and LeetCode (403) block automated clients; treat those as unverifiable, not broken.
    if (res.status >= 400 && !/linkedin\.com|leetcode\.com/.test(url)) problems.push(`broken link ${res.status} ${url}`);
  } catch (e) { problems.push(`link error ${url} ${String(e).slice(0, 60)}`); }
}
console.log("links checked:\n " + results.join("\n "));
console.log("\nproblems:", problems.length ? "\n " + problems.join("\n ") : "none");
process.exit(problems.length ? 1 : 0);
