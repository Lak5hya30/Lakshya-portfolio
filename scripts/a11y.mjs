// Accessibility gate: runs axe-core (WCAG 2.0/2.1 A + AA rules) against the home page and every case study.
// Usage: npm run a11y [-- http://localhost:3000]   (defaults to http://localhost:3000)
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { chromium } from "playwright-core";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const chrome = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find((p) => existsSync(p));
const slugs = JSON.parse(await (await fetch(`${base}/sitemap.xml`)).text().then((xml) => JSON.stringify([...xml.matchAll(/\/work\/([^<]+)</g)].map((m) => m[1]))));

const browser = await chromium.launch({ executablePath: chrome });
let failures = 0;
for (const path of ["/", ...slugs.map((slug) => `/work/${slug}`)]) {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 375, height: 812 }]) {
    const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
    await page.goto(base + path, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    await page.addScriptTag({ content: axeSource });
    const result = await page.evaluate(async () => window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] } }));
    const issues = result.violations.filter((v) => v.impact === "serious" || v.impact === "critical" || v.impact === "moderate");
    console.log(`${path} @${viewport.width}: ${issues.length ? issues.length + " issue(s)" : "pass"}`);
    for (const v of issues) {
      failures++;
      console.log(`  [${v.impact}] ${v.id}: ${v.help}`);
      for (const node of v.nodes.slice(0, 4)) console.log(`     ${node.target.join(" ")}  ${(node.failureSummary ?? "").split("\n")[1]?.trim() ?? ""}`);
    }
    await page.close();
  }
}
await browser.close();
process.exit(failures ? 1 : 0);
