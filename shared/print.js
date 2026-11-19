// The rules for a printed name and number, in one place. Both Functions (the price and the check) import this,
// so the checkout can never price a print that the check would refuse, or the other way round.

export const NAME_KEY = "Print name";
export const NUMBER_KEY = "Print number";
export const NAME_MAX = 12;

// Letters, plus the space, hyphen, apostrophe and full stop real kit names use (VAN DIJK, O'BRIEN, SMITH-ROWE).
const NAME_OK = /^[A-Z](?:[A-Z .'-]*[A-Z.])?$/;

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
 * Check one line's print. Returns { ok, name, number, reason }.
 * A line with neither a name nor a number is not a print at all, and is fine.
 */
export function checkPrint(rawName, rawNumber) {
  const name = cleanName(rawName);
  const number = cleanNumber(rawNumber);
  if (!name && !number) return { ok: true, name: "", number: "", isPrint: false };

  if (name) {
    if ([...name].length > NAME_MAX) return fail(`Names can be up to ${NAME_MAX} letters.`);
    if (!NAME_OK.test(name)) return fail("Names can only use letters, spaces, hyphens, apostrophes and full stops.");
  }
  if (number) {
    if (!/^\d{1,2}$/.test(number)) return fail("Numbers go from 1 to 99.");
    const n = Number(number);
    if (n < 1 || n > 99) return fail("Numbers go from 1 to 99.");
    if (number.length === 2 && number[0] === "0") return fail("Numbers go from 1 to 99, with no leading zero.");
  }
  return { ok: true, name, number, isPrint: true };

  function fail(reason) {
    return { ok: false, name, number, isPrint: true, reason };
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
