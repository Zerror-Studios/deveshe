/**
 * Safe post-login redirect (PRD-002 RSEC-6) on the kit's `safeNextPath`
 * (kit PRD-002 FR-4.1): `?next=` is attacker-controlled, so it is kept only
 * when it resolves to a path on this origin, carries no control characters
 * and isn't the login page; anything else falls back to `/`.
 *
 * Keep in sync with `storefronts/rare-element/src/utils/redirect.js`.
 */

import { safeNextPath } from "@zcom/storefront-kit/core";

const DEFAULT_PATH = "/";

/** Same-origin path (`/path?query#hash`) for `next`, or `fallback`. */
export const getSafeNextPath = (next, fallback = DEFAULT_PATH, origin) => {
  const value = Array.isArray(next) ? next[0] : next;
  if (typeof value !== "string") return fallback;
  return origin
    ? safeNextPath(value, origin, fallback)
    : safeNextPath(value, undefined, fallback);
};

/** The login page that comes back to `path` after signing in. */
export const getLoginPath = (path) =>
  `/login?next=${encodeURIComponent(path || DEFAULT_PATH)}`;
