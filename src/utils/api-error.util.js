/**
 * Maps GraphQL errors to shopper-facing messages (PRD-002 SF-1).
 *
 * Branches on `extensions.reason` and `extensions.code`, never on message
 * text. Works with Apollo Client 4 errors and the kit's errors (its `getErrorInfo`).
 *
 * Keep in sync with `storefronts/rare-element/src/utils/errors.js` and the
 * reason codes in zcom-backend (`packages/core/src/utils/` and the
 * commerce/payment services); see PRD-002 RMAINT-7.
 */
import { getErrorInfo as readKitError } from "@zcom/storefront-kit/core";

// ─── Messages ─────────────────────────────────────────────────────────────

export const REASON_MESSAGES = {
  PRICE_CHANGED:
    "Prices in your bag have changed. Please review your order and try again.",
  // R2-C7: the hold expired or was released before the order completed.
  CHECKOUT_EXPIRED: "Your reservation expired. Please try again.",
  RESERVATION_RELEASED: "Your reservation expired. Please try again.",
  INVALID_ITEMS:
    "Some items in your bag are no longer available. Please review your bag.",
  RESERVATION_ERROR: "We couldn't reserve your items. Please try again.",
  CHECKOUT_FAILED: "Checkout could not be completed. Please try again.",
  CHECKOUT_IN_PROGRESS: "Your order is already being placed. Please wait.",
  RESERVATION_PENDING:
    "We are still reserving your items. Please try again in a moment.",
  RESERVATION_UNAVAILABLE:
    "Checkout is temporarily unavailable. Please try again shortly.",
  OUT_OF_STOCK: "Some items in your bag are out of stock.",
  EMPTY_CART: "Your bag is empty.",
  INVALID_QTY: "That quantity isn't available for this item.",
  INVALID_GUEST_ID: "Your bag session expired. Please add your items again.",
  ADDRESS_REQUIRED: "Please enter a complete address with city and pincode.",
  VARIANT_REQUIRED: "Please select a size before adding to bag.",
  PRODUCT_UNAVAILABLE: "This product is no longer available.",
  ALREADY_PAID: "This order has already been paid.",
  ORDER_CANCELLED: "This order was cancelled.",
  PROMOTION_INVALID: "This discount code is not valid.",
  PROMOTION_EXPIRED: "This discount code has expired.",
  PROMOTION_INACTIVE: "This discount code is not active.",
  PROMOTION_EXHAUSTED: "This discount code has reached its usage limit.",
  PROMOTION_CUSTOMER_LIMIT: "You have already used this discount code.",
  PROMOTION_MINIMUM: "Your bag does not meet this code's minimum amount.",
  PROMOTION_NOT_APPLICABLE: "This discount code does not apply to your bag.",
  TOO_MANY_LINES: "Your bag has too many items.",
  // R3 (VCON-2): checkout, payment and newsletter reasons.
  CHECKOUT_REPLACED:
    "Your checkout was updated in another window. Please try again.",
  PAYMENT_NOT_CONFIGURED:
    "Online payment is unavailable right now. Please try again later.",
  MISSING_PROVIDER_ORDER:
    "We couldn't confirm your payment. Please check your order or try again.",
  INVALID_EMAIL: "Please enter a valid email address.",
  // PRD-011: payment apps.
  PAYMENT_PROVIDER_NOT_CONFIGURED:
    "Online payment is unavailable right now. Please try again later.",
  INVALID_PAYMENT_SIGNATURE:
    "We couldn't confirm your payment. Please check your order or try again.",
  PROVIDER_ORDER_MISMATCH:
    "We couldn't confirm your payment. Please check your order or try again.",
  // PRD-014 Wave 1 (W1-MONEY): no shipping zone covers the address.
  SHIPPING_UNAVAILABLE:
    "We can't ship to this address yet. Please use a different address.",
  // PRD-003 FR-0.5: customer password reset.
  INVALID_RESET_TOKEN: "This reset link is invalid or has expired.",
  WEAK_PASSWORD: "Use at least 8 characters for your password.",
  // PRD-016 FR-25: the store's billing has paused new orders.
  STORE_ORDERS_PAUSED: "This store isn't taking orders right now.",
  // PRD-015 FR-20: shopper cancel and returns.
  ORDER_NOT_CANCELLABLE:
    "This order can no longer be cancelled; contact the store.",
  PAYMENT_IN_PROGRESS:
    "A payment is in progress; try again in a few minutes.",
  ORDER_NOT_DELIVERED: "You can request a return once the order is delivered.",
  RETURN_WINDOW_CLOSED: "The return window for this order has closed.",
  RETURNS_DISABLED: "This store doesn't accept returns online; contact the store.",
  ORDER_NOT_RETURNABLE: "This order can't be returned here; contact the store.",
  INVALID_ORDER_ITEM:
    "One of these items isn't on this order. Please refresh and try again.",
  INVALID_QUANTITY: "Choose a quantity of at least 1.",
  RETURN_QUANTITY_EXCEEDED:
    "You've already requested a return for some of these items. Please refresh and try again.",
  INVALID_TRANSITION:
    "This return can no longer be changed. Please refresh the page.",
  RETURN_CHANGED: "This return was updated. Please refresh and try again.",
  // CP-22: notify-me (and other public) limits; neutral, never the server text.
  RATE_LIMITED: "We’ve had a lot of requests. Please try again later.",
  // PRD-032: reviews (the review forms use utils/review.util.js too).
  REVIEW_NOT_ALLOWED: "Only customers who received this product can review it.",
  REVIEWS_DISABLED: "Reviews are switched off for this store.",
  INVALID_REVIEW_LINK: "This link has expired. Log in to review your purchases.",
  INVALID_PHOTO: "That photo couldn't be added. Use a JPEG, PNG or WebP image.",
  FILE_TOO_LARGE: "Photos can be at most 5 MB.",
  TOO_MANY_PHOTOS: "Add at most 5 photos.",
};

