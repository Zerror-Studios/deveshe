/**
 * Google Analytics 4 (GA4) Tracking Utility
 * Provides a standardized way to track events across the platform.
 */

// PRD-014 FR-1.9 (FE-24): no hard-coded fallback ids. An unset id loads
// no tag, so a build without env never reports into another property.
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";

/** Tag ids for `utils/consent.util.js` (loaded only after consent). */
export const TAG_IDS = Object.freeze({
  gaId: GA_TRACKING_ID,
  gtmId: GTM_ID,
  pixelId: "",
});

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
export const trackGAEvent = (eventName, params = {}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, {
      ...params,
      send_to: GA_TRACKING_ID
    });
  } else {
    console.warn(`GA4 event "${eventName}" suppressed (gtag not initialized).`, params);
  }
};

/**
 * Track common eCommerce events
 */
export const trackEcomEvent = {
  viewItem: (product, variant = null) => {
    trackGAEvent("view_item", {
      currency: "INR",
      value: getVariantPrice(product, variant),
      items: [mapProductToGA4Item(product, variant)]
    });
  },

  addToCart: (product, variant = null, quantity = 1) => {
    trackGAEvent("add_to_cart", {
      currency: "INR",
      value: Number(variant?.price || 0) * quantity,
      items: [mapProductToGA4Item(product, variant, quantity)]
    });
  },

  beginCheckout: (cartItems = [], totalValue = 0) => {
    trackGAEvent("begin_checkout", {
      currency: "INR",
      value: Number(totalValue),
      items: cartItems.map(mapLineToGA4Item)
    });
  },

  purchase: (orderId, totalValue, items = [], shipping = 0, tax = 0) => {
    trackGAEvent("purchase", {
      transaction_id: orderId,
      value: Number(totalValue),
      currency: "INR",
      tax: Number(tax),
      shipping: Number(shipping),
      items: items.map(mapLineToGA4Item)
    });
  }
};
