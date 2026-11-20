# What broke, and how I fixed it

Kept as I go, because the bugs are the interesting part.

## The name and number never reached the cart (day 2)
The product page block showed SAKA 7 on the shirt, but adding to cart sent only the product. The boxes sit outside the theme's add-to-cart form, so the code points them at that form by its id: `input.setAttribute("form", form.id)`.

The catch: Shopify's add-to-cart form always has a hidden field named `id` (the variant you picked). In a browser, a form field's name becomes a property of the form, and it hides the form's own `id`. So `form.id` wasn't the form's id at all: it was that hidden field. The boxes were pointed at "[object HTMLInputElement]", which is no form, and the browser left them out.

Found it by checking the boxes in a real browser against a page shaped like a Shopify product page, instead of trusting that it looked right. Fixed by reading the id with `form.getAttribute("id")`, and a test now fails if `form.id` ever comes back.

## The deploy refused a font file (store makeover)
The product page preview got a proper kit font, shipped as a `.woff2` file next to the block's CSS. Every test passed, and the deploy failed: a theme app extension's assets may only be `.jpg`, `.jpeg`, `.json`, `.js`, `.css`, `.png`, `.svg` or `.wasm`. The font now lives inside the CSS as a data URL, and a test lists the block's assets and fails on any other file type, so the next one is caught before a deploy instead of by it.

## The box vanished after the release (day 2)
Everything passed, then the product page lost its box. While `shopify app dev` runs, Shopify serves a dev copy of the app, and the theme editor offered that copy of the block, so that's what got added to the page. Cleaning up dev mode deleted the copy, and the theme was left pointing at a block that no longer existed (it shows red, "unresolved"). The released block was fine; it just had never been added. Fix: remove the dead block and add the released one. Lesson: test the released version on its own, with dev mode off, before calling anything done. The last check of day 2 did exactly that, which is how it was caught.

## A lowercase name on the order (day 1)
Typing "saka" put "saka" on the checkout. The Functions already compare in capitals, but they can't change what the buyer typed. The product page block now writes it in capitals as you type, so the order says SAKA.