// PRD-014 COM-32: `removeItemFromCart` without the line's variant is
// ambiguous when the product has several lines (the bag is out of date).
export const REMOVE_ITEM_OVERRIDES = {
  VARIANT_REQUIRED:
    "We couldn't tell which item to remove. Please refresh your bag and try again.",
};

const CODE_MESSAGES = {
  CONFLICT: "This request conflicts with existing data.",
  UNAUTHENTICATED: "Please log in to continue.",
  TOKEN_EXPIRED: "Your session expired. Please log in again.",
  INVALID_AUTH_TOKEN: "Your session expired. Please log in again.",
  FORBIDDEN: "You are not allowed to do this.",
  NOT_FOUND: "We could not find what you were looking for.",
  RATE_LIMIT_EXCEEDED: "Too many attempts. Please wait a minute and try again.",
  // R2-C5: tenant errors from the gateway.
  TENANT_NOT_FOUND: "This store is unavailable right now.",
  TENANT_MISMATCH: "Your session expired. Please log in again.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────

// The first GraphQL error of an Apollo answer or of the kit's server reads
// and hooks (kit PRD-002 FR-4.1): the kit's reader understands both.
const firstGraphqlError = (error) => {
  if (!error) return null;
  const info = readKitError(error);
  if (!info.code && !info.reason) return null;
  return {
    message: info.rawMessage,
    extensions: { code: info.code, reason: info.reason },
  };
};

export const getErrorCode = (error) =>
  firstGraphqlError(error)?.extensions?.code || null;

export const getErrorReason = (error) =>
  firstGraphqlError(error)?.extensions?.reason || null;

/**
 * Shopper-facing message for an Apollo / network error.
 * `overrides` maps a code or reason to a screen-specific message.
 */
export const getErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
  overrides = {},
) => {
  if (!error) return fallback;
  const reason = getErrorReason(error);
  const code = getErrorCode(error);

  if (reason && overrides[reason]) return overrides[reason];
  if (code && overrides[code]) return overrides[code];
  if (reason && REASON_MESSAGES[reason]) return REASON_MESSAGES[reason];
  if (reason?.startsWith("PROMOTION_")) return REASON_MESSAGES.PROMOTION_INVALID;
  if (code === "BAD_USER_INPUT") {
    return firstGraphqlError(error)?.message || fallback;
  }
  if (code && CODE_MESSAGES[code]) return CODE_MESSAGES[code];
  if (error.statusCode === 429) return CODE_MESSAGES.RATE_LIMIT_EXCEEDED;
  if (!firstGraphqlError(error)) {
    return "Network error. Please check your connection and try again.";
  }
  return fallback;
};

/** True when the server rejected the stored guest cart id (R2-C2). */
export const isInvalidGuestIdError = (error) =>
  getErrorReason(error) === "INVALID_GUEST_ID";

/** Error carrying a checkout `reason` raised on the client side. */
export const createReasonError = (reason, message) => {
  const error = new Error(message || REASON_MESSAGES[reason] || reason);
  error.reason = reason;
  return error;
};

/** Like getErrorMessage, but also understands `createReasonError`. */
export const getAnyErrorMessage = (error, fallback, overrides = {}) => {
  if (error?.reason) {
    return overrides[error.reason] || REASON_MESSAGES[error.reason] || fallback;
  }
  return getErrorMessage(error, fallback, overrides);
};
