/**
 * E-commerce event dispatcher: GA4, Meta Pixel and Google Ads
 * (PRD-012, PRD-014 FR-1.9, PRD-034 FR-1.3) on the kit (kit PRD-002
 * FR-4.1).
 *
 * `trackEcomEvent` is the one place the four e-commerce events start:
 * - GA4 through the kit's `trackEvent`: only with analytics consent,
 *   queued until GA4 has loaded, sent to the store's GA4 id only (the
 *   backend's `ga4MeasurementId`, else `NEXT_PUBLIC_GA_MEASUREMENT_ID`);
 * - Meta and Google Ads through the kit's ads functions: only with
 *   marketing (ads) consent, to the ids `ZcomTags` loaded.
 * GA4 items keep the variant SKU as `item_id` (PRD-013 FR-2.2); the ads
 * networks get the variant id (the product feed's `id`). The purchase
 * `transaction_id` / `eventID` is the order `_id` everywhere, as the
 * backend's server-side GA4 and Meta purchases send, so each network
 * counts it once. The customer's email and phone are hashed by the kit
 * for Google enhanced conversions, never sent plain.
 */

import {
  trackAdsAddToCart,
  trackAdsBeginCheckout,
  trackAdsPurchase,
  trackAdsViewContent,
  trackEvent,
} from "@zcom/storefront-kit/core";

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

/** The ads item id: the variant id (the product feed's `id`). */
const toAdsId = (product, variant) =>
  String(variant?._id || product?.variants?.[0]?._id || product?._id || "");

/** Ads items from cart or order lines (`variantId`, `qty`, `price`). */
const toAdsItems = (lines = []) =>
  (lines || [])
    .map((line) => ({
      id: String(line?.variantId || line?.productId || ""),
      quantity: Number(line?.qty || 1),
      price: Number(line?.price || 0),
    }))
    .filter((item) => item.id);

/** Tracks one GA4 event (kit: analytics consent, queued, GA4 only). */
export const trackGAEvent = (eventName, params = {}) =>
  trackEvent(eventName, params);

/**
 * Track common eCommerce events
 */
export const trackEcomEvent = {
  viewItem: (product, variant = null) => {
    const value = getVariantPrice(product, variant);
    trackGAEvent("view_item", {
      currency: DEFAULT_CURRENCY,
      value,
      items: [mapProductToGA4Item(product, variant)]
    });
    const id = toAdsId(product, variant);
    if (id) {
      trackAdsViewContent(null, { id, quantity: 1, price: value }, DEFAULT_CURRENCY);
    }
  },

  addToCart: (product, variant = null, quantity = 1) => {
    const price = Number(variant?.price || 0);
    trackGAEvent("add_to_cart", {
      currency: DEFAULT_CURRENCY,
      value: price * quantity,
      items: [mapProductToGA4Item(product, variant, quantity)]
    });
    const id = toAdsId(product, variant);
    if (id) {
      trackAdsAddToCart(null, { id, quantity, price }, DEFAULT_CURRENCY);
    }
  },

  beginCheckout: (cartItems = [], totalValue = 0) => {
    trackGAEvent("begin_checkout", {
      currency: DEFAULT_CURRENCY,
      value: Number(totalValue),
      items: cartItems.map(mapLineToGA4Item)
    });
    trackAdsBeginCheckout(
      null,
      toAdsItems(cartItems),
      Number(totalValue),
      DEFAULT_CURRENCY,
    );
  },

  /**
   * `orderId` is the order `_id` (PRD-034 FR-1.3). `options.customer`
   * (`{ email, phone, countryCode }`) is only hashed (by the kit) for Google
   * enhanced conversions, never sent to GA4 or Meta.
   */
  purchase: (orderId, totalValue, items = [], shipping = 0, tax = 0, options = {}) => {
    const currency = options.currency || DEFAULT_CURRENCY;
    trackGAEvent("purchase", {
      transaction_id: orderId,
      value: Number(totalValue),
      currency,
      tax: Number(tax),
      shipping: Number(shipping),
      items: items.map(mapLineToGA4Item)
    });
    trackAdsPurchase(null, {
      orderId,
      value: Number(totalValue),
      currency,
      items: toAdsItems(items),
      email: options.customer?.email ?? null,
      phone: options.customer?.phone ?? null,
      countryCode: options.customer?.countryCode ?? null,
    });
  }
};
