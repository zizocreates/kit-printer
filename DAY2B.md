# Day 2b: point everything at the released version

**Why the box vanished:** while `shopify app dev` was running, the theme editor offered the *dev copy* of the Kit Printer block, and that's the one that got added. `shopify app dev clean` deleted the dev copy, so the saved block now points at nothing (the red "unresolved" block). The released block (version kit-printer-2) exists; it just was never added.

**Do NOT run `shopify app dev` for any of this.** It brings the dev copy back and hides the problem.

## 1. Are the checkout Functions on the released version?
In the kit-printer folder:
```bash
shopify app execute -s kitsbyzizo.myshopify.com -q "{ cartTransforms(first: 5) { nodes { id functionId } } shopifyFunctions(first: 10) { nodes { id title apiType } } }"
```
Note the id of **Kit Printer price** in `shopifyFunctions`, and the `functionId` in `cartTransforms`.
- **They match:** good, go to step 2.
- **They don't, or `cartTransforms` is empty:** remove the old one and point it at the released Function. Use the `id` from `cartTransforms` (it starts `gid://shopify/CartTransform/`):
```bash
shopify app execute -s kitsbyzizo.myshopify.com -q "mutation { cartTransformDelete(id: \"PUT-THE-CARTTRANSFORM-ID-HERE\") { deletedId userErrors { message } } }"
shopify app execute -s kitsbyzizo.myshopify.com -q "mutation { cartTransformCreate(functionHandle: \"kit-printer-price\") { cartTransform { id functionId } userErrors { field message } } }"
```

Then in the admin: **Settings, Checkout, Checkout rules**. **Kit Printer check** should say Active. If it says something is missing or inactive, delete that rule and add it again (Add rule, Kit Printer check, title "Kit Printer check", Active, Save).

## 2. Re-add the block
Admin: **Online Store, Themes, Customize** (Horizon), **Products, Default product**.
1. Click the **red** Kit Printer block, remove it, and Save.
2. In Product information: **Add block, Apps, Kit Printer**. Drag it above Add to cart, keep the red colour, and **Save**.

## 3. Prove it, on the released version only
Open https://kitsbyzizo.myshopify.com/products/home-kit in a fresh window. The box should be there.
- **SAKA 7 through the box:** cart and checkout show SAKA, 7 and **$104.99**.
- **The check, skipping the page:** clear the cart, open the console on Home kit, and run the `DAY1.md` snippet with `"Print number": "100"`. It should be refused ("Numbers go from 1 to 99").
- **Socks:** still no box.

Then close everything, wait a minute, open the product page once more, and confirm the box is still there.
