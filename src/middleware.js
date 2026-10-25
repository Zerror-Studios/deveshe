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
 */
import { NextResponse } from "next/server";
import { GRAPHQL_PATH, getTenantDomain } from "@/lib/api-config.util";
import { buildGatewayProxyHeaders } from "@/lib/edge-headers.server";

// ─── Constants ────────────────────────────────────────────────────────────

const SESSION_COOKIES = ["__Host-zc_cust_rt", "zc_cust_rt"];
const PUBLIC_CHECKOUT_PATHS = ["/checkout/payment-failed"];

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

// ─── Middleware ───────────────────────────────────────────────────────────

export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  if (pathname === GRAPHQL_PATH) return proxyGraphql(request);
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

export const config = {
  matcher: ["/v1/graphql", "/profile/:path*", "/checkout/:path*"],
};
