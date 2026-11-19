// @ts-check
// Kit Printer, the check. Runs inside Shopify's checkout as a Cart and Checkout Validation Function.
// The product page checks the name and number too, but that's only a convenience: anyone can send a cart straight
// to Shopify without the page. This is the check that can't be skipped, so a bad print never reaches an order.

import { checkPrint, toCents } from "../../../shared/print.js";

/** @param {any} input */
export function cartValidationsGenerateRun(input) {
  const errors = [];
  for (const line of input?.cart?.lines ?? []) {
    const problem = checkLine(line);
    if (problem) errors.push({ message: problem, target: "$.cart" });
  }
  return { operations: [{ validationAdd: { errors } }] };
}

/** Returns a message for the buyer, or null if the line is fine. */
export function checkLine(line) {
  const print = checkPrint(line?.printName?.value, line?.printNumber?.value);
  if (!print.isPrint) return null;

  const title = line?.merchandise?.product?.title ?? "This item";
  const fee = toCents(line?.merchandise?.product?.printPrice?.value ?? "");
  if (fee == null || fee <= 0) return `${title} can't be printed. Remove the name and number to continue.`;
  if (!print.ok) return `${title}: ${print.reason}`;
  return null;
}
