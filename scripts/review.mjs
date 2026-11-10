// Production review harness: build, serve, capture screenshots/frames, console errors, Lighthouse.
// Usage: npm run review [-- <iteration-number>]   (defaults to the next free review/iteration-N)
import { spawn, execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import lighthouse from "lighthouse";
import sharp from "sharp";
import * as chromeLauncher from "chrome-launcher";

const root = process.cwd();
const PORT = Number(process.env.REVIEW_PORT ?? 3417);
const URL = `http://localhost:${PORT}/`;
const CHROME =
  process.env.CHROME_PATH ??
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
  ].find((candidate) => existsSync(candidate));

const reviewRoot = path.join(root, "review");
mkdirSync(reviewRoot, { recursive: true });
const explicit = process.argv[2];
const next = explicit ?? String(
  readdirSync(reviewRoot)
    .map((name) => Number(/^iteration-(\d+)$/.exec(name)?.[1] ?? 0))
    .reduce((max, value) => Math.max(max, value), 0) + 1,
);
const out = path.join(reviewRoot, `iteration-${next}`);
mkdirSync(out, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: "inherit", cwd: root });
}

async function waitForServer(url, timeout = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await sleep(400);
  }
  throw new Error(`Server did not start at ${url}`);
}

function stopServer(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === "win32") {
    try { execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: "ignore" }); } catch {}
  } else {
    child.kill("SIGTERM");
  }
}

const viewports = [
  { name: "375", width: 375, height: 812, mobile: true },
  { name: "768", width: 768, height: 1024, mobile: true },
  { name: "1440", width: 1440, height: 900, mobile: false },
];

// Playwright's fullPage capture resizes the viewport, which inflates 100svh sections.
// Stitch real viewport-sized captures instead so the page renders exactly as a visitor sees it.
async function stitchedFullPage(page, viewport, file) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const tiles = [];
  for (let top = 0; top < height; top += viewport.height) {
    const target = Math.min(top, height - viewport.height);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), target);
    await sleep(1100); // let scroll-triggered reveals finish so tiles show settled content
    const actual = await page.evaluate(() => window.scrollY);
    tiles.push({ input: await page.screenshot({ type: "png" }), top: Math.round(actual), left: 0 });
  }
  await sharp({ create: { width: viewport.width, height, channels: 3, background: "#0a0a0a" } })
    .composite(tiles)
    .jpeg({ quality: 78 })
    .toFile(file);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
}

async function capture(browser, log) {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      isMobile: viewport.mobile,
      hasTouch: viewport.mobile,
    });
    const page = await context.newPage();
    const tag = `[${viewport.name}]`;
    page.on("console", (message) => {
      const text = message.text();
      if (message.type() === "error" || message.type() === "warning" || /hydrat/i.test(text)) {
        log.push({ viewport: viewport.name, type: message.type(), text });
      }
    });
    page.on("pageerror", (error) => log.push({ viewport: viewport.name, type: "pageerror", text: String(error) }));
    page.on("requestfailed", (request) => log.push({ viewport: viewport.name, type: "requestfailed", text: `${request.url()} ${request.failure()?.errorText ?? ""}` }));

    const loadStart = Date.now();
    await page.goto(URL, { waitUntil: "load" });
    for (const [label, at] of [["0.3s", 300], ["1s", 1000], ["2.5s", 2500]]) {
      const wait = at - (Date.now() - loadStart);
      if (wait > 0) await sleep(wait);
      await page.screenshot({ path: path.join(out, `${viewport.name}-load-${label}.jpg`), quality: 80 });
    }
    await sleep(1500);
    await page.screenshot({ path: path.join(out, `${viewport.name}-load-4s-settled.jpg`), quality: 80 });
    console.log(`${tag} load frames done`);

    const total = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    for (let index = 0; index < 8; index += 1) {
      const y = Math.round((total * (index + 1)) / 8);
      await page.mouse.move(viewport.width / 2, viewport.height / 2);
      await page.evaluate((target) => window.scrollTo({ top: target, behavior: "instant" }), y);
      await sleep(260);
      await page.screenshot({ path: path.join(out, `${viewport.name}-scroll-${index + 1}.jpg`), quality: 80 });
    }
    console.log(`${tag} scroll frames done`);

    await stitchedFullPage(page, viewport, path.join(out, `${viewport.name}-full.jpg`));

    if (!viewport.mobile) {
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await sleep(200);
      await page.screenshot({ path: path.join(out, `${viewport.name}-focus.jpg`), quality: 80 });
      await page.evaluate(() => {
        const row = document.querySelector(".project-row");
        if (!row) return;
        window.scrollTo({ top: row.getBoundingClientRect().top + window.scrollY - 200, behavior: "instant" });
        row.open = true;
      });
      await sleep(900);
      const box = await page.evaluate(() => {
        const rect = document.querySelector(".project-row")?.getBoundingClientRect();
        return rect ? { x: 0, y: Math.max(0, rect.top - 40), width: window.innerWidth, height: Math.min(window.innerHeight - Math.max(0, rect.top - 40), rect.height + 80) } : null;
      });
      if (box) await page.screenshot({ path: path.join(out, `${viewport.name}-project-open.jpg`), clip: box, quality: 80 });
    }
    await context.close();
    console.log(`${tag} full page done`);
  }

  const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await reduced.newPage();
  page.on("pageerror", (error) => log.push({ viewport: "1440-reduced", type: "pageerror", text: String(error) }));
  await page.goto(URL, { waitUntil: "load" });
  await sleep(800);
  await page.screenshot({ path: path.join(out, "1440-reduced-motion-load.jpg"), quality: 80 });
  await stitchedFullPage(page, { width: 1440, height: 900 }, path.join(out, "1440-reduced-motion-full.jpg"));
  await reduced.close();
}

