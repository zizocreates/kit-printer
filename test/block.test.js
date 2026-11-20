import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { NAME_KEY, NUMBER_KEY, NAME_MAX } from "../shared/print.js";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const block = read("extensions/kit-printer-block/blocks/kit_printer.liquid");

test("the product page uses exactly the same rules file as the checkout", () => {
  assert.equal(read("extensions/kit-printer-block/assets/print.js"), read("shared/print.js"),
    "shared/print.js changed: run npm run sync");
});

test("the boxes send the attribute names the Functions read", () => {
  assert.ok(block.includes(`name="properties[${NAME_KEY}]"`));
  assert.ok(block.includes(`name="properties[${NUMBER_KEY}]"`));
  for (const f of ["kit-printer-price/src/cart_transform_run.graphql", "kit-printer-check/src/cart_validations_generate_run.graphql"]) {
    const q = read("extensions/" + f);
    assert.ok(q.includes(`attribute(key: "${NAME_KEY}")`) && q.includes(`attribute(key: "${NUMBER_KEY}")`), f);
  }
});

test("the boxes' length limits match the rules", () => {
  assert.ok(block.includes(`maxlength="${NAME_MAX}"`));
  assert.ok(block.includes('maxlength="2"'));
});

test("the block only shows on products with a print price, read from the same metafield as the Functions", () => {
  assert.match(block, /product\.metafields\.kit_printer\.print_price/);
  assert.match(block, /if print_price and print_price > 0/);
  for (const f of ["kit-printer-price/src/cart_transform_run.graphql", "kit-printer-check/src/cart_validations_generate_run.graphql"])
    assert.match(read("extensions/" + f), /metafield\(namespace: "kit_printer", key: "print_price"\)/);
});

test("the block never reads form.id (Shopify's cart form has a field named id that shadows it)", () => {
  const js = read("extensions/kit-printer-block/assets/kit-printer.js").replace(/\/\/.*$/gm, "");
  assert.doesNotMatch(js, /form\.id\b/);
  assert.match(js, /getAttribute\("id"\)/);
});

test("the preview takes the kit's own colours, falling back to the block's settings", () => {
  assert.match(block, /product\.metafields\.kit_printer\.shirt_colour\.value \| default: block\.settings\.shirt_colour/);
  assert.match(block, /product\.metafields\.kit_printer\.print_colour\.value \| default: block\.settings\.ink_colour/);
  assert.match(block, /--kp-shirt: \{\{ shirt_colour \}\}; --kp-ink: \{\{ print_colour \}\}/);
});

test("a long name is squeezed to fit the shirt, and the preview prints in the bundled kit font", () => {
  const js = read("extensions/kit-printer-block/assets/kit-printer.js");
  assert.match(js, /fit\(nameOut, \d+\)/);
  assert.match(js, /lengthAdjust", "spacingAndGlyphs"/);
  assert.match(read("extensions/kit-printer-block/assets/kit-printer.css"), /src: url\(data:font\/woff2;base64,/);
});

test("the block's assets are only file types Shopify accepts (a .woff2 here failed a real deploy)", () => {
  const allowed = /\.(jpe?g|json|js|css|png|svg|wasm)$/;
  const files = readdirSync(new URL("../extensions/kit-printer-block/assets/", import.meta.url));
  assert.ok(files.length > 0);
  for (const f of files) assert.match(f, allowed, f);
});

test("with a blank back photo the preview is the real kit, front and back; without one, a drawn shirt", () => {
  assert.match(block, /product\.metafields\.kit_printer\.back_image\.value/);
  assert.match(block, /data-kp-stage/);
  assert.match(block, /kp__face--front[\s\S]*featured_image[\s\S]*kp__face--back[\s\S]*back_photo/);
  assert.match(block, /\{%- else -%\}[\s\S]*class="kp__shirt"/);
  // the print sits where the product pictures put it, so the preview matches the photos
  const kits = read("store/make-kits.cjs");
  for (const [x, y, size] of [["500", "292", "60"], ["500", "640", "300"]]) {
    assert.ok(kits.includes(`x="${x}" y="${y}" font-size="${size}"`), `make-kits prints at ${y}`);
    assert.ok(block.includes(`x="${x}" y="${y}"`), `block prints at ${y}`);
  }
});
