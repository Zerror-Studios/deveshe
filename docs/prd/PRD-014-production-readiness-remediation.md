# PRD-014 — Production-readiness remediation: deveshe-dreams (pointer)

| Field | Value |
|---|---|
| Status | **In progress** — Wave 0 (W0-G) and Wave 1 (W1-STORE: FR-1.9, UX-31/34/36/37; FU-STORE: ₹0 orders, `SHIPPING_UNAVAILABLE`; QA-12 middleware tests) code complete 2026-10-25, not committed; not browser-tested, not run against a live backend or payment sandbox; Wave 1 exit PASS WITH NOTES 2026-10-25 (two verification passes, one fix round; audit Appendix I); **Wave 2 (W2-STORE, FR-2.8 + FE-22, plus the listing sort) implemented and verified 2026-10-26 (uncommitted); Wave 2 exit PASS WITH NOTES (two verification passes, one fix round; backend audit Appendix J)** · **Close-out implemented and verified 2026-10-26 (committed locally (D21)); final re-audit (backend audit Appendix K): PRD-014 code complete pending owner acceptance of the residual register (backend PRD-014 §10 "Close-out")** |
| Source-of-truth PRD | [`../../../zcom-backend/docs/prd/PRD-014-production-readiness-remediation.md`](../../../zcom-backend/docs/prd/PRD-014-production-readiness-remediation.md) |
| Approved by / on | Workspace owner, 2026-10-25, "approve with recommendations" (backend PRD §8.1; D9 = Q9 option (a)) |
| Audit | `zcom-backend/docs/audits/2026-10-25-production-readiness/E-clients-journeys.md` (UX-01, UX-02, UX-03, UX-04, UX-09, UX-35), `A-security-tenancy.md` (SEC-12), `G-journey-walk-notes.md` |

This repo's Wave 0 share: FR-0.8 (UX-01, UX-02, UX-03, UX-09), FR-0.9 (UX-35), FR-0.12 (UX-04) and FR-0.2 (SEC-12, the `next` upgrade). Wave 1 (W1-STORE): FR-1.9 (UX-05, FE-12, FE-24, UX-32 partial), UX-31, UX-34, UX-36, UX-37 (§1a). FR-2.8 (search/sort/newsletter/reviews/SEO) is not started here.

## 1. What changed (Wave 0)

### FR-0.8 / UX-01 — catalog reachable (D9: built in the existing visual language, the owner reviews it in UAT)
- **`/products`** (`pages/products/index.jsx`, SSR): every published product from `getClientSideProducts` (`filters.status = PUBLISHED`, which the server enforces too), 12 per page, **Load more** (client query through the one Apollo client, same filters, de-duplicated by `_id`), "Showing N of M", category chips from `getClientSideCategories`.
- **`/category/[slug]`** (`pages/category/[slug].jsx`, SSR): the category resolved with `getClientSideCategories(filter: { slug })` (special categories are never public; unknown slug → 404; API failure → error state with `noindex`), then `getClientSideProducts(filters.categoryIds: [category._id])`, same paging.
- Shared UI: `components/listing/ProductListing.jsx` (reuses `common/card/ProductCard`, `select_item` with list name "All products" / "Category: <name>") and `styles/components/product-listing.css` (2px black rules, heading font, 4 / 3 / 2 columns). Server reads go through `lib/catalog-listing.server.js` (server only: builds the edge-header client).
- **SEO:** each page sets its own title, description, `og`/`twitter` and a query-free canonical (`/products`, `/category/<slug>`); category pages prefer the category's `seo.title` / `seo.description`.
- **Home `#shop`:** the hard-coded category id `6898b3cdddf0354e025da816` and the `slice(1, 11)` cap are gone. The home asks the server for the 11 newest published products (one large card + ten) and adds **View all** → `/products`. A failed load shows "We could not load the collection" with **Try again**; an empty catalogue shows a neutral message. No endless skeleton.
- **PDP related products:** from the product's first category (`categoryIds[0]`), else all published, excluding itself; a failure leaves the grid empty instead of failing the page.
- **Navigation:** the "Shop" link (desktop `helpers/MenuData.jsx`, mobile `NavbarMobile.jsx`) and the lookbook "Shop the Collection" button go to `/products`.

