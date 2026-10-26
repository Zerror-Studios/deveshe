/**
 * Catalog helpers for the current product contract (PRD-002 SF-1).
 *
 * Prices live on variants (`Variant.price`); options are matched through
 * `Variant.optionValues`. A variant is unavailable when it is ARCHIVED or
 * the PRD-020 stock signal says OUT_OF_STOCK (the rendered value, or the
 * fresh `getVariantAvailability` answer when there is one); `null` means no
 * signal, as before. The server re-checks stock when the cart is reserved
 * at checkout.
 */

import { isSoldOut, resolveVariantSignal } from "@/utils/stock-signal.util";

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

export const isVariantUnavailable = (variant, fresh) =>
  Boolean(variant) &&
  (UNAVAILABLE_VARIANT_STATUSES.includes(variant.status) ||
    isSoldOut(resolveVariantSignal(variant, fresh)));

/** Lowest variant price, or 0 when the product has no priced variant. */
export const getLowestPrice = (variants = []) => {
  const prices = (variants || []).map((v) => v?.price).filter(Boolean);
  return prices.length ? Math.min(...prices) : 0;
};
