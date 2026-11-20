import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const fn = (p: string) => fileURLToPath(new URL(`../extensions/${p}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@kit-printer/price": fn("kit-printer-price/src/cart_transform_run.js"),
      "@kit-printer/check": fn("kit-printer-check/src/cart_validations_generate_run.js"),
    },
  },
  test: { environment: "jsdom", include: ["tests/unit/**/*.test.{ts,tsx}"] },
});
