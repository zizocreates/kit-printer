# Kits by Zizo: the custom storefront (plan)

A fully custom store, our own code end to end, built on Shopify's **Storefront API**, with checkout still guarded by Kit Printer's **Functions**. Written 20 November 2026 from Shopify's docs, Baymard's usability research and real sports stores (sources at the bottom). Two agents build it in parallel, and **both build the design**:
- **Claude (cloud)**:
  - the design system (tokens, type, motion rules) and the shared components;
  - the data layer;
  - the **product page** (the turning shirt), the cart drawer, How it's built and the 404;
  - unit tests.

  Its container can't reach Shopify, so it builds against fixtures and demo mode.
- **The local agent** (Zyad's computer):
  - the Shopify admin, the token, the spike and the fixtures;
  - the **homepage** and the **Kits page**, built from Claude's components and tokens;
  - visual checks in a real browser with real data;
  - e2e, Lighthouse and the deploy.

Read this whole file before starting.

## Why this is the strongest version of Kit Printer
- **Our site** reads products and builds carts through the Storefront API (GraphQL).
- **Shopify's checkout** runs our two Functions on every cart, whatever site sent it. The price goes up by the print price, and a bad print is refused.
- So the story to a recruiter is the app's real point: *the storefront is 100% custom, and the rules still can't be skipped, because they live in checkout.* Three surfaces share one rules file (`shared/print.js`): the Functions, the theme block, and now this site.

## Verified facts (each is from Shopify's docs or staff; don't re-derive)
| # | Fact | Source |
|---|---|---|
| F1 | Cart Transform Functions run on Storefront API carts ("Storefront: Supported"). | Cart Transform API reference |
| F2 | Validation errors reach the Storefront API: a bad `cartLinesAdd` returns `userErrors` with code `VALIDATION_CUSTOM` and our message. | Create checkout validation; Cart and Checkout Validation API |
| F3 | Line `attributes` set in `cartCreate`/`cartLinesAdd` are what our Functions read with `attribute(key: "Print name")`. | Storefront API cart guide (CartLine attributes) |
| F4 | `cart.checkoutUrl` sends the buyer to Shopify's checkout. Request it when they're ready, because it can go stale. | Storefront API cart guide, step 7 |
| F5 | A dev store's Storefront API works with a Storefront access token, even though dev stores are always password-locked. | Shopify staff, community.shopify.dev #23265 |
| F6 | **"Online store password protection prevents Hydrogen checkouts."** On a dev store the checkout URL meets the password page first. | Shopify Hydrogen migration doc; community threads |
| F7 | Product metafields are readable from the Storefront API only when their definition has `access.storefront = PUBLIC_READ` (the "Storefronts" access setting in the admin). | Retrieve metafields with the Storefront API |
| F8 | Oxygen works on dev stores, but **their deployment URLs always require a store login**. A recruiter couldn't open it, so we host on Cloudflare Pages. | Hydrogen fundamentals, supported plans |
| F9 | Tokens come from the **Headless** sales channel ("Create storefront" gives a public and a private token). The public token is meant for browsers. | Getting started with the Storefront API; Storefront API auth |
| F10 | Products only appear through the API if they're **published to the Headless channel**. | Headless channel docs |

## Architecture
```
Browser: kitsbyzizo.pages.dev (React SPA, Cloudflare Pages)
  ├─ Storefront API (GraphQL, public token)  ──>  products, collection, metafields
  ├─ cartCreate / cartLinesAdd / cartLinesUpdate / cartLinesRemove (line attributes: Print name, Print number)
  │      └─ Shopify runs Kit Printer's Functions on the cart:
  │           price: lineUpdate +$15.00 (F1)   check: VALIDATION_CUSTOM on a bad print (F2)
  └─ "Checkout" ──> cart.checkoutUrl ──> kitsbyzizo.myshopify.com checkout (test gateway; password first, F6)
```
No server of our own. The Shopify theme store stays as it is (it's where the theme block lives).

## Stack (versions checked on npm, 20 Nov 2026)
- **Vite 8 + React 19 + React Router 8** (SPA). No server rendering needed: SEO doesn't matter for a password-gated demo, and the public token is meant for browsers (F9).
- **`@shopify/hydrogen-react` 2026.4**: Shopify's official React kit, which works outside Hydrogen. Use its Storefront client helpers, `Money`, `Image` (Shopify CDN resizing) and the `flattenConnection`/`parseGid` utilities. Using Shopify's own kit is a signal in itself.
- **Tailwind CSS 4** for styling. Components are hand-built to our tokens (the 21st.dev MCP can be added on the local machine later if wanted; nothing ships looking like a stock component).
- **Motion 14** (`motion/react`) for layout and shared-element transitions. **Lenis 1.3** for smooth scroll (off for reduced motion). **GSAP 3.15** only if a scroll sequence needs it (its standard licence is free).
- **Vitest** for unit tests, **Playwright** for end-to-end tests against the live store.
- Fonts: **Oswald 700** for headings and the print (SIL OFL, already in `store/fonts`), **Inter** for body (SIL OFL, via `@fontsource-variable/inter`).

## Folder layout (ownership keeps two agents from colliding)
```
storefront/
  package.json, vite.config.ts, index.html, tailwind (v4: css-first), .env.example
  public/_redirects                 # "/* /index.html 200" for SPA routes on Cloudflare
  src/
    lib/        Claude: shopify.ts (client), queries.ts, cart.ts (store + hooks), types.ts, print.ts (re-exports ../../shared/print.js), errors.ts
    fixtures/   LOCAL AGENT: collection.json, product-*.json, cart-*.json (real API responses, captured in Phase 0)
    components/ Claude
    routes/     Claude: Home.tsx, Collection.tsx, Product.tsx, Cart drawer, NotFound.tsx, HowItsBuilt.tsx
    styles/     Claude: tokens.css, globals.css
  tests/        unit/ (Claude), e2e/ (local agent)
```
Branch: **`storefront`**. Both agents push to it.
- **Folder ownership** is what keeps two agents from colliding:
  - The local agent owns `src/routes/Home.tsx`, `src/routes/Collection.tsx`, `src/components/home/**`, `src/fixtures/**`, `tests/e2e/**` and `storefront/.env.production`.
  - Claude owns everything else under `storefront/`.
  - Never edit the other's files. Ask in `docs/REQUESTS.md` instead (one section per agent, newest at the top).
- **Before every push:** `git pull --rebase origin storefront`. Commit small and often.
- **Status:** each agent keeps a short running log in `docs/STATUS.md` (its own section) of what's done and what's next, so the other can see it without asking.
- Claude publishes the component list and how to use each one in `docs/storefront-components.md` early, so the local agent can build pages from them.
- Merge to `main` only after the live e2e passes.

## The contract (`src/lib/types.ts`, written by Claude first)
```ts
export type Money = { amount: string; currencyCode: string };
export type Img = { url: string; altText: string | null; width: number; height: number };
export type Variant = { id: string; title: string; size: string; availableForSale: boolean; price: Money };
export type Kit = {
  id: string; handle: string; title: string; vendor: string; descriptionHtml: string;
  images: Img[];                 // [0] front, [1] back with a sample print
  backBlank: Img | null;         // metafield kit_printer.back_image (MediaImage)
  printPrice: Money | null;      // metafield kit_printer.print_price; null = can't be printed
  shirtColour: string | null;    // metafield kit_printer.shirt_colour
  printColour: string | null;    // metafield kit_printer.print_colour
  variants: Variant[];           // S, M, L, XL
  priceRange: { min: Money };
};
export type Print = { name: string; number: string };   // already cleaned by shared/print.js
export type CartLine = {
  id: string; quantity: number; kit: Pick<Kit, "handle" | "title" | "images">; variant: Pick<Variant, "id" | "size">;
  print: Print | null;           // from attributes "Print name" / "Print number"
  unitPrice: Money;              // AFTER the Cart Transform: 104.99 for a printed 89.99 kit (F1)
  lineTotal: Money;
};
export type Cart = { id: string; lines: CartLine[]; subtotal: Money; totalQuantity: number; checkoutUrl: string };
export type CartError = { code: string; message: string };   // VALIDATION_CUSTOM from our check (F2)
```
API surface (`src/lib`), all async, all typed:
- `getCollection("kits"): Promise<Kit[]>`
- `getKit(handle): Promise<Kit | null>`
- `useCart(): { cart, adding, error, add(variantId, qty, print?), update(lineId, qty), remove(lineId), checkout() }`
  - `add` sends the print as attributes `Print name`/`Print number` (exactly these keys, F3).
  - It surfaces `CartError` from `userErrors` without throwing.
  - The cart id persists in `localStorage` (wrapped in try/catch).
  - `checkout()` re-fetches `checkoutUrl` (F4), then follows "Checkout and the password" below.

## Phase 0: the spike (local agent, about 30 minutes, while Claude scaffolds)
Prove F1 to F6 on our store, with curl or a small script, and record the real responses in `docs/storefront-spike.md` and `src/fixtures/`. Setup first:
1. Admin: install the **Headless** channel, Create storefront, copy the **public** token into `storefront/.env.local` (gitignored). Never commit the private token.
2. Publish the 4 kits and the socks to the Headless channel (F10).
3. Set **Storefronts access** to read on `kit_printer.print_price`, `shirt_colour`, `print_colour` and `back_image` (F7).

Then check:
- **a.** `collection(handle: "kits")` returns 4 kits, with images and the 4 metafields (`back_image` resolves `reference { ... on MediaImage { image { url altText width height } } }`).
- **b.** `cartCreate` with the away kit (M) and attributes SAKA/7: `lines.cost.amountPerQuantity` is **104.99**. If it's 89.99, record it. The UI then shows "+$15.00 printing, applied at checkout" until checkout confirms.
- **c.** `cartLinesAdd` with number `100` returns `VALIDATION_CUSTOM` "Home kit: Numbers go from 1 to 99." (or the kit's title).
- **d.** Socks with a print returns "can't be printed".
- **e.** Open `checkoutUrl` in a fresh browser. Record exactly what happens: password page, then does it continue to checkout or land on the home page? (F6)

If a or b fails, stop and report: everything else depends on them. Push `docs/storefront-spike.md` and the fixtures to the `storefront` branch as soon as they exist.

## Checkout and the password (decided now, adjusted by spike e)
Dev stores can't drop their password (F6). The cart drawer's Checkout button opens a small sheet first:
- "This is a Shopify test store. Checkout asks for a password: **futureshopifolk** [Copy]. Payments are fake: card number `1`."
- Then **Continue to checkout** opens `checkoutUrl`.
- If spike e shows the password page dumps you on the store's home page, the sheet does two steps instead: **1. Unlock the store** (opens `/password` in a new tab), then **2. Continue to checkout** (the password cookie then lets `checkoutUrl` through). Test both in e2e.

## Design (backed by the research; Claude builds it)
**Look:** white and near-black (`#101010`), kit red `#c8102e` as the single accent, Oswald capitals for headings and prints, Inter for text, generous white space, and the kit renders on a soft `#f2f2ef` sweep. Rounded cards (14 to 20 px radius), as on Real Madrid's shop.

**Pages:**
1. **Home**
   - **Hero:** "YOUR NAME. YOUR NUMBER." with the three kits fanned, scroll-linked parallax, one CTA.
   - **The 26/27 kits:** a card grid.
   - **"How printing works":** 3 steps, each with a tiny live demo (typing a name onto a mini shirt).
   - **"How it's built":** a short section linking to the How it's built page. It's for recruiters, and it matters: the architecture diagram above, made interactive (hover a box to highlight the request path).
2. **Collection** (`/kits`)
   - Real Madrid-style cards: white rounded card, kit image.
   - On hover: the card lifts 4 px, the image swaps to the **back** (second image), and **size pills slide in under the image** (Real Madrid does this, and Roa Hiking shows sizes on the thumbnail: Commerce-UI). Then the title and "From $89.99".
   - Keyboard focus shows the same as hover.
3. **Product** (`/kits/:handle`): Mammut/Satisfy layout.
   - **Left, about 60%: one big kit image.** Front by default; dots or arrows for front and back.
   - **Right: a sticky purchase panel** (Mammut keeps the conversion area fixed):
     1. title and price;
     2. **size buttons**, never a dropdown (Baymard: drop-downs hide sizes; 28% of sites still get it wrong);
     3. **Name & Number:** pills `None` / `Personalize +$15.00` (Real Madrid);
     4. Personalize opens Name (counter "4 / 12 characters") and Number ("1 / 2 numbers"), exactly as Real Madrid shows them;
     5. one prominent **Add to cart**, unique style, nothing competing (Baymard #791).
   - **The flip:** choosing Personalize or focusing Name turns the big image to the back (3D rotate, 0.7 s); the name and number appear on the blank back as you type, in Oswald, at the same coordinates as the product shots (`x=500, y=292, size 60, letter-spacing 8` and `x=500, y=640, size 300` in a 1000-unit box; see `extensions/kit-printer-block`), squeezed to fit (`textLength`) when long. Numbers pop in (scale 0.9 to 1).
   - **Errors** from `shared/print.js` show inline as you type. Errors from Shopify (`CartError`) show above Add to cart, word for word: they come from our Function.
   - **On phones:** image on top, panel below, and a sticky Add to cart bar with white space around it, not edge to edge (Baymard).
4. **Cart drawer**
   - Slides from the right (Motion).
   - Each line shows its thumbnail, size and **"Print: SAKA 7"**, and the unit price from the cart, which already includes the print (F1). Under the price, a small "Priced by Kit Printer in Shopify's checkout" with an info tooltip.
   - Quantity steppers.
   - Checkout opens the password sheet first.
5. **How it's built** (`/how-its-built`): the architecture, the three bugs from `WHAT-BROKE.md` in short, links to the repo, the Functions and the tests. In Zyad's voice, plain, no dashes.
6. **404:** a kit with "404" printed on the back.

**Motion rules:**
- Animate **transform and opacity only**.
- Use a **shared-element transition** from a card's image to the product image (Motion `layoutId`).
- Lenis smooth scroll on desktop only.
- Everything **respects `prefers-reduced-motion`**: no flip animation (swap instead), no parallax, no Lenis.
- Never animate on page load for more than 0.6 s before content is usable.

**Accessibility:**
- every control reachable by keyboard;
- size buttons are a radio group;
- the flip has Front and Back buttons with `aria-pressed`;
- cart errors in `role="alert"`;
- contrast AA;
- images have alt text from Shopify.

## Quality bar (Claude writes the unit tests; the local agent writes and runs the e2e)
- **Unit:** the cart mapping (attributes in, `Print` out, money in cents), the print rules (reuse `shared/print.js`, don't copy them), and the flip component's states.
- **E2E (Playwright, live store, fixed viewport, `--trace off`):**
  1. the collection shows 4 kits;
  2. on the away kit, pick M, Personalize, type "ronaldo" and "7": the image is on the back and shows RONALDO 7;
  3. add to cart: the cart line shows "Print: RONALDO 7" and **$104.99** (or the spike-b fallback text);
  4. number "100" can't be added, and the message is shown;
  5. the socks have no Personalize option;
  6. Checkout gets a `checkoutUrl` and the password sheet appears.
- **Lighthouse (mobile):** Performance 90+, Accessibility 95+.
- No console errors; no horizontal scroll at 360 px.
- `npm test` at the repo root still passes (the Functions are untouched).

## Deploy (local agent)
- **Cloudflare Pages project `kitsbyzizo`**, which gives `https://kitsbyzizo.pages.dev`.
- Build `cd storefront && npm ci && npm run build`, output `storefront/dist`.
- The **public** token is built into the browser bundle by design (F9: it's meant for browsers, read-only products and carts), so it lives in `storefront/.env.production` in git: `VITE_STORE_DOMAIN=kitsbyzizo.myshopify.com` and `VITE_STOREFRONT_TOKEN=<public token>`. The **private** token is never stored anywhere.
- Use `wrangler pages deploy storefront/dist --project-name kitsbyzizo`, or connect the repo in the Cloudflare dashboard.
- Check the live URL with the e2e suite.

## Afterwards (Zyad's other agent or Claude)
- Kit Printer README: a "Custom storefront" section, with the architecture and the live link.
- Portfolio card: "Open the store" points to `kitsbyzizo.pages.dev` (no password needed to browse).
- CV line, and the profile README.

## Sources
- Cart Transform API (surfaces): https://shopify.dev/docs/api/functions/latest/cart-transform
- Create and update a cart with the Storefront API: https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage
- Validation errors in the Storefront API: https://shopify.dev/docs/apps/build/checkout/cart-checkout-validation/create-checkout-validation and https://shopify.dev/docs/api/functions/latest/cart-and-checkout-validation
- Metafields in the Storefront API: https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/products-collections/metafields
- Getting started (Headless channel, tokens): https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started and https://shopify.dev/docs/api/storefront/latest
- Storefront API on a dev store (staff answer): https://community.shopify.dev/t/store-locked-error-when-fetching-storefront-api-on-the-server/23265
- Password protection and headless checkout: https://shopify.dev/docs/storefronts/headless/legacy/hydrogen/migrate and https://community.shopify.dev/t/every-checkouturl-ends-up-with-password-page-site-under-construction/24378
- Oxygen on dev stores needs a login: https://shopify.dev/docs/storefronts/headless/legacy/hydrogen/fundamentals
- Sports store patterns (Mammut, Roa Hiking, MAAP, Satisfy): https://commerce-ui.com/insights/11-best-sports-ecommerce-websites-examples-in-2025
- Size buttons, Add to cart: https://baymard.com/research-articles/use-buttons-for-size-selection and https://baymard.com/blog/ecommerce-ux-best-practices
- 21st.dev MCP: https://21st.dev/mcp
- Real Madrid shop (cards with size pills, Personalize +price, character counters, the flip): Zyad's screenshots, 20 Nov 2026
