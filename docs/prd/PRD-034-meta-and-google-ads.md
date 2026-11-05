# PRD-034 — Meta and Google ads (pointer)

| Field | Value |
|---|---|
| Status | **Phase 1 implemented** 2026-11-05 (this repo's FR-1.2, FR-1.3, FR-1.4, FR-1.6, FR-1.9); not browser-tested, not run against a live gateway, the Meta Test Events tool or Google Tag Assistant. Phases 2–4 have no storefront work |
| Source-of-truth PRD | [`../../../../zcom-backend/docs/prd/PRD-034-meta-and-google-ads.md`](../../../../zcom-backend/docs/prd/PRD-034-meta-and-google-ads.md) |
| Approved by / on | Anand Vishwakarma (owner), 2026-11-05 (D1–D13; D8: ad signals denied until the shopper agrees, everywhere) |

This storefront's part of Phase 1 is the browser tags, the click ids at checkout and the checkout link. Deveshe Dreams had **no Meta Pixel** before this change.

## What this repo does

- **Tag ids from the backend (FR-1.2).** `components/common/ConsentBanner.jsx` reads `storefrontTrackingConfig` once per page load through the one Apollo client (`cache-first`, `skipAuth`; public and edge-cached), and `utils/tracking-config.util.js` resolves the ids:
  - **GA4:** the backend's `ga4MeasurementId` wins; when it is null, `NEXT_PUBLIC_GA_MEASUREMENT_ID` (transition rule).
  - **Meta Pixel:** `metaPixelId` only (there is no env id, so no fallback).
  - **Google Ads:** `googleAds` only, and only with a conversion id and a purchase label.
  - **GTM:** stays env-only (`NEXT_PUBLIC_GTM_ID`).
  - A failed query, or one slower than 3 s (`TRACKING_CONFIG_TIMEOUT_MS`), counts as null: the env GA id still works and the page never breaks.
- **Consent (FR-1.3, D8).** `utils/consent.util.js` loads the Meta Pixel and the Google Ads tag (`gtag/js?id=AW-…`) **only with "marketing"** consent; Consent Mode v2 `ad_storage`, `ad_user_data` and `ad_personalization` follow the marketing choice (default denied in `_document.jsx`), `analytics_storage` follows analytics as before. Withdrawing marketing sends `fbq('consent','revoke')` and the Consent Mode update to denied, and every later ads call checks the stored choice, so nothing more is sent on that page.
- **One dispatcher (FR-1.3).** `utils/analytics.js` `trackEcomEvent` sends each e-commerce event to GA4 (analytics consent) and to `utils/ads-tracking.util.js` (marketing consent). Events fired before the ids are loaded wait in a small queue (`runWhenTrackingReady`, max 25) released by the banner.

  | Storefront event | Meta Pixel (`lib/fpixel.js`) | Google Ads conversion |
  |---|---|---|
  | `view_item` (PDP) | `ViewContent` | — |
  | `add_to_cart` (PDP) | `AddToCart` | `addToCartLabel`, when set |
  | `begin_checkout` (checkout page) | `InitiateCheckout` | `beginCheckoutLabel`, when set |
  | `purchase` (thank-you, once per order) | `Purchase` with `eventID` = order `_id` | `purchaseLabel` with `transaction_id` = order `_id` |

  Ads item ids are the **variant id** (the product feed's `id`): `content_ids`, `contents: [{ id, quantity }]`, `content_type: "product"`. The GA4 purchase `transaction_id` is the order `_id` too (it already was), matching the backend's server-side GA4 and Meta purchases.
- **Enhanced conversions (FR-1.6).** Only when `googleAds.enhancedConversions` is true **and** marketing consent: before the purchase conversion, `gtag('set','user_data', { sha256_email_address, sha256_phone_number })`, hashed in the browser with SubtleCrypto (`utils/ads-hash.util.js`). Email trimmed and lower-cased; phone in E.164 with the backend's rule (core `normalizeAdsPhone`: `+`/`00` keep their code, else leading zeros dropped and `+91` added to a 10-digit number). A value that can't be normalised is left out. The thank-you query now selects `userData { email phoneNumber countryCode }` and `shippingAddress { email phone countryCode }`; the plain values reach no tag.
- **Click ids and consent at checkout (FR-1.4).** `utils/ad-click-ids.util.js` (started in `_app.jsx`):
  - reads `gclid`, `gbraid`, `wbraid`, `fbclid`, `ctwa_clid` from the landing URL into `sessionStorage` (`zc_ad_clicks`);
  - persists them in `localStorage` (`zc_ad_clicks`, 90-day expiry) only once marketing is granted, and drops that copy when it is withdrawn;
  - reads the `_fbp` / `_fbc` cookies at checkout;
  - `createCheckoutSessionFromCart` gets `attribution` = the PRD-012 GA ids and UTMs (analytics consent, unchanged) plus `gclid gbraid wbraid fbclid fbp fbc ctwaClid` **only with marketing**, and always `consent: { analytics, marketing }`.
  - Values are clipped to 200 characters with control characters stripped.
- **User agent.** The `/v1/graphql` proxy copies the browser's request headers, so the real `user-agent` reaches the gateway (tested); the stripped headers are unchanged.
- **Checkout link (FR-1.9).** `/checkout/start?products=<variantId>:<qty>,…` (`pages/checkout/start`, `utils/checkout-start.util.js`): at most 20 lines, quantity 1–10 (missing = 1, repeats merged), ObjectId variant ids. The page finds each variant's product with `getVariantAvailability` (published only), adds the lines with `addItemToCart` (a guest through the server-issued guest id; a sold-out line is skipped, the rest go in) and opens `/checkout/<cartId>`. Checkout is customer-only, so a guest goes to login and returns to `/checkout/start?resume=1`, which opens the bag merged at login. A bad link shows a friendly message and "Go to the shop". The route is public in `middleware.js`; `/checkout` stays disallowed in robots. Each visit adds the lines again (no cart replacement).
- **CSP** (`next.config.mjs`): script `https://connect.facebook.net` and the Google Ads hosts; img and connect `https://www.facebook.com`, `https://www.googleadservices.com`, `https://googleads.g.doubleclick.net`, `https://www.google.com`; frame `https://td.doubleclick.net`, `https://www.facebook.com`.
- **Banner copy:** marketing cookies now name "Google Ads and the Meta Pixel".

## Decisions in this repo

- **Config read in the browser, not in `_app` / `_document`.** An `_app.getInitialProps` or `_document` read would make every static page dynamic, or bake the ids at build time; the browser read is edge-cached, and tags load only after consent anyway.
- **GA4 now needs analytics consent per event.** `trackGAEvent` and the PRD-013 `trackEvent` no longer push events into the dataLayer before analytics is granted: with marketing alone, gtag.js loads for Google Ads and would otherwise carry GA4 events. Events fired before the shopper answers the banner are dropped, not sent on a later grant.
- **GA4 items keep the variant SKU** as `item_id` (PRD-013 FR-2.2, the backend resolves either); only the ads networks get the variant id.
- **No Meta noscript pixel** (as for GTM since PRD-014 FR-1.9: nothing is requested before consent).

## Owner steps

- Install the Meta Ads and Google Ads apps on the store (dashboard) so `storefrontTrackingConfig` returns the ids; until then only the env GA id works and no ads tag loads.
- The `NEXT_PUBLIC_GA_MEASUREMENT_ID` env stays as the fallback until every store's GA4 app returns its id; then it can be removed from hosting.
- UAT (backend §9): the Meta Test Events tool shows Pixel and Conversions API `Purchase` deduplicated for one order; Google Tag Assistant shows the purchase conversion with `transaction_id` and enhanced conversions; with marketing refused nothing is sent; Meta's checkout URL opens `/checkout/start`.
- With `CSP_REPORT_ONLY=true` first: country Google domains (e.g. `www.google.co.in`) that the Ads tag may ping aren't listed; add them if the reports show them.

## Tests

`test/ads-tracking.test.mjs` (21): tag-id resolution and the GA env fallback, a failed or slow config query, the readiness queue; no Pixel, Ads tag, conversion or `user_data` without marketing, no GA4 event without analytics, revoke on withdrawal; variant ids, `eventID` / `transaction_id` = order id, enhanced conversions only when on and hashed; E.164 and SHA-256 vectors; click-id capture, persistence, expiry and withdrawal; the checkout attribution / consent payload; the `/checkout/start` parser. `test/middleware.test.mjs` (+2): the real user agent reaches the gateway; `/checkout/start` is public, checkout isn't.
