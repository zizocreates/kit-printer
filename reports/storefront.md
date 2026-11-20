# Kits by Zizo: the custom storefront (local agent report)

20 November 2026. Written by the local agent, on Zyad's machine, against the real store `kitsbyzizo.myshopify.com`.

**Live: https://kitsbyzizo.pages.dev** (no password needed to browse; only the checkout asks for one).

## The headline

A cart built entirely by our own React code, through the Storefront API, arrives in Shopify's checkout like this:

```
Kanata FC Away Kit 26/27  M
  Print name: SAKA
  Print number: 7                1     $104.99
Kanata FC Socks                  1      $14.99
Subtotal, 2 items                      $119.98
```

No theme. No server of ours. The $104.99 is Kit Printer's Cart Transform Function doing its job on a cart it has never seen before, and a bad print is refused by the Validation Function in its own words. That is the whole pitch, and it is now something that happened rather than something claimed.

## What shipped

- **Shopify.** Headless channel installed; installing it created the storefront "Kits By Zizo Headless" (id 432818) on its own. The 4 kits, the socks and the `kits` collection are published to publication `220251324487`. The four `kit_printer` metafield definitions were already `PUBLIC_READ`, so nothing was changed there. The public Storefront token lives in `storefront/.env.production`, which is correct: it is a browser token (F9). The private token was never read or stored.
- **Phase 0 spike: all five checks pass.** `docs/storefront-spike.md`, with the real responses in `storefront/src/fixtures/`.
- **The socks photo.** Claude drew it in code; I uploaded it to the real product through the Admin API staged upload flow and confirmed the Storefront API returns it (1600 square, alt "Kanata FC red match socks"). I also corrected the socks vendor from "kitsbyzizo" to "Kanata FC".
- **My two pages**, built from Claude's components and tokens:
  - **Home:** a hero where a name and number type themselves onto the blank kit back and cycle through RONALDO 7, MESSI 10, SALAH 11 and SAKA 7, with scroll parallax; the four kits; a three step strip; and the "How it's built" teaser. Each step now **shows** the thing rather than captioning it: the kit and its real size pills, a live demo running `shared/print.js`, and the sum the Function makes written out as $89.99 + $15.00 into one $104.99 line.
  - **Kits:** club filter chips built from the data rather than hardcoded, a live count, a staggered fade in, and the socks underneath as "Add the socks".
- **The deploy.** Connected `zizocreates/kit-printer` to Cloudflare Pages as project `kitsbyzizo`, production branch `storefront`, root directory `storefront`, build `npm ci && npm run build`, output `dist`. No environment variables are needed because the token is public by design.

## Test results, against the deployed site

**Live end to end (`tests/e2e/shop.spec.ts`): 14 of 14 pass** against `kitsbyzizo.pages.dev`, 7 tests on desktop 1440 and the same 7 on the iPhone 13 profile. Every test also fails on any console error.

| Test | Result |
|---|---|
| The kits page lists four kits, and the club chips filter | pass |
| A printed kit reaches the bag at **$104.99** with "Print: RONALDO 7" | pass |
| Number 100 is refused in the shared rules' own words, nothing added | pass |
| The socks offer no Personalize and add without a print | pass |
| Checkout shows the two step password sheet, step one opening `/password` in its own tab | pass |
| The 404 kit, for both an unknown kit and an unknown page | pass |
| Home renders, its live rules demo works, nothing scrolls sideways | pass |

**QA (`tests/e2e/qa.spec.ts`): 66 of 66 pass.** Six pages at 360, 390, 768, 1024 and 1440, on both projects, plus reduced motion and keyboard.

- **No horizontal scroll anywhere.**
- **No tap target under 44px**, measured under touch emulation.
- Reduced motion is honoured: the hero shows one finished print and does not cycle.
- The whole purchase works on the keyboard: arrow keys through the size radio group, Enter to personalise, Enter to add, and the bag opens with the print on the line.

