# Day 1: deploy and the "SAKA 7" test

Run these on your own computer (Node 22+, Shopify CLI 5). The store is `kitsbyzizo`.

## 1. Get the code
```bash
git clone https://github.com/zizocreates/kit-printer.git
cd kit-printer
npm install
npm test
```
`npm test` should say 15 pass, 0 fail.

## 2. Create the app and connect it to the store
```bash
shopify app config link
```
Log in when the browser opens. Choose **create a new app**, name it **Kit Printer**. This fills in `client_id` in `shopify.app.toml`. Commit that file; it's not a secret.

```bash
shopify app dev
```
Pick the store **kitsbyzizo** when it asks. It installs the app (approve the permission screen) and pushes both Functions to the store in dev mode. Leave it running.

## 3. Switch the price Function on (once)
While `shopify app dev` is running, press **g** to open GraphiQL (the Admin API explorer), then run:
```graphql
mutation {
  cartTransformCreate(functionHandle: "kit-printer-price") {
    cartTransform { id }
    userErrors { field message }
  }
}
```
`userErrors` should be empty. If it complains about `functionHandle`, run this first and use the id it shows as `functionId: "..."` instead:
```graphql
{ shopifyFunctions(first: 10) { nodes { id title apiType } } }
```

## 4. Switch the check on (once)
Admin: **Settings → Checkout → Checkout rules → Add rule → Kit Printer check → Save**, then turn it on.

## 5. The test
Open the store (it asks for the store password), go to **Home kit**, open the browser console (F12 → Console) and paste:
```js
fetch("/cart/add.js", { method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ items: [{ id: ShopifyAnalytics.meta.product.variants[0].id, quantity: 1,
    properties: { "Print name": "saka", "Print number": "7" } }] }) })
  .then((r) => r.json()).then(console.log);
```
Then go to the cart and check out.

**Pass:** Home kit shows **$104.99** (89.99 + 15.00), with Print name SAKA and Print number 7.

Then the break-it checks (clear the cart between each, change the properties in the snippet):
- `"Print number": "100"` → checkout is blocked: "Numbers go from 1 to 99."
- `"Print name": "SAKA ⚽"` → blocked.
- the same snippet on **Football socks** → blocked: "Football socks can't be printed."
- quantity 3 of SAKA 7 → $104.99 each, $314.97 total, no separate printing item.

Screenshot each result.

## If something fails
- **Build error about `../../../shared/print.js`:** the bundler wouldn't reach outside the extension folder. Tell Claude; the fix is a copy step.
- **Price doesn't change, no error:** check the product's Print price is 15.00 and the cartTransformCreate step returned an id.
- **`update_feature_not_available`:** the store isn't on the Plus plan.
