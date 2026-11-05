/**
 * Ad click ids and the consent snapshot for checkout (PRD-034 FR-1.4)
 *
 * On landing, `gclid`, `gbraid`, `wbraid`, `fbclid` and `ctwa_clid` are
 * read from the URL and kept for the session (`sessionStorage`). They are
 * persisted (`localStorage`, 90 days) only once "marketing" consent is
 * granted, and the persisted copy is dropped when it is withdrawn. Meta's
 * `_fbp` / `_fbc` cookies are read at checkout.
 *
 * `createCheckoutSessionFromCart` gets:
 * - `attribution`: the PRD-012 GA ids and UTMs (analytics consent,
 *   `utils/ga-attribution.util.js`, unchanged) plus the click ids and Meta
 *   cookies, **only with marketing consent** (D8);
 * - `consent`: always `{ analytics, marketing }` (false before an answer).
 *   The backend keeps the click ids, IP and user agent for server events
 *   only when `consent.marketing` is true.
 * Nothing here is trusted for money; values are clipped to 200 characters.
 */

import { CONSENT_CHANGE_EVENT, readConsent } from "./consent.util";
import { getOrderAttribution } from "./ga-attribution.util";

// ─── Constants ────────────────────────────────────────────────────────────

const SESSION_KEY = "zc_ad_clicks";
const STORAGE_KEY = "zc_ad_clicks";
export const AD_CLICK_TTL_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_LENGTH = 200;

/** URL parameter → `OrderAttributionInput` field. */
export const AD_CLICK_PARAMS = Object.freeze({
  gclid: "gclid",
  gbraid: "gbraid",
  wbraid: "wbraid",
  fbclid: "fbclid",
  ctwa_clid: "ctwaClid",
});
const AD_CLICK_FIELDS = Object.values(AD_CLICK_PARAMS);
// Meta's browser cookies → attribution fields.
const META_COOKIES = Object.freeze({ _fbp: "fbp", _fbc: "fbc" });

// ─── Helpers ──────────────────────────────────────────────────────────────

// Strips control characters, as the backend does, then clips.
const clip = (value) =>
  typeof value === "string"
    ? value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, MAX_LENGTH)
    : "";

const hasMarketingConsent = () => readConsent()?.marketing === true;

/** Only the known click-id fields with non-empty strings. */
const pickClickIds = (source) => {
  const clicks = {};
  for (const field of AD_CLICK_FIELDS) {
    const value = clip(source?.[field]);
    if (value) clicks[field] = value;
  }
  return clicks;
};

const readJson = (storage, key) => {
  try {
    return JSON.parse(storage.getItem(key) || "null");
  } catch {
    return null;
  }
};

const writeJson = (storage, key, value) => {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: the ids live for this page only.
  }
};

const removeKey = (storage, key) => {
  try {
    storage.removeItem(key);
  } catch {
    // Storage unavailable: nothing was stored.
  }
};

/** The persisted click ids, or {} when missing or expired (then dropped). */
function readPersisted(now = Date.now()) {
  const stored = readJson(localStorage, STORAGE_KEY);
  if (!stored) return {};
  if (!(Number(stored.expiresAt) > now)) {
    removeKey(localStorage, STORAGE_KEY);
    return {};
  }
  return pickClickIds(stored.clicks);
}

function readCookies() {
  if (typeof document === "undefined") return {};
  const cookies = {};
  for (const pair of String(document.cookie || "").split(";")) {
    const index = pair.indexOf("=");
    if (index === -1) continue;
    cookies[pair.slice(0, index).trim()] = pair.slice(index + 1).trim();
  }
  return cookies;
}

// ─── Capture ──────────────────────────────────────────────────────────────

/** The click ids in a query string (`?gclid=…&fbclid=…`). */
export function parseAdClickIds(search) {
  const params = new URLSearchParams(search || "");
  const clicks = {};
  for (const [param, field] of Object.entries(AD_CLICK_PARAMS)) {
    const value = clip(params.get(param));
    if (value) clicks[field] = value;
  }
  return clicks;
}

/**
 * Keeps the landing URL's click ids for the session (a new id replaces
 * the old one), then persists them with marketing consent or drops the
 * persisted copy without it.
 */
export function captureAdClickIds(now = Date.now()) {
  if (typeof window === "undefined") return;
  const landed = parseAdClickIds(window.location?.search);
  const session = {
    ...pickClickIds(readJson(sessionStorage, SESSION_KEY)),
    ...landed,
  };
  if (Object.keys(landed).length) writeJson(sessionStorage, SESSION_KEY, session);

  if (!hasMarketingConsent()) {
    removeKey(localStorage, STORAGE_KEY);
    return;
  }
  const clicks = { ...readPersisted(now), ...session };
  if (!Object.keys(clicks).length) return;
  writeJson(localStorage, STORAGE_KEY, {
    clicks,
    expiresAt: now + AD_CLICK_TTL_DAYS * DAY_MS,
  });
}

/**
 * Call once on app mount: captures now and again when the shopper answers
 * the banner. Returns the cleanup for the listener.
 */
export function startAdClickCapture() {
  if (typeof window === "undefined") return () => {};
  const capture = () => captureAdClickIds();
  capture();
  window.addEventListener(CONSENT_CHANGE_EVENT, capture);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, capture);
}

// ─── Checkout ─────────────────────────────────────────────────────────────

/** Click ids and Meta cookies, or null (always null without marketing). */
export function getAdAttribution(now = Date.now()) {
  if (typeof window === "undefined" || !hasMarketingConsent()) return null;
  const attribution = {
    ...readPersisted(now),
    ...pickClickIds(readJson(sessionStorage, SESSION_KEY)),
  };
  const cookies = readCookies();
  for (const [cookie, field] of Object.entries(META_COOKIES)) {
    const value = clip(cookies[cookie]);
    if (value) attribution[field] = value;
  }
  return Object.keys(attribution).length ? attribution : null;
}

/** The consent snapshot checkout sends: `{ analytics, marketing }`. */
export function getCheckoutConsent() {
  const consent = readConsent();
  return {
    analytics: consent?.analytics === true,
    marketing: consent?.marketing === true,
  };
}

/** `attribution` for `createCheckoutSessionFromCart`, or null. */
export function getCheckoutAttribution() {
  const attribution = {
    ...(getOrderAttribution() || {}),
    ...(getAdAttribution() || {}),
  };
  return Object.keys(attribution).length ? attribution : null;
}
