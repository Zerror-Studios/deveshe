/**
 * Safe post-login redirect (PRD-002 SF-18, RSEC-6): only same-origin
 * paths, never `router.back()`, which can leave the site.
 *
 * `?next=` is attacker-controlled, so a prefix check isn't enough: browsers
 * treat `/\evil.com` like `//evil.com` and strip tabs and newlines inside
 * URLs. The value is resolved with `new URL(next, origin)` and kept only
 * when it stays on the same origin; anything else falls back.
 *
 * Keep in sync with `storefronts/rare-element/src/utils/redirect.js`.
 */

// ─── Constants ────────────────────────────────────────────────────────────

const DEFAULT_PATH = "/";
const LOGIN_PATH = "/login";
const FALLBACK_ORIGIN = "http://localhost";
// Backslashes and control characters (browsers drop or rewrite them).
// eslint-disable-next-line no-control-regex
const UNSAFE_CHARS_PATTERN = /[\\\u0000-\u001f\u007f-\u009f]/;

// ─── Helpers ──────────────────────────────────────────────────────────────

const currentOrigin = () =>
  typeof window !== "undefined" ? window.location.origin : FALLBACK_ORIGIN;

/**
 * Same-origin path (`/path?query#hash`) for the `next` query value, else
 * `fallback`. `origin` defaults to the page origin in the browser.
 */
export const getSafeNextPath = (
  next,
  fallback = DEFAULT_PATH,
  origin = currentOrigin(),
) => {
  const value = Array.isArray(next) ? next[0] : next;
  if (typeof value !== "string" || !value) return fallback;
  if (UNSAFE_CHARS_PATTERN.test(value)) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;

  let url;
  let base;
  try {
    base = new URL(origin);
    url = new URL(value, base);
  } catch {
    return fallback;
  }
  if (url.origin !== base.origin) return fallback;
  if (url.pathname === LOGIN_PATH || url.pathname.startsWith(`${LOGIN_PATH}/`)) {
    return fallback;
  }
  return `${url.pathname}${url.search}${url.hash}`;
};

/** Login URL that returns to `path` afterwards. */
export const getLoginPath = (path) =>
  `/login?next=${encodeURIComponent(path || DEFAULT_PATH)}`;
