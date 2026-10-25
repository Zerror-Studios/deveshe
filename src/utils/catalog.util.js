/**
 * Catalog helpers for the current product contract (PRD-002 SF-1).
 *
 * Prices live on variants (`Variant.price`); options are matched through
 * `Variant.optionValues`. The storefront API exposes no stock level, so a
 * variant is only unavailable when it is ARCHIVED; the server re-checks
 * availability when the cart is reserved at checkout.
 */

// ─── Constants ────────────────────────────────────────────────────────────

const UNAVAILABLE_VARIANT_STATUSES = ["ARCHIVED"];

// ─── Helpers ──────────────────────────────────────────────────────────────

const sortedCopy = (values = []) => [...values].map(String).sort();

/** The variant whose option values match the selected ones (any order). */
export const findVariantByOptions = (variants = [], selectedValues = []) => {
  const wanted = sortedCopy(selectedValues);
  return (
    variants?.find((variant) => {
      const options = sortedCopy(variant?.optionValues || []);
      return (
        options.length === wanted.length &&
        options.every((value, index) => value === wanted[index])
      );
    }) || null
  );
};

export const isVariantUnavailable = (variant) =>
  Boolean(variant) &&
  UNAVAILABLE_VARIANT_STATUSES.includes(variant.status);

/** Lowest variant price, or 0 when the product has no priced variant. */
export const getLowestPrice = (variants = []) => {
  const prices = (variants || []).map((v) => v?.price).filter(Boolean);
  return prices.length ? Math.min(...prices) : 0;
};
