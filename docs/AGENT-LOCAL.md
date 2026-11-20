# Kickoff: the local agent

You're joining a project already in progress. You have none of the context, so this file and the repo give you all of it.

## The project in one paragraph
Zyad (Grade 12) is applying for Shopify's Summer 2027 software engineering internship. Deadline: 30 November 2026.

His project is **Kit Printer**, a Shopify app that puts names and numbers on football kits:
- the **price** and the **check** run inside Shopify's checkout as **Shopify Functions**, already built, tested and live on his test store `kitsbyzizo.myshopify.com`;
- a product page block lets buyers type a name and see it on the shirt.

Now we're building **Kits by Zizo**, a fully custom storefront: our own React site on Shopify's **Storefront API**, hosted on Cloudflare Pages. Checkout stays Shopify's, so Kit Printer's Functions still price and check every print. The pitch to recruiters: *a 100% custom site, and the rules still can't be skipped.*

## Step 0: get the code
```bash
git clone https://github.com/zizocreates/kit-printer.git   # or, if it's already here:
cd kit-printer && git fetch origin && git checkout storefront && git pull
```
Read these, in order, completely, before doing anything else:
1. `docs/STOREFRONT-PLAN.md`: the plan, the verified facts F1 to F10 (don't re-research them), the design, the contract and who owns which folder.
2. `README.md` and `WHAT-BROKE.md`: what Kit Printer is.
3. `docs/STATUS.md` and `docs/REQUESTS.md`: where things stand. Keep your section of each up to date as you work.

## Who does what (you work at the same time as Claude)
- **Claude (in the cloud, another session).** Its container can't reach Shopify, so it builds against fixtures and a demo mode that runs the real Function code. It's building now:
  - the types contract;
  - the data layer;
  - the design system (tokens, fonts, motion);
  - the shared components (buttons, size pills, kit card, cart drawer, password sheet, header and footer);
  - the product page with the turning shirt, How it's built and the 404.

  It lists its components in `docs/storefront-components.md`.
- **You:**
  1. the connector check below;
  2. the Shopify setup and the spike (Phase 0 in the plan);
  3. the fixtures;
  4. **the homepage and the Kits page**, built from Claude's components and tokens, in the files you own;
  5. checking the site in a real browser with real data;
  6. the e2e tests, Lighthouse and the deploy.

  Both of you build the design, so it has to look like one site: use Claude's tokens and components, and don't invent new colours or fonts.

## Step 1: check the connectors (report before anything else)
Run one small, read-only call on each, and report the result in `docs/STATUS.md` (your section) and in chat:
- **Shopify:** get the shop info. It must be **kitsbyzizo** (`kitsbyzizo.myshopify.com`). If it's another store, or it asks for sign-in, stop and tell Zyad. Then list the server's skills.
- **21st.dev:** search or get inspiration for "ecommerce product card with size pills on hover", limit 3.
- **Mobbin:** one screen search, limit 2 ("sports apparel product page with personalization"). Claude's session got "requires a paid plan"; say what you get.
- **Claude in Chrome:** confirm it's available.
- **Locally:** `node -v` (22 or newer), `shopify version`, and `npx playwright --version`.

## Step 2: Shopify setup and the spike
Follow Phase 0 in the plan:
1. **Use the Shopify connector for the admin work where it can do it:**
   - publish the 4 kits and the socks to the Headless channel;
   - set `access.storefront = PUBLIC_READ` on the metafield definitions `kit_printer.print_price`, `shirt_colour`, `print_colour` and `back_image` (`metafieldDefinitionUpdate`; look up the ids first, never guess them);
   - upload images if needed.
2. **Only installing the Headless channel and creating its storefront token needs the admin in the browser.**
3. Put the **public** token in `storefront/.env.production`; it's public by design. Never store the private token.
4. Run checks a to e from the plan with curl, save the real responses to `storefront/src/fixtures/`, and write `docs/storefront-spike.md`. Push, update STATUS, and tell Zyad the 5 results in one line each. If a or b fails, stop.

## Step 3: your pages
When `docs/storefront-components.md` exists, build `src/routes/Home.tsx` and `src/routes/Collection.tsx` (and anything under `src/components/home/`) to the plan's design section:
- **Home:** the hero with the fanned kits and scroll parallax, the kit grid, "How printing works" with a tiny live demo, and the "How it's built" teaser.
- **Kits page:** the grid of Claude's kit cards.
- Use 21st.dev for starting points, restyled to the tokens.
- Respect `prefers-reduced-motion`.
- No horizontal scroll at 360 px.

## Step 4: when Claude marks the product page done in STATUS
Run the site against the real store (`cd storefront && npm ci && npm run dev`), then:
1. write and run the e2e suite from the plan;
2. deploy to Cloudflare Pages project `kitsbyzizo`;
3. run e2e against the live URL;
4. run Lighthouse on mobile.

Write `docs/storefront-report-local.md`, then tell Zyad "local done".

## Rules
- **Code and commands, not clicks or screenshots.** Check pages by reading the DOM and console. At most 5 screenshots in the whole job, for judging visuals and for the report.
- **Stay in your own files.** Ask Claude for anything else in `docs/REQUESTS.md`. Run `git pull --rebase origin storefront` before every push, and commit small and often.
- Don't touch `extensions/` or `shared/` (the live Functions).
- **What's public and what isn't:**
  - The store password `futureshopifolk` is public on purpose: recruiters use it. It's fine in UI copy, never in screenshots of the admin.
  - No card details anywhere.
  - Don't name the client of Zyad's other project, BasilBot.
- Write plainly, with no em or en dashes.
