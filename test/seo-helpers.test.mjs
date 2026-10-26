/**
 * SEO helpers (PRD-014 FR-2.8, UX-33)
 *
 * Product JSON-LD offers (availability only from the PRD-020 signal) and the
 * sitemap XML (escaped, invalid dates dropped).
 *
 * Keep in sync with the other storefront's `test/seo-helpers.test.mjs`.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { toProductOffers } = await import("@/utils/product-offers.util");
const { buildSitemapXml, toLastModified } = await import(
  "@/utils/sitemap.util"
);

// ─── Offers ───────────────────────────────────────────────────────────────

describe("toProductOffers", () => {
  const url = "https://shop.example/product/a";

  it("returns one Offer for a single price, without availability", () => {
    const offers = toProductOffers([{ price: 1200, status: "PUBLISHED" }], url);
    assert.equal(offers["@type"], "Offer");
    assert.equal(offers.price, 1200);
    assert.equal(offers.priceCurrency, "INR");
    assert.equal("availability" in offers, false);
  });

  it("returns an AggregateOffer for a price range, skipping archived", () => {
    const offers = toProductOffers(
      [
        { price: 900 },
        { price: 1500 },
        { price: 100, status: "ARCHIVED" },
        { price: 0 },
        { price: null },
      ],
      url,
    );
    assert.equal(offers["@type"], "AggregateOffer");
    assert.equal(offers.lowPrice, 900);
    assert.equal(offers.highPrice, 1500);
    assert.equal(offers.offerCount, 2);
  });

  it("returns undefined when no variant has a price", () => {
    assert.equal(toProductOffers([], url), undefined);
    assert.equal(toProductOffers(undefined, url), undefined);
  });
});

// ─── Sitemap ──────────────────────────────────────────────────────────────

describe("buildSitemapXml", () => {
  it("escapes values and omits an invalid lastmod", () => {
    const xml = buildSitemapXml([
      { loc: "https://shop.example/product/a&b<c>" },
      { loc: "https://shop.example/", lastmod: toLastModified("nope") },
      {
        loc: "https://shop.example/x",
        lastmod: toLastModified("2026-10-01T00:00:00.000Z"),
      },
    ]);
    assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    assert.match(xml, /a&amp;b&lt;c&gt;/);
    assert.equal(xml.match(/<lastmod>/g).length, 1);
    assert.match(xml, /<lastmod>2026-10-01T00:00:00\.000Z<\/lastmod>/);
  });
});
