/**
 * Search term rules (PRD-014 FR-2.8), shared by the `/search` loader and
 * its view: at least 2 and at most 100 characters, first value only.
 */

export const SEARCH_TERM_MIN_LENGTH = 2;
export const SEARCH_TERM_MAX_LENGTH = 100;

export const toSearchTerm = (value) =>
  String(Array.isArray(value) ? value[0] : value || "")
    .trim()
    .slice(0, SEARCH_TERM_MAX_LENGTH);
