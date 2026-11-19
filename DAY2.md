# Day 2: the product page block, and making it permanent

Run on your own computer, in the kit-printer folder. The store is `kitsbyzizo`.

## 1. Get the new code
```bash
git pull
npm install
npm test
```
`npm test` should say 20 pass, 0 fail.

## 2. Deploy for real (so it keeps working when your computer is off)
Day 1 ran in **dev mode**, which only lasts while `shopify app dev` is running. Stop it if it's still running (Ctrl+C in that terminal), then:
```bash
shopify app deploy
```
Say yes to releasing the new version. It sends three things: the price Function, the check Function and the new product page block.

The switch-ons from day 1 (cartTransformCreate and the checkout rule) stay; they point at the Functions by name.

## 3. Put the block on the product page
Admin: **Online Store, Themes, Customize** on the current theme. At the top, switch the page to **Products, Default product**. In the product information section, click **Add block**, choose the **Apps** tab, then **Kit Printer**. Drag it just above the Add to cart button. In its settings, set the shirt colour to match the kit. Click **Save**.

## 4. Test it on the real store
Use the store's password page yourself; don't let anyone else see the password.

On **Home kit**:
1. The box shows "Add a name and number" with **+$15.00** and a red shirt preview.
2. Type `saka` and `7`: the box shows **SAKA**, and the shirt shows SAKA and 7 as you type.
3. Add to cart. The cart and the checkout show **Print name: SAKA** in capitals, Print number 7, **$104.99**.
4. Clear the cart. Type `0` as the number and click Add to cart: nothing is added, and the box says "Numbers go from 1 to 99."
5. Clear both boxes and add to cart: a plain kit at **$89.99**, with no blank "Print name" line.
6. Type a name with no number, add to cart: $104.99 with only the name line.
7. Look at it on a phone-sized window too.

On **Football socks**: there's **no** name and number box at all.

Then, with `shopify app dev` stopped, repeat the SAKA 7 checkout once more to prove the deployed version works on its own.

## If something fails
- **The block isn't in the Apps list:** check `shopify app deploy` finished and you released the version.
- **Typing works but the cart has no name or number:** the block couldn't find the theme's add-to-cart form. Note which theme it is (Online Store, Themes) and stop.
- **"Printing isn't available on this page right now":** same cause.
