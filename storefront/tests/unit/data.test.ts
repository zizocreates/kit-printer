import { describe, expect, it } from "vitest";
import { add, format, fromCents, toCents } from "../../src/lib/money";
import { fromAttributes, toAttributes, check } from "../../src/lib/print";
import { toCart, toErrors, toKit } from "../../src/lib/map";
import { demoBackend } from "../../src/demo/backend";
import { DEMO_KITS } from "../../src/demo/catalog";

describe("money", () => {
  it("adds in whole cents", () => {
    expect(add({ amount: "89.99", currencyCode: "USD" }, { amount: "15.00", currencyCode: "USD" }).amount).toBe("104.99");
    expect(toCents("15.0")).toBe(1500);
    expect(fromCents(31497).amount).toBe("314.97");
    expect(format({ amount: "104.99", currencyCode: "USD" })).toBe("$104.99");
  });
});

describe("print attributes (what our Functions read)", () => {
  it("round-trips a print through cart line attributes", () => {
    const attrs = toAttributes({ name: "RONALDO", number: "7" });
    expect(attrs).toEqual([{ key: "Print name", value: "RONALDO" }, { key: "Print number", value: "7" }]);
    expect(fromAttributes(attrs)).toEqual({ name: "RONALDO", number: "7" });
    expect(toAttributes(null)).toEqual([]);
    expect(fromAttributes([])).toBeNull();
  });
  it("uses the shared rules: the field at fault is named", () => {
    expect(check("ronaldo", "7").ok).toBe(true);
    expect(check("SAKA", "100").field).toBe("number");
  });
});

describe("mapping Storefront API responses", () => {
  it("maps a product with its Kit Printer metafields", () => {
    const kit = toKit({
      id: "gid://shopify/Product/1", handle: "away", title: "Away", vendor: "Kanata FC", descriptionHtml: "<p>x</p>",
      images: { nodes: [{ url: "https://cdn.shopify.com/a.png", altText: "front", width: 1600, height: 1600 }] },
      variants: { nodes: [{ id: "v1", title: "M", availableForSale: true, selectedOptions: [{ name: "Size", value: "M" }], price: { amount: "89.99", currencyCode: "USD" } }] },
      priceRange: { minVariantPrice: { amount: "89.99", currencyCode: "USD" } },
      printPrice: { value: "15.0" }, shirtColour: { value: "#1d4fa3" }, printColour: { value: "#ffffff" },
      backImage: { reference: { image: { url: "https://cdn.shopify.com/b.png", altText: null, width: 1600, height: 1600 } } },
    })!;
    expect(kit.printPrice).toEqual({ amount: "15.00", currencyCode: "USD" });
    expect(kit.backBlank?.url).toBe("https://cdn.shopify.com/b.png");
    expect(kit.variants[0].size).toBe("M");
  });
  it("a product without a print price can't be printed", () => {
    expect(toKit({ id: "x", handle: "socks", title: "Socks", variants: { nodes: [] }, printPrice: null })!.printPrice).toBeNull();
  });
  it("maps cart lines with their print and the price after the Cart Transform", () => {
    const cart = toCart({
      id: "c1", checkoutUrl: "https://x/cart/c/1", totalQuantity: 1, cost: { subtotalAmount: { amount: "104.99", currencyCode: "USD" } },
      lines: { nodes: [{ id: "l1", quantity: 1, attributes: [{ key: "Print name", value: "SAKA" }, { key: "Print number", value: "7" }],
        cost: { amountPerQuantity: { amount: "104.99", currencyCode: "USD" }, totalAmount: { amount: "104.99", currencyCode: "USD" } },
        merchandise: { id: "v1", title: "M", selectedOptions: [{ name: "Size", value: "M" }], product: { handle: "away", title: "Away", images: { nodes: [] } } } }] },
    })!;
    expect(cart.lines[0].print).toEqual({ name: "SAKA", number: "7" });
    expect(cart.lines[0].unitPrice.amount).toBe("104.99");
  });
  it("collects VALIDATION_CUSTOM errors from userErrors", () => {
    expect(toErrors({ userErrors: [{ code: "VALIDATION_CUSTOM", message: "Away: Numbers go from 1 to 99." }], warnings: [] }))
      .toEqual([{ code: "VALIDATION_CUSTOM", message: "Away: Numbers go from 1 to 99." }]);
  });
});

describe("demo mode runs the real Functions", () => {
  const away = DEMO_KITS.find((k) => k.handle === "kanata-fc-away-kit")!;
  const m = away.variants.find((v) => v.size === "M")!.id;

  it("prices a printed kit at $104.99 and a plain one at $89.99", async () => {
    const printed = await demoBackend.addLine(null, { variantId: m, quantity: 1, print: { name: "RONALDO", number: "7" } });
    expect(printed.errors).toEqual([]);
    expect(printed.cart!.lines[0].unitPrice.amount).toBe("104.99");
    const plain = await demoBackend.addLine(printed.cart!.id, { variantId: m, quantity: 1, print: null });
    expect(plain.cart!.lines[1].unitPrice.amount).toBe("89.99");
    expect(plain.cart!.subtotal.amount).toBe("194.98");
  });

  it("three printed shirts cost three times $104.99", async () => {
    const r = await demoBackend.addLine(null, { variantId: m, quantity: 3, print: { name: "SAKA", number: "7" } });
    expect(r.cart!.subtotal.amount).toBe("314.97");
  });

  it("refuses number 100 with the Function's own message, and keeps the cart as it was", async () => {
    const ok = await demoBackend.addLine(null, { variantId: m, quantity: 1, print: null });
    const bad = await demoBackend.addLine(ok.cart!.id, { variantId: m, quantity: 1, print: { name: "SAKA", number: "100" } });
    expect(bad.errors[0]).toEqual({ code: "VALIDATION_CUSTOM", message: "Kanata FC Away Kit 26/27: Numbers go from 1 to 99." });
    expect(bad.cart!.lines).toHaveLength(1);
  });

  it("refuses a print on socks", async () => {
    const socks = (await demoBackend.getKit("football-socks"))!;
    const r = await demoBackend.addLine(null, { variantId: socks.variants[0].id, quantity: 1, print: { name: "SAKA", number: "7" } });
    expect(r.errors[0].message).toMatch(/can't be printed/);
  });
});
