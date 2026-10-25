# deveshe-dreams storefront audit (2026-10-14)

| | |
|---|---|
| **Scope** | Next.js 15 Pages Router storefront (legacy integration) |
| **Method** | Read-only code audit plus the machine-checked GraphQL contract. **[C]** confirmed in code, **[I]** inferred |
| **Cross-repo summary** | `../../zcom-backend/docs/audits/2026-10-14-platform-audit.md` (top 15, remediation plan) |
| **Status** | **Remediated by PRD-002 WS-F2 (2026-10-14)**; the re-audit's new findings fixed in round 2 (R2-W6); round 3 (R3-C) fixed the verification findings (see "Round 3"). SF-2, SF-9 and SF-21 partial; see "Remediation status" and "Round 2" |

## Findings

| ID | Sev | Finding | Evidence | Fix |
|---|---|---|---|---|
| SF-1 | Critical | **23 of 25 operations fail schema validation**, including **login** (`userLogin` query → `customerLogin` mutation), signup (`clientUserSave`), cart (`CreateCartInput` nullability, removed CartItem fields), catalog and checkout | `src/graphql/**`; contract report in the platform audit §5 | Migrate (PRD-001 phase 2, pending Q3) |
| SF-2 | High | GreenSock registry token in `.npmrc`, tracked since the first commit (`6163403`) and pushed to `origin/main`, `dev` and `ayush`; `.gitignore` has `/npmrc` without the dot | `git ls-files .npmrc` | Rotate; `git rm --cached .npmrc`; ignore it; purge history |
| SF-3 | High | Can show another shopper's cart (backend `{}` filter), reachable because the refresh link is dead (SF-6) | `components/cart/CartDrawer.jsx`; backend `cart.service.ts:17-21` | Backend owner check; working refresh |
| SF-6 | High | The Apollo 4 error link uses the Apollo 3 signature (`graphQLErrors`); `from(...)` isn't `fromPromise`; branches on message strings, so token refresh never runs and sessions die after ~14 min | `lib/apolloClient.jsx:76,88` | Rewrite with `CombinedGraphQLErrors.is` + Observable retry on `extensions.code` |
| SF-7 | High | Tenant `dbtoken` shipped in the browser bundle and sent to REST | `lib/apolloClient.jsx:141`; `pages/checkout/[id]/index.jsx:99` | Host-based tenant; rotate |
| SF-8 | High | Order history broken (admin-only backend query; `data` vs `orders`) | `components/profileNew/*`; backend `order.controller.ts:16` | Customer-scoped `myOrders` |
| SF-9 | High | Token storage plus no security headers (same as rare-element) | `utils/tokenManager.js`; `next.config.mjs` | Phase 2 + headers |
| SF-10 | Medium | `htmlParser` on unsanitised product and lookbook HTML; React 18 only warns on `javascript:` URLs | `components/product/ProductContent.jsx:121` | DOMPurify |
| SF-12 | Medium | No double-callback guard; REST `handle-order-payment` doesn't exist in the backend | `pages/checkout/[id]/index.jsx` | Contract checkout flow |
| SF-13 | Medium | Thank-you page: countdown calls `router.push` inside a state updater; the order lookup op doesn't exist | `pages/checkout/thank-you` | Rework |
| SF-15 | Medium | `images.domains` allows localhost and unrelated hosts (`emmpo.com`, `dieselfarm.com`, `ark8.net`, `avatar.iran.liara.run`), so the image optimiser can be used as an SSRF or bandwidth proxy | `next.config.mjs` | `remotePatterns` for the deveshe CDN only |
| SF-16 | Medium | Route protection is client-only (`withAuth`); `proxy.jsx` is inert | `src/proxy.jsx`; `lib/withAuth.jsx` | Real middleware |
| SF-17 | Medium | three/R3F static in `contact → PhoneModal`; `lenis.resize()` every 150 ms forever; product page returns 200 for unknown slugs (soft 404) | `components/common/SmoothScroller.jsx:28`; `pages/product/[slug]` | Dynamic import; event-driven resize; `notFound` |
| SF-18 | Medium | Guest cart lost at login; Apollo cache not reset; `router.back()` can leave the site | `components/login/Login.jsx:39` | Merge; `clearStore`; explicit redirect |
| SF-19 | Medium | `createApolloClient()` on every `_app` render, so the cache is lost and queries refetch | `pages/_app.jsx:34` | `useState(() => createApolloClient())` |
| SF-20 | Low | Listener and ScrollTrigger leaks; Navbar unmount calls `ScrollTrigger.killAll()` | `ContactForm.jsx`; `OurProcess.jsx`; `Navbar` | Scoped cleanup |
| SF-21 | Low | Duplicated logic with rare-element; `components/profile/**` unreachable (only MUI user, plus the `backend.mamoshfashion.com` fetch); styled-components and emotion unused. **Correction:** three **is** used (`PhoneModal`) | — | Remove dead code; update docs |
| SF-22 | Low | Hard-coded GA and GTM IDs | `pages/_document.jsx` | Env-driven |

