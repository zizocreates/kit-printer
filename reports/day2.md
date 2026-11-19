# Day 2 report

Short version: the deploy worked and every step 4 check passed, but those checks ran while a leftover dev preview was still serving the block. When I cleared the dev preview to test the released version alone, the block disappeared from the product page. **The final "deployed version on its own" test failed.** I stopped there and changed no code.

## 1. npm test
`git pull`, `npm install`, `npm test`: 20 pass, 0 fail.

## 2. shopify app deploy
- I stopped `shopify app dev` first (Ctrl-C).
- Before the prompt, the CLI printed that `include_config_on_deploy` "is no longer supported" and removed it from `shopify.app.toml`. I kept that change.
- The release prompt listed: Configuration (access_scopes updated, auth, webhooks, application_url, embedded, name) and Extensions: kit-printer-price (new), kit-printer-check (new), kit-printer-block (new).
- Scopes stayed `write_cart_transforms` only, so no new permissions were asked for. I answered yes (Zyad pressed y in the terminal).
- Output: `New version released to users.` Version: **kit-printer-2**.
- The CLI also added a `uid` line to `extensions/kit-printer-block/shopify.extension.toml`. Kept.

## 3. Theme and the block
- The store uses the theme **Horizon** (Active). Template: Default product.
- I added the Kit Printer block (Apps tab) inside the Details group of Product information. It sits above the Buy buttons group (the Add to cart button), so I did not need to drag it.
- Shirt colour: the box already defaulted to **#C8102E** (red), which matches the red Home kit, so I left it. Print colour stayed #FFFFFF.
- Saved. Editor message: "Changes saved."

## 4. Checks on the real store
These ran after the deploy and with `shopify app dev` stopped, but see the problem in section 5: a dev preview was still active.

| Check | Result |
| --- | --- |
| 1. Box shows "Add a name and number", **+$15.00**, red shirt | Pass |
| 2. Type `saka` and `7`: box shows SAKA, shirt shows SAKA and 7 | Pass (`reports/day2/1-product-page-saka7.png`) |
| 3. Add to cart: Print name SAKA, Print number 7, $104.99 | Pass. Cart data: Print name "SAKA", Print number "7", price 10499. Checkout shows $104.99 (`reports/day2/2-checkout-saka7.png`) |
| 4. Number `0`, Add to cart | Pass. Nothing was added (cart count stayed 0). Box says "Numbers go from 1 to 99." (`reports/day2/3-number-error.png`) |
| 5. Both boxes empty, Add to cart | Pass. Plain Home kit at $89.99, no blank Print name line in the cart or checkout. Note: the cart data does contain two empty properties (`"Print name": ""` and `"Print number": ""`), but Shopify does not show empty ones |
| 6. Name only (`saka`), no number | Pass. $104.99 with only "Print name: SAKA" (no number line) |
| 7. Phone-sized window | Pass, with a workaround (see below) (`reports/day2/5-phone-view.png`) |
| Football socks: no name and number box | Pass (`reports/day2/4-socks-no-box.png`) |

Phone view: the browser window would not shrink (resize request had no effect, and the storefront cannot be shown inside a frame). So I used the theme editor's mobile preview and typed saka and 7 into it. It shows the box fits a phone width. The shirt looks darker there because of the editor's selection overlay. I saved nothing in the editor while doing this.

## 5. Final SAKA 7 checkout on the released version only: FAIL
- After the checks, I ran `shopify app dev clean`. It printed: `Dev preview stopped. The dev preview has been stopped on kitsbyzizo.myshopify.com and the app's active version has been restored.` (The dev preview had still been serving after I stopped `app dev`, so the checks above used it, not the released version alone.)
- Then I opened https://kitsbyzizo.myshopify.com/products/home-kit. **There is no name and number box.** The page shows only the price, quantity and Add to cart. I reloaded it several times over about two minutes with the same result. There is no `properties[Print name]` input on the page.
- In the theme editor, the Kit Printer block is still in the theme, but it now shows in **red** as "Kit printer - Kit printer" (a block the theme can't resolve) (`reports/day2/6-block-missing-after-dev-clean.png`).
- So the released version kit-printer-2 does not give the theme its block, even though the deploy output listed kit-printer-block as part of it. I did not find the cause and did not change any code. I did not run the final checkout because there is no box to type into.
- Not yet checked: whether the price Function and check Function still work on the released version (they did on day 1 in dev mode), and whether the block shows up again after a short delay beyond the two minutes I waited.

## Current state of the store
The product page has no box right now, because the dev preview is cleared and the released version is not serving the block. Running `shopify app dev` again brings the box back for as long as it runs.

## Changes in the repo
- `shopify.app.toml`: `include_config_on_deploy` removed by the CLI.
- `extensions/kit-printer-block/shopify.extension.toml`: `uid` line added by the CLI.
- No code changes. These two files are committed with this report.
