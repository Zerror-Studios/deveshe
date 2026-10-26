# PRD-020: Public stock signal, storefront (pointer)

| Field | Value |
|---|---|
| Status | **Approved** 2026-10-26 · **Implemented** 2026-10-26 (FR-13, FR-14; working tree, not browser-tested) |
| Source-of-truth PRD | [`../../../../zcom-backend/docs/prd/PRD-020-public-stock-signal.md`](../../../../zcom-backend/docs/prd/PRD-020-public-stock-signal.md) |
| Approved by / on | Anand (owner), 2026-10-26: "please review and approve the six drafted follow-up PRDs" (every §8 recommendation accepted) |
| Rollout step | Backend §7.1 step 4 (FR-13, FR-14), after the backend ships with the signal off; checked per root `CLAUDE.md` §5.5 with the signal off and on |

Only this repo's notes are here; requirements, contract and decisions live in the backend PRD.

## This repo's part
- **`null` means today's behaviour, exactly.** `Variant.availability`, `Variant.availableQuantity` and `Product.availability` are nullable; no client flag is needed.
- **PDP:** `src/pages/product/[slug]/index.jsx` (`getServerSideProps`); `src/utils/catalog.util.js` `isVariantUnavailable` keeps ARCHIVED and adds `OUT_OF_STOCK`. Out-of-stock option chips struck through, still selectable, `aria-label="<value>, sold out"`; CTA "Notify me" (email field, no login needed) for `OUT_OF_STOCK`; "Only N left" (only when `availableQuantity` is set) or "Low stock" for `LOW_STOCK`. `getVariantAvailability` on mount and on variant change overrides the server value; while it is pending show the server value (no CTA spinner); if it fails keep the server value and never block add-to-cart.
- **Listings:** "Sold out" / "Low stock" text badges on `/products` and `/category/[slug]` (PRD-014 FR-0.8) and the grid Notify-me wrap. The store's `SHOW | SORT_LAST | HIDE` is applied by the server; the client sends no availability filter unless the user picks one.
- **Cart:** on the cart, call `getVariantAvailability` on open; an `OUT_OF_STOCK` line shows "Sold out" + Remove and checkout is disabled with "Remove sold-out items to continue". Checkout's `OUT_OF_STOCK` stays the authority.
- **SEO:** extend the existing `toProductOffers` in `src/utils/product-offers.util.js` (W2-STORE) with `availability` from `Product.availability` (`IN_STOCK`/`LOW_STOCK` → `https://schema.org/InStock`, `OUT_OF_STOCK` → `OutOfStock`, `null` → omitted), keeping the rare-element and deveshe twins in sync; `node:test` cases for the mapping.
- **Analytics:** `src/utils/analytics-events.util.js` (`in_stock`) takes the signal when non-null.

## Implementation log

**2026-10-26: FR-13 and FR-14 DONE in code** (working tree, not committed, not browser-tested; the backend is built in its working tree with the signal off for every store).

| Item | Status | Where |
|---|---|---|
| Helpers | DONE | `src/utils/stock-signal.util.js` (twin of rare `utils/stock-signal.js`); `utils/catalog.util.js` `isVariantUnavailable(variant, fresh)` keeps ARCHIVED and adds OUT_OF_STOCK: bucket → copy, schema.org, fresh-read merge (the fresh answer wins only for the ids it answered; `null` = no signal), option and cart-line states, analytics flag |
| Fresh read | DONE | `src/hooks/useVariantAvailability.jsx` + `GET_VARIANT_AVAILABILITY`: ≤ 50 distinct ids, `network-only`; keeps the last good answer, so a pending or failed read shows the SSR value and never blocks add to cart |
| PDP | DONE | `pages/product/[slug]/index.jsx` / `ProductContent.jsx`: read on mount and on a variant change; size and colour choices whose variants (with the other selected options) are all `OUT_OF_STOCK` are struck through (a diagonal line on swatches), still selectable, `aria-label="<value>, sold out"`; a sold-out selection shows "Sold out" + "Notify me", also in the mobile bag bar (`ProductListGrid.jsx`, the grid's Notify-me wrap, which had no Notify me before); `LOW_STOCK` shows "Only N left" (only with `availableQuantity`) or "Low stock" (plain text, not live-announced) |
| Notify me without login | DONE | guests get an email field (labelled) and `requestBackInStock` is sent with that email (validated on the client, the server checks it too); logged-in shoppers still use their account |
| Listing | DONE | `components/common/card/ProductCard.jsx` (every grid: `/products`, `/category/[slug]`, search, home, related): "Sold out" / "Low stock" badge from `Product.availability` (`GET_PRODUCTS` selects it); no client availability filter (the server applies `SHOW | SORT_LAST | HIDE`) |
| Bag drawer | DONE | `CartDrawer.jsx` / `CartProduct.jsx`: fresh read on open (variant id, else product id); "Sold out" on the line (Remove stays, "+" disabled), "Only N left" when qty > the exposed count; "Checkout" is held with "Remove sold-out items to continue" (toast + note). deveshe has no separate cart page |
| Analytics | DONE | `select_variant.in_stock` from the signal when non-null (`toInStockFlag`), else today's "the combination exists" |
| SEO (FR-14) | DONE | `src/utils/product-offers.util.js` `toProductOffers(variants, url, availability)`; `ProductSchema.jsx` passes `Product.availability`; `null` omits it |
| Tests | DONE | `test/stock-signal.test.mjs` (null behaviour, copy, schema.org on `Offer` and `AggregateOffer`, fresh-read merge and id cap, option chips, cart lines, `isVariantUnavailable`) |

Contract: `getVariantAvailability` plus `availability` / `availableQuantity` fields; `validate:clients` 41/41. Limits: a bag with more than 50 distinct lines checks the first 50 only (the rest render as no signal). Open: the §7.1 step 5 browser check with the signal off and on (including `HIDE` and every sort), owner copy approval (§6 defaults used).
