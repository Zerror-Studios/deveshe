/**
 * Sign-up pop-up helpers (backend PRD-050 D22; kit 2.1.0 `useSignupPopup`)
 *
 * The kit decides whether the store's POPUP form may open (the merchant's
 * pages, frequency and hide rules, never on checkout, cart, account or
 * order pages); this file tells it what kind of page each DeVeSheDreams route is
 * (PRODUCT and COLLECTION targeting need it), which other routes never get
 * a pop-up, and which of the merchant's style tokens the pop-up takes.
 * Pure, so `node:test` covers it without the kit or a browser.
 *
 * Keep in sync with `storefronts/rare-element/src/utils/signup-popup.js`.
 */

// ─── Constants ────────────────────────────────────────────────────────────

/** The kit's `signupPageTypeEnum` values, written out (kit-version free). */
export const SIGNUP_PAGE_TYPES = {
  HOME: "HOME",
  PRODUCT: "PRODUCT",
  COLLECTION: "COLLECTION",
  CHECKOUT: "CHECKOUT",
  ACCOUNT: "ACCOUNT",
  ORDER: "ORDER",
  OTHER: "OTHER",
};

/**
 * DeVeSheDreams routes that never show a pop-up on top of the kit's own list
 * (sign-in, password and token pages).
 */
export const SIGNUP_POPUP_BLOCKED_PATHS = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/review",
  "/back-in-stock",
];

/** First path segments of the collection pages (`/shop`, `/category/<slug>`). */
const COLLECTION_SEGMENTS = new Set(["shop", "category"]);

/**
 * The merchant's tokens the pop-up takes (`view.styleVars`): colours and
 * corner radius. DeVeSheDreams' own fonts and layout stay.
 */
const ALLOWED_STYLE_VARS = [
  "--zc-signup-bg",
  "--zc-signup-text",
  "--zc-signup-button-bg",
  "--zc-signup-button-text",
  "--zc-signup-radius",
  "--zc-signup-align",
];

// ─── Helpers ──────────────────────────────────────────────────────────────

/** A pathname (query and trailing slash ignored) → the kit's page type. */
export const getSignupPageType = (pathname) => {
  const path = String(pathname || "/").split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  if (path === "/") return SIGNUP_PAGE_TYPES.HOME;
  const [first] = path.slice(1).split("/");
  switch (first) {
    case "product":
      return path.split("/").length > 2 ? SIGNUP_PAGE_TYPES.PRODUCT : SIGNUP_PAGE_TYPES.OTHER;
    case "checkout":
      return SIGNUP_PAGE_TYPES.CHECKOUT;
    case "profile":
      return SIGNUP_PAGE_TYPES.ACCOUNT;
    case "orders":
    case "pay":
      return SIGNUP_PAGE_TYPES.ORDER;
    default:
      return COLLECTION_SEGMENTS.has(first) ? SIGNUP_PAGE_TYPES.COLLECTION : SIGNUP_PAGE_TYPES.OTHER;
  }
};

/** `view.styleVars` → the style object for the pop-up (allowed tokens only). */
export const getSignupPopupStyle = (styleVars) => {
  const style = {};
  for (const name of ALLOWED_STYLE_VARS) {
    const value = styleVars?.[name];
    if (typeof value === "string" && value) style[name] = value;
  }
  return style;
};

/** Text on the pop-up's submit button while it sends. */
export const getSignupPopupButtonText = (state, buttonText) =>
  state === "sending" ? "Signing up…" : buttonText || "Sign up";
