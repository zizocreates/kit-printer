// Copies the print rules into the theme block, so the product page and the checkout use the same file.
// Run after any change to shared/print.js: npm run sync. A test fails if the two drift apart.
import { copyFileSync } from "node:fs";
copyFileSync(new URL("../shared/print.js", import.meta.url), new URL("../extensions/kit-printer-block/assets/print.js", import.meta.url));
console.log("Copied shared/print.js into the theme block.");
