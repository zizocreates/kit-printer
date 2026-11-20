# Kits by Zizo: the custom storefront (local agent report)

20 November 2026. Written by the local agent, on Zyad's machine, against the real store `kitsbyzizo.myshopify.com`.

**This is an interim report.** Everything that can be done without Zyad is done and pushed. Two jobs are blocked on him, both for the same reason: there are no Cloudflare credentials on this machine. See "What is blocked" at the bottom.

## The headline

A cart built entirely by our own React code, through the Storefront API, arrives in Shopify's checkout like this:

```
Kanata FC Away Kit 26/27  M
  Print name: SAKA
  Print number: 7                1     $104.99
Kanata FC Socks                  1      $14.99
Subtotal, 2 items                      $119.98
```

No theme. No server of ours. The $104.99 is Kit Printer's Cart Transform Function doing its job on a cart it has never seen before, and a bad print is refused by the Validation Function with its own words. That is the whole pitch, and it is now something that happened rather than something claimed.

## What was built

- **The Shopify side.** Headless channel installed; installing it created the storefront "Kits By Zizo Headless" (id 432818) on its own. The 4 kits, the socks and the `kits` collection are published to publication `220251324487`. The four `kit_printer` metafield definitions were already on `PUBLIC_READ`, so nothing was changed there. The public Storefront token lives in `storefront/.env.production`, which is correct: it is a browser token (F9). The private token was never read or stored.
- **Phase 0 spike:** all five checks pass. Written up in `docs/storefront-spike.md`, with the real responses saved in `storefront/src/fixtures/`.
- **The socks photo.** Claude drew it in code; I uploaded it to the real product through the Admin API staged upload flow and confirmed the Storefront API returns it (1600 square, alt "Kanata FC red match socks"). I also corrected the socks vendor from "kitsbyzizo" to "Kanata FC".
- **My two pages**, built from Claude's components and tokens:
  - **Home:** a hero where a name and number type themselves onto the blank kit back and cycle through RONALDO 7, MESSI 10, SALAH 11 and SAKA 7, with scroll parallax; the four kits; a three step "Pick, print, priced by Shopify" strip whose middle step is a **live demo running `shared/print.js`**, the same rules file the checkout Function runs; and the "How it's built" teaser.
  - **Kits:** club filter chips built from the data rather than hardcoded, a live count, a staggered fade in, and the socks underneath as "Add the socks".
- **Two test suites of my own**, both from code, both against the real store.

## Test results

