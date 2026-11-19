# Day 1 report

Short version: the SAKA 7 test passed ($104.99). All four break-it checks passed. Home kit's category is fixed. No payment was made and no card details were entered.

## 1. npm test
`npm install` worked. `npm test`: 15 pass, 0 fail.

## 2. Config link and app dev
- `shopify app config link`: created the app **Kit Printer** in the organization "Zizo Development". It printed: `shopify.app.toml is now linked to "Kit Printer" on Shopify`. `client_id` is `1d119b1c517cea6ee60acb3c750c3ef2`.
- The link command also set `scopes = ""` in `shopify.app.toml`. I put back `scopes = "write_cart_transforms"` (you approved this).
- `shopify app dev --store kitsbyzizo.myshopify.com`, first try, failed for both Functions. Exact text: `Failed to load schema from schema.graphql: Unable to find any GraphQL type definitions for the following pointers: - schema.graphql`, then `Dev preview aborted, build errors detected in extensions: kit-printer-price,kit-printer-check`.
- Fix: I ran `shopify app function schema --path extensions/<name>` for each Function. That writes `schema.graphql`, which is in `.gitignore`, so no repo file changed.
- Second try printed: `Ready, watching for changes in your app` and `Access scopes auto-granted: write_cart_transforms`. Only that one scope was requested. There was no permission screen to approve.
- The warned-about problem with `../../../shared/print.js` did **not** happen. Both Functions built (Bundling JS function, Running javy, Done).

## 3. cartTransformCreate
Ran `cartTransformCreate(functionHandle: "kit-printer-price")`. Result: cart transform id `gid://shopify/CartTransform/121700423`, `userErrors` empty. I sent it through the local GraphiQL server that `app dev` starts, using curl, because Chrome had disconnected for a while.

## 4. Is the check on?
Yes. In Settings, Checkout, Checkout rules I added **Kit Printer check** (title "Kit Printer check", status Active) and saved it. After reloading, the page lists "Kit Printer check by Kit Printer: Active" and "Kit Printer price by Kit Printer: Active". I left "Block checkout if app experiences a problem" unticked, because `DAY1.md` doesn't mention it.

## 5. The SAKA 7 test
Added Home kit with Print name "saka" and Print number "7" using the snippet from `DAY1.md`, then opened checkout.

**Result: PASS.** Checkout shows Home kit at **$104.99** (89.99 + 15.00), Subtotal $104.99, Total $104.99. The item shows "Print name: saka" and "Print number: 7". No separate printing line.

Screenshot: `reports/day1/1-saka7-checkout.png`

Note: the Print name shows in lowercase ("saka"), not "SAKA". The price Function and the check clean the name to capitals for their own rules, but checkout shows the text exactly as it was sent. Your brief said "showing SAKA and 7", so this is a small mismatch for you to decide on. I changed nothing.

## Break-it checks
The cart was cleared between each one.

| Check | Result |
| --- | --- |
| Number 100 | Blocked: `Home kit: Numbers go from 1 to 99.` |
| Name "SAKA ⚽" (number 7) | Blocked: `Home kit: Names can only use letters, spaces, hyphens, apostrophes and full stops.` |
| Print on Football socks | Blocked: `Football socks can't be printed. Remove the name and number to continue.` |
| Quantity 3 of SAKA 7 | Pass: one Home kit line, $104.99 each, **$314.97** total, no separate printing item |

Screenshots: `reports/day1/2-blocked-cases.png` and `reports/day1/3-quantity-3.png`.

How the screenshot for the three blocked cases was made: they are blocked earlier than `DAY1.md` expects. The bad item is refused when it is added to the cart (HTTP 422 from `/cart/add.js`), so there is never a cart to take to checkout and no checkout page to photograph. For the screenshot I ran the three requests live and showed their real replies as plain text on a blank page. It is not a picture of the checkout page. (The ⚽ shows as a globe in that screenshot because of the font.) I did not test whether checkout itself also blocks a bad line, since a bad line can't get into the cart.

## Home kit category
Changed from "Plumbing Fixtures" to **Jerseys** (under Sports Fan Accessories) and saved. I searched for "soccer jerseys" first and found nothing close, so "Jerseys" is the nearest match. Checked again after a reload. Screenshot: `reports/day1/4-home-kit-category.png`

## Things that did not match DAY1.md
- `git clone` into the session folder first failed with "Filename too long". I fixed it with `core.longpaths=true`.
- The terminal panel could not find `shopify`, so I ran the same version with `npx.cmd --yes @shopify/cli@5.0.2` (5.0.2 is the version you have installed).
- `config link` overwrote the scopes (see above) and added a `uid` line to each extension file.
- `schema.graphql` had to be generated before `app dev` would build (see above).
- No permission screen appeared; the scope was granted automatically.
- Step 4: the rule needed a Title and the status set to Active before saving.
- The storefront password page appeared. You entered the password yourself. I did not see or handle it.
- Chrome was not signed in to Shopify at the start. You signed in, and I confirmed the CLI login code.

## Changes pushed
1. `68d5dd1` "Link the app to the Kit Printer app in the Dev Dashboard": `client_id`, the restored `write_cart_transforms` scope, the CLI defaults, and the two `uid` lines.
2. This report and its screenshots ("Day 1 report").

Nothing else in the code was changed.
