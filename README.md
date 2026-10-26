# deveshe-dreams — Deveshe Dreams storefront

This is a custom-designed shopper storefront on the **ZCommerce** platform by Zerror Studios. It's built with Next.js 15 with the Pages Router (React 18) in JavaScript, and it consumes the shared ZCommerce GraphQL gateway (`../../zcom-backend`). Payments go through Nimbbl.

> Working here with Claude Code or as a new engineer? Read [`CLAUDE.md`](CLAUDE.md), then [`docs/README.md`](docs/README.md). The API contract every storefront follows is in `../../zcom-backend/docs/architecture/storefront-api-contract.md`.

**Integration status: current.** Since PRD-002 (2026-10-14, rounds 1 to 3) every operation validates against the backend schema (29/29 then; 36/36 operations with variable shapes after the PRD-014 close-out; 41/41 with the PRD-020 stock signal and the PRD-015 order page `/profile/orders/[id]`; 42/42 with `confirmBackInStock`, CP-22, 2026-10-26), including the newsletter `/unsubscribe` page and the guest back-in-stock confirmation page `/back-in-stock/confirm`. The site calls the API same-origin at `/v1/graphql` (proxied to the gateway by `src/middleware.js`, which adds the edge headers: client IP, tenant domain and the optional edge secret), picks the tenant by its domain, uses server-issued guest cart ids, keeps the access token in memory and uses the HttpOnly customer cookie for refresh. Checkout requires login. Not yet tested end to end against a running backend or the Nimbbl sandbox.

## Getting started

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
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GTM_ID`: analytics IDs. No defaults since PRD-014 FR-1.9: **set the production IDs in hosting** (an unset id loads no tag); tags load only after cookie consent.

Every `NEXT_PUBLIC_*` value is public in the browser bundle. The old `NEXT_PUBLIC_DB_TOKEN`, `NEXT_PUBLIC_BACKEND_ENDPOINT`, `NEXT_PUBLIC_NIMBBL_BASE_URL` and `NEXT_PUBLIC_GRAPHQL_API_URL` are no longer read.

**Deploying** (owner):
- set the two required variables in Vercel, make sure the domain is an ACTIVE tenant in the backend's `db_configs`, and add the storefront origin to the gateway's `CORS_ORIGINS`;
- set `EDGE_SHARED_SECRET` in Vercel **at the same moment** as on Elastic Beanstalk and the CloudFront origin header (that turns on the gateway's strict mode), in the **same deploy** as backend PRD-002 round 3 (its 30/min per-IP login bucket would otherwise see every shopper as this host's IP), and confirm the host's client IP source (`x-vercel-forwarded-for` on Vercel, else the right-most `x-forwarded-for` hop);
- roll the CSP out with `CSP_REPORT_ONLY=true` first;
- `git rm --cached .npmrc` and rotate the GSAP token (still tracked, SF-2);
- run a browser and Nimbbl sandbox checkout before go-live.

Shopper-visible effects: existing shoppers log in once (the old JS refresh cookie is removed) and old guest bags are dropped once (guest ids are now server-issued); login without `?next=` lands on `/`; checkout is locked while an unpaid order exists, and a coupon change creates a new order; the thank-you page never shows success before payment is confirmed; a missing store shows a "store unavailable" notice.

Installing needs GreenSock business registry access (`.npmrc`). Ask the team for credentials; never commit or print the token.

## Scripts

| Task | Command |
|---|---|
| Dev | `npm run dev` |
| Build | `npm run build` |
| Start (after build) | `npm run start` |
| Contract check | `npm run validate:ops` (operations and `variables` shapes against the composed supergraph; needs `../../zcom-backend` installed and built; PRD-014 FR-1.6) |
| Lint | `npm run lint` (currently not functional; see `CLAUDE.md` §4) |

Tests: `npm test` runs `test/*.test.mjs` with `node:test` (Node ≥ 22.15, no extra dependency) and **runs before every `npm run build`** (`prebuild`, PRD-014 K-01), so a failing test stops the deploy; keep the host's Build Command at `npm run build` (the Vercel default; a `next build` override skips the tests) and its Node at 22.15+. 59 tests: 10 over the `/v1/graphql` proxy in `src/middleware.js` (`test/middleware.test.mjs`, PRD-014 QA-12), 4 over the consent gate on order attribution (`test/attribution-consent.test.mjs`, W1V-C-03), 4 over the SEO helpers (`test/seo-helpers.test.mjs`, PRD-014 Wave 2), 4 over the listing sort values (`test/listing-sort.test.mjs`), 4 over the catalog listing query (`test/catalog-listing.test.mjs`, UX-01 regression: no hard-coded category id) 7 over saved-address checkout (`test/checkout-address.test.mjs`, UX-02 regression: preselect and validation), 14 over the PRD-020 stock-signal helpers and `isVariantUnavailable` (`test/stock-signal.test.mjs`) and 12 over the PRD-015 order helpers and error reasons (`test/order-detail.test.mjs`, also PRD-016 `STORE_ORDERS_PAUSED`). There are no page or component tests.

## Structure

Routes: `/`, `/products` and `/category/[slug]` (catalog listing with Load more, PRD-014), `/product/[slug]`, `/lookbook` ("Coming soon" until a lookbook backend exists), `/lookbook/[slug]`, `/checkout/[id]` (+ `thank-you`, `payment-failed`), `/login`, `/profile`, `/about`, `/contact`, and the legal pages. `src/middleware.js` sends shoppers without a session to `/login?next=…` for `/profile` and checkout. Source lives under `src/`, using the `@/*` alias. The full map is in `CLAUDE.md` §2.

## Contributing

- **Tiered PRD-first workflow.** T1 changes need an approved PRD; anything that touches the API has its source of truth in `../../zcom-backend/docs/prd/`. T2 changes need a changelog line in `docs/changelog/`.
- **Shared logic.** Fixes to shared logic (tokens, the Apollo client, checkout, stores) must be checked against the other storefronts.
- **Keep docs current.** Update this README and `CLAUDE.md` in the same change. Commit with Conventional Commits.
