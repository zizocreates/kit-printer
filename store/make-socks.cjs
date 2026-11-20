// Renders the Kanata FC socks product photo in the same style as store/make-kits.cjs: a pair of red match
// socks on the light grey sweep, original design (a white hoop at the top and the club's K, nothing real).
// 1600 x 1600 PNG. Run: node store/make-socks.cjs   (needs Playwright; font: store/fonts, SIL OFL)
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BODY = "#c8102e", TRIM = "#ffffff", DARK = "#8f0b20";
const font = fs.readFileSync(path.join(__dirname, "fonts", "oswald-latin-700-normal.woff2")).toString("base64");

// One sock seen from the side, toe pointing right: a calf that tapers to the ankle, a rounded heel, the foot.
const SOCK = "M372 120 L508 120 C516 330 520 520 510 690 Q508 732 560 752 L686 792 Q736 808 732 838 Q726 870 680 872 L418 872 Q360 870 356 812 Q352 760 366 700 C356 520 360 330 372 120 Z";
const HEEL = "M360 744 Q352 790 360 830 Q376 870 418 872 L448 872 Q428 832 432 792 Q436 762 452 744 Z";
const TOE = "M664 786 L686 792 Q736 808 732 838 Q726 870 680 872 L656 872 Q676 830 664 786 Z";

function sock(id, dx, dy, tone) {
  return `<g transform="translate(${dx} ${dy})" filter="url(#shadow)">
    <clipPath id="c${id}"><path d="${SOCK}"/></clipPath>
    <g clip-path="url(#c${id})">
      <rect width="1000" height="1000" fill="${BODY}"/>
      <rect width="1000" height="1000" fill="url(#rib)"/>
      <path d="${HEEL}" fill="${DARK}" opacity=".38"/>
      <path d="${TOE}" fill="${DARK}" opacity=".38"/>
      <!-- the turned-down cuff: a white hoop between two red bands -->
      <rect x="300" y="120" width="300" height="96" fill="${BODY}"/>
      <rect x="300" y="146" width="300" height="34" fill="${TRIM}"/>
      <rect x="300" y="120" width="300" height="96" fill="url(#cuffrib)"/>
      <rect x="300" y="212" width="300" height="6" fill="#000" opacity=".22"/>
      <g transform="translate(441 330)" font-family="Kit" font-weight="700" font-size="54" fill="${TRIM}" text-anchor="middle" opacity=".92"><text>K</text></g>
      <rect width="1000" height="1000" fill="url(#round)"/>
      <path d="M520 742 Q560 770 650 790" stroke="#000" stroke-opacity=".18" stroke-width="10" fill="none" filter="url(#soft)"/>
      <rect width="1000" height="1000" fill="url(#mesh)"/>
      <rect width="1000" height="1000" filter="url(#cloth)"/>
      <rect width="1000" height="1000" fill="#000" opacity="${tone}"/>
    </g>
  </g>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1600" height="1600">
  <defs>
    <style>@font-face{font-family:Kit;src:url(data:font/woff2;base64,${font}) format("woff2");font-weight:700}</style>
    <pattern id="rib" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="3.5" height="9" fill="#000" opacity=".06"/></pattern>
    <pattern id="cuffrib" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="2.5" height="6" fill="#000" opacity=".10"/></pattern>
    <pattern id="mesh" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r=".9" fill="#000" opacity=".06"/></pattern>
    <filter id="cloth" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .10 0"/>
    </filter>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#20221f" flood-opacity=".22"/></filter>
    <!-- a tube catches light down its middle and falls away at both edges -->
    <linearGradient id="round" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="translate(356 0) scale(160 1)">
      <stop offset="0" stop-color="#000" stop-opacity=".30"/><stop offset=".35" stop-color="#fff" stop-opacity=".12"/>
      <stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/>
    </linearGradient>
    <radialGradient id="sweep" cx=".5" cy=".42" r=".8"><stop offset="0" stop-color="#fafaf8"/><stop offset="1" stop-color="#e6e6e2"/></radialGradient>
  </defs>
  <rect width="1000" height="1000" fill="url(#sweep)"/>
  ${sock("b", 118, -22, 0.14)}
  ${sock("a", -36, 34, 0)}
</svg>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1600 } });
  await p.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(__dirname, "images", "football-socks.png"), clip: { x: 0, y: 0, width: 1600, height: 1600 } });
  await b.close();
  console.log("Rendered store/images/football-socks.png");
})();