## Remediation status (PRD-002 WS-F2, 2026-10-14)

Source: `zcom-backend/docs/prd/PRD-002-audit-remediation.md` §8 (WS-F2). To be confirmed by the re-audit; nothing has run end to end against a backend or the Nimbbl sandbox.

| ID | Status | How |
|---|---|---|
| SF-1 | Fixed | Every gql document rewritten; validator **29/29 valid** after round 3 (28/28 after round 2, 26/26 after WS-F2); `customerLogin`, `customerSignup` then login; errors mapped from `extensions.reason`/`code` |
| SF-2 | Partial | `.gitignore` covers `.npmrc` and `.env`; **`.npmrc` is still tracked** (owner: `git rm --cached .npmrc`, rotate the token, decide on a history purge) |
| SF-3 | Fixed (client) | No client `token`/`userId` on cart calls; the backend enforces the owner |
| SF-6, SF-19 | Fixed | Rewritten `lib/apolloClient.jsx` (Apollo 4 `ErrorLink`, refresh once); one client per app |
| SF-7 | Fixed | Host-based tenant (`lib/api-config.util.js`), same-origin proxy (a rewrite in WS-F2, `middleware.js` since round 2); no dbtoken |
| SF-8 | Fixed | Order history from `myOrders` (was a hard-coded dummy array) |
| SF-9 | Partial | Access token in memory; HttpOnly cookie refresh; security headers. `script-src 'unsafe-inline'` kept: a nonce CSP would make every static page dynamic and GTM custom-HTML tags need it (commented in `next.config.mjs`); `CSP_REPORT_ONLY` added for rollout |
| SF-10 | Fixed | `utils/sanitize-html.util.js`; `toJsonLd` in all five JSON-LD components |
| SF-12 | Fixed | Final checkout flow; one callback per modal; retry reuses the order |
| SF-13 | Fixed | Thank-you polls `myOrder` until PAID; GA `purchase` once per order |
| SF-15 | Fixed | `images.remotePatterns` allowlist; CSP and security headers |
| SF-16 | Fixed | `src/middleware.js` route guard; `proxy.jsx` deleted |
| SF-17 | Fixed | Lazy 3D modal, ResizeObserver, product `notFound` |
| SF-18 | Fixed | Guest cart merged at login with one `mergeGuestCart` call (round 2); same-origin `?next=` (RSEC-6); cache reset at login and logout |
| SF-20 | Fixed | Scoped GSAP cleanup; no `killAll()` / `globalTimeline.clear()` |
| SF-21 | Partial | Legacy `components/profile/**` (with its external fetch) and `AuthCookies.jsx` deleted; MUI/emotion/styled-components removed. `react-tooltip`/`cross-fetch` removed and the lockfile pruned in round 2 (RMAINT-9). Open: duplicated logic with rare-element (ADR; files now carry "Keep in sync" headers, RMAINT-7) |
| SF-22 | Fixed | GA/GTM IDs from env; `.env.example` with names only |

**Behaviour changes:** checkout requires login; lookbook shows "Coming soon"; change password and deactivation hidden; only ARCHIVED variants show as unavailable; existing shoppers log in once after the deploy.

## Round 2: re-audit findings (PRD-002 R2-W6, 2026-10-14)

Source: `../../zcom-backend/docs/audits/2026-10-14-re-audit.md` §3 and PRD-002 §8 (R2-W6). Build OK, validator 28/28, no secret in `.next/static`, redirect and sanitiser smoke tests pass. No browser or Nimbbl sandbox run.

