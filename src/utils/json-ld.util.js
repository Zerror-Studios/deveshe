/**
 * JSON-LD serialiser (PRD-002 SF-10): the kit's `serializeJsonLd` (kit
 * PRD-002 FR-4.1), which escapes `<`, `>`, `&` and the line separators so
 * no string in the data can close the script tag.
 *
 * Keep in sync with `storefronts/rare-element/src/utils/json-ld.js`.
 */

export { serializeJsonLd as toJsonLd } from "@zcom/storefront-kit/core";
