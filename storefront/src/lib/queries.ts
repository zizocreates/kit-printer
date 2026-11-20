// Storefront API GraphQL (version in config.ts). Metafields only come back if their definitions allow Storefront API reads.

const KIT = /* GraphQL */ `
  fragment KitFields on Product {
    id handle title vendor descriptionHtml
    images(first: 4) { nodes { url altText width height } }
    variants(first: 20) { nodes { id title availableForSale selectedOptions { name value } price { amount currencyCode } } }
    priceRange { minVariantPrice { amount currencyCode } }
    printPrice: metafield(namespace: "kit_printer", key: "print_price") { value }
    shirtColour: metafield(namespace: "kit_printer", key: "shirt_colour") { value }
    printColour: metafield(namespace: "kit_printer", key: "print_colour") { value }
    backImage: metafield(namespace: "kit_printer", key: "back_image") {
      reference { ... on MediaImage { image { url altText width height } } }
    }
  }
`;

const CART = /* GraphQL */ `
  fragment CartFields on Cart {
    id checkoutUrl totalQuantity
    cost { subtotalAmount { amount currencyCode } }
    lines(first: 50) {
      nodes {
        id quantity
        attributes { key value }
        cost { amountPerQuantity { amount currencyCode } totalAmount { amount currencyCode } }
        merchandise {
          ... on ProductVariant {
            id title selectedOptions { name value }
            product { handle title images(first: 2) { nodes { url altText width height } } }
          }
        }
      }
    }
  }
`;

const ERRORS = `userErrors { code field message } warnings { code message }`;

export const COLLECTION = `${KIT} query Collection($handle: String!) { collection(handle: $handle) { products(first: 24) { nodes { ...KitFields } } } }`;
export const PRODUCT = `${KIT} query Product($handle: String!) { product(handle: $handle) { ...KitFields } }`;
export const CART_QUERY = `${CART} query Cart($id: ID!) { cart(id: $id) { ...CartFields } }`;
export const CART_CREATE = `${CART} mutation CartCreate($lines: [CartLineInput!]) { cartCreate(input: { lines: $lines }) { cart { ...CartFields } ${ERRORS} } }`;
export const CART_ADD = `${CART} mutation CartAdd($id: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $id, lines: $lines) { cart { ...CartFields } ${ERRORS} } }`;
export const CART_UPDATE = `${CART} mutation CartUpdate($id: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $id, lines: $lines) { cart { ...CartFields } ${ERRORS} } }`;
export const CART_REMOVE = `${CART} mutation CartRemove($id: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $id, lineIds: $lineIds) { cart { ...CartFields } ${ERRORS} } }`;
