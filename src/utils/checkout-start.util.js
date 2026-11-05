/**
 * `/checkout/start?products=<variantId>:<qty>,…` (PRD-034 FR-1.9)
 *
 * The checkout URL Meta (Shops, ads) and the product feed send shoppers
 * to. The page fills the bag with these lines through the normal cart
 * operations and opens checkout. This module only parses and validates:
 * at most `CHECKOUT_START_MAX_LINES` lines, each a variant id (an ObjectId)
 * and a whole quantity from 1 to `CHECKOUT_START_MAX_QTY` (default 1 when
 * left out); the same variant twice is merged. Anything else is refused
 * with a reason the page turns into a friendly message.
 */

// ─── Constants ────────────────────────────────────────────────────────────

export const CHECKOUT_START_PATH = "/checkout/start";
/** Where a guest comes back after login (the bag is merged at login). */
export const CHECKOUT_START_RESUME_PATH = `${CHECKOUT_START_PATH}?resume=1`;
export const CHECKOUT_START_MAX_LINES = 20;
export const CHECKOUT_START_MAX_QTY = 10;
const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;
const QTY_PATTERN = /^\d{1,2}$/;

export const CheckoutStartErrorEnum = {
  EMPTY: "EMPTY",
  TOO_MANY_LINES: "TOO_MANY_LINES",
  INVALID_ID: "INVALID_ID",
  INVALID_QUANTITY: "INVALID_QUANTITY",
  UNAVAILABLE: "UNAVAILABLE",
  FAILED: "FAILED",
};

export const CHECKOUT_START_MESSAGES = {
  [CheckoutStartErrorEnum.EMPTY]: "This checkout link has no products in it.",
  [CheckoutStartErrorEnum.TOO_MANY_LINES]:
    `This checkout link has more than ${CHECKOUT_START_MAX_LINES} products.`,
  [CheckoutStartErrorEnum.INVALID_ID]: "This checkout link isn't valid.",
  [CheckoutStartErrorEnum.INVALID_QUANTITY]:
    `Each product in a checkout link can have 1 to ${CHECKOUT_START_MAX_QTY} pieces.`,
  [CheckoutStartErrorEnum.UNAVAILABLE]:
    "The products in this link aren't available any more.",
  [CheckoutStartErrorEnum.FAILED]:
    "We couldn't add these products to your bag. Please try again.",
};

// ─── Parsing ──────────────────────────────────────────────────────────────

/**
 * `{ lines: [{ variantId, qty }], error: null }`, or `{ lines: [], error }`
 * with a `CheckoutStartErrorEnum` value. `raw` is the `products` query
 * value (a string, or the first of several).
 */
export function parseCheckoutStartProducts(raw) {
  const value = String((Array.isArray(raw) ? raw[0] : raw) ?? "").trim();
  const refuse = (error) => ({ lines: [], error });
  if (!value) return refuse(CheckoutStartErrorEnum.EMPTY);

  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return refuse(CheckoutStartErrorEnum.EMPTY);
  if (parts.length > CHECKOUT_START_MAX_LINES) {
    return refuse(CheckoutStartErrorEnum.TOO_MANY_LINES);
  }

  const quantities = new Map();
  for (const part of parts) {
    const [id, qtyText, ...rest] = part.split(":").map((piece) => piece.trim());
    if (rest.length || !OBJECT_ID_PATTERN.test(id || "")) {
      return refuse(CheckoutStartErrorEnum.INVALID_ID);
    }
    const qtyValue = qtyText === undefined ? "1" : qtyText;
    if (!QTY_PATTERN.test(qtyValue)) {
      return refuse(CheckoutStartErrorEnum.INVALID_QUANTITY);
    }
    const variantId = id.toLowerCase();
    const qty = (quantities.get(variantId) || 0) + Number(qtyValue);
    if (qty < 1 || qty > CHECKOUT_START_MAX_QTY) {
      return refuse(CheckoutStartErrorEnum.INVALID_QUANTITY);
    }
    quantities.set(variantId, qty);
  }
  return {
    lines: [...quantities].map(([variantId, qty]) => ({ variantId, qty })),
    error: null,
  };
}

/** The friendly message for a reason (FAILED for anything unknown). */
export const getCheckoutStartMessage = (error) =>
  CHECKOUT_START_MESSAGES[error] ||
  CHECKOUT_START_MESSAGES[CheckoutStartErrorEnum.FAILED];
