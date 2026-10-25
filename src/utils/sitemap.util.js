/**
 * sitemap.xml rendering (PRD-014 FR-2.8, UX-33)
 *
 * Turns `{ loc, lastmod? }` entries into a sitemaps.org `urlset`. Every
 * value is XML-escaped (slugs come from the catalog), and an invalid date
 * leaves `lastmod` out.
 */

// ─── Constants ────────────────────────────────────────────────────────────

const XML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

// ─── Helpers ──────────────────────────────────────────────────────────────

export const escapeXml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => XML_ESCAPES[char]);

/** ISO date for `<lastmod>`, or null for a missing or invalid value. */
export const toLastModified = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
};

const toUrlEntry = ({ loc, lastmod }) =>
  `  <url><loc>${escapeXml(loc)}</loc>${
    lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : ""
  }</url>`;

export const buildSitemapXml = (entries = []) =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(toUrlEntry),
    "</urlset>",
  ].join("\n");
