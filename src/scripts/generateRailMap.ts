/**
 * One-off renderer for `public/rail-map.jpg`, the static base of the rail map.
 *
 * Not part of the app bundle and not run by `next build`; it exists so the map
 * is generated, not hand-painted. Run it from the project root with Node 26+:
 *
 *   node src/scripts/generateRailMap.ts
 *
 * (Node's built-in type stripping needs explicit `.ts` import paths, so this
 * file spells them out. The app never imports this module.)
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { COASTLINE, HUBS, LINKS } from "../lib/railMap.ts";

const WIDTH = 1920;
const HEIGHT = 1080;
const FRAME_WIDTH = 1200;
const FRAME_HEIGHT = 1252;

/**
 * The app shows the result with `object-cover`, which crops the tall frame on
 * wide screens and the wide frame on phones. This mirrors that same cover
 * transform, so the same atlas geography lands where the viewport shows it.
 *
 * `centreX`/`centreY` pin the frame's centre to a province; `padding` is the
 * share of the viewport kept clear around it. On wide screens the atlas is
 * wider than the frame (it was built for phones), so the whole web fits; on
 * phones the frame's full width is kept and the north/south edges crop.
 */
function coverTransform(
  viewWidth: number,
  viewHeight: number,
  centreX: number,
  centreY: number,
  padding: number,
) {
  const scale = Math.max(
    (viewWidth * (1 - padding * 2)) / FRAME_WIDTH,
    (viewHeight * (1 - padding * 2)) / FRAME_HEIGHT,
  );
  return {
    scale,
    offsetX: centreX * viewWidth - (FRAME_WIDTH * scale) / 2,
    offsetY: centreY * viewHeight - (FRAME_HEIGHT * scale) / 2,
  };
}

/** Wide screens: the whole web, Berlin at the optical centre. */
const RASTER = coverTransform(WIDTH, HEIGHT, 0.562, 0.402, 0.04);

/** Phones: frame width first, dock at the bottom of the glass. */
const PHONE = coverTransform(390, 844, 0.562, 0.402, 0.05);

/**
 * City labels, hand-tuned. Their x/y are the city's *screen* position (share
 * of viewport width/height) at phone size; the label anchor lands beside the
 * hub dot at that same transform, so ink and dot cannot drift apart.
 */
const LABELS: ReadonlyArray<{
  city: string;
  x: number;
  y: number;
  anchor: "start" | "end";
}> = [
  { city: "Amsterdam", x: 0.335, y: 0.33, anchor: "end" },
  { city: "Hamburg", x: 0.5, y: 0.29, anchor: "start" },
  { city: "Berlin", x: 0.67, y: 0.345, anchor: "start" },
  { city: "Köln", x: 0.44, y: 0.4, anchor: "end" },
  { city: "Frankfurt", x: 0.545, y: 0.445, anchor: "start" },
  { city: "München", x: 0.68, y: 0.535, anchor: "start" },
  { city: "Wien", x: 0.82, y: 0.5, anchor: "start" },
];

function buildSvg() {
  const land = `<path d="${COASTLINE}" fill="#04070A"/>`;
  const outline = `<path d="${COASTLINE}" fill="none" stroke="#0F2733" stroke-width="1.2" stroke-linejoin="round"/>`;

  const links = (
    tier: "regional" | "trunk",
    stroke: string,
    width: number,
    opacity: number,
  ) =>
    LINKS.filter((link) => link.tier === tier)
      .map(
        (link) =>
          `<path d="${link.d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" opacity="${opacity}"/>`,
      )
      .join("");

  // Halos first so each crisp core sits on top of its own bloom.
  const halos = [
    links("regional", "#0C8F60", 4.5, 0.55),
    links("trunk", "#22E37B", 6.5, 0.6),
  ].join("");
  const cores = [
    links("regional", "#16875F", 1.5, 0.9),
    links("trunk", "#5CF2A2", 2.5, 1),
  ].join("");

  const hubs = HUBS.map((hub) => {
    const x = hub.x * RASTER.scale + RASTER.offsetX;
    const y = hub.y * RASTER.scale + RASTER.offsetY;
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${RASTER.scale})">
      <circle r="11" fill="#1DB954" opacity="0.1"/>
      <circle r="3" fill="#C9FFE0"/>
    </g>`;
  }).join("");

  // Screen position (phone crop) → frame position through the raster crop.
  const labels = LABELS.map(({ city, x, y, anchor }) => {
    const hub = HUBS.find((candidate) => candidate.name === city);
    if (!hub) throw new Error(`Unknown hub in LABELS: ${city}`);
    const frameX = (x * 390 - PHONE.offsetX) / PHONE.scale;
    const frameY = (y * 844 - PHONE.offsetY) / PHONE.scale;
    const gap = 9;
    const lx =
      hub.x * RASTER.scale +
      RASTER.offsetX +
      (frameX - hub.x) * RASTER.scale +
      (anchor === "start" ? gap : -gap);
    const ly =
      hub.y * RASTER.scale +
      RASTER.offsetY +
      (frameY - hub.y) * RASTER.scale +
      4;
    return `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" font-family="Helvetica, Arial, sans-serif" font-size="13" letter-spacing="2.6" fill="#A9F5CB" opacity="0.34">${city.toUpperCase()}</text>`;
  }).join("");

  // Everything is drawn in frame space; one transform applies the cover crop.
  const paint = `<g transform="translate(${RASTER.offsetX.toFixed(1)} ${RASTER.offsetY.toFixed(1)}) scale(${RASTER.scale})">
    ${land}
    ${outline}
    <g fill="none" filter="url(#soft)">${halos}</g>
    <g fill="none">${cores}</g>
    ${hubs}
  </g>
  ${labels}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <defs>
      <radialGradient id="sea" cx="50%" cy="38%" r="78%">
        <stop offset="0%" stop-color="#081019"/>
        <stop offset="100%" stop-color="#04070A"/>
      </radialGradient>
      <radialGradient id="focus" cx="50%" cy="36%" r="62%">
        <stop offset="0%" stop-color="#0A2A24" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#0A2A24" stop-opacity="0"/>
      </radialGradient>
      <filter id="soft" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="2.4"/>
      </filter>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sea)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#focus)"/>
    ${paint}
  </svg>`;
}

// 4:4:4 keeps the thin emerald lines from smearing into blocks, which matters
// once a pink overlay recolours them in Tinder Mode.
const jpeg = await sharp(Buffer.from(buildSvg()))
  .jpeg({
    quality: 80,
    mozjpeg: true,
    progressive: true,
    chromaSubsampling: "4:4:4",
  })
  .toBuffer();

const outPath = path.join(process.cwd(), "public", "rail-map.jpg");
await writeFile(outPath, jpeg);
console.log(
  `rail-map.jpg written (${Math.round(jpeg.length / 1024)} kB, ${WIDTH}x${HEIGHT})`,
);
