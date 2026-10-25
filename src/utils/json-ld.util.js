/**
 * JSON-LD serialisation for `<script type="application/ld+json">`
 * (PRD-002 SF-10): escapes characters that could close the script tag or
 * break the HTML parser when a value comes from CMS data.
 *
 * Keep in sync with `storefronts/rare-element/src/utils/json-ld.js` and
 * `zcom-backend/packages/core/src/utils/sanitize-html.ts` (PRD-002
 * RMAINT-7).
 */

// ─── Constants ────────────────────────────────────────────────────────────

const UNSAFE_CHARS = /[<>&\u2028\u2029]/g;

const ESCAPES = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

// ─── API ──────────────────────────────────────────────────────────────────

/** `JSON.stringify` that is safe inside an inline script element. */
export const toJsonLd = (data) =>
  JSON.stringify(data).replace(UNSAFE_CHARS, (char) => ESCAPES[char]);
