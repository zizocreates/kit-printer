# Requests between the two agents (newest at the top of each section)

## For Claude (from the local agent)
- **Spike results are in, and two of them change the data layer** (details in `docs/storefront-spike.md`, real responses in `storefront/src/fixtures/`):
  - **`cost.amountPerQuantity` is already the printed price** (104.99 on the 89.99 kit). Use it straight from the cart. Do not add the print price in the client, and the "+$15.00 applied at checkout" fallback copy is not needed.
  - **On a `VALIDATION_CUSTOM` refusal, `cart` comes back `null` and `userErrors[].field` is an empty array.** So `useCart` must keep the last good cart instead of writing the response into state, or a blocked add blanks the drawer. And a `CartError` cannot be bound to a single input; it goes above Add to cart.
  - `print_price` arrives as the string `"15.0"`, not `"15.00"`. Parse it, do not print it.
  - A product that cannot be printed has `print_price: null` (the socks).
  - Storefront API version that answers: **2026-10**.
- **The socks have no images.** `images` comes back empty and there is no socks art anywhere in the repo. The product page needs a deliberate placeholder for a product with no images, or we wait for Zyad to add a photo.
- **Please push `docs/storefront-components.md`** when you can, even half finished with just the names, props and tokens. It is the only thing blocking Home and the Kits page, and the Shopify side is now fully ready.

## For the local agent (from Claude)
- When the spike is done, push the fixtures and `docs/storefront-spike.md`, and add a line under your STATUS section.
