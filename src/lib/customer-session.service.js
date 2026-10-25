/**
 * Customer session (PRD-001 phase 2, PRD-002 SF-1/SF-6/SF-11/SF-18).
 *
 * - The access token lives in memory (`TokenManager`).
 * - The refresh token is the HttpOnly `__Host-zc_cust_rt` cookie, sent
 *   same-origin to `/v1/graphql`; `customerRefreshToken` rotates it.
 * - `useAuthStore.isLoggedIn` is only a hint that a cookie session may
 *   exist; the server decides.
 * - Login merges the guest cart into the customer cart with one
 *   `mergeGuestCart(guestId)` call (PRD-002 R2-C3: idempotent, server
 *   re-priced). On failure the guest id is kept and the shopper warned.
 * - A refresh ends the session only on an auth answer (RBUG-19): network,
 *   rate-limit and internal errors keep it.
 *
 * Keep the merge and refresh rules in sync with
 * `storefronts/rare-element/src/context/AuthContext.jsx` and
 * `storefronts/rare-element/src/utils/tokenManager.js`.
 */
import { print } from "graphql";
import {
  CUSTOMER_LOGIN,
  CUSTOMER_LOGOUT,
  CUSTOMER_REFRESH_TOKEN,
  CUSTOMER_SIGNUP,
  GET_MY_PROFILE,
  MERGE_GUEST_CART,
} from "@/graphql";
import { clearVisitorId, readVisitorId } from "@/hooks/useVisitor";
import { getGraphqlUri, getTenantHeaders } from "@/lib/api-config.util";
import { useAuthStore } from "@/store/auth-store";
import { isInvalidGuestIdError } from "@/utils/api-error.util";
import { TokenManager } from "@/utils/tokenManager";

// ─── Constants ────────────────────────────────────────────────────────────

// Refresh answers that end the session (codes from the auth service and the
// gateway tenant check, R2-C5). Anything else is treated as transient.
const SESSION_ENDING_CODES = [
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "TOKEN_EXPIRED",
  "INVALID_AUTH_TOKEN",
  "TENANT_MISMATCH",
];

/** Context flag: send the operation without the customer token. */
export const ANONYMOUS_CONTEXT = { skipAuth: true };

// ─── State ────────────────────────────────────────────────────────────────

let refreshPromise = null;

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Error thrown when the server rejected the refresh (not a network error). */
class SessionExpiredError extends Error {
  constructor(message) {
    super(message || "Session expired");
    this.name = "SessionExpiredError";
    this.isSessionExpired = true;
  }
}

// ─── Service ──────────────────────────────────────────────────────────────

export class CustomerSession {
  /** True when the browser may hold a customer cookie session. */
  static hasSessionHint() {
    return Boolean(useAuthStore.getState().isLoggedIn);
  }

  /**
   * Single-flight `customerRefreshToken` from the HttpOnly cookie.
   * Rejects with `isSessionExpired` when the server refuses the session.
   */
  static async refreshAccessToken() {
    if (!refreshPromise) {
      refreshPromise = CustomerSession.requestRefresh().finally(() => {
        refreshPromise = null;
      });
    }
    return await refreshPromise;
  }

  static async requestRefresh() {
    const response = await fetch(getGraphqlUri(), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...getTenantHeaders() },
      body: JSON.stringify({ query: print(CUSTOMER_REFRESH_TOKEN) }),
    });

    let result = null;
    try {
      result = await response.json();
    } catch {
      result = null;
    }

    const accessToken = result?.data?.customerRefreshToken?.accessToken;
    if (accessToken) {
      TokenManager.setAccessToken(accessToken);
      return accessToken;
    }
    const codes = (result?.errors || []).map(
      (error) => error?.extensions?.code,
    );
    const isAuthAnswer =
      codes.some((code) => SESSION_ENDING_CODES.includes(code)) ||
      (response.status === 401 && !codes.length);
    if (isAuthAnswer) {
      throw new SessionExpiredError(result?.errors?.[0]?.message);
    }
    throw new Error(`Refresh failed with status ${response.status}`);
  }

  /** Drops the local session (token, persisted profile hint). */
  static clearLocalSession() {
    TokenManager.clearTokens();
    useAuthStore.getState().clearAuth();
  }

  /**
   * Moves the guest cart into the customer cart (one idempotent call).
   * Returns how many merges failed (0 or 1); the guest id is kept on
   * failure so a later login can retry, and dropped when it's invalid.
   */
  static async mergeGuestCart(client) {
    const guestId = readVisitorId();
    if (!guestId) return 0;
    try {
      await client.mutate({
        mutation: MERGE_GUEST_CART,
        variables: { guestId },
      });
      clearVisitorId();
      return 0;
    } catch (error) {
      if (isInvalidGuestIdError(error)) {
        clearVisitorId();
        return 0;
      }
      return 1;
    }
  }

  /**
   * `customerLogin` → in-memory token → profile → guest cart merge.
   * Resolves `{ profile, failedMergeCount }`.
   */
  static async login(client, { email, password }) {
    const { data } = await client.mutate({
      mutation: CUSTOMER_LOGIN,
      variables: { input: { email, password } },
      context: ANONYMOUS_CONTEXT,
    });
    const { accessToken, expiresIn } = data?.customerLogin || {};
    if (!accessToken) throw new Error("Login failed");

    TokenManager.setAccessToken(accessToken, expiresIn);
    await client.clearStore();

    const { data: profileData } = await client.query({
      query: GET_MY_PROFILE,
      fetchPolicy: "network-only",
    });
    const profile = profileData?.getMyProfile || null;
    const { setUser, setIsLoggedIn } = useAuthStore.getState();
    setUser(profile);
    setIsLoggedIn(true);

    const failedMergeCount = await CustomerSession.mergeGuestCart(client);
    return { profile, failedMergeCount };
  }

  /** `customerSignup` (CONFLICT on a duplicate email), then login. */
  static async signup(client, input) {
    await client.mutate({
      mutation: CUSTOMER_SIGNUP,
      variables: { input },
      context: ANONYMOUS_CONTEXT,
    });
    return await CustomerSession.login(client, {
      email: input.email,
      password: input.password,
    });
  }

  /** Revokes the cookie session, then clears the local state and cache. */
  static async logout(client) {
    try {
      await client.mutate({
        mutation: CUSTOMER_LOGOUT,
        context: ANONYMOUS_CONTEXT,
      });
    } catch {
      // the local session is cleared regardless
    }
    CustomerSession.clearLocalSession();
    await client.clearStore();
  }
}
