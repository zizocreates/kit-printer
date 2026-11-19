// Renders the demo store's kit photos: original designs for made-up clubs, front and back, as PNGs.
// No real club, brand or sponsor appears anywhere. Run: node store/make-kits.cjs  (needs Playwright).
const { chromium } = require("playwright");
const path = require("path");

const KITS = [
  { slug: "kanata-fc-home", club: "Kanata FC", initials: "K", body: "#c8102e", trim: "#ffffff", print: "#ffffff", pattern: "plain", back: { name: "SAKA", number: "7" } },
  { slug: "kanata-fc-away", club: "Kanata FC", initials: "K", body: "#13294b", trim: "#d4a72c", print: "#d4a72c", pattern: "sash", accent: "#d4a72c", back: { name: "RICE", number: "41" } },
  { slug: "rideau-united-home", club: "Rideau United", initials: "RU", body: "#0b6b3a", trim: "#ffffff", print: "#102542", pattern: "stripes", accent: "#ffffff", back: { name: "VAN DIJK", number: "4" } },
  { slug: "capital-city-third", club: "Capital City SC", initials: "CC", body: "#0f8b8d", trim: "#0b3d3e", print: "#ffffff", pattern: "hoops", accent: "#0b3d3e", crest: "#ffffff", crestText: "#0b3d3e", back: { name: "O'BRIEN", number: "10" } },
];

const SHIRT = "M392 150 Q500 205 608 150 L768 196 L912 342 L828 440 L742 372 L742 884 Q500 910 258 884 L258 372 L172 440 L88 342 L232 196 Z";

function pattern(k, side) {
  if (k.pattern === "sash" && side === "back") return ""; // a sash is a front detail; the back stays clear for the print
  if (k.pattern === "stripes") return Array.from({ length: 9 }, (_, i) => `<rect x="${90 + i * 100}" y="100" width="50" height="850" fill="${k.accent}"/>`).join("");
  if (k.pattern === "hoops") return Array.from({ length: 6 }, (_, i) => `<rect x="60" y="${250 + i * 120}" width="900" height="60" fill="${k.accent}"/>`).join("");
  if (k.pattern === "sash") return `<polygon points="250,250 360,180 760,780 760,900 690,900" fill="${k.accent}"/>`;
  return "";
}

function svg(k, side, cut = false) {
  const front = side === "front";
  const neck = front
    ? `<path d="M392 150 Q500 205 608 150" fill="none" stroke="${k.trim}" stroke-width="22" stroke-linecap="round"/>`
    : `<path d="M392 150 Q500 178 608 150" fill="none" stroke="${k.trim}" stroke-width="18" stroke-linecap="round"/>`;
  const crest = front ? `
    <g transform="translate(608 300)">
      <path d="M0 0 H70 V44 Q70 88 35 104 Q0 88 0 44 Z" fill="${k.crest || k.trim}" stroke="rgba(0,0,0,.25)" stroke-width="3"/>
      <text x="35" y="58" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${k.initials.length > 2 ? 22 : k.initials.length > 1 ? 28 : 40}" fill="${k.crestText || k.body}">${k.initials}</text>
    </g>` : "";
  const printed = front ? "" : `
    <text x="500" y="330" text-anchor="middle" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" font-size="64" letter-spacing="6" fill="${k.print}">${k.back.name.replace("'", "&#39;")}</text>
    <text x="500" y="640" text-anchor="middle" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" font-size="300" fill="${k.print}">${k.back.number}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1600" height="1600">
  <defs>
    <clipPath id="c"><path d="${SHIRT}"/></clipPath>
    <linearGradient id="light" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".25" stop-color="#fff" stop-opacity=".10"/>
      <stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/>
    </linearGradient>
    <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/>
    </linearGradient>
    <radialGradient id="bg" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e9eae6"/></radialGradient>
  </defs>
  ${cut ? "" : `<rect width="1000" height="1000" fill="url(#bg)"/>
  <ellipse cx="500" cy="915" rx="270" ry="22" fill="#000" opacity=".10"/>`}
  <g clip-path="url(#c)">
    <rect width="1000" height="1000" fill="${k.body}"/>
    ${pattern(k, side)}
    <path d="M232 196 L88 342 L172 440 L258 372 Z M768 196 L912 342 L828 440 L742 372 Z" fill="#000" opacity=".06"/>
    <line x1="120" y1="372" x2="196" y2="452" stroke="${k.trim}" stroke-width="20"/>
    <line x1="880" y1="372" x2="804" y2="452" stroke="${k.trim}" stroke-width="20"/>
    <rect width="1000" height="1000" fill="url(#light)"/>
    <rect width="1000" height="1000" fill="url(#top)"/>
    <path d="M300 520 Q340 640 310 800 M700 520 Q660 640 690 800" stroke="#000" stroke-opacity=".07" stroke-width="10" fill="none"/>
    ${printed}
  </g>
  <path d="${SHIRT}" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="3"/>
  ${neck}${crest}
</svg>`;
}

(async () => {
  const out = path.join(__dirname, "images");
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1600 } });
  for (const k of KITS) for (const side of ["front", "back"]) {
    await p.setContent(`<html><body style="margin:0">${svg(k, side)}</body></html>`);
    await p.screenshot({ path: path.join(out, `${k.slug}-${side}.png`), clip: { x: 0, y: 0, width: 1600, height: 1600 } });
  }
  // Cut-outs (transparent background) of each back, for the homepage banner.
  for (const k of KITS) {
    await p.setContent(`<html><body style="margin:0;background:transparent">${svg(k, "back", true)}</body></html>`);
    await p.screenshot({ path: path.join(__dirname, "cutouts", `${k.slug}-back.png`), clip: { x: 0, y: 0, width: 1600, height: 1600 }, omitBackground: true });
  }
  await b.close();
  console.log(KITS.map((k) => `${k.club}: ${k.slug}-front.png, ${k.slug}-back.png`).join("\n"));
})();
