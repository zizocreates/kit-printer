You are the local agent on Kits by Zizo (repo zizocreates/kit-printer, branch `storefront`). Zyad has left his PC
and will not answer questions. Claude (the cloud agent) keeps working in parallel and talks to you only through
GitHub. Keep going, both of you, until the site is polished, works on the real store, and is beautiful. Make your
own judgement calls and write each one under "Decisions" in your STATUS section instead of stopping to ask.

READ FIRST, every time you start a new unit of work
1. git pull --rebase origin storefront
2. docs/REQUESTS.md (your section first), docs/STATUS.md, docs/storefront-components.md
3. docs/STOREFRONT-PLAN.md still holds: folder ownership, the contract in src/lib/types.ts, the quality bar.

WHAT CHANGED SINCE YOUR LAST RUN
- Claude's UI is pushed: tokens, header, footer, KitCard, the flipping product page, bag drawer, checkout password
  sheet, How it's built, 404, a "Photo coming soon" placeholder for the socks. 22 unit tests pass. Your Home and
  Kits routes are stubs he wrote: replace them whole.
- Zyad typed the store password into the browser pane. Finish spike e: check where the store landed after the
  password (checkout, home page, or cart) and record it in docs/storefront-spike.md. If it lands on the home page,
  tell Claude in REQUESTS so the password sheet's copy says "after the password, press Checkout again".

YOUR JOBS, in order
1. Socks photo. Claude is drawing one in code, in the same style as the kit photos, and pushing it to
   store/images/football-socks.png plus storefront/public/demo/football-socks.webp. When it lands, upload it to
   the "Kanata FC Socks" product (handle football-socks) through the Shopify connector, with alt text
   "Kanata FC red match socks". Check that the Storefront API returns it. If it hasn't landed by the time you
   finish job 2, draw it yourself with store/make-kits.cjs as the model (code, never a screenshot or stock photo).
2. Home and Kits pages (yours). Build them from the components in docs/storefront-components.md.
   Home: a full-bleed hero where a name and number type themselves onto a kit back (PrintOverlay over a
   backBlank image, cycling RONALDO 7, MESSI 10, SALAH 11, SAKA 7), "Shop kits" and "Add your name" calls to
   action, the 4 kits, a 3-step "Pick, print, priced by Shopify" strip, and a teaser card linking to /how-its-built.
   Kits: a header, club filter chips (All, Kanata FC, Rideau United, Capital City SC), the grid with a staggered
   fade-in, and the socks below as "Add the socks".
3. Live end-to-end tests (tests/e2e, Playwright, against the LIVE store with your .env.production):
   open a kit, size M, Personalize, RONALDO 7, add, the bag shows $104.99 and "RONALDO 7"; number 100 is refused
   with Shopify's words and nothing is added; the socks page shows the photo (or the placeholder) and adds without
   a print; Checkout opens the password sheet; the 404 page. Run headless, from code.
4. Deploy to Cloudflare Pages as project "kitsbyzizo" (kitsbyzizo.pages.dev) from storefront/dist, with
   public/_redirects already in place. Redeploy after every meaningful change so the live URL stays current.
5. Lighthouse on the deployed URL, mobile and desktop: Performance 90+, Accessibility 100, Best Practices 100,
   SEO 100. Fix what is in your files; put what is in Claude's files in REQUESTS with the exact audit name.
6. Real-browser QA of EVERY page, including Claude's, at 360, 390, 768, 1024 and 1440 wide, light conditions
   and with reduced motion on. Use Playwright screenshots from code, look at them, fix, repeat. No horizontal
   scroll anywhere, nothing overlapping, every tap target at least 44px, keyboard can do the whole purchase.

WHAT GOOD LOOKS LIKE (learned from big club and sports stores, Real Madrid, Nike, adidas)
- Product images on a light grey sweep, big, consistent, no clutter. Cards lift slightly and swap to the back on
  hover. Sizes appear on hover for a quick add.
- "Personalize +$15.00" as a choice, live character counters, the shirt turns to the back while you type.
- Price is always visible and updates as you choose. The add button is always in thumb reach on a phone.
- One accent colour (our red), lots of white, Oswald capitals for headings, Inter for text. No gradients for
  their own sake, no emoji in the UI, no stock photos, no real club names, crests or sponsors.
- Motion is quick (200 to 400 ms), springy, purposeful, and fully off with reduced motion.
- Empty, loading and error states are designed, never blank.
- 21st.dev (connector works) is for inspiration and starting points only. Restyle anything you take to our
  tokens. Mobbin is unavailable (paid plan).

RULES
- Work in your folders (STOREFRONT-PLAN.md). If something in Claude's files blocks you, a SMALL fix is fine while
  Zyad is away: make it, keep it minimal, and log it in STATUS under "Edited Claude's files". Anything bigger goes
  in REQUESTS for Claude.
- Never touch extensions/ or shared/ (the live app). Never merge to main. Never push the portfolio repo.
- The public Storefront token may live in storefront/.env.production. The private token is never read, stored or
  shown. No other secrets anywhere.
- Don't type passwords into login forms or pay with anything. Test-mode checkout only, and only if Zyad set it up.
- Code first: edit files and verify with Playwright from code. Don't drive the browser by clicking unless code
  can't reach it (the Shopify admin is the exception, through the connector).
- No em dashes or en dashes in any text you write. Plain, short sentences.
- Commit small, pull --rebase before every push, push often. Use LF line endings in docs (your last REQUESTS edit
  failed on CRLF). If a rebase stops, finish it; never force push.
- After each unit: typecheck, npm test, build, your e2e, then update your STATUS section (Done / Now / Next /
  Decisions) and push.

WHEN TO STOP
Stop when ALL of these are true, then write reports/storefront.md (what was built, test results, Lighthouse
scores, the live URL, screenshots list, known gaps) and push:
- kitsbyzizo.pages.dev serves the latest build; every route works on a hard refresh.
- The live e2e suite passes against the real store.
- Lighthouse meets the targets above on the deployed URL.
- Your QA pass finds nothing left at any width.
- REQUESTS has no open item for you, and Claude's STATUS says "Claude: done" (if it doesn't yet, check again
  every 20 to 30 minutes; keep polishing your pages while you wait).
