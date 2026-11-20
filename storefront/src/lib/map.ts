// Storefront API responses in, contract types out. Everything defensive: a missing field never crashes a page.
import type { Cart, CartError, CartLine, Img, Kit, Money } from "./types";
import { fromAttributes } from "./print";
import { fromCents, toCents } from "./money";

type Nodes<T> = { nodes?: T[] | null } | null | undefined;
const nodes = <T,>(c: Nodes<T>): T[] => c?.nodes ?? [];

/* eslint-disable @typescript-eslint/no-explicit-any */
const img = (i: any): Img | null =>
  i?.url ? { url: i.url, altText: i.altText ?? null, width: i.width ?? 1600, height: i.height ?? 1600 } : null;

export function toKit(p: any): Kit | null {
  if (!p?.handle) return null;
  const variants = nodes<any>(p.variants).map((v) => ({
    id: v.id,
    title: v.title,
    size: v.selectedOptions?.find((o: any) => /size/i.test(o.name))?.value ?? v.title,
    availableForSale: Boolean(v.availableForSale),
    price: v.price as Money,
  }));
  const currency = variants[0]?.price.currencyCode ?? p.priceRange?.minVariantPrice?.currencyCode ?? "USD";
  const raw = p.printPrice?.value;
  const cents = raw != null && /^\d+(\.\d+)?$/.test(String(raw).trim()) ? toCents(String(Number(raw).toFixed(2))) : 0;
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    vendor: p.vendor ?? "",
    descriptionHtml: p.descriptionHtml ?? "",
    images: nodes<any>(p.images).map(img).filter((x): x is Img => !!x),
    backBlank: img(p.backImage?.reference?.image),
    printPrice: cents > 0 ? fromCents(cents, currency) : null,
    shirtColour: p.shirtColour?.value ?? null,
    printColour: p.printColour?.value ?? null,
    variants,
    priceRange: { min: (p.priceRange?.minVariantPrice as Money) ?? variants[0]?.price ?? fromCents(0, currency) },
  };
}

export function toCart(c: any): Cart | null {
  if (!c?.id) return null;
  const lines: CartLine[] = nodes<any>(c.lines).map((l) => {
    const m = l.merchandise ?? {};
    return {
      id: l.id,
      quantity: l.quantity,
      kit: { handle: m.product?.handle ?? "", title: m.product?.title ?? "", images: nodes<any>(m.product?.images).map(img).filter((x): x is Img => !!x) },
      variant: { id: m.id ?? "", size: m.selectedOptions?.find((o: any) => /size/i.test(o.name))?.value ?? m.title ?? "" },
      print: fromAttributes(l.attributes ?? []),
      unitPrice: l.cost?.amountPerQuantity as Money,
      lineTotal: l.cost?.totalAmount as Money,
    };
  });
  return {
    id: c.id,
    lines,
    subtotal: (c.cost?.subtotalAmount as Money) ?? fromCents(0),
    totalQuantity: c.totalQuantity ?? lines.reduce((n, l) => n + l.quantity, 0),
    checkoutUrl: c.checkoutUrl ?? "",
  };
}

/** userErrors (VALIDATION_CUSTOM from our check, F2) and warnings, as one list. */
export function toErrors(payload: any): CartError[] {
  const errs = [...(payload?.userErrors ?? []), ...(payload?.warnings ?? [])];
  return errs.filter((e) => e?.message).map((e) => ({ code: String(e.code ?? "ERROR"), message: String(e.message) }));
}
