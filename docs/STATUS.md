# Storefront status (each agent keeps its own section up to date)

## Claude (cloud)
- Done: scaffold, **`src/lib/types.ts` (the contract)**, the data layer, and demo mode on the REAL Function code.
- **Done (20 Nov): the UI.** Design tokens (`src/styles/globals.css`), app shell (`App.tsx`: router, Lenis on desktop only, reduced motion, scroll to top), Header with an animated bag count, AnnouncementBar, Footer, Button, KitCard, KitStage (3D flip, turns to the back as you type), PrintOverlay (theme block coordinates, long names squeezed, number pops), SizePills, PersonalizePills, PrintFields (counters, shared-rules errors), CartDrawer, PasswordSheet, and the Product, How it's built and 404 routes.
- **Component guide: `docs/storefront-components.md`.** Read it before the Home and Kits pages.
- **`routes/Home.tsx` and `routes/Collection.tsx` are stubs I wrote so the router builds. They're yours: replace them whole.**
- Checked: `tsc` clean, `vite build` ok, **18 unit tests pass** (data layer plus the product flow on the demo backend: RONALDO 7 = $104.99 in the bag, size required, 100 refused, unknown kit = 404). Playwright in demo mode at 1440 and iPhone 13: product, bag, kits hover, How it's built, 404; **0 console errors**.
- For your Lighthouse pass: the JS bundle is 515 kB (165 kB gzip), mostly hydrogen-react and motion. If it costs points, tell me in REQUESTS and I'll split it.
- Done: `map.ts` checked against the real fixtures in `tests/unit/fixtures.test.ts`; socks placeholder (no photo). **22 unit tests pass.**
- Done (polish 1): socks photo (`store/make-socks.cjs`), pages load lazily, "Complete the kit" socks offer in the bag, size guide sheet, `public/_headers` (security headers, long cache on /assets and /fonts), `robots.txt`, Open Graph image (`public/og.jpg`) and tags, fixes at 320px (header no longer wraps, print fields stack when narrow). **24 unit tests pass.**
- Next: anything you put in REQUESTS; README storefront section; a11y pass on my components; the portfolio card once kitsbyzizo.pages.dev is live.

## Local agent
- **Step 1, connectors (20 Nov 2026):** Shopify **pass** (store confirmed Kits by Zizo, `kitsbyzizo.myshopify.com`, USD, plan "Shopify Plus App Development"; server skills `admin-graphql`, `editing-themes`). 21st.dev **pass** (3 cards back; best starting point for the Kits grid is `deltacomponents/product-card`). Mobbin **fail**, "requires a paid plan", same as Claude. Claude in Chrome **pass**. Local: Node v26.13.0, npm 11.20.0, Shopify CLI 5.0.2, Playwright 1.65.1.
  - Note for later: the Shopify CLI can run Admin GraphQL (`shopify app execute`), but the Kit Printer app only holds `write_cart_transforms`, so it is ACCESS_DENIED on products. Admin work goes through the connector.
- **Step 2, Shopify setup: DONE.**
  - Headless channel installed. Installing it created the storefront "Kits By Zizo Headless" (id 432818) by itself, so nothing had to be created by hand. **Public** token is in `storefront/.env.production`. The private token is masked in the admin and was never read or stored.
  - Published to Headless publication `220251324487`: the 4 kits, the socks, and the **`kits` collection** (the plan did not list the collection, but `collection(handle:)` does not resolve without it). No userErrors.
  - Metafield access (F7) **was already correct**, all four `kit_printer` definitions on `PUBLIC_READ`. No mutation run.
- **Step 2, the spike: a, b, c, d PASS. e half answered.** Full write-up in `docs/storefront-spike.md`, real responses in `storefront/src/fixtures/`.
  - **b is the big one:** on a cart our own site built, `cost.amountPerQuantity` is **104.99** for the 89.99 away kit with SAKA 7. F1 and F3 hold. **The "+$15.00 applied at checkout" fallback is not needed**, the UI can show the real cart price.
  - c: `VALIDATION_CUSTOM`, "Kanata FC Away Kit 26/27: Numbers go from 1 to 99." d: "Kanata FC Socks can't be printed. Remove the name and number to continue." Socks with no print are accepted.
  - e: `checkoutUrl` redirects to `/password` (F6 confirmed on our store). Whether unlocking then continues to checkout is still open; the password form has no `return_to` field, so the plan's two step sheet is what to build.
- **Fixtures pushed:** `collection.json`, `product-<handle>.json` for all 5 products, `cart-created.json`, `cart-two-lines.json`, `cart-error-number.json`, `cart-error-socks.json`. Cart ids and checkout URL keys are redacted in the cart fixtures (public repo); shapes are untouched.
- **Claude's data layer checked against the live store: all 33 checks pass.** Ran his own `queries.ts` and `map.ts` against `kitsbyzizo` (`storefront/tests/e2e/live-data.check.mts`, `npx vite-node tests/e2e/live-data.check.mts`). Collection maps to 4 kits with `backBlank` and `printPrice` 15.00, socks map to `printPrice: null`, a real cart line is 104.99 with the print off the attributes, and a refusal maps to null cart plus VALIDATION_CUSTOM word for word. His `typecheck` is clean and his 11 unit tests pass.
- **Now:** blocked on nothing of my own. Waiting on `docs/storefront-components.md` before Home and the Kits page can start.
- **Next:** Home and the Kits page the moment the component list lands; then the Playwright e2e suite, Cloudflare Pages deploy, Lighthouse.
- **Two things for Zyad:** the socks have **no images at all** (none on the product, none in the repo), and spike e needs one manual password submission to finish.
