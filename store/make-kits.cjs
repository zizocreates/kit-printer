// Renders the demo store's kit photos: original designs for made-up clubs, in the "ghost mannequin" style kit
// shops use (the shirt as if worn, with the inside of the back neck showing). Front and back, 1600 x 1600 PNG,
// plus transparent cut-outs of each back for the homepage banner. No real club, brand or sponsor appears.
// Run: node store/make-kits.cjs   (needs Playwright; uses store/fonts/oswald-latin-700-normal.woff2, SIL OFL)
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const KITS = [
  { slug: "kanata-fc-home", initials: "K", body: "#c40d2b", trim: "#ffffff", panel: "#9e0a22", print: "#ffffff", pattern: "plain", back: { name: "SAKA", number: "7" } },
  { slug: "kanata-fc-away", initials: "K", body: "#14284a", trim: "#d6a531", panel: "#0e1d38", print: "#d6a531", pattern: "sash", accent: "#d6a531", back: { name: "RICE", number: "41" } },
  { slug: "rideau-united-home", initials: "RU", body: "#f4f4f1", trim: "#0b5d34", panel: "#0b5d34", print: "#0d2240", pattern: "stripes", accent: "#0b5d34", back: { name: "VAN DIJK", number: "4" } },
  { slug: "capital-city-third", initials: "CC", body: "#108a8c", trim: "#0a3a3b", panel: "#0a3a3b", print: "#ffffff", pattern: "hoops", accent: "#0b4f50", crest: "#ffffff", crestText: "#0a3a3b", back: { name: "O'BRIEN", number: "10" } },
];

// The shirt, worn: sloped shoulders, sleeves angled down, a slightly tapered body and a curved hem (1000 x 1000).
const SHIRT = "M408 148 Q500 212 592 148 L742 186 Q800 205 838 262 L905 418 L792 478 L712 352 Q700 620 690 872 Q500 902 310 872 Q300 620 288 352 L208 478 L95 418 L162 262 Q200 205 258 186 Z";
const SLEEVES = "M258 186 Q200 205 162 262 L95 418 L208 478 L288 352 Q282 270 258 186 Z M742 186 Q800 205 838 262 L905 418 L792 478 L712 352 Q718 270 742 186 Z";
const font = fs.readFileSync(path.join(__dirname, "fonts", "oswald-latin-700-normal.woff2")).toString("base64");

function pattern(k, side) {
  // Striped kits often keep the back plain so the name and number stay readable; this one does.
  if (k.pattern === "stripes" && side === "back") return "";
  if (k.pattern === "stripes") return Array.from({ length: 10 }, (_, i) => `<rect x="${118 + i * 82}" y="0" width="41" height="1000" fill="${k.accent}"/>`).join("");
  if (k.pattern === "hoops") return Array.from({ length: 7 }, (_, i) => `<rect x="0" y="${292 + i * 92}" width="1000" height="46" fill="${k.accent}"/>`).join("");
  if (k.pattern === "sash" && side === "front") return `<polygon points="292,270 392,215 712,812 712,900 640,900" fill="${k.accent}"/>`;
  return "";
}

