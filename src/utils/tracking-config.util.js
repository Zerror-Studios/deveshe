/**
 * Per-store tag ids (PRD-034 FR-1.2) and the tracking readiness queue
 *
 * The tag ids come from the backend (`storefrontTrackingConfig`, public,
 * edge-cached), read once per page load in the browser through the one
 * Apollo client (`components/common/ConsentBanner.jsx` passes the fetch).
 * Transition rule: a backend value wins; when it is null, GA4 falls back
 * to `NEXT_PUBLIC_GA_MEASUREMENT_ID`. There is no env id for the Meta
 * Pixel or Google Ads (no fallback), and GTM stays env-only. A failed or
 * slow config query (`TRACKING_CONFIG_TIMEOUT_MS`) counts as null, so the
 * page never breaks and the env GA id still works.
 *
 * Readiness: tags load only once the ids are known and the consent is
 * applied, so events fired before that (a PDP `view_item` on mount) wait
 * in a small queue (`runWhenTrackingReady`) and run once the banner calls
 * `markTrackingReady()`. Each event still checks consent when it runs.
 *
 * No GraphQL import here (the caller passes the fetch), so `npm test` can
 * load this module in plain Node.
 */

// ─── Constants ────────────────────────────────────────────────────────────

/** Build-time env ids (the GA fallback and GTM). An unset id loads no tag. */
export const ENV_TAG_IDS = Object.freeze({
  gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",
});

export const TRACKING_CONFIG_TIMEOUT_MS = 3000;
const MAX_QUEUED_EVENTS = 25;

// ─── State ────────────────────────────────────────────────────────────────

let tagIds = null;
let loading = null;
let ready = false;
const queue = [];

// ─── Helpers ──────────────────────────────────────────────────────────────

const clean = (value) => (typeof value === "string" ? value.trim() : "");

/** Google Ads ids, or null without a conversion id and purchase label. */
function toGoogleAds(googleAds) {
  const conversionId = clean(googleAds?.conversionId);
  const purchaseLabel = clean(googleAds?.purchaseLabel);
  if (!conversionId || !purchaseLabel) return null;
  return {
    conversionId,
    purchaseLabel,
    addToCartLabel: clean(googleAds?.addToCartLabel),
    beginCheckoutLabel: clean(googleAds?.beginCheckoutLabel),
    enhancedConversions: googleAds?.enhancedConversions === true,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * The tag ids from a `storefrontTrackingConfig` answer (or null) and the
 * env ids: `{ gaId, gtmId, pixelId, googleAds }`.
 */
export function resolveTagIds(config, envIds = ENV_TAG_IDS) {
  return {
    gaId: clean(config?.ga4MeasurementId) || clean(envIds?.gaId),
    gtmId: clean(envIds?.gtmId),
    pixelId: clean(config?.metaPixelId),
    googleAds: toGoogleAds(config?.googleAds),
  };
}

/** The ids in use: the backend's once loaded, else the env fallback. */
export function getTagIds() {
  return tagIds || resolveTagIds(null);
}

/**
 * Loads the ids once (single-flight). `fetchConfig` resolves to the
 * `storefrontTrackingConfig` object; an error or a timeout counts as null.
 */
export async function loadTagIds(
  fetchConfig,
  { timeoutMs = TRACKING_CONFIG_TIMEOUT_MS } = {},
) {
  if (tagIds) return tagIds;
  if (!loading) {
    let timer = null;
    const timeout = new Promise((resolve) => {
      timer = setTimeout(() => resolve(null), timeoutMs);
    });
    const fetched = Promise.resolve()
      .then(() => fetchConfig())
      .catch(() => null);
    loading = Promise.race([fetched, timeout]).then((config) => {
      clearTimeout(timer);
      tagIds = resolveTagIds(config);
      return tagIds;
    });
  }
  return await loading;
}

/** Runs `run` now when tags are ready, else once they are (bounded queue). */
export function runWhenTrackingReady(run) {
  if (ready) {
    try {
      run();
    } catch {
      // Tracking never breaks the UI.
    }
    return;
  }
  if (queue.length < MAX_QUEUED_EVENTS) queue.push(run);
}

/** Called after the ids are known and the consent applied: flushes. */
export function markTrackingReady() {
  ready = true;
  while (queue.length) {
    const run = queue.shift();
    try {
      run();
    } catch {
      // Tracking never breaks the UI.
    }
  }
}

/** Test helper: back to the first-load state. */
export function resetTrackingConfigForTests() {
  tagIds = null;
  loading = null;
  ready = false;
  queue.length = 0;
}
