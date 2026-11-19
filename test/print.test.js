import { test } from "node:test";
import assert from "node:assert/strict";
import { checkPrint, toCents, fromCents, NAME_MAX } from "../shared/print.js";

test("real kit names pass, cleaned to capitals", () => {
  for (const [typed, want] of [["saka", "SAKA"], ["  van   dijk ", "VAN DIJK"], ["O'Brien", "O'BRIEN"], ["smith-rowe", "SMITH-ROWE"], ["j.", "J."]]) {
    const r = checkPrint(typed, "");
    assert.equal(r.ok, true, typed);
    assert.equal(r.name, want);
  }
});

test("numbers 1 to 99 pass; 0, 100, 07, 7.5, -7 and words don't", () => {
  for (const n of ["1", "7", "10", "99"]) assert.equal(checkPrint("", n).ok, true, n);
  for (const n of ["0", "100", "07", "7.5", "-7", "seven", "7a", " 1 2 "]) assert.equal(checkPrint("", n).ok, false, n);
});

test("emoji, digits, symbols and markup in a name are refused", () => {
  for (const n of ["SAKA ⚽", "SAKA7", "<b>SAKA</b>", "SAKA!", "-SAKA", "SAKA-", "'"]) assert.equal(checkPrint(n, "7").ok, false, n);
});

test("a name over the limit is refused, counted in characters not bytes", () => {
  assert.equal(checkPrint("A".repeat(NAME_MAX), "").ok, true);
  assert.equal(checkPrint("A".repeat(NAME_MAX + 1), "").ok, false);
});

test("no name and no number is not a print, and is fine", () => {
  const r = checkPrint(undefined, null);
  assert.deepEqual([r.ok, r.isPrint], [true, false]);
  assert.equal(checkPrint("   ", " ").isPrint, false);
});

test("money is whole cents, so the sum is exact", () => {
  assert.equal(toCents("89.99"), 8999);
  assert.equal(toCents("15"), 1500);
  assert.equal(toCents("15.5"), 1550);
  assert.equal(fromCents(toCents("89.99") + toCents("15.00")), "104.99");
  for (const bad of ["", "-1", "1.999", "abc", "1e3"]) assert.equal(toCents(bad), null, bad);
});
