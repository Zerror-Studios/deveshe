# PRD-013 — Behaviour and product analytics depth: storefront event layer (pointer)

| Field | Value |
|---|---|
| Status | **Implemented** 2026-10-23 (this repo's part, FR-4); not browser-tested, not yet seen in GA4 Realtime |
| Source-of-truth PRD | [`../../../zcom-backend/docs/prd/PRD-013-behaviour-analytics-depth.md`](../../../zcom-backend/docs/prd/PRD-013-behaviour-analytics-depth.md) |
| Approved by / on | Anand (owner), 2026-10-23, "approve with recommendations" (every §9 recommendation accepted, nothing deferred) |
| Related | PRD-012 pointer (visit attribution) · `utils/analytics.js` (the four GA4 e-commerce events) |

This storefront's part of PRD-013 is **§4 D, the storefront event layer**: a fixed vocabulary of GA4 events and parameters that the analytics service reads back to fill `analytics_page_daily`, `analytics_product_daily` and `analytics_event_daily`. Nothing here touches the API client, the proxy, money or the contract (31/31 operations, unchanged).

## 1. The event layer

- **`src/utils/analytics-events.util.js`** mirrors the backend vocabulary `zcom-backend/packages/core/src/analytics/analytics-events.vocabulary.ts` by hand (`StorefrontEventEnum`, `CtaEnum`, `CUSTOM_DIMENSION_PARAMETERS`, `EVENT_PARAMETER_MAX_LENGTH = 100`), plus the storefront-only value sets `CheckoutStepEnum` (`address | shipping | payment`) and `GalleryActionEnum` (`thumbnail | prev | next | swipe | zoom | video_play`). Keep the three files in sync (the rare-element twin is `utils/analytics-events.js`).
- **`trackEvent(name, params)`** sends through `window.gtag` with `send_to: GA_TRACKING_ID`. It is a silent no-op on the server or when `gtag` isn't loaded, clips every string to 100 characters, drops `null`, `undefined` and empty values (also inside `items[]`), and never throws.
- **`item_id` convention (FR-2.2).** Every event uses the identifier `mapProductToGA4Item` uses for the e-commerce events in this storefront: the **variant `sku`**. When no variant is chosen yet (listing cards, the first `view_item`, which fires before the default options are applied) it now falls back to the **first variant's `sku`** instead of the product id, so the backend can resolve every `item_id` through `product_variant`. `getAnalyticsItemId(product, variant)` is the one helper every call site uses.
- **No PII** in any parameter; `reason` is always the GraphQL `extensions.reason` (or `extensions.code`), never message text.
- The four GA4 e-commerce events stay in `utils/analytics.js` (`trackEcomEvent`): `view_item`, `add_to_cart`, `begin_checkout`, `purchase` (unchanged, apart from the `item_id` fallback).

## 2. Events wired (FR-4.1)

| Event | Where it fires | Parameters |
|---|---|---|
| `select_item` | `components/common/card/ProductCard.jsx` (the card `<Link>` click), with `product` + `listName` from `components/home/ProductSection.jsx` ("Home products"), `components/product/ProductListGrid.jsx` (the grid title, "You may also like"), `components/listing/ProductListing.jsx` ("All products" on `/products`, "Category: <name>" on `/category/[slug]`, PRD-014), `components/lookbookChapter/ProductContainer.jsx` ("Lookbook"; the lookbook has no backend yet, so this stays dormant) | `item_list_name`, `items[]` (`item_id`, `item_name`, `item_category`, `price`, `quantity`, `item_brand`, `item_variant`, `item_list_name`) |
| `select_variant` | `components/product/ProductContent.jsx` `handleVariants` (every colour/size choice) | `item_id`, `variant_id` (the matched variant's SKU), `variant_label` (the chosen values joined with ` / `), `in_stock` (`"true"`/`"false"` only once every option is chosen; the API exposes no stock level, so only an ARCHIVED or missing variant is `"false"`) |
| `cta_click` | `ProductContent.jsx`: "Add to Bag" (`add_to_cart`, also when it still reads "Select a Size"), "Notify me" (`notify_me`), "… Assistance" (`size_guide`); `components/product/ProductListGrid.jsx` mobile "Add to Bag" (`add_to_cart`); `components/cart/CartDrawer.jsx` "Checkout" (`checkout`); `components/checkout/OrderSummery.jsx` coupon "Apply" (`apply_coupon`); `pages/checkout/[id]/index.jsx` "Pay now" (`pay_now`) | `cta`, `page_path` (`window.location.pathname`), `item_id` (product page) |
| `gallery_interaction` | `components/product/ProductImageGrid.jsx`: opening the full-screen preview from the desktop grid or the phone swiper (`zoom`), a phone swipe (`swipe`) | `item_id`, `action` |
| `size_guide_open` | `pages/product/[slug]/index.jsx` `handleOpen` (the Size Assistance panel) | `item_id` |
| `notify_me` | `pages/product/[slug]/index.jsx` after `createBackInStockRequest` succeeds | `item_id`, `variant_id` |
| `coupon_apply` / `coupon_failed` | `components/checkout/OrderSummery.jsx` after `applyCartPromotion` | `coupon`; `reason` (e.g. `PROMOTION_INVALID`, `PROMOTION_EXPIRED`, a code, or `UNKNOWN`) |
| `add_shipping_info` | `pages/checkout/[id]/index.jsx` `onSubmit`, once per checkout visit, when the validated form is submitted (Q3: the address is complete) | `currency`, `value` (server `discountedPrice`), `coupon`, `shipping_tier` (`free` when the cart has free shipping, else `standard`), `items[]` |
| `add_payment_info` | `pages/checkout/[id]/index.jsx` right before `openPaymentCheckout` (Q3: the payment window opens) | `currency`, `value`, `coupon`, `payment_type` (the payment app: `razorpay`, `cashfree`, `nimbbl`, `payu`), `items[]` |
| `checkout_error` | Since 2026-11-12 the kit's `useCheckout` sends it for every reservation, place-order, payment-session and payment refusal and a closed payment window (`PAYMENT_DISMISSED`, with `provider`) on both checkout paths; the store adds only the payment-return failures. Before: `pages/checkout/[id]/index.jsx`: reservation failures and any error before an order exists → `step: address`; `createPaymentSession` errors, a payment window that fails to open (`PAYMENT_WINDOW_FAILED`), a dismissed window (`PAYMENT_DISMISSED`), `verifyPayment` failures → `step: payment`; `pages/checkout/payment-return/index.jsx` (redirect / form-post returns) → `step: payment` | `step`, `reason`, `provider` (when known) |
| `search` | **not wired**: this storefront has no site search UI. `trackSearch(term, resultCount)` exists for the day it does. | `search_term`, `result_count` |

Not applicable here: `cta: wishlist` (this storefront has no wishlist) and `cta: buy_now` (one "Add to Bag" button), and `step: shipping` (the shipping block is informational; shipping is server-computed).

## 3. Not done / owner steps

- Register the ten custom dimensions (`cta`, `variant_id`, `variant_label`, `in_stock`, `action`, `reason`, `step`, `coupon`, `page_path`, `item_id`, event scope) in the GA4 property; the admin hub lists what is missing (FR-1.4).
- Confirm the events in GA4 Realtime once a build runs in a browser (PRD-013 §8 step 5).

## Implementation log

| Date | Entry |
|---|---|
| 2026-10-23 | Event layer `utils/analytics-events.util.js`; events wired as in §2; `mapProductToGA4Item` falls back to the first variant SKU. Production build passes; contract validation 31/31 (no GraphQL change). Docs: this pointer, docs index, changelog, CLAUDE.md, solution-architecture, `storefronts/CLAUDE.md`. |
