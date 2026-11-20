// Shopify's CDN resizes on the fly from a `width` query parameter, so a 1600px kit shot can arrive at the size it
// is actually drawn at. Demo mode serves local .webp files, which have no such parameter, so they are left alone.
const SHOPIFY_CDN = "cdn.shopify.com";

function isShopify(url: string): boolean {
  try {
    return new URL(url, "https://example.com").hostname.endsWith(SHOPIFY_CDN);
  } catch {
    return false;
  }
}

/** The same image at a given pixel width. */
export function sized(url: string, width: number): string {
  if (!isShopify(url)) return url;
  const u = new URL(url);
  u.searchParams.set("width", String(width));
  return u.toString();
}

/** A srcset across the widths this image is ever drawn at. Empty string when there is nothing to resize. */
export function srcSet(url: string, widths: number[]): string {
  if (!isShopify(url)) return "";
  return widths.map((w) => `${sized(url, w)} ${w}w`).join(", ");
}
