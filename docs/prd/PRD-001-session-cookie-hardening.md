# PRD-001 — Session & refresh-cookie hardening (pointer: deveshe-dreams)

| Field | Value |
|---|---|
| Status | **Approved** 2026-10-13 (mirrors the source of truth) |
| Source-of-truth PRD | `../../zcom-backend/docs/prd/PRD-001-session-cookie-hardening.md` |
| Phase | **Phase 2** (after backend R1 and the dashboard rollout) |
| Created / Updated | 2026-10-13 / 2026-10-14 |
| Delivery | **Code complete 2026-10-14** under PRD-002 WS-F2 (Q3 settled by PRD-002 D3: this storefront is on this backend). Not deployed |

All requirements live in the source-of-truth PRD. This file only lists **this storefront's** share. Don't implement anything until the source PRD is **Approved**.

## This repo's requirements

| FR | Work in deveshe-dreams |
|---|---|
| FR-1.4 | Serve `/v1/graphql` from the storefront's own domain (Next.js `rewrites` or the host proxy) and point `lib/apolloClient.jsx`. **Only if Q3 confirms this storefront is on this backend** at it. Overwrite `X-Forwarded-Host` with the storefront host; drop any client `x-tenant-domain` (FR-1.5) |
| FR-2.3 | Use `customerRefreshToken` (cookie-based) instead of `refreshToken` |
| FR-2.5 | Remove the JS `refresh_token` cookie from `src/utils/tokenManager.js` (`setTokens`, `getRefreshToken`, `clearTokens`). The refresh token lives only in the server's HttpOnly customer cookie |
| FR-3.4 | Refresh only on `TOKEN_EXPIRED`, not on `UNAUTHENTICATED` or message strings |
| FR-6.2 | Logout calls `customerLogout` |

**Shared-logic rule:** apply the same change to the other storefront in the same effort (see `storefronts/CLAUDE.md` §2).

## Verification
Run source PRD §9 cases T1, T3 and T5 (customer variants) in Chrome, Safari and Firefox, and record them in the PR.

## Implementation log

### 2026-10-14: code complete (PRD-002 WS-F2; not deployed, not browser-tested)
- **FR-1.4:** `/v1/graphql` is proxied to `${API_GATEWAY_URL}/v1/graphql` (first a `next.config.mjs` rewrite; since PRD-002 round 2 R2-C1, `src/middleware.js`, which also adds the edge headers); the browser calls it same-origin; SSR sends `x-tenant-domain` / `x-forwarded-host` = `NEXT_PUBLIC_TENANT_DOMAIN` (`lib/api-config.util.js`).
- **FR-2.3:** `customerRefreshToken` with `credentials: "include"`, single-flight (`lib/customer-session.service.js`).
- **FR-2.5:** `utils/tokenManager.js` holds only the access token, in memory. The legacy JS `refresh_token` cookie and old localStorage tokens are deleted once on startup, so existing shoppers log in again once.
- **FR-3.4:** the error link refreshes once on `TOKEN_EXPIRED` / `UNAUTHENTICATED` (with a session hint) and retries once; `INVALID_AUTH_TOKEN` / `TENANT_MISMATCH` clear the session.
- **FR-6.2:** logout calls `customerLogout`, then clears the token, stored profile and Apollo store.
- **Still to do:** source PRD §9 cases T1, T3 and T5 after deployment.
