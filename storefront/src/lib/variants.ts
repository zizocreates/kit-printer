import type { Kit, Variant } from "./types";

// Shopify gives a product with no options one variant titled "Default Title". It has no size to pick or show.
export const DEFAULT_TITLE = "Default Title";
export const isDefaultSize = (size: string) => size === DEFAULT_TITLE;
export const onlyVariant = (kit: Pick<Kit, "variants">): Variant | null =>
  kit.variants.length === 1 && isDefaultSize(kit.variants[0].size) ? kit.variants[0] : null;
