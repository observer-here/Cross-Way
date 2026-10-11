import { Jimp } from "jimp";
import path from "node:path";

const src = process.argv[2];
const dest = process.argv[3];
const img = await Jimp.read(src);
img.scan((x, y, idx) => {
  const r = img.bitmap.data[idx];
  const g = img.bitmap.data[idx + 1];
  const b = img.bitmap.data[idx + 2];
  const m = Math.max(r, g, b);
  if (m < 20) img.bitmap.data[idx + 3] = 0;
  else if (m < 42) img.bitmap.data[idx + 3] = Math.round(((m - 20) / 22) * 255);
});

let minX = img.bitmap.width,
  minY = img.bitmap.height,
  maxX = 0,
  maxY = 0;
img.scan((x, y, idx) => {
  if (img.bitmap.data[idx + 3] < 12) return;
  if (x < minX) minX = x;
  if (y < minY) minY = y;
  if (x > maxX) maxX = x;
  if (y > maxY) maxY = y;
});
const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.08);
const x = Math.max(0, minX - pad);
const y = Math.max(0, minY - pad);
const w = Math.min(img.bitmap.width - x, maxX - minX + 1 + pad * 2);
const h = Math.min(img.bitmap.height - y, maxY - minY + 1 + pad * 2);
img.crop({ x, y, w, h });
await img.write(dest);
console.log(path.basename(dest), w, h);
