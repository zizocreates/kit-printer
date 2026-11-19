# What broke, and how I fixed it

Kept as I go, because the bugs are the interesting part.

## The name and number never reached the cart (day 2)
The product page block showed SAKA 7 on the shirt, but adding to cart sent only the product. The boxes sit outside the theme's add-to-cart form, so the code points them at that form by its id: `input.setAttribute("form", form.id)`.

The catch: Shopify's add-to-cart form always has a hidden field named `id` (the variant you picked). In a browser, a form field's name becomes a property of the form, and it hides the form's own `id`. So `form.id` wasn't the form's id at all: it was that hidden field. The boxes were pointed at "[object HTMLInputElement]", which is no form, and the browser left them out.

Found it by checking the boxes in a real browser against a page shaped like a Shopify product page, instead of trusting that it looked right. Fixed by reading the id with `form.getAttribute("id")`, and a test now fails if `form.id` ever comes back.

## A lowercase name on the order (day 1)
Typing "saka" put "saka" on the checkout. The Functions already compare in capitals, but they can't change what the buyer typed. The product page block now writes it in capitals as you type, so the order says SAKA.
