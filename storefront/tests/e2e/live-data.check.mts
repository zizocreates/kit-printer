// Local agent check: run the real queries from src/lib against the live store and map them with src/lib/map.ts.
// Not part of the Playwright suite. Run with: npx vite-node tests/e2e/live-data.check.mts
import { COLLECTION, PRODUCT, CART_CREATE, CART_ADD } from "../../src/lib/queries";
import { toKit, toCart, toErrors } from "../../src/lib/map";

const DOMAIN = "kitsbyzizo.myshopify.com";
const TOKEN = "1a4a55990cfd753c1ab4a476b9cac29c";
const VERSION = "2026-10";

async function gql(query: string, variables: Record<string, unknown> = {}) {
  const r = await fetch(`https://${DOMAIN}/api/${VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors) throw new Error("GraphQL errors: " + JSON.stringify(j.errors));
  return j.data;
}

let fails = 0;
const ok = (cond: unknown, label: string, extra = "") => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}${extra ? "  " + extra : ""}`);
  if (!cond) fails++;
};

// 1. The collection, through Claude's query and mapper
const col = await gql(COLLECTION, { handle: "kits" });
const kits = col.collection.products.nodes.map(toKit).filter(Boolean);
ok(kits.length === 4, "collection maps to 4 kits", `got ${kits.length}`);
for (const k of kits) {
  ok(k.images.length >= 2, `${k.handle}: 2+ images`, `got ${k.images.length}`);
  ok(!!k.backBlank, `${k.handle}: backBlank resolved`, k.backBlank ? "" : "null");
  ok(k.printPrice?.amount === "15.00", `${k.handle}: printPrice is 15.00`, `got ${k.printPrice?.amount}`);
  ok(k.variants.length === 4 && k.variants.every((v) => /^(S|M|L|XL)$/.test(v.size)),
    `${k.handle}: 4 sizes map to S/M/L/XL`, k.variants.map((v) => v.size).join(","));
  ok(!!k.shirtColour && !!k.printColour, `${k.handle}: colours present`, `${k.shirtColour} / ${k.printColour}`);
}

// 2. The socks: cannot be printed, and the no-images case
const socksRaw = await gql(PRODUCT, { handle: "football-socks" });
const socks = toKit(socksRaw.product)!;
ok(socks.printPrice === null, "socks: printPrice is null (no Personalize)");
ok(socks.images.length === 0, "socks: zero images (needs art or a placeholder)", `got ${socks.images.length}`);

// 3. A real cart: the Cart Transform through Claude's mapper
const away = kits.find((k) => k.handle === "kanata-fc-away-kit")!;
const m = away.variants.find((v) => v.size === "M")!;
const created = await gql(CART_CREATE, {
  lines: [{ merchandiseId: m.id, quantity: 1, attributes: [{ key: "Print name", value: "SAKA" }, { key: "Print number", value: "7" }] }],
});
const cart = toCart(created.cartCreate.cart)!;
ok(toErrors(created.cartCreate).length === 0, "cartCreate: no errors");
ok(cart.lines[0].unitPrice.amount === "104.99", "cart line unitPrice is 104.99 (Cart Transform)", `got ${cart.lines[0].unitPrice.amount}`);
ok(cart.lines[0].print?.name === "SAKA" && cart.lines[0].print?.number === "7", "print maps from attributes", JSON.stringify(cart.lines[0].print));
ok(cart.lines[0].variant.size === "M", "cart line size maps", cart.lines[0].variant.size);
ok(cart.lines[0].kit.images.length > 0, "cart line has a thumbnail", `got ${cart.lines[0].kit.images.length}`);
ok(cart.checkoutUrl.startsWith("https://"), "cart has a checkoutUrl");

// 4. A refusal: cart null, errors mapped, previous cart must survive
const refused = await gql(CART_ADD, {
  id: cart.id,
  lines: [{ merchandiseId: m.id, quantity: 1, attributes: [{ key: "Print name", value: "RONALDO" }, { key: "Print number", value: "100" }] }],
});
const errs = toErrors(refused.cartLinesAdd);
ok(refused.cartLinesAdd.cart === null, "refusal: Shopify returns a null cart");
ok(toCart(refused.cartLinesAdd.cart) === null, "refusal: toCart(null) is null, so the provider keeps the old cart");
ok(errs.length === 1 && errs[0].code === "VALIDATION_CUSTOM", "refusal: VALIDATION_CUSTOM mapped", JSON.stringify(errs));
ok(errs[0]?.message === "Kanata FC Away Kit 26/27: Numbers go from 1 to 99.", "refusal: message word for word", errs[0]?.message);

console.log(fails === 0 ? "\nALL LIVE CHECKS PASSED" : `\n${fails} LIVE CHECK(S) FAILED`);
process.exit(fails === 0 ? 0 : 1);
