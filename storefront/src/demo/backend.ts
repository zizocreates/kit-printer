// Demo backend: no network. It doesn't imitate Kit Printer: it runs the REAL Function code (the same files Shopify
// runs in checkout) on an in-memory cart, so the price and the check behave exactly as they do on the live store.
import { cartTransformRun } from "@kit-printer/price";
import { cartValidationsGenerateRun } from "@kit-printer/check";
import { DEMO_KITS, DEMO_SOCKS } from "./catalog";
import { fromCents, toCents } from "../lib/money";
import type { Backend, Cart, CartLine, CartResult, Kit, Print } from "../lib/types";

type Row = { id: string; variantId: string; quantity: number; print: Print | null };
const ALL = [...DEMO_KITS, DEMO_SOCKS];
const carts = new Map<string, Row[]>();
let seq = 0;

function find(variantId: string): { kit: Kit; size: string; price: string } | null {
  for (const kit of ALL) {
    const v = kit.variants.find((x) => x.id === variantId);
    if (v) return { kit, size: v.size, price: v.price.amount };
  }
  return null;
}

// Build the same input our Functions receive from Shopify (their GraphQL input queries).
function functionInput(rows: Row[]) {
  return {
    cart: {
      lines: rows.map((r) => {
        const f = find(r.variantId)!;
        return {
          id: r.id,
          cost: { amountPerQuantity: { amount: f.price, currencyCode: "USD" } },
          printName: r.print?.name ? { value: r.print.name } : null,
          printNumber: r.print?.number ? { value: r.print.number } : null,
          merchandise: { __typename: "ProductVariant", product: { title: f.kit.title, printPrice: f.kit.printPrice ? { value: f.kit.printPrice.amount } : null } },
        };
      }),
    },
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function errorsFor(rows: Row[]) {
  const out: any = cartValidationsGenerateRun(functionInput(rows));
  const errs: { message: string }[] = out?.operations?.[0]?.validationAdd?.errors ?? [];
  return errs.map((e) => ({ code: "VALIDATION_CUSTOM", message: e.message }));
}

function toCart(id: string, rows: Row[]): Cart {
  const ops: any[] = (cartTransformRun(functionInput(rows)) as any).operations ?? [];
  const override = new Map<string, string>();
  for (const op of ops) {
    const u = op.lineUpdate ?? op.update;
    if (u) override.set(u.cartLineId, u.price.adjustment.fixedPricePerUnit.amount);
  }
  let subtotal = 0;
  const lines: CartLine[] = rows.map((r) => {
    const f = find(r.variantId)!;
    const unit = toCents(override.get(r.id) ?? f.price);
    subtotal += unit * r.quantity;
    return {
      id: r.id, quantity: r.quantity,
      kit: { handle: f.kit.handle, title: f.kit.title, images: f.kit.images },
      variant: { id: r.variantId, size: f.size },
      print: r.print, unitPrice: fromCents(unit), lineTotal: fromCents(unit * r.quantity),
    };
  });
  return { id, lines, subtotal: fromCents(subtotal), totalQuantity: rows.reduce((n, r) => n + r.quantity, 0), checkoutUrl: "" };
}

// Shopify refuses the whole change when the check fails (F2); the cart stays as it was.
function commit(id: string, next: Row[]): CartResult {
  const errors = errorsFor(next);
  if (errors.length) return { cart: carts.has(id) ? toCart(id, carts.get(id)!) : null, errors };
  carts.set(id, next);
  return { cart: toCart(id, next), errors: [] };
}

export const demoBackend: Backend = {
  mode: "demo",
  async getCollection() { return DEMO_KITS; },
  async getKit(handle) { return ALL.find((k) => k.handle === handle) ?? null; },
  async getCart(id) { return carts.has(id) ? toCart(id, carts.get(id)!) : null; },
  async addLine(cartId, { variantId, quantity, print }) {
    if (!find(variantId)) return { cart: null, errors: [{ code: "INVALID", message: "That kit isn't in this store." }] };
    const id = cartId && carts.has(cartId) ? cartId : `gid://shopify/Cart/demo-${++seq}`;
    const rows = [...(carts.get(id) ?? [])];
    const same = rows.find((r) => r.variantId === variantId && JSON.stringify(r.print) === JSON.stringify(print));
    const next = same
      ? rows.map((r) => (r === same ? { ...r, quantity: r.quantity + quantity } : r))
      : [...rows, { id: `gid://shopify/CartLine/demo-${++seq}`, variantId, quantity, print }];
    return commit(id, next);
  },
  async updateLine(cartId, lineId, quantity) {
    const rows = carts.get(cartId) ?? [];
    return commit(cartId, quantity > 0 ? rows.map((r) => (r.id === lineId ? { ...r, quantity } : r)) : rows.filter((r) => r.id !== lineId));
  },
  async removeLine(cartId, lineId) {
    return commit(cartId, (carts.get(cartId) ?? []).filter((r) => r.id !== lineId));
  },
};

