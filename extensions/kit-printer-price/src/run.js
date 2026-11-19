// @ts-check
// Kit Printer, the price. Runs inside Shopify's checkout as a Cart Transform Function.
// A shirt with a valid name or number has its own price raised by the product's printing price. The charge lives
// on the shirt's line itself, not on a separate "printing" item, so changing the quantity can never leave a
// printing charge behind, and a theme change can't remove it (it's not the theme's JavaScript doing it).

import { checkPrint, toCents, fromCents } from "../../../shared/print.js";

// The operation's name in the Cart Transform API ("lineUpdate"; older API versions called it "update").
export const UPDATE_OP = "lineUpdate";

const NO_CHANGES = { operations: [] };

/** @param {any} input */
export function run(input) {
  const operations = [];
  for (const line of input?.cart?.lines ?? []) {
    const op = priceLine(line);
    if (op) operations.push(op);
  }
  return operations.length ? { operations } : NO_CHANGES;
}

/** One line in, one price change (or null) out. Anything unexpected means: leave the line alone. */
export function priceLine(line) {
  const print = checkPrint(line?.printName?.value, line?.printNumber?.value);
  // No print, or a print the check will refuse: don't charge for it. The check Function blocks the checkout.
  if (!print.isPrint || !print.ok) return null;

  const fee = toCents(line?.merchandise?.product?.printPrice?.value ?? "");
  if (fee == null || fee <= 0) return null; // this product isn't printable; the check refuses it

  const base = toCents(line?.cost?.amountPerQuantity?.amount ?? "");
  if (base == null) return null;

  return {
    [UPDATE_OP]: {
      cartLineId: line.id,
      price: { adjustment: { fixedPricePerUnit: { amount: fromCents(base + fee) } } },
    },
  };
}
