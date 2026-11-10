/**
 * API endpoint and tenant selection (PRD-002 SF-7).
 *
 * The tenant is chosen by host (the backend has no db-token, PRD-007):
 *  - browser: same-origin `/v1/graphql`, proxied to the gateway by
 *    `proxy.js` (with the R2-C1 edge headers), so the customer
 *    refresh cookie is first-party;
 *  - server (server components, route handlers): `${API_GATEWAY_URL}/v1/graphql`
 *    with `x-tenant-domain` / `x-forwarded-host` set to the brand domain.
 */

// ─── Constants ────────────────────────────────────────────────────────────

export const GRAPHQL_PATH = "/v1/graphql";

const isServer = () => typeof window === "undefined";

// ─── Helpers ──────────────────────────────────────────────────────────────

/** The brand's production domain; required (no localhost fallback). */
export const getTenantDomain = () => {
  const domain = process.env.NEXT_PUBLIC_TENANT_DOMAIN;
  if (!domain) {
    throw new Error("NEXT_PUBLIC_TENANT_DOMAIN is not set");
  }
  return domain;
};

/** GraphQL endpoint for the current runtime. */
export const getGraphqlUri = () => {
  if (!isServer()) return GRAPHQL_PATH;

  const gatewayUrl = process.env.API_GATEWAY_URL;
  if (!gatewayUrl) {
    throw new Error("API_GATEWAY_URL is not set");
  }
  return `${gatewayUrl.replace(/\/+$/, "")}${GRAPHQL_PATH}`;
};

/** Host-based tenant headers (server requests have no Origin). */
export const getTenantHeaders = () => {
  const domain = getTenantDomain();
  return isServer()
    ? { "x-tenant-domain": domain, "x-forwarded-host": domain }
    : { "x-tenant-domain": domain };
};
