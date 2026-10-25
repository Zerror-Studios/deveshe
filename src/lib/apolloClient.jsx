/**
 * Apollo Client for the Deveshe Dreams storefront (PRD-002 SF-6/7/19).
 *
 * Link chain: error (refresh once) → auth (in-memory token) → http.
 * - Tenant by host (`lib/api-config.util.js`).
 * - TOKEN_EXPIRED / UNAUTHENTICATED with a session hint → one
 *   `customerRefreshToken` from the HttpOnly cookie, then one retry.
 * - INVALID_AUTH_TOKEN / TENANT_MISMATCH, or a refused
 *   refresh → the local session is cleared (pages and middleware handle
 *   the redirect); TENANT_NOT_FOUND → one "store unavailable" notice
 *   (PRD-002 R2-C5).
 *
 * `_app.jsx` creates one browser client (`useState`); server code creates
 * one per request with `createApolloClient({ headers })`, passing the
 * server-only edge headers from `lib/edge-headers.server.js` (R2-C1).
 */
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  Observable,
} from "@apollo/client";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { toast } from "react-toastify";
import { getGraphqlUri, getTenantHeaders } from "@/lib/api-config.util";
import { CustomerSession } from "@/lib/customer-session.service";
import { TokenManager } from "@/utils/tokenManager";

// ─── Constants ────────────────────────────────────────────────────────────

const REFRESH_CODES = ["TOKEN_EXPIRED", "UNAUTHENTICATED"];
const LOGOUT_CODES = ["INVALID_AUTH_TOKEN", "TENANT_MISMATCH"];
const STORE_UNAVAILABLE_TOAST_ID = "store-unavailable";

const isBrowser = () => typeof window !== "undefined";

// ─── Auth link ────────────────────────────────────────────────────────────

/** Adds `authorization`; recovers the token from the cookie when needed. */
const authLink = new SetContextLink(async (prevContext) => {
  if (!isBrowser() || prevContext.skipAuth) return {};

  let token = TokenManager.getAccessToken();
  if (
    (!token || TokenManager.isTokenExpired()) &&
    CustomerSession.hasSessionHint()
  ) {
    try {
      token = await CustomerSession.refreshAccessToken();
    } catch (error) {
      if (error?.isSessionExpired) CustomerSession.clearLocalSession();
      token = null;
    }
  }
  if (!token) return {};

  return {
    headers: { ...prevContext.headers, authorization: `Bearer ${token}` },
  };
});

// ─── Error link ───────────────────────────────────────────────────────────

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (!isBrowser() || !CombinedGraphQLErrors.is(error)) return;

  const codes = error.errors.map((item) => item.extensions?.code);
  const context = operation.getContext();

  if (codes.includes("TENANT_NOT_FOUND")) {
    toast.error("This store is unavailable right now. Please try later.", {
      toastId: STORE_UNAVAILABLE_TOAST_ID,
    });
    return;
  }

  if (codes.some((code) => LOGOUT_CODES.includes(code))) {
    CustomerSession.clearLocalSession();
    return;
  }

  const canRefresh =
    !context.skipAuth &&
    !context.isRetry &&
    codes.some((code) => REFRESH_CODES.includes(code)) &&
    (CustomerSession.hasSessionHint() || TokenManager.getAccessToken());
  if (!canRefresh) return;

  return new Observable((observer) => {
    let subscription = null;
    CustomerSession.refreshAccessToken()
      .then(() => {
        operation.setContext({ isRetry: true });
        subscription = forward(operation).subscribe(observer);
      })
      .catch((refreshError) => {
        if (refreshError?.isSessionExpired) {
          CustomerSession.clearLocalSession();
        }
        observer.error(error);
      });
    return () => subscription?.unsubscribe();
  });
});

// ─── Client ───────────────────────────────────────────────────────────────

/** `headers`: extra request headers (server-side edge headers only). */
export function createApolloClient({ headers = {} } = {}) {
  const httpLink = new HttpLink({
    uri: getGraphqlUri(),
    credentials: "include",
    headers: { ...getTenantHeaders(), ...headers },
  });

  return new ApolloClient({
    ssrMode: !isBrowser(),
    link: ApolloLink.from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
  });
}
