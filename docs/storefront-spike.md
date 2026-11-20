# Phase 0 spike: the Storefront API on kitsbyzizo

Run on 20 November 2026 against the real store, `kitsbyzizo.myshopify.com`, with the Headless channel's **public** Storefront API token. Storefront API version **2026-10**. Every response in this file came back from Shopify; the ones worth keeping are saved in `storefront/src/fixtures/`.

Short version: **a, b, c and d all pass.** The Cart Transform and the Validation Function both run on carts built by the Storefront API, which is the thing the whole project rests on. Check e is partly answered and needs one manual step, written up at the bottom.

## Setup, and what was already done

The plan expected three setup jobs. One of them turned out to be unnecessary:

| Job | State |
|---|---|
| Install the Headless channel, Create storefront, copy the public token | **Done today.** Installing the channel created a storefront called "Kits By Zizo Headless" (id 432818) on its own, so there was nothing to create by hand. The public token is in `storefront/.env.production` (public by design, F9). The private token stays in the admin; it is masked on that page and was never read or stored. |
| Publish the kits and the socks to the Headless channel (F10) | **Done today.** Publication `gid://shopify/Publication/220251324487`. Published the 4 kits, the socks, and also the `kits` **collection**, which the plan did not mention but check a needs: a collection has to be published to the channel for `collection(handle:)` to resolve through the API. |
| Set `access.storefront = PUBLIC_READ` on the 4 metafield definitions (F7) | **Already correct. No change made.** All four `kit_printer` PRODUCT definitions were already on `PUBLIC_READ`: `print_price` (number_decimal), `shirt_colour` (color), `print_colour` (color), `back_image` (file_reference). No `metafieldDefinitionUpdate` was run. |

The `kits` collection already existed with exactly the 4 kits in it. An old `home-kit` product is ARCHIVED and is ignored everywhere.

F5 is confirmed as a side effect: the Storefront API answers normally with the public token even though the store is password locked. A plain `{ shop { name } }` returned "Kits by Zizo" on both 2026-10 and 2026-07.

## a. The collection, with images and metafields: PASS

`collection(handle: "kits")` returns 4 products. Each one has 2 images, 4 variants (S, M, L, XL), a min price of `89.99 USD`, and all four metafields. `back_image` resolves through `reference { ... on MediaImage { image { url altText width height } } }` to a real CDN URL.

| handle | print_price | shirt_colour | print_colour | images | back_image |
|---|---|---|---|---|---|
| `kanata-fc-home-kit` | 15.0 | `#c8102e` | `#ffffff` | 2 | resolves |
| `kanata-fc-away-kit` | 15.0 | `#1d4fa3` | `#ffffff` | 2 | resolves |
| `rideau-united-home-kit` | 15.0 | `#f4a7c6` | `#111111` | 2 | resolves |
| `capital-city-third-kit` | 15.0 | `#13294b` | `#f3f1ec` | 2 | resolves |

Note on `print_price`: the value comes back as the string `"15.0"`, not `"15.00"`. It is a `number_decimal` metafield, so the data layer has to parse it rather than print it. Money still has to be built in cents, the way `shared/print.js` does it.

Saved as `fixtures/collection.json`, and one file per product as `fixtures/product-<handle>.json`.

## b. The price Function on a Storefront API cart: PASS

This is the important one. `cartCreate` with the away kit in M and line attributes `Print name: SAKA` and `Print number: 7`:

```
line: kanata-fc-away-kit M
  merchandise.price.amount  89.99      <- the variant's own price
  cost.amountPerQuantity    104.99     <- after Kit Printer's Cart Transform
  cost.totalAmount          104.99
  attributes                [{"Print name":"SAKA"},{"Print number":"7"}]
cart.cost.subtotalAmount    104.99
userErrors                  []
```

So F1 and F3 both hold on a cart our own site built. The print is priced at the point of truth, and the UI can show the real `104.99` straight from the cart instead of the "applied at checkout" fallback the plan had ready. That fallback is not needed.

Adding the socks to the same cart with no print gives a second line at `14.99` and a subtotal of `119.98`, which is the two lines added correctly.

Saved as `fixtures/cart-created.json` and `fixtures/cart-two-lines.json`.

## c. The check Function refuses a bad number: PASS

`cartLinesAdd` on the away kit with `Print number: 100`:

```
userErrors: [
  {
    "field": [],
    "message": "Kanata FC Away Kit 26/27: Numbers go from 1 to 99.",
    "code": "VALIDATION_CUSTOM"
  }
]
cart: null
```

F2 holds, word for word, and the message carries the product's own title. Two things the UI has to handle, both from this response:

- `field` is an **empty array**, not null and not a field path. So a `CartError` cannot be attached to a particular input from the response alone. Show it above Add to cart, as the plan already says.
- `cart` comes back **null** on a refusal. The client must keep its last good cart rather than overwrite state from the response, or a blocked add will blank the drawer.

Saved as `fixtures/cart-error-number.json`.

## d. A print on something that cannot be printed: PASS

Same mutation, the socks, with `Print name: SAKA` and `Print number: 7`:

```
userErrors: [
  {
    "field": [],
    "message": "Kanata FC Socks can't be printed. Remove the name and number to continue.",
    "code": "VALIDATION_CUSTOM"
  }
]
cart: null
```

And the control: the same socks with no attributes is accepted, and the cart goes to 2 items. So the rule is about the print, not the product.

The socks carry `print_price: null`, which is how the product page decides not to show the Personalize pills at all.

Saved as `fixtures/cart-error-socks.json`.

## e. The checkout URL and the password: half answered

`cart.checkoutUrl` was re-fetched fresh (F4) and opened in a browser with no store cookies and no admin session, which is the closest thing to what a recruiter gets.

**Confirmed:** it does not reach checkout. It redirects to `https://kitsbyzizo.myshopify.com/password`, which says "This store is password protected. Use the password to enter the store." That is F6, seen on our own store.

**Still open:** whether entering the password then continues to the checkout, or drops you on the store's home page. I did not submit the password myself.

There is good evidence for the second, though. The password form posts to `/password` with only two fields, `authenticity_token` and `password`. There is **no `return_to` field and no hidden copy of the original path**, so the form has nothing to send Shopify back to. On that evidence the plan's two step sheet is the one to build:

1. **Unlock the store**, which opens `/password` in a new tab;
2. **Continue to checkout**, which opens `checkoutUrl` once the password cookie is set.

That sheet works whichever way the redirect goes, so it is the safe thing to build now. The e2e suite tests both paths, as the plan asks.

## Two things for Zyad

1. **The socks have no images at all.** `images` comes back empty, and there is no socks image anywhere in `store/images/` or `storefront/public/demo/`. The kits all have 2 each. The socks need a product photo, or the product page needs a deliberate placeholder for them. They are not in the `kits` collection, so the grid is unaffected, but e2e check 5 opens the socks page.
2. **Check e needs one manual step** to be finished properly: submit `futureshopifolk` on that password page and say where it lands.

## What the data layer should know

Pulled together from the four checks, for `src/lib`:

- Money: `print_price` is `"15.0"`, so parse to cents and do not format the raw string.
- `cost.amountPerQuantity` is already the printed price. Use it directly; do not add the print price in the client.
- On a `VALIDATION_CUSTOM` refusal, `cart` is null and `field` is `[]`. Keep the previous cart and show the message above Add to cart.
- `collection(handle:)` needs the collection published to the Headless channel, not just its products.
- A product that cannot be printed is one with `print_price: null`.
