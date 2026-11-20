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
- Done (polish 2): README storefront section; axe pass on every route, the open print fields and the bag (fixed: the notice strip is a landmark, KitCard heading level is a prop); **two-step password sheet** for the spike e finding. **25 unit tests pass.**
- Done (polish 3, from the local agent's QA): every tap target 44px, responsive Shopify CDN images in KitCard/KitStage/bag (`src/lib/cdn.ts`), single "Default Title" variant handled everywhere (`src/lib/variants.ts`), socks test hardened. **26 unit tests pass.**
- Deployed by the local agent: **kitsbyzizo.pages.dev** (Git-connected, redeploys on push). Checked live with Firecrawl: real products, sized CDN images, OG tags.
- Done (polish 4, club store research `docs/research/club-stores.md`): Popular prints, Complete the kit on the product page, Delivery and returns, theme-only description line removed on our site, a 360px grid overflow fix. **29 unit tests pass.**
- Next: the portfolio card for kitsbyzizo.pages.dev waits for Zyad's go-ahead.

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
- Nothing in flight. Everything that does not need Zyad is done and pushed.

**Next (blocked on Zyad)**
- **Cloudflare Pages deploy.** No credentials on this machine: no `CLOUDFLARE_API_TOKEN`, no wrangler config, no login. `wrangler login` needs his consent in a browser, and the `kitsbyzizo` project is his account to create. Everything else is ready: `dist` builds clean, `public/_redirects` is in place, and both suites already take `E2E_BASE_URL` for a deployed URL.
- **Lighthouse on the deployed URL**, which needs the deploy.

**Also done since the last update**
- **Socks photo uploaded** to the real product through the Admin API staged upload flow (the connector's upload tool opens a file picker, which is no use with nobody at the machine). Confirmed through the Storefront API: 1600 square, alt "Kanata FC red match socks", `print_price` still null. Also set the socks **vendor to "Kanata FC"** (it was "kitsbyzizo", which showed as KITSBYZIZO beside CAPITAL CITY SC).
- **Spike e finished:** the password lands you on the **store home page**, not the checkout; once the cookie is set a fresh `checkoutUrl` goes straight through to `/checkouts/cn/...`, and the order summary reads **$104.99 with Print name SAKA and Print number 7**, subtotal $119.98.
- **Live e2e suite: 14 of 14 pass** (`tests/e2e/shop.spec.ts`, 7 tests on desktop 1440 and the same 7 on the iPhone 13 profile, each failing on any console error).
- **QA pass: 35 pass, 31 fail** (`tests/e2e/qa.spec.ts`, 6 pages at 360/390/768/1024/1440 on both projects, plus reduced motion and keyboard). **No horizontal scroll anywhere.** Reduced motion is honoured. The whole purchase works on the keyboard. All 31 failures are one finding: six tap targets under 44px, every one in Claude's components, listed with measurements in REQUESTS.
- **Lighthouse on the local production build:** desktop home **100/100/100/100**, desktop kits 98, mobile home **90**, mobile kits **87**. Accessibility, Best Practices and SEO are 100 everywhere. Mobile home was 88 until I sized the hero image to what it is actually drawn at and preloaded it. Mobile kits is the one under target; the audit is `uses-responsive-images` and the cause is `KitCard`, which is Claude's file.
- **Report written: `reports/storefront.md`.**

**Decisions**
- **Images ask Shopify's CDN for the size they are drawn at** (`components/home/cdn.ts`: `sized` and `srcSet`). This is what took mobile home from 88 to 90 and desktop home to 100.
- **Tap targets are judged only under touch emulation.** On a pointer device the kit card quick-add panel is visible and its 36px pills would be flagged, but that panel is `display:none` on touch, so measuring it there measures something a phone never gets.
- **The mobile Playwright project runs the iPhone 13 profile in Chromium**, not WebKit: it is the engine Lighthouse mobile uses, and it keeps the suite to one browser download.
- **Storefront API version is now `2026-04`, not `2026-10`.** hydrogen-react 2026.4 logged a version mismatch warning on every page load. I checked 2026-04 against the live store: same collection, same metafields, same `back_image` reference. Matching the kit we ship beats being ahead of it, and the console is clean now.
- **Club chips are derived from `kit.vendor`, not hardcoded.** The brief listed three clubs; reading them from the data means a fifth kit needs no code change. Chips only appear when there is more than one club.
- **The socks are a "View socks" link, not a quick add, on the Kits page.** They have one variant and no print, so sending people to the product page keeps one way to buy and avoids a second add-to-bag path to test.
- **The hero uses the first kit that has a `backBlank`** rather than a fixed handle, so it cannot break if a product is unpublished.
- **Reduced motion:** my typing and cycling are plain timers, not motion/react, so `MotionConfig` cannot switch them off. `useCalm` does it: no typing, no cycling, no parallax, one finished print shown instead.

**Edited Claude's files** (all small, all logged as the brief allows)
- `tests/unit/setup.ts`: **all 22 unit tests failed on this machine** before the fix. Node 26 defines a global `localStorage` that is `undefined` unless `--localstorage-file` is passed, and because the global already exists Vitest's jsdom environment does not put jsdom's own there (`sessionStorage` is still jsdom's, which is the giveaway). Added a small in-memory `Storage` stand-in, which is what that file is for. Not a bug in the app, and it passes in Claude's container because its Node is older.
- `src/lib/config.ts`: `API_VERSION` 2026-10 to 2026-04, see Decisions.
- `tests/unit/fixtures.test.ts`: one assertion said the socks have no photo, which my own socks upload made false.
