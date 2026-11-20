import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const fn = (p: string) => fileURLToPath(new URL(`../extensions/${p}`, import.meta.url));

// The storefront imports the print rules (../shared/print.js) and, in demo mode, the real Function code
// (../extensions/*/src), so Vite may read the repo root, not only this folder.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@kit-printer/price": fn("kit-printer-price/src/cart_transform_run.js"),
      "@kit-printer/check": fn("kit-printer-check/src/cart_validations_generate_run.js"),
    },
  },
  server: { fs: { allow: [".."] } },
  build: { target: "es2022", sourcemap: false },
});
