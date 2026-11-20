// The public Storefront token is meant for browsers (F9). No token at build time means demo mode.
export const STORE_DOMAIN = (import.meta.env.VITE_STORE_DOMAIN as string | undefined) || "kitsbyzizo.myshopify.com";
export const STOREFRONT_TOKEN = (import.meta.env.VITE_STOREFRONT_TOKEN as string | undefined) || "";
export const API_VERSION = "2026-10";
export const STORE_PASSWORD = "futureshopifolk"; // the test store's password, public on purpose (recruiters use it)
export const REPO_URL = "https://github.com/zizocreates/kit-printer";
export const MODE: "live" | "demo" = STOREFRONT_TOKEN ? "live" : "demo";
