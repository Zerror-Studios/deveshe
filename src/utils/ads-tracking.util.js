/**
 * Meta Pixel and Google Ads events (PRD-034 FR-1.3, FR-1.6)
 *
 * Called by `utils/analytics.js` (`trackEcomEvent`), the one dispatcher
 * for the four e-commerce events, so GA4, the Pixel and the Google tag see
 * the same events. Every call:
 * - runs only with "marketing" consent and only when the tag is loaded
 *   (`lib/fpixel.js` for Meta, `isGoogleAdsTagLoaded` for Google), so a
 *   shopper who refused or withdrew marketing sends nothing (D8);
 * - uses the **variant id** as the item id (the product feed's `id`);
 * - never throws.
 *
 * Purchase: the Pixel's `eventID` and Google's `transaction_id` are the
 * order `_id`, the id the backend's server events use, so each network
 * deduplicates the browser and server purchase. Enhanced conversions set
 * hashed `user_data` first, only when the store turned them on.
 */

import { event as pixelEvent } from "@/lib/fpixel";
import { buildEnhancedUserData } from "@/utils/ads-hash.util";
import { isGoogleAdsTagLoaded, readConsent } from "@/utils/consent.util";
import { getTagIds } from "@/utils/tracking-config.util";

// ─── Constants ────────────────────────────────────────────────────────────

export const ADS_DEFAULT_CURRENCY = "INR";
const CONTENT_TYPE_PRODUCT = "product";

// ─── Helpers ──────────────────────────────────────────────────────────────

const hasMarketingConsent = () => readConsent()?.marketing === true;

const toAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

/** The variant id for a product (+ chosen variant); the first variant else. */
export const getAdsItemId = (product, variant = null) =>
  String(variant?._id || product?.variants?.[0]?._id || product?._id || "");

/** Meta `contents` from cart or order lines (`variantId`, `qty`). */
export const toAdsContents = (lines = []) =>
  (lines || [])
    .map((line) => ({
      id: String(line?.variantId || line?.productId || ""),
      quantity: Math.max(1, Number(line?.qty || line?.quantity || 1)),
    }))
    .filter((content) => content.id);

/** True when a Google Ads call may run now (consent, tag, ids). */
function canUseGoogleAds() {
  if (typeof window === "undefined") return false;
  if (typeof window.gtag !== "function" || !isGoogleAdsTagLoaded()) {
    return false;
  }
  return hasMarketingConsent() && Boolean(getTagIds().googleAds);
}

/** A Google Ads conversion for `label` (skipped when the label is unset). */
function sendGoogleConversion(label, params) {
  const googleAds = getTagIds().googleAds;
  if (!label || !canUseGoogleAds()) return;
  window.gtag("event", "conversion", {
    send_to: `${googleAds.conversionId}/${label}`,
    ...params,
  });
}

const safely = (run) => {
  try {
    const result = run();
    if (result && typeof result.catch === "function") {
      return result.catch(() => undefined);
    }
    return result;
  } catch {
    // Ads tracking never breaks the UI.
    return undefined;
  }
};

// ─── Events ───────────────────────────────────────────────────────────────

export const AdsTracking = {
  /** PDP view → Meta `ViewContent`. */
  viewItem: (product, variant, value, currency = ADS_DEFAULT_CURRENCY) =>
    safely(() => {
      const id = getAdsItemId(product, variant);
      if (!id) return;
      pixelEvent("ViewContent", {
        content_ids: [id],
        content_type: CONTENT_TYPE_PRODUCT,
        content_name: product?.name || undefined,
        value: toAmount(value),
        currency,
      });
    }),

  /** Add to bag → Meta `AddToCart` + Google `addToCartLabel`. */
  addToCart: (product, variant, quantity, value, currency = ADS_DEFAULT_CURRENCY) =>
    safely(() => {
      const id = getAdsItemId(product, variant);
      if (!id) return;
      const amount = toAmount(value);
      pixelEvent("AddToCart", {
        content_ids: [id],
        content_type: CONTENT_TYPE_PRODUCT,
        contents: [{ id, quantity: Math.max(1, Number(quantity) || 1) }],
        value: amount,
        currency,
      });
      sendGoogleConversion(getTagIds().googleAds?.addToCartLabel, {
        value: amount,
        currency,
      });
    }),

  /** Checkout opened → Meta `InitiateCheckout` + Google `beginCheckoutLabel`. */
  beginCheckout: (lines, value, currency = ADS_DEFAULT_CURRENCY) =>
    safely(() => {
      const contents = toAdsContents(lines);
      const amount = toAmount(value);
      pixelEvent("InitiateCheckout", {
        content_ids: contents.map((content) => content.id),
        content_type: CONTENT_TYPE_PRODUCT,
        contents,
        num_items: contents.reduce((sum, content) => sum + content.quantity, 0),
        value: amount,
        currency,
      });
      sendGoogleConversion(getTagIds().googleAds?.beginCheckoutLabel, {
        value: amount,
        currency,
      });
    }),

  /**
   * Paid order → Meta `Purchase` (`eventID` = order id) and the Google
   * purchase conversion (`transaction_id` = order id), with hashed
   * `user_data` first when enhanced conversions are on.
   */
  purchase: ({ orderId, value, currency = ADS_DEFAULT_CURRENCY, lines, customer }) =>
    safely(async () => {
      if (!orderId) return;
      const id = String(orderId);
      const contents = toAdsContents(lines);
      const amount = toAmount(value);
      pixelEvent(
        "Purchase",
        {
          content_ids: contents.map((content) => content.id),
          content_type: CONTENT_TYPE_PRODUCT,
          contents,
          num_items: contents.reduce((sum, content) => sum + content.quantity, 0),
          value: amount,
          currency,
        },
        id,
      );

      const googleAds = getTagIds().googleAds;
      if (!googleAds || !canUseGoogleAds()) return;
      if (googleAds.enhancedConversions) {
        const userData = await buildEnhancedUserData(customer);
        // Consent may have changed while hashing.
        if (userData && canUseGoogleAds()) {
          window.gtag("set", "user_data", userData);
        }
      }
      sendGoogleConversion(googleAds.purchaseLabel, {
        value: amount,
        currency,
        transaction_id: id,
      });
    }),
};
