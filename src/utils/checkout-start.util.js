/**
 * Checkout link copy (PRD-034 FR-1.9). Parsing the link and adding its
 * items are the kit's (`useCheckoutStart`, kit PRD-002 FR-4.1: at most 20
 * lines, quantity 1–10, simple products resolved through
 * `getVariantAvailability`, archived or sold-out lines skipped); this keeps
 * Deveshe Dreams' messages for the kit's error keys.
 */

import { CHECKOUT_START_MAX_QTY } from "@zcom/storefront-kit/core";

// ─── Constants ────────────────────────────────────────────────────────────

export const CHECKOUT_START_PATH = "/checkout/start";
/** Where a guest comes back after login (the bag is merged at login). */
export const CHECKOUT_START_RESUME_PATH = `${CHECKOUT_START_PATH}?resume=1`;
/** The page's own key: the items went in, but checkout couldn't open. */
export const CHECKOUT_START_OPEN_FAILED = "CHECKOUT_OPEN_FAILED";

const CHECKOUT_START_MAX_LINES = 20;

const CHECKOUT_START_MESSAGES = {
  CHECKOUT_LINK_EMPTY: "This checkout link has no products in it.",
  CHECKOUT_LINK_TOO_MANY_LINES: `This checkout link has more than ${CHECKOUT_START_MAX_LINES} products.`,
  CHECKOUT_LINK_INVALID_LINE: "This checkout link isn't valid.",
  CHECKOUT_LINK_INVALID_QUANTITY: `Each product in a checkout link can have 1 to ${CHECKOUT_START_MAX_QTY} pieces.`,
  CHECKOUT_LINK_UNAVAILABLE:
    "The products in this link aren't available any more.",
  [CHECKOUT_START_OPEN_FAILED]:
    "We couldn't add these products to your bag. Please try again.",
};

// ─── Copy ─────────────────────────────────────────────────────────────────

/** Shopper copy for a kit error key (or the page's own key). */
export const getCheckoutStartMessage = (error) =>
  CHECKOUT_START_MESSAGES[error] ||
  CHECKOUT_START_MESSAGES[CHECKOUT_START_OPEN_FAILED];
