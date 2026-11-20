# Store makeover report

Short version: the store now looks like a real kit shop. New photos, colours and descriptions are in, the homepage is rebuilt, and the SAKA 7 checkout comes to $104.99. Two things did not work: `shopify app deploy` failed, and the password page message cannot be set on a development store. Both are written out below.

## 1. Release the new code: FAILED

`shopify app deploy --allow-updates` built both Functions, then stopped. Exact error:

```
Invalid filename in your theme app extension: assets/oswald-700.woff2
Only these filetypes are supported in assets: .jpg, .jpeg, .json, .js, .css, .png, .svg, .wasm
```

So the new block code was not released. The store is still running **kit-printer-3** from the last session. Fixing this means changing something under `extensions/`, which the brief says not to touch, so I stopped and left it.

What this means for the checks: the box on the product page is the version that was already live. It still works, and a 12 letter name still fits inside the shirt (see the checks below), but the three changes listed in the brief (real jersey shape, kit font, cursor no longer jumping) are not what is live right now.

Everything else below was done against the released version with dev mode off. I never ran `shopify app dev`.

## 2. What the real club stores do

I read store.liverpoolfc.com (homepage and the home kit listing) and shop.realmadrid.com (homepage). I could not open a product page on either: Liverpool renders its product grid in the browser so no product links come through, and Real Madrid returned HTTP 429 twice on the jerseys listing. Patterns I copied:

- The hero is one full bleed image with a short heading (3 to 5 words), one line of text under it, and a single button. I used exactly that: "Your name. Your number.", one line, one "Shop kits" button.
- Real Madrid stacks its hero text on the left over the image rather than centring it. I did the same, over the dark side of the banner.
- Product cards are image, then title, then price, in that order, with nothing else. I kept the Horizon card to those three.
- Both stores use plain text badges in a corner of the card ("Best-seller", "Exclusive", "30% OFF"). I did not add fake badges, but I set the sale badge colour to the kit red so it matches if one is ever used.
- Headings are set in capitals in the source on Liverpool ("SHOP THE LFC SALE"). I set h1, h2 and h3 to uppercase in the theme.
- Real Madrid puts the name and number fields **above** the Add to cart button, in the order player, then Name, then Number. Our box already sits above Add to cart, with Name then Number, so I left the order alone.
- Category tiles are one link wrapping an image and a short label. The homepage grid follows that shape.
- Neither store showed the back of a shirt on the pages I could read, so showing the back as the second product image is our own choice, not copied.

I copied no images, logos, crests or wording from either site.

## 3. New kit photos

For each of the four kits I deleted the old images, then loaded the new front and back. All four tiles on the collection page show a shirt, and the front is the featured image on all four.

Alt text, taken from `store/README.md`:

| Kit | Front | Back |
| --- | --- | --- |
| Kanata FC Home | Front of the Kanata FC Home Kit 26/27 | Back of the Kanata FC Home Kit 26/27, printed with SALAH 11 |
| Kanata FC Away | Front of the Kanata FC Away Kit 26/27 | Back of the Kanata FC Away Kit 26/27, printed with RONALDO 7 |
| Rideau United | Front of the Rideau United Home Kit 26/27 | Back of the Rideau United Home Kit 26/27, printed with MESSI 10 |
| Capital City SC | Front of the Capital City SC Third Kit 26/27 | Back of the Capital City SC Third Kit 26/27, printed with O'BRIEN 10 |

How I did it, since the admin has no file input in the page: I uploaded the eight images to Content, Files, then built a copy of `products.csv` with `Image Src`, `Image Position` and `Image Alt Text` columns pointing at those files, and imported it with "Overwrite products with matching handles" ticked. That set the photos, the alt text, the order, the descriptions and the colours in one pass. I left the `Product Category` column out of that copy so the existing Jerseys category was not cleared.

## 4. Colours and descriptions

Set from `store/products.csv` and read back from the live product pages:

| Kit | Shirt colour | Print colour |
| --- | --- | --- |
| Kanata FC Home | #c8102e | #ffffff |
| Kanata FC Away | #1d4fa3 | #ffffff |
| Rideau United | #f4a7c6 | #111111 |
| Capital City SC | #108a8c | #ffffff |

