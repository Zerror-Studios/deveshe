/**
 * Catalog listing query values (PRD-014 FR-0.8, UX-01)
 *
 * Pure helpers behind `lib/catalog-listing.server.js`: every listing
 * (`/`, `/products`, `/category/[slug]`, `/search`) asks for PUBLISHED
 * products only, and filters by category only when the page names one
 * (resolved from its slug). No hard-coded category id, so the catalog stays
 * reachable after the PRD-003 migration changes the ids.
 */

import { ProductStatus } from "@/utils/Constant";
import { toSortQueryValue } from "@/utils/listing-sort.util";

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Published products only; the server enforces PUBLISHED as well. */
export const toListingFilters = (filters = {}) => ({
  ...filters,
  status: ProductStatus.PUBLISHED,
});

/**
 * `getClientSideProducts` variables for one page, in the listing's `sort`
 * (W2-STORE; the default NEWEST is not sent).
 */
export const toProductPageVariables = ({
  filters = {},
  limit,
  offset = 0,
  sort,
} = {}) => {
  const sortValue = toSortQueryValue(sort);
  return {
    offset,
    limit,
    filters: toListingFilters(filters),
    ...(sortValue ? { sort: sortValue } : {}),
  };
};
