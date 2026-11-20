// Renders the demo store's kit photos in the style kit makers use for product shots: the shirt on an invisible
// mannequin, front and back, on a light grey sweep. Original designs for made-up clubs: no real crest, kit maker
// or sponsor appears. 1600 x 1600 PNG, plus transparent cut-outs of each back for the homepage banner.
// Run: node store/make-kits.cjs   (needs Playwright; font: store/fonts/oswald-latin-700-normal.woff2, SIL OFL)
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const KITS = [
  { slug: "kanata-fc-home", initials: "K", body: "#c8102e", trim: "#ffffff", rib: "#c8102e", print: "#ffffff", pattern: "plain", back: { name: "SALAH", number: "11" } },
  { slug: "kanata-fc-away", initials: "K", body: "#1d4fa3", trim: "#ffffff", rib: "#0f2f6b", print: "#ffffff", pattern: "plain", back: { name: "RONALDO", number: "7" } },
  { slug: "rideau-united-home", initials: "RU", body: "#f4a7c6", trim: "#111111", rib: "#111111", print: "#111111", pattern: "plain", back: { name: "MESSI", number: "10" } },
  { slug: "capital-city-third", initials: "CC", body: "#f3f1ec", trim: "#13294b", rib: "#13294b", print: "#13294b", pattern: "plain", crest: "#13294b", crestText: "#f3f1ec", back: { name: "SAKA", number: "7" } },
];

// The shirt as worn: square shoulders, short sleeves angled down, a straight body with a slight waist and a
// gently curved hem. `neck` is how low the neckline sits at the centre: low on the front, high on the back.
const shirt = (neck) => `M402 140 Q500 ${neck} 598 140 C650 150 700 158 732 176 L852 392 L764 448 L700 332 C694 420 690 520 690 600 C690 700 694 800 694 880 Q500 900 306 880 C306 800 310 700 310 600 C310 520 306 420 300 332 L236 448 L148 392 L268 176 C300 158 350 150 402 140 Z`;
const SLEEVES = "M268 176 L148 392 L236 448 L300 332 C292 262 282 214 268 176 Z M732 176 L852 392 L764 448 L700 332 C708 262 718 214 732 176 Z";
const CUFFS = "M148 392 L236 448 L244 433 L157 378 Z M852 392 L764 448 L756 433 L843 378 Z";
const font = fs.readFileSync(path.join(__dirname, "fonts", "oswald-latin-700-normal.woff2")).toString("base64");

function pattern(k, side) {
  if (k.pattern === "hoops") return Array.from({ length: 7 }, (_, i) => `<rect x="0" y="${292 + i * 92}" width="1000" height="46" fill="${k.accent}"/>`).join("");
  return "";
}

// A shirt light enough that white highlights would vanish gets a darker weave instead.
const isLight = (hex) => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 200; };

