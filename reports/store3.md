# Store v3 report

Everything in the brief is done. The app released this time, the box shows the real kit photo and turns to the back, the white Capital City kit is in, and the homepage is tidier. Three things did not go to plan and are written out below.

## 1. App released

`shopify app deploy --allow-updates` released **kit-printer-4**. The font error is gone now that the woff2 is out of the extension's `assets` folder. `npm test`: 25 pass, 0 fail.

## 2. New field

`Back image`, namespace and key `kit_printer.back_image`, type File. Shopify's accepted file types are only "Any file type" or "Media files only"; there is no images-only choice, so I picked **Media files only** (JPEG, PNG, WEBP, SVG, HEIC, GIF, MOV, MP4).

## 3. Images

Uploaded to Content, Files. The four blank backs kept their own names. The other three already existed under those names, so Shopify suffixed them:

| File | Name in the store |
| --- | --- |
| kanata-fc-home-back-blank.png | kanata-fc-home-back-blank.png |
| kanata-fc-away-back-blank.png | kanata-fc-away-back-blank.png |
| rideau-united-home-back-blank.png | rideau-united-home-back-blank.png |
| capital-city-third-back-blank.png | capital-city-third-back-blank.png |
| capital-city-third-front.png | capital-city-third-front_09c9b5a9... |
| capital-city-third-back.png | capital-city-third-back_860aa718... |
| banner-plain.png | banner-plain_047e277f... |

**Back image on the four kits: set, but by hand, not by CSV.** The CSV overwrite with a `Back image (product.metafields.kit_printer.back_image)` column ran without an error message, but the field stayed empty, and that same import also stopped the `Image Src` column working. So I set all four through the product page file picker instead.

**Capital City SC Third Kit:** description, Shirt colour `#f3f1ec` and Print colour `#13294b` came through the CSV fine. The photos did not. The `Image Src` route that worked last time failed twice here, with a "2 files failed" notice in the admin, so I removed the old teal photos and uploaded the two new white ones directly on the product, with alt text "Front of the Capital City SC Third Kit 26/27" and "Back of the Capital City SC Third Kit 26/27, printed with SAKA 7".

## 4. Theme fixes

All in files, pulled and pushed with the CLI, except the hero image (see below).

- **Hero:** now the new banner with RONALDO, MESSI and SALAH. **This one needed the editor.** Writing `shopify://shop_images/banner-plain_047e277f-....png` into `templates/index.json` saved without complaint but rendered nothing, and the hero fell back to Shopify's stock placeholder. Picking the same file in the theme editor worked, and the reference Shopify actually stores is `shopify://shop_images/banner-plain_aa0c724e-....png`, a different id from the one the Files list shows. I pulled that value back into the local theme so the files match the live theme.
- **Product page order:** the main section's `block_order` now reads title and price, size picker, Kit Printer, buy buttons, then the divider and description. Measured down the live page: title 122px, size 227px, box 954px, Add to cart 1040px.
- **The giant MESSI section:** the image block was `width: fill`, which let it run the width of the page. It is now `width: custom` at 35 percent with the text group at 55 percent. On the live page that is a 672px image next to a 1040px text column, with a 192px gap and nothing past the right edge. On phones the section stacks image then text.
- **Duplicate text:** the About section is off the homepage. The line now appears once, in the footer.
- **Product cards:** `show_second_image_on_hover` on, `quick_add` and `mobile_quick_add` on (the quick add button shows on the cards in the phone view). For the zoom I used Horizon's own `card_hover_effect: subtle-zoom`. **There is no `custom_css` setting anywhere in this theme**, on sections or in theme settings, so the hand-written `transform: scale(1.03)` was not possible without editing the theme's stylesheet, which the brief rules out.

## 5. What Real Madrid does

Read on us.shop.realmadrid.com (a men's home shirt page and the home kit listing). Structure only, nothing copied.

- The order down the product page is: choose your kit, **Size** as buttons (XS to 3XL) with a Size Guide link, **Badge**, **Name and Number**, then Add to Cart. Personalisation sits above the button, which is where our box already sits.
- Each personalisation choice carries its own price next to it: Badge "Champions League + $20.00" or "La Liga + $15.00", and "Name and Number" as "Select Player + $35.00" or "Personalize + $40.00". Our box shows "+$15.00" in the same spirit.
- Two prices show on a product: $125.00 and $106.25 with membership. We have one price, so nothing to copy.
- Cards in the listing carry a size row and a text badge ("Exclusive") above the image. Horizon's quick add gives us the same idea: sizes appear on the card on hover.
- The gallery does not show the back of the shirt, and there is no live preview of the printed name. Kit Printer's flip to the back with the name drawn on the photo goes further than theirs.
- A note under the button warns personalised items take 3 to 4 extra days. Worth copying later if you want the box to set expectations.

## 6. Links

All HTTP 200 after the password page: `/`, `/collections/kits`, `/cart`, and all five products. The Kits link in the nav points at `/collections/kits`.

One note: the socks product is titled "Kanata FC Socks" but its handle is still `football-socks`, because renaming a product does not change its URL. `/products/kanata-fc-socks` was a 404, so I added a URL redirect from `/products/kanata-fc-socks` to `/products/football-socks`. Both addresses now land on the socks page.

## 7. Checks

| Check | Result |
| --- | --- |
| Hero shows the new banner | Pass. RONALDO, MESSI and SALAH |
| Order on every kit: title, price, size, box, buy | Pass |
| Box shows that kit's own photos | Pass. Each page loads its own front photo and its own `-back-blank` image |
| Box turns to the back when you click Name | Pass. Clicking Name loads the back photo, and Front and Back buttons appear |
| Box prints in the kit's print colour | Pass. Each page carries its own shirt and print hex |
| A 12 letter name fits | Pass. ALEXANDERSON renders 145px wide inside a 440px shirt |
| RONALDO 7 on the away kit is $104.99 | Pass. Shown at checkout with Print name RONALDO and Print number 7 |
| Socks have no box | Pass |
| No duplicate text on the homepage | Pass. The About line appears once, in the footer |
| MESSI section is two even columns | Pass. 672px image, 1040px text, nothing off the page |
| Nothing runs off at phone width | Pass |

Screenshots in `reports/store3/`: `1-homepage.png`, `2-away-kit-back-ronaldo-7.png`, `3-homepage-phone.png` (the theme editor's phone preview, since the browser window will not resize). No password, card or personal details in any of them. No payment was taken and the cart was emptied afterwards.
