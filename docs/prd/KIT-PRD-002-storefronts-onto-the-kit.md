# KIT-PRD-002 — Move Deveshe Dreams and Nahara onto the kit (pointer to the kit's PRD-002)

| Field | Value |
|---|---|
| Status | **Approved** 2026-11-10 (owner) · step 4 (Deveshe to the App Router) **implemented** 2026-11-11, pushed `984faf7` (D11: started before step 3's browser checks) · step 5 (onto the kit) **implemented in the working tree** 2026-11-11 |
| Source-of-truth PRD | `../../../../zcom-storefront-kit/docs/prd/PRD-002-storefronts-onto-the-kit.md` (the kit repo; it changes no backend contract, backend ADR-010) |
| Repos affected | zcom-storefront-kit · storefronts/rare-element · storefronts/deveshe-dreams (this repo) · zcom-backend (client manifests only) |

This repo keeps only Deveshe Dreams' notes. Decisions D1–D11, the gap review and the requirements are in the source PRD; the routing decision is `../adr/ADR-001-app-router.md`.

## Deveshe Dreams (step 4: App Router, on the store's own plumbing, FR-3.1–3.5)

**Routes (FR-3.1, all URLs unchanged):** every `src/pages` file moved to `src/app`:
- the data pages (`/`, `/products`, `/category/[slug]`, `/search`, `/product/[slug]`, `/pay/[token]`) read through server-only loaders in `src/lib/page-data/*.server.js` (the old `getServerSideProps` code), once per request (`cache()`), `dynamic = "force-dynamic"`; an unknown slug is still a 404;
- the meta objects became `generateMetadata` / `metadata` (`lib/seo-metadata.util.js`, the tags `SeoHeader` wrote) and the JSON-LD `components/seo/PageSchemas.jsx`;
- the page components are client views in `src/views/`;
- `/sitemap.xml`, `/robots.txt` and `/api/payments/return` are route handlers with the same output and headers (the return keeps a relative `Location`);
- `/pay/*` gets `X-Robots-Tag` and `Referrer-Policy: no-referrer` from `next.config.mjs`; Next's own private, no-store Cache-Control replaces the hand-set one.

**Shell (FR-3.2):** `app/layout.jsx` (Consent Mode defaults in `<head>`, the global CSS) + `components/layouts/Providers.jsx` (Apollo, auth, layout, Lenis, toasts, attribution, Pixel PageView per navigation); `not-found`, `error`, `global-error`.

**Navigation (FR-3.3):** `next/router` → `next/navigation`: `useSearchParams` (Suspense on the static pages that read it), `usePathname` effects for the Pixel, the hash scroll and the navbars; the token pages read the link once from `window.location` and drop it with `history.replaceState` (shallow, as before). `middleware.js` → `proxy.js` (Next 16). Server reads use `lib/server-apollo.server.js`.

**Packages (FR-3.4, D3, D7):** Next 16.4.6, React 19.3.1, Apollo Client 4.3.8, graphql 17.1, three 0.187, r3f 9.8.2, drei 10.7.9, lenis 1.3.27 (was `@studio-freight/lenis` + tempus; the options 1.0.42 actually applied are kept), Swiper 14.4, html-react-parser 6.1, @hookform/resolvers 7.0, react-hook-form 7.91, zod 4.6, zustand 5.1, react-toastify 11.2, react-international-phone 4.8, react-icons 5.7; `react-modal` (unused) and `react-outside-click-handler` (React ≤ 16; replaced by a small effect in `ModalComponent`) removed. `nimbbl_sonic` stays until step 5 (the kit's payment launcher).

**Checks (2026-11-11):** `npm run build` (129/129 tests, every route, Next 16 + Turbopack); no edge secret in `.next/static`; `next start` smoke test without a backend (status codes, metadata and JSON-LD, consent script in `<head>`, CSP, the `/pay` headers, the login guard, the payment return, `/.well-known/zcom-store`, robots) and the `/v1/graphql` proxy against a local echo gateway (tenant and edge headers, right-most client IP, forged `x-zcom-store` and `Origin` dropped); backend `validate:clients` 58/58 operations.

**Not run yet (FR-6.2, owner):** the kit's `zcom-live-check` against a running backend and the manual browser pass, which also covers the library majors (three 0.187 / r3f 9 contact scene, Swiper 14, html-react-parser 6, lenis 1.3) and the GSAP pages.

## Deveshe Dreams (step 5: onto the kit, FR-4.1)

**Moved onto `@zcom/storefront-kit` v1.0.2** (installed from its GitHub tag; `allowScripts` approves its build-on-install pinned to the tag's commit; `vercel.json` installs it with the shared `GITHUB_TOKEN`):
- `src/proxy.js` → the kit's `createZcomMiddleware`: proxy, store identity, branded 503 (`buildStoreUnavailableHtml`), login guard for `/profile` and `/checkout` (payment-failed, payment-return and start stay public).
- `lib/apolloClient.jsx`, `lib/customer-session.service.js` and `utils/tokenManager.js` → the kit's `ZcomSsrProvider` and session; `context/AuthContext.jsx` signs in, signs up and out through the kit's `useAuth` and keeps `useAuthStore` in step; Login and Signup call it.
- Server reads: `lib/server-apollo.server.js`, `lib/edge-headers.server.js` and `lib/api-config.util.js` → `lib/server-query.js` on the kit's `zcomFetch` (never cached; `createServerQueryClient` keeps the loaders' code); `/pay/[token]` passes the shopper's IP from `getRequestClientIp`.
- Consent, tags and attribution (`utils/consent.util.js`, `utils/tracking-config.util.js`, `lib/fpixel.js`, `utils/ads-tracking.util.js`, `utils/ads-hash.util.js`, `utils/ga-attribution.util.js`, `utils/ad-click-ids.util.js`, the `STOREFRONT_TRACKING_CONFIG` document) → the kit's `CONSENT_DEFAULT_SCRIPT`, `ZcomTags`, `updateConsent`, `openConsentPreferences`, `buildAttribution`, `buildCheckoutConsent`, `trackEvent` and ads functions; `utils/analytics.js` and `analytics-events.util.js` keep Deveshe's item mapping (GA4 `item_id` = SKU, ads id = variant id) and still send the GA4 purchase (deduplicated on the order id).
- Payments: `utils/payment-checkout.util.js` on the kit's `launchPayment` (`nimbbl_sonic` removed), the payment-return page on `usePaymentReturn`, the return route = the kit's `paymentReturnHandler`, the payment-link return in `PaymentLinkTokenStore`.
- `/checkout/start` on `useCheckoutStart` (Deveshe's `?resume=1` after login kept, so the merged customer bag opens); the guest cart id (`useVisitor` on `guestCartStore`), the fresh stock read (`useStockSignal`), the stock, sort, redirect and JSON-LD rules, the security headers (`buildSecurityHeaders`), `lib/store-status.util.js` and `lib/store-identity.server.js` (in the kit's proxy).
- `js-cookie` and `nimbbl_sonic` removed; `rxjs` and `@apollo/client-integration-nextjs` added (kit peers, Nahara's versions).

**Still Deveshe's (by design):** the checkout view's own flow and pending-order store, the sanitiser, the consent banner UI, error copy (passed to the kit as `errorMessages`), the SEO meta and JSON-LD components, the token pages' views.

**Tests:** the proxy, store-status, consent, attribution and ads suites (55 tests) moved to the kit's own tests; 74 store tests remain.

**Checks (2026-11-11):** `npm run build` (74/74 tests); no edge secret in `.next/static`; a `next start` smoke test with a local echo gateway (proxy headers, login guard, payment return 303 with a relative `Location`, `/pay` headers, CSP, store identity, consent script); backend `validate:clients` 57/57 operations.

**Differences to know:** off Vercel the kit's proxy sends no client IP (only `trustedIpHeader`; Vercel's own header on Vercel); the GTM dataLayer event is the kit's `zcom_consent_update` with `zcomConsentAnalytics` / `zcomConsentAds` (was `zc_consent_update` with `zcConsentAnalytics` / `zcConsentMarketing`; a stored v1 choice is carried over); a payment-link return stored under `zc_pay_request` before the deploy isn't carried over (minutes-lived).

**Not run yet (FR-6.2, owner):** the live check and the browser pass (steps 4 and 5 together).
