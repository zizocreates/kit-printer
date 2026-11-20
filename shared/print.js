// The rules for a printed name and number, in one place. Both Functions (the price and the check) import this,
// so the checkout can never price a print that the check would refuse, or the other way round.

export const NAME_KEY = "Print name";
export const NUMBER_KEY = "Print number";
export const NAME_MAX = 12;

// Letters, plus the space, hyphen, apostrophe and full stop real kit names use (VAN DIJK, O'BRIEN, SMITH-ROWE).
const NAME_OK = /^[A-Z](?:[A-Z .'-]*[A-Z.])?$/;
const NUMBER_OK = /^[1-9][0-9]?$/;

/** Normalise what the buyer typed. Returns "" for nothing. */
export function cleanName(raw) {
  if (raw == null) return "";
  return String(raw).normalize("NFC").trim().replace(/\s+/g, " ").toUpperCase();
}

export function cleanNumber(raw) {
  if (raw == null) return "";
  return String(raw).trim();
}

/**
 * Check one line's print. Returns { ok, isPrint, name, number } and, when it fails, the field at fault
 * ("name" or "number") and a reason written for the buyer.
 * A line with neither a name nor a number is not a print at all, and is fine.
 */
export function checkPrint(rawName, rawNumber) {
  const name = cleanName(rawName);
  const number = cleanNumber(rawNumber);
  if (!name && !number) return { ok: true, name: "", number: "", isPrint: false };

  if (name) {
    // Count characters, not UTF-16 units, so an accented or unusual letter can't sneak past the limit.
    if ([...name].length > NAME_MAX) return fail("name", `Names can be up to ${NAME_MAX} letters.`);
    if (!NAME_OK.test(name)) return fail("name", "Names can only use letters, spaces, hyphens, apostrophes and full stops.");
  }
  // 1 to 99, written the way it's printed: no 0, no leading zero, no decimals or signs.
  if (number && !NUMBER_OK.test(number)) return fail("number", "Numbers go from 1 to 99.");
  return { ok: true, name, number, isPrint: true };

  function fail(field, reason) {
    return { ok: false, name, number, isPrint: true, field, reason };
  }
}

/** Money as whole cents, so 89.99 + 15.00 is never 104.99000000000001. */
export function toCents(amount) {
  const s = String(amount).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const [whole, frac = ""] = s.split(".");
  return Number(whole) * 100 + Number((frac + "00").slice(0, 2));
}

export function fromCents(cents) {
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}