**Unit: 29 pass.** **Live data contract (`tests/e2e/live-data.check.mts`): 33 of 33**, running Claude's own `queries.ts` and `map.ts` against the real store rather than fixtures.

## Lighthouse, on the deployed URL

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Home, desktop | 98 | **100** | **100** | **100** |
| Kits, desktop | 99 | **100** | **100** | **100** |
| Product, desktop | 98 | **100** | **100** | **100** |
| How it's built, desktop | 97 | **100** | **100** | **100** |
| Home, mobile | **90** | **100** | **100** | **100** |
| Kits, mobile | **91** | **100** | **100** | **100** |

Targets were Performance 90+ and Accessibility 100. Both are met everywhere, and Best Practices and SEO are 100 as well.

Mobile home started at 88. The LCP element was the hero image: a 1600px kit shot drawn 380px wide. Asking Shopify's CDN for the size actually drawn, plus a preconnect and a preload, fixed it. Mobile kits started at 87 on the same audit (`uses-responsive-images`) in `KitCard`; Claude applied the same helper there and it went to 91.

## The deploy, and the one thing that looked like a blocker

Deployments stopped after the first build, and the Deployments tab showed "This project is disconnected from your Git account". That banner pointed at the Cloudflare Pages GitHub App, whose settings page GitHub guards with sudo mode and a 2FA code, so it looked like it needed Zyad.

It did not. The real cause was simpler: **the project's production branch had been switched to `main`**, while all the work is on `storefront`. Pushes to a branch that is not the production branch only make preview builds, so the live URL stopped moving. Setting the production branch back to `storefront`, with automatic deployments enabled, fixed it, and the banner cleared on its own.

Worth knowing: while production pointed at `main`, Cloudflare ran a build from `main` (`b4752fb`), which does not contain the storefront app. It never took over the live URL; production stayed on the last good `storefront` build.
## Decisions

- **Storefront API 2026-04, not 2026-10.** hydrogen-react 2026.4 logged a version mismatch warning on every page load; 2026-04 returns the same data from the live store.
- **Production branch is `storefront`, not `main`.** The plan says merge to main only after the live e2e passes. It has now, so merging is a sensible next step, but that is Zyad's call.
- **Club chips come from `kit.vendor`**, so a fifth kit needs no code change.
- **The mobile Playwright project runs the iPhone 13 profile in Chromium**, the engine Lighthouse mobile uses.
- **Tap targets are judged only under touch emulation**, because the kit card quick-add pills are `pointer:fine` only and a phone never gets them.
- **The Home steps show rather than tell**, taken from how Real Madrid and Liverpool lay out an explainer. 21st.dev was checked first; its matches were SaaS and fintech heroes, nothing close enough to our tokens to be worth restyling.

## Files I changed that belong to Claude

All small, all logged in `docs/STATUS.md` and raised in `docs/REQUESTS.md`.

- `tests/unit/setup.ts`: **all 22 unit tests failed on this machine** before this. Node 26 defines a global `localStorage` that is `undefined` unless `--localstorage-file` is passed, so Vitest's jsdom environment does not supply its own.
- `src/lib/config.ts`: the API version, above.
- `tests/unit/fixtures.test.ts`: one assertion said the socks have no photo, which my own upload made false.
- `src/routes/HowItsBuilt.tsx`: the last 360px overflow. A grid item defaults to `min-width: auto`, so the rules playground could not shrink past its input's intrinsic width. `minmax(0,1fr)` and `min-w-0`.

## Screenshots

31 full page screenshots in `storefront/test-results/qa/`, one per page per width, plus `home-reduced-motion.png` and `product-reduced-motion.png`. They are build output and gitignored, so they live on this machine only. Regenerate with `npx playwright test qa.spec.ts`.

## Known gaps

- Nothing outstanding on the deploy; see above.
- One of Claude's unit tests ("the bag offers the socks until they're in it") was order dependent when I last saw it fail. His latest push may have settled it; 29 of 29 pass here now.
- The storefront branch has not been merged to `main`. That is deliberate and Zyad's call.
