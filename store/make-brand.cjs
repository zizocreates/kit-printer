// The demo store's banner and wordmark. Uses the kit photos from make-kits.cjs. Run after it.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const img = (f) => "data:image/png;base64," + fs.readFileSync(path.join(__dirname, "cutouts", f)).toString("base64");

const banner = (withText) => `<html><body style="margin:0">
<div style="width:2400px;height:1000px;background:#101010;display:flex;align-items:center;gap:0;overflow:hidden;position:relative;font-family:Arial,sans-serif">
  ${withText ? "" : "<!--"}<div style="position:absolute;left:120px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;z-index:2;color:#fff;width:1080px">
    <div style="font:900 30px Arial;letter-spacing:8px;color:#d4a72c">KITS BY ZIZO</div>
    <div style="font:900 104px/1.02 'Arial Black',Arial;margin-top:28px;letter-spacing:-2px">YOUR NAME.<br>YOUR NUMBER.</div>
    <div style="font:400 38px Arial;margin-top:34px;color:#cfcfcf;max-width:820px">Printed on the back of your kit, checked before you pay.</div>
  </div>${withText ? "" : "-->"}
  <div style="position:absolute;right:10px;top:40px;display:flex">
    ${["kanata-fc-home-back.png", "kanata-fc-away-back.png", "rideau-united-home-back.png"].map((f, i) =>
      `<img src="${img(f)}" style="width:640px;height:640px;margin-left:${i ? -190 : 0}px;margin-top:${[110, 10, 150][i]}px;filter:drop-shadow(0 30px 40px rgba(0,0,0,.55))">`).join("")}
  </div>
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
