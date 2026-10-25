/**
 * Catalog listing query (PRD-014 UX-01 regression, K-01)
 *
 * Wave 0 removed the hard-coded category id that capped the catalog at one
 * category: every listing asks for PUBLISHED products, filters by category
 * only when a page names one, and pages with the same filters and sort.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const { toListingFilters, toProductPageVariables } = await import(
  "@/utils/catalog-listing.util"
);

// ─── Constants ────────────────────────────────────────────────────────────

const SRC = fileURLToPath(new URL("../src", import.meta.url));
// The legacy showcase category (`pages/index.jsx` before Wave 0).
const LEGACY_CATEGORY_ID = "6898b3cdddf0354e025da816";
const OBJECT_ID_LITERAL = /["'][0-9a-f]{24}["']/;

// ─── Helpers ──────────────────────────────────────────────────────────────

const sourceFiles = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(jsx?|mjs)$/.test(entry.name) ? [full] : [];
  });

// ─── Tests ────────────────────────────────────────────────────────────────

describe("catalog listing query", () => {
  it("asks every published product with no category filter by default", () => {
    const variables = toProductPageVariables({ limit: 12 });
    assert.deepEqual(variables, {
      offset: 0,
      limit: 12,
      filters: { status: "PUBLISHED" },
    });
    assert.equal("categoryIds" in variables.filters, false);
  });

  it("filters by category only with the id a page resolved from its slug", () => {
    const filters = toListingFilters({ categoryIds: ["cat-from-slug"] });
    assert.deepEqual(
      toProductPageVariables({ filters, limit: 12, offset: 24 }),
      {
        offset: 24,
        limit: 12,
        filters: { categoryIds: ["cat-from-slug"], status: "PUBLISHED" },
      },
    );
  });

  it("always forces PUBLISHED and keeps the sort on later pages", () => {
    const variables = toProductPageVariables({
      filters: { search: "dress", status: "DRAFT" },
      limit: 12,
      offset: 12,
      sort: "PRICE_ASC",
    });
    assert.equal(variables.filters.status, "PUBLISHED");
    assert.equal(variables.filters.search, "dress");
    assert.equal(variables.sort, "PRICE_ASC");
    assert.equal(
      "sort" in toProductPageVariables({ limit: 12, sort: "NEWEST" }),
      false,
    );
  });

  it("has no hard-coded category or other ObjectId in the source", () => {
    const offenders = sourceFiles(SRC).filter((file) => {
      const text = fs.readFileSync(file, "utf8");
      return text.includes(LEGACY_CATEGORY_ID) || OBJECT_ID_LITERAL.test(text);
    });
    assert.deepEqual(
      offenders.map((file) => path.relative(SRC, file)),
      [],
    );
  });
});
