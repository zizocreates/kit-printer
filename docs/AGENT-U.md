# Kickoff: Agent U (design and UI, Fable)

You're building the look and feel of **Kits by Zizo**, a custom storefront for Zyad's Shopify app, Kit Printer. It's going to Shopify recruiters, so it has to feel like a real, premium club shop (think Real Madrid's official store) with smooth, purposeful motion. You work on Zyad's computer, in the kit-printer repo (https://github.com/zizocreates/kit-printer). Agent D builds the data layer at the same time.

**Read `docs/STOREFRONT-PLAN.md` first, completely.** It holds:
- the design spec (pages, layout, motion rules, accessibility), all backed by sources;
- the folder you own (`storefront/src/components`, `src/routes`, `src/styles`);
- the types and API you code against.

## Before you start
Add the 21st.dev MCP (`claude mcp add --transport http 21st-dev-mcp https://21st.dev/api/mcp`, or `/plugin install 21st@21st` per https://21st.dev/mcp). Use it for well-made React and Tailwind building blocks, then restyle each one to our tokens. Nothing ships looking like a stock component.

## Your order of work
1. `git checkout -b storefront-ui`. Wait for Agent D's `storefront/` scaffold and `src/lib/types.ts` (pull until they exist). Then build against `src/fixtures/*.json` until `src/lib` lands.
2. **Design tokens** in `src/styles/tokens.css`:
   - colours, spacing, radius, shadows, the type scale;
   - Oswald for headings and prints, from `store/fonts`;
   - Inter for text, from `@fontsource-variable/inter`.
3. **Components:**
   - product card (hover: lift, back image, size pills);
   - size radio group;
   - Personalize pills;
   - name and number fields with counters;
   - **KitStage**: one big image with the 3D flip, printing the name and number on `backBlank` at the plan's exact coordinates;
   - cart drawer;
   - password sheet;
   - header and footer.
4. **Pages:** Home, Collection (`/kits`), Product (`/kits/:handle`), How it's built (`/how-its-built`), 404. Add the shared-element transition from a card to the product page.
5. **Wire up to Agent D's `useCart`/`getKit`/`getCollection`** once merged: show `CartError` messages word for word, and prices from the cart.
6. **Polish:**
   - reduced motion everywhere;
   - keyboard paths;
   - no horizontal scroll at 360 px;
   - Lighthouse mobile Performance 90+, Accessibility 95+.

   Merge `storefront-ui` into `main` after Agent D's branch, and resolve conflicts in your own folders only.

## Rules
- **Code, not clicks.** Look at your work by running the dev server and reading the DOM. Take screenshots only to judge the visuals: at most 10 over the whole job, at `deviceScaleFactor: 1`.
- Use only assets from the repo (`store/images`) and from Shopify's CDN through the API. Copy no images, logos or text from Real Madrid or any other store; copy patterns only.
- Don't change `src/lib`, `extensions/` or `shared/`. If you need something from the data layer, write it down for Agent D in `docs/ui-needs.md` and push.
- Commit and push after every meaningful piece. Copy is plain and short, with no em or en dashes.

**At the end,** write `docs/storefront-report-U.md` with what you built, the Lighthouse scores, and 3 screenshots (home, product page turned to the back with RONALDO 7, phone). Push, then tell Zyad "Agent U done".
