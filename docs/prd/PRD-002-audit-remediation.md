# PRD-002 — Platform audit remediation (pointer: deveshe-dreams)

| Field | Value |
|---|---|
| Status | **Approved** 2026-10-14 (mirrors the source of truth); round 1 (WS-F2), round 2 (R2-W6) and round 3 (R3-C) code complete 2026-10-14; integration check passed |
| Source-of-truth PRD | `../../zcom-backend/docs/prd/PRD-002-audit-remediation.md` |
| Workstreams here | Round 1 **WS-F2**; round 2 **R2-W6**; round 3 **R3-C** (both shared with rare-element) |
| Created / Updated | 2026-10-14 / 2026-10-14 |
| Delivery | Not deployed; no browser or Nimbbl sandbox run |
| Related | `docs/audits/2026-10-14-storefront-audit.md` (SF-* and round 2 statuses) · `../../zcom-backend/docs/audits/2026-10-14-re-audit.md` · `../../zcom-backend/docs/architecture/storefront-api-contract.md` |

All requirements, decisions and contracts live in the source-of-truth PRD (D3: migrate this storefront to the current contract; round 2 contracts R2-C1, R2-C2, R2-C3, R2-C5, R2-C7, R2-C8). This file only lists **this storefront's** share. Apply shared-logic changes to `../rare-element` in the same effort.

## This repo's work

| Ref | Work in deveshe-dreams |
|---|---|
| D3 / SF-1…22 (WS-F2) | Every gql document on the current contract; customer auth with in-memory access token and HttpOnly refresh cookie; host-based tenant; customer-only checkout; sanitiser and JSON-LD escaping; CSP and headers; route middleware; scoped GSAP cleanup |
| R2-C1 (ROPS-1) | `src/middleware.js` proxies `/v1/graphql` with the edge headers (`lib/edge-headers.server.js`, server-only): client `x-zcom-*` stripped, `x-zcom-client-ip`, `x-tenant-domain`, optional `x-zcom-edge-secret`. SSR clients send the secret. The `next.config.mjs` rewrite was removed |
| R2-C2 (RSEC-3) | `useVisitor` gets a signed guest id from `issueGuestCartId` lazily; drops old UUIDs; retries once on `INVALID_GUEST_ID` |
| R2-C3 (RPERF-11, RBUG-18) | One `mergeGuestCart(guestId)` at login |
| R2-C5 (RCON-3) | `INVALID_DB_TOKEN` ends the session; `TENANT_NOT_FOUND` → "store unavailable" toast |
| R2-C7 (RCON-4) / RCON-6 | Reason map: `CHECKOUT_EXPIRED`, `RESERVATION_RELEASED`, `INVALID_QTY`, `TOO_MANY_LINES`, `ORDER_CANCELLED`, `INVALID_GUEST_ID` |
| R2-C8 (RBUG-8) | Pending order id in sessionStorage with a cart + coupon fingerprint; retry reuses it |
| RBUG-9, RBUG-15, RBUG-19, RBUG-20 | Coupon locked while paying (a change → new order); one Nimbbl modal; refresh errors branch on `extensions.code`; thank-you "not confirmed yet" state |
| RSEC-6, RSEC-11 | Same-origin `?next=` via `new URL` (default `/`); sanitiser `rel` on every link, `\` in styles rejected |
| RPERF-12, RMAINT-6/7/9 | Card image `sizes`; env enforced only for production builds; "Keep in sync" headers; `react-tooltip`/`cross-fetch` removed, lockfile pruned |
| Round 3 (R3-C): VCON-1 | `pages/unsubscribe/index.jsx` (`noindex`): reads `?email=&token=` once, strips them (`router.replace`), calls `unsubscribeNewsletter(email, token)`; one neutral message for every server answer (the server answers uniformly) |
| Round 3: VBUG-4, VBUG-6 | Pending order also fingerprints the checkout details (email + shipping + billing); a change creates a new order, legacy entries aren't reused. `useVisitor` compares before clearing |
| Round 3: VSEC-3, VSEC-4 | Client IP from `x-vercel-forwarded-for` (only on Vercel), `request.ip`, or the right-most `x-forwarded-for` hop; client `x-tenant-domain`/`x-forwarded-host` stripped; the proxy fails closed (500) without `NEXT_PUBLIC_TENANT_DOMAIN` |
| Round 3: VCON-2 | `CHECKOUT_REPLACED`, `PAYMENT_NOT_CONFIGURED`, `MISSING_PROVIDER_ORDER`, `INVALID_EMAIL` mapped |
| SF-9 (partial) | `script-src 'unsafe-inline'` kept (nonce CSP not feasible with static/ISR pages and GTM); `CSP_REPORT_ONLY` added |

**Env (names only):** `API_GATEWAY_URL`, `NEXT_PUBLIC_TENANT_DOMAIN` (required), `EDGE_SHARED_SECRET` (server-only, optional), `CSP_REPORT_ONLY` (optional), `IMAGE_REMOTE_HOSTS`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GTM_ID`.

