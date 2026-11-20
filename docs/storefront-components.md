# Storefront components (for the Home and Kits pages)

Everything below lives in `storefront/src/`. Import it; don't copy it. Colours, fonts, radii and shadows are the
tokens in `styles/globals.css` (`bg-ink`, `text-muted`, `bg-sweep`, `rounded-card`, `shadow-card`, `display`,
`eyebrow`, ...). Please don't add new colours or fonts: ask in REQUESTS.md instead.

## Data
| Import | What it gives you |
|---|---|
| `useCollection("kits")` from `lib/useData` | `{ data: Kit[] \| undefined, loading, error }`, cached across pages |
| `useKit(handle)` | `{ data: Kit \| null \| undefined, loading, error }` (`null` means no such kit) |
| `useCart()` from `lib/cart` | `{ cart, busy, errors, open, setOpen, add(variantId, qty, print?), update, remove, checkoutUrl() }` |
| `format(money)` from `lib/money` | `"$89.99"` |
| `MODE` from `lib/config` | `"live"` with a token, `"demo"` without |

Types are in `lib/types.ts` (the contract). `Kit.images[0]` is the front, `[1]` the back with a sample print.

## Components
| Component | Props | Notes |
|---|---|---|
| `KitCard` (`components/KitCard`) | `kit`, `priority?`, `level?` (2 or 3) | The grid card: lifts on hover, turns to the printed back, sizes slide up for a one-tap add (pointer devices only). Links to `/kits/:handle` with a view transition. Use `priority` for the first row. Aspect 4:5. Pass `level={3}` when the grid sits under a section `h2` (Home), keep the default 2 under the page `h1` (Kits); axe flags a skipped level. |
| `Button` (`components/ui/Button`) | `variant` solid/accent/outline/ghost, `size` md/lg, plus `to` (router link), `href` (a) or button props | `buttonClass()` gives the classes if you need them on something else. |
| `Logo` | `className?` | The wordmark. |
| `PrintOverlay` | `name`, `number`, `ink?`, `animate?` | The name and number at the theme block's exact coordinates, in a 1000-unit SVG. Put it over a square `backBlank` image with `absolute inset-0`. Good for a hero. |
| `KitStage` | `kit`, `side`, `onSide`, `name`, `number` | The big flipping shirt from the product page. |
| `SizePills`, `PersonalizePills`, `PrintFields` | see the files | Product page pieces; reuse if a page needs them. |

Header, footer, announcement bar, cart drawer and the checkout password sheet are already in the layout
(`App.tsx`), so pages render only their own content inside `<main>`.

## Your two routes
`routes/Home.tsx` and `routes/Collection.tsx` are STUBS I wrote so the router builds. They're yours: replace them
whole. Keep the exports named `Home` and `Collection`.

## Layout conventions
- Page width: `mx-auto max-w-7xl px-4 sm:px-6`.
- Headings: `display` class; small label above: `eyebrow`.
- Grids of kits: `grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4`.
- Motion: `motion/react`. `<MotionConfig reducedMotion="user">` already wraps the app, so reduced motion is handled.
- Set `document.title` per page (`"All kits · Kits by Zizo"`).

## Tests
`cd storefront && npx vitest run` (18 tests: data layer plus the product page flow on the demo backend).
Component tests mount routes with `createMemoryRouter(routes, ...)`; `routes` is exported from `App.tsx`.
