import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

type Dot = { x: number; y: number; brightness: number };

const root = process.cwd();
const input = path.join(root, "public", "portrait-cutout.png");
const output = path.join(root, "public", "portrait-dots.json");
const preview = path.join(root, "public", "portrait-source.png");
const width = 720;
const height = 820;

const prepared = sharp(input)
  .extract({ left: 88, top: 72, width: 784, height: 900 })
  .resize(width, height, { fit: "contain", position: "centre", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .greyscale()
  .linear(1.34, -26)
  .ensureAlpha();

// Fade the shirt below the chin so the face, not the T-shirt, is the brightest region.
const SHIRT_START = 0.73;
const SHIRT_FADE = 0.55;

await prepared.clone().png().toFile(preview);
const { data, info } = await prepared.raw().toBuffer({ resolveWithObject: true });

function sample(step: number): Dot[] {
  const dots: Dot[] = [];
  for (let y = step / 2; y < info.height; y += step) {
    for (let x = step / 2; x < info.width; x += step) {
      const px = Math.min(info.width - 1, Math.round(x));
      const py = Math.min(info.height - 1, Math.round(y));
      const index = (py * info.width + px) * info.channels;
      // sharp may return a single premultiplied grey channel; only read alpha when it exists.
      const alpha = info.channels > 1 ? data[index + info.channels - 1] / 255 : 1;
      if (alpha < 0.12) continue;
      const raw = Math.max(0, Math.min(1, data[index] / 255));
      const fade = 1 - Math.max(0, Math.min(1, (y / info.height - SHIRT_START) / (1 - SHIRT_START))) * SHIRT_FADE;
      const brightness = raw * fade;
      if (brightness < 0.035) continue;
      dots.push({
        x: Number((x / info.width).toFixed(5)),
        y: Number((y / info.height).toFixed(5)),
        brightness: Number((brightness * alpha).toFixed(4)),
      });
    }
  }
  return dots;
}

function closestSample(target: number): Dot[] {
  let best: Dot[] = [];
  let bestDelta = Number.POSITIVE_INFINITY;
  for (let step = 4; step <= 22; step += 0.25) {
    const current = sample(step);
    const delta = Math.abs(current.length - target);
    if (delta < bestDelta) {
      best = current;
      bestDelta = delta;
    }
  }
  return best;
}

const desktop = closestSample(6000);
const mobile = closestSample(2500);
const payload = {
  width,
  height,
  source: "portrait-cutout.png",
  desktop,
  mobile,
};

await writeFile(output, JSON.stringify(payload));
console.log(`portrait-dots.json: ${desktop.length} desktop dots, ${mobile.length} mobile dots`);

