// The live backend: Shopify's Storefront API, through Shopify's own React kit for the URL and headers.
import { createStorefrontClient } from "@shopify/hydrogen-react";
import { API_VERSION, STORE_DOMAIN, STOREFRONT_TOKEN } from "./config";
import { CART_ADD, CART_CREATE, CART_QUERY, CART_REMOVE, CART_UPDATE, COLLECTION, PRODUCT } from "./queries";
import { toCart, toErrors, toKit } from "./map";
import { toAttributes } from "./print";
import type { Backend, CartResult, Kit } from "./types";

const client = createStorefrontClient({
  storeDomain: `https://${STORE_DOMAIN}`,
  storefrontApiVersion: API_VERSION,
  publicStorefrontToken: STOREFRONT_TOKEN,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
async function gql(query: string, variables: Record<string, unknown> = {}): Promise<any> {
  const res = await fetch(client.getStorefrontApiUrl(), {
    method: "POST",
    headers: client.getPublicTokenHeaders({ contentType: "json" }),
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Storefront API ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e: any) => e.message).join("; "));
  return json.data;
}

// A cart change never throws to the UI: network and API failures come back as an error it can show.
async function mutate(query: string, variables: Record<string, unknown>, key: string): Promise<CartResult> {
  try {
    const data = await gql(query, variables);
    const payload = data?.[key];
    return { cart: toCart(payload?.cart), errors: toErrors(payload) };
  } catch (e) {
    return { cart: null, errors: [{ code: "NETWORK", message: "We couldn't reach the store. Check your connection and try again." }] };
  }
}

export const liveBackend: Backend = {
  mode: "live",
  async getCollection(handle) {
    const data = await gql(COLLECTION, { handle });
    return (data?.collection?.products?.nodes ?? []).map(toKit).filter((k: Kit | null): k is Kit => !!k);
  },
  async getKit(handle) {
    const data = await gql(PRODUCT, { handle });
    return toKit(data?.product);
  },
  async getCart(id) {
    try {
      const data = await gql(CART_QUERY, { id });
      return toCart(data?.cart);
    } catch {
      return null;
    }
  },
  addLine(cartId, { variantId, quantity, print }) {
    const lines = [{ merchandiseId: variantId, quantity, attributes: toAttributes(print) }];
    return cartId ? mutate(CART_ADD, { id: cartId, lines }, "cartLinesAdd") : mutate(CART_CREATE, { lines }, "cartCreate");
  },
  updateLine(cartId, lineId, quantity) {
    return mutate(CART_UPDATE, { id: cartId, lines: [{ id: lineId, quantity }] }, "cartLinesUpdate");
  },
  removeLine(cartId, lineId) {
    return mutate(CART_REMOVE, { id: cartId, lineIds: [lineId] }, "cartLinesRemove");
  },
};
