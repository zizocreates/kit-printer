# Kickoff: the local agent (Kits by Zizo storefront)

You're on Zyad's computer, in the kit-printer repo (https://github.com/zizocreates/kit-printer). We're building **Kits by Zizo**, a fully custom storefront on Shopify's Storefront API, with checkout guarded by Kit Printer's Functions. **Read `docs/STOREFRONT-PLAN.md` completely first.** It holds the verified facts (F1 to F10), so don't re-research them.

**Who does what:**
- **Claude** (in the cloud) writes all the storefront code and pushes it to the `storefront` branch. Its container can't reach Shopify.
- **You** do everything that needs this computer or Zyad's logins:
  1. the Shopify admin setup;
  2. the spike against the real store;
  3. the fixtures;
  4. running the site locally against the real store;
  5. the e2e tests;
  6. the deploy.

## Step 1: setup and the spike (now)
1. `git pull`, then `git checkout -b storefront` and push it. If Claude already pushed it, `git checkout storefront && git pull`.
2. **The admin (the only clicks in this job):**
   - install the **Headless** channel (Shopify App Store, free), then Create storefront, and copy the **public** access token;
   - publish the 4 kits and the socks to the Headless channel;
   - set **Storefronts access** to read on the product metafields `kit_printer.print_price`, `shirt_colour`, `print_colour` and `back_image`.
3. Put the public token in `storefront/.env.production` as `VITE_STORE_DOMAIN=kitsbyzizo.myshopify.com` and `VITE_STOREFRONT_TOKEN=...`. Create the folder if Claude hasn't yet. It's public by design (F9). **Never store the private token anywhere.**
4. **The spike:** checks a to e in Phase 0 of the plan, with curl against `https://kitsbyzizo.myshopify.com/api/2026-10/graphql.json` and the header `X-Shopify-Storefront-Access-Token`.
   - Save each real response, pretty-printed, to `storefront/src/fixtures/`:
     - `collection.json` (the kits collection with everything the `Kit` type needs);
     - `product-<handle>.json` for all 4 kits and the socks;
     - `cart-saka7.json` (check b);
     - `cart-error-100.json` (check c);
     - `cart-error-socks.json` (check d).
   - Write `docs/storefront-spike.md` with each check's result, and for e, exactly what happens when you open `checkoutUrl` in a fresh browser.
   - Commit and push to `storefront`. **Tell Zyad "spike done" with the 5 results in one line each.** If a or b fails, stop there.

## Step 2: when Claude says the code is ready
- `git pull`, `cd storefront && npm ci && npm run dev`, and check it works against the real store by reading the DOM and console (no screenshot hunting).
- Write the e2e suite from the plan's quality bar in `storefront/tests/e2e/` (Playwright, `--trace off`).
- Run it locally, then deploy to Cloudflare Pages project `kitsbyzizo` (`npx wrangler pages deploy storefront/dist --project-name kitsbyzizo`, logging in to Zyad's Cloudflare in the browser if asked), and run e2e against `https://kitsbyzizo.pages.dev`.
- Report in `docs/storefront-report-local.md`: e2e results, Lighthouse mobile scores, the live URL, and anything Claude needs to fix (exact errors). Push, then tell Zyad "local done".

## Rules
- Commands and code, not screenshots. At most 3 screenshots in total, for the report.
- Don't edit Claude's code (`storefront/src` except `fixtures/`, plus the config files). If something's wrong, write it in your report with the exact error; Claude fixes it.
- Don't change `extensions/` or `shared/`.
- Never show the store password in screenshots, or any card details.
- Write plainly, with no em or en dashes.
