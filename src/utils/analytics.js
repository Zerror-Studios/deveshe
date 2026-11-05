/**
 * E-commerce event dispatcher: GA4, Meta Pixel and Google Ads
 * (PRD-012, PRD-014 FR-1.9, PRD-034 FR-1.3)
 *
 * `trackEcomEvent` is the one place the four e-commerce events start. Each
 * waits until the tags are ready (`runWhenTrackingReady`), then sends:
 * - GA4, only with "analytics" consent, to the store's GA4 id
 *   (`getTagIds().gaId`: the backend's `ga4MeasurementId`, else
 *   `NEXT_PUBLIC_GA_MEASUREMENT_ID`; no hard-coded fallback, FE-24);
 * - Meta and Google Ads (`utils/ads-tracking.util.js`), only with
 *   "marketing" consent.
 * GA4 items keep the variant SKU as `item_id` (PRD-013 FR-2.2); the ads
 * networks get the variant id (the product feed's `id`). The purchase
 * `transaction_id` / `eventID` is the order `_id` everywhere, as the
 * backend's server-side GA4 and Meta purchases send.
 */

import { AdsTracking } from "@/utils/ads-tracking.util";
import { readConsent } from "@/utils/consent.util";
import { getTagIds, runWhenTrackingReady } from "@/utils/tracking-config.util";

const DEFAULT_CURRENCY = "INR";

/**
 * Maps an internal product object to the standard GA4 items schema.
 * @param {Object} product - The internal product object.
 * @param {Object} variant - (Optional) Selected variant details.
 * @param {number} quantity - (Optional) Quantity.
 * @returns {Object} GA4 item object.
 */
// PRD-014 FE-24: without a chosen variant, report the lowest published
// variant price instead of 0 (as rare-element does).
const getVariantPrice = (product, variant) => {
  if (variant?.price) return Number(variant.price);
  const prices = (product?.variants || [])
    .map((v) => Number(v?.price))
    .filter((price) => price > 0);
  return prices.length ? Math.min(...prices) : 0;
};

export const mapProductToGA4Item = (product, variant = null, quantity = 1) => {
  if (!product) return null;

  return {
    // PRD-013 FR-2.2: the backend joins events through `product_variant`,
    // so a product without a chosen variant reports its first variant.
    item_id: variant?.sku || product?.variants?.[0]?.sku || product?._id,
    item_name: product.name,
    price: getVariantPrice(product, variant),
    quantity: Number(quantity),
    item_brand: "Deveshe Dreams",
    item_category: product.categoryIds?.[0] || "General",
    item_variant: variant?.title || ""
  };
};

/**
 * Maps a server cart or order line (CartItem / OrderItemSnapshot) to GA4.
 * @param {Object} line - The line with productId, name, sku, price, qty.
 * @returns {Object} GA4 item object.
 */
export const mapLineToGA4Item = (line) => ({
  item_id: line?.sku || line?.productId,
  item_name: line?.name || "",
  price: Number(line?.price || 0),
  quantity: Number(line?.qty || 1),
  item_brand: "Deveshe Dreams",
});

/**
 * Tracks a custom event in GA4.
 * @param {string} eventName - Standard or custom event name (e.g., 'view_item').
 * @param {Object} params - Event parameters.
 */
// PRD-034: only with analytics consent, so a gtag.js loaded for Google Ads
// alone (marketing without analytics) never carries GA4 events.
export const trackGAEvent = (eventName, params = {}) => {
  const { gaId } = getTagIds();
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  if (!gaId || readConsent()?.analytics !== true) return;
  window.gtag("event", eventName, {
    ...params,
    send_to: gaId
  });
};

/**
 * Track common eCommerce events
 */
export const trackEcomEvent = {
  viewItem: (product, variant = null) => {
    runWhenTrackingReady(() => {
      const value = getVariantPrice(product, variant);
      trackGAEvent("view_item", {
        currency: DEFAULT_CURRENCY,
        value,
        items: [mapProductToGA4Item(product, variant)]
      });
      AdsTracking.viewItem(product, variant, value);
    });
  },

  addToCart: (product, variant = null, quantity = 1) => {
    runWhenTrackingReady(() => {
      const value = Number(variant?.price || 0) * quantity;
      trackGAEvent("add_to_cart", {
        currency: DEFAULT_CURRENCY,
        value,
        items: [mapProductToGA4Item(product, variant, quantity)]
      });
      AdsTracking.addToCart(product, variant, quantity, value);
    });
  },

  beginCheckout: (cartItems = [], totalValue = 0) => {
    runWhenTrackingReady(() => {
      trackGAEvent("begin_checkout", {
        currency: DEFAULT_CURRENCY,
        value: Number(totalValue),
        items: cartItems.map(mapLineToGA4Item)
      });
      AdsTracking.beginCheckout(cartItems, totalValue);
    });
  },

  /**
   * `orderId` is the order `_id` (PRD-034 FR-1.3). `options.customer`
   * (`{ email, phone, countryCode }`) is only hashed for Google enhanced
   * conversions, never sent to GA4 or Meta.
   */
  purchase: (orderId, totalValue, items = [], shipping = 0, tax = 0, options = {}) => {
    const currency = options.currency || DEFAULT_CURRENCY;
    runWhenTrackingReady(() => {
      trackGAEvent("purchase", {
        transaction_id: orderId,
        value: Number(totalValue),
        currency,
        tax: Number(tax),
        shipping: Number(shipping),
        items: items.map(mapLineToGA4Item)
      });
      AdsTracking.purchase({
        orderId,
        value: totalValue,
        currency,
        lines: items,
        customer: options.customer,
      });
    });
  }
};