| ID | Status | How (deveshe-dreams) |
|---|---|---|
| ROPS-1 / R2-C1 | Fixed (code) | `src/middleware.js` proxies `/v1/graphql` (the `next.config.mjs` rewrite is gone) and adds the edge headers from `lib/edge-headers.server.js`: client `x-zcom-*` stripped, `x-zcom-client-ip`, `x-tenant-domain`, optional `x-zcom-edge-secret`. SSR clients send the secret. Owner sets `EDGE_SHARED_SECRET` |
| RSEC-3 | Fixed | `useVisitor` requests `issueGuestCartId` lazily; old unsigned UUIDs dropped; one retry on `INVALID_GUEST_ID` |
| RSEC-6 | Fixed | `utils/redirect.util.js` resolves `?next=` with `new URL` and keeps it only same-origin; default `/` |
| RSEC-11 | Fixed | Sanitiser adds `rel="noopener noreferrer"` to every link and drops styles containing `\` |
| RPERF-11 / RBUG-18 | Fixed | One idempotent `mergeGuestCart` at login (`lib/customer-session.service.js`) instead of 2N mutations |
| RPERF-12 | Fixed | Product cards pass real dimensions and `sizes` |
| RBUG-8 | Fixed | Pending order id in sessionStorage with a cart + coupon fingerprint (`utils/pending-order.util.js`); retry reuses it |
| RBUG-9 | Fixed | Coupon controls locked while placing or paying; a changed bag or coupon starts a new order |
| RBUG-15 | Fixed | Pay button disabled until the Nimbbl callback or close; callback handled once |
| RBUG-19 | Fixed | Refresh errors branch on `extensions.code`; transient failures keep the session |
| RBUG-20 | Fixed | Thank-you page: "confirming", then a terminal "not confirmed yet"; no success without PAID |
| RCON-3 / R2-C5 | Fixed | `INVALID_DB_TOKEN` ends the session; `TENANT_NOT_FOUND` shows one "store unavailable" toast |
| RCON-4, RCON-6 | Fixed | Reason map adds `CHECKOUT_EXPIRED`, `RESERVATION_RELEASED`, `INVALID_QTY`, `TOO_MANY_LINES`, `ORDER_CANCELLED`, `INVALID_GUEST_ID`, `TENANT_NOT_FOUND` |
| RMAINT-6 | Fixed | `next.config.mjs` enforces the required env only for production builds |
| RMAINT-7 | Partial | "Keep in sync with rare-element" headers on the shared files; a shared package is still an ADR decision |
| RMAINT-9 | Fixed | `react-tooltip`, `cross-fetch` removed; lockfile pruned of MUI/emotion/styled-components |
| SF-9 | Partial | `'unsafe-inline'` kept (see above); `CSP_REPORT_ONLY` added |
| SF-2 | Open | `.npmrc` still tracked (owner: `git rm --cached .npmrc`, rotate the token) |

**Shopper-visible changes:** old guest bags dropped once; login without `next` → `/`; checkout locked while a pending order exists; a coupon change creates a new order; the thank-you page never shows a false success; a "store unavailable" notice when the tenant isn't found.

## Round 3: verification findings (PRD-002 R3-C, 2026-10-14)

Source: `../../zcom-backend/docs/audits/2026-10-14-re-audit.md` §7. Build OK (lists `/unsubscribe`), validator 29/29, no secret in `.next/static`. No browser or Nimbbl sandbox run.

| ID | Status | How (deveshe-dreams) |
|---|---|---|
| VBUG-4 | Fixed | `utils/pending-order.util.js` adds a details fingerprint (email + shipping + billing); a change creates a new order; legacy entries are not reused |
| VBUG-6 | Fixed | `useVisitor` compares before clearing the guest id |
| VSEC-3 | Fixed | `getClientIp`: `x-vercel-forwarded-for` only on Vercel, then `request.ip`, then the right-most `x-forwarded-for` hop |
| VSEC-4 | Fixed | Client `x-tenant-domain`/`x-forwarded-host` stripped; the proxy fails closed (500) without `NEXT_PUBLIC_TENANT_DOMAIN` |
| VCON-1 | Fixed | `pages/unsubscribe/index.jsx` (`noindex`, query stripped, neutral copy) calls `unsubscribeNewsletter(email, token)` |
| VCON-2 | Fixed | `CHECKOUT_REPLACED`, `PAYMENT_NOT_CONFIGURED`, `MISSING_PROVIDER_ORDER`, `INVALID_EMAIL` mapped |
| VPERF-4, SF-9 | Accepted (R3-D7) | Edge middleware on every API call; `'unsafe-inline'` kept |
| SF-2 | Open | `.npmrc` still tracked |