Descriptions match the CSV, including the two that changed ("Royal blue with white trim" and "Pink with black trim"). All four kits kept 4 sizes at $89.99 and a $15.00 print price.

## 5. The 404

No fix was needed. `/collections/kits` already returned HTTP 200, the handle is `kits`, and the collection holds 4 products. It must have been fixed when the collection was published.

## 6. Store details

Store name is now **Kits by Zizo**.

## 7. The theme

Done in files: `shopify theme pull`, edit the JSON, `shopify theme push --allow-live`. I did not touch `templates/product.json`, so the Kit Printer block is still above Add to cart.

- **Colours:** white background, text #101010, buttons black #101010 with white text, kit red #c40d2b kept for the sale badge only, announcement bar black with white text.
- **Fonts:** headings Oswald bold (`oswald_n7`), body Inter (`inter_n4`), h1 to h3 in capitals.
- **Logo:** `logo.png` at 28 px on desktop, 22 px on phones.
- **Announcement bar:** "Demo store for Kit Printer, a Shopify app I built. Payments are test-only."
- **Homepage,** in this order, with the old default sections removed:
  1. Hero, full width, `banner-plain.png`, text on the left over the dark side: small "Kits by Zizo" label, "Your name. Your number.", one line of text, white "Shop kits" button to `/collections/kits`.
  2. Product list, heading "The 26/27 kits", the Kits collection, 4 across on desktop and 2 on phones.
  3. "How printing works", three columns numbered 01, 02, 03 in kit red.
  4. Image with text: the pink Rideau back next to "Printed in the kit's own colours" and a "See the pink kit" button.
  5. About, centred and narrow.
- **Navigation:** Home and Kits. Catalog and Contact removed.
- **Footer:** the About line. The "Join our email list" block, its signup form and the social links are gone.

Two theme notes:
- The CLI rejected my first push with "Setting 'padding-block-end' can't be greater than 100". I lowered the hero padding to 96 and it went through.
- The hero section has no inline padding setting, so the text sat flush against the left edge of the window. I put the hero blocks inside a group and gave the group 64 px of inline padding, which lines the text up with the logo.

## Password page message: NOT DONE

Settings for this live in Online Store, Preferences, under Store access. On this store the "Message to your visitors" box is greyed out, with the notice "Your online store is in development." I typed the message twice and the character counter stayed at "0 of 5,000 characters used", so the field is disabled while the store is a development store. The message is still unset.

## 8. Checks (dev mode off, on the released version)

| Check | Result |
| --- | --- |
| All 4 collection tiles show shirts | Pass. All four front images load, no blank tiles |
| Away kit box in its colours | Pass. Royal blue shirt with white print in the preview, #1d4fa3 and #ffffff in the page |
| Rideau box in its colours | Pass. #f4a7c6 and #111111 in the page |
| A 12 letter name stays inside the preview shirt | Pass. ALEXANDERSON with number 11 fits inside the shirt |
| SAKA 7 on the away kit comes to $104.99 | Pass. Typed into the box, added to cart, checkout shows Print name SAKA, Print number 7, total $104.99 |
| Socks have no box | Pass. No print fields on the Kanata FC Socks page |
| Homepage, collection and a product page at phone width | Pass. Hero text stacks, the grid drops to 2 across, the box and buttons stay inside the screen |

Screenshots are in `reports/store/`:
1. `1-homepage-desktop.png`
2. `2-homepage-phone.png` (the theme editor's phone preview, since the browser window would not resize)
3. `3-kits-collection.png`
4. `4-away-kit-product-page.png`
5. `5-saka-7-checkout.png`

No password, card number or personal details appear in any of them. No payment was taken; the cart was emptied afterwards.

## Left for you

- The app deploy, which needs the font file in `extensions/kit-printer-block/assets/` dealt with. Shopify will not accept a `.woff2` in an extension's `assets` folder.
- The password page message, if you want it, once the store is no longer a development store.
