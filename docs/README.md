# deveshe-dreams — docs index

This is the index of every document in this repo. **Keep it current:** any doc you add, rename or retire must be reflected here in the same change. Workflow rules are in `../CLAUDE.md` §0.

| Folder | Holds | Naming |
|---|---|---|
| `prd/` | Product requirement docs; T1 work needs one with Status *Approved* | `PRD-NNN-<slug>.md`, from `_TEMPLATE.md` |
| `architecture/` | Living analyses, contracts and diagrams of how the code works today | `<topic>.md` |
| `adr/` | Architecture decision records, immutable once Accepted (supersede, don't edit) | `ADR-NNN-<slug>.md`, from `_TEMPLATE.md` |
| `reviews/` | Code and design reviews | `YYYY-MM-DD-<slug>.md` |
| `audits/` | Security, performance and accessibility audits, with each finding's status (open, fixed or won't fix) | `YYYY-MM-DD-<slug>.md` |
| `changelog/` | One line per change (T1 and T2) | `YYYY-MM.md` |

## PRDs

| ID | Title | Status | Repos |
|---|---|---|---|
| [PRD-001](prd/PRD-001-session-cookie-hardening.md) | Session & refresh-cookie hardening, phase 2 (pointer → backend) | Approved; code complete 2026-10-14 (PRD-002 WS-F2) | deveshe-dreams |
| [PRD-002](prd/PRD-002-audit-remediation.md) | Platform audit remediation (pointer → backend); this repo's work is WS-F2, R2-W6 and R3-C | Approved; WS-F2, R2-W6 and R3-C done 2026-10-14; integration check passed | deveshe-dreams |
| [PRD-003](prd/PRD-003-legacy-data-migration.md) | Legacy data migration (pointer → backend `zcom-backend/docs/prd/PRD-003-legacy-data-migration.md`); this repo's share is the FR-0.5 password-reset UX and the cutover config | In progress; FR-0.5 pages code complete 2026-10-15 | deveshe-dreams |
| [PRD-011](prd/PRD-011-payment-provider-apps.md) | Razorpay, Cashfree and PayU payment apps (pointer → backend `zcom-backend/docs/prd/PRD-011-payment-provider-apps.md`); this repo: one payment step for SDK / redirect / form-post checkouts, `/api/payments/return`, CSP hosts | Implemented 2026-10-21 (not browser-tested) |
| [PRD-012](prd/PRD-012-analytics-app-ga4-sync.md) | Analytics as an app (pointer → backend); this repo: visit attribution (GA cookie ids, UTMs) sent with checkout | Implemented 2026-10-22 |
| [PRD-014](prd/PRD-014-production-readiness-remediation.md) | Production-readiness remediation (pointer → backend `zcom-backend/docs/prd/PRD-014-production-readiness-remediation.md`); this repo's Wave 0 (W0-G): `/products` + `/category/[slug]`, saved-address preselect, server checkout pricing, payment retry, "Unavailable" variants, approved reviews only, `next` 15.5.28 | In progress; Wave 0 and Wave 1 (consent banner, no PII in localStorage, a11y, ₹0 orders, middleware tests) code complete 2026-10-25; Wave 2 (search, newsletter with an unticked opt-in, PDP reviews, SEO) 2026-10-26, plus the listing sort in the fix round; verified, Wave 2 exit PASS WITH NOTES (not committed, not browser-tested) | deveshe-dreams |
| [PRD-013](prd/PRD-013-behaviour-analytics-depth.md) | Behaviour and product analytics depth (pointer → backend `zcom-backend/docs/prd/PRD-013-behaviour-analytics-depth.md`); this repo: the GA4 event layer `utils/analytics-events.util.js` (`select_item`, `select_variant`, `cta_click`, `gallery_interaction`, `size_guide_open`, `notify_me`, `coupon_apply`/`coupon_failed`, `add_shipping_info`, `add_payment_info`, `checkout_error`) | Implemented 2026-10-23 (not browser-tested) |
| [PRD-015](prd/PRD-015-post-purchase.md) | Post-purchase (pointer → backend `zcom-backend/docs/prd/PRD-015-post-purchase.md`); this repo's FR-20: new `/profile/orders/[id]` with `displayStatus`, tracking card from `shipment` (replaces the hard-coded Shiprocket link), Cancel when `canCancel`, return request form and return status list | **Approved** 2026-10-26 · not started | deveshe-dreams |
| [PRD-016](prd/PRD-016-subscription-proration-entitlements.md) | Subscription proration, entitlements and dunning (pointer → backend `zcom-backend/docs/prd/PRD-016-subscription-proration-entitlements.md`); this repo's FR-25 only: `STORE_ORDERS_PAUSED` at checkout shows "This store isn't taking orders right now" | **Approved** 2026-10-26 · not started | deveshe-dreams |
| [PRD-018](prd/PRD-018-tenant-data-lifecycle.md) | Tenant data lifecycle (pointer → backend `zcom-backend/docs/prd/PRD-018-tenant-data-lifecycle.md`); this repo: store-unavailable page (503) for `TENANT_SUSPENDED`, account data requests (export, deletion with a 7-day cancel window), `/.well-known/zcom-store` for the go-live check | **Approved** 2026-10-26 (D1–D19; account data requests gated on the lawyer); **In progress**: FR-1.6 and FR-4.3 implemented 2026-10-26 (FR-4.3 answers the nonce challenge since CP-18), FR-3.6 gated; not deployed | deveshe-dreams |
| [PRD-019](prd/PRD-019-gst-invoicing.md) | GST invoicing (pointer → backend `zcom-backend/docs/prd/PRD-019-gst-invoicing.md`); this repo: order Documents with PDF download, optional checkout GSTIN, conditional "(Incl. of all taxes)" | Approved 2026-10-26 (owner: 'please review and approve the six drafted follow-up PRDs'); not started; tax content gated on the owner's CA | deveshe-dreams |
| [PRD-020](prd/PRD-020-public-stock-signal.md) | Public stock signal (pointer → backend `zcom-backend/docs/prd/PRD-020-public-stock-signal.md`); this repo: PDP, listing and cart stock states, fresh read, schema.org availability on the existing offers helper | Approved 2026-10-26 (owner: 'please review and approve the six drafted follow-up PRDs'); **Implemented** 2026-10-26 (FR-13, FR-14; guest notify-me email confirmation `/back-in-stock/confirm` since CP-22); not browser-tested | deveshe-dreams |
| [PRD-028](prd/PRD-028-offline-orders-payment-requests.md) | Offline orders, payment requests and offline payments (pointer → backend `zcom-backend/docs/prd/PRD-028-offline-orders-payment-requests.md`); this repo's FR-10: the `/pay/<token>` payment page | **Implemented** 2026-11-02 (not browser-tested) | deveshe-dreams |
| [PRD-032](prd/PRD-032-customer-reviews.md) | Customer reviews (pointer → backend `zcom-backend/docs/prd/PRD-032-customer-reviews.md`): PDP summary, filters, photos, report and the review form; `/review` link page and `/review/unsubscribe`; account reviews; pinned home reviews; rating JSON-LD | **Implemented** 2026-11-04 (not browser-tested) | deveshe-dreams |
| [KIT-PRD-002](prd/KIT-PRD-002-storefronts-onto-the-kit.md) | Move Deveshe Dreams and Nahara onto `@zcom/storefront-kit` (pointer → the kit's `docs/prd/PRD-002-storefronts-onto-the-kit.md`); this repo: step 4, the App Router on Next 16 with the shared package versions, then step 5, the kit | **Approved** 2026-11-10; steps 4 (App Router) and 5 (onto the kit v1.0.2) implemented 2026-11-11 (not browser-tested) | deveshe-dreams |
| [PRD-034](prd/PRD-034-meta-and-google-ads.md) | Meta and Google ads (pointer → backend `zcom-backend/docs/prd/PRD-034-meta-and-google-ads.md`): tag ids from `storefrontTrackingConfig` (GA env fallback), the new Meta Pixel and the Google Ads tag behind marketing consent, purchase dedupe on the order id, enhanced conversions, click ids and the consent snapshot at checkout, `/checkout/start` | **Phase 1 implemented** 2026-11-05 (not browser-tested) | deveshe-dreams |

## Architecture

| Doc | Purpose | Last verified |
|---|---|---|
| [solution-architecture.md](architecture/solution-architecture.md) | **Start here.** Storefront design: App Router (server pages and loaders, client views), the `proxy.js` API proxy (edge headers) and guard, same-origin data access, cookie session model, checkout flow, presentation, gaps (Mermaid). Parent: `../../ARCHITECTURE.md` (workspace) | 2026-11-11 |
| Storefront API contract | Lives in `../../zcom-backend/docs/architecture/storefront-api-contract.md` | 2026-10-14 |

## ADRs

| ID | Decision | Status |
|---|---|---|
| [ADR-001](adr/ADR-001-app-router.md) | Move the storefront to the Next.js App Router (Next 16), on its own plumbing, before the kit | Accepted 2026-11-11 |

## Reviews and audits

| Date | Doc | Scope | Open findings |
|---|---|---|---|
| 2026-10-14 | [2026-10-14-storefront-audit.md](audits/2026-10-14-storefront-audit.md) | Storefront: contract drift, leaked token, refresh link, SSRF; remediation status and round 2 (re-audit) statuses at the end | SF-2 open; SF-9, SF-21, RMAINT-7 partial; verification re-audit done; round 3 (R3-C) fixed VBUG-4/6, VSEC-3/4, VCON-1/2 |
