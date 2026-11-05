/**
 * Meta and Google ads tracking (PRD-034 FR-1.2–FR-1.4, FR-1.6, FR-1.9, D8)
 *
 * Runs the real `src/utils/*` modules against a small browser shim
 * (storage, cookies, location, `document.head`, window events). Each case
 * imports with its own `?case=` query, so the tag state of
 * `utils/consent.util.js` and `utils/tracking-config.util.js` starts fresh.
 *
 * Covered: the GA env fallback and the backend ids (FR-1.2); no Pixel,
 * Google Ads tag, conversion or `user_data` without marketing consent, and
 * revoke on withdrawal (FR-1.3, D8); the purchase ids (`eventID` /
 * `transaction_id` = order id) and variant ids; enhanced conversions only
 * when the store turned them on (FR-1.6); E.164 and hashing; click-id
 * capture and persistence and the checkout attribution / consent payload
 * (FR-1.4); the `/checkout/start` parser (FR-1.9).
 */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { beforeEach, describe, it } from "node:test";

// ─── Browser shim ─────────────────────────────────────────────────────────

const createStorage = () => {
  const items = new Map();
  return {
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: (key) => items.delete(key),
    clear: () => items.clear(),
  };
};

const scripts = [];
const events = new EventTarget();

function resetBrowser({ search = "", cookie = "" } = {}) {
  globalThis.localStorage = createStorage();
  globalThis.sessionStorage = createStorage();
  scripts.length = 0;
  globalThis.document = {
    cookie,
    referrer: "",
    createElement: () => ({}),
    head: { appendChild: (script) => scripts.push(script.src) },
  };
  globalThis.window = {
    location: { origin: "https://shop.example", pathname: "/", search },
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
  };
}

/** Records every `gtag` / `fbq` call after the tags load. */
function recordTagCalls() {
  const gtagCalls = [];
  const fbqCalls = [];
  window.gtag = (...args) => gtagCalls.push(args);
  window.fbq = (...args) => fbqCalls.push(args);
  return { gtagCalls, fbqCalls };
}

let caseNumber = 0;

/** Fresh copies of every module for one case. */
async function loadModules() {
  caseNumber += 1;
  const query = `?case=${caseNumber}`;
  const load = (file) => import(`../src/utils/${file}.js${query}`);
  return {
    consent: await load("consent.util"),
    tracking: await load("tracking-config.util"),
    ads: await load("ads-tracking.util"),
    analytics: await load("analytics"),
    clicks: await load("ad-click-ids.util"),
  };
}

const CONFIG = {
  ga4MeasurementId: "G-STORE",
  metaPixelId: "1234567890",
  googleAds: {
    conversionId: "AW-111",
    purchaseLabel: "buy",
    addToCartLabel: "cart",
    beginCheckoutLabel: null,
    enhancedConversions: true,
  },
};

const setConsent = (consent, analytics, marketing) =>
  localStorage.setItem(
    consent.CONSENT_STORAGE_KEY,
    JSON.stringify({ v: consent.CONSENT_VERSION, analytics, marketing }),
  );

/** Loads the ids as the banner does, applies `choice`, releases events. */
async function startTags(modules, choice, config = CONFIG) {
  const tagIds = await modules.tracking.loadTagIds(async () => config);
  setConsent(modules.consent, choice.analytics, choice.marketing);
  modules.consent.applyConsent(choice, tagIds);
  modules.tracking.markTrackingReady();
  return tagIds;
}

