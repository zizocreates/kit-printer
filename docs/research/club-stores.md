# What the big club stores do (researched 20 Nov 2026)

Pages read from code (Firecrawl): the Liverpool FC kit listing and the men's 26/27 home jersey page, and the
Real Madrid authentic kits collection. Our kits are made-up clubs; this is about patterns, never their assets.

## Adopted
| Pattern | Seen on | Ours |
|---|---|---|
| Sizes shown on the card on hover | Real Madrid, Liverpool | KitCard quick add (pointer devices) |
| "From $x" price on cards | Real Madrid | KitCard |
| Second image on hover | Liverpool | KitCard turns to the printed back |
| "Personalise" as its own choice next to the sizes | Liverpool | Personalize +$15.00 pills |
| Ready-made player prints sold next to the blank shirt | Liverpool (e.g. a youth home shirt sold pre-printed) | **PopularPrints**: one tap fills RONALDO 7, MESSI 10, SALAH 11 or SAKA 7 |
| "Complete the Look" with socks and shorts on the product page | Liverpool | **CompleteTheKit** on the product page, plus the offer in the bag |
| Delivery and returns tab, saying personalised shirts can't be returned and take longer | Liverpool | **Delivery and returns** accordion |
| Socks sold separately, and said so | Liverpool ("socks are not included") | Socks are their own product |
| Size guide link by the sizes | both | SizeGuide sheet |

## Worth knowing
- A recent verified review on Liverpool's jersey page complains a custom name arrived with one lowercase letter
  ("HIcKMAN"). Our rules write every name in capitals as you type and the checkout Function compares in
  capitals, so that can't happen here. It's a real-world reason for `cleanName()`, good for an interview answer.
- Both stores lead with sale banners, membership prices, countdowns and "selling fast" counters. Left out on
  purpose: on a demo store they would be fake numbers.

## Not adopted (yet)
- Multiple gallery images with thumbnails (we have front and back only; both stores show 4 to 14 photos).
- Reviews (we would have to invent them).
- A sticky mini bar on desktop once the add button scrolls away (we have it on phones only).
