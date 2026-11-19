import { test } from "node:test";
import assert from "node:assert/strict";
import { run as price, UPDATE_OP } from "../extensions/kit-printer-price/src/run.js";
import { run as check } from "../extensions/kit-printer-check/src/run.js";

// A cart line shaped like the Function's input query.
function line({ id = "gid://shopify/CartLine/1", qty = 1, amount = "89.99", name, number, fee = "15.00", title = "Home kit" } = {}) {
  return {
    id, quantity: qty,
    cost: { amountPerQuantity: { amount, currencyCode: "CAD" } },
    printName: name === undefined ? null : { value: name },
    printNumber: number === undefined ? null : { value: number },
    merchandise: { __typename: "ProductVariant", id: "gid://shopify/ProductVariant/1", product: { title, printPrice: fee === null ? null : { value: fee } } },
  };
}
const cart = (...lines) => ({ cart: { lines } });
const priceOf = (out, i = 0) => out.operations[i][UPDATE_OP].price.adjustment.fixedPricePerUnit.amount;

test("SAKA 7 on an $89.99 kit with $15.00 printing costs $104.99 each", () => {
  const out = price(cart(line({ name: "saka", number: "7" })));
  assert.equal(out.operations.length, 1);
  assert.equal(priceOf(out), "104.99");
  assert.deepEqual(check(cart(line({ name: "saka", number: "7" }))).errors, []);
});

test("the charge is per shirt on the shirt's own line, so a quantity change can't leave it behind", () => {
  const one = priceOf(price(cart(line({ qty: 1, name: "SAKA", number: "7" }))));
  const three = priceOf(price(cart(line({ qty: 3, name: "SAKA", number: "7" }))));
  assert.equal(one, three);
  const out = price(cart(line({ qty: 3, name: "SAKA", number: "7" })));
  assert.equal(out.operations.length, 1, "no separate printing item that could drift from the shirt");
});

test("a plain kit is left alone and passes", () => {
  assert.deepEqual(price(cart(line())).operations, []);
  assert.deepEqual(check(cart(line())).errors, []);
});

test("number 100 is never charged and the checkout is blocked", () => {
  assert.deepEqual(price(cart(line({ name: "SAKA", number: "100" }))).operations, []);
  const errs = check(cart(line({ name: "SAKA", number: "100" }))).errors;
  assert.equal(errs.length, 1);
  assert.match(errs[0].localizedMessage, /1 to 99/);
});

test("an emoji sent straight to the cart, skipping the product page, is blocked at checkout", () => {
  assert.equal(check(cart(line({ name: "SAKA ⚽", number: "7" }))).errors.length, 1);
  assert.deepEqual(price(cart(line({ name: "SAKA ⚽", number: "7" }))).operations, []);
});

test("a print on a product that isn't printable is blocked, never free", () => {
  const l = line({ name: "SAKA", number: "7", fee: null, title: "Socks" });
  assert.deepEqual(price(cart(l)).operations, []);
  assert.match(check(cart(l)).errors[0].localizedMessage, /Socks can't be printed/);
});

test("each line is priced on its own: one printed, one plain, one bad", () => {
  const out = price(cart(
    line({ id: "a", name: "SAKA", number: "7" }),
    line({ id: "b" }),
    line({ id: "c", name: "RICE", number: "0" }),
  ));
  assert.deepEqual(out.operations.map((o) => o[UPDATE_OP].cartLineId), ["a"]);
  assert.equal(check(cart(line({ id: "c", name: "RICE", number: "0" }))).errors.length, 1);
});

test("garbage input never throws; it just changes nothing", () => {
  for (const input of [undefined, {}, { cart: {} }, { cart: { lines: [{}] } }, cart(line({ amount: "abc", name: "SAKA" }))]) {
    assert.doesNotThrow(() => price(input));
    assert.doesNotThrow(() => check(input));
  }
});

test("price and check agree on every case: never charge what the check refuses", () => {
  const names = ["SAKA", "saka", "SAKA ⚽", "", "A".repeat(13), "O'BRIEN", "-X"];
  const numbers = ["7", "", "0", "100", "07", "99"];
  for (const n of names) for (const k of numbers) {
    const l = line({ name: n, number: k });
    const charged = price(cart(l)).operations.length === 1;
    const blocked = check(cart(l)).errors.length > 0;
    const isPrint = Boolean(n.trim() || k.trim());
    assert.equal(charged, isPrint && !blocked, `${JSON.stringify(n)} / ${JSON.stringify(k)}`);
  }
});
