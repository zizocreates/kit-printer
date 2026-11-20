# Storefront status (each agent keeps its own section up to date)

## Claude (cloud)
- Done: scaffold; **`src/lib/types.ts` (the contract)**; the data layer: live Storefront API client (`src/lib/shopify.ts`, `queries.ts`, `map.ts`), `useCart()` (`src/lib/cart.tsx`), `useCollection()`/`useKit()` (`src/lib/useData.ts`).
- **Demo mode** (no `VITE_STOREFRONT_TOKEN`): `src/demo/` runs the REAL Function code from `extensions/` on an in-memory cart, so RONALDO 7 costs $104.99 and number 100 is refused with the Function's own message. 11 unit tests pass (`cd storefront && npx vitest run`).
- Now: design tokens and shared components, then the product page.
- Note for the local agent: when your fixtures land I'll check `map.ts` against them. If a real response differs from the documented shape, put the diff in REQUESTS.

## Local agent
- **Step 1, connectors (20 Nov 2026):**
  - **Shopify connector: works.** Store confirmed **Kits by Zizo**, `kitsbyzizo.myshopify.com`, USD, EST, plan "Shopify Plus App Development". (It needed signing in first; Zyad connected it.) Server skills: `admin-graphql`, `editing-themes`.
  - **Shopify CLI: also works**, logged in as zizodevs@gmail.com, org Zizo Development, app Kit Printer. Useful note: `shopify app execute` runs Admin GraphQL, but the app's only scope is `write_cart_transforms`, so it is refused for `products`. Admin work goes through the connector, not the CLI.
  - **21st.dev: works.** "ecommerce product card with size pills on hover" returned 3 components (beratberkayg/product-card-1, deltacomponents/product-card, ravikatiyar162/product-card). Best starting point for the Kits grid: deltacomponents/product-card (image well plus title/price footer), restyled to our tokens.
  - **Mobbin: unavailable.** "Mobbin MCP requires a paid plan." Same as Claude's session.
  - **Claude in Chrome: available.** One browser connected (Windows, local).
  - **Local tools:** Node v26.13.0, npm 11.20.0, Shopify CLI 5.0.2, Playwright 1.65.1. All fine (plan wants Node 22+).
- **Step 2, Shopify setup: what the store already looks like.**
  - **Metafield access (F7): already correct, nothing to change.** All four `kit_printer` PRODUCT definitions have `access.storefront = PUBLIC_READ`: `print_price` (number_decimal, id 577261207623), `shirt_colour` (color, 577310294087), `print_colour` (color, 577310883911), `back_image` (file_reference, 577953103943).
  - **Products:** 4 kits plus socks, all ACTIVE: `kanata-fc-home-kit`, `kanata-fc-away-kit`, `rideau-united-home-kit`, `capital-city-third-kit`, `football-socks` (title "Kanata FC Socks"). An old `home-kit` is ARCHIVED; ignore it.
  - **Collection `kits` exists** (id 354043691079) with exactly the 4 kits. The `frontpage` collection only holds the archived old kit.
  - **Blocker: the Headless channel is not installed.** `publications` returns only Online Store, Shop and Point of Sale. So there is no Headless publication to publish to (F10) and no storefront token (F9). This has to be done in the browser admin, and everything after it (token, spike a to e, fixtures, pages on real data, deploy) waits on it.
- **Now:** waiting on the Headless channel install plus "Create storefront" to get the **public** token.
- **Next, the moment the token exists:** publish the 4 kits, the socks and the `kits` collection to the Headless publication, then spike checks a to e, fixtures, `docs/storefront-spike.md`.
