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

**Done**
- **Connectors:** Shopify works (store confirmed Kits by Zizo). 21st.dev works. **Mobbin unavailable** (paid plan). Claude in Chrome works. Node v26.13.0, npm 11.20.0, Shopify CLI 5.0.2, Playwright 1.65.1.
- **Shopify setup:** Headless channel installed; installing it created the storefront "Kits By Zizo Headless" (id 432818) by itself. Public token in `storefront/.env.production`; the private token was never read or stored. Published the 4 kits, the socks **and the `kits` collection** to publication `220251324487`. Metafield storefront access (F7) was **already correct**, so no mutation was run.
- **Spike: all five checks pass.** `docs/storefront-spike.md`, real responses in `storefront/src/fixtures/`.
  - **b:** a cart built by our own site comes back `cost.amountPerQuantity` **104.99**. So **the "applied at checkout" fallback copy is not needed.**
  - **e, now finished:** `checkoutUrl` hits `/password`; entering the password lands on the **store home page**, not checkout; once the cookie is set a fresh `checkoutUrl` goes straight to `/checkouts/cn/...`, where the order summary reads **Kanata FC Away Kit 26/27 M, Print name: SAKA, Print number: 7, $104.99**, subtotal $119.98. The whole pitch, proven.
- **Claude's data layer checked live:** his own `queries.ts` and `map.ts` against the real store, 33 checks, all pass (`storefront/tests/e2e/live-data.check.mts`, `npx vite-node tests/e2e/live-data.check.mts`).
- **My pages are built:** `routes/Home.tsx` and `routes/Collection.tsx` replaced whole, plus `components/home/` (`HeroPrint`, `PrintingSteps`, `BuiltTeaser`, `useCalm`).
  - Home: hero with a name and number typing themselves onto the blank kit back (RONALDO 7, MESSI 10, SALAH 11, SAKA 7), scroll parallax, "Shop kits" and "Add your name", the 4 kits, a three step "Pick, print, priced by Shopify" strip whose middle step is a **live demo running `shared/print.js`**, and the How it's built teaser.
  - Kits: heading, club chips built from the data (All, Capital City SC, Kanata FC, Rideau United), a live count, staggered fade in, and the socks underneath as "Add the socks".
  - Verified in a real browser on real data: both titles set, 4 cards, chips filter correctly (Kanata FC gives 2 kits, `aria-pressed` right), the hero really types and cycles, **no console errors, no horizontal scroll**. `tsc` clean, **22 unit tests pass**, `vite build` ok.

**Now**
- Playwright: the live e2e suite, then the width and reduced motion QA pass.

**Next**
- Cloudflare Pages deploy, Lighthouse on the deployed URL, then `reports/storefront.md`.

**Decisions**
- **Storefront API version is now `2026-04`, not `2026-10`.** hydrogen-react 2026.4 logged a version mismatch warning on every page load. I checked 2026-04 against the live store: same collection, same metafields, same `back_image` reference. Matching the kit we ship beats being ahead of it, and the console is clean now.
- **Club chips are derived from `kit.vendor`, not hardcoded.** The brief listed three clubs; reading them from the data means a fifth kit needs no code change. Chips only appear when there is more than one club.
- **The socks are a "View socks" link, not a quick add, on the Kits page.** They have one variant and no print, so sending people to the product page keeps one way to buy and avoids a second add-to-bag path to test.
- **The hero uses the first kit that has a `backBlank`** rather than a fixed handle, so it cannot break if a product is unpublished.
- **Reduced motion:** my typing and cycling are plain timers, not motion/react, so `MotionConfig` cannot switch them off. `useCalm` does it: no typing, no cycling, no parallax, one finished print shown instead.

**Edited Claude's files** (both small, both logged as the brief allows)
- `tests/unit/setup.ts`: **all 22 unit tests failed on this machine** before the fix. Node 26 defines a global `localStorage` that is `undefined` unless `--localstorage-file` is passed, and because the global already exists Vitest's jsdom environment does not put jsdom's own there (`sessionStorage` is still jsdom's, which is the giveaway). Added a small in-memory `Storage` stand-in, which is what that file is for. Not a bug in the app, and it passes in Claude's container because its Node is older.
- `src/lib/config.ts`: `API_VERSION` 2026-10 to 2026-04, see Decisions.
