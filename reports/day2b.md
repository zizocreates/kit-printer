# Day 2b report

Short version: fixed. The box is back on the live product page on the released version (kit-printer-2), SAKA 7 checks out at $104.99, and the box was still there after a one-minute wait. I did not run `shopify app dev` at all. I changed no code.

## 1. Are the checkout Functions on the released version?
Command (run with the same Shopify CLI 5.0.2, through `npx.cmd`):

```
shopify app execute -s kitsbyzizo.myshopify.com -q "{ cartTransforms(first: 5) { nodes { id functionId } } shopifyFunctions(first: 10) { nodes { id title apiType } } }"
```

Exact output:

```
Operation succeeded.

{
  "cartTransforms": {
    "nodes": []
  },
  "shopifyFunctions": {
    "nodes": [
      {
        "id": "01a1f5dd-34da-7138-b089-c9bd3033f9fb",
        "title": "Kit Printer check",
        "apiType": "cart_checkout_validation"
      },
      {
        "id": "01a1f5dd-34da-78b3-977e-72bbfa6d838d",
        "title": "Kit Printer price",
        "apiType": "cart_transform"
      }
    ]
  }
}
```

**The ids did not match: `cartTransforms` was empty.** The old cart transform pointed at the dev copy of the Function and was gone. There was nothing to delete, so I only re-created it. That was the only Admin API change.

Re-create command, and its exact output. (The first try, with the query typed inline, failed in PowerShell with `Unexpected arguments: {, {, {, cartTransform, id, functionId, }, }, }, }, userErrors, field, message` because of the quote marks. The same query sent from a file worked. Nothing was changed by the failed try.)

```
mutation { cartTransformCreate(functionHandle: "kit-printer-price") { cartTransform { id functionId } userErrors { field message } } }
```

```
Operation succeeded.

{
  "cartTransformCreate": {
    "cartTransform": {
      "id": "gid://shopify/CartTransform/121733191",
      "functionId": "01a1f5dd-34da-78b3-977e-72bbfa6d838d"
    },
    "userErrors": []
  }
}
```

The new `functionId` (`01a1f5dd-34da-78b3-977e-72bbfa6d838d`) is the id of the released Kit Printer price Function, so they match now.

## Checkout rules status
- Before: Settings, Checkout, Checkout rules listed only **Kit Printer price (Active)**. The **Kit Printer check** rule was gone (it had been tied to the dev copy too).
- I added it again: Add rule, Kit Printer check, title "Kit Printer check", Active, Save. The rule page address showed the released Function id (`01a1f5dd-34da-7138-b089-c9bd3033f9fb`). I left "Block checkout if app experiences a problem" unticked, as on day 2.
- After: the Checkout page lists **Kit Printer check: Active** and **Kit Printer price: Active**.

## 2. Re-add the block
- In the theme editor (Horizon, Products, Default product) I clicked the red Kit printer block. The side panel said: `"Kit printer" not found. There is a problem with the app block. Contact the app developer.` I removed it and saved ("Changes saved").
- Then Add block, Apps, **Kit Printer**, in the Details group, above the Buy buttons (Add to cart). I kept the default red shirt colour `#C8102E`. Saved. The block is no longer red (`reports/day2b/3-theme-editor-block-not-red.png`).
- I changed nothing else in the theme.

## 3. Checks on the released version only
`shopify app dev` was never started, and the dev preview was already cleared on day 2.

| Check | Result |
| --- | --- |
| Box shows on the live Home kit page ("Add a name and number", +$15.00, red shirt) | Pass (`reports/day2b/1-live-product-page-box.png`) |
| SAKA 7 typed into the box, Add to cart, checkout | Pass. Checkout shows Print name: SAKA, Print number: 7, **$104.99** (`reports/day2b/2-saka7-checkout.png`) |
| Skipping the page, number 100 sent straight to the cart | Pass. Refused with HTTP 422: `Home kit: Numbers go from 1 to 99.` Cart stayed empty |
| Football socks: no box | Pass. No Print name input and no "Add a name and number" text on the socks page |
| Printing on socks sent straight to the cart (extra) | Refused with HTTP 422: `Football socks can't be printed. Remove the name and number to continue.` |

Notes: the checks above came through the live storefront, not the dev preview. The skip-the-page check uses the `DAY1.md` snippet's request (`/cart/add.js`) with number 100.

## One-minute wait
I left the storefront, waited about one minute, and opened https://kitsbyzizo.myshopify.com/products/home-kit again. **The box was still there** (the Print name input and the "Add a name and number" heading were both on the page).

## Changes
- Admin API: one `cartTransformCreate` (id `gid://shopify/CartTransform/121733191`). Nothing deleted.
- Admin: re-created the Kit Printer check rule (Active). In the theme, removed the red block and added the released Kit Printer block. Saved.
- Repo: only this report and its screenshots.
