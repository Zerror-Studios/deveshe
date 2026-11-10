/**
 * Listing sort (PRD-014 Wave 2, W2-STORE): the kit's helpers for the
 * backend's `ClientProductSort` (kit PRD-002 FR-4.1): the `?sort=` value,
 * NEWEST by default and never in the URL; an unknown value reads as
 * NEWEST.
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
