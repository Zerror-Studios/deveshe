/**
 * Meta Pixel calls (PRD-034 FR-1.3)
 *
 * The Pixel itself is loaded by `utils/consent.util.js` (`loadMetaPixel`)
 * only with "marketing" consent and only when the store has a Meta Ads
 * app (`metaPixelId` from `storefrontTrackingConfig`). Every call here is
 * a silent no-op unless the Pixel is loaded **and** marketing consent is
 * still granted, so a withdrawn choice stops events on the same page.
 *
 * `eventId` becomes the Pixel's `eventID`: for `Purchase` it is the order
 * id, the same `event_id` the backend's Conversions API sends, so Meta
 * deduplicates the browser and server events.
 */

import { isMetaPixelLoaded, readConsent } from "@/utils/consent.util";

// ─── Helpers ──────────────────────────────────────────────────────────────

/** True when a Pixel call may run now. */
export function canUseMetaPixel() {
  if (typeof window === "undefined") return false;
  if (typeof window.fbq !== "function" || !isMetaPixelLoaded()) return false;
  return readConsent()?.marketing === true;
}

// ─── Public API ───────────────────────────────────────────────────────────

/** A `PageView` (client-side route changes; the first is sent at load). */
export const pageview = () => {
  if (!canUseMetaPixel()) return;
  window.fbq("track", "PageView");
};

// https://developers.facebook.com/docs/meta-pixel/reference
/** A standard event; `eventId` (optional) is sent as `eventID`. */
export const event = (name, params = {}, eventId = null) => {
  if (!name || !canUseMetaPixel()) return;
  if (eventId) {
    window.fbq("track", name, params, { eventID: String(eventId) });
  } else {
    window.fbq("track", name, params);
  }
};
