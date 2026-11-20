import type { Money } from "./types";

// Money as whole cents, so $89.99 + $15.00 is exactly $104.99 (the same rule the Functions use).
export function toCents(m: Money | string): number {
  const s = typeof m === "string" ? m : m.amount;
  const [whole, frac = ""] = String(s).trim().split(".");
  return Number(whole) * 100 + Number((frac + "00").slice(0, 2));
}

export function fromCents(cents: number, currencyCode = "USD"): Money {
  const sign = cents < 0 ? "-" : "";
  const c = Math.abs(cents);
  return { amount: `${sign}${Math.floor(c / 100)}.${String(c % 100).padStart(2, "0")}`, currencyCode };
}

export function add(a: Money, b: Money): Money {
  return fromCents(toCents(a) + toCents(b), a.currencyCode);
}

export function times(m: Money, n: number): Money {
  return fromCents(toCents(m) * n, m.currencyCode);
}

const formatters = new Map<string, Intl.NumberFormat>();
export function format(m: Money): string {
  let f = formatters.get(m.currencyCode);
  if (!f) {
    f = new Intl.NumberFormat("en-US", { style: "currency", currency: m.currencyCode });
    formatters.set(m.currencyCode, f);
  }
  return f.format(toCents(m) / 100);
}
