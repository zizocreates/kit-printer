// The shapes the UI works with. The live Storefront API and the demo backend both map their data into these.

export type Money = { amount: string; currencyCode: string };
export type Img = { url: string; altText: string | null; width: number; height: number };
export type Variant = { id: string; title: string; size: string; availableForSale: boolean; price: Money };
export type Kit = {
  id: string; handle: string; title: string; vendor: string; descriptionHtml: string;
  images: Img[];                 // [0] front, [1] back with a sample print
  backBlank: Img | null;         // metafield kit_printer.back_image (MediaImage)
  printPrice: Money | null;      // metafield kit_printer.print_price; null = can't be printed
  shirtColour: string | null;    // metafield kit_printer.shirt_colour
  printColour: string | null;    // metafield kit_printer.print_colour
  variants: Variant[];           // S, M, L, XL
  priceRange: { min: Money };
};
export type Print = { name: string; number: string };   // already cleaned by shared/print.js
export type CartLine = {
  id: string; quantity: number; kit: Pick<Kit, "handle" | "title" | "images">; variant: Pick<Variant, "id" | "size">;
  print: Print | null;           // from attributes "Print name" / "Print number"
  unitPrice: Money;              // AFTER the Cart Transform: 104.99 for a printed 89.99 kit
  lineTotal: Money;
};
export type Cart = { id: string; lines: CartLine[]; subtotal: Money; totalQuantity: number; checkoutUrl: string };
export type CartError = { code: string; message: string };   // VALIDATION_CUSTOM from our check

/** What a cart change returns: the new cart (or the old one if Shopify refused) and any errors, never a throw. */
export type CartResult = { cart: Cart | null; errors: CartError[] };

/** One source of products and carts: the live Storefront API, or the demo (no token) running the real Function code. */
export interface Backend {
  readonly mode: "live" | "demo";
  getCollection(handle: string): Promise<Kit[]>;
  getKit(handle: string): Promise<Kit | null>;
  getCart(id: string): Promise<Cart | null>;
  addLine(cartId: string | null, line: { variantId: string; quantity: number; print: Print | null }): Promise<CartResult>;
  updateLine(cartId: string, lineId: string, quantity: number): Promise<CartResult>;
  removeLine(cartId: string, lineId: string): Promise<CartResult>;
}
