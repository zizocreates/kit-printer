# Kickoff: Agent D (data and integration, Opus)

You're building the data side of **Kits by Zizo**, a custom storefront for Zyad's Shopify app, Kit Printer. You work on Zyad's computer, in the kit-printer repo (https://github.com/zizocreates/kit-printer). Another agent, Agent U, builds the UI at the same time.

**Read `docs/STOREFRONT-PLAN.md` first, completely.** It holds:
- the verified facts (F1 to F10), so don't re-research them;
- the folder you own (`storefront/src/lib`, `src/fixtures`, `tests/e2e`);
- the exact types you must write first;
- Phase 0, the deploy steps and the quality bar.

## Your order of work
1. `git checkout -b storefront-data`. Scaffold `storefront/` (Vite 8, React 19, TypeScript, Tailwind 4) with the folder layout in the plan.
2. **Write `src/lib/types.ts` exactly as in the plan's contract, and push it right away.** Agent U is waiting on it.
3. **Phase 0, the spike.**
   - The admin steps: Headless channel and token; publish the products to Headless; Storefronts access on the 4 metafields.
   - Then checks a to e.
   - Save the real responses to `src/fixtures/*.json` (no tokens in them) and write `docs/storefront-spike.md`. Push.
   - If check a or b fails, stop and tell Zyad.
4. Build `src/lib`:
   - the client (`@shopify/hydrogen-react` helpers);
   - the queries;
   - `getCollection`, `getKit`;
   - `useCart`, with print attributes exactly `Print name` and `Print number`, `CartError` from `userErrors`, and `checkout()`.
   - `src/lib/print.ts` re-exports `../../../shared/print.js`; never copy the rules.

   Add unit tests.
5. The e2e suite in the plan, then deploy to Cloudflare Pages (`kitsbyzizo`), then run e2e against the live URL.
6. Merge `storefront-data` into `main` once e2e passes; Agent U merges after you. Run the repo-root `npm test` before merging (the Functions must still pass).

## Rules
- **Code and commands, not clicks or screenshots.** Admin clicks only for the three one-time admin steps. Check things with curl, GraphQL responses and tests.
- **Secrets:** the public Storefront token goes in `storefront/.env.local` and the Cloudflare env vars only. The private token is never stored anywhere. The store password (`futureshopifolk`) is meant to be public for recruiters; it's fine in the UI copy.
- Don't change `extensions/` or `shared/`. If a Function needs a change, stop and tell Zyad.
- Commit and push after every meaningful piece. Write plainly, with no em or en dashes.

**At the end,** write `docs/storefront-report-D.md`: what works, the spike results, the e2e results, the live URL, and anything left. Push, then tell Zyad "Agent D done".
