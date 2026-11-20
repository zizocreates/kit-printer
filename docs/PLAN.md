# Kit Printer: the plan

Names and numbers on football kits, priced and checked inside Shopify's own checkout, for my store.

## Why it's built this way
Personalization apps run in the store theme's JavaScript, and their 1-star reviews say what that costs: they break on new themes, and custom data goes missing from orders. Kit Printer does the two parts that matter inside Shopify's checkout, as Shopify Functions:
- **the price** (`extensions/kit-printer-price`, a Cart Transform Function): a shirt with a valid print has its own line's price raised by the product's printing price, so there's no separate "printing" item that a quantity change could leave behind;
- **the check** (`extensions/kit-printer-check`, a Validation Function): a bad name or number blocks the checkout, even if someone skips the product page.

No server: Shopify runs the Functions, so there is nothing to host and nothing to go down.

## Status
- [x] Day 0: the rules (`shared/print.js`), both Functions, tests (`npm test`), checked by breaking the code on purpose.
- [x] Day 1: accounts, the dev store (Plus), the app, both Functions; SAKA 7 costs $104.99 and the four break-it checks hold (reports/day1.md).
- [x] Days 2 to 3: the product page block with a live shirt preview, released as kit-printer-2 and checked with dev mode off (reports/day2.md, day2b.md).
- [ ] Days 4 to 5: the printing price set per product (metafield `kit_printer.print_price`), the order page block showing the print.
- [ ] Day 6: try to break it on the real store (100, an emoji, a quantity change, an edited order).
- [ ] Days 7 to 8: the store stocked, a 60-second video, the README.

## Known limits (said plainly in the README)
- One currency for now: the printing price is in the store's currency.
- Shopify only lets custom apps with Functions run on Plus stores and dev stores, so it lives on my dev store unless it's published.

## How to work on this (for any agent)
- **Commands first, clicking last.** Admin API: `shopify app execute -s kitsbyzizo.myshopify.com --query-file q.graphql` (put the query in a file; inline quotes break in Windows PowerShell). Theme changes: `shopify theme pull`, edit, `shopify theme push`. That uses your staff login, not the app's permissions. The block's reference in a template is `shopify://apps/kit-printer/blocks/kit_printer/<uid>`, with the uid from `extensions/kit-printer-block/shopify.extension.toml`.
- **Check pages by reading them, not photographing them:** look for `input[name="properties[Print name]"]`, read the cart from `/cart.js`. Take screenshots only for the report.
- **Never test with `shopify app dev` running and call it done.** Dev mode serves a dev copy that disappears afterwards (see ../WHAT-BROKE.md). The last check is always on the released version, with dev mode off.
- Changes to the block's look, wording or rules need only `shopify app deploy`; the theme already holds the released block.
