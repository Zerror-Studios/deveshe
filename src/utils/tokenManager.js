/**
 * Customer access token, held in memory only (PRD-001 phase 2, SF-9).
 *
 * The refresh token lives in the HttpOnly `__Host-zc_cust_rt` cookie set by
 * the backend; JavaScript never reads or writes it. After a reload the
 * access token is recovered with `customerRefreshToken` (see
 * `lib/customer-session.service.js`).
 */
import Cookies from "js-cookie";

// ─── Constants ────────────────────────────────────────────────────────────

/** Refresh this long before the server-side expiry. */
const EXPIRY_SKEW_MS = 60 * 1000;
/** Used when the server does not send `expiresIn`. */
const DEFAULT_TTL_MS = 14 * 60 * 1000;

const LEGACY_LOCAL_KEYS = ["access_token", "token_expiry"];
const LEGACY_REFRESH_COOKIE = "refresh_token";

// ─── State ────────────────────────────────────────────────────────────────

let accessToken = null;
let expiresAtMs = 0;

// ─── API ──────────────────────────────────────────────────────────────────

export const TokenManager = {
  /** `expiresInSec` comes from `customerLogin.expiresIn` when known. */
  setAccessToken(token, expiresInSec) {
    if (typeof window === "undefined") return;
    accessToken = token || null;
    const ttlMs = expiresInSec ? expiresInSec * 1000 : DEFAULT_TTL_MS;
    expiresAtMs = token ? Date.now() + ttlMs - EXPIRY_SKEW_MS : 0;
  },

  getAccessToken() {
    if (typeof window === "undefined") return null;
    return accessToken;
  },

  isTokenExpired() {
    return !accessToken || Date.now() >= expiresAtMs;
  },

  clearTokens() {
    accessToken = null;
    expiresAtMs = 0;
  },

  /** Removes the pre-phase-2 localStorage token and JS refresh cookie. */
  clearLegacyStorage() {
    if (typeof window === "undefined") return;
    try {
      LEGACY_LOCAL_KEYS.forEach((key) => localStorage.removeItem(key));
      Cookies.remove(LEGACY_REFRESH_COOKIE);
    } catch {
      // storage can be unavailable (private mode); nothing to clean
    }
  },
};