const sha256 = (text) => createHash("sha256").update(text).digest("hex");
/** Waits (≤ 1 s) until `check()` holds: hashing is async (SubtleCrypto). */
async function waitFor(check) {
  for (let attempt = 0; attempt < 100 && !check(); attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

const ORDER_LINES = [
  { productId: "p1", variantId: "v1", sku: "SKU-1", qty: 2, price: 500 },
  { productId: "p2", variantId: "v2", sku: "SKU-2", qty: 1, price: 300 },
];

// ─── Tag ids (FR-1.2) ─────────────────────────────────────────────────────

describe("PRD-034 tag ids: backend first, GA env fallback", () => {
  beforeEach(() => resetBrowser());

  it("prefers the backend ids and keeps GTM from env", async () => {
    const { tracking } = await loadModules();
    const ids = tracking.resolveTagIds(CONFIG, { gaId: "G-ENV", gtmId: "GTM-ENV" });
    assert.equal(ids.gaId, "G-STORE");
    assert.equal(ids.gtmId, "GTM-ENV");
    assert.equal(ids.pixelId, "1234567890");
    assert.equal(ids.googleAds.conversionId, "AW-111");
    assert.equal(ids.googleAds.beginCheckoutLabel, "");
  });

  it("falls back to the GA env id only; no Pixel or Google Ads without the backend", async () => {
    const { tracking } = await loadModules();
    const ids = tracking.resolveTagIds(
      { ga4MeasurementId: null, metaPixelId: null, googleAds: null },
      { gaId: "G-ENV", gtmId: "" },
    );
    assert.deepEqual(ids, { gaId: "G-ENV", gtmId: "", pixelId: "", googleAds: null });
  });

  it("drops a Google Ads config without a purchase label", async () => {
    const { tracking } = await loadModules();
    const ids = tracking.resolveTagIds({ googleAds: { conversionId: "AW-1" } }, {});
    assert.equal(ids.googleAds, null);
  });

  it("treats a failed or slow config query as null", async () => {
    const failing = await loadModules();
    const failed = await failing.tracking.loadTagIds(async () => {
      throw new Error("gateway down");
    });
    assert.equal(failed.pixelId, "");
    const slow = await loadModules();
    const timedOut = await slow.tracking.loadTagIds(
      () => new Promise(() => {}),
      { timeoutMs: 5 },
    );
    assert.equal(timedOut.googleAds, null);
  });

  it("queues events until the tags are ready, then runs them", async () => {
    const { tracking } = await loadModules();
    const ran = [];
    tracking.runWhenTrackingReady(() => ran.push("early"));
    assert.deepEqual(ran, []);
    tracking.markTrackingReady();
    tracking.runWhenTrackingReady(() => ran.push("late"));
    assert.deepEqual(ran, ["early", "late"]);
  });
});

// ─── Consent gating (FR-1.3, D8) ──────────────────────────────────────────

describe("PRD-034 consent: ads only with marketing", () => {
  beforeEach(() => resetBrowser());

  it("loads no Pixel or Google Ads tag and sends nothing without marketing", async () => {
    const modules = await loadModules();
    await startTags(modules, { analytics: true, marketing: false });
    assert.ok(scripts.some((src) => src.includes("gtag/js?id=G-STORE")));
    assert.equal(scripts.some((src) => src.includes("fbevents.js")), false);
    assert.equal(scripts.some((src) => src.includes("AW-111")), false);

    const { gtagCalls } = recordTagCalls();
    window.fbq = undefined;
    modules.analytics.trackEcomEvent.addToCart(
      { _id: "p1", name: "Dress", variants: [{ _id: "v1", price: 500 }] },
      { _id: "v1", sku: "SKU-1", price: 500 },
    );
    modules.analytics.trackEcomEvent.purchase("order-1", 1300, ORDER_LINES, 0, 0, {
      customer: { email: "a@b.co", phone: "9876543210" },
    });
    await waitFor(() => false);
    assert.equal(gtagCalls.some((call) => call[1] === "conversion"), false);
    assert.equal(gtagCalls.some((call) => call[0] === "set"), false);
    // GA4 still gets the e-commerce events with analytics consent
    const purchase = gtagCalls.find((call) => call[1] === "purchase");
    assert.equal(purchase[2].send_to, "G-STORE");
    assert.equal(purchase[2].transaction_id, "order-1");
  });

  it("sends no GA4 event without analytics, even when Google Ads loaded it", async () => {
    const modules = await loadModules();
    await startTags(modules, { analytics: false, marketing: true });
    const { gtagCalls } = recordTagCalls();
    modules.analytics.trackEcomEvent.beginCheckout(ORDER_LINES, 1300);
    assert.equal(gtagCalls.some((call) => call[1] === "begin_checkout"), false);
  });

  it("sets every ad type from the marketing choice and revokes the Pixel on withdrawal", async () => {
    const modules = await loadModules();
    await startTags(modules, { analytics: true, marketing: true });
    assert.ok(scripts.some((src) => src.includes("fbevents.js")));
    assert.ok(scripts.some((src) => src.includes("gtag/js?id=AW-111")));
    const consentMode = modules.consent.toGoogleConsent({ analytics: true, marketing: false });
    assert.deepEqual(consentMode, {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });

    const { gtagCalls, fbqCalls } = recordTagCalls();
    setConsent(modules.consent, true, false);
    modules.consent.applyConsent({ analytics: true, marketing: false }, CONFIG);
    assert.deepEqual(fbqCalls[0], ["consent", "revoke"]);
    const update = gtagCalls.find((call) => call[0] === "consent");
    assert.equal(update[2].ad_storage, "denied");

    // Nothing after the withdrawal
    modules.analytics.trackEcomEvent.addToCart(
      { _id: "p1", variants: [{ _id: "v1", price: 500 }] },
      { _id: "v1", price: 500 },
    );
    assert.equal(fbqCalls.some((call) => call[0] === "track"), false);
    assert.equal(gtagCalls.some((call) => call[1] === "conversion"), false);
  });
});

// ─── Events and purchase ids ──────────────────────────────────────────────

describe("PRD-034 events: variant ids, order id, enhanced conversions", () => {
  beforeEach(() => resetBrowser());

  it("sends ViewContent and AddToCart with variant ids, and the cart conversion", async () => {
    const modules = await loadModules();
    await startTags(modules, { analytics: true, marketing: true });
    const { gtagCalls, fbqCalls } = recordTagCalls();
    const product = { _id: "p1", name: "Dress", variants: [{ _id: "v1", price: 500 }] };
    modules.analytics.trackEcomEvent.viewItem(product, null);
    modules.analytics.trackEcomEvent.addToCart(product, { _id: "v1", price: 500 }, 2);

    const view = fbqCalls.find((call) => call[1] === "ViewContent");
    assert.deepEqual(view[2].content_ids, ["v1"]);
    assert.equal(view[2].content_type, "product");
    const add = fbqCalls.find((call) => call[1] === "AddToCart");
    assert.deepEqual(add[2].contents, [{ id: "v1", quantity: 2 }]);
    assert.equal(add[2].value, 1000);
    const conversion = gtagCalls.find((call) => call[1] === "conversion");
    assert.equal(conversion[2].send_to, "AW-111/cart");
  });

  it("skips the begin-checkout conversion when its label is unset", async () => {
    const modules = await loadModules();
    await startTags(modules, { analytics: true, marketing: true });
    const { gtagCalls, fbqCalls } = recordTagCalls();
    modules.analytics.trackEcomEvent.beginCheckout(ORDER_LINES, 1300);
    const initiate = fbqCalls.find((call) => call[1] === "InitiateCheckout");
    assert.deepEqual(initiate[2].content_ids, ["v1", "v2"]);
    assert.equal(initiate[2].num_items, 3);
    assert.equal(gtagCalls.some((call) => call[1] === "conversion"), false);
  });

  it("dedupes the purchase on the order id and hashes user_data before the conversion", async () => {
    const modules = await loadModules();
    await startTags(modules, { analytics: true, marketing: true });
    const { gtagCalls, fbqCalls } = recordTagCalls();
    modules.analytics.trackEcomEvent.purchase("order-9", 1300, ORDER_LINES, 50, 0, {
      currency: "INR",
      customer: { email: " Asha@Example.COM ", phone: "98765 43210", countryCode: "+91" },
    });
    await waitFor(() => gtagCalls.some((call) => call[1] === "conversion"));

    const purchase = fbqCalls.find((call) => call[1] === "Purchase");
    assert.deepEqual(purchase[3], { eventID: "order-9" });
    assert.deepEqual(purchase[2].content_ids, ["v1", "v2"]);
    assert.deepEqual(purchase[2].contents, [
      { id: "v1", quantity: 2 },
      { id: "v2", quantity: 1 },
    ]);
    assert.equal(purchase[2].value, 1300);

    const setIndex = gtagCalls.findIndex((call) => call[0] === "set");
    const conversionIndex = gtagCalls.findIndex((call) => call[1] === "conversion");
    assert.ok(setIndex !== -1 && setIndex < conversionIndex);
    assert.deepEqual(gtagCalls[setIndex], [
      "set",
      "user_data",
      {
        sha256_email_address: sha256("asha@example.com"),
        sha256_phone_number: sha256("+919876543210"),
      },
    ]);
    const serialized = JSON.stringify([gtagCalls, fbqCalls]);
    assert.equal(serialized.includes("asha@"), false, "no plain email in any tag");
    assert.equal(serialized.includes("9876543210\""), false, "no plain phone in any tag");
    assert.deepEqual(gtagCalls[conversionIndex][2], {
      send_to: "AW-111/buy",
      value: 1300,
      currency: "INR",
      transaction_id: "order-9",
    });
    const gaPurchase = gtagCalls.find((call) => call[1] === "purchase");
    assert.equal(gaPurchase[2].transaction_id, "order-9");
  });

  it("sets no user_data when the store hasn't turned enhanced conversions on", async () => {
    const modules = await loadModules();
    await startTags(modules, { analytics: false, marketing: true }, {
      ...CONFIG,
      googleAds: { ...CONFIG.googleAds, enhancedConversions: false },
    });
    const { gtagCalls } = recordTagCalls();
    modules.analytics.trackEcomEvent.purchase("order-2", 100, ORDER_LINES, 0, 0, {
      customer: { email: "a@b.co" },
    });
    await waitFor(() => gtagCalls.some((call) => call[1] === "conversion"));
    assert.equal(gtagCalls.some((call) => call[0] === "set"), false);
    assert.ok(gtagCalls.some((call) => call[1] === "conversion"));
  });
});

// ─── Hashing (FR-1.6) ─────────────────────────────────────────────────────

describe("PRD-034 hashing: email and E.164 phone", () => {
  it("normalises email and phone the way the backend does", async () => {
    const hash = await import("../src/utils/ads-hash.util.js");
    assert.equal(hash.normalizeEmail("  Asha@Example.COM "), "asha@example.com");
    assert.equal(hash.normalizeEmail("not-an-email"), "");
    assert.equal(hash.normalizePhoneE164("9876543210"), "+919876543210");
    assert.equal(hash.normalizePhoneE164("098765 43210"), "+919876543210");
    assert.equal(hash.normalizePhoneE164("919876543210"), "+919876543210");
    assert.equal(hash.normalizePhoneE164("+91 98765-43210"), "+919876543210");
    assert.equal(hash.normalizePhoneE164("0044 20 7946 0958"), "+442079460958");
    assert.equal(hash.normalizePhoneE164("2025550123", "+1"), "+12025550123");
    assert.equal(hash.normalizePhoneE164("123"), "");
    assert.equal(hash.normalizePhoneE164(""), "");
  });

  it("hashes SHA-256 hex and leaves out what can't be normalised", async () => {
    const hash = await import("../src/utils/ads-hash.util.js");
    assert.equal(await hash.sha256Hex("asha@example.com"), sha256("asha@example.com"));
    assert.deepEqual(await hash.buildEnhancedUserData({ email: "x", phone: "12" }), null);
    assert.deepEqual(await hash.buildEnhancedUserData({ phone: "9876543210" }), {
      sha256_phone_number: sha256("+919876543210"),
    });
  });
});

// ─── Click ids and checkout payload (FR-1.4) ──────────────────────────────

describe("PRD-034 click ids and the checkout payload", () => {
  const LANDING = "?gclid=G-123&fbclid=FB-456&ctwa_clid=WA-789&utm_source=meta";

  it("keeps click ids for the session but persists and sends them only with marketing", async () => {
    resetBrowser({ search: LANDING, cookie: "_fbp=fb.1.1700.42; _fbc=fb.1.1700.FB-456" });
    const { consent, clicks } = await loadModules();
    clicks.captureAdClickIds();
    assert.ok(sessionStorage.getItem("zc_ad_clicks").includes("G-123"));
    assert.equal(localStorage.getItem("zc_ad_clicks"), null);
    assert.equal(clicks.getAdAttribution(), null);
    assert.deepEqual(clicks.getCheckoutConsent(), { analytics: false, marketing: false });

    setConsent(consent, false, true);
    clicks.captureAdClickIds();
    assert.ok(localStorage.getItem("zc_ad_clicks").includes("G-123"));
    assert.deepEqual(clicks.getAdAttribution(), {
      gclid: "G-123",
      fbclid: "FB-456",
      ctwaClid: "WA-789",
      fbp: "fb.1.1700.42",
      fbc: "fb.1.1700.FB-456",
    });
  });

  it("restores persisted click ids in a later session until they expire", async () => {
    resetBrowser({ search: "?gbraid=GB-1" });
    const { consent, clicks } = await loadModules();
    setConsent(consent, false, true);
    const now = Date.UTC(2026, 10, 5);
    clicks.captureAdClickIds(now);
    sessionStorage.clear();
    window.location.search = "";
    assert.equal(clicks.getAdAttribution(now + 89 * 86400000).gbraid, "GB-1");
    assert.equal(clicks.getAdAttribution(now + 91 * 86400000), null);
    assert.equal(localStorage.getItem("zc_ad_clicks"), null);
  });

  it("drops the persisted copy when marketing is withdrawn", async () => {
    resetBrowser({ search: "?wbraid=WB-1" });
    const { consent, clicks } = await loadModules();
    setConsent(consent, true, true);
    clicks.captureAdClickIds();
    setConsent(consent, true, false);
    clicks.captureAdClickIds();
    assert.equal(localStorage.getItem("zc_ad_clicks"), null);
    assert.equal(clicks.getAdAttribution(), null);
  });

  it("builds attribution from both consents and always sends the consent", async () => {
    resetBrowser({ search: LANDING, cookie: "_ga=GA1.1.123.456" });
    const { consent, clicks } = await loadModules();
    const attribution = await import(
      `../src/utils/ga-attribution.util.js?case=${caseNumber}`
    );
    setConsent(consent, true, false);
    attribution.captureLandingAttribution();
    clicks.captureAdClickIds();
    const analyticsOnly = clicks.getCheckoutAttribution();
    assert.equal(analyticsOnly.utmSource, "meta");
    assert.equal(analyticsOnly.gaClientId, "123.456");
    assert.equal("gclid" in analyticsOnly, false);
    assert.deepEqual(clicks.getCheckoutConsent(), { analytics: true, marketing: false });

    setConsent(consent, true, true);
    const both = clicks.getCheckoutAttribution();
    assert.equal(both.gclid, "G-123");
    assert.equal(both.utmSource, "meta");
    assert.deepEqual(clicks.getCheckoutConsent(), { analytics: true, marketing: true });

    setConsent(consent, false, false);
    assert.equal(clicks.getCheckoutAttribution(), null);
  });

  it("clips values and strips control characters", async () => {
    resetBrowser({ search: `?gclid=${"a".repeat(300)}%0A` });
    const { clicks } = await loadModules();
    const parsed = clicks.parseAdClickIds(window.location.search);
    assert.equal(parsed.gclid.length, 200);
    assert.equal(/[\n\r]/.test(parsed.gclid), false);
  });
});

// ─── /checkout/start (FR-1.9) ─────────────────────────────────────────────

describe("PRD-034 /checkout/start parser", () => {
  const ID_A = "65a1b2c3d4e5f6a7b8c9d0e1";
  const ID_B = "65a1b2c3d4e5f6a7b8c9d0e2";

  it("parses lines, defaults qty to 1 and merges repeats", async () => {
    const { parseCheckoutStartProducts } = await import("../src/utils/checkout-start.util.js");
    assert.deepEqual(parseCheckoutStartProducts(`${ID_A}:2, ${ID_B},${ID_A}:1`), {
      lines: [
        { variantId: ID_A, qty: 3 },
        { variantId: ID_B, qty: 1 },
      ],
      error: null,
    });
    assert.deepEqual(parseCheckoutStartProducts([`${ID_B}:1`, "ignored"]).lines, [
      { variantId: ID_B, qty: 1 },
    ]);
  });

  it("refuses empty, bad ids, bad quantities and too many lines", async () => {
    const { CheckoutStartErrorEnum: E, parseCheckoutStartProducts: parse, getCheckoutStartMessage } =
      await import("../src/utils/checkout-start.util.js");
    assert.equal(parse(undefined).error, E.EMPTY);
    assert.equal(parse(" , ").error, E.EMPTY);
    assert.equal(parse("not-an-id:1").error, E.INVALID_ID);
    assert.equal(parse(`${ID_A}:1:2`).error, E.INVALID_ID);
    assert.equal(parse(`${ID_A}:0`).error, E.INVALID_QUANTITY);
    assert.equal(parse(`${ID_A}:11`).error, E.INVALID_QUANTITY);
    assert.equal(parse(`${ID_A}:1.5`).error, E.INVALID_QUANTITY);
    assert.equal(parse(`${ID_A}:6,${ID_A}:5`).error, E.INVALID_QUANTITY);
    const many = Array.from({ length: 21 }, (_, index) =>
      `${ID_A.slice(0, 22)}${String(index).padStart(2, "0")}:1`,
    ).join(",");
    assert.equal(parse(many).error, E.TOO_MANY_LINES);
    assert.match(getCheckoutStartMessage("nope"), /couldn't add/);
  });
});