function svg(k, side, cut = false) {
  const front = side === "front";
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/'/g, "&#39;");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1600" height="1600">
  <defs>
    <style>@font-face{font-family:Kit;src:url(data:font/woff2;base64,${font}) format("woff2");font-weight:700}</style>
    <clipPath id="shirt"><path d="${SHIRT}"/></clipPath>
    <filter id="cloth" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="4" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .14 0"/>
    </filter>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>
    <filter id="softer" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="22"/></filter>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#1b1d1a" flood-opacity=".22"/></filter>
    <filter id="emb" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000" flood-opacity=".35"/></filter>
    <radialGradient id="body" cx=".46" cy=".34" r=".7">
      <stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/>
    </radialGradient>
    <linearGradient id="sides" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity=".30"/><stop offset=".16" stop-color="#000" stop-opacity="0"/>
      <stop offset=".84" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".34"/>
    </linearGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f6f3"/><stop offset="1" stop-color="#e8e8e3"/></linearGradient>
  </defs>
  ${cut ? "" : `<rect width="1000" height="1000" fill="url(#bg)"/>`}
  <g filter="url(#shadow)">
    <g clip-path="url(#shirt)">
      <rect width="1000" height="1000" fill="${k.body}"/>
      ${pattern(k, side)}
      <!-- side panels and cuffs -->
      <path d="M288 352 Q300 620 310 872 L342 874 Q330 620 318 360 Z M712 352 Q700 620 690 872 L658 874 Q670 620 682 360 Z" fill="${k.panel}" opacity=".9"/>
      <path d="M95 418 L208 478 L218 458 L104 398 Z M905 418 L792 478 L782 458 L896 398 Z" fill="${k.trim}"/>
      ${front ? "" : printBack(k, esc)}
      <!-- light and shade -->
      <rect width="1000" height="1000" fill="url(#body)"/>
      <rect width="1000" height="1000" fill="url(#sides)"/>
      <path d="${SLEEVES}" fill="#000" opacity=".10"/>
      <g filter="url(#soft)" fill="none" stroke-linecap="round">
        <path d="M296 380 Q360 440 352 520" stroke="#000" stroke-opacity=".20" stroke-width="18"/>
        <path d="M704 380 Q640 440 648 520" stroke="#000" stroke-opacity=".20" stroke-width="18"/>
        <path d="M330 760 Q420 800 470 870" stroke="#000" stroke-opacity=".12" stroke-width="16"/>
        <path d="M600 770 Q560 820 545 875" stroke="#000" stroke-opacity=".10" stroke-width="14"/>
        <path d="M420 300 Q470 420 455 560" stroke="#fff" stroke-opacity=".10" stroke-width="30"/>
        <path d="M150 300 Q190 360 196 440" stroke="#fff" stroke-opacity=".10" stroke-width="16"/>
      </g>
      <path d="M288 352 Q282 270 258 186 M712 352 Q718 270 742 186" stroke="#000" stroke-opacity=".22" stroke-width="3" fill="none"/>
      <rect width="1000" height="1000" filter="url(#cloth)"/>
    </g>
    ${front ? frontNeck(k) : backNeck(k)}
  </g>
  ${front ? crest(k) : ""}
</svg>`;
}

function frontNeck(k) {
  // The inside of the back neck shows above the front collar, as on a worn shirt.
  return `<path d="M408 148 Q500 116 592 148 Q500 212 408 148 Z" fill="${shade(k.body, -0.45)}"/>
    <path d="M412 147 Q500 121 588 147" fill="none" stroke="${k.trim}" stroke-width="9" opacity=".9"/>
    <path d="M408 148 Q500 212 592 148" fill="none" stroke="${k.trim}" stroke-width="16" stroke-linecap="round"/>
    <path d="M414 156 Q500 214 586 156" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="3"/>`;
}

function backNeck(k) {
  return `<path d="M408 148 Q500 172 592 148" fill="none" stroke="${k.trim}" stroke-width="14" stroke-linecap="round"/>
    <path d="M414 156 Q500 180 586 156" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="3"/>`;
}

function printBack(k, esc) {
  const size = k.back.name.length > 6 ? 54 : 62;
  return `<g font-family="Kit" font-weight="700" fill="${k.print}" text-anchor="middle">
      <text x="500" y="300" font-size="${size}" letter-spacing="7">${esc(k.back.name)}</text>
      <text x="500" y="640" font-size="300">${k.back.number}</text>
    </g>`;
}

function crest(k) {
  const fill = k.crest || k.trim;
  const ink = k.crestText || k.body;
  return `<g transform="translate(598 262)" filter="url(#emb)">
      <path d="M0 0 H64 V40 Q64 78 32 94 Q0 78 0 40 Z" fill="${fill}"/>
      <path d="M6 6 H58 V40 Q58 72 32 86 Q6 72 6 40 Z" fill="none" stroke="${ink}" stroke-width="2.5" opacity=".7"/>
      <text x="32" y="${k.initials.length > 1 ? 52 : 56}" text-anchor="middle" font-family="Kit" font-weight="700" font-size="${k.initials.length > 1 ? 26 : 36}" fill="${ink}">${k.initials}</text>
    </g>
    <g transform="translate(372 272)" opacity=".85"><path d="M0 14 L14 0 L28 14 L14 28 Z" fill="${k.trim}"/></g>`;
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
  }
  await b.close();
  console.log(`Rendered ${KITS.length} kits, front and back, plus cut-outs.`);
})();
