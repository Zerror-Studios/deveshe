/**
 * Listing sort (PRD-014 Wave 2, W2-STORE): the kit's helpers for the
 * `?sort=` value (kit PRD-002 FR-4.1). The default (FEATURED from kit 1.4,
 * the collection's own order, backend PRD-045; NEWEST on kit 1.3) is never
 * in the URL or sent to the API; an unknown value reads as the default.
 *
 * Keep in sync with `storefronts/rare-element/src/utils/listing-sort.js`.
 */

export {
  DEFAULT_LISTING_SORT,
  LISTING_SORT_OPTIONS,
  ListingSortEnum,
  parseListingSort,
  toSortQueryValue,
} from "@zcom/storefront-kit/core";
