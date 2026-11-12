/**
 * Proxy (Next 16's middleware): the kit's `createZcomMiddleware` (kit
 * PRD-002 FR-4.1).
 *
 * - `/v1/graphql` → the gateway with the signed edge headers; client tenant
 *   headers and the browser's Origin/Referer stripped; fails closed without
 *   NEXT_PUBLIC_TENANT_DOMAIN (PRD-002 R2-C1, PRD-007).
 * - `/.well-known/zcom-store` → the go-live identity check (PRD-018 FR-4.3,
 *   `ZCOM_STORE_SLUG`).
 * - A suspended store answers the branded 503 on every page (PRD-018 FR-1.6).
 * - `/profile/*` needs a customer session cookie (a hint; the API
 *   verifies). Checkout is open to guests since backend PRD-041 FR-17: the
 *   page itself offers guest checkout, or "Sign in to check out" when the
 *   store's accounts are REQUIRED. `/orders/status/<token>` (the order
 *   status page) is public; the kit serves it noindex, `no-store` and
 *   `no-referrer`.
 */

import {
  buildStoreUnavailableHtml,
  createZcomMiddleware,
} from "@zcom/storefront-kit/edge";

// The contact address on the 503 page (the one the site already shows).
const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "deveshedreams@gmail.com";

const proxy = createZcomMiddleware({
  loginGuard: {
    paths: ["/profile"],
  },
  unavailableHtml: buildStoreUnavailableHtml({
    brandName: "Deveshe Dreams",
    supportEmail: SUPPORT_EMAIL,
    background: "#fadcde",
    text: "#000000",
  }),
});

export default proxy;

export const config = {
  // Every page (no `_next/`, `api/` or file with an extension), the proxy
  // and the store identity endpoint.
  matcher: [
    "/v1/graphql",
    "/.well-known/zcom-store",
    "/((?!_next/|api/|.*\\.).*)",
  ],
};
