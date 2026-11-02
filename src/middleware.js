/**
 * Middleware: API proxy + route guard for account pages.
 *
 * API proxy (PRD-002 R2-C1): same-origin `/v1/graphql` is rewritten to
 * `${API_GATEWAY_URL}/v1/graphql` here (a next.config rewrite can't set
 * request headers), with the edge headers from `lib/edge-headers.server.js`:
 * client `x-zcom-*`, `x-tenant-domain` and `x-forwarded-host` headers
 * stripped, then `x-zcom-client-ip`, `x-tenant-domain` and the optional
 * `x-zcom-edge-secret` added. The tenant domain comes from
 * `getTenantDomain()`: a missing NEXT_PUBLIC_TENANT_DOMAIN fails closed
 * with a 500 (VSEC-4) instead of forwarding the request without a tenant.
 *
 * Route guard (PRD-002 SF-16):
 * The HttpOnly customer refresh cookie (`__Host-zc_cust_rt`, `zc_cust_rt`
 * in dev) is only a hint that a session exists: the API still verifies the
 * token on every request, and `withAuth` / the pages handle an expired
 * session. Without the cookie the shopper is sent to /login?next=….
 *
 * Suspended store (PRD-018 FR-1.6, D6): every page request first asks
 * `lib/store-status.util.js` (one cached gateway probe per 30 s); while the
 * gateway answers `TENANT_SUSPENDED` the page is the branded 503 with
 * `Retry-After`. `/v1/graphql`, `/api/*` and static files are never held.
 *
 * Store identity (PRD-018 FR-4.3): `/.well-known/zcom-store?nonce=…`
 * answers the store slug and the caller's nonce, signed together (CP-18,
 * `lib/store-identity.server.js`).
 */
import { NextResponse } from "next/server";
import { GRAPHQL_PATH, getTenantDomain } from "@/lib/api-config.util";
import {
  buildGatewayProxyHeaders,
  getEdgeSecretHeaders,
} from "@/lib/edge-headers.server";
import {
  STORE_IDENTITY_PATH,
  storeIdentityResponse,
} from "@/lib/store-identity.server";
import {
  createStoreStatusCache,
  probeStoreStatus,
  storeStatusEnum,
  storeUnavailableResponse,
} from "@/lib/store-status.util";

// ─── Constants ────────────────────────────────────────────────────────────

const SESSION_COOKIES = ["__Host-zc_cust_rt", "zc_cust_rt"];
// PRD-028 FR-10.1: a guest paying a store's payment link (`/pay/<token>`)
// comes back from a redirect payment app through payment-return
const PUBLIC_CHECKOUT_PATHS = [
  "/checkout/payment-failed",
  "/checkout/payment-return",
];
const PROTECTED_PATH_PATTERN = /^\/(profile|checkout)(\/|$)/;
const BRAND = {
  brandName: "Deveshe Dreams",
  background: "#fadcde",
  foreground: "#000000",
};
// The contact address on the 503 page (the one the site already shows).
const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "deveshedreams@gmail.com";

// ─── API proxy ────────────────────────────────────────────────────────────

function proxyGraphql(request) {
  const gateway = (process.env.API_GATEWAY_URL || "").replace(/\/+$/, "");
  if (!gateway) {
    return NextResponse.json(
      { errors: [{ message: "API gateway is not configured" }] },
      { status: 503 },
    );
  }
  let tenantDomain;
  try {
    tenantDomain = getTenantDomain();
  } catch {
    // No NEXT_PUBLIC_TENANT_DOMAIN: never proxy untenanted.
    return NextResponse.json(
      { errors: [{ message: "The store is not available right now." }] },
      { status: 500 },
    );
  }
  const target = new URL(`${gateway}${GRAPHQL_PATH}${request.nextUrl.search}`);
  return NextResponse.rewrite(target, {
    request: { headers: buildGatewayProxyHeaders(request, tenantDomain) },
  });
}

// ─── Store status ─────────────────────────────────────────────────────────

/** The gateway probe with the edge headers; UNKNOWN when unconfigured. */
async function probeGateway() {
  const gateway = (process.env.API_GATEWAY_URL || "").replace(/\/+$/, "");
  if (!gateway) return storeStatusEnum.UNKNOWN;
  let tenantDomain;
  try {
    tenantDomain = getTenantDomain();
  } catch {
    return storeStatusEnum.UNKNOWN;
  }
  return await probeStoreStatus({
    graphqlUrl: `${gateway}${GRAPHQL_PATH}`,
    headers: {
      "x-tenant-domain": tenantDomain,
      ...getEdgeSecretHeaders(),
    },
  });
}

const getStoreStatus = createStoreStatusCache({ probe: probeGateway });

/** Page navigations only (GET/HEAD); never the API or the proxy. */
function isPageRequest(request) {
  return request.method === "GET" || request.method === "HEAD";
}

// ─── Route guard ──────────────────────────────────────────────────────────

function guardRoute(request) {
  const { pathname, search } = request.nextUrl;
  if (!PROTECTED_PATH_PATTERN.test(pathname)) return NextResponse.next();
  if (PUBLIC_CHECKOUT_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const hasSession = SESSION_COOKIES.some((name) =>
    Boolean(request.cookies.get(name)?.value),
  );
  if (hasSession) return NextResponse.next();

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;
  return NextResponse.redirect(loginUrl);
}

// ─── Middleware ───────────────────────────────────────────────────────────

async function servePage(request) {
  if (
    isPageRequest(request) &&
    (await getStoreStatus()) === storeStatusEnum.SUSPENDED
  ) {
    return storeUnavailableResponse({ ...BRAND, contactEmail: CONTACT_EMAIL });
  }
  return guardRoute(request);
}

// The proxy stays synchronous; only page requests wait for the probe.
export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (pathname === GRAPHQL_PATH) return proxyGraphql(request);
  if (pathname === STORE_IDENTITY_PATH) return storeIdentityResponse(request);
  return servePage(request);
}

export const config = {
  // Every page (no `_next/`, `api/` or file with an extension), the proxy,
  // the store identity endpoint, and the profile and checkout guards.
  matcher: [
    "/v1/graphql",
    "/.well-known/zcom-store",
    "/((?!_next/|api/|.*\\.).*)",
    "/profile/:path*",
    "/checkout/:path*",
  ],
};