**Unit (Claude's, run here): 23 of 24 pass.** The one failure is Claude's own new "the bag offers the socks until they are in it" test, which is order dependent: run alone the bag never opens, run with the file the offer is missing. Diagnosed and handed to him in `docs/REQUESTS.md`. Not a bug in the shipped site.

**Live end to end (`tests/e2e/shop.spec.ts`): 14 of 14 pass**, 7 tests on desktop 1440 and the same 7 on the iPhone 13 profile. Every one also fails on any console error.

| Test | Result |
|---|---|
| The kits page lists four kits, and the club chips filter | pass |
| A printed kit reaches the bag at **$104.99** with "Print: RONALDO 7" | pass |
| Number 100 is refused in the shared rules' own words, nothing added | pass |
| The socks offer no Personalize and add without a print | pass |
| Checkout shows the password sheet | pass |
| The 404 kit, for both an unknown kit and an unknown page | pass |
| Home renders, its live rules demo works, nothing scrolls sideways | pass |

**Live data contract (`tests/e2e/live-data.check.mts`): 33 of 33 pass.** Runs Claude's own `queries.ts` and `map.ts` against the real store rather than fixtures, so the contract is proven on real data, including the refusal path.

**QA pass (`tests/e2e/qa.spec.ts`): 35 pass, 31 fail.** Six pages at 360, 390, 768, 1024 and 1440, on both projects, plus reduced motion and keyboard.

- **No horizontal scroll anywhere.** Every page, every width, both projects. This was the main thing to prove and it is clean.
- **Reduced motion is honoured:** the hero shows one finished print and does not cycle, and the product page still shows the print without animating the flip.
- **The whole purchase works on the keyboard:** arrow keys move through the size radio group, Enter turns on Personalize, and Enter on Add to bag opens the bag with "KEYBOARD 9" on the line.
- **The 31 failures are all one finding:** six tap targets under 44px, every one in Claude's components. The bag button in the header is 40 x 40 and appears on every page, which is why it fails all 30 combinations by itself. The rest are the Front/Back toggles (36px), the Size guide button (20px) and the Details and Print rules summary rows (20px). All are listed with measurements in `docs/REQUESTS.md`. The kit card quick-add pills are deliberately **not** in that list: they are `pointer:fine` only, so a phone never gets them, which is why the tap-target check only runs under touch emulation.

## Lighthouse

Run against the local production build (`vite preview`), because there is no deployed URL yet.

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Home, desktop | **100** | 100 | 100 | 100 |
| Kits, desktop | **98** | 100 | 100 | 100 |
| Home, mobile | **90** | 100 | 100 | 100 |
| Kits, mobile | **87** | 100 | 100 | 100 |

Accessibility, Best Practices and SEO are **100 everywhere**, which beats the target (Accessibility 100 was the bar).

Home mobile started at 88. The LCP element was my hero image: a 1600px kit shot drawn 380px wide. Asking Shopify's CDN for the size actually drawn, plus a preconnect and a preload of the hero, took it to 90 and desktop to 100.

**Kits mobile is 87 and is the one score still under target.** The audit is `uses-responsive-images`, 455 KiB, and the cause is `KitCard` serving full size originals. That is Claude's file, so it is in `docs/REQUESTS.md` with the audit name and a ready-made helper.

## Decisions I made

- **Storefront API 2026-04, not 2026-10.** hydrogen-react 2026.4 logged a version mismatch warning on every page load. 2026-04 returns the same collection, metafields and `back_image` reference from the live store, so matching the kit we ship beats being ahead of it.
- **Club chips come from `kit.vendor`**, so a fifth kit needs no code change.
- **The socks are a "View socks" link, not a quick add**, on the Kits page: one variant, no print, so one way to buy.
- **The mobile Playwright project runs the iPhone 13 profile in Chromium**, not WebKit: it is the engine Lighthouse mobile uses, and it keeps the suite to one browser download.
- **Tap targets are judged only under touch emulation**, for the `pointer:fine` reason above.
- **The hero picks the first kit that has a `backBlank`** rather than a fixed handle, so unpublishing a product cannot break the page.

## Files I changed that belong to Claude

Both small, both logged, both in `docs/REQUESTS.md` so he sees them.

- `tests/unit/setup.ts`: **all 22 unit tests failed on this machine** before this. Node 26 defines a global `localStorage` that is `undefined` unless `--localstorage-file` is passed, and because the global already exists Vitest's jsdom environment does not put jsdom's own one there. `sessionStorage` still being jsdom's is the giveaway. Added a small in-memory `Storage` stand-in, which is what that file is for.
- `src/lib/config.ts`: the API version, above.
- `tests/unit/fixtures.test.ts`: one assertion said the socks have no photo. My own socks upload made that false.

## What is blocked

Both need Zyad, and both are quick once he is back.

1. **The Cloudflare Pages deploy.** There are no Cloudflare credentials on this machine: no `CLOUDFLARE_API_TOKEN`, no wrangler config, no login. `wrangler login` needs a browser consent on his account, and creating the `kitsbyzizo` Pages project is his account's to create. Everything else is ready: `storefront/dist` builds clean, `public/_redirects` is in place for SPA routes, and the suites are already written to run against a deployed URL with `E2E_BASE_URL=https://kitsbyzizo.pages.dev npx playwright test`.
2. **Lighthouse on the deployed URL.** Needs 1. The local numbers above should be a floor rather than a ceiling, since Cloudflare's CDN and compression will beat `vite preview`.

## Screenshots

31 full page screenshots in `storefront/test-results/qa/`, one per page per width, plus `home-reduced-motion.png` and `product-reduced-motion.png`. They are build output and are gitignored, so they are on this machine only. Regenerate with `npx playwright test qa.spec.ts`.

## Known gaps

- The six tap targets, and Kits mobile at 87. Both with Claude, both small.
- The live bag's socks offer shows a size pill labelled "Default Title", because the real socks have one unnamed variant while the demo catalog gives them S/M/L/XL. Cosmetic, live only, with Claude.
- The checkout password sheet is still one step. Spike e proved that entering the store password lands the buyer on the **home page**, not the checkout, so the sheet needs the two step version from the plan. This is the one real flaw left in the buy flow, and it is with Claude.
