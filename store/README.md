# The demo store: Kits by Zizo

`kitsbyzizo.myshopify.com` is the store Kit Printer runs on. It's a development store: password protected, payments test-only. It should look like a real, professional kit shop, because it's the first thing a recruiter sees.

**Everything here is original.** The four kits are designs for made-up clubs (Kanata FC, Rideau United, Capital City SC), rendered by `make-kits.cjs`. No real club, kit maker, sponsor or crest appears anywhere, because their photos and logos belong to them and a "courtesy" credit doesn't make using them allowed.

## Files
| File | What it is |
|---|---|
| `products.csv` | The four kits, sizes S to XL, $89.99, print price $15.00, and each kit's shirt and print colours (the box's preview uses them). Import in Products, Import. |
| `images/<kit>-front.png`, `-back.png` | Product photos, 1600 by 1600. Front first, then the back with a printed name. |
| `images/banner-plain.png` | Homepage hero image, no text (the theme's heading goes on top). |
| `images/banner.png` | The same with the text baked in, for the README and social previews only. |
| `images/logo.png` | The "KITS by ZIZO" wordmark. |
| `make-kits.cjs`, `make-brand.cjs` | Rebuild the images: `node store/make-kits.cjs && node store/make-brand.cjs` (needs Playwright). |

## The look
- **Name:** Kits by Zizo. **Logo:** `images/logo.png`.
- **Colours:** white page, near-black text `#101010`, buttons in kit red `#c8102e`, small gold `#d4a72c` accents. A dark hero.
- **Type:** a bold, condensed heading font from the theme's font library (e.g. Oswald or Archivo Narrow), a clean sans for body text.
- **Tone:** short, plain, confident. No "premium quality" filler.

## The pages
1. **Announcement bar:** "Demo store for Kit Printer, a Shopify app I built. Payments are test-only."
2. **Homepage,** in this order, with every other default section removed:
   - **Hero:** `banner-plain.png`. Heading "Your name. Your number.", text "Printed on the back of your kit, and checked before you pay.", button "Shop kits" to the Kits collection.
   - **Featured collection:** Kits (all four).
   - **How printing works,** three columns:
     - "Pick your kit";
     - "Add a name and number: see it on the shirt as you type";
     - "Checked before you pay: a name or number that can't be printed never reaches checkout".
   - **About:** "Kits by Zizo is a demo store for Kit Printer, a Shopify app I built that adds names and numbers to football kits. The kits are original designs for made-up clubs."
3. **Collection "Kits":** the four kits (tag `kits`).
4. **Navigation:** Home, Kits. The footer gets the About line and nothing else of note.
5. **Products:** from `products.csv`, each with its front then back image. Alt text: "Front of the <kit>" and "Back of the <kit>, printed with <NAME> <number>".
6. **The old "Home kit":** set to **Archived** (not deleted). **"Football socks":** rename to "Kanata FC Socks". Keep it at $14.99 with no print price: it's the "can't be printed" example.
7. **Password page message:** "Kits by Zizo: the demo store for Kit Printer."
