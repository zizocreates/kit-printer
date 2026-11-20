// The print rules: the SAME file the Functions and the theme block use. Never copy them here.
export { checkPrint, cleanName, cleanNumber, NAME_KEY, NUMBER_KEY, NAME_MAX } from "../../../shared/print.js";
import { checkPrint, NAME_KEY, NUMBER_KEY } from "../../../shared/print.js";
import type { Print } from "./types";

export type PrintCheck = { ok: boolean; isPrint: boolean; name: string; number: string; field?: "name" | "number"; reason?: string };

export function check(name: string, number: string): PrintCheck {
  return checkPrint(name, number) as PrintCheck;
}

/** The cart line attributes our Functions read with attribute(key: "Print name"). Empty print, no attributes. */
export function toAttributes(print: Print | null): { key: string; value: string }[] {
  if (!print) return [];
  const out: { key: string; value: string }[] = [];
  if (print.name) out.push({ key: NAME_KEY, value: print.name });
  if (print.number) out.push({ key: NUMBER_KEY, value: print.number });
  return out;
}

export function fromAttributes(attrs: { key: string; value: string | null }[]): Print | null {
  const get = (k: string) => attrs.find((a) => a.key === k)?.value?.trim() ?? "";
  const name = get(NAME_KEY);
  const number = get(NUMBER_KEY);
  return name || number ? { name, number } : null;
}
