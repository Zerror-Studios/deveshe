# deveshe-dreams — Deveshe Dreams storefront

This is a custom-designed shopper storefront on the **ZCommerce** platform by Zerror Studios. It's built with Next.js 16 with the App Router (React 19.3; moved from the Pages Router on 2026-11-11, `docs/adr/ADR-001-app-router.md`) in JavaScript, and it consumes the shared ZCommerce GraphQL gateway (`../../zcom-backend`) through `@zcom/storefront-kit` (since 2026-11-11, kit PRD-002 step 5: proxy, session, consent and tags, payments, server reads). Payments go through the store's payment app (Razorpay, Cashfree or PayU).

> Working here with Claude Code or as a new engineer? Read [`CLAUDE.md`](CLAUDE.md), then [`docs/README.md`](docs/README.md). The API contract every storefront follows is in `../../zcom-backend/docs/architecture/storefront-api-contract.md`.

**Integration status: current.** Since PRD-002 (2026-10-14, rounds 1 to 3) every operation validates against the backend schema (29/29 then; 36/36 operations with variable shapes after the PRD-014 close-out; 41/41 with the PRD-020 stock signal and the PRD-015 order page `/profile/orders/[id]`; 42/42 with `confirmBackInStock`, CP-22, 2026-10-26), including the newsletter `/unsubscribe` page and the guest back-in-stock confirmation page `/back-in-stock/confirm`. The site calls the API same-origin at `/v1/graphql` (proxied to the gateway by `src/proxy.js`, the kit's `createZcomMiddleware`, which adds the edge headers: client IP, tenant domain and the edge secret), picks the tenant by its domain, uses server-issued guest cart ids, keeps the access token in memory and uses the HttpOnly customer cookie for refresh (the kit's session). Since backend PRD-041 (2026-11-12, kit 1.1.0) shoppers check out without signing in unless the store's accounts are REQUIRED, sign in with an emailed 6-digit code (also the sign-up; password sign-in stays behind "Sign in with password instead"), and each order has a status page `/orders/status/<token>`. **On kit 1.1.0** (`package.json` and the lockfile pin the `v1.1.0` tag, commit `0daf3ea`, since 2026-11-12). Not yet tested end to end against a running backend or a payment sandbox.

## Getting started

`npm ci` installs `@zcom/storefront-kit` from the private `Zerror-Studios/zcom-storefront-kit` repo, so your git needs read access to it (your own GitHub login locally; on Vercel the shared `GITHUB_TOKEN` through `vercel.json`).

```bash
npm ci
cp .env.example .env.local   # fill in the values (ask the team; never commit them)
npm run dev        # http://localhost:3000
```

