// The mappers against REAL Storefront API responses captured from the kitsbyzizo store (src/fixtures).
import { describe, expect, it } from "vitest";
import { toCart, toErrors, toKit } from "../../src/lib/map";
import collection from "../../src/fixtures/collection.json";
import away from "../../src/fixtures/product-kanata-fc-away-kit.json";
import socks from "../../src/fixtures/product-football-socks.json";
import twoLines from "../../src/fixtures/cart-two-lines.json";
import errNumber from "../../src/fixtures/cart-error-number.json";
import errSocks from "../../src/fixtures/cart-error-socks.json";

/* eslint-disable @typescript-eslint/no-explicit-any */
const payload = (j: any) => Object.values(j.data)[0] as any;

describe("real store responses", () => {
  it("the kits collection maps to 4 printable kits with a blank back", () => {
    const kits = (collection as any).data.collection.products.nodes.map(toKit);
    expect(kits).toHaveLength(4);
    for (const k of kits) {
      expect(k.printPrice?.amount).toMatch(/^15\.0+$/);
      expect(k.backBlank?.url).toMatch(/^https:/);
      expect(k.variants.map((v: any) => v.size)).toEqual(["S", "M", "L", "XL"]);
    }
  });

  it("a kit and the socks: the socks have a photo now, and still can't be printed", () => {
    expect(toKit((away as any).data.product)?.priceRange.min.amount).toMatch(/^89\.99/);
    const s = toKit((socks as any).data.product)!;
    expect(s.printPrice).toBeNull();
    // The photo was uploaded to the real product on 20 Nov, so the fixture carries it now. The NoPhoto
    // placeholder still matters: it is what any future product without a photo gets.
    expect(s.images).toHaveLength(1);
    expect(s.images[0].altText).toBe("Kanata FC red match socks");
  });

  it("a real two-line cart keeps the Function's printed price and the print", () => {
    const cart = toCart((twoLines as any).data.cart)!;
    const printed = cart.lines.find((l) => l.print)!;
    expect(printed.unitPrice.amount).toMatch(/^104\.99/);
    expect(printed.print?.name).toBeTruthy();
  });

  it("refusals come back as no cart plus Shopify's own words", () => {
    for (const [fx, text] of [[errNumber, "Numbers go from 1 to 99."], [errSocks, "can't be printed"]] as const) {
      const p = payload(fx);
      expect(toCart(p.cart)).toBeNull();
      const errors = toErrors(p);
      expect(errors[0].code).toBe("VALIDATION_CUSTOM");
      expect(errors[0].message).toContain(text);
    }
  });
});
