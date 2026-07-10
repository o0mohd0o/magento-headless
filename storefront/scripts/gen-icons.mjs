// Generates the PWA icon set for the Luma·headless storefront.
// Brand: indigo #4f46e5 bg, white geometric "L" + indigo-200 dot (the "Luma·" mark).
// Run from storefront/: node scripts/gen-icons.mjs
//
// sharp is not a declared dependency — it resolves via next's optionalDependencies.
// If the import fails, run: npm install --no-save sharp
let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("sharp is not installed. Run: npm install --no-save sharp");
  process.exit(1);
}
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const ICONS_DIR = "public/icons";
const APPLE_DIR = "src/app"; // apple-icon.png is a Next metadata file convention
mkdirSync(ICONS_DIR, { recursive: true });

// Glyph centered in a 512 viewBox: spans x 146..366, y 148..364 (center 256,256)
const GLYPH = `
  <g>
    <rect x="146" y="148" width="58" height="216" rx="8" fill="#ffffff"/>
    <rect x="146" y="306" width="150" height="58" rx="8" fill="#ffffff"/>
    <circle cx="336" cy="335" r="30" fill="#c7d2fe"/>
  </g>`;

// "any" icon: rounded-square indigo tile
const anySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#4f46e5"/>${GLYPH}
</svg>`;

// "maskable": full-bleed bg, glyph scaled to the 80% safe zone
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#4f46e5"/>
  <g transform="translate(51.2,51.2) scale(0.8)">${GLYPH}</g>
</svg>`;

// apple-touch: full-bleed (iOS masks its own corners)
const appleSvg = maskableSvg;

const jobs = [
  [anySvg, 512, join(ICONS_DIR, "icon-512.png")],
  [anySvg, 192, join(ICONS_DIR, "icon-192.png")],
  [maskableSvg, 512, join(ICONS_DIR, "icon-512-maskable.png")],
  [maskableSvg, 192, join(ICONS_DIR, "icon-192-maskable.png")],
  [appleSvg, 180, join(APPLE_DIR, "apple-icon.png")],
];

for (const [svg, size, outPath] of jobs) {
  await sharp(Buffer.from(svg), { density: 300 })
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log("wrote", outPath, size + "x" + size);
}
