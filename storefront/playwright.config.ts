// End to end tests against the REAL store. The build carries the public Storefront token from
// .env.production, so `npm run preview` is already live mode.
//
//   npx playwright test                              the local production build
//   E2E_BASE_URL=https://kitsbyzizo.pages.dev npx playwright test     the deployed site
import { defineConfig, devices } from "@playwright/test";

const deployed = process.env.E2E_BASE_URL;
const baseURL = deployed || "http://localhost:4173";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /.*\.spec\.ts$/,
  fullyParallel: false, // every test builds a real cart on the real store; keep the load polite
  workers: 1,
  retries: 1, // one retry, because these talk to Shopify over the network
  reporter: [["list"]],
  timeout: 45_000,
  expect: { timeout: 12_000 },
  use: {
    baseURL,
    trace: "off", // the plan asks for traces off
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    // The iPhone 13 profile (390 wide, touch, 3x) but in Chromium, not WebKit: it is the engine Lighthouse
    // mobile uses, and it keeps the suite to one browser download.
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium" } },
  ],
  // Only start a server when testing the local build.
  ...(deployed
    ? {}
    : {
        webServer: {
          command: "npm run preview -- --port 4173",
          url: "http://localhost:4173",
          reuseExistingServer: true,
          timeout: 120_000,
        },
      }),
});
