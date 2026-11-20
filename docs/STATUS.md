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

**Done**
- **The site is live: https://kitsbyzizo.pages.dev** Connected the repo in the Cloudflare dashboard through Chrome (Zyad was already signed in). Project `kitsbyzizo`, repo `zizocreates/kit-printer`, production branch `storefront`, root directory `storefront`, build `npm ci && npm run build`, output `dist`. No environment variables needed, because `.env.production` is committed and the token is public by design (F9).
- **Every stop condition from the brief is met except one**, and that one needs Zyad:
  - Every route serves on a hard refresh (`/`, `/kits`, `/kits/:handle`, `/how-its-built`, unknown paths), and Claude's `_headers` are applied.
  - **Live e2e against the deployed URL: 14 of 14 pass.**
  - **Lighthouse on the deployed URL:** mobile home **90**, mobile kits **91**, desktop 97 to 99. **Accessibility, Best Practices and SEO are 100 on every page measured.**
  - **QA: 66 of 66**, six pages at 360, 390, 768, 1024 and 1440 on both projects, plus reduced motion and keyboard. No sideways scroll anywhere, no tap target under 44px.
- **Shopify side:** socks photo uploaded to the real product, socks vendor corrected to "Kanata FC".
- **Polish on my pages:** the three Home steps now show the product rather than describing it. Step 1 shows the kit and its real size pills; step 3 writes out the sum the Cart Transform makes, $89.99 plus $15.00 into one $104.99 line. Steps 1 and 3 had been mostly dead space beside Claude's live demo. Prices come from the kit, not hardcoded.
- Checked 21st.dev for a three-step section and a reassurance strip. Nothing in the results was close enough to our tokens to be worth restyling (they were SaaS and fintech heroes), so this came from club store patterns instead, which is what the brief asks for.

**Blocked on Zyad, and only him**
- **Automatic deployments are broken.** The Deployments tab says "This project is disconnected from your Git account. This may cause deployments to fail." The first build after connecting worked; pushes after `7ffb072` did not build. The repair is to re-authorise the Cloudflare Pages GitHub App at `github.com/settings/installations/181448739`, and GitHub puts that page into **sudo mode and asks for a 2FA verification code**. I do not enter verification codes or passwords, so this one is his. Everything in the project's own settings is correct.
- Until then Claude can trigger builds through the Cloudflare API, which is how `a50b7e7` got live. I have asked him in REQUESTS to push a build for `88b0877`.

**Next**
- Nothing of my own is pending. Claude has marked himself done.

**Decisions**
- **Production branch is `storefront`, not `main`.** The plan says merge to main only after the live e2e passes. It now has, so merging is a reasonable next step, but that is Zyad's call and the plan says never merge to main without him.
- **Root directory `storefront` with build `npm ci && npm run build`**, rather than a repo-root build command, so the Pages build matches what runs locally.
- **The three Home steps show rather than tell**, from how Real Madrid and Liverpool lay out an explainer: the thing itself at each step, not a caption about it.

**Edited Claude's files** (all small, all logged as the brief allows)
- `tests/unit/setup.ts`: all 22 unit tests failed on this machine. Node 26 defines a global `localStorage` that is `undefined` unless `--localstorage-file` is passed, and because the global already exists Vitest's jsdom environment does not put jsdom's own there (`sessionStorage` is still jsdom's, which is the giveaway). Added a small in-memory `Storage` stand-in, which is what that file is for.
- `src/lib/config.ts`: `API_VERSION` 2026-10 to 2026-04, to match hydrogen-react 2026.4, which logged a mismatch warning on every page load.
- `tests/unit/fixtures.test.ts`: one assertion said the socks have no photo, which my own socks upload made false.
- `src/routes/HowItsBuilt.tsx`: the last 360px overflow. `minmax(0,1fr)` on the rules playground's inner grid and `min-w-0` on its card, because a grid item defaults to `min-width: auto` and could not shrink past the input's intrinsic width.
