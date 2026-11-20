import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The storefront imports the print rules (../shared/print.js) and, in demo mode, the real Function code
// (../extensions/*/src), so Vite may read the repo root, not only this folder.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { fs: { allow: [".."] } },
  build: { target: "es2022", sourcemap: false },
});
