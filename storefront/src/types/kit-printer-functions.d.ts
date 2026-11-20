// Types for Kit Printer's two Functions (../extensions/*), which demo mode runs as-is. The Function files are
// type-checked by their own toolchain, so the site reads them through these declarations instead.
declare module "@kit-printer/price" {
  export function cartTransformRun(input: unknown): { operations: unknown[] };
}
declare module "@kit-printer/check" {
  export function cartValidationsGenerateRun(input: unknown): { operations: { validationAdd: { errors: { message: string; target: string }[] } }[] };
}
