/**
 * The shipping line of the checkout (both paths): what the order will be
 * charged once "Continue to payment" priced it, before that the server's
 * estimate for the address entered (backend `shippingEstimate`, kit
 * `useShippingEstimate`, 2026-11-13), else a prompt for the address.
 */

const RUPEE = String.fromCharCode(8377);

/**
 * @param {object} p
 * @param {object|null} p.pricing  the reserved session's pricing
 * @param {boolean} p.isPricing    "Continue to payment" is running
 * @param {object|null} p.estimate `{ shipping, isFreeShipping, available }`
 * @param {boolean} p.estimating   the estimate is loading
 * @param {boolean} p.isFreeShippingEnabled the bag has free shipping
 */
export const getShippingLabel = ({
  pricing = null,
  isPricing = false,
  estimate = null,
  estimating = false,
  isFreeShippingEnabled = false,
} = {}) => {
  if (pricing) {
    return pricing.isFreeShipping || !pricing.shipping ? "Free" : `${RUPEE} ${pricing.shipping}`;
  }
  if (isPricing) return "Calculating…";
  if (estimate) {
    if (!estimate.available) return "We can't ship to this address yet";
    return estimate.isFreeShipping || !estimate.shipping ? "Free" : `${RUPEE} ${estimate.shipping}`;
  }
  if (estimating) return "Calculating…";
  if (isFreeShippingEnabled) return "Free";
  return "Enter your address to see shipping";
};

/** The estimated shipping to add to the bag total, or 0. */
export const getEstimatedShipping = (pricing, estimate) =>
  !pricing && estimate?.available && !estimate.isFreeShipping ? Number(estimate.shipping) || 0 : 0;
