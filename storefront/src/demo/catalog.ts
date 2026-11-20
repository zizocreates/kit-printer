// Demo catalog: the same four kits and the socks as the real store, with the repo's own images. Used only when
// there's no Storefront token (local development and tests). Same shapes as the live API, after mapping.
import type { Img, Kit } from "../lib/types";

const usd = (amount: string) => ({ amount, currencyCode: "USD" });
const pic = (file: string, altText: string): Img => ({ url: `/demo/${file}.webp`, altText, width: 1200, height: 1200 });
const sizes = (handle: string, price: string) =>
  ["S", "M", "L", "XL"].map((size) => ({ id: `gid://shopify/ProductVariant/demo-${handle}-${size}`, title: size, size, availableForSale: true, price: usd(price) }));

function kit(handle: string, file: string, title: string, vendor: string, desc: string, shirt: string, ink: string, sample: string): Kit {
  return {
    id: `gid://shopify/Product/demo-${handle}`,
    handle, title, vendor,
    descriptionHtml: `<p>${desc}</p><p><em>An original design for a made-up club, made for this demo store.</em></p>`,
    images: [pic(`${file}-front`, `Front of the ${title}`), pic(`${file}-back`, `Back of the ${title}, printed with ${sample}`)],
    backBlank: pic(`${file}-back-blank`, `Back of the ${title}`),
    printPrice: usd("15.00"),
    shirtColour: shirt, printColour: ink,
    variants: sizes(handle, "89.99"),
    priceRange: { min: usd("89.99") },
  };
}

export const DEMO_KITS: Kit[] = [
  kit("kanata-fc-away-kit", "kanata-fc-away", "Kanata FC Away Kit 26/27", "Kanata FC", "Royal blue with white trim. Names and numbers print in white.", "#1d4fa3", "#ffffff", "RONALDO 7"),
  kit("rideau-united-home-kit", "rideau-united-home", "Rideau United Home Kit 26/27", "Rideau United", "Pink with black trim. Names and numbers print in black.", "#f4a7c6", "#111111", "MESSI 10"),
  kit("kanata-fc-home-kit", "kanata-fc-home", "Kanata FC Home Kit 26/27", "Kanata FC", "The red home shirt of Kanata FC, with white trim and the K crest. Names and numbers print in white.", "#c8102e", "#ffffff", "SALAH 11"),
  kit("capital-city-third-kit", "capital-city-third", "Capital City SC Third Kit 26/27", "Capital City SC", "White with navy trim. Names and numbers print in navy.", "#f3f1ec", "#13294b", "SAKA 7"),
];

export const DEMO_SOCKS: Kit = {
  id: "gid://shopify/Product/demo-football-socks", handle: "football-socks", title: "Kanata FC Socks", vendor: "Kanata FC",
  descriptionHtml: "<p>Red match socks. Socks can't be printed, so there's no name and number here.</p>",
  images: [pic("football-socks", "Kanata FC red match socks")], backBlank: null, printPrice: null, shirtColour: null, printColour: null,
  // Like the real product: no options, so one variant called "Default Title".
  variants: [{ id: "gid://shopify/ProductVariant/demo-football-socks", title: "Default Title", size: "Default Title", availableForSale: true, price: usd("14.99") }],
  priceRange: { min: usd("14.99") },
};