### FR-0.8 / UX-02 — returning customers can pay
- `components/checkout/Delivery.jsx`: when saved addresses exist, the **primary** address (else the first) is selected once and copied into the form; a shopper's own choice is never overwritten. "Use a saved address" returns from the form to the list.
- Validation is visible outside the hidden form: a delivery-level alert names the first address error, and a saved address that fails validation opens the form so every field error shows.
- "Pay now" never does nothing: `handleSubmit(onSubmit, onInvalid)` shows a message at the button and scrolls to the failing section; a bag that hasn't loaded says so.

### FR-0.8 / UX-03 — displayed total = charged total
- `createCheckoutSessionFromCart` and `getCheckoutSession` now select `pricing { subtotal discount tax shipping total pricesIncludeTax isFreeShipping }`. Since the R-D fix round (W0V-C-03, §4) the session can be opened before "Pay now", and `components/checkout/OrderSummery.jsx` and `components/checkout/Shipping.jsx` show the server snapshot (subtotal, discount, shipping, tax, **Total**). Since the second fix round (W0V2-02, lead decision) it is opened **only on an explicit shopper action**: "Show final total" at the shipping step or "Pay now", never on page load, a preselected address or typing, because a session takes a 15-minute stock hold.
- Without a snapshot the summary shows the cart values labelled "Total before shipping" ("Estimated total" with free shipping), and shipping reads "Free" only when the cart says free shipping, else "Calculated at payment" (never a hard-coded "Free"). A bag, coupon or details change clears the pricing; the shopper confirms again to re-price.

### FR-0.8 / UX-09 — "Unavailable" instead of a silent Add to Bag
- `pages/product/[slug]/index.jsx` matches rare-element: a full option selection with no published variant, an ARCHIVED variant, or a `PRODUCT_UNAVAILABLE` answer from `addItemToCart` makes the button read **Unavailable** (`StockStatus.UNAVAILABLE`) and shows **Notify me** (a missing combination asks for the product, without a `variantId`).

