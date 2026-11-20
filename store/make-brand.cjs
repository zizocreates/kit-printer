// The demo store's banner and wordmark. Uses the kit photos from make-kits.cjs. Run after it.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const img = (f) => "data:image/png;base64," + fs.readFileSync(path.join(__dirname, "cutouts", f)).toString("base64");

const banner = (withText) => `<html><body style="margin:0">
<div style="width:2400px;height:1000px;background:radial-gradient(ellipse at 68% 45%,#2a2a2a 0%,#141414 55%,#0b0b0b 100%);position:relative;overflow:hidden;font-family:Arial,sans-serif">
  ${withText ? "" : "<!--"}<div style="position:absolute;left:110px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;z-index:2;color:#fff;width:900px">
    <div style="font:700 30px Arial;letter-spacing:9px;color:#e8e8e8;opacity:.75">KITS BY ZIZO</div>
    <div style="font:900 112px/1 'Arial Black',Arial;margin-top:26px;letter-spacing:-2px">YOUR NAME.<br>YOUR NUMBER.</div>
    <div style="font:400 38px/1.35 Arial;margin-top:32px;color:#cfcfcf;max-width:760px">Printed on the back of your kit, and checked before you pay.</div>
  </div>${withText ? "" : "-->"}
  ${[["kanata-fc-away-back.png", 900, -40, 1], ["rideau-united-home-back.png", 1330, 70, 3], ["kanata-fc-home-back.png", 1700, -20, 2]].map(([f, x, y, z]) =>
    `<img src="${img(f)}" style="position:absolute;left:${x}px;top:${y}px;width:${z === 3 ? 980 : 900}px;height:${z === 3 ? 980 : 900}px;z-index:${z};filter:drop-shadow(0 40px 50px rgba(0,0,0,.55))">`).join("")}
</div></body></html>`;

const logo = `<html><body style="margin:0;background:transparent">
<div id="l" style="display:inline-flex;align-items:baseline;padding:10px 6px;font:900 96px 'Arial Black',Arial;letter-spacing:-1px;color:#101010">KITS<span style="font:700 52px Arial;margin:0 14px;color:#c8102e">by</span>ZIZO</div>
</body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2400, height: 1000 } });
  await p.goto("about:blank"); await p.setContent(banner(true), { waitUntil: "load" });
  await p.screenshot({ path: path.join(__dirname, "images", "banner.png") });
  await p.setContent(banner(false), { waitUntil: "load" });
  await p.screenshot({ path: path.join(__dirname, "images", "banner-plain.png") });
  await p.setViewportSize({ width: 900, height: 200 });
  await p.setContent(logo);
  await (await p.$("#l")).screenshot({ path: path.join(__dirname, "images", "logo.png"), omitBackground: true });
  await b.close();
  console.log("banner.png, logo.png");
})();