## Shopper-visible changes

- Existing shoppers log in once (WS-F2), and old guest bags are dropped once (round 2).
- Login without `?next=` lands on `/`.
- Checkout is locked while a pending order exists; a coupon change creates a new order.
- The thank-you page never shows a false success.
- A "store unavailable" notice when the tenant isn't found.
- Round 3: a changed email or address after closing the payment window creates a new order (the old unpaid order keeps its hold and promotion use until cancelled; RBUG-6 remainder, owner decision); newsletter emails link to `/unsubscribe`. The backend builds the link from the tenant's **configured domain**, so that domain must serve this storefront or redirect keeping the query string (FIN-3; the owner checks it per tenant).

## Owner actions

1. Vercel: `API_GATEWAY_URL`, `NEXT_PUBLIC_TENANT_DOMAIN`; the domain ACTIVE in `db_configs`; the origin in `CORS_ORIGINS`.
2. Set `EDGE_SHARED_SECRET` in Vercel **at the same moment** as on EB and the CloudFront origin header (it turns on strict mode), in the **same deploy** as backend round 3 (its 30/min per-IP login bucket, `AUTH_IP_RATE_LIMIT_PER_MIN`, would otherwise count every shopper as this host's IP), and confirm the host's client IP source.
3. Roll out the CSP with `CSP_REPORT_ONLY=true` first.
4. `git rm --cached .npmrc`, rotate the GSAP token and the old `NEXT_PUBLIC_DB_TOKEN` (SF-2).
5. Browser and Nimbbl sandbox checkout tests.

## Verification
Round 3: build OK (lists `/unsubscribe`); contract validator 29/29 (28/28 after round 2); no secret in `.next/static`; redirect smoke tests and sanitiser and edge-header smoke tests pass. Not run: browser, Nimbbl sandbox, lint (no ESLint config).

## Implementation log

### 2026-10-14: round 3 (R3-C), code complete
VCON-1 (`/unsubscribe`), VBUG-4 (details fingerprint), VBUG-6, VSEC-3 (trusted client IP), VSEC-4 (tenant headers stripped, fail closed), VCON-2 (reason map); stale comments updated. Validator 29/29; build OK; no secret in `.next/static`. Accepted (R3-D7): SF-9, VPERF-4. `getServerSideProps` calls send no `x-zcom-client-ip`. See the round 3 table in `docs/audits/2026-10-14-storefront-audit.md` and the source PRD §8.

### 2026-10-14: round 2 (R2-W6), code complete
See the round 2 table in `docs/audits/2026-10-14-storefront-audit.md` and the source PRD §8.

### 2026-10-14: round 1 (WS-F2), code complete
See the source PRD §8 (WS-F2) and the "Remediation status" table in the audit.