// Lighthouse performance is noisy on a dev machine: run it three times and keep the median run.
async function runLighthouse(runs = 3) {
  const results = [];
  for (let index = 0; index < runs; index += 1) results.push(await runLighthouseOnce());
  results.sort((left, right) => left.scores.performance - right.scores.performance);
  const median = results[Math.floor(results.length / 2)];
  median.allPerformanceRuns = results.map((result) => result.scores.performance);
  writeFileSync(path.join(out, "lighthouse.json"), JSON.stringify(median, null, 2));
  return median;
}

async function runLighthouseOnce() {
  const chrome = await chromeLauncher.launch({ chromePath: CHROME, chromeFlags: ["--headless=new", "--no-sandbox"] });
  try {
    const result = await lighthouse(URL, { port: chrome.port, output: "json", logLevel: "error" }, {
      extends: "lighthouse:default",
      settings: { formFactor: "mobile", onlyCategories: ["performance", "accessibility", "best-practices", "seo"] },
    });
    const lhr = result.lhr;
    const scores = Object.fromEntries(Object.entries(lhr.categories).map(([key, value]) => [key, Math.round((value.score ?? 0) * 100)]));
    const metrics = Object.fromEntries(
      ["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "speed-index"]
        .map((id) => [id, lhr.audits[id]?.displayValue]),
    );
    const failing = Object.values(lhr.audits)
      .filter((audit) => audit.score !== null && audit.score < 0.9 && audit.scoreDisplayMode !== "informative" && audit.scoreDisplayMode !== "manual")
      .map((audit) => `${audit.id}: ${audit.title}${audit.displayValue ? ` (${audit.displayValue})` : ""}`);
    const lcpNode = lhr.audits["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node;
    const lcpElement = lcpNode ? `${lcpNode.selector} "${(lcpNode.nodeLabel ?? "").slice(0, 40)}"` : null;
    return { scores, metrics, lcpElement, failing };
  } finally {
    await chrome.kill();
  }
}

let server;
try {
  if (!process.env.REVIEW_SKIP_BUILD) {
    // Clean build: Turbopack's persistent cache once served a stale globals.css to the review.
    rmSync(path.join(root, ".next"), { recursive: true, force: true });
    run("npx next build");
  }
  server = spawn(`npx next start -p ${PORT}`, { cwd: root, shell: true, stdio: ["ignore", "pipe", "pipe"] });
  const serverLog = [];
  server.stdout.on("data", (chunk) => serverLog.push(String(chunk)));
  server.stderr.on("data", (chunk) => serverLog.push(String(chunk)));
  await waitForServer(URL);

  const log = [];
  if (!process.env.REVIEW_LIGHTHOUSE_ONLY) {
    const browser = await chromium.launch({ executablePath: CHROME, headless: true });
    try {
      await capture(browser, log);
    } finally {
      await browser.close();
    }
    writeFileSync(path.join(out, "console.json"), JSON.stringify(log, null, 2));
  }

  const lh = await runLighthouse();
  writeFileSync(path.join(out, "server.log"), serverLog.join(""));
  console.log(`\nReview saved to ${path.relative(root, out)}`);
  console.log(`Console errors/warnings: ${log.length}`);
  console.log("Lighthouse (mobile, median of 3):", lh.scores, lh.metrics, "perf runs:", lh.allPerformanceRuns, "LCP element:", lh.lcpElement);
  if (lh.failing.length) console.log("Failing audits:\n  " + lh.failing.join("\n  "));
} finally {
  stopServer(server);
}
