# Kit Printer: the plan

Names and numbers on football kits, priced and checked inside Shopify's own checkout, for my store.

## Why it's built this way
Personalization apps run in the store theme's JavaScript, and their 1-star reviews say what that costs: they break on new themes, and custom data goes missing from orders. Kit Printer does the two parts that matter inside Shopify's checkout, as Shopify Functions:
- **the price** (`extensions/kit-printer-price`, a Cart Transform Function): a shirt with a valid print has its own line's price raised by the product's printing price, so there's no separate "printing" item that a quantity change could leave behind;
- **the check** (`extensions/kit-printer-check`, a Validation Function): a bad name or number blocks the checkout, even if someone skips the product page.

No server: Shopify runs the Functions, so there is nothing to host and nothing to go down.

## Status
- [x] Day 0: the rules (`shared/print.js`), both Functions, 15 tests (`npm test`), checked by breaking the code on purpose.
- [ ] Day 1: accounts and the dev store (Plus plan), app created with the Shopify CLI, both Functions deployed, the price test: add "SAKA 7", the price goes up.
- [ ] Days 2 to 3: the product page block: name and number boxes, a live preview of the back of the shirt, saved as "Print name" and "Print number".
- [ ] Days 4 to 5: the printing price set per product (metafield `kit_printer.print_price`), the order page block showing the print.
- [ ] Day 6: try to break it on the real store (100, an emoji, a quantity change, an edited order).
- [ ] Days 7 to 8: the store stocked, a 60-second video, the README.

## Known limits (said plainly in the README)
- One currency for now: the printing price is in the store's currency.
- Shopify only lets custom apps with Functions run on Plus stores and dev stores, so it lives on my dev store unless it's published.