function svg(k, side, cut = false, blank = false) {
  const front = side === "front";
  const outline = shirt(front ? 198 : 160);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1600" height="1600">
  <defs>
    <style>@font-face{font-family:Kit;src:url(data:font/woff2;base64,${font}) format("woff2");font-weight:700}</style>
    <clipPath id="shirt"><path d="${outline}"/></clipPath>
    <!-- the tonal pattern woven into modern match shirts, and the mesh of the fabric -->
    <pattern id="jacquard" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
      <rect width="9" height="22" fill="${isLight(k.body) ? "#000" : "#fff"}" opacity="${isLight(k.body) ? ".02" : ".055"}"/>
    </pattern>
    <pattern id="mesh" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r=".9" fill="#000" opacity=".06"/></pattern>
    <filter id="cloth" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .10 0"/>
    </filter>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10"/></filter>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="26" stdDeviation="26" flood-color="#20221f" flood-opacity=".20"/></filter>
    <filter id="stitch" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-color="#000" flood-opacity=".4"/></filter>
    <radialGradient id="chest" cx=".5" cy=".32" r=".62">
      <stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/>
    </radialGradient>
    <linearGradient id="sides" x1="0" y1="0" x2="1" y2="0">
      <stop offset=".28" stop-color="#000" stop-opacity=".22"/><stop offset=".38" stop-color="#000" stop-opacity="0"/>
      <stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset=".72" stop-color="#000" stop-opacity=".26"/>
    </linearGradient>
    <linearGradient id="hem" x1="0" y1="0" x2="0" y2="1"><stop offset=".75" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
    <radialGradient id="sweep" cx=".5" cy=".42" r=".8"><stop offset="0" stop-color="#fafaf8"/><stop offset="1" stop-color="#e6e6e2"/></radialGradient>
  </defs>
  ${cut ? "" : `<rect width="1000" height="1000" fill="url(#sweep)"/>`}
  <g filter="url(#shadow)">
    <g clip-path="url(#shirt)">
      <rect width="1000" height="1000" fill="${k.body}"/>
      ${pattern(k, side)}
      <rect width="1000" height="1000" fill="url(#jacquard)"/>
      <path d="${CUFFS}" fill="${k.trim}"/>
      <path d="M148 392 L236 448 M852 392 L764 448" stroke="${k.rib}" stroke-width="5" opacity=".7"/>
      ${front || blank ? "" : printBack(k)}
      <!-- light: the chest catches it, the sides and sleeves fall away, creases at the armpits and waist.
           A white shirt shows shadow far more than a coloured one, so it gets half as much. -->
      <g opacity="${isLight(k.body) ? 0.45 : 1}">
      <rect width="1000" height="1000" fill="url(#chest)"/>
      <rect width="1000" height="1000" fill="url(#sides)"/>
      <rect width="1000" height="1000" fill="url(#hem)"/>
      <path d="${SLEEVES}" fill="#000" opacity=".09"/>
      <g filter="url(#soft)" fill="none" stroke-linecap="round">
        <path d="M304 360 Q356 420 350 500" stroke="#000" stroke-opacity=".22" stroke-width="20"/>
        <path d="M696 360 Q644 420 650 500" stroke="#000" stroke-opacity=".22" stroke-width="20"/>
        <path d="M322 610 Q380 640 420 700" stroke="#000" stroke-opacity=".10" stroke-width="18"/>
        <path d="M678 610 Q620 640 580 700" stroke="#000" stroke-opacity=".10" stroke-width="18"/>
        <path d="M430 820 Q470 850 480 885" stroke="#000" stroke-opacity=".10" stroke-width="14"/>
        <path d="M440 260 Q480 400 470 560" stroke="#fff" stroke-opacity=".12" stroke-width="34"/>
        <path d="M196 250 Q220 300 226 380" stroke="#fff" stroke-opacity=".10" stroke-width="18"/>
      </g>
      </g>
      <path d="M300 332 Q292 262 268 176 M700 332 Q708 262 732 176" stroke="#000" stroke-opacity=".25" stroke-width="2.5" fill="none"/>
      <path d="M300 332 Q292 262 268 176 M700 332 Q708 262 732 176" stroke="#fff" stroke-opacity=".12" stroke-width="2" fill="none" transform="translate(3 0)"/>
      <rect width="1000" height="1000" fill="url(#mesh)"/>
      <rect width="1000" height="1000" filter="url(#cloth)"/>
    </g>
    ${front ? frontCollar(k) : backCollar(k)}
  </g>
  ${front ? badges(k) : ""}
</svg>`;
}

// Front: a ribbed crew collar, with the inside of the back neck showing above it, as on a worn shirt.
function frontCollar(k) {
  return `<path d="M402 140 Q500 108 598 140 Q500 198 402 140 Z" fill="${shade(k.body, -0.5)}"/>
    <rect x="484" y="128" width="32" height="12" rx="2" fill="#fff" opacity=".55"/>
    <path d="M404 140 Q500 112 596 140" fill="none" stroke="${k.trim}" stroke-width="10"/>
    <path d="M402 140 Q500 198 598 140" fill="none" stroke="${k.trim}" stroke-width="20" stroke-linejoin="round"/>
    <path d="M405 139 Q500 194 595 139" fill="none" stroke="${k.rib}" stroke-width="3" opacity=".75"/>
    <path d="M410 150 Q500 207 590 150" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="3"/>`;
}

// Back: the same collar, sitting on the shirt's high back neckline.
function backCollar(k) {
  return `<path d="M402 140 Q500 160 598 140" fill="none" stroke="${k.trim}" stroke-width="18"/>
    <path d="M404 138 Q500 157 596 138" fill="none" stroke="${k.rib}" stroke-width="3" opacity=".75"/>
    <path d="M408 150 Q500 170 592 150" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="3"/>`;
}

// Name and number, squeezed to fit between the side seams if the name is long (it never runs off the shirt).
function printBack(k) {
  const name = k.back.name.replace(/&/g, "&amp;").replace(/'/g, "&#39;");
  const fit = k.back.name.length > 8 ? ` textLength="330" lengthAdjust="spacingAndGlyphs"` : "";
  return `<g font-family="Kit" font-weight="700" fill="${k.print}" text-anchor="middle">
      <text x="500" y="292" font-size="60" letter-spacing="8"${fit}>${name}</text>
      <text x="500" y="640" font-size="300">${k.back.number}</text>
    </g>`;
}

// A stitched club crest on the left chest and a small maker's mark on the right, both original.
function badges(k) {
  const fill = k.crest || k.trim;
  const ink = k.crestText || k.body;
  return `<g transform="translate(596 250)" filter="url(#stitch)">
      <path d="M0 0 H66 V42 Q66 80 33 96 Q0 80 0 42 Z" fill="${fill}"/>
      <path d="M5 5 H61 V42 Q61 75 33 89 Q5 75 5 42 Z" fill="none" stroke="${ink}" stroke-width="2" stroke-dasharray="4 3" opacity=".7"/>
      <text x="33" y="${k.initials.length > 1 ? 54 : 58}" text-anchor="middle" font-family="Kit" font-weight="700" font-size="${k.initials.length > 1 ? 26 : 38}" fill="${ink}">${k.initials}</text>
    </g>
    <g transform="translate(366 262)" filter="url(#stitch)"><path d="M0 12 L12 0 L24 12 L12 24 Z" fill="${k.trim}"/></g>`;
}

// Darken (negative) or lighten a #rrggbb colour.
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.round(Math.min(255, Math.max(0, amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
  return "#" + [n >> 16, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, "0")).join("");
}

(async () => {
  const out = path.join(__dirname, "images");
  const cuts = path.join(__dirname, "cutouts");
  fs.mkdirSync(cuts, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1600 } });
  const shot = async (markup, file, transparent = false) => {
    await p.setContent(`<html><body style="margin:0;background:transparent">${markup}</body></html>`);
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: file, clip: { x: 0, y: 0, width: 1600, height: 1600 }, omitBackground: transparent });
  };
  for (const k of KITS) {
    for (const side of ["front", "back"]) await shot(svg(k, side), path.join(out, `${k.slug}-${side}.png`));
    await shot(svg(k, "back", true), path.join(cuts, `${k.slug}-back.png`), true);
    // The back with nothing printed: the product page preview prints the buyer's name on this exact photo.
    await shot(svg(k, "back", false, true), path.join(out, `${k.slug}-back-blank.png`));
  }
  await b.close();
  console.log(`Rendered ${KITS.length} kits: front, back, blank back, and cut-outs.`);
})();
