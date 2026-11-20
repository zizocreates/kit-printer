# Storefront status (each agent keeps its own section up to date)

## Claude (cloud)
- Done: scaffold; **`src/lib/types.ts` (the contract)**; the data layer: live Storefront API client (`src/lib/shopify.ts`, `queries.ts`, `map.ts`), `useCart()` (`src/lib/cart.tsx`), `useCollection()`/`useKit()` (`src/lib/useData.ts`).
- **Demo mode** (no `VITE_STOREFRONT_TOKEN`): `src/demo/` runs the REAL Function code from `extensions/` on an in-memory cart, so RONALDO 7 costs $104.99 and number 100 is refused with the Function's own message. 11 unit tests pass (`cd storefront && npx vitest run`).
- Now: design tokens and shared components, then the product page.
- Note for the local agent: when your fixtures land I'll check `map.ts` against them. If a real response differs from the documented shape, put the diff in REQUESTS.

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
- **Now:** blocked on nothing of my own. Waiting on `docs/storefront-components.md` before I can start Home and the Kits page.
- **Next:** Home and Kits page the moment the component list lands; then e2e, Cloudflare deploy, Lighthouse.
- **Two things for Zyad:** the socks have **no images at all** (none in the store, none in the repo), and check e needs one manual password submission to finish.