### FR-0.12 / UX-04 — payment retry
- `pages/checkout/payment-failed/index.jsx` offers **Retry payment** when the kept unpaid order is found (`PendingOrder.findCartId(orderId)`, new in `utils/pending-order.util.js` and its rare-element twin) and **Back to cart** (opens the bag drawer). Retry returns to `/checkout/<cartId>`, where the existing pending-order mechanism reuses the same order while the bag, coupon, email and addresses match (the kept order's saved address is preselected, R-D; a changed address places a new order, see the backend gap in §4); the checkout shows "Your order is saved. Pay now to retry the payment…".

### FR-0.9 / UX-35 — no fabricated testimonials
- `components/home/ReviewSection.jsx` renders only **approved** reviews from `getReviews` (read in the home `getServerSideProps`; the server forces `APPROVED` for shoppers): up to four with a comment and a rating, with the real date and a link to the reviewed product. `user` is not selected (the server hides it from shoppers), so reviewers are not named. With no approved review the section is not rendered.

### FR-0.2 / SEC-12 — dependencies
- `next` `^15.2.2` (installed 15.5.9) → **`^15.5.28`** (latest 15.x patch: fixes the rewrite request-smuggling advisory and every other 15.x advisory listed by `npm audit`); `npm audit fix` (no `--force`) updated the lockfile (swiper 12.2.0, js-cookie, axios, form-data, nanoid, zod, sharp and others). No `eslint-config-next` in this repo.
- **Remaining** (`npm audit`, 2026-10-25): 1 high + 3 moderate, 0 critical. `postcss` (high) and `next` (moderate) only clear with **next 16** (a major, owner decision under backend PRD-014 Q14); `uuid` via `@react-three/drei` (moderate) needs drei ≥ 9.122 (outside the pinned `9.102.6`).

## 1a. What changed (Wave 1, W1-STORE, 2026-10-25)

- **FR-1.9 / UX-05 (D10, in-house, no dependency).** Google Consent Mode v2 defaults ("denied" for `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`) run in an inline head script before anything else, then the stored choice is applied. The banner (`components/common/ConsentBanner.jsx`: Accept all / Reject all / Manage with analytics and marketing; Escape closes only once a choice exists) stores `{ v: 1, analytics, marketing, savedAt }` in localStorage `zc_consent` and loads the tags only after consent (GA + GTM after "analytics"; this site has no Meta Pixel). The removed head/noscript tag code and the GTM preconnect mean **no request to Google before consent**. The footer "Cookie preferences" link reopens the banner; withdrawing sends a Consent Mode update. Shared helper: `utils/consent.util.js` (keep in sync with the other storefront).
- **FR-1.9 / FE-24.** No hard-coded fallback GA/GTM ids: an unset env id loads no tag (the owner sets the production ids in hosting).
- **FR-1.9 / FE-12.** `store/auth-store.jsx` persists only `{ isLoggedIn, userId }` (`partialize`, version 1; the migration rewrites the old `user-data` entry without the profile). `context/AuthContext.jsx` reloads the profile from `getMyProfile` after a page reload; the checkout fills the email once the profile arrives.
- **FE-24.** `view_item` (and item price) uses the lowest variant price when no variant is chosen, instead of 0 (`utils/analytics.js`, as rare).
- **UX-32 (partial).** Privacy policy `[DeVeSheDreams]` → "DeVeSheDreams", plus one factual consent sentence. **Owner text needed:** `[Jurisdiction]` (`pages/terms-of-service/index.jsx:57`).
- **UX-34.** `PASSWORD_MIN_LENGTH = 8` (`utils/Constant.jsx`) in signup, checkout and reset (signup was 6).
- **UX-31.** Mobile bag and menu icons and the desktop bag/account icons are labelled buttons/links; the bag drawer and the mobile menu are dialogs with `hooks/useDialogA11y.jsx` (focus in, Tab trapped, Escape, focus back, `inert` while closed, so the clipped menu's links leave the tab order).
- **UX-36.** `pages/_error.jsx` (branded "Something went wrong" with Try again / Back to home); the 404 gains a home link.
- **UX-37.** Bag drawer: "Loading your bag…" and an error with "Try again" instead of "no items"; drawer adds go through `runWithGuestId` (one retry on `INVALID_GUEST_ID`).
- UX-39 has no storefront part.

## 1b. What changed (Wave 2, W2-STORE, 2026-10-26)

- **Search (UX-28):** `/search?q=` (`src/pages/search/index.jsx`, server-rendered first page through `ProductListing`, `noindex`, `trackSearch`), search icon in `Navbar`/`NavbarMobile`. **Sort not built:** the backend `sort` argument arrived after this workstream; a control is a follow-up.
- **Newsletter (UX-29):** footer `NewsletterForm.jsx` (`subscribeNewsletter`; the old button linked to `/`); the checkout "Email me" box is **unticked by default** (it was pre-ticked) and writes `updateMyProfile` only on a real change; `/profile` email preferences are one real checkbox (`EmailPreferences.jsx`).
- **Reviews:** approved reviews on the PDP (`ProductReviews.jsx`, latest 10, hidden when none); no form (owner decision: `createReview` has no purchase check).
- **SEO (UX-33):** PDP meta from the product, Product JSON-LD (`ProductSchema.jsx`, `utils/product-offers.util.js`, no availability until PRD-020), canonical without query or hash (`SeoHeader.jsx`), SiteNavigation JSON-LD fixed, `pages/robots.txt.js` and `pages/sitemap.xml.js` (`utils/sitemap.util.js`, from `Const.ClientLink`); `test/seo-helpers.test.mjs` (4).

## 2. Contract

**Wave 2 (2026-10-26):** 36/36 operations valid (with variable shapes). New: `subscribeNewsletter`; `getReviews` also on the PDP; `getClientSideProducts` with `filters.search`. Backend source of truth: `zcom-backend` PRD-014 §5.4.

Wave 0:

Operations: **33/33 valid** against the composed supergraph (was 31). New: `getClientSideCategories` (`graphql/queries/category.gql.jsx`) and `getReviews` (`graphql/queries/review.gql.jsx`). Changed selection: `createCheckoutSessionFromCart` and `getCheckoutSession` select `pricing` (with `pricesIncludeTax`, `isFreeShipping`). `createOrder` is not used (backend removes it, §5).

## 3. Verification (2026-10-25)

- `npm run build` passes (with placeholder `API_GATEWAY_URL` / `NEXT_PUBLIC_TENANT_DOMAIN`); new routes `/products` and `/category/[slug]` are server-rendered; no edge secret in `.next/static`.
- Contract validator: 33/33.
- Grep checklist: `6898b3cdddf0354e025da816`, `slice(1, 11)` and the hard-coded testimonial names return nothing.
- **Not run:** a browser, a live gateway, a payment sandbox. `npm run lint` has no ESLint config (pre-existing). The UAT design review of the listing pages (D9) is the owner's.

## 4. Implementation log

- 2026-10-25 · W0-G · FR-0.8, FR-0.9 (UX-35), FR-0.12, FR-0.2 (SEC-12) as above.
- 2026-10-25 · Wave 0 fix round R-D · W0V-C-03 (FR-0.8 UX-03, FR-0.12 UX-04):
  - **Pricing before "Pay now".** `pages/checkout/[id]/index.jsx` opens the checkout session (`createCheckoutSessionFromCart`, same variables as "Pay now") as soon as the watched email + addresses pass `CheckoutSchema` (debounced 800 ms, stale answers ignored; superseded by the W0V2-02 entry below: now only on an explicit action) and shows its `pricing`, shipping included, in `Shipping.jsx` and `OrderSummery.jsx`. "Pay now" sends the same details, so the backend returns that same active session (R2-C8: same cart fingerprint, addresses and total), polls it to RESERVED and completes it; a changed address, bag or coupon makes the backend mark the old session FAILED (`CHECKOUT_REPLACED`) and release its hold. No parallel session or order is created by the storefront.
  - **Labels.** Without server pricing shipping reads "Calculated at payment" (or "Calculating…" / "Free" with cart free shipping) and the total "Total before shipping" ("Estimated total" with free shipping); a pricing error is shown under the shipping step.
  - **Reload / retry.** `utils/pending-order.util.js` keeps the kept order's checkout session id (`checkoutId`, optional); the page re-reads that session's `pricing` with `getCheckoutSession` while the details match, and never opens a new session for a kept order. `Delivery.jsx` takes `isPreferredAddress` and preselects the saved address of the kept order (else primary, else first), re-running only while the selection is automatic. A changed address shows "You changed the delivery details of your saved order. Paying now places a new order…".
  - **Backend gap (reported, not worked around):** after `completeCheckout` the session is COMPLETED, so `createFromCart` doesn't reuse or cancel it. A retry with different details creates a second UN_PAID order, and the first keeps its hold and promotion use. There is no customer cancel operation and no unpaid-order expiry job (`zcom-backend/services/commerce/src/services/checkout.service.ts` `createFromCart` step 4, `replaceActiveSessions` limited to `ACTIVE_SESSION_STATUSES`).
  - **Holds.** Opening the session early places the stock hold when the address is complete rather than at "Pay now"; it lasts `CHECKOUT_SESSION_TTL_MS` or until the details change.
  - **Verification.** `npm run build` with placeholder env passes; contract validator 33/33 (no new operation, no selection change). Not run in a browser, against a live gateway or a payment sandbox. rare-element's `pending-order.js` twin isn't updated (outside this workstream).
- 2026-10-25 · Wave 0 second fix round · W0V2-02 (hold timing, lead decision: price only on an explicit action):
  - **Problem.** R-D opened the session (and its 15-minute stock hold) whenever the form became valid, so a returning customer with a preselected primary address held stock on page load, and every pause in an edit replaced the session (release + new hold).
  - **Fix.** `pages/checkout/[id]/index.jsx` opens a session for pricing only when the shopper presses **Show final total** (new button in `Shipping.jsx`, the checkout's black pill style, with the hint "Confirm your details to see the shipping charge and your final total.") or **Pay now**. The confirm button runs the same `CheckoutSchema` validation as "Pay now" (`handleSubmit(…, onInvalid)`) and records the confirmed bag + details key (`confirmedKeyRef`); the debounce is gone and the session is created at once. Any later change to the email, addresses, bag or coupon drops the confirmation and the pricing, and nothing re-opens a session until the shopper confirms again. A failed pricing call or a "Pay now" that fails before an order exists also drops it ("Show final total" retries; nothing retries on its own).
  - **Kept.** A kept order still shows its stored session's pricing (`getCheckoutSession` by `checkoutId`) on reload or retry, with no confirmation and no new hold; the confirm button is hidden while an order is kept or while paying. Stale answers are still ignored (request id). "Pay now" with confirmed, unchanged details sends the same variables, so the backend returns the confirmed active session (R2-C8: cart fingerprint, addresses and total match; `attribution` is not part of the fingerprint); a "Pay now" pressed while a confirmation is in flight bumps the request id and the backend's reuse or unique-index race (VBUG-5) prevents a second session.
  - **Holds.** A hold now starts only from "Show final total" or "Pay now", and lasts `CHECKOUT_SESSION_TTL_MS` or until confirmed new details replace it. A non-reserving quote (`checkoutQuote`) is the Wave 1 follow-up (backend, T1 contract; audit W0V2-02 option b).
  - **rare-element.** Its `utils/pending-order.js` twin now has the same optional `checkoutId` field (unused there), so the two entries match.
- 2026-10-25 · W1-STORE · FR-1.9 consent banner + Consent Mode v2, no PII in localStorage (FE-12), no fallback tag ids, FE-24, UX-32 (partial), UX-31, UX-34, UX-36 (`_error.jsx`), UX-37. Build green, contract 33/33; not browser-tested.
- 2026-10-25 · FU-STORE (Wave 1 follow-up) · ₹0 orders (COM-08): `COMPLETE_CHECKOUT` selects `pricing { total }`, and a total of 0 skips `createPaymentSession` (the backend already placed the order PAID) (`src/pages/checkout/[id]/index.jsx`). `SHIPPING_UNAVAILABLE` has its own copy and focuses the address; `VARIANT_REQUIRED` on cart remove has fallback copy through `REMOVE_ITEM_OVERRIDES` in `components/cart/CartDrawer.jsx` (refetches the bag) (`src/utils/api-error.util.js`). Contract 33/33.
- 2026-10-25 · W1-CI / TEST-B (FR-1.6, FR-1.7 QA-12) · `npm run validate:ops` (operations and variable shapes, through the backend's `scripts/validate-clients`; the committed manifest is checked in the backend CodeBuild). `npm test` runs `test/middleware.test.mjs` with `node:test` and module hooks (no new dependency, Node ≥ 22.15): 10 tests over the `/v1/graphql` proxy (client tenant and `x-zcom-*` headers stripped, Origin/Referer dropped, edge headers added, fail closed without a tenant domain).
- 2026-10-25 · Wave 1 verification (lead) · Build passes; `npm test` 10/10; `validate:clients` 33/33, 0 failures. Open: owner legal text (UX-32), the tag ids in hosting, the Playwright "no tag before consent" proof; not run in a browser or against a live gateway.
- 2026-10-25 · Wave 1 fix round (re-audit W1V) · W1V-C-03: order attribution (`utils/ga-attribution.util.js`) is consent-gated (`startVisitAttribution`); without analytics consent nothing is captured and checkout sends `null`. W1V-C-05: `utils/consent.util.js` pushes `zc_consent_update` with `zcConsentAnalytics`/`zcConsentMarketing` before `gtm.js`; the GTM container must fire non-Google tags only on a marketing trigger (owner, UAT checklist). Second verification: `npm test` 14/14, build passes, `validate:clients` 33/33. Not run in a browser.
- 2026-10-26 · W2-STORE + Wave 2 verification (lead) · Items in §1b. Build passes; `npm test` 18/18; `validate:clients` 36/36, 0 failures. Open: the sort control, the review form (purchase check, owner), Playwright `data-testid`s; not run in a browser, against a live gateway or a payment sandbox.
- 2026-10-26 · Wave 2 fix round (re-audit W2V) · Listing sort on `/products`, `/category/[slug]` and `/search` (`?sort=` → `ClientProductSort`, read in `getServerSideProps`; `utils/listing-sort.util.js`, twin of rare's). `npm test` 22/22, build passes, `validate:clients` 36/36.
- 2026-10-26 · Wave 2 exit · Second verification PASS WITH NOTES (backend audit Appendix J); no deveshe finding open.
- 2026-10-26 · Close-out · K-01: UX-01 and UX-02 regression tests (`catalog-listing` 4, `checkout-address` 7) on extracted `src/utils/catalog-listing.util.js` and `src/utils/checkout-address.util.js`; `prebuild` runs `npm test` (owner: Vercel build command `npm run build`, Node ≥ 22.15); Playwright test ids `pdp-option-choice`, `pdp-add-to-cart`, `product-card-link`, `cart-checkout`, `checkout-pay-now`. Final verification: `npm test` 33/33, build passes, `validate:clients` 36/36. Final re-audit: backend audit Appendix K. Not run in a browser.
