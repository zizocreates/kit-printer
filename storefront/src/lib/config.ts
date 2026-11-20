// The public Storefront token is meant for browsers (F9). No token at build time means demo mode.
export const STORE_DOMAIN = (import.meta.env.VITE_STORE_DOMAIN as string | undefined) || "kitsbyzizo.myshopify.com";
export const STOREFRONT_TOKEN = (import.meta.env.VITE_STOREFRONT_TOKEN as string | undefined) || "";
// Match the version hydrogen-react 2026.4 is built against, or its client logs a mismatch warning on every page.
// Checked against the live store: 2026-04 returns the same collection, metafields and back_image reference as
// 2026-10, so there is nothing to gain from being ahead of the kit we use.
export const API_VERSION = "2026-04";
export const STORE_PASSWORD = "futureshopifolk"; // the test store's password, public on purpose (recruiters use it)
export const REPO_URL = "https://github.com/zizocreates/kit-printer";
export const MODE: "live" | "demo" = STOREFRONT_TOKEN ? "live" : "demo";