**Environment variables** (names only, see `.env.example`):
- `API_GATEWAY_URL` (server-only, **required**): the gateway origin; `/v1/graphql` is proxied to it. A production build fails without it; dev and lint start without it (re-audit RMAINT-6).
- `NEXT_PUBLIC_TENANT_DOMAIN` (**required**, also enforced by production builds): the brand's production domain, used to select the tenant. Without it the `/v1/graphql` proxy fails closed with a 500.
- `EDGE_SHARED_SECRET` (server-only, optional): the gateway's edge secret, sent as `x-zcom-edge-secret` on proxied and server-side calls so the gateway's strict mode trusts this site's tenant and client-IP headers. Never prefix it with `NEXT_PUBLIC_`.
- `ZCOM_STORE_SLUG` (server-only, PRD-018 FR-4.3): this store's slug; `/.well-known/zcom-store?nonce=<hex>` answers `{ slug, nonce, signature }` with an HMAC of `<slug>:<nonce>` under `EDGE_SHARED_SECRET` for the platform's go-live check (503 while unset, 400 for a missing or malformed nonce; CP-18).
- `NEXT_PUBLIC_SUPPORT_EMAIL` (optional): the contact address on the suspended-store page (PRD-018 FR-1.6); defaults to `deveshedreams@gmail.com`.
- `CSP_REPORT_ONLY` (optional): `true` sends the CSP as `Content-Security-Policy-Report-Only` (rollout switch).
- `IMAGE_REMOTE_HOSTS` (optional): extra `next/image` hosts, comma-separated (e.g. the tenant's S3 bucket).
- `REVIEW_UPLOAD_HOSTS` (optional, PRD-032): the media bucket or CDN host that shopper review photos are posted to and shown from, comma-separated, when it isn't `*.s3.amazonaws.com` or `*.s3.ap-south-1.amazonaws.com`; added to the CSP `connect-src` and `img-src`.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GTM_ID`: analytics IDs. No defaults since PRD-014 FR-1.9 (an unset id loads no tag); tags load only after cookie consent. Since PRD-034 the store's GA4, Meta Pixel and Google Ads ids come from the backend (`storefrontTrackingConfig`, the store's apps): `NEXT_PUBLIC_GA_MEASUREMENT_ID` is only the fallback while the store has no GA4 app, the Pixel and the Google Ads tag have no env name and load only with marketing consent, and GTM stays env-only. The ads checkout link is `/checkout/start?products=<variantId>:<qty>,…`.

Every `NEXT_PUBLIC_*` value is public in the browser bundle. The old `NEXT_PUBLIC_DB_TOKEN`, `NEXT_PUBLIC_BACKEND_ENDPOINT`, `NEXT_PUBLIC_NIMBBL_BASE_URL` and `NEXT_PUBLIC_GRAPHQL_API_URL` are no longer read.

**Deploying** (owner):
- **AWS Amplify** (`amplify.yml`, the twin of `vercel.json`): set `GITHUB_TOKEN` (read access to the private kit repo) and the server variables (`API_GATEWAY_URL`, `EDGE_SHARED_SECRET`, `ZCOM_STORE_SLUG`, and `ZCOM_TRUSTED_IP_HEADER` once the host's trusted client-IP header is confirmed) as Amplify environment variables. The build rewrites GitHub git URLs to https with the token (the kit is a git dependency; the `.npmrc` token line only covers the npm registry) and writes the server variables to `.env.production`, because Amplify gives console variables to the build only and the kit reads these at runtime. `NEXT_PUBLIC_*` names are baked in at build and need nothing extra. Confirm on the first `dev` deploy that Amplify runs Next 16 with `src/proxy.js`.
- set the two required variables in Vercel, make sure the domain is an ACTIVE tenant in the backend's `db_configs`, and add the storefront origin to the gateway's `CORS_ORIGINS`;
- set `EDGE_SHARED_SECRET` in Vercel **at the same moment** as on Elastic Beanstalk and the CloudFront origin header (that turns on the gateway's strict mode), in the **same deploy** as backend PRD-002 round 3 (its 30/min per-IP login bucket would otherwise see every shopper as this host's IP), and confirm the host's client IP source (`x-vercel-forwarded-for` on Vercel, else the right-most `x-forwarded-for` hop);
- roll the CSP out with `CSP_REPORT_ONLY=true` first;
- rotate the old GreenSock token: it is no longer in `.npmrc` (2026-11-11) but stays in git history (SF-2);
- run a browser and payment-sandbox checkout before go-live;
- add `GITHUB_TOKEN` (the shared Vercel team variable) to the project: `vercel.json` uses it to install the private `@zcom/storefront-kit` from GitHub;
- rename any merchant GTM trigger on `zc_consent_update` / `zcConsentMarketing` to the kit's `zcom_consent_update` / `zcomConsentAds` (and `zcConsentAnalytics` to `zcomConsentAnalytics`).

Shopper-visible effects: existing shoppers log in once (the old JS refresh cookie is removed) and old guest bags are dropped once (guest ids are now server-issued); login without `?next=` lands on `/`; checkout is locked while an unpaid order exists, and a coupon change creates a new order; the thank-you page never shows success before payment is confirmed; a missing store shows a "store unavailable" notice.

GSAP comes from the public npm registry (`gsap` 3.15, every plugin free since 3.13); no GreenSock registry access is needed. If your own `~/.npmrc` still maps `@gsap` to `npm.greensock.com`, point it at `https://registry.npmjs.org/` or installs hang. `.npmrc` names `GITHUB_TOKEN` (for `@zcom/storefront-kit`, Kit PRD-002) from the environment only; never put a token in it.

## Scripts

| Task | Command |
|---|---|
| Dev | `npm run dev` |
| Build | `npm run build` |
| Start (after build) | `npm run start` |
| Contract check | `npm run validate:ops` (operations and `variables` shapes against the composed supergraph; needs `../../zcom-backend` installed and built; PRD-014 FR-1.6) |
| Lint | `npm run lint` (currently not functional; see `CLAUDE.md` §4) |

Tests: `npm test` runs `test/*.test.mjs` with `node:test` (Node ≥ 22.15, no extra dependency) and **runs before every `npm run build`** (`prebuild`, PRD-014 K-01), so a failing test stops the deploy; keep the host's Build Command at `npm run build` (the Vercel default; a `next build` override skips the tests) and its Node at 22.15+. 113 tests (2026-11-12; the proxy, store status, consent, attribution and ads suites are the kit's own tests since 2026-11-11) over the SEO helpers, the listing sort, the catalog listing query (UX-01), saved-address checkout (UX-02), the PRD-020 stock helpers, the PRD-015 order helpers and error reasons, the CP-22 notify-me confirmation, PRD-032 reviews, the PRD-028 payment-request view states, the PRD-041 guest checkout and order status helpers, and the signed-in checkout's kit inputs (`utils/checkout-kit.util.js`). There are no page or component tests.

## Structure

Routes: `/`, `/shop` and `/shop/[categories]` (the live site's shop with client-side filters; `/products` and `/category/[slug]` redirect there permanently), `/search`, `/blogs` and `/blogs/[slug]`, `/material-index`, `/product/[slug]`, `/lookbook` and `/lookbook/[slug]` (the store's backend lookbooks, PRD-027), `/checkout` (one page for the shopper's own bag; there is no `/checkout/<id>`) (+ `thank-you`, `payment-failed`; guest or signed in, both on the kit's `useCheckout`, PRD-041), `/orders/status/[token]` (the order status page, noindex, no referrer), `/login` (email code, or password), `/profile`, `/about`, `/contact`, and the legal pages, each an `src/app/<route>/page.jsx` (server: metadata, JSON-LD, data through `src/lib/page-data/*.server.js`) with its client view in `src/views/`. `src/proxy.js` sends shoppers without a session to `/login?next=…` for `/profile` only (checkout is open to guests since PRD-041; the page shows "Sign in to check out" when the store requires accounts). Source lives under `src/`, using the `@/*` alias. The full map is in `CLAUDE.md` §2.

## Contributing

- **Tiered PRD-first workflow.** T1 changes need an approved PRD; anything that touches the API has its source of truth in `../../zcom-backend/docs/prd/`. T2 changes need a changelog line in `docs/changelog/`.
- **Shared logic.** Fixes to shared logic (tokens, the Apollo client, checkout, stores) must be checked against the other storefronts.
- **Keep docs current.** Update this README and `CLAUDE.md` in the same change. Commit with Conventional Commits.
